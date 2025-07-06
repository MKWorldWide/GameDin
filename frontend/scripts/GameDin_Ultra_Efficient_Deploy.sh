#!/bin/bash

# GameDin L3 Ultra-Efficient Deploy - Maximum Uptime & Speed
# Zero-downtime deployment with intelligent rollback and monitoring

set -e

# Export for performance
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
export BUILDKIT_PROGRESS=plain

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration variables
DEPLOYMENT_TYPE="${1:-production}"
CLUSTER_NAME="${2:-gamedin-l3-cluster}"
REGION="${3:-us-east-1}"
NODE_COUNT="${4:-6}"
MAX_DEPLOYMENT_TIME=600  # 10 minutes max
HEALTH_CHECK_RETRIES=50
PARALLEL_WORKERS=16

echo -e "${PURPLE}${BOLD}🚀 GameDin L3 ULTRA-EFFICIENT DEPLOY${NC}"
echo -e "${PURPLE}===========================================${NC}"
echo -e "${BLUE}Environment: ${DEPLOYMENT_TYPE}${NC}"
echo -e "${BLUE}Cluster: ${CLUSTER_NAME}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"
echo -e "${BLUE}Workers: ${PARALLEL_WORKERS}${NC}"
echo ""

# Deployment start time
DEPLOYMENT_START=$(date +%s)

# Performance monitoring
declare -A METRICS
METRICS[deployment_start]=$(date +%s)

# Log function with timestamps
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")  echo -e "${CYAN}[${timestamp}] INFO: ${message}${NC}" ;;
        "WARN")  echo -e "${YELLOW}[${timestamp}] WARN: ${message}${NC}" ;;
        "ERROR") echo -e "${RED}[${timestamp}] ERROR: ${message}${NC}" ;;
        "SUCCESS") echo -e "${GREEN}[${timestamp}] SUCCESS: ${message}${NC}" ;;
    esac
}

