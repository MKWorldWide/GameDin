#!/bin/bash
set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/../config/deployment-config.json"
ENVIRONMENT=${1:-development}
ACTION=${2:-deploy}

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging functions
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

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    error "jq is required but not installed. Please install jq first."
fi

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    error "Invalid environment. Must be development, staging, or production"
fi

# Validate action
if [[ ! "$ACTION" =~ ^(deploy|rollback|status|config)$ ]]; then
    error "Invalid action. Must be deploy, rollback, status, or config"
fi

# Load configuration
if [ ! -f "$CONFIG_FILE" ]; then
    error "Configuration file not found: $CONFIG_FILE"
fi

# Get environment configuration
ENV_CONFIG=$(jq -r ".environments.$ENVIRONMENT" "$CONFIG_FILE")
if [ "$ENV_CONFIG" == "null" ]; then
    error "Environment configuration not found for: $ENVIRONMENT"
fi

# Extract configuration values
BRANCH=$(echo "$ENV_CONFIG" | jq -r '.branch')
DOMAIN=$(echo "$ENV_CONFIG" | jq -r '.domain')
AUTO_BUILD=$(echo "$ENV_CONFIG" | jq -r '.autoBuild')

# Function to check deployment prerequisites
check_prerequisites() {
    log "Checking deployment prerequisites..."
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &>/dev/null; then
        error "AWS credentials not configured or invalid"
    fi
    
    # Check if branch exists
    if ! git rev-parse --verify "$BRANCH" &>/dev/null; then
        error "Branch $BRANCH does not exist"
    }
    
    # Check if working directory is clean
    if [ -n "$(git status --porcelain)" ]; then
        warn "Working directory is not clean. Uncommitted changes may not be deployed."
    fi
}

# Function to deploy
deploy() {
    log "Starting deployment to $ENVIRONMENT environment..."
    
    # Update environment variables
    log "Updating environment variables..."
    ENV_VARS=$(echo "$ENV_CONFIG" | jq -r '.environmentVariables | to_entries | map("--environment-variables " + .key + "=" + .value) | join(" ")')
    aws amplify update-app \
        --app-id "$AMPLIFY_APP_ID" \
        $ENV_VARS \
        --region "$AWS_REGION"
    
    # Start deployment job
    log "Starting Amplify deployment job..."
    JOB_ID=$(aws amplify start-job \
        --app-id "$AMPLIFY_APP_ID" \
        --branch-name "$BRANCH" \
        --job-type RELEASE \
        --query 'jobSummary.jobId' \
        --output text)
    
    # Wait for deployment to complete
    log "Waiting for deployment to complete..."
    while true; do
        STATUS=$(aws amplify get-job \
            --app-id "$AMPLIFY_APP_ID" \
            --branch-name "$BRANCH" \
            --job-id "$JOB_ID" \
            --query 'job.summary.status' \
            --output text)
        
        case "$STATUS" in
            "SUCCEED")
                log "Deployment completed successfully!"
                break
                ;;
            "FAILED")
                error "Deployment failed. Check Amplify Console for details."
                ;;
            "CANCELLED")
                error "Deployment was cancelled."
                ;;
            *)
                echo -n "."
                sleep 10
                ;;
        esac
    done
    
    # Invalidate CloudFront cache if in production
    if [ "$ENVIRONMENT" == "production" ]; then
        log "Invalidating CloudFront cache..."
        aws cloudfront create-invalidation \
            --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
            --paths "/*"
    fi
}

# Function to rollback
rollback() {
    log "Starting rollback for $ENVIRONMENT environment..."
    
    # Get previous successful deployment
    PREVIOUS_JOB=$(aws amplify list-jobs \
        --app-id "$AMPLIFY_APP_ID" \
        --branch-name "$BRANCH" \
        --filter "status=SUCCEED" \
        --max-items 2 \
        --query 'jobSummaries[1].jobId' \
        --output text)
    
    if [ -z "$PREVIOUS_JOB" ]; then
        error "No previous successful deployment found to rollback to."
    fi
    
    # Start rollback job
    log "Rolling back to previous deployment..."
    aws amplify start-job \
        --app-id "$AMPLIFY_APP_ID" \
        --branch-name "$BRANCH" \
        --job-type RETRY \
        --job-id "$PREVIOUS_JOB"
    
    log "Rollback initiated. Check Amplify Console for status."
}

# Function to show status
show_status() {
    log "Checking deployment status for $ENVIRONMENT environment..."
    
    # Get latest deployment status
    LATEST_JOB=$(aws amplify list-jobs \
        --app-id "$AMPLIFY_APP_ID" \
        --branch-name "$BRANCH" \
        --max-items 1 \
        --query 'jobSummaries[0]' \
        --output json)
    
    echo "Latest Deployment:"
    echo "$LATEST_JOB" | jq '.'
    
    # Get branch info
    BRANCH_INFO=$(aws amplify get-branch \
        --app-id "$AMPLIFY_APP_ID" \
        --branch-name "$BRANCH" \
        --query 'branch' \
        --output json)
    
    echo "Branch Status:"
    echo "$BRANCH_INFO" | jq '.'
}

# Function to show configuration
show_config() {
    log "Current configuration for $ENVIRONMENT environment:"
    echo "$ENV_CONFIG" | jq '.'
}

# Main execution
case "$ACTION" in
    "deploy")
        check_prerequisites
        deploy
        ;;
    "rollback")
        check_prerequisites
        rollback
        ;;
    "status")
        show_status
        ;;
    "config")
        show_config
        ;;
esac

log "Operation completed successfully!" 