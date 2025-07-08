#!/bin/bash

# GameDin Quantum Layer Networking Deployment Script
# Deploys comprehensive networking infrastructure with SSL/TLS and custom domains

set -e

echo "🌐 Deploying GameDin Quantum Layer Networking Configuration..."

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

# Configuration
NAMESPACE="gamedin-l3"
CLUSTER_NAME="gamedin-l3-cluster"
REGION="us-east-1"
DOMAIN="quantum.gamedin.xyz"
WEBSOCKET_DOMAIN="ws.quantum.gamedin.xyz"
MONITORING_DOMAIN="monitoring.gamedin.xyz"
PROMETHEUS_DOMAIN="prometheus.gamedin.xyz"

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

# Create namespace if it doesn't exist
print_status "Ensuring namespace exists..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Install cert-manager for SSL certificate management
print_status "Installing cert-manager for SSL certificate management..."

# Add cert-manager repository
helm repo add jetstack https://charts.jetstack.io
helm repo update

# Install cert-manager
helm install cert-manager jetstack/cert-manager \
    --namespace cert-manager \
    --create-namespace \
    --version v1.13.3 \
    --set installCRDs=true \
    --set global.leaderElection.namespace=cert-manager

# Wait for cert-manager to be ready
print_status "Waiting for cert-manager to be ready..."
kubectl wait --for=condition=Available --timeout=300s deployment/cert-manager -n cert-manager
kubectl wait --for=condition=Available --timeout=300s deployment/cert-manager-cainjector -n cert-manager
kubectl wait --for=condition=Available --timeout=300s deployment/cert-manager-webhook -n cert-manager

# Install AWS Load Balancer Controller
print_status "Installing AWS Load Balancer Controller..."

# Check if AWS Load Balancer Controller is already installed
if ! kubectl get deployment aws-load-balancer-controller -n kube-system &> /dev/null; then
    # Add AWS Load Balancer Controller repository
    helm repo add eks https://aws.github.io/eks-charts
    helm repo update

    # Install AWS Load Balancer Controller
    helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
        --namespace kube-system \
        --set clusterName=$CLUSTER_NAME \
        --set serviceAccount.create=false \
        --set serviceAccount.name=aws-load-balancer-controller \
        --set region=$REGION \
        --set vpcId=vpc-XXXXXXXXX \
        --set replicaCount=2

    print_success "AWS Load Balancer Controller installed successfully"
else
    print_status "AWS Load Balancer Controller already installed"
fi

# Wait for AWS Load Balancer Controller to be ready
kubectl wait --for=condition=Available --timeout=300s deployment/aws-load-balancer-controller -n kube-system

# Deploy networking configuration
print_status "Deploying networking configuration..."

# Apply the networking configuration
kubectl apply -f networking/ingress-config.yaml

# Wait for resources to be ready
print_status "Waiting for resources to be ready..."

# Wait for ingress to be ready
kubectl wait --for=condition=Available --timeout=300s ingress/gamedin-quantum-ingress -n $NAMESPACE

# Create domain setup script
print_status "Creating domain setup script..."

cat > networking/setup-domain.sh << 'EOF'
#!/bin/bash

# GameDin Quantum Layer Domain Setup Script
# Sets up custom domain with DNS configuration

set -e

echo "🌐 Setting up GameDin Quantum Layer Domain Configuration..."

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

# Configuration
DOMAIN="quantum.gamedin.xyz"
WEBSOCKET_DOMAIN="ws.quantum.gamedin.xyz"
MONITORING_DOMAIN="monitoring.gamedin.xyz"
PROMETHEUS_DOMAIN="prometheus.gamedin.xyz"

