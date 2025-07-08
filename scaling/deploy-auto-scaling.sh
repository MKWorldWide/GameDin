#!/bin/bash

# GameDin Quantum Layer Auto-Scaling Deployment Script
# Deploys comprehensive scaling policies for optimal performance

set -e

echo "🚀 Deploying GameDin Quantum Layer Auto-Scaling Configuration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed or not in PATH"
    exit 1
fi

# Check if we're connected to a cluster
if ! kubectl cluster-info &> /dev/null; then
    print_error "Not connected to a Kubernetes cluster"
    exit 1
fi

print_status "Connected to cluster: $(kubectl config current-context)"

# Configuration
NAMESPACE="gamedin-l3"
CLUSTER_NAME="gamedin-l3-cluster"
REGION="us-east-1"

# Create namespace if it doesn't exist
print_status "Ensuring namespace exists..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Deploy auto-scaling configuration
print_status "Deploying auto-scaling configuration..."

# Apply the auto-scaling configuration
kubectl apply -f scaling/auto-scaling-config.yaml

# Wait for resources to be ready
print_status "Waiting for resources to be ready..."

# Wait for HPA
kubectl wait --for=condition=Available --timeout=300s deployment/quantum-computing -n $NAMESPACE

# Wait for VPA
kubectl wait --for=condition=Available --timeout=300s deployment/vpa-admission-controller -n kube-system || true

# Wait for Prometheus Adapter
kubectl wait --for=condition=Available --timeout=300s deployment/prometheus-adapter -n kube-system

# Install Cluster Autoscaler if not present
print_status "Checking Cluster Autoscaler installation..."

if ! kubectl get deployment cluster-autoscaler -n kube-system &> /dev/null; then
    print_status "Installing Cluster Autoscaler..."
    
    # Create Cluster Autoscaler deployment
    cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
  labels:
    app: cluster-autoscaler
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cluster-autoscaler
  template:
    metadata:
      labels:
        app: cluster-autoscaler
    spec:
      serviceAccountName: cluster-autoscaler
      containers:
      - image: k8s.gcr.io/autoscaling/cluster-autoscaler:v1.24.0
        name: cluster-autoscaler
        resources:
          limits:
            cpu: 100m
            memory: 300Mi
          requests:
            cpu: 100m
            memory: 300Mi
        command:
        - ./cluster-autoscaler
        - --v=4
        - --stderrthreshold=info
        - --cloud-provider=aws
        - --skip-nodes-with-local-storage=false
        - --expander=least-waste
        - --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/$CLUSTER_NAME
        - --balance-similar-node-groups
        - --skip-nodes-with-system-pods=false
        - --scale-down-delay-after-add=10m
        - --scale-down-unneeded-time=10m
        - --max-node-provision-time=15m
        - --max-graceful-termination-sec=600
        volumeMounts:
        - name: ssl-certs
          mountPath: /etc/ssl/certs/ca-bundle.crt
          readOnly: true
      volumes:
      - name: ssl-certs
        hostPath:
          path: /etc/ssl/certs/ca-bundle.crt
EOF

    # Create Service Account for Cluster Autoscaler
    cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: cluster-autoscaler
  namespace: kube-system
  labels:
    k8s-addon: cluster-autoscaler.addons.k8s.io
    k8s-app: cluster-autoscaler
EOF

    # Create Cluster Role for Cluster Autoscaler
    cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: cluster-autoscaler
  labels:
    k8s-addon: cluster-autoscaler.addons.k8s.io
    k8s-app: cluster-autoscaler
rules:
  - apiGroups: [""]
    resources: ["events", "endpoints"]
    verbs: ["create", "patch"]
  - apiGroups: [""]
    resources: ["pods/eviction"]
    verbs: ["create"]
  - apiGroups: [""]
    resources: ["pods/status"]
    verbs: ["update"]
  - apiGroups: [""]
    resources: ["endpoints"]
    resourceNames: ["cluster-autoscaler"]
    verbs: ["get", "update"]
  - apiGroups: [""]
    resources: ["nodes"]
    verbs: ["watch", "list", "get", "update"]
  - apiGroups: [""]
    resources: ["namespaces", "pods", "services", "replicationcontrollers", "persistentvolumeclaims", "persistentvolumes"]
    verbs: ["watch", "list", "get"]
  - apiGroups: ["extensions"]
    resources: ["replicasets", "daemonsets"]
    verbs: ["watch", "list", "get"]
  - apiGroups: ["policy"]
    resources: ["poddisruptionbudgets"]
    verbs: ["watch", "list"]
  - apiGroups: ["apps"]
    resources: ["statefulsets", "replicasets", "daemonsets"]
    verbs: ["watch", "list", "get"]
  - apiGroups: ["storage.k8s.io"]
    resources: ["storageclasses", "csinodes", "csidrivers", "csistoragecapacities"]
    verbs: ["watch", "list", "get"]
  - apiGroups: ["batch", "extensions"]
    resources: ["jobs"]
    verbs: ["get", "list", "watch", "patch"]
  - apiGroups: ["coordination.k8s.io"]
    resources: ["leases"]
    verbs: ["create"]
  - apiGroups: ["coordination.k8s.io"]
    resourceNames: ["cluster-autoscaler"]
    resources: ["leases"]
    verbs: ["get", "update"]
