#!/bin/bash

# GameDin L3 Complete Deployment Script
# Integrates blockchain, AI services, and web application with AWS infrastructure

set -e

# Colors and styling
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
PROJECT_NAME="gamedin-l3"
VERSION="4.2.0"
DEPLOYMENT_TYPE="${1:-development}"
AWS_REGION="${2:-us-east-1}"
CLUSTER_NAME="gamedin-l3-cluster"

# ASCII Art Header
print_header() {
    echo -e "${PURPLE}${BOLD}"
    cat << 'EOF'
   ▄████  ▄▄▄       ███▄ ▄███▓▓█████ ▓█████▄  ██▓ ███▄    █     ██▓     ▓█████▄ 
  ██▒ ▀█▒▒████▄    ▓██▒▀█▀ ██▒▓█   ▀ ▒██▀ ██▌▓██▒ ██ ▀█   █    ▓██▒     ▒██▀ ██▌
 ▒██░▄▄▄░▒██  ▀█▄  ▓██    ▓██░▒███   ░██   █▌▒██▒▓██  ▀█ ██▒   ▒██░     ░██   █▌
 ░▓█  ██▓░██▄▄▄▄██ ▒██    ▒██ ▒▓█  ▄ ░▓█▄   ▌░██░▓██▒  ▐▌██▒   ▒██░     ░▓█▄   ▌
 ░▒▓███▀▒ ▓█   ▓██▒▒██▒   ░██▒░▒████▒░▒████▓ ░██░▒██░   ▓██░   ░██████▒ ░▒████▓ 
  ░▒   ▒  ▒▒   ▓▒█░░ ▒░   ░  ░░░ ▒░ ░ ▒▒▓  ▒ ░▓  ░ ▒░   ▒ ▒    ░ ▒░▓  ░  ▒▒▓  ▒ 
   ░   ░   ▒   ▒▒ ░░  ░      ░ ░ ░  ░ ░ ▒  ▒  ▒ ░░ ░░   ░ ▒░   ░ ░ ▒  ░  ░ ▒  ▒ 

        🚀 Layer 3 Gaming Blockchain with NovaSanctum AI Integration
        ================================================================
EOF
    echo -e "${NC}"
    echo -e "${CYAN}🌟 GameDin L3 Unified Deployment System${NC}"
    echo -e "${BLUE}Version: ${VERSION} | Deployment: ${DEPLOYMENT_TYPE} | Region: ${AWS_REGION}${NC}"
    echo ""
}

# Check system requirements
check_system_requirements() {
    echo -e "${YELLOW}🔍 Checking system requirements...${NC}"
    
    local requirements=(
        "aws:AWS CLI"
        "kubectl:Kubernetes CLI"
        "docker:Docker"
        "node:Node.js 18+"
        "npm:NPM Package Manager"
    )
    
    for req in "${requirements[@]}"; do
        local cmd="${req%%:*}"
        local name="${req##*:}"
        
        if ! command -v "$cmd" &> /dev/null; then
            echo -e "${RED}❌ $name is not installed${NC}"
            exit 1
        else
            echo -e "${GREEN}✅ $name is available${NC}"
        fi
    done
    
    echo -e "${GREEN}✅ All system requirements met${NC}"
    echo ""
}

# Check AWS configuration
check_aws_config() {
    echo -e "${YELLOW}🔍 Checking AWS configuration...${NC}"
    
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ AWS credentials not configured${NC}"
        echo -e "${YELLOW}Please run: aws configure${NC}"
        exit 1
    fi
    
    local account_id=$(aws sts get-caller-identity --query Account --output text)
    echo -e "${GREEN}✅ AWS configured for account: $account_id${NC}"
    echo ""
}

