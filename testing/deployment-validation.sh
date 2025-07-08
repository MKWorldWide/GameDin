#!/bin/bash

# GameDin Quantum Layer - Deployment Validation Script
# Validates deployment rollback and redeployment cycles

set -e

echo "🔄 Starting GameDin Quantum Layer Deployment Validation..."

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
DEPLOYMENT_NAME="gamedin-quantum-layer"
SERVICE_NAME="gamedin-quantum-service"
INGRESS_NAME="gamedin-quantum-ingress"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
VALIDATION_RESULTS_DIR="validation-results"

# Create validation results directory
mkdir -p $VALIDATION_RESULTS_DIR
mkdir -p logs

# Validation results tracking
declare -A validation_results
declare -A deployment_versions
declare -A rollback_results

# Initialize validation results
validation_results=(
    ["deployment_creation"]="PENDING"
    ["health_check"]="PENDING"
    ["service_exposure"]="PENDING"
    ["ingress_configuration"]="PENDING"
    ["rollback_testing"]="PENDING"
    ["redeployment_testing"]="PENDING"
    ["data_persistence"]="PENDING"
    ["performance_validation"]="PENDING"
    ["security_validation"]="PENDING"
    ["monitoring_integration"]="PENDING"
)

# Function to log validation step
log_validation_step() {
    local step=$1
    local status=$2
    local message=$3
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    
    echo "[$timestamp] $step: $status - $message" >> "$VALIDATION_RESULTS_DIR/validation-log-$TIMESTAMP.log"
    
    if [ "$status" = "PASSED" ]; then
        print_success "$step: $message"
    elif [ "$status" = "FAILED" ]; then
        print_error "$step: $message"
    else
        print_warning "$step: $message"
    fi
}

# Function to check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if we can connect to the cluster
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    print_success "kubectl is available and connected to cluster"
}

# Function to check if helm is available
check_helm() {
    if ! command -v helm &> /dev/null; then
        print_error "helm is not installed or not in PATH"
        exit 1
    fi
    
    print_success "helm is available"
}

# Function to validate deployment creation
validate_deployment_creation() {
    print_status "Validating deployment creation..."
    
    # Create test deployment
    cat > /tmp/test-deployment.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gamedin-quantum-test
  namespace: gamedin-l3
  labels:
    app: gamedin-quantum-test
spec:
  replicas: 2
  selector:
    matchLabels:
      app: gamedin-quantum-test
  template:
    metadata:
      labels:
        app: gamedin-quantum-test
    spec:
      containers:
      - name: quantum-test
        image: nginx:alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
EOF

    # Apply deployment
    if kubectl apply -f /tmp/test-deployment.yaml; then
        # Wait for deployment to be ready
        if kubectl wait --for=condition=available --timeout=300s deployment/gamedin-quantum-test -n $NAMESPACE; then
            validation_results["deployment_creation"]="PASSED"
            deployment_versions["test"]=$(kubectl get deployment gamedin-quantum-test -n $NAMESPACE -o jsonpath='{.metadata.generation}')
            log_validation_step "deployment_creation" "PASSED" "Test deployment created successfully"
        else
            validation_results["deployment_creation"]="FAILED"
            log_validation_step "deployment_creation" "FAILED" "Deployment failed to become ready"
        fi
    else
        validation_results["deployment_creation"]="FAILED"
        log_validation_step "deployment_creation" "FAILED" "Failed to create deployment"
    fi
}

# Function to validate health checks
validate_health_checks() {
    print_status "Validating health checks..."
    
    # Check if pods are running
    local running_pods=$(kubectl get pods -n $NAMESPACE -l app=gamedin-quantum-test --field-selector=status.phase=Running -o jsonpath='{.items[*].metadata.name}' | wc -w)
    local total_pods=$(kubectl get pods -n $NAMESPACE -l app=gamedin-quantum-test -o jsonpath='{.items[*].metadata.name}' | wc -w)
    
    if [ "$running_pods" -eq "$total_pods" ] && [ "$total_pods" -gt 0 ]; then
        # Test liveness probe
        local pod_name=$(kubectl get pods -n $NAMESPACE -l app=gamedin-quantum-test -o jsonpath='{.items[0].metadata.name}')
        
        if kubectl exec -n $NAMESPACE $pod_name -- curl -f http://localhost:80/; then
            validation_results["health_check"]="PASSED"
            log_validation_step "health_check" "PASSED" "Health checks passed for all pods"
        else
            validation_results["health_check"]="FAILED"
            log_validation_step "health_check" "FAILED" "Liveness probe failed"
        fi
    else
        validation_results["health_check"]="FAILED"
        log_validation_step "health_check" "FAILED" "Not all pods are running ($running_pods/$total_pods)"
    fi
}

