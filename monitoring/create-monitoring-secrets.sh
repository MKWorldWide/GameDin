#!/bin/bash

# GameDin Quantum Layer Monitoring Secrets Creation Script
# Creates secure secrets for Prometheus, Grafana, and AlertManager

set -e

echo "🔐 Creating GameDin Quantum Layer Monitoring Secrets..."

# Generate secure passwords
GRAFANA_ADMIN_PASSWORD=$(openssl rand -base64 32)
ALERTMANAGER_WEBHOOK_SECRET=$(openssl rand -base64 32)

# Create Grafana secrets
kubectl create secret generic grafana-secrets \
  --namespace=monitoring \
  --from-literal=admin-password="$GRAFANA_ADMIN_PASSWORD" \
  --dry-run=client -o yaml > monitoring/grafana-secrets.yaml

# Create AlertManager secrets
kubectl create secret generic alertmanager-secrets \
  --namespace=monitoring \
  --from-literal=webhook-secret="$ALERTMANAGER_WEBHOOK_SECRET" \
  --dry-run=client -o yaml > monitoring/alertmanager-secrets.yaml

# Create monitoring namespace if it doesn't exist
kubectl create namespace monitoring --dry-run=client -o yaml > monitoring/namespace.yaml

echo "✅ Monitoring secrets created successfully!"
echo "📁 Generated files:"
echo "  - monitoring/grafana-secrets.yaml"
echo "  - monitoring/alertmanager-secrets.yaml"
echo "  - monitoring/namespace.yaml"
echo ""
echo "🔑 Grafana Admin Password: $GRAFANA_ADMIN_PASSWORD"
echo "🔑 AlertManager Webhook Secret: $ALERTMANAGER_WEBHOOK_SECRET"
echo ""
echo "📋 Next steps:"
echo "  1. Apply the secrets: kubectl apply -f monitoring/"
echo "  2. Deploy monitoring stack: kubectl apply -f monitoring/prometheus-grafana-stack.yaml"
echo "  3. Access Grafana at: https://monitoring.gamedin.com"
echo "  4. Access Prometheus at: https://prometheus.gamedin.com"
echo ""
echo "⚠️  IMPORTANT: Store these passwords securely and update your password manager!" 