# GameDin Quantum Layer - Helm Chart

## Overview

The GameDin Quantum Layer Helm chart provides a comprehensive deployment solution for quantum computing infrastructure in gaming applications. This chart includes quantum entanglement synchronization, AI decision trees, quantum random number generation, game optimization, and blockchain integration.

## Features

- **Quantum Computing Integration**: IBM Quantum backend support with configurable devices
- **AI Services**: Nova Sanctum and Quantum AI model integration
- **Blockchain Integration**: Smart contract deployment and management
- **Auto-scaling**: Horizontal and Vertical Pod Autoscalers for optimal performance
- **Security**: RBAC, Network Policies, and Pod Security Policies
- **Monitoring**: Prometheus, Grafana, and AlertManager integration
- **High Availability**: Pod Disruption Budgets and multi-replica deployments

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- AWS EKS cluster (for AWS-specific features)
- IBM Quantum API access (for quantum computing features)

## Installation

### Add the Helm Repository

```bash
helm repo add gamedin https://charts.gamedin.com
helm repo update
```

### Install the Chart

```bash
# Basic installation
helm install gamedin-quantum gamedin/gamedin-quantum

# Installation with custom values
helm install gamedin-quantum gamedin/gamedin-quantum \
  --values custom-values.yaml \
  --namespace gamedin-quantum \
  --create-namespace
```

### Upgrade the Chart

```bash
helm upgrade gamedin-quantum gamedin/gamedin-quantum \
  --values custom-values.yaml \
  --namespace gamedin-quantum
```

## Configuration

### Global Configuration

```yaml
global:
  environment: production
  clusterName: gamedin-l3-cluster
  region: us-east-1
  domain: quantum.gamedin.xyz
  imageRegistry: public.ecr.aws/gamedin-l3
```

### Quantum Layer Configuration

```yaml
quantumLayer:
  enabled: true
  replicaCount: 3
  
  image:
    repository: quantum-layer
    tag: "4.3.2"
    
  resources:
    requests:
      cpu: 500m
      memory: 1Gi
    limits:
      cpu: 2000m
      memory: 4Gi
      
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 20
    targetCPUUtilizationPercentage: 70
    targetMemoryUtilizationPercentage: 80
```

### Quantum Tasks Configuration

```yaml
quantumTasks:
  enabled: true
  replicaCount: 5
  
  taskTypes:
    entanglement_sync:
      enabled: true
      maxConcurrent: 100
      timeout: 30s
    ai_decision_tree:
      enabled: true
      maxConcurrent: 50
      timeout: 60s
    quantum_random:
      enabled: true
      maxConcurrent: 200
      timeout: 10s
    game_optimization:
      enabled: true
      maxConcurrent: 20
      timeout: 300s
```

### Blockchain Configuration

```yaml
blockchain:
  enabled: true
  replicaCount: 3
  
  network:
    chainId: 1337
    gasLimit: 8000000
    gasPrice: 20000000000
    
  contracts:
    gameToken:
      address: "0x..."
    quantumOracle:
      address: "0x..."
    gameRegistry:
      address: "0x..."
```

### AI Service Configuration

```yaml
aiService:
  enabled: true
  replicaCount: 3
  
  models:
    novaSanctum:
      enabled: true
      modelPath: /models/nova-sanctum
      maxConcurrent: 10
    quantumAI:
      enabled: true
      modelPath: /models/quantum-ai
      maxConcurrent: 5
```

### Monitoring Configuration

```yaml
monitoring:
  enabled: true
  
  prometheus:
    enabled: true
    prometheusSpec:
      retention: 30d
      storageSpec:
        volumeClaimTemplate:
          spec:
            storageClassName: gp3
            accessModes: ["ReadWriteOnce"]
            resources:
              requests:
                storage: 50Gi
                
  grafana:
    enabled: true
    adminPassword: ""
    persistence:
      enabled: true
      size: 10Gi
      storageClassName: gp3
```

### Security Configuration