# Function to validate service exposure
validate_service_exposure() {
    print_status "Validating service exposure..."
    
    # Create test service
    cat > /tmp/test-service.yaml << 'EOF'
apiVersion: v1
kind: Service
metadata:
  name: gamedin-quantum-test-service
  namespace: gamedin-l3
spec:
  selector:
    app: gamedin-quantum-test
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP
EOF

    if kubectl apply -f /tmp/test-service.yaml; then
        # Wait for service to be ready
        sleep 10
        
        # Test service connectivity
        local service_ip=$(kubectl get service gamedin-quantum-test-service -n $NAMESPACE -o jsonpath='{.spec.clusterIP}')
        local pod_name=$(kubectl get pods -n $NAMESPACE -l app=gamedin-quantum-test -o jsonpath='{.items[0].metadata.name}')
        
        if kubectl exec -n $NAMESPACE $pod_name -- curl -f http://$service_ip:80/; then
            validation_results["service_exposure"]="PASSED"
            log_validation_step "service_exposure" "PASSED" "Service exposure validated successfully"
        else
            validation_results["service_exposure"]="FAILED"
            log_validation_step "service_exposure" "FAILED" "Service connectivity failed"
        fi
    else
        validation_results["service_exposure"]="FAILED"
        log_validation_step "service_exposure" "FAILED" "Failed to create service"
    fi
}

# Function to validate ingress configuration
validate_ingress_configuration() {
    print_status "Validating ingress configuration..."
    
    # Create test ingress
    cat > /tmp/test-ingress.yaml << 'EOF'
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: gamedin-quantum-test-ingress
  namespace: gamedin-l3
  annotations:
    kubernetes.io/ingress.class: "alb"
    alb.ingress.kubernetes.io/scheme: "internet-facing"
    alb.ingress.kubernetes.io/target-type: "ip"
spec:
  rules:
  - host: test-quantum.gamedin.xyz
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: gamedin-quantum-test-service
            port:
              number: 80
EOF

    if kubectl apply -f /tmp/test-ingress.yaml; then
        # Wait for ingress to be ready
        if kubectl wait --for=condition=ready --timeout=300s ingress/gamedin-quantum-test-ingress -n $NAMESPACE; then
            validation_results["ingress_configuration"]="PASSED"
            log_validation_step "ingress_configuration" "PASSED" "Ingress configuration validated successfully"
        else
            validation_results["ingress_configuration"]="FAILED"
            log_validation_step "ingress_configuration" "FAILED" "Ingress failed to become ready"
        fi
    else
        validation_results["ingress_configuration"]="FAILED"
        log_validation_step "ingress_configuration" "FAILED" "Failed to create ingress"
    fi
}

