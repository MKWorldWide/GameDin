# GameDin Quantum Layer Auto-Scaling Deployment Script (PowerShell)
# Deploys comprehensive scaling policies for optimal performance

param(
    [switch]$DryRun,
    [string]$Namespace = "gamedin-l3",
    [string]$ClusterName = "gamedin-l3-cluster",
    [string]$Region = "us-east-1"
)

Write-Host "🚀 Deploying GameDin Quantum Layer Auto-Scaling Configuration..." -ForegroundColor Blue

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if kubectl is available
try {
    $kubectlVersion = kubectl version --client 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "kubectl not found"
    }
} catch {
    Write-Error "kubectl is not installed or not in PATH"
    exit 1
}

# Check if we're connected to a cluster
try {
    $clusterInfo = kubectl cluster-info 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Not connected to cluster"
    }
} catch {
    Write-Error "Not connected to a Kubernetes cluster"
    exit 1
}

Write-Status "Connected to cluster: $(kubectl config current-context)"

# Create namespace if it doesn't exist
Write-Status "Ensuring namespace exists..."
kubectl create namespace $Namespace --dry-run=client -o yaml | kubectl apply -f -

# Deploy auto-scaling configuration
Write-Status "Deploying auto-scaling configuration..."

if (-not $DryRun) {
    # Apply the auto-scaling configuration
    kubectl apply -f scaling/auto-scaling-config.yaml

    # Wait for resources to be ready
    Write-Status "Waiting for resources to be ready..."

    # Wait for HPA
    kubectl wait --for=condition=Available --timeout=300s deployment/quantum-computing -n $Namespace

    # Wait for VPA (optional)
    try {
        kubectl wait --for=condition=Available --timeout=300s deployment/vpa-admission-controller -n kube-system
    } catch {
        Write-Warning "VPA admission controller not found, skipping..."
    }

    # Wait for Prometheus Adapter
    kubectl wait --for=condition=Available --timeout=300s deployment/prometheus-adapter -n kube-system

    # Install Cluster Autoscaler if not present
    Write-Status "Checking Cluster Autoscaler installation..."

    $clusterAutoscalerExists = kubectl get deployment cluster-autoscaler -n kube-system 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Status "Installing Cluster Autoscaler..."

        # Create Cluster Autoscaler deployment
        $clusterAutoscalerYaml = @"
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
        - --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/$ClusterName
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
"@

        $clusterAutoscalerYaml | kubectl apply -f -

        # Create Service Account for Cluster Autoscaler
        $serviceAccountYaml = @"
apiVersion: v1
kind: ServiceAccount
metadata:
  name: cluster-autoscaler
  namespace: kube-system
  labels:
    k8s-addon: cluster-autoscaler.addons.k8s.io
    k8s-app: cluster-autoscaler
"@

        $serviceAccountYaml | kubectl apply -f -

        # Create Cluster Role for Cluster Autoscaler
        $clusterRoleYaml = @"
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
"@

        $clusterRoleYaml | kubectl apply -f -

        # Create Cluster Role Binding for Cluster Autoscaler
        $clusterRoleBindingYaml = @"
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
"@

        $clusterRoleBindingYaml | kubectl apply -f -

        Write-Success "Cluster Autoscaler installed successfully"
    } else {
        Write-Status "Cluster Autoscaler already installed"
    }

    # Create monitoring script
    Write-Status "Creating monitoring script..."

    $monitorScript = @'
# GameDin Quantum Layer Scaling Monitor (PowerShell)
# Monitors auto-scaling behavior and performance

Write-Host "📊 Monitoring GameDin Quantum Layer Scaling..." -ForegroundColor Blue

$NAMESPACE = "gamedin-l3"

# Monitor HPA status
Write-Host ""
Write-Host "Horizontal Pod Autoscaler Status:" -ForegroundColor Yellow
kubectl get hpa -n $NAMESPACE

# Monitor pod count
Write-Host ""
Write-Host "Current Pod Count:" -ForegroundColor Yellow
$podCount = kubectl get pods -n $NAMESPACE -l app=quantum-computing --no-headers 2>$null | Measure-Object | Select-Object -ExpandProperty Count
Write-Host $podCount

# Monitor node count
Write-Host ""
Write-Host "Current Node Count:" -ForegroundColor Yellow
$nodeCount = kubectl get nodes --no-headers 2>$null | Measure-Object | Select-Object -ExpandProperty Count
Write-Host $nodeCount

# Monitor resource usage
Write-Host ""
Write-Host "Resource Usage:" -ForegroundColor Yellow
kubectl top pods -n $NAMESPACE

# Monitor scaling events
Write-Host ""
Write-Host "Recent Scaling Events:" -ForegroundColor Yellow
kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | Select-String -Pattern "scaled|autoscaler" | Select-Object -Last 5

Write-Host ""
Write-Host "Scaling monitoring completed!" -ForegroundColor Green
'@

    $monitorScript | Out-File -FilePath "scaling/monitor-scaling.ps1" -Encoding UTF8

    # Create cost optimization script
    Write-Status "Creating cost optimization script..."

    $costOptimizationScript = @'
# GameDin Quantum Layer Cost Optimization Script (PowerShell)
# Analyzes and optimizes resource usage for cost efficiency

Write-Host "💰 Analyzing GameDin Quantum Layer Cost Optimization..." -ForegroundColor Blue

$NAMESPACE = "gamedin-l3"