# Build and push Docker images
build_and_push_images() {
    echo -e "${YELLOW}🔨 Building and pushing Docker images...${NC}"
    
    local account_id=$(aws sts get-caller-identity --query Account --output text)
    local ecr_repo="gamedin-l3"
    
    # Create ECR repositories if they don't exist
    local repositories=("$ecr_repo/blockchain-node" "$ecr_repo/ai-service" "$ecr_repo/web-app")
    
    for repo in "${repositories[@]}"; do
        aws ecr describe-repositories --repository-names "$repo" --region "$AWS_REGION" 2>/dev/null || {
            echo -e "${BLUE}📦 Creating ECR repository: $repo${NC}"
            aws ecr create-repository --repository-name "$repo" --region "$AWS_REGION"
        }
    done
    
    # Login to ECR
    aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$account_id.dkr.ecr.$AWS_REGION.amazonaws.com"
    
    # Build images
    local images=("blockchain-node" "ai-service" "web-app")
    
    for image in "${images[@]}"; do
        echo -e "${BLUE}🔨 Building $image image...${NC}"
        
        # Create Dockerfile if it doesn't exist
        if [ ! -f "Dockerfile.$image" ]; then
            create_dockerfile "$image"
        fi
        
        # Use the correct Dockerfile path
        local dockerfile_path="Dockerfile.$image"
        if [ "$image" = "blockchain-node" ] && [ -f "blockchain/Dockerfile.blockchain-node" ]; then
            dockerfile_path="blockchain/Dockerfile.blockchain-node"
        fi
        
        docker build -f "$dockerfile_path" -t "$image:$VERSION" .
        docker tag "$image:$VERSION" "$account_id.dkr.ecr.$AWS_REGION.amazonaws.com/$ecr_repo/$image:$VERSION"
        docker push "$account_id.dkr.ecr.$AWS_REGION.amazonaws.com/$ecr_repo/$image:$VERSION"
        
        echo -e "${GREEN}✅ $image image built and pushed${NC}"
    done
    
    echo ""
}

# Create Dockerfile for a service
create_dockerfile() {
    local service="$1"
    
    case "$service" in
        "blockchain-node")
            cat > "Dockerfile.$service" << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY blockchain/package*.json ./
RUN npm ci --only=production
COPY blockchain/ .
EXPOSE 8545 30303
CMD ["node", "services/blockchainService.js"]
EOF
            ;;
        "ai-service")
            cat > "Dockerfile.$service" << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY blockchain/package*.json ./
RUN npm ci --only=production
COPY blockchain/ .
EXPOSE 8080
CMD ["node", "services/novaSanctumAI.js"]
EOF
            ;;
        "web-app")
            cat > "Dockerfile.$service" << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
EOF
            ;;
    esac
}

# Deploy to EKS
deploy_to_eks() {
    echo -e "${YELLOW}🚀 Deploying to EKS cluster...${NC}"
    
    # Check if cluster exists
    if ! aws eks describe-cluster --name "$CLUSTER_NAME" --region "$AWS_REGION" &> /dev/null; then
        echo -e "${BLUE}📦 Creating EKS cluster: $CLUSTER_NAME${NC}"
        create_eks_cluster
    fi
    
    # Update kubeconfig
    aws eks update-kubeconfig --name "$CLUSTER_NAME" --region "$AWS_REGION"
    
    # Apply Kubernetes manifests
    echo -e "${BLUE}📋 Applying Kubernetes manifests...${NC}"
    kubectl apply -f blockchain/deployment/unified-deployment.yaml
    
    # Wait for deployments to be ready
    echo -e "${BLUE}⏳ Waiting for deployments to be ready...${NC}"
    kubectl wait --for=condition=available --timeout=300s deployment/gamedin-blockchain-node -n gamedin-l3
    kubectl wait --for=condition=available --timeout=300s deployment/gamedin-ai-service -n gamedin-l3
    kubectl wait --for=condition=available --timeout=300s deployment/gamedin-web-app -n gamedin-l3
    
    echo -e "${GREEN}✅ EKS deployment completed${NC}"
    echo ""
}

# Create EKS cluster
create_eks_cluster() {
    # Create cluster using eksctl
    eksctl create cluster \
        --name "$CLUSTER_NAME" \
        --region "$AWS_REGION" \
        --nodegroup-name standard-workers \
        --node-type t3.large \
        --nodes 3 \
        --nodes-min 1 \
        --nodes-max 10 \
        --managed
    
    echo -e "${GREEN}✅ EKS cluster created: $CLUSTER_NAME${NC}"
}

