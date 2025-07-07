#!/bin/bash

set -e

echo "[INFO] Generating fake API keys for testing..."

# Generate fake API keys for testing
IBM_KEY="fake-ibm-quantum-key-$(openssl rand -hex 16)"
GOOGLE_KEY="fake-google-quantum-key-$(openssl rand -hex 16)"
MS_KEY="fake-microsoft-quantum-key-$(openssl rand -hex 16)"
AWS_KEY="fake-aws-braket-key-$(openssl rand -hex 16)"
MIT_KEY="fake-mit-quantum-key-$(openssl rand -hex 16)"
CALTECH_KEY="fake-caltech-quantum-key-$(openssl rand -hex 16)"

echo "[INFO] Fake keys generated successfully!"

# Encode each key
IBM_B64=$(echo -n "$IBM_KEY" | base64)
GOOGLE_B64=$(echo -n "$GOOGLE_KEY" | base64)
MS_B64=$(echo -n "$MS_KEY" | base64)
AWS_B64=$(echo -n "$AWS_KEY" | base64)
MIT_B64=$(echo -n "$MIT_KEY" | base64)
CALTECH_B64=$(echo -n "$CALTECH_KEY" | base64)

# Generate the YAML
cat > quantum-secrets.yaml <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: quantum-secrets
  namespace: gamedin-quantum
type: Opaque
data:
  ibm-quantum-api-key: $IBM_B64
  google-quantum-api-key: $GOOGLE_B64
  microsoft-quantum-api-key: $MS_B64
  aws-braket-api-key: $AWS_B64
  mit-quantum-api-key: $MIT_B64
  caltech-quantum-api-key: $CALTECH_B64
EOF

echo "[INFO] quantum-secrets.yaml generated with fake keys."

# Apply the secret
echo "[INFO] Applying secret to Kubernetes..."
kubectl apply -f quantum-secrets.yaml && echo "[SUCCESS] Secret applied to cluster!" || { echo "[ERROR] Failed to apply secret. Please check your kubectl context and permissions."; exit 1; }

# Re-apply deployment
echo "[INFO] Re-applying quantum-computing deployment..."
kubectl apply -f k8s/quantum-computing-deployment.yaml || { echo "[ERROR] Failed to apply deployment."; exit 1; }

# Wait for pods to be ready, or show logs if they crash
NAMESPACE=gamedin-quantum
APP_LABEL=quantum-computing
TIMEOUT=180 # seconds
SLEEP=5
ELAPSED=0

echo "[INFO] Monitoring pod status..."
while true; do
  NOT_READY=$(kubectl get pods -n $NAMESPACE -l app=$APP_LABEL -o json | jq -r '.items[] | select(.status.phase != "Running" or (.status.containerStatuses[]?.ready != true)) | .metadata.name')
  if [ -z "$NOT_READY" ]; then
    echo "[SUCCESS] All pods are running and ready!"
    break
  fi
  if [ $ELAPSED -ge $TIMEOUT ]; then
    echo "[ERROR] Timeout waiting for pods to become ready. Showing logs for failing pods:"
    for pod in $(kubectl get pods -n $NAMESPACE -l app=$APP_LABEL -o jsonpath='{.items[*].metadata.name}'); do
      STATUS=$(kubectl get pod $pod -n $NAMESPACE -o jsonpath='{.status.phase}')
      if [ "$STATUS" != "Running" ]; then
        echo -e "\n[LOGS for $pod]:"
        kubectl logs $pod -n $NAMESPACE
      fi
    done
    exit 1
  fi
  echo "[INFO] Waiting for pods to be ready... ($ELAPSED/$TIMEOUT seconds)"
  sleep $SLEEP
  ELAPSED=$((ELAPSED+SLEEP))
done

# Show logs for all pods
echo -e "\n[INFO] Showing logs for all pods:"
for pod in $(kubectl get pods -n $NAMESPACE -l app=$APP_LABEL -o jsonpath='{.items[*].metadata.name}'); do
  echo -e "\n[LOGS for $pod]:"
  kubectl logs $pod -n $NAMESPACE --tail=20
  echo "---"
done

echo "[SUCCESS] Full automation test complete!"
echo "[NOTE] This deployment uses fake API keys and will not connect to real quantum services."
echo "[INFO] To deploy with real keys, edit this script and replace the fake key generation with real key prompts." 