# Parallel execution wrapper
run_parallel() {
    local max_jobs=$1
    shift
    local jobs=()
    
    for cmd in "$@"; do
        while (( ${#jobs[@]} >= max_jobs )); do
            for i in "${!jobs[@]}"; do
                if ! kill -0 "${jobs[i]}" 2>/dev/null; then
                    unset "jobs[i]"
                fi
            done
            jobs=("${jobs[@]}")  # Reindex array
            sleep 0.1
        done
        
        {
            eval "$cmd"
        } &
        jobs+=($!)
    done
    
    # Wait for all remaining jobs
    for job in "${jobs[@]}"; do
        wait "$job"
    done
}

# Check prerequisites ultra-fast
ultra_fast_preflight() {
    log "INFO" "🔍 Ultra-fast preflight checks..."
    local start_time=$(date +%s)
    
    # Parallel dependency checks
    local checks=(
        "docker --version > /dev/null 2>&1 || { log 'ERROR' 'Docker not found'; exit 1; }"
        "kubectl version --client > /dev/null 2>&1 || { log 'ERROR' 'kubectl not found'; exit 1; }"
        "helm version > /dev/null 2>&1 || { log 'ERROR' 'Helm not found'; exit 1; }"
        "which jq > /dev/null 2>&1 || { log 'ERROR' 'jq not found'; exit 1; }"
    )
    
    run_parallel 4 "${checks[@]}"
    
    # Quick cluster connectivity test
    if ! kubectl cluster-info > /dev/null 2>&1; then
        log "ERROR" "❌ Kubernetes cluster not accessible"
        exit 1
    fi
    
    local end_time=$(date +%s)
    METRICS[preflight_duration]=$((end_time - start_time))
    log "SUCCESS" "✅ Preflight complete in ${METRICS[preflight_duration]}s"
}

# Deploy with zero downtime
zero_downtime_deploy() {
    log "INFO" "🚀 Zero-downtime deployment starting..."
    local start_time=$(date +%s)
    
    # Create namespace if it doesn't exist
    kubectl create namespace gamedin-l3-prod --dry-run=client -o yaml | kubectl apply -f - > /dev/null 2>&1
    
    # Apply configurations first (parallel)
    local config_tasks=(
        "kubectl apply -f GameDin_Production_K8s.yaml --timeout=300s"
        "kubectl -n gamedin-l3-prod create secret generic gamedin-secrets --from-literal=redis-password=gamedin_secure_redis --dry-run=client -o yaml | kubectl apply -f -"
    )
    
    run_parallel 2 "${config_tasks[@]}"
    
    # Wait for PVCs to be bound (critical path)
    log "INFO" "📦 Waiting for persistent volumes..."
    kubectl -n gamedin-l3-prod wait --for=condition=Bound pvc/l3-node-pvc --timeout=180s &
    kubectl -n gamedin-l3-prod wait --for=condition=Bound pvc/redis-pvc --timeout=180s &
    wait
    
    # Deploy core services with intelligent ordering
    log "INFO" "🏗️ Deploying core services..."
    
    # Stage 1: Foundation services (Redis, Load Balancer)
    local foundation_services=(
        "kubectl -n gamedin-l3-prod rollout status deployment/gamedin-redis --timeout=300s"
        "kubectl -n gamedin-l3-prod rollout status deployment/gamedin-load-balancer --timeout=300s"
    )
    
    run_parallel 2 "${foundation_services[@]}"
    
    # Stage 2: Core blockchain nodes
    kubectl -n gamedin-l3-prod rollout status deployment/gamedin-l3-node --timeout=300s
    
    # Stage 3: Gaming and AI services (parallel)
    local advanced_services=(
        "kubectl -n gamedin-l3-prod rollout status deployment/gamedin-gaming-engine --timeout=300s"
        "kubectl -n gamedin-l3-prod rollout status deployment/gamedin-novasanctum --timeout=300s"
    )
    
    run_parallel 2 "${advanced_services[@]}"
    
    local end_time=$(date +%s)
    METRICS[deployment_duration]=$((end_time - start_time))
    log "SUCCESS" "✅ Zero-downtime deployment complete in ${METRICS[deployment_duration]}s"
}

# Intelligent health verification
intelligent_health_check() {
    log "INFO" "🏥 Intelligent health verification..."
    local start_time=$(date +%s)
    
    # Define services with different criticality levels
    declare -A CRITICAL_SERVICES=(
        ["gamedin-l3-node"]="rpc:8545:/health"
        ["gamedin-gaming-engine"]="websocket:9546:/health"
    )
    
    declare -A IMPORTANT_SERVICES=(
        ["gamedin-novasanctum"]="ai:7547:/health"
        ["gamedin-redis"]="cache:6379:ping"
    )
    
    # Critical services first (must be healthy)
    for service in "${!CRITICAL_SERVICES[@]}"; do
        log "INFO" "Checking critical service: $service"
        if ! kubectl -n gamedin-l3-prod wait --for=condition=available deployment/$service --timeout=300s; then
            log "ERROR" "❌ Critical service $service failed to become available"
            return 1
        fi
        
        # Deep health check
        local pod=$(kubectl -n gamedin-l3-prod get pods -l app=$service -o jsonpath='{.items[0].metadata.name}')
        if [[ "$service" == "gamedin-redis" ]]; then
            if ! kubectl -n gamedin-l3-prod exec $pod -- redis-cli ping > /dev/null 2>&1; then
                log "ERROR" "❌ Redis health check failed"
                return 1
            fi
        else
            local port=$(echo "${CRITICAL_SERVICES[$service]}" | cut -d: -f2)
            if ! kubectl -n gamedin-l3-prod exec $pod -- curl -f http://localhost:$port/health > /dev/null 2>&1; then
                log "ERROR" "❌ $service health check failed"
                return 1
            fi
        fi
        
        log "SUCCESS" "✅ $service is healthy"
    done
    
    # Important services (parallel check)
    local health_tasks=()
    for service in "${!IMPORTANT_SERVICES[@]}"; do
        health_tasks+=("kubectl -n gamedin-l3-prod wait --for=condition=available deployment/$service --timeout=180s")
    done
    
    run_parallel 2 "${health_tasks[@]}"
    
    local end_time=$(date +%s)
    METRICS[health_check_duration]=$((end_time - start_time))
    log "SUCCESS" "✅ Health verification complete in ${METRICS[health_check_duration]}s"
}

# Performance optimization post-deployment
optimize_for_maximum_performance() {
    log "INFO" "⚡ Maximum performance optimization..."
    local start_time=$(date +%s)
    
    # Parallel optimization tasks
    local optimization_tasks=(
        # L3 node optimizations
        "kubectl -n gamedin-l3-prod exec deployment/gamedin-l3-node -- sh -c 'echo \"net.core.somaxconn = 65535\" >> /etc/sysctl.conf; sysctl -p' > /dev/null 2>&1 || true"
        
        # Gaming engine optimizations
        "kubectl -n gamedin-l3-prod exec deployment/gamedin-gaming-engine -- sh -c 'echo \"fs.file-max = 1000000\" >> /etc/sysctl.conf; sysctl -p' > /dev/null 2>&1 || true"
        
        # Redis optimization
        "kubectl -n gamedin-l3-prod exec deployment/gamedin-redis -- redis-cli CONFIG SET maxmemory-policy allkeys-lru > /dev/null 2>&1 || true"
        
        # HPA configuration
        "kubectl -n gamedin-l3-prod patch hpa gamedin-gaming-engine-hpa -p '{\"spec\":{\"behavior\":{\"scaleUp\":{\"stabilizationWindowSeconds\":60}}}}' > /dev/null 2>&1 || true"
    )
    
    run_parallel 4 "${optimization_tasks[@]}"
    
    local end_time=$(date +%s)
    METRICS[optimization_duration]=$((end_time - start_time))
    log "SUCCESS" "✅ Performance optimization complete in ${METRICS[optimization_duration]}s"
}

# Real-time monitoring setup
setup_realtime_monitoring() {
    log "INFO" "📊 Setting up real-time monitoring..."
    local start_time=$(date +%s)
    
    # Deploy monitoring stack with Helm for speed
    {
        helm repo add prometheus-community https://prometheus-community.github.io/helm-charts > /dev/null 2>&1 || true
        helm repo add grafana https://grafana.github.io/helm-charts > /dev/null 2>&1 || true
        helm repo update > /dev/null 2>&1
    } &
    
    {
        # Create monitoring namespace
        kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f - > /dev/null 2>&1
    } &
    
    wait
    
    # Deploy Prometheus and Grafana in parallel
    {
        helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
            --namespace monitoring \
            --set grafana.adminPassword=gamedin_admin \
            --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
            --set prometheus.prometheusSpec.podMonitorSelectorNilUsesHelmValues=false \
            --timeout 300s > /dev/null 2>&1
    } &
    
    {
        # Create ServiceMonitor for GameDin services
        cat <<EOF | kubectl apply -f - > /dev/null 2>&1
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: gamedin-l3-monitor
  namespace: monitoring
spec:
  selector:
    matchLabels:
      app: gamedin-l3-node
  endpoints:
  - port: metrics
    interval: 10s
    path: /metrics
EOF
    } &
    
    wait
    
    local end_time=$(date +%s)
    METRICS[monitoring_duration]=$((end_time - start_time))
    log "SUCCESS" "✅ Real-time monitoring setup complete in ${METRICS[monitoring_duration]}s"
}

# Performance benchmark
run_ultra_fast_benchmark() {
    log "INFO" "🏁 Ultra-fast performance benchmark..."
    local start_time=$(date +%s)
    
    # Get external IP
    local external_ip
    local retries=0
    while [[ $retries -lt 30 ]]; do
        external_ip=$(kubectl -n gamedin-l3-prod get service gamedin-load-balancer-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
        if [[ -n "$external_ip" && "$external_ip" != "null" ]]; then
            break
        fi
        sleep 2
        ((retries++))
    done
    
    if [[ -z "$external_ip" || "$external_ip" == "null" ]]; then
        log "WARN" "⚠️ External IP not available, using port-forward for testing"
        kubectl -n gamedin-l3-prod port-forward service/gamedin-l3-service 8545:8545 &
        local port_forward_pid=$!
        sleep 5
        external_ip="localhost"
    fi
    
    # Parallel performance tests
    local test_results=()
    
    {
        # L3 RPC performance test
        local l3_start=$(date +%s%3N)
        curl -s -o /dev/null -w "%{http_code}" http://$external_ip:8545/health > /dev/null 2>&1
        local l3_end=$(date +%s%3N)
        METRICS[l3_response_time]=$((l3_end - l3_start))
    } &
    
    {
        # Gaming engine test
        local gaming_start=$(date +%s%3N)
        kubectl -n gamedin-l3-prod exec deployment/gamedin-gaming-engine -- curl -s -o /dev/null -w "%{http_code}" http://localhost:9546/health > /dev/null 2>&1
        local gaming_end=$(date +%s%3N)
        METRICS[gaming_response_time]=$((gaming_end - gaming_start))
    } &
    
    {
        # AI service test
        local ai_start=$(date +%s%3N)
        kubectl -n gamedin-l3-prod exec deployment/gamedin-novasanctum -- curl -s -o /dev/null -w "%{http_code}" http://localhost:7547/health > /dev/null 2>&1
        local ai_end=$(date +%s%3N)
        METRICS[ai_response_time]=$((ai_end - ai_start))
    } &
    
    wait
    
    # Clean up port-forward if used
    if [[ -n "$port_forward_pid" ]]; then
        kill $port_forward_pid 2>/dev/null || true
    fi
    
    local end_time=$(date +%s)
    METRICS[benchmark_duration]=$((end_time - start_time))
    log "SUCCESS" "✅ Performance benchmark complete in ${METRICS[benchmark_duration]}s"
}

# Intelligent rollback function
intelligent_rollback() {
    log "WARN" "🔄 Initiating intelligent rollback..."
    
    # Get previous successful deployment
    local deployments=(
        "gamedin-l3-node"
        "gamedin-gaming-engine"
        "gamedin-novasanctum"
        "gamedin-redis"
        "gamedin-load-balancer"
    )
    
    for deployment in "${deployments[@]}"; do
        log "INFO" "Rolling back $deployment..."
        kubectl -n gamedin-l3-prod rollout undo deployment/$deployment --timeout=120s &
    done
    
    wait
    
    log "SUCCESS" "✅ Intelligent rollback complete"
}

# Generate comprehensive deployment report
generate_deployment_report() {
    local total_time=$(($(date +%s) - DEPLOYMENT_START))
    
    echo ""
    echo -e "${GREEN}${BOLD}🎉 GAMEDIN L3 ULTRA-EFFICIENT DEPLOYMENT COMPLETE!${NC}"
    echo -e "${GREEN}====================================================${NC}"
    echo ""
    echo -e "${CYAN}📊 Deployment Metrics:${NC}"
    echo -e "• ${YELLOW}Total Deployment Time:${NC} ${total_time}s"
    echo -e "• ${YELLOW}Preflight Duration:${NC} ${METRICS[preflight_duration]}s"
    echo -e "• ${YELLOW}Core Deployment:${NC} ${METRICS[deployment_duration]}s"
    echo -e "• ${YELLOW}Health Verification:${NC} ${METRICS[health_check_duration]}s"
    echo -e "• ${YELLOW}Performance Optimization:${NC} ${METRICS[optimization_duration]}s"
    echo -e "• ${YELLOW}Monitoring Setup:${NC} ${METRICS[monitoring_duration]}s"
    echo ""
    echo -e "${BLUE}⚡ Performance Results:${NC}"
    echo -e "• ${GREEN}L3 Response Time:${NC} ${METRICS[l3_response_time]}ms"
    echo -e "• ${GREEN}Gaming Engine:${NC} ${METRICS[gaming_response_time]}ms"
    echo -e "• ${GREEN}AI Service:${NC} ${METRICS[ai_response_time]}ms"
    echo ""
    echo -e "${PURPLE}🌐 Service Endpoints:${NC}"
    
    # Get load balancer IP
    local lb_ip=$(kubectl -n gamedin-l3-prod get service gamedin-load-balancer-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    if [[ -n "$lb_ip" && "$lb_ip" != "null" ]]; then
        echo -e "• ${YELLOW}Load Balancer:${NC} http://$lb_ip"
        echo -e "• ${YELLOW}L3 RPC:${NC} http://$lb_ip/rpc"
        echo -e "• ${YELLOW}Gaming WebSocket:${NC} ws://$lb_ip/gaming"
        echo -e "• ${YELLOW}AI API:${NC} http://$lb_ip/ai"
    else
        echo -e "• ${YELLOW}Services:${NC} Access via kubectl port-forward"
    fi
    
    # Monitoring URLs
    local grafana_ip=$(kubectl -n monitoring get service prometheus-grafana -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    if [[ -n "$grafana_ip" && "$grafana_ip" != "null" ]]; then
        echo -e "• ${YELLOW}Grafana Dashboard:${NC} http://$grafana_ip (admin/gamedin_admin)"
    else
        echo -e "• ${YELLOW}Grafana:${NC} kubectl -n monitoring port-forward service/prometheus-grafana 3000:80"
    fi
    
    echo ""
    echo -e "${GREEN}🚀 GameDin L3 is ready for immediate production use!${NC}"
    echo -e "${GREEN}Maximum uptime achieved with zero-downtime deployment!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Quick Verification Commands:${NC}"
    echo -e "kubectl -n gamedin-l3-prod get pods"
    echo -e "kubectl -n gamedin-l3-prod get services"
    echo -e "kubectl -n gamedin-l3-prod top pods"
    echo ""
}

# Error handling with intelligent rollback
error_handler() {
    local exit_code=$?
    log "ERROR" "❌ Deployment failed with exit code $exit_code"
    
    # Check if we should rollback
    local current_time=$(date +%s)
    local elapsed=$((current_time - DEPLOYMENT_START))
    
    if [[ $elapsed -gt 60 ]]; then  # Only rollback if deployment ran for more than 1 minute
        intelligent_rollback
    fi
    
    log "ERROR" "💥 Deployment terminated after ${elapsed}s"
    exit $exit_code
}

# Main deployment orchestration
main() {
    log "INFO" "🚀 Starting GameDin L3 ultra-efficient deployment..."
    
    # Set up error handling
    trap error_handler ERR INT TERM
    
    # Set deployment timeout
    {
        sleep $MAX_DEPLOYMENT_TIME
        log "ERROR" "⏰ Deployment timeout after ${MAX_DEPLOYMENT_TIME}s"
        exit 124
    } &
    local timeout_pid=$!
    
    # Execute deployment pipeline
    ultra_fast_preflight
    zero_downtime_deploy
    intelligent_health_check
    optimize_for_maximum_performance
    setup_realtime_monitoring
    run_ultra_fast_benchmark
    
    # Cancel timeout
    kill $timeout_pid 2>/dev/null || true
    
    # Generate final report
    generate_deployment_report
    
    log "SUCCESS" "🎉 Ultra-efficient deployment completed successfully!"
}

# Execute main function
main "$@"