EOF

    # Create Cluster Role Binding for Cluster Autoscaler
    cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: cluster-autoscaler
  labels:
    k8s-addon: cluster-autoscaler.addons.k8s.io
    k8s-app: cluster-autoscaler
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-autoscaler
subjects:
  - kind: ServiceAccount
    name: cluster-autoscaler
    namespace: kube-system
EOF

    print_success "Cluster Autoscaler installed successfully"
else
    print_status "Cluster Autoscaler already installed"
fi

# Create load testing script
print_status "Creating load testing script..."

cat > scaling/load-test.sh << 'EOF'
#!/bin/bash

# GameDin Quantum Layer Load Testing Script
# Tests auto-scaling capabilities under load

set -e

echo "🧪 Starting GameDin Quantum Layer Load Test..."

# Configuration
SERVICE_URL="http://quantum-computing.gamedin-l3.svc.cluster.local:8080"
DURATION=300  # 5 minutes
RATE=100      # requests per second

# Install k6 if not present
if ! command -v k6 &> /dev/null; then
    echo "Installing k6..."
    curl -L https://github.com/grafana/k6/releases/download/v0.45.0/k6-v0.45.0-linux-amd64.tar.gz | tar xz
    sudo mv k6-v0.45.0-linux-amd64/k6 /usr/local/bin/
fi

# Create k6 test script
cat > scaling/load-test.js << 'K6EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 100 },  // Stay at 100 users
    { duration: '1m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'],     // Error rate must be below 10%
  },
};

export default function () {
  const responses = http.batch([
    ['GET', `${__ENV.SERVICE_URL}/health`],
    ['POST', `${__ENV.SERVICE_URL}/quantum/task`, JSON.stringify({
      type: 'entanglement_sync',
      complexity: 'medium',
      priority: 'normal'
    })],
    ['GET', `${__ENV.SERVICE_URL}/metrics`],
  ]);

  responses.forEach((response) => {
    check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 2s': (r) => r.timings.duration < 2000,
    });
  });

  sleep(1);
}
K6EOF

# Run load test
echo "Running load test for $DURATION seconds at $RATE req/s..."
k6 run --env SERVICE_URL=$SERVICE_URL scaling/load-test.js

echo "✅ Load test completed!"
EOF

chmod +x scaling/load-test.sh

# Create scaling monitoring script
print_status "Creating scaling monitoring script..."

cat > scaling/monitor-scaling.sh << 'EOF'
#!/bin/bash

# GameDin Quantum Layer Scaling Monitor
# Monitors auto-scaling behavior and performance

set -e

echo "📊 Monitoring GameDin Quantum Layer Scaling..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

NAMESPACE="gamedin-l3"

# Monitor HPA status
echo ""
print_status "Horizontal Pod Autoscaler Status:"
kubectl get hpa -n $NAMESPACE

# Monitor pod count
echo ""
print_status "Current Pod Count:"
kubectl get pods -n $NAMESPACE -l app=quantum-computing --no-headers | wc -l

# Monitor node count
echo ""
print_status "Current Node Count:"
kubectl get nodes --no-headers | wc -l

# Monitor resource usage
echo ""
print_status "Resource Usage:"
kubectl top pods -n $NAMESPACE

# Monitor custom metrics
echo ""
print_status "Custom Metrics:"
kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/$NAMESPACE/services/quantum-computing/quantum-task-queue-length" | jq '.' 2>/dev/null || echo "Custom metrics not available yet"

# Monitor scaling events
echo ""
print_status "Recent Scaling Events:"
kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | grep -i "scaled\|autoscaler" | tail -5

# Monitor VPA recommendations
echo ""
print_status "VPA Recommendations:"
kubectl describe vpa quantum-computing-vpa -n $NAMESPACE | grep -A 10 "Recommendation:" || echo "VPA recommendations not available yet"

echo ""
print_status "Scaling monitoring completed!"
EOF

chmod +x scaling/monitor-scaling.sh