# Get ALB DNS name
print_status "Getting ALB DNS name..."
ALB_DNS_NAME=$(kubectl get ingress gamedin-quantum-ingress -n gamedin-l3 -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

if [ -z "$ALB_DNS_NAME" ]; then
    print_error "Could not get ALB DNS name. Please check if ingress is properly configured."
    exit 1
fi

print_status "ALB DNS Name: $ALB_DNS_NAME"

# Create DNS configuration
print_status "Creating DNS configuration..."

cat > networking/dns-records.txt << DNSEOF
# GameDin Quantum Layer DNS Records
# Add these records to your DNS provider

# Main quantum API
$DOMAIN. IN A $ALB_DNS_NAME

# WebSocket endpoint
$WEBSOCKET_DOMAIN. IN A $ALB_DNS_NAME

# Monitoring
$MONITORING_DOMAIN. IN A $ALB_DNS_NAME

# Prometheus
$PROMETHEUS_DOMAIN. IN A $ALB_DNS_NAME

# CNAME records for ALB (alternative approach)
# $DOMAIN. IN CNAME $ALB_DNS_NAME.
# $WEBSOCKET_DOMAIN. IN CNAME $ALB_DNS_NAME.
# $MONITORING_DOMAIN. IN CNAME $ALB_DNS_NAME.
# $PROMETHEUS_DOMAIN. IN CNAME $ALB_DNS_NAME.
DNSEOF

print_status "DNS records configuration created in networking/dns-records.txt"
print_warning "Please add these DNS records to your domain provider (Route53, Cloudflare, etc.)"

# Test domain resolution
print_status "Testing domain resolution..."
if command -v nslookup &> /dev/null; then
    print_status "Testing $DOMAIN resolution..."
    nslookup $DOMAIN || print_warning "Domain not yet resolved (this is normal if DNS records haven't been added)"
else
    print_warning "nslookup not available, skipping domain resolution test"
fi

print_success "Domain setup completed!"
print_status "Next steps:"
echo "1. Add DNS records from networking/dns-records.txt to your domain provider"
echo "2. Wait for DNS propagation (can take up to 48 hours)"
echo "3. Test domain access: https://$DOMAIN"
echo "4. Test WebSocket: wss://$WEBSOCKET_DOMAIN"
EOF

chmod +x networking/setup-domain.sh

# Create SSL certificate verification script
print_status "Creating SSL certificate verification script..."

cat > networking/verify-ssl.sh << 'EOF'
#!/bin/bash

# GameDin Quantum Layer SSL Certificate Verification Script
# Verifies SSL certificate status and configuration

set -e

echo "🔒 Verifying GameDin Quantum Layer SSL Certificates..."

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

# Configuration
DOMAIN="quantum.gamedin.xyz"
WEBSOCKET_DOMAIN="ws.quantum.gamedin.xyz"
MONITORING_DOMAIN="monitoring.gamedin.xyz"
PROMETHEUS_DOMAIN="prometheus.gamedin.xyz"

# Check certificate status
print_status "Checking certificate status..."

echo ""
print_status "Certificate Status:"
kubectl get certificates -n gamedin-l3

echo ""
print_status "Certificate Details:"
kubectl describe certificate quantum-gamedin-cert -n gamedin-l3

echo ""
print_status "Certificate Request Status:"
kubectl get certificaterequests -n gamedin-l3

echo ""
print_status "Order Status:"
kubectl get orders -n gamedin-l3

# Test SSL certificates
print_status "Testing SSL certificates..."

test_ssl() {
    local domain=$1
    local port=${2:-443}
    
    echo ""
    print_status "Testing SSL for $domain:$port"
    
    if command -v openssl &> /dev/null; then
        echo | openssl s_client -servername $domain -connect $domain:$port 2>/dev/null | openssl x509 -noout -dates
    else
        print_warning "openssl not available, skipping SSL test for $domain"
    fi
    
    if command -v curl &> /dev/null; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$domain)
        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ]; then
            print_status "HTTPS access successful for $domain (HTTP $HTTP_CODE)"
        else
            print_warning "HTTPS access failed for $domain (HTTP $HTTP_CODE)"
        fi
    else
        print_warning "curl not available, skipping HTTPS test for $domain"
    fi
}

# Test each domain
test_ssl $DOMAIN
test_ssl $WEBSOCKET_DOMAIN
test_ssl $MONITORING_DOMAIN
test_ssl $PROMETHEUS_DOMAIN

print_success "SSL certificate verification completed!"
EOF

chmod +x networking/verify-ssl.sh

# Create API testing script
print_status "Creating API testing script..."

cat > networking/test-api.sh << 'EOF'
#!/bin/bash

# GameDin Quantum Layer API Testing Script
# Tests all API endpoints and WebSocket connections