# Function to test deployment rollback
test_deployment_rollback() {
    print_status "Testing deployment rollback..."
    
    # Get current deployment version
    local current_version=$(kubectl get deployment gamedin-quantum-test -n $NAMESPACE -o jsonpath='{.metadata.generation}')
    
    # Create a "bad" deployment update
    cat > /tmp/bad-deployment.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gamedin-quantum-test
  namespace: gamedin-l3
spec:
  replicas: 2
  selector:
    matchLabels:
      app: gamedin-quantum-test
  template:
    metadata:
      labels:
        app: gamedin-quantum-test
    spec:
      containers:
      - name: quantum-test
        image: nginx:invalid-image
        ports:
        - containerPort: 80
EOF

    # Apply bad deployment
    kubectl apply -f /tmp/bad-deployment.yaml
    
    # Wait a bit for the deployment to fail
    sleep 30
    
    # Check if deployment is failing
    local failed_pods=$(kubectl get pods -n $NAMESPACE -l app=gamedin-quantum-test --field-selector=status.phase=Failed -o jsonpath='{.items[*].metadata.name}' | wc -w)
    
    if [ "$failed_pods" -gt 0 ]; then
        # Test rollback
        if kubectl rollout undo deployment/gamedin-quantum-test -n $NAMESPACE; then
            # Wait for rollback to complete
            if kubectl wait --for=condition=available --timeout=300s deployment/gamedin-quantum-test -n $NAMESPACE; then
                local rollback_version=$(kubectl get deployment gamedin-quantum-test -n $NAMESPACE -o jsonpath='{.metadata.generation}')
                
                if [ "$rollback_version" != "$current_version" ]; then
                    validation_results["rollback_testing"]="PASSED"
                    rollback_results["success"]="true"
                    rollback_results["from_version"]="$current_version"
                    rollback_results["to_version"]="$rollback_version"
                    log_validation_step "rollback_testing" "PASSED" "Deployment rollback successful"
                else
                    validation_results["rollback_testing"]="FAILED"
                    log_validation_step "rollback_testing" "FAILED" "Rollback version unchanged"
                fi
            else
                validation_results["rollback_testing"]="FAILED"
                log_validation_step "rollback_testing" "FAILED" "Rollback failed to complete"
            fi
        else
            validation_results["rollback_testing"]="FAILED"
            log_validation_step "rollback_testing" "FAILED" "Failed to initiate rollback"
        fi
    else
        validation_results["rollback_testing"]="SKIPPED"
        log_validation_step "rollback_testing" "SKIPPED" "No failed pods to rollback"
    fi
}

# Function to test redeployment
test_redeployment() {
    print_status "Testing redeployment..."
    
    # Get current deployment version
    local current_version=$(kubectl get deployment gamedin-quantum-test -n $NAMESPACE -o jsonpath='{.metadata.generation}')
    
    # Create updated deployment
    cat > /tmp/updated-deployment.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gamedin-quantum-test
  namespace: gamedin-l3
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gamedin-quantum-test
  template:
    metadata:
      labels:
        app: gamedin-quantum-test
    spec:
      containers:
      - name: quantum-test
        image: nginx:alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
EOF

    # Apply updated deployment
    if kubectl apply -f /tmp/updated-deployment.yaml; then
        # Wait for deployment to be ready
        if kubectl wait --for=condition=available --timeout=300s deployment/gamedin-quantum-test -n $NAMESPACE; then
            local new_version=$(kubectl get deployment gamedin-quantum-test -n $NAMESPACE -o jsonpath='{.metadata.generation}')
            local new_replicas=$(kubectl get deployment gamedin-quantum-test -n $NAMESPACE -o jsonpath='{.spec.replicas}')
            
            if [ "$new_version" != "$current_version" ] && [ "$new_replicas" = "3" ]; then
                validation_results["redeployment_testing"]="PASSED"
                deployment_versions["updated"]="$new_version"
                log_validation_step "redeployment_testing" "PASSED" "Redeployment successful (replicas: $new_replicas)"
            else
                validation_results["redeployment_testing"]="FAILED"
                log_validation_step "redeployment_testing" "FAILED" "Redeployment failed to update properly"
            fi
        else
            validation_results["redeployment_testing"]="FAILED"
            log_validation_step "redeployment_testing" "FAILED" "Redeployment failed to become ready"
        fi
    else
        validation_results["redeployment_testing"]="FAILED"
        log_validation_step "redeployment_testing" "FAILED" "Failed to apply updated deployment"
    fi
}

# Function to validate data persistence
validate_data_persistence() {
    print_status "Validating data persistence..."
    
    # Create a persistent volume claim
    cat > /tmp/test-pvc.yaml << 'EOF'
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: gamedin-quantum-test-pvc
  namespace: gamedin-l3
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
EOF

    if kubectl apply -f /tmp/test-pvc.yaml; then
        # Wait for PVC to be bound
        if kubectl wait --for=condition=bound --timeout=300s pvc/gamedin-quantum-test-pvc -n $NAMESPACE; then
            validation_results["data_persistence"]="PASSED"
            log_validation_step "data_persistence" "PASSED" "Data persistence validated successfully"
        else
            validation_results["data_persistence"]="FAILED"
            log_validation_step "data_persistence" "FAILED" "PVC failed to be bound"
        fi
    else
        validation_results["data_persistence"]="FAILED"
        log_validation_step "data_persistence" "FAILED" "Failed to create PVC"
    fi
}

