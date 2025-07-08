# GameDin Quantum Layer Security Implementation

## Overview

This security implementation provides production-grade secrets management, access controls, and security policies for the GameDin quantum computing infrastructure.

## Security Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AWS Secrets   │    │   Kubernetes    │    │   Application   │
│   Manager       │◄──►│   RBAC          │◄──►│   Pods          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   IAM Roles     │    │   Network       │    │   Pod Security  │
│   & Policies    │    │   Policies      │    │   Policies      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Components

### 1. AWS Secrets Manager
- **Purpose**: Centralized secrets storage and management
- **Features**:
  - Encrypted at rest with AWS KMS
  - Automatic secret rotation
  - Fine-grained access control
  - Audit logging and compliance

### 2. Kubernetes RBAC
- **Purpose**: Role-based access control within the cluster
- **Features**:
  - Service accounts with minimal privileges
  - Role-based permissions
  - Namespace isolation
  - Audit trail

### 3. Network Policies
- **Purpose**: Network-level security and isolation
- **Features**:
  - Pod-to-pod communication control
  - Ingress/egress traffic filtering
  - Namespace isolation
  - Port-level restrictions

### 4. Pod Security Policies
- **Purpose**: Container runtime security
- **Features**:
  - Non-root user execution
  - Read-only root filesystem
  - Dropped capabilities
  - Security context enforcement

## Quick Start

### Prerequisites
- AWS CLI configured with appropriate permissions
- Kubernetes cluster with RBAC enabled
- kubectl access to the cluster

### Deployment

#### Option 1: PowerShell (Windows)
```powershell
# Setup AWS Secrets Manager
.\security\setup-aws-secrets-manager.ps1

# Apply Kubernetes security policies
kubectl apply -f security/aws-secrets-manager-setup.yaml

# Install External Secrets Operator
helm install external-secrets external-secrets/external-secrets

# Apply external secrets configuration
kubectl apply -f external-secrets-config.yaml
```

#### Option 2: Bash (Linux/macOS)
```bash
# Setup AWS Secrets Manager
bash security/setup-aws-secrets-manager.sh

# Apply Kubernetes security policies
kubectl apply -f security/aws-secrets-manager-setup.yaml

# Install External Secrets Operator
helm install external-secrets external-secrets/external-secrets

# Apply external secrets configuration
kubectl apply -f external-secrets-config.yaml
```

## Secrets Management

### AWS Secrets Manager Setup

The setup script creates the following secrets:

1. **gamedin-quantum-api-keys**
   - IBM_QUANTUM_API_KEY
   - GOOGLE_QUANTUM_API_KEY
   - MICROSOFT_QUANTUM_API_KEY
   - AWS_BRAKET_API_KEY
   - MIT_QUANTUM_API_KEY
   - CALTECH_QUANTUM_API_KEY

2. **gamedin-blockchain-secrets**
   - NOVASANCTUM_API_KEY
   - BLOCKCHAIN_PRIVATE_KEY

3. **gamedin-aws-credentials**
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY

### Secret Rotation

#### Automatic Rotation
```bash
# Run rotation script
./rotate-secrets.sh

# Or PowerShell
.\rotate-secrets.ps1
```

#### Manual Rotation
```bash
# Update specific secret
aws secretsmanager update-secret \
    --secret-id gamedin-quantum-api-keys \
    --secret-string '{"IBM_QUANTUM_API_KEY": "new-key-value"}' \
    --region us-east-1
```

### External Secrets Operator

The External Secrets Operator automatically syncs secrets from AWS Secrets Manager to Kubernetes:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: gamedin-quantum-secrets
  namespace: gamedin-l3
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: gamedin-quantum-secrets
    type: Opaque
  data:
  - secretKey: IBM_QUANTUM_API_KEY
    remoteRef:
      key: gamedin-quantum-api-keys
      property: IBM_QUANTUM_API_KEY
```

## Access Control

### IAM Roles and Policies

#### Service Account Role
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: gamedin-secrets-access
  namespace: gamedin-l3
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::869935067006:role/gamedin-secrets-manager-role
```

#### IAM Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": [
        "arn:aws:secretsmanager:us-east-1:869935067006:secret:gamedin-*"
      ]
    }
  ]
}
```

### Kubernetes RBAC

#### Role Definition
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: secrets-reader
  namespace: gamedin-l3
rules:
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get", "list", "watch"]
  resourceNames:
    - "gamedin-quantum-secrets"
    - "gamedin-blockchain-secrets"
```

#### Role Binding
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: gamedin-secrets-reader-binding
  namespace: gamedin-l3
subjects:
- kind: ServiceAccount
  name: gamedin-secrets-access
  namespace: gamedin-l3
roleRef:
  kind: Role
  name: secrets-reader
  apiGroup: rbac.authorization.k8s.io
```

## Network Security

### Network Policies

#### Pod-to-Pod Communication
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: secrets-access-policy
  namespace: gamedin-l3
spec:
  podSelector:
    matchLabels:
      app: quantum-computing
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: gamedin-l3
    ports:
    - protocol: TCP
      port: 9090
```

### Pod Security Policies

#### Security Context
```yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: gamedin-quantum-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
  - ALL
  runAsUser:
    rule: 'MustRunAsNonRoot'
  readOnlyRootFilesystem: true
```

## Security Monitoring

### Security Audit

Run the security audit script to verify configuration:

```bash
# Bash
./security-audit.sh

# PowerShell
.\security-audit.ps1
```

The audit checks:
- IAM roles and policies
- Secrets Manager access
- Kubernetes RBAC configuration
- Network policies
- Pod security policies

### Compliance Monitoring