set -e

echo "🧪 Testing GameDin Quantum Layer API Endpoints..."

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

# Configuration
DOMAIN="quantum.gamedin.xyz"
WEBSOCKET_DOMAIN="ws.quantum.gamedin.xyz"
API_BASE="https://$DOMAIN"

# Test HTTP endpoints
test_endpoint() {
    local endpoint=$1
    local method=${2:-GET}
    local data=${3:-}
    
    echo ""
    print_status "Testing $method $endpoint"
    
    if command -v curl &> /dev/null; then
        if [ "$method" = "POST" ] && [ -n "$data" ]; then
            HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X $method -H "Content-Type: application/json" -d "$data" $endpoint)
        else
            HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X $method $endpoint)
        fi
        
        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "302" ]; then
            print_status "✅ $method $endpoint successful (HTTP $HTTP_CODE)"
        else
            print_warning "⚠️  $method $endpoint failed (HTTP $HTTP_CODE)"
        fi
    else
        print_warning "curl not available, skipping test for $endpoint"
    fi
}

# Test health endpoints
test_endpoint "$API_BASE/health"
test_endpoint "$API_BASE/metrics"
test_endpoint "$API_BASE/ready"

# Test quantum API endpoints
test_endpoint "$API_BASE/api/v1/quantum/queue"
test_endpoint "$API_BASE/api/v1/quantum/task" "POST" '{"task_type":"test","parameters":{},"priority":1}'

# Test WebSocket connection
print_status "Testing WebSocket connection..."
if command -v wscat &> /dev/null; then
    echo "WebSocket test requires wscat. Install with: npm install -g wscat"
    print_warning "WebSocket test skipped (wscat not available)"
elif command -v websocat &> /dev/null; then
    echo "Testing WebSocket connection to wss://$WEBSOCKET_DOMAIN"
    timeout 5 websocat wss://$WEBSOCKET_DOMAIN || print_warning "WebSocket connection failed"
else
    print_warning "WebSocket test skipped (no WebSocket client available)"
fi

# Test CORS headers
print_status "Testing CORS headers..."
if command -v curl &> /dev/null; then
    CORS_HEADERS=$(curl -s -I -H "Origin: https://gamedin.xyz" $API_BASE/health | grep -i "access-control")
    if [ -n "$CORS_HEADERS" ]; then
        print_status "✅ CORS headers present"
        echo "$CORS_HEADERS"
    else
        print_warning "⚠️  CORS headers not found"
    fi
fi

# Test security headers
print_status "Testing security headers..."
if command -v curl &> /dev/null; then
    SECURITY_HEADERS=$(curl -s -I $API_BASE/health | grep -E "(Strict-Transport-Security|X-Content-Type-Options|X-Frame-Options|X-XSS-Protection)")
    if [ -n "$SECURITY_HEADERS" ]; then
        print_status "✅ Security headers present"
        echo "$SECURITY_HEADERS"
    else
        print_warning "⚠️  Security headers not found"
    fi
fi

print_success "API testing completed!"
EOF

chmod +x networking/test-api.sh

# Create monitoring script
print_status "Creating networking monitoring script..."

cat > networking/monitor-networking.sh << 'EOF'
#!/bin/bash

# GameDin Quantum Layer Networking Monitor
# Monitors networking status and performance

set -e

echo "📊 Monitoring GameDin Quantum Layer Networking..."

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

# Monitor ingress status
echo ""
print_status "Ingress Status:"
kubectl get ingress -n $NAMESPACE

# Monitor services
echo ""
print_status "Service Status:"
kubectl get services -n $NAMESPACE

# Monitor load balancer
echo ""
print_status "Load Balancer Status:"
kubectl get svc -n $NAMESPACE -o wide

# Monitor certificates
echo ""
print_status "Certificate Status:"
kubectl get certificates -n $NAMESPACE

# Monitor network policies
echo ""
print_status "Network Policy Status:"
kubectl get networkpolicies -n $NAMESPACE

# Monitor AWS Load Balancer Controller
echo ""
print_status "AWS Load Balancer Controller Status:"
kubectl get pods -n kube-system -l app=aws-load-balancer-controller