# Function to validate performance
validate_performance() {
    print_status "Validating performance..."
    
    # Check resource usage
    local cpu_usage=$(kubectl top pods -n $NAMESPACE -l app=gamedin-quantum-test --no-headers | awk '{sum+=$2} END {print sum}')
    local memory_usage=$(kubectl top pods -n $NAMESPACE -l app=gamedin-quantum-test --no-headers | awk '{sum+=$3} END {print sum}')
    
    # Simple performance validation (adjust thresholds as needed)
    if [ "$cpu_usage" -lt 1000 ] && [ "$memory_usage" -lt 500 ]; then
        validation_results["performance_validation"]="PASSED"
        log_validation_step "performance_validation" "PASSED" "Performance within acceptable limits (CPU: ${cpu_usage}m, Memory: ${memory_usage}Mi)"
    else
        validation_results["performance_validation"]="FAILED"
        log_validation_step "performance_validation" "FAILED" "Performance exceeded limits (CPU: ${cpu_usage}m, Memory: ${memory_usage}Mi)"
    fi
}

# Function to validate security
validate_security() {
    print_status "Validating security..."
    
    # Check if security policies are applied
    local security_policies=$(kubectl get psp -n $NAMESPACE 2>/dev/null | wc -l)
    local network_policies=$(kubectl get netpol -n $NAMESPACE 2>/dev/null | wc -l)
    
    if [ "$security_policies" -gt 0 ] || [ "$network_policies" -gt 0 ]; then
        validation_results["security_validation"]="PASSED"
        log_validation_step "security_validation" "PASSED" "Security policies are configured"
    else
        validation_results["security_validation"]="WARNING"
        log_validation_step "security_validation" "WARNING" "No security policies detected"
    fi
}

# Function to validate monitoring integration
validate_monitoring_integration() {
    print_status "Validating monitoring integration..."
    
    # Check if monitoring components are running
    local prometheus_running=$(kubectl get pods -n monitoring --field-selector=status.phase=Running -l app=prometheus 2>/dev/null | wc -l)
    local grafana_running=$(kubectl get pods -n monitoring --field-selector=status.phase=Running -l app=grafana 2>/dev/null | wc -l)
    
    if [ "$prometheus_running" -gt 0 ] && [ "$grafana_running" -gt 0 ]; then
        validation_results["monitoring_integration"]="PASSED"
        log_validation_step "monitoring_integration" "PASSED" "Monitoring components are running"
    else
        validation_results["monitoring_integration"]="WARNING"
        log_validation_step "monitoring_integration" "WARNING" "Some monitoring components may not be running"
    fi
}

# Function to generate validation report
generate_validation_report() {
    print_status "Generating validation report..."
    
    local passed=0
    local failed=0
    local warning=0
    local skipped=0
    
    for status in "${validation_results[@]}"; do
        case $status in
            "PASSED")
                ((passed++))
                ;;
            "FAILED")
                ((failed++))
                ;;
            "WARNING")
                ((warning++))
                ;;
            "SKIPPED")
                ((skipped++))
                ;;
        esac
    done
    
    local total=$((passed + failed + warning + skipped))
    
    cat > "$VALIDATION_RESULTS_DIR/validation-report-$TIMESTAMP.md" << EOF
# GameDin Quantum Layer - Deployment Validation Report

**Validation Date:** $(date)
**Timestamp:** $TIMESTAMP
**Cluster:** $CLUSTER_NAME
**Namespace:** $NAMESPACE

## 📊 Validation Summary

- **Total Tests:** $total
- **Passed:** $passed
- **Failed:** $failed
- **Warnings:** $warning
- **Skipped:** $skipped
- **Success Rate:** $((passed * 100 / total))%

## 🎯 Test Results

| Test | Status | Details |
|------|--------|---------|
EOF

    for test in "${!validation_results[@]}"; do
        local status="${validation_results[$test]}"
        local status_icon=""
        
        case $status in
            "PASSED")
                status_icon="✅"
                ;;
            "FAILED")
                status_icon="❌"
                ;;
            "WARNING")
                status_icon="⚠️"
                ;;
            "SKIPPED")
                status_icon="⏭️"
                ;;
        esac
        
        echo "| $test | $status_icon $status | - |" >> "$VALIDATION_RESULTS_DIR/validation-report-$TIMESTAMP.md"
    done
    
    cat >> "$VALIDATION_RESULTS_DIR/validation-report-$TIMESTAMP.md" << EOF