```yaml
security:
  networkPolicies:
    enabled: true
    
  podSecurityPolicies:
    enabled: true
    
  rbac:
    enabled: true
    create: true
    
  externalSecrets:
    enabled: true
    aws:
      region: us-east-1
      roleArn: ""
```

### AWS Configuration

```yaml
aws:
  loadBalancerController:
    enabled: true
    clusterName: gamedin-l3-cluster
    region: us-east-1
    
  clusterAutoscaler:
    enabled: true
    clusterName: gamedin-l3-cluster
    region: us-east-1
    
  certManager:
    enabled: true
    installCRDs: true
```

## Usage

### Accessing the Quantum Layer

```bash
# Get the service URL
kubectl get svc -n gamedin-quantum

# Port forward to access locally
kubectl port-forward svc/gamedin-quantum-quantum-layer 8080:8080 -n gamedin-quantum
```

### Submitting Quantum Tasks

```bash
# Submit an entanglement synchronization task
curl -X POST http://localhost:8080/api/v1/tasks/entanglement-sync \
  -H "Content-Type: application/json" \
  -d '{
    "gameId": "game-123",
    "players": ["player1", "player2"],
    "entanglementType": "bell-state"
  }'

# Submit an AI decision tree task
curl -X POST http://localhost:8080/api/v1/tasks/ai-decision-tree \
  -H "Content-Type: application/json" \
  -d '{
    "gameState": {...},
    "playerActions": [...],
    "model": "nova-sanctum"
  }'
```

### Monitoring and Observability

```bash
# Access Grafana dashboard
kubectl port-forward svc/gamedin-quantum-grafana 3000:80 -n gamedin-quantum

# Access Prometheus
kubectl port-forward svc/gamedin-quantum-prometheus-server 9090:9090 -n gamedin-quantum
```

## API Endpoints

### Quantum Layer API

- `GET /health` - Health check endpoint
- `GET /ready` - Readiness check endpoint
- `GET /metrics` - Prometheus metrics endpoint
- `POST /api/v1/tasks/{taskType}` - Submit quantum tasks
- `GET /api/v1/tasks/{taskId}` - Get task status
- `GET /api/v1/tasks` - List all tasks

### Blockchain API

- `POST /api/v1/blockchain/deploy` - Deploy smart contracts
- `GET /api/v1/blockchain/contracts` - List deployed contracts
- `POST /api/v1/blockchain/transactions` - Submit transactions

### AI Service API

- `POST /api/v1/ai/predict` - Get AI predictions
- `POST /api/v1/ai/train` - Train AI models
- `GET /api/v1/ai/models` - List available models

## Troubleshooting

### Common Issues

1. **Pods not starting**: Check resource limits and requests
2. **Quantum API errors**: Verify IBM Quantum API key and backend URL
3. **Blockchain connection issues**: Check smart contract addresses and network configuration
4. **Auto-scaling not working**: Verify HPA and VPA configurations

### Debug Commands

```bash
# Check pod status
kubectl get pods -n gamedin-quantum

# Check pod logs
kubectl logs -f deployment/gamedin-quantum-quantum-layer -n gamedin-quantum

# Check events
kubectl get events -n gamedin-quantum --sort-by='.lastTimestamp'

# Check resource usage
kubectl top pods -n gamedin-quantum
```

## Security Considerations

- All sensitive data is stored in Kubernetes Secrets
- Network policies restrict pod-to-pod communication
- Pod security policies enforce security best practices
- RBAC provides least-privilege access
- External secrets integration for AWS Secrets Manager

## Performance Optimization

- Horizontal Pod Autoscaler for load-based scaling
- Vertical Pod Autoscaler for resource optimization
- Pod Disruption Budget for high availability
- Resource quotas and limit ranges for resource governance
- Prometheus metrics for performance monitoring

## Backup and Recovery

```yaml
backup:
  enabled: true
  schedule: "0 2 * * *"  # Daily at 2 AM
  retention: 30d
  storage:
    type: s3
    bucket: gamedin-quantum-backups
    region: us-east-1
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Email: team@gamedin.com
- Documentation: https://docs.gamedin.com
- Issues: https://github.com/gamedin/quantum-layer/issues 