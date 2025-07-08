# GameDin Quantum Layer Monitoring Stack Deployment Script (PowerShell)
# Deploys Prometheus, Grafana, AlertManager, and Node Exporter

param(
    [switch]$SkipSecrets,
    [switch]$DryRun
)

Write-Host "🚀 Deploying GameDin Quantum Layer Monitoring Stack..." -ForegroundColor Blue

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
    $kubectlVersion = kubectl version --client --short 2>$null
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

# Step 1: Create monitoring namespace
Write-Status "Creating monitoring namespace..."
if (-not $DryRun) {
    kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
}

# Step 2: Generate and apply secrets
if (-not $SkipSecrets) {
    Write-Status "Generating monitoring secrets..."
    if (-not (Test-Path "monitoring/grafana-secrets.yaml")) {
        Write-Warning "Grafana secrets not found, generating new ones..."
        if (-not $DryRun) {
            & bash monitoring/create-monitoring-secrets.sh
        }
    }

    Write-Status "Applying monitoring secrets..."
    if (-not $DryRun) {
        kubectl apply -f monitoring/grafana-secrets.yaml
        kubectl apply -f monitoring/alertmanager-secrets.yaml
    }
}

# Step 3: Deploy monitoring stack
Write-Status "Deploying Prometheus and Grafana stack..."
if (-not $DryRun) {
    kubectl apply -f monitoring/prometheus-grafana-stack.yaml
}

# Step 4: Wait for deployments to be ready
if (-not $DryRun) {
    Write-Status "Waiting for monitoring stack to be ready..."

    # Wait for Prometheus
    Write-Status "Waiting for Prometheus deployment..."
    kubectl wait --for=condition=available --timeout=300s deployment/prometheus -n monitoring

    # Wait for Grafana
    Write-Status "Waiting for Grafana deployment..."
    kubectl wait --for=condition=available --timeout=300s deployment/grafana -n monitoring

    # Wait for AlertManager
    Write-Status "Waiting for AlertManager deployment..."
    kubectl wait --for=condition=available --timeout=300s deployment/alertmanager -n monitoring

    # Wait for Node Exporter
    Write-Status "Waiting for Node Exporter DaemonSet..."
    kubectl wait --for=condition=available --timeout=300s daemonset/node-exporter -n monitoring

    # Step 5: Verify services are running
    Write-Status "Verifying monitoring services..."

    # Check Prometheus
    $prometheusPods = kubectl get pods -n monitoring -l app=prometheus --no-headers 2>$null
    if ($prometheusPods -match "Running") {
        Write-Success "Prometheus is running"
    } else {
        Write-Error "Prometheus is not running"
        kubectl get pods -n monitoring -l app=prometheus
    }

    # Check Grafana
    $grafanaPods = kubectl get pods -n monitoring -l app=grafana --no-headers 2>$null
    if ($grafanaPods -match "Running") {
        Write-Success "Grafana is running"
    } else {
        Write-Error "Grafana is not running"
        kubectl get pods -n monitoring -l app=grafana
    }

    # Check AlertManager
    $alertmanagerPods = kubectl get pods -n monitoring -l app=alertmanager --no-headers 2>$null
    if ($alertmanagerPods -match "Running") {
        Write-Success "AlertManager is running"
    } else {
        Write-Error "AlertManager is not running"
        kubectl get pods -n monitoring -l app=alertmanager
    }

    # Check Node Exporter
    $nodeExporterPods = kubectl get pods -n monitoring -l app=node-exporter --no-headers 2>$null
    if ($nodeExporterPods -match "Running") {
        Write-Success "Node Exporter is running"
    } else {
        Write-Error "Node Exporter is not running"
        kubectl get pods -n monitoring -l app=node-exporter
    }
}

# Step 6: Display deployment summary
Write-Host ""
Write-Success "🎉 Monitoring stack deployment completed!"
Write-Host ""
Write-Host "📊 Monitoring Dashboard URLs:" -ForegroundColor Cyan
Write-Host "  Grafana:     https://monitoring.gamedin.com" -ForegroundColor White
Write-Host "  Prometheus:  https://prometheus.gamedin.com" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Service Details:" -ForegroundColor Cyan
Write-Host "  Namespace:   monitoring" -ForegroundColor White
Write-Host "  Prometheus:  prometheus:9090" -ForegroundColor White
Write-Host "  Grafana:     grafana:3000" -ForegroundColor White
Write-Host "  AlertManager: alertmanager:9093" -ForegroundColor White
Write-Host "  Node Exporter: node-exporter:9100" -ForegroundColor White
Write-Host ""
Write-Host "📋 Useful Commands:" -ForegroundColor Cyan
Write-Host "  kubectl get pods -n monitoring" -ForegroundColor White
Write-Host "  kubectl logs -f deployment/prometheus -n monitoring" -ForegroundColor White
Write-Host "  kubectl logs -f deployment/grafana -n monitoring" -ForegroundColor White
Write-Host "  kubectl port-forward svc/grafana 3000:3000 -n monitoring" -ForegroundColor White
Write-Host "  kubectl port-forward svc/prometheus 9090:9090 -n monitoring" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Configure DNS for monitoring.gamedin.com and prometheus.gamedin.com" -ForegroundColor White
Write-Host "  2. Set up SSL certificates for monitoring domains" -ForegroundColor White
Write-Host "  3. Configure Grafana data sources (Prometheus)" -ForegroundColor White
Write-Host "  4. Import GameDin Quantum Computing dashboard" -ForegroundColor White
Write-Host "  5. Set up alerting notifications" -ForegroundColor White
Write-Host ""
Write-Success "Monitoring stack is ready for GameDin quantum operations! 🚀" 