## 🔄 Deployment Versions

EOF

    for version in "${!deployment_versions[@]}"; do
        echo "- **$version:** ${deployment_versions[$version]}" >> "$VALIDATION_RESULTS_DIR/validation-report-$TIMESTAMP.md"
    done
    
    if [ "${rollback_results[success]}" = "true" ]; then
        cat >> "$VALIDATION_RESULTS_DIR/validation-report-$TIMESTAMP.md" << EOF

## 🔙 Rollback Results

- **Rollback Success:** ✅ Yes
- **From Version:** ${rollback_results[from_version]}
- **To Version:** ${rollback_results[to_version]}

EOF
    fi
    
    cat >> "$VALIDATION_RESULTS_DIR/validation-report-$TIMESTAMP.md" << EOF

## 📋 Recommendations

EOF

    if [ $failed -gt 0 ]; then
        echo "- ❌ **Critical:** Fix failed validation tests before production deployment" >> "$VALIDATION_RESULTS_DIR/validation-report-$TIMESTAMP.md"
    fi
    
    if [ $warning -gt 0 ]; then
        echo "- ⚠️ **Warning:** Address warnings to improve deployment quality" >> "$VALIDATION_RESULTS_DIR/validation-report-$TIMESTAMP.md"
    fi
    
    if [ $passed -eq $total ]; then
        echo "- ✅ **Ready:** Deployment is ready for production" >> "$VALIDATION_RESULTS_DIR/validation-report-$TIMESTAMP.md"
    fi
    
    cat >> "$VALIDATION_RESULTS_DIR/validation-report-$TIMESTAMP.md" << EOF

## 🔧 Next Steps

1. Review failed tests and fix issues
2. Address any warnings
3. Run validation again if needed
4. Proceed with production deployment

---

**Validation completed at:** $(date)
EOF

    # Display summary
    echo ""
    echo "📊 Validation Summary:"
    echo "  Total Tests: $total"
    echo "  Passed: $passed"
    echo "  Failed: $failed"
    echo "  Warnings: $warning"
    echo "  Skipped: $skipped"
    echo "  Success Rate: $((passed * 100 / total))%"
    echo ""
    
    if [ $failed -eq 0 ]; then
        print_success "🎉 All critical validation tests passed!"
    else
        print_error "❌ Some validation tests failed. Please review the report."
    fi
}

# Function to cleanup test resources
cleanup_test_resources() {
    print_status "Cleaning up test resources..."
    
    kubectl delete deployment gamedin-quantum-test -n $NAMESPACE --ignore-not-found=true
    kubectl delete service gamedin-quantum-test-service -n $NAMESPACE --ignore-not-found=true
    kubectl delete ingress gamedin-quantum-test-ingress -n $NAMESPACE --ignore-not-found=true
    kubectl delete pvc gamedin-quantum-test-pvc -n $NAMESPACE --ignore-not-found=true
    
    rm -f /tmp/test-deployment.yaml
    rm -f /tmp/bad-deployment.yaml
    rm -f /tmp/updated-deployment.yaml
    rm -f /tmp/test-service.yaml
    rm -f /tmp/test-ingress.yaml
    rm -f /tmp/test-pvc.yaml
    
    print_success "Test resources cleaned up"
}

# Main validation process
main() {
    echo "🚀 Starting GameDin Quantum Layer Deployment Validation"
    echo "======================================================"
    echo "Cluster: $CLUSTER_NAME"
    echo "Namespace: $NAMESPACE"
    echo "Timestamp: $TIMESTAMP"
    echo ""
    
    # Check prerequisites
    check_kubectl
    check_helm
    
    # Run validation tests
    validate_deployment_creation
    validate_health_checks
    validate_service_exposure
    validate_ingress_configuration
    test_deployment_rollback
    test_redeployment
    validate_data_persistence
    validate_performance
    validate_security
    validate_monitoring_integration
    
    # Generate report
    generate_validation_report
    
    # Cleanup
    cleanup_test_resources
    
    echo ""
    print_success "🎯 Deployment validation completed!"
    echo "📄 Report saved to: $VALIDATION_RESULTS_DIR/validation-report-$TIMESTAMP.md"
    echo "📋 Log saved to: $VALIDATION_RESULTS_DIR/validation-log-$TIMESTAMP.log"
}

# Run main function
main "$@" 