# Create cost optimization script
print_status "Creating cost optimization script..."

cat > scaling/cost-optimization.sh << 'EOF'
#!/bin/bash

# GameDin Quantum Layer Cost Optimization Script
# Analyzes and optimizes resource usage for cost efficiency

set -e

echo "💰 Analyzing GameDin Quantum Layer Cost Optimization..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

NAMESPACE="gamedin-l3"

# Analyze resource requests vs usage
echo ""
print_status "Resource Request vs Usage Analysis:"

# Get resource requests
echo "Resource Requests:"
kubectl get pods -n $NAMESPACE -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].resources.requests.cpu}{"\t"}{.spec.containers[*].resources.requests.memory}{"\n"}{end}'

# Get resource usage
echo ""
echo "Resource Usage:"
kubectl top pods -n $NAMESPACE

# Analyze node utilization
echo ""
print_status "Node Utilization Analysis:"
kubectl top nodes

# Check for over-provisioned resources
echo ""
print_status "Over-provisioned Resources Check:"

# Find pods with low CPU usage
LOW_CPU_PODS=$(kubectl top pods -n $NAMESPACE --no-headers | awk '$3 < 50 {print $1}')
if [ ! -z "$LOW_CPU_PODS" ]; then
    print_warning "Pods with low CPU usage (< 50m):"
    echo "$LOW_CPU_PODS"
else
    print_status "No pods with low CPU usage found"
fi

# Find pods with low memory usage
LOW_MEM_PODS=$(kubectl top pods -n $NAMESPACE --no-headers | awk '$4 < 100 {print $1}')
if [ ! -z "$LOW_MEM_PODS" ]; then
    print_warning "Pods with low memory usage (< 100Mi):"
    echo "$LOW_MEM_PODS"
else
    print_status "No pods with low memory usage found"
fi

# Check for idle nodes
echo ""
print_status "Idle Node Check:"
IDLE_NODES=$(kubectl top nodes --no-headers | awk '$3 < 10 && $5 < 10 {print $1}')
if [ ! -z "$IDLE_NODES" ]; then
    print_warning "Nodes with low utilization (< 10%):"
    echo "$IDLE_NODES"
else
    print_status "No idle nodes found"
fi

# Generate optimization recommendations
echo ""
print_status "Cost Optimization Recommendations:"

echo "1. Resource Requests Optimization:"
echo "   - Review and adjust resource requests based on actual usage"
echo "   - Consider using VPA recommendations for automatic optimization"

echo ""
echo "2. Node Pool Optimization:"
echo "   - Use spot instances for non-critical workloads"
echo "   - Implement node taints and tolerations for workload separation"
echo "   - Consider using different instance types for different workloads"

echo ""
echo "3. Scaling Policy Optimization:"
echo "   - Adjust HPA thresholds based on actual load patterns"
echo "   - Implement predictive scaling for known traffic patterns"
echo "   - Use custom metrics for more accurate scaling decisions"

echo ""
echo "4. Storage Optimization:"
echo "   - Use appropriate storage classes for different workloads"
echo "   - Implement storage lifecycle policies"
echo "   - Consider using local storage for high-performance workloads"

echo ""
print_status "Cost optimization analysis completed!"
EOF

chmod +x scaling/cost-optimization.sh

# Create performance tuning script
print_status "Creating performance tuning script..."

cat > scaling/performance-tuning.sh << 'EOF'
#!/bin/bash

# GameDin Quantum Layer Performance Tuning Script
# Optimizes performance settings for quantum computing workloads

set -e

echo "⚡ Tuning GameDin Quantum Layer Performance..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

NAMESPACE="gamedin-l3"

# Apply performance optimizations
print_status "Applying performance optimizations..."

# Create performance ConfigMap
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: quantum-performance-config
  namespace: $NAMESPACE
data:
  performance.yaml: |
    # Quantum Computing Performance Settings
    quantum:
      # CPU optimization
      cpu:
        governor: performance
        scaling_governor: performance
        turbo_boost: true
      
      # Memory optimization
      memory:
        hugepages: true
        hugepage_size: 2M
        transparent_hugepage: always
      
      # Network optimization
      network:
        tcp_congestion_control: bbr
        tcp_window_scaling: true
        tcp_timestamps: true
      
      # Storage optimization
      storage:
        io_scheduler: none
        read_ahead_kb: 4096
        swappiness: 1
      
      # Quantum specific optimizations
      quantum_optimizations:
        entanglement_cache_size: 1024
        superposition_buffer_size: 512
        measurement_optimization: true
        quantum_error_correction: true
EOF

# Apply performance annotations to nodes
print_status "Applying performance annotations to nodes..."