#### AWS Config Rules
```bash
# Enable AWS Config for compliance monitoring
aws configservice put-configuration-recorder \
    --configuration-recorder name=default,roleARN=arn:aws:iam::869935067006:role/ConfigRole

# Create compliance rules
aws configservice put-config-rule \
    --config-rule file://config-rules/secrets-manager-encryption.yaml
```

#### Kubernetes Audit Logging
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: audit-policy
  namespace: kube-system
data:
  audit-policy.yaml: |
    apiVersion: audit.k8s.io/v1
    kind: Policy
    rules:
    - level: RequestResponse
      resources:
      - group: ""
        resources: ["secrets"]
```

## Best Practices

### 1. Secret Management
- Never store secrets in version control
- Use AWS Secrets Manager for all sensitive data
- Implement automatic secret rotation
- Use least-privilege access principles

### 2. Access Control
- Use service accounts instead of user accounts
- Implement namespace isolation
- Use RBAC for fine-grained permissions
- Regular access reviews and audits

### 3. Network Security
- Implement network policies for pod isolation
- Use encrypted communication (TLS)
- Restrict external access
- Monitor network traffic

### 4. Container Security
- Run containers as non-root users
- Use read-only root filesystems
- Drop unnecessary capabilities
- Scan images for vulnerabilities

### 5. Monitoring and Logging
- Enable comprehensive audit logging
- Monitor access patterns
- Set up alerts for suspicious activity
- Regular security assessments

## Troubleshooting

### Common Issues

#### 1. Secrets Not Syncing
```bash
# Check External Secrets Operator status
kubectl get externalsecrets -n gamedin-l3
kubectl describe externalsecret gamedin-quantum-secrets -n gamedin-l3

# Check AWS credentials
kubectl get serviceaccount gamedin-secrets-access -n gamedin-l3 -o yaml
```

#### 2. Permission Denied
```bash
# Check IAM role permissions
aws iam get-role --role-name gamedin-secrets-manager-role
aws iam list-attached-role-policies --role-name gamedin-secrets-manager-role

# Check Kubernetes RBAC
kubectl auth can-i get secrets --as=system:serviceaccount:gamedin-l3:gamedin-secrets-access
```

#### 3. Network Policy Issues
```bash
# Check network policies
kubectl get networkpolicy -n gamedin-l3
kubectl describe networkpolicy secrets-access-policy -n gamedin-l3

# Test connectivity
kubectl exec -it deployment/quantum-computing -n gamedin-l3 -- curl http://other-service:8080
```

### Security Incident Response

#### 1. Secret Compromise
```bash
# Immediately rotate compromised secrets
./rotate-secrets.sh

# Revoke access
aws iam detach-role-policy --role-name gamedin-secrets-manager-role --policy-arn arn:aws:iam::869935067006:policy/gamedin-secrets-manager-policy

# Investigate access logs
aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=GetSecretValue
```

#### 2. Unauthorized Access
```bash
# Check recent access
kubectl get events --sort-by='.lastTimestamp' -n gamedin-l3

# Review audit logs
kubectl logs -f deployment/external-secrets-operator -n external-secrets

# Block suspicious IPs
kubectl patch networkpolicy secrets-access-policy -n gamedin-l3 --type='merge' -p='{"spec":{"ingress":[{"from":[{"ipBlock":{"cidr":"10.0.0.0/8"}}]}]}}'
```

## Maintenance

### Regular Tasks

#### 1. Secret Rotation
```bash
# Schedule monthly rotation
crontab -e
# Add: 0 2 1 * * /path/to/rotate-secrets.sh
```

#### 2. Access Reviews
```bash
# Review IAM roles quarterly
aws iam get-role --role-name gamedin-secrets-manager-role
aws iam list-attached-role-policies --role-name gamedin-secrets-manager-role

# Review Kubernetes RBAC
kubectl get rolebinding -n gamedin-l3
kubectl get clusterrolebinding | grep gamedin
```

#### 3. Security Updates
```bash
# Update External Secrets Operator
helm upgrade external-secrets external-secrets/external-secrets

# Update security policies
kubectl apply -f security/aws-secrets-manager-setup.yaml
```

## Integration with GameDin

### Application Integration

#### 1. Environment Variables
```yaml
env:
- name: IBM_QUANTUM_API_KEY
  valueFrom:
    secretKeyRef:
      name: gamedin-quantum-secrets
      key: IBM_QUANTUM_API_KEY
```

#### 2. Volume Mounts
```yaml
volumeMounts:
- name: secrets-volume
  mountPath: /etc/secrets
  readOnly: true
volumes:
- name: secrets-volume
  secret:
    secretName: gamedin-quantum-secrets
```

### Security Validation

#### 1. Pre-deployment Checks
```bash
# Run security scan
./security-audit.sh

# Validate secrets
kubectl get secrets -n gamedin-l3
kubectl describe secret gamedin-quantum-secrets -n gamedin-l3
```

#### 2. Post-deployment Validation
```bash
# Test secret access
kubectl exec -it deployment/quantum-computing -n gamedin-l3 -- env | grep QUANTUM

# Verify network policies
kubectl exec -it deployment/quantum-computing -n gamedin-l3 -- curl http://monitoring-service:9090
```

## Support

For security issues and questions:

1. Check the troubleshooting section above
2. Review AWS CloudTrail logs
3. Check Kubernetes audit logs
4. Run security audit script
5. Contact security team

## Contributing

To contribute to security improvements:

1. Follow security best practices
2. Test changes in development environment
3. Update documentation
4. Submit security review request
5. Include security testing results

---

**Last Updated**: December 19, 2024  
**Version**: 1.0.0  
**Security Level**: Production  
**Maintainer**: GameDin Security Team 