# Deploy to AWS Amplify (for web app)
deploy_to_amplify() {
    echo -e "${YELLOW}🚀 Deploying web app to AWS Amplify...${NC}"
    
    # Check if Amplify app exists
    if ! aws amplify get-app --app-id "$PROJECT_NAME" --region "$AWS_REGION" &> /dev/null; then
        echo -e "${BLUE}📦 Creating Amplify app...${NC}"
        aws amplify create-app --name "$PROJECT_NAME" --region "$AWS_REGION"
    fi
    
    # Deploy frontend
    cd frontend
    npm run build
    aws s3 sync dist/ s3://gamedin-web-app-$DEPLOYMENT_TYPE --delete
    aws cloudfront create-invalidation --distribution-id $(aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[?contains(@, 'gamedin.com')]].Id" --output text) --paths "/*"
    
    echo -e "${GREEN}✅ Amplify deployment completed${NC}"
    echo ""
}

# Setup monitoring and logging
setup_monitoring() {
    echo -e "${YELLOW}📊 Setting up monitoring and logging...${NC}"
    
    # Create CloudWatch dashboard
    aws cloudwatch put-dashboard \
        --dashboard-name "GameDin-L3-Monitoring" \
        --dashboard-body file://monitoring/dashboard.json \
        --region "$AWS_REGION"
    
    # Setup CloudWatch alarms
    aws cloudwatch put-metric-alarm \
        --alarm-name "GameDin-L3-High-CPU" \
        --alarm-description "High CPU utilization" \
        --metric-name CPUUtilization \
        --namespace AWS/ECS \
        --statistic Average \
        --period 300 \
        --threshold 80 \
        --comparison-operator GreaterThanThreshold \
        --evaluation-periods 2 \
        --region "$AWS_REGION"
    
    echo -e "${GREEN}✅ Monitoring setup completed${NC}"
    echo ""
}

# Run health checks
run_health_checks() {
    echo -e "${YELLOW}🏥 Running health checks...${NC}"
    
    # Check EKS cluster health
    kubectl get nodes -o wide
    kubectl get pods -n gamedin-l3
    
    # Check services
    kubectl get services -n gamedin-l3
    
    # Check ingress
    kubectl get ingress -n gamedin-l3
    
    echo -e "${GREEN}✅ Health checks completed${NC}"
    echo ""
}

# Display deployment information
display_deployment_info() {
    echo -e "${CYAN}${BOLD}🎉 GameDin L3 Deployment Complete!${NC}"
    echo ""
    echo -e "${BLUE}📋 Deployment Information:${NC}"
    echo -e "  • Environment: ${DEPLOYMENT_TYPE}"
    echo -e "  • AWS Region: ${AWS_REGION}"
    echo -e "  • EKS Cluster: ${CLUSTER_NAME}"
    echo -e "  • Version: ${VERSION}"
    echo ""
    echo -e "${BLUE}🌐 Access URLs:${NC}"
    echo -e "  • Web App: https://app.gamedin.com"
    echo -e "  • Blockchain: https://blockchain.gamedin.com"
    echo -e "  • AI Service: https://ai.gamedin.com"
    echo ""
    echo -e "${BLUE}📊 Monitoring:${NC}"
    echo -e "  • CloudWatch Dashboard: https://console.aws.amazon.com/cloudwatch/home?region=${AWS_REGION}#dashboards:name=GameDin-L3-Monitoring"
    echo -e "  • EKS Console: https://console.aws.amazon.com/eks/home?region=${AWS_REGION}#/clusters/${CLUSTER_NAME}"
    echo ""
    echo -e "${GREEN}✅ All services are now running and ready!${NC}"
}

# Main deployment function
main() {
    print_header
    check_system_requirements
    check_aws_config
    
    case "$DEPLOYMENT_TYPE" in
        "development")
            echo -e "${BLUE}🔧 Deploying in development mode...${NC}"
            ;;
        "staging")
            echo -e "${BLUE}🧪 Deploying in staging mode...${NC}"
            ;;
        "production")
            echo -e "${BLUE}🚀 Deploying in production mode...${NC}"
            ;;
        *)
            echo -e "${RED}❌ Invalid deployment type: $DEPLOYMENT_TYPE${NC}"
            echo -e "${YELLOW}Usage: $0 [development|staging|production] [aws-region]${NC}"
            exit 1
            ;;
    esac
    
    build_and_push_images
    deploy_to_eks
    deploy_to_amplify
    setup_monitoring
    run_health_checks
    display_deployment_info
}

# Run main function
main "$@" 