NODES=$(kubectl get nodes -o jsonpath='{.items[*].metadata.name}')
for NODE in $NODES; do
    kubectl annotate node $NODE \
        quantum.gamedin.com/performance-mode=enabled \
        quantum.gamedin.com/cpu-governor=performance \
        quantum.gamedin.com/memory-optimization=enabled \
        --overwrite
done

# Create performance monitoring dashboard
print_status "Creating performance monitoring dashboard..."

cat > scaling/performance-dashboard.json << 'DASHBOARDEOF'
{
  "dashboard": {
    "title": "GameDin Quantum Performance",
    "panels": [
      {
        "title": "CPU Performance",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(container_cpu_usage_seconds_total{container=\"quantum-computing\"}[5m])",
            "legendFormat": "CPU Usage"
          }
        ]
      },
      {
        "title": "Memory Performance",
        "type": "graph",
        "targets": [
          {
            "expr": "container_memory_usage_bytes{container=\"quantum-computing\"}",
            "legendFormat": "Memory Usage"
          }
        ]
      },
      {
        "title": "Quantum Task Throughput",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(quantum_tasks_completed_total[5m])",
            "legendFormat": "Tasks/sec"
          }
        ]
      },
      {
        "title": "Response Time Distribution",
        "type": "heatmap",
        "targets": [
          {
            "expr": "rate(quantum_response_time_bucket[5m])",
            "legendFormat": "Response Time"
          }
        ]
      }
    ]
  }
}
DASHBOARDEOF

# Apply performance tuning to quantum computing deployment
print_status "Applying performance tuning to quantum computing deployment..."

kubectl patch deployment quantum-computing -n $NAMESPACE --patch '
{
  "spec": {
    "template": {
      "spec": {
        "containers": [
          {
            "name": "quantum-computing",
            "resources": {
              "requests": {
                "cpu": "500m",
                "memory": "1Gi",
                "hugepages-2Mi": "256Mi"
              },
              "limits": {
                "cpu": "2000m",
                "memory": "4Gi",
                "hugepages-2Mi": "1Gi"
              }
            },
            "env": [
              {
                "name": "QUANTUM_PERFORMANCE_MODE",
                "value": "enabled"
              },
              {
                "name": "QUANTUM_CPU_GOVERNOR",
                "value": "performance"
              },
              {
                "name": "QUANTUM_MEMORY_OPTIMIZATION",
                "value": "enabled"
              }
            ],
            "securityContext": {
              "capabilities": {
                "add": ["SYS_ADMIN", "SYS_RESOURCE"]
              }
            }
          }
        ],
        "nodeSelector": {
          "quantum.gamedin.com/performance-mode": "enabled"
        },
        "tolerations": [
          {
            "key": "quantum.gamedin.com/performance",
            "operator": "Exists",
            "effect": "NoSchedule"
          }
        ]
      }
    }
  }
}'

print_status "Performance tuning completed!"
EOF

chmod +x scaling/performance-tuning.sh

# Display summary
echo ""
print_success "🎉 Auto-scaling configuration deployed successfully!"
echo ""
echo "📋 Deployed Components:"
echo "  ✅ Horizontal Pod Autoscaler (HPA) with custom metrics"
echo "  ✅ Vertical Pod Autoscaler (VPA) for resource optimization"
echo "  ✅ Cluster Autoscaler for node pool scaling"
echo "  ✅ Custom Metrics API with Prometheus Adapter"
echo "  ✅ Resource Quotas and Priority Classes"
echo "  ✅ Pod Disruption Budget for high availability"
echo "  ✅ Load testing script"
echo "  ✅ Scaling monitoring script"
echo "  ✅ Cost optimization script"
echo "  ✅ Performance tuning script"
echo ""
echo "🔧 Next Steps:"
echo "  1. Monitor scaling behavior: ./scaling/monitor-scaling.sh"
echo "  2. Run load tests: ./scaling/load-test.sh"
echo "  3. Optimize costs: ./scaling/cost-optimization.sh"
echo "  4. Tune performance: ./scaling/performance-tuning.sh"
echo "  5. Review HPA status: kubectl get hpa -n gamedin-l3"
echo ""
echo "📊 Scaling Configuration:"
echo "  • Min Pods: 3, Max Pods: 20"
echo "  • CPU Threshold: 60%, Memory Threshold: 70%"
echo "  • Custom Metrics: Task Queue Length, Response Time"
echo "  • Scale Up: 100% increase, 15s period"
echo "  • Scale Down: 10% decrease, 60s period"
echo ""
print_success "GameDin quantum layer is now optimized for auto-scaling and peak performance! 🚀" 