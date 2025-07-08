# GameDin Quantum Layer Monitoring Stack

## Overview

This monitoring stack provides comprehensive observability for the GameDin quantum computing infrastructure, including real-time metrics, alerting, and visualization capabilities.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Grafana       │    │   Prometheus    │    │  AlertManager   │
│   (Dashboard)   │◄──►│   (Metrics DB)  │◄──►│   (Alerts)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Ingress       │    │   Node Exporter │    │   Webhook       │
│   (SSL/TLS)     │    │   (Node Metrics)│    │   (Notifications)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Components

### 1. Prometheus
- **Purpose**: Time-series metrics database and collection
- **Port**: 9090
- **Features**:
  - Scrapes metrics from quantum computing pods
  - Stores historical data for 200 hours
  - Provides alerting rules evaluation
  - Kubernetes service discovery

### 2. Grafana
- **Purpose**: Metrics visualization and dashboarding
- **Port**: 3000
- **Features**:
  - Pre-configured GameDin Quantum Computing dashboard
  - Real-time metrics visualization
  - Customizable alerts and notifications
  - Multi-user support with role-based access

### 3. AlertManager
- **Purpose**: Alert routing and notification management
- **Port**: 9093
- **Features**:
  - Groups and deduplicates alerts
  - Routes alerts to appropriate receivers
  - Supports webhook, email, and Slack notifications
  - Configurable alert routing rules

### 4. Node Exporter
- **Purpose**: System and hardware metrics collection
- **Port**: 9100
- **Features**:
  - Collects node-level metrics (CPU, memory, disk, network)
  - Runs as DaemonSet on all cluster nodes
  - Provides infrastructure-level insights

## Quick Start

### Prerequisites
- Kubernetes cluster with kubectl access
- AWS EKS cluster (recommended)
- DNS domains configured for monitoring.gamedin.com and prometheus.gamedin.com

### Deployment

#### Option 1: PowerShell (Windows)
```powershell
# Deploy monitoring stack
.\monitoring\deploy-monitoring.ps1

# Dry run to see what would be deployed
.\monitoring\deploy-monitoring.ps1 -DryRun

# Skip secrets generation (if already exists)
.\monitoring\deploy-monitoring.ps1 -SkipSecrets
```

#### Option 2: Bash (Linux/macOS)
```bash
# Make scripts executable
chmod +x monitoring/deploy-monitoring.sh
chmod +x monitoring/create-monitoring-secrets.sh

# Deploy monitoring stack
./monitoring/deploy-monitoring.sh
```

#### Option 3: Manual Deployment
```bash
# 1. Create namespace
kubectl create namespace monitoring

# 2. Generate secrets
bash monitoring/create-monitoring-secrets.sh

# 3. Apply secrets
kubectl apply -f monitoring/grafana-secrets.yaml
kubectl apply -f monitoring/alertmanager-secrets.yaml

# 4. Deploy monitoring stack
kubectl apply -f monitoring/prometheus-grafana-stack.yaml

# 5. Wait for deployment
kubectl wait --for=condition=available --timeout=300s deployment/prometheus -n monitoring
kubectl wait --for=condition=available --timeout=300s deployment/grafana -n monitoring
kubectl wait --for=condition=available --timeout=300s deployment/alertmanager -n monitoring
kubectl wait --for=condition=available --timeout=300s daemonset/node-exporter -n monitoring
```

## Access URLs

After deployment, access the monitoring stack at:

- **Grafana Dashboard**: https://monitoring.gamedin.com
  - Default credentials: admin / (generated password)
- **Prometheus**: https://prometheus.gamedin.com
- **AlertManager**: http://alertmanager:9093 (internal)

## Configuration

### Grafana Configuration

#### Data Sources
1. Access Grafana at https://monitoring.gamedin.com
2. Login with admin credentials
3. Go to Configuration → Data Sources
4. Add Prometheus data source:
   - URL: `http://prometheus:9090`
   - Access: Server (default)

#### Dashboard Import
1. Go to Dashboards → Import
2. Upload the GameDin Quantum Computing dashboard JSON
3. Select Prometheus as data source
4. Import dashboard

### AlertManager Configuration

#### Webhook Notifications
Update `alertmanager-config` ConfigMap to add your webhook endpoints:

```yaml
receivers:
  - name: 'slack-notifications'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#gamedin-alerts'
  
  - name: 'email-notifications'
    email_configs:
      - to: 'alerts@gamedin.com'
        from: 'alertmanager@gamedin.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'your-email@gmail.com'
        auth_password: 'your-app-password'
```

### Prometheus Configuration

#### Custom Metrics
Add custom metrics collection by updating the `prometheus-config` ConfigMap:

```yaml
scrape_configs:
  - job_name: 'custom-metrics'
    static_configs:
      - targets: ['your-service:8080']
    metrics_path: '/metrics'
    scrape_interval: 30s
```

## Monitoring Dashboards

### GameDin Quantum Computing Dashboard

The pre-configured dashboard includes:

1. **Pod Status Panel**
   - Real-time status of quantum computing pods
   - Color-coded health indicators (green=healthy, red=down)

2. **CPU Usage Panel**
   - CPU utilization across all quantum pods
   - 5-minute rate calculations
   - Threshold alerts at 80%

3. **Memory Usage Panel**
   - Memory consumption as percentage of limits
   - Per-pod memory tracking
   - Threshold alerts at 85%

4. **Response Time Panel**
   - 95th and 50th percentile response times
   - HTTP request duration histograms
   - Performance trend analysis

