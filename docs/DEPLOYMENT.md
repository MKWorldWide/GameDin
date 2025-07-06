# GameDin S3 Deployment Guide

This document provides comprehensive instructions for deploying GameDin to AWS S3 with CloudFront CDN.

## 🚀 Quick Start

### Prerequisites

1. **AWS CLI** installed and configured
2. **Node.js** (v18 or higher)
3. **Git** for version control
4. **AWS Account** with appropriate permissions

### Environment Setup

1. **Configure AWS Credentials**
   ```bash
   aws configure
   ```

2. **Install Dependencies**
   ```bash
   npm ci --legacy-peer-deps
   cd frontend && npm ci --legacy-peer-deps
   ```

3. **Set Environment Variables**
   ```bash
   export AWS_REGION=us-east-1
   export VITE_APP_ENV=production
   ```

## 📋 Deployment Methods

### Method 1: Automated Deployment (Recommended)

#### GitHub Actions (CI/CD)

1. **Set up GitHub Secrets**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`

2. **Push to Trigger Deployment**
   ```bash
   git push origin main      # Deploys to production
   git push origin develop   # Deploys to development
   ```

3. **Manual Deployment**
   - Go to Actions tab in GitHub
   - Select "Deploy to AWS S3" workflow
   - Click "Run workflow"
   - Choose environment (dev/prod)

#### Local Script Deployment

```bash
# Deploy to development
./scripts/deploy-s3.sh dev

# Deploy to production
./scripts/deploy-s3.sh prod
```

### Method 2: Manual Deployment

1. **Build the Application**
   ```bash
   cd frontend
   npm run build
   ```

2. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://gamedin-prod --region us-east-1
   ```

3. **Configure Bucket for Static Website**
   ```bash
   aws s3api put-bucket-website \
     --bucket gamedin-prod \
     --website-configuration '{"IndexDocument":{"Suffix":"index.html"},"ErrorDocument":{"Key":"index.html"}}'
   ```

4. **Set Bucket Policy**
   ```bash
   aws s3api put-bucket-policy \
     --bucket gamedin-prod \
     --policy '{"Version":"2012-10-17","Statement":[{"Sid":"PublicReadGetObject","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::gamedin-prod/*"}]}'
   ```

5. **Upload Files**
   ```bash
   aws s3 sync frontend/dist/ s3://gamedin-prod \
     --delete \
     --cache-control "max-age=31536000,public" \
     --exclude "*.html" \
     --exclude "*.json" \
     --exclude "*.xml"
   
   aws s3 sync frontend/dist/ s3://gamedin-prod \
     --delete \
     --cache-control "no-cache,no-store,must-revalidate" \
     --include "*.html" \
     --include "*.json" \
     --include "*.xml"
   ```

## ☁️ Infrastructure Setup

### CloudFormation Deployment

1. **Deploy Infrastructure Stack**
   ```bash
   aws cloudformation create-stack \
     --stack-name gamedin-infrastructure \
     --template-body file://infrastructure/s3-cloudfront.yml \
     --parameters ParameterKey=Environment,ParameterValue=prod \
     --capabilities CAPABILITY_IAM
   ```

2. **Monitor Deployment**
   ```bash
   aws cloudformation describe-stacks \
     --stack-name gamedin-infrastructure \
     --query 'Stacks[0].StackStatus'
   ```

3. **Get Outputs**
   ```bash
   aws cloudformation describe-stacks \
     --stack-name gamedin-infrastructure \
     --query 'Stacks[0].Outputs'
   ```

### CloudFront Configuration

1. **Create Distribution** (if not using CloudFormation)
   ```bash
   # Get S3 bucket domain name
   BUCKET_DOMAIN=$(aws s3api get-bucket-location --bucket gamedin-prod --query 'LocationConstraint' --output text)
   
   # Create CloudFront distribution
   aws cloudfront create-distribution \
     --distribution-config '{
       "CallerReference": "'$(date +%s)'",
       "Comment": "GameDin production distribution",
       "DefaultRootObject": "index.html",
       "Origins": {
         "Quantity": 1,
         "Items": [
           {
             "Id": "S3-gamedin-prod",
             "DomainName": "gamedin-prod.s3.'$BUCKET_DOMAIN'.amazonaws.com",
             "S3OriginConfig": {
               "OriginAccessIdentity": ""
             }
           }
         ]
       },
       "DefaultCacheBehavior": {
         "TargetOriginId": "S3-gamedin-prod",
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
   ```

2. **Invalidate Cache** (after deployment)
   ```bash
   # Get distribution ID
   DISTRIBUTION_ID=$(aws cloudfront list-distributions \
     --query "DistributionList.Items[?contains(Origins.Items[0].DomainName, 'gamedin-prod')].Id" \
     --output text)
   
   # Invalidate cache
   aws cloudfront create-invalidation \
     --distribution-id "$DISTRIBUTION_ID" \
     --paths "/*"
   ```

## 🔧 SPA Routing

SPA routing is handled by S3's error document configuration. Any unknown route (404) will serve `index.html`, allowing the frontend router to handle navigation. No Lambda@Edge is required.

