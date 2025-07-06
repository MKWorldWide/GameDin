#!/bin/bash

# GameDin S3 Deployment Script
# This script automates the deployment of GameDin to AWS S3 with CloudFront CDN
# 
# Usage: ./scripts/deploy-s3.sh [environment]
# Environment options: dev, staging, prod (defaults to dev)

set -e  # Exit on any error

# Configuration
ENV_MAP=(
    ["dev"]="development"
    ["staging"]="staging" 
    ["prod"]="production"
)

# Get environment from command line args
ENV_ARG=${1:-dev}
ENVIRONMENT=${ENV_MAP[$ENV_ARG]:-development}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Utility functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if AWS credentials are configured
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials are not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install it first."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install it first."
        exit 1
    fi
    
    log_success "All prerequisites are satisfied"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Install root dependencies
    npm ci --legacy-peer-deps
    
    # Install frontend dependencies
    cd frontend
    npm ci --legacy-peer-deps
    cd ..
    
    log_success "Dependencies installed successfully"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    cd frontend
    
    # Run linting
    log_info "Running ESLint..."
    npm run lint
    
    # Run type checking
    log_info "Running TypeScript type checking..."
    npm run typecheck
    
    # Run unit tests
    log_info "Running unit tests..."
    npm run test:ci
    
    cd ..
    
    log_success "All tests passed"
}

# Build application
build_application() {
    log_info "Building application for $ENVIRONMENT environment..."
    
    cd frontend
    
    # Set environment variables for build
    export VITE_APP_ENV=$ENVIRONMENT
    export VITE_APP_VERSION=$(node -p "require('./package.json').version")
    export VITE_APP_BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Build the application
    npm run build
    
    cd ..
    
    # Verify build output
    if [ ! -f "frontend/dist/index.html" ]; then
        log_error "Build failed: index.html not found in dist directory"
        exit 1
    fi
    
    log_success "Application built successfully"
}

# Create S3 bucket if it doesn't exist
create_s3_bucket() {
    local bucket_name="gamedin-$ENVIRONMENT"
    local region=$(aws configure get region)
    
    log_info "Checking S3 bucket: $bucket_name"
    
    if ! aws s3 ls "s3://$bucket_name" &> /dev/null; then
        log_info "Creating S3 bucket: $bucket_name"
        
        # Create bucket with versioning enabled
        aws s3 mb "s3://$bucket_name" --region "$region"
        
        # Enable versioning
        aws s3api put-bucket-versioning \
            --bucket "$bucket_name" \
            --versioning-configuration Status=Enabled
        
        # Configure bucket for static website hosting
        aws s3api put-bucket-website \
            --bucket "$bucket_name" \
            --website-configuration '{
                "IndexDocument": {"Suffix": "index.html"},
                "ErrorDocument": {"Key": "index.html"}
            }'
        
        # Set bucket policy for public read access
        aws s3api put-bucket-policy \
            --bucket "$bucket_name" \
            --policy '{
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Sid": "PublicReadGetObject",
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": "s3:GetObject",
                        "Resource": "arn:aws:s3:::'$bucket_name'/*"
                    }
                ]
            }'
        
        log_success "S3 bucket created and configured"
    else
        log_success "S3 bucket already exists"
    fi
}

# Upload files to S3
upload_to_s3() {
    local bucket_name="gamedin-$ENVIRONMENT"
    
    log_info "Uploading files to S3 bucket: $bucket_name"
    
    # Sync build files to S3 with proper cache headers
    aws s3 sync frontend/dist/ "s3://$bucket_name" \
        --delete \
        --cache-control "max-age=31536000,public" \
        --exclude "*.html" \
        --exclude "*.json" \
        --exclude "*.xml"
    
    # Upload HTML files with no-cache headers
    aws s3 sync frontend/dist/ "s3://$bucket_name" \
        --delete \
        --cache-control "no-cache,no-store,must-revalidate" \
        --include "*.html" \
        --include "*.json" \
        --include "*.xml"
    
    log_success "Files uploaded to S3 successfully"
}

# Create CloudFront distribution
create_cloudfront_distribution() {
    local bucket_name="gamedin-$ENVIRONMENT"
    local region=$(aws configure get region)
    
    log_info "Checking CloudFront distribution for: $bucket_name"
    
    # Check if distribution already exists
    local distribution_id=$(aws cloudfront list-distributions --query "DistributionList.Items[?contains(Origins.Items[0].DomainName, '$bucket_name')].Id" --output text)
    
    if [ -z "$distribution_id" ] || [ "$distribution_id" = "None" ]; then
        log_info "Creating CloudFront distribution..."
        
        # Create CloudFront distribution
        local distribution_config='{
            "CallerReference": "'$(date +%s)'",
            "Comment": "GameDin '$ENVIRONMENT' distribution",
            "DefaultRootObject": "index.html",
            "Origins": {
                "Quantity": 1,
                "Items": [
                    {
                        "Id": "S3-'$bucket_name'",
                        "DomainName": "'$bucket_name'.s3.'$region'.amazonaws.com",
                        "S3OriginConfig": {
                            "OriginAccessIdentity": ""
                        }
                    }
                ]
            },
            "DefaultCacheBehavior": {
                "TargetOriginId": "S3-'$bucket_name'",
                "ViewerProtocolPolicy": "redirect-to-https",
                "TrustedSigners": {
                    "Enabled": false,
                    "Quantity": 0
                },
                "ForwardedValues": {
                    "QueryString": false,
                    "Cookies": {
                        "Forward": "none"
                    }
                },
                "MinTTL": 0,
                "Compress": true
            },
            "Enabled": true,
            "PriceClass": "PriceClass_100"
        }'
        
        local distribution_id=$(aws cloudfront create-distribution \
            --distribution-config "$distribution_config" \
            --query "Distribution.Id" \
            --output text)
        
        log_success "CloudFront distribution created: $distribution_id"
        
        # Wait for distribution to be deployed
        log_info "Waiting for CloudFront distribution to be deployed..."
        aws cloudfront wait distribution-deployed --id "$distribution_id"
        
        log_success "CloudFront distribution is deployed"
    else
        log_success "CloudFront distribution already exists: $distribution_id"
        
        # Invalidate cache for new deployment
        log_info "Invalidating CloudFront cache..."
        aws cloudfront create-invalidation \
            --distribution-id "$distribution_id" \
            --paths "/*"
        
        log_success "CloudFront cache invalidated"
    fi
}

# Main deployment process
main() {
    echo -e "${BLUE}"
    echo "🚀 GameDin S3 Deployment"
    echo "Environment: $ENVIRONMENT"
    echo "================================"
    echo -e "${NC}"
    
    # Check prerequisites
    check_prerequisites
    
    # Install dependencies
    install_dependencies
    
    # Run tests
    run_tests
    
    # Build application
    build_application
    
    # Create S3 bucket
    create_s3_bucket
    
    # Upload to S3
    upload_to_s3
    
    # Create CloudFront distribution
    create_cloudfront_distribution
    
    echo -e "${GREEN}"
    echo "🎉 Deployment completed successfully!"
    echo "================================"
    echo "Environment: $ENVIRONMENT"
    echo "S3 Bucket: gamedin-$ENVIRONMENT"
    echo "CloudFront: Check AWS Console for distribution URL"
    echo "================================"
    echo -e "${NC}"
}

# Run the main function
main "$@" 