5. **Request Rate Panel**
   - Requests per second across pods
   - Traffic pattern visualization
   - Load distribution analysis

6. **Error Rate Panel**
   - 4xx and 5xx error rates
   - Error trend analysis
   - Service health indicators

## Alerting Rules

### Critical Alerts
- **QuantumPodDown**: Pod is down for more than 1 minute
- **QuantumHealthCheckFailed**: Health check failed for 30 seconds
- **QuantumHighErrorRate**: Error rate exceeds 5% for 5 minutes

### Warning Alerts
- **QuantumHighCPU**: CPU usage exceeds 80% for 5 minutes
- **QuantumHighMemory**: Memory usage exceeds 85% for 5 minutes
- **QuantumHighResponseTime**: 95th percentile response time exceeds 2 seconds

## Troubleshooting

### Common Issues

#### 1. Prometheus Not Scraping Metrics
```bash
# Check Prometheus configuration
kubectl get configmap prometheus-config -n monitoring -o yaml

# Check Prometheus logs
kubectl logs -f deployment/prometheus -n monitoring

# Verify target discovery
kubectl port-forward svc/prometheus 9090:9090 -n monitoring
# Then visit http://localhost:9090/targets
```

#### 2. Grafana Cannot Connect to Prometheus
```bash
# Check if Prometheus service is running
kubectl get svc prometheus -n monitoring

# Test connectivity from Grafana pod
kubectl exec -it deployment/grafana -n monitoring -- curl http://prometheus:9090/api/v1/status/config
```

#### 3. Alerts Not Firing
```bash
# Check AlertManager configuration
kubectl get configmap alertmanager-config -n monitoring -o yaml

# Check AlertManager logs
kubectl logs -f deployment/alertmanager -n monitoring

# Verify alert rules
kubectl get configmap prometheus-rules -n monitoring -o yaml
```

#### 4. Node Exporter Not Collecting Metrics
```bash
# Check Node Exporter pods
kubectl get pods -n monitoring -l app=node-exporter

# Check Node Exporter logs
kubectl logs -f daemonset/node-exporter -n monitoring

# Verify metrics endpoint
kubectl port-forward svc/node-exporter 9100:9100 -n monitoring
# Then visit http://localhost:9100/metrics
```

### Performance Optimization

#### 1. Storage Optimization
For production deployments, consider using persistent storage:

```yaml
# Add to prometheus deployment
volumes:
- name: prometheus-storage
  persistentVolumeClaim:
    claimName: prometheus-pvc
```

#### 2. Resource Limits
Adjust resource limits based on your cluster capacity:

```yaml
resources:
  requests:
    memory: "1Gi"
    cpu: "500m"
  limits:
    memory: "4Gi"
    cpu: "2000m"
```

#### 3. Retention Policy
Modify data retention based on your needs:

```yaml
args:
  - '--storage.tsdb.retention.time=30d'  # 30 days retention
```

## Security Considerations

### 1. Access Control
- Use RBAC to restrict access to monitoring namespace
- Implement network policies to limit pod-to-pod communication
- Use service accounts with minimal required permissions

### 2. Secrets Management
- Store sensitive configuration in Kubernetes secrets
- Rotate passwords regularly
- Use external secret management (AWS Secrets Manager, HashiCorp Vault)

### 3. Network Security
- Use HTTPS for external access
- Implement proper ingress rules
- Configure firewall rules to restrict access

## Maintenance

### Regular Tasks

#### 1. Password Rotation
```bash
# Generate new passwords
bash monitoring/create-monitoring-secrets.sh

# Apply updated secrets
kubectl apply -f monitoring/grafana-secrets.yaml
kubectl apply -f monitoring/alertmanager-secrets.yaml

# Restart services to pick up new secrets
kubectl rollout restart deployment/grafana -n monitoring
kubectl rollout restart deployment/alertmanager -n monitoring
```

#### 2. Backup Configuration
```bash
# Backup all monitoring configuration
kubectl get configmap -n monitoring -o yaml > monitoring-backup.yaml
kubectl get secret -n monitoring -o yaml > secrets-backup.yaml
```

#### 3. Update Monitoring Stack
```bash
# Update to latest versions
kubectl set image deployment/prometheus prometheus=prom/prometheus:v2.45.0 -n monitoring
kubectl set image deployment/grafana grafana=grafana/grafana:10.0.0 -n monitoring
kubectl set image deployment/alertmanager alertmanager=prom/alertmanager:v0.25.0 -n monitoring
```

## Integration with GameDin

### Quantum Computing Metrics

The monitoring stack is specifically configured to collect metrics from the GameDin quantum computing service:

- **Health Checks**: `/health` endpoint monitoring
- **Performance Metrics**: Response times and throughput
- **Resource Usage**: CPU and memory consumption
- **Error Tracking**: 4xx and 5xx error rates

### Custom Metrics

To add custom quantum computing metrics:

1. Expose metrics endpoint in your quantum service
2. Add Prometheus client library to your application
3. Define custom metrics (quantum circuit execution time, entanglement fidelity, etc.)
4. Update Prometheus configuration to scrape the new metrics
5. Create custom Grafana panels for visualization

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review Prometheus and Grafana logs
3. Verify configuration files
4. Test connectivity between components
5. Check resource usage and limits

## Contributing

To contribute to the monitoring stack:

1. Update configuration files in `monitoring/`
2. Test changes in a development environment
3. Update documentation
4. Submit pull request with detailed description

---

**Last Updated**: December 19, 2024  
**Version**: 1.0.0  
**Maintainer**: GameDin DevOps Team 