# Monitor cert-manager
echo ""
print_status "Cert-Manager Status:"
kubectl get pods -n cert-manager

# Check ingress events
echo ""
print_status "Recent Ingress Events:"
kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | grep -i "ingress\|loadbalancer" | tail -5

# Check certificate events
echo ""
print_status "Recent Certificate Events:"
kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | grep -i "certificate\|cert-manager" | tail -5

# Network connectivity test
echo ""
print_status "Network Connectivity Test:"

test_connectivity() {
    local service=$1
    local port=$2
    
    if kubectl exec -it deployment/quantum-computing -n $NAMESPACE -- nc -z $service $port 2>/dev/null; then
        print_status "✅ $service:$port - Connected"
    else
        print_warning "⚠️  $service:$port - Connection failed"
    fi
}

# Test internal connectivity
test_connectivity "quantum-websocket" 8081
test_connectivity "grafana" 80
test_connectivity "prometheus-server" 9090

echo ""
print_status "Networking monitoring completed!"
EOF

chmod +x networking/monitor-networking.sh

# Create troubleshooting script
print_status "Creating networking troubleshooting script..."

cat > networking/troubleshoot.sh << 'EOF'
#!/bin/bash

# GameDin Quantum Layer Networking Troubleshooting Script
# Diagnoses and fixes common networking issues

set -e

echo "🔧 Troubleshooting GameDin Quantum Layer Networking..."

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

# Check cluster connectivity
print_status "Checking cluster connectivity..."
if kubectl cluster-info &> /dev/null; then
    print_status "✅ Cluster connectivity OK"
else
    print_error "❌ Cluster connectivity failed"
    exit 1
fi

# Check namespace
print_status "Checking namespace..."
if kubectl get namespace $NAMESPACE &> /dev/null; then
    print_status "✅ Namespace $NAMESPACE exists"
else
    print_error "❌ Namespace $NAMESPACE not found"
    print_status "Creating namespace..."
    kubectl create namespace $NAMESPACE
fi

# Check AWS Load Balancer Controller
print_status "Checking AWS Load Balancer Controller..."
if kubectl get deployment aws-load-balancer-controller -n kube-system &> /dev/null; then
    CONTROLLER_STATUS=$(kubectl get deployment aws-load-balancer-controller -n kube-system -o jsonpath='{.status.conditions[?(@.type=="Available")].status}')
    if [ "$CONTROLLER_STATUS" = "True" ]; then
        print_status "✅ AWS Load Balancer Controller is running"
    else
        print_warning "⚠️  AWS Load Balancer Controller is not ready"
        kubectl describe deployment aws-load-balancer-controller -n kube-system
    fi
else
    print_error "❌ AWS Load Balancer Controller not found"
    print_status "Installing AWS Load Balancer Controller..."
    helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
        --namespace kube-system \
        --set clusterName=gamedin-l3-cluster \
        --set region=us-east-1
fi

# Check cert-manager
print_status "Checking cert-manager..."
if kubectl get deployment cert-manager -n cert-manager &> /dev/null; then
    CERT_STATUS=$(kubectl get deployment cert-manager -n cert-manager -o jsonpath='{.status.conditions[?(@.type=="Available")].status}')
    if [ "$CERT_STATUS" = "True" ]; then
        print_status "✅ Cert-manager is running"
    else
        print_warning "⚠️  Cert-manager is not ready"
        kubectl describe deployment cert-manager -n cert-manager
    fi
else
    print_error "❌ Cert-manager not found"
    print_status "Installing cert-manager..."
    helm install cert-manager jetstack/cert-manager \
        --namespace cert-manager \
        --create-namespace \
        --set installCRDs=true
fi

