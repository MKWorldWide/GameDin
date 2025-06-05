#!/bin/bash
set -e

# Configuration
STACK_NAME="gamedin-infrastructure"
ENVIRONMENT=${1:-production}
REGION=${AWS_REGION:-us-east-1}
ALERT_EMAIL=${2:-alerts@gamedin.com}
DOMAIN=${3:-gamedin.com}

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    error "Invalid environment. Must be development, staging, or production"
fi

# Validate AWS credentials
log "Validating AWS credentials..."
aws sts get-caller-identity > /dev/null || error "Invalid AWS credentials"

# Create S3 bucket for CloudFormation template
BUCKET_NAME="gamedin-cfn-templates-${ENVIRONMENT}"
log "Creating S3 bucket for CloudFormation templates..."
aws s3api create-bucket \
    --bucket "$BUCKET_NAME" \
    --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION" || true

# Enable bucket encryption
log "Enabling S3 bucket encryption..."
aws s3api put-bucket-encryption \
    --bucket "$BUCKET_NAME" \
    --server-side-encryption-configuration '{
        "Rules": [
            {
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }
        ]
    }'

# Enable bucket versioning
log "Enabling S3 bucket versioning..."
aws s3api put-bucket-versioning \
    --bucket "$BUCKET_NAME" \
    --versioning-configuration Status=Enabled

# Upload CloudFormation template
log "Uploading CloudFormation template..."
aws s3 cp config/cloudformation.gen2.yml "s3://${BUCKET_NAME}/infrastructure.yml"

# Create CloudWatch Dashboard
log "Creating CloudWatch dashboard..."
aws cloudwatch put-dashboard \
    --dashboard-name "GameDin-${ENVIRONMENT}" \
    --dashboard-body "$(cat config/cloudwatch-dashboard.json)"

# Deploy CloudFormation stack
log "Deploying CloudFormation stack..."
aws cloudformation deploy \
    --template-url "https://${BUCKET_NAME}.s3.amazonaws.com/infrastructure.yml" \
    --stack-name "$STACK_NAME-${ENVIRONMENT}" \
    --parameter-overrides \
        Environment="$ENVIRONMENT" \
        AlertEmail="$ALERT_EMAIL" \
        DomainName="$DOMAIN" \
    --capabilities CAPABILITY_NAMED_IAM \
    --region "$REGION"

# Enable AWS Shield Advanced if in production
if [ "$ENVIRONMENT" = "production" ]; then
    log "Enabling AWS Shield Advanced..."
    aws shield subscribe || warn "AWS Shield Advanced subscription failed"
fi

# Enable GuardDuty
log "Configuring GuardDuty..."
aws guardduty create-detector \
    --enable \
    --finding-publishing-frequency FIFTEEN_MINUTES \
    --data-sources '{"S3Logs":{"Enable":true},"Kubernetes":{"AuditLogs":{"Enable":true}},"MalwareProtection":{"ScanEc2InstanceWithFindings":{"EbsVolumes":true}}}' \
    --region "$REGION" || true

# Enable Security Hub
log "Configuring Security Hub..."
aws securityhub enable-security-hub \
    --enable-default-standards \
    --control-finding-generator SECURITY_CONTROL \
    --region "$REGION" || true

# Get stack outputs
log "Getting stack outputs..."
OUTPUTS=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME-${ENVIRONMENT}" \
    --query 'Stacks[0].Outputs' \
    --output json \
    --region "$REGION")

# Extract values from outputs
REDIS_ENDPOINT=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="RedisEndpoint") | .OutputValue')
CLOUDFRONT_DOMAIN=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="CloudFrontDomain") | .OutputValue')
ALERT_TOPIC_ARN=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="AlertTopicARN") | .OutputValue')
CERTIFICATE_ARN=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="CertificateARN") | .OutputValue')

# Create Amplify Gen2 app
log "Creating Amplify Gen2 app..."
AMPLIFY_APP=$(aws amplify create-app \
    --name "GameDin-${ENVIRONMENT}" \
    --repository "https://github.com/yourusername/gamedin" \
    --platform WEB \
    --custom-rules '[{"source": "/<*>","target": "/index.html","status": "404-200"}]' \
    --auto-branch-creation-config '{
        "EnableAutoBranchCreation": true,
        "EnableAutoBuild": true,
        "EnablePullRequestPreview": true
    }' \
    --environment-variables "{
        \"REDIS_URL\":\"${REDIS_ENDPOINT}\",
        \"CLOUDFRONT_DOMAIN\":\"${CLOUDFRONT_DOMAIN}\",
        \"ALERT_TOPIC_ARN\":\"${ALERT_TOPIC_ARN}\",
        \"ENVIRONMENT\":\"${ENVIRONMENT}\"
    }" \
    --custom-headers "$(cat config/custom-headers.json)" \
    --region "$REGION")

AMPLIFY_APP_ID=$(echo "$AMPLIFY_APP" | jq -r '.app.appId')

# Create branch
log "Creating branch..."
aws amplify create-branch \
    --app-id "$AMPLIFY_APP_ID" \
    --branch-name "$ENVIRONMENT" \
    --framework "Vite" \
    --stage "$ENVIRONMENT" \
    --enable-auto-build \
    --region "$REGION"

# Associate custom domain
log "Associating custom domain..."
aws amplify create-domain-association \
    --app-id "$AMPLIFY_APP_ID" \
    --domain-name "$DOMAIN" \
    --sub-domain-settings "[{\"prefix\":\"\",\"branchName\":\"$ENVIRONMENT\"}]" \
    --region "$REGION"

# Validate infrastructure
log "Validating infrastructure..."

# Test Redis connection
log "Testing Redis connection..."
nc -zv "$REDIS_ENDPOINT" 6379 || warn "Unable to connect to Redis"

# Test CloudFront distribution
log "Testing CloudFront distribution..."
curl -I "https://${CLOUDFRONT_DOMAIN}" || warn "Unable to reach CloudFront distribution"

# Test WAF rules
log "Testing WAF rules..."
aws wafv2 get-web-acl \
    --name "gamedin-web-acl-${ENVIRONMENT}" \
    --scope CLOUDFRONT \
    --region "$REGION" > /dev/null || warn "WAF rules not properly configured"

# Final status report
log "Infrastructure deployment complete!"
echo -e "\nStack Outputs:"
echo "$OUTPUTS" | jq '.'

log "Amplify Gen2 App Details:"
echo "App ID: $AMPLIFY_APP_ID"
echo "Domain: https://${DOMAIN}"
echo "CloudFront: https://${CLOUDFRONT_DOMAIN}"

log "Next steps:"
echo "1. Configure your application to use the new Redis endpoint: $REDIS_ENDPOINT"
echo "2. Update your DNS records to point to the CloudFront distribution"
echo "3. Monitor the CloudWatch dashboard: GameDin-${ENVIRONMENT}"
echo "4. Check GuardDuty and Security Hub for security findings"
echo "5. Set up your CI/CD pipeline in the Amplify Console" 