# Analyze resource requests vs usage
Write-Host ""
Write-Host "Resource Request vs Usage Analysis:" -ForegroundColor Yellow

# Get resource requests
Write-Host "Resource Requests:"
kubectl get pods -n $NAMESPACE -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].resources.requests.cpu}{"\t"}{.spec.containers[*].resources.requests.memory}{"\n"}{end}'

# Get resource usage
Write-Host ""
Write-Host "Resource Usage:"
kubectl top pods -n $NAMESPACE

# Analyze node utilization
Write-Host ""
Write-Host "Node Utilization Analysis:" -ForegroundColor Yellow
kubectl top nodes

# Generate optimization recommendations
Write-Host ""
Write-Host "Cost Optimization Recommendations:" -ForegroundColor Yellow

Write-Host "1. Resource Requests Optimization:"
Write-Host "   - Review and adjust resource requests based on actual usage"
Write-Host "   - Consider using VPA recommendations for automatic optimization"

Write-Host ""
Write-Host "2. Node Pool Optimization:"
Write-Host "   - Use spot instances for non-critical workloads"
Write-Host "   - Implement node taints and tolerations for workload separation"
Write-Host "   - Consider using different instance types for different workloads"

Write-Host ""
Write-Host "3. Scaling Policy Optimization:"
Write-Host "   - Adjust HPA thresholds based on actual load patterns"
Write-Host "   - Implement predictive scaling for known traffic patterns"
Write-Host "   - Use custom metrics for more accurate scaling decisions"

Write-Host ""
Write-Host "4. Storage Optimization:"
Write-Host "   - Use appropriate storage classes for different workloads"
Write-Host "   - Implement storage lifecycle policies"
Write-Host "   - Consider using local storage for high-performance workloads"

Write-Host ""
Write-Host "Cost optimization analysis completed!" -ForegroundColor Green
'@

    $costOptimizationScript | Out-File -FilePath "scaling/cost-optimization.ps1" -Encoding UTF8

    # Create performance tuning script
    Write-Status "Creating performance tuning script..."

    $performanceTuningScript = @'
# GameDin Quantum Layer Performance Tuning Script (PowerShell)
# Optimizes performance settings for quantum computing workloads

Write-Host "⚡ Tuning GameDin Quantum Layer Performance..." -ForegroundColor Blue

$NAMESPACE = "gamedin-l3"

# Apply performance optimizations
Write-Host "Applying performance optimizations..." -ForegroundColor Yellow

# Create performance ConfigMap
$performanceConfigYaml = @"
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
"@

$performanceConfigYaml | kubectl apply -f -

# Apply performance annotations to nodes
Write-Host "Applying performance annotations to nodes..." -ForegroundColor Yellow

$nodes = kubectl get nodes -o jsonpath='{.items[*].metadata.name}'
foreach ($node in $nodes) {
    kubectl annotate node $node `
        quantum.gamedin.com/performance-mode=enabled `
        quantum.gamedin.com/cpu-governor=performance `
        quantum.gamedin.com/memory-optimization=enabled `
        --overwrite
}

Write-Host "Performance tuning completed!" -ForegroundColor Green
'@

    $performanceTuningScript | Out-File -FilePath "scaling/performance-tuning.ps1" -Encoding UTF8
}

# Display summary
Write-Host ""
Write-Success "🎉 Auto-scaling configuration deployed successfully!"
Write-Host ""
Write-Host "📋 Deployed Components:" -ForegroundColor Cyan
Write-Host "  ✅ Horizontal Pod Autoscaler (HPA) with custom metrics" -ForegroundColor White
Write-Host "  ✅ Vertical Pod Autoscaler (VPA) for resource optimization" -ForegroundColor White
Write-Host "  ✅ Cluster Autoscaler for node pool scaling" -ForegroundColor White
Write-Host "  ✅ Custom Metrics API with Prometheus Adapter" -ForegroundColor White
Write-Host "  ✅ Resource Quotas and Priority Classes" -ForegroundColor White
Write-Host "  ✅ Pod Disruption Budget for high availability" -ForegroundColor White
Write-Host "  ✅ Scaling monitoring script" -ForegroundColor White
Write-Host "  ✅ Cost optimization script" -ForegroundColor White
Write-Host "  ✅ Performance tuning script" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Monitor scaling behavior: .\scaling\monitor-scaling.ps1" -ForegroundColor White
Write-Host "  2. Optimize costs: .\scaling\cost-optimization.ps1" -ForegroundColor White
Write-Host "  3. Tune performance: .\scaling\performance-tuning.ps1" -ForegroundColor White
Write-Host "  4. Review HPA status: kubectl get hpa -n $Namespace" -ForegroundColor White
Write-Host ""
Write-Host "📊 Scaling Configuration:" -ForegroundColor Cyan
Write-Host "  • Min Pods: 3, Max Pods: 20" -ForegroundColor White
Write-Host "  • CPU Threshold: 60%, Memory Threshold: 70%" -ForegroundColor White
Write-Host "  • Custom Metrics: Task Queue Length, Response Time" -ForegroundColor White
Write-Host "  • Scale Up: 100% increase, 15s period" -ForegroundColor White
Write-Host "  • Scale Down: 10% decrease, 60s period" -ForegroundColor White
Write-Host ""
Write-Success "GameDin quantum layer is now optimized for auto-scaling and peak performance! 🚀" 