# Check ingress
print_status "Checking ingress..."
if kubectl get ingress gamedin-quantum-ingress -n $NAMESPACE &> /dev/null; then
    INGRESS_STATUS=$(kubectl get ingress gamedin-quantum-ingress -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
    if [ -n "$INGRESS_STATUS" ]; then
        print_status "✅ Ingress is configured with ALB: $INGRESS_STATUS"
    else
        print_warning "⚠️  Ingress is not ready"
        kubectl describe ingress gamedin-quantum-ingress -n $NAMESPACE
    fi
else
    print_error "❌ Ingress not found"
    print_status "Applying ingress configuration..."
    kubectl apply -f networking/ingress-config.yaml
fi

# Check certificates
print_status "Checking certificates..."
if kubectl get certificate quantum-gamedin-cert -n $NAMESPACE &> /dev/null; then
    CERT_STATUS=$(kubectl get certificate quantum-gamedin-cert -n $NAMESPACE -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}')
    if [ "$CERT_STATUS" = "True" ]; then
        print_status "✅ SSL certificate is ready"
    else
        print_warning "⚠️  SSL certificate is not ready"
        kubectl describe certificate quantum-gamedin-cert -n $NAMESPACE
    fi
else
    print_error "❌ SSL certificate not found"
    print_status "Applying certificate configuration..."
    kubectl apply -f networking/ingress-config.yaml
fi

# Check services
print_status "Checking services..."
SERVICES=("quantum-computing" "quantum-websocket" "grafana" "prometheus-server")
for service in "${SERVICES[@]}"; do
    if kubectl get service $service -n $NAMESPACE &> /dev/null; then
        print_status "✅ Service $service exists"
    else
        print_warning "⚠️  Service $service not found"
    fi
done

# Check network policies
print_status "Checking network policies..."
if kubectl get networkpolicy quantum-network-policy -n $NAMESPACE &> /dev/null; then
    print_status "✅ Network policy exists"
else
    print_warning "⚠️  Network policy not found"
fi

# DNS resolution test
print_status "Testing DNS resolution..."
DOMAINS=("quantum.gamedin.xyz" "ws.quantum.gamedin.xyz" "monitoring.gamedin.xyz" "prometheus.gamedin.xyz")
for domain in "${DOMAINS[@]}"; do
    if nslookup $domain &> /dev/null; then
        print_status "✅ DNS resolution OK for $domain"
    else
        print_warning "⚠️  DNS resolution failed for $domain"
    fi
done

print_success "Troubleshooting completed!"
print_status "If issues persist, check the logs:"
echo "kubectl logs -f deployment/aws-load-balancer-controller -n kube-system"
echo "kubectl logs -f deployment/cert-manager -n cert-manager"
echo "kubectl describe ingress gamedin-quantum-ingress -n $NAMESPACE"
EOF

chmod +x networking/troubleshoot.sh

# Display summary
echo ""
print_success "🎉 Networking configuration deployed successfully!"
echo ""
echo "📋 Deployed Components:"
echo "  ✅ AWS Load Balancer Controller for ALB management"
echo "  ✅ Cert-manager for SSL certificate automation"
echo "  ✅ Ingress configuration with custom domains"
echo "  ✅ WebSocket service for real-time communication"
echo "  ✅ Network policies for security"
echo "  ✅ SSL certificates with Let's Encrypt"
echo "  ✅ API gateway configuration"
echo "  ✅ CORS and security headers"
echo "  ✅ Domain setup script"
echo "  ✅ SSL verification script"
echo "  ✅ API testing script"
echo "  ✅ Networking monitoring script"
echo "  ✅ Troubleshooting script"
echo ""
echo "🔧 Next Steps:"
echo "  1. Setup domain: ./networking/setup-domain.sh"
echo "  2. Verify SSL: ./networking/verify-ssl.sh"
echo "  3. Test API: ./networking/test-api.sh"
echo "  4. Monitor: ./networking/monitor-networking.sh"
echo "  5. Troubleshoot: ./networking/troubleshoot.sh"
echo ""
echo "🌐 Domain Configuration:"
echo "  • Main API: https://quantum.gamedin.xyz"
echo "  • WebSocket: wss://ws.quantum.gamedin.xyz"
echo "  • Monitoring: https://monitoring.gamedin.xyz"
echo "  • Prometheus: https://prometheus.gamedin.xyz"
echo ""
echo "🔒 Security Features:"
echo "  • SSL/TLS encryption with Let's Encrypt"
echo "  • CORS configuration for cross-origin requests"
echo "  • Security headers (HSTS, CSP, XSS protection)"
echo "  • Network policies for traffic control"
echo "  • Rate limiting and authentication"
echo ""
print_success "GameDin quantum layer networking is now configured for production! 🚀" 