## 🔧 Configuration

### Environment Variables

Create `.env` files for different environments:

#### Development (.env.development)
```env
VITE_APP_ENV=development
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000/ws
VITE_DEBUG=true
```

#### Production (.env.production)
```env
VITE_APP_ENV=production
VITE_API_URL=https://api.gamedin.com
VITE_WS_URL=wss://api.gamedin.com/ws
VITE_DEBUG=false
```

### Build Configuration

The build process is configured in `frontend/vite.config.ts` with:

- **Code Splitting**: Automatic chunk splitting for better caching
- **Compression**: Gzip and Brotli compression
- **PWA**: Service worker and manifest generation
- **Optimization**: Tree shaking and minification
- **Cache Busting**: Content hash in filenames

### Security Headers

Security headers are configured in the deployment configuration:

```json
{
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
}
```

## 📊 Monitoring

### CloudWatch Metrics

The deployment includes CloudWatch monitoring for:

- **CloudFront Requests**: Number of requests to your distribution
- **CloudFront Bytes Downloaded**: Data transfer volume
- **S3 Bucket Size**: Storage usage

### Alarms

Automated alarms are configured for:

- **High Error Rate**: >5% error rate for 5 minutes
- **High Latency**: >1000ms response time for 5 minutes

### Dashboard

Access the CloudWatch dashboard:
1. Go to AWS CloudWatch Console
2. Navigate to Dashboards
3. Select "GameDin-{environment}-Dashboard"

## 🔄 Rollback Process

### Quick Rollback

1. **Revert to Previous Version**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Manual Rollback**
   ```bash
   # List S3 bucket versions
   aws s3api list-object-versions \
     --bucket gamedin-prod \
     --prefix index.html
   
   # Restore previous version
   aws s3api get-object \
     --bucket gamedin-prod \
     --key index.html \
     --version-id PREVIOUS_VERSION_ID \
     index.html
   
   # Upload restored version
   aws s3 cp index.html s3://gamedin-prod/index.html
   ```

### Infrastructure Rollback

```bash
# Rollback CloudFormation stack
aws cloudformation rollback-stack \
  --stack-name gamedin-infrastructure
```

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Clear Vite cache
   rm -rf frontend/node_modules/.vite
   ```

2. **S3 Upload Errors**
   ```bash
   # Check AWS credentials
   aws sts get-caller-identity
   
   # Verify bucket permissions
   aws s3 ls s3://gamedin-prod
   ```

3. **CloudFront Cache Issues**
   ```bash
   # Force cache invalidation
   aws cloudfront create-invalidation \
     --distribution-id YOUR_DISTRIBUTION_ID \
     --paths "/*"
   ```

4. **CORS Issues**
   - Verify S3 bucket CORS configuration
   - Check CloudFront origin settings
   - Ensure proper headers are forwarded

### Performance Optimization

1. **Enable Compression**
   - CloudFront automatically compresses content
   - Verify `Compress: true` in distribution settings

2. **Optimize Images**
   - Use WebP format where possible
   - Implement responsive images
   - Enable CloudFront image optimization

3. **Cache Strategy**
   - Static assets: 1 year cache
   - HTML files: No cache
   - API responses: Network-first strategy

## 📈 Cost Optimization

### S3 Costs
- **Storage**: ~$0.023 per GB/month
- **Requests**: ~$0.0004 per 1,000 requests
- **Data Transfer**: Free for CloudFront origin

### CloudFront Costs
- **Requests**: ~$0.0075 per 10,000 requests
- **Data Transfer**: ~$0.085 per GB
- **Price Class**: Use PriceClass_100 for cost optimization

### Cost Monitoring
```bash
# Set up billing alerts
aws cloudwatch put-metric-alarm \
  --alarm-name "GameDin-Monthly-Cost" \
  --alarm-description "Monthly cost exceeds $50" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 86400 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold
```

## 🔐 Security Best Practices

1. **IAM Permissions**
   - Use least privilege principle
   - Create dedicated deployment user
   - Enable MFA for all users

2. **Bucket Security**
   - Enable versioning for rollback capability
   - Configure lifecycle policies
   - Monitor access logs

3. **CloudFront Security**
   - Enable HTTPS only
   - Configure security headers
   - Use WAF for additional protection

4. **Monitoring**
   - Enable CloudTrail logging
   - Set up CloudWatch alarms
   - Monitor for unusual activity

## 📞 Support

For deployment issues:

1. **Check Logs**
   - CloudWatch logs for Lambda functions
   - S3 access logs
   - CloudFront access logs

2. **Common Commands**
   ```bash
   # Check deployment status
   aws cloudformation describe-stacks --stack-name gamedin-infrastructure
   
   # View CloudWatch logs
   aws logs describe-log-groups --log-group-name-prefix /aws/lambda/gamedin
   
   # Check S3 bucket contents
   aws s3 ls s3://gamedin-prod --recursive
   ```

3. **Documentation**
   - [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
   - [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
   - [Vite Documentation](https://vitejs.dev/)

---

**Last Updated**: December 2024  
**Version**: 1.0.1  
**Maintainer**: GameDin Development Team 