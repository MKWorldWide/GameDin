# AWS Amplify Gen2 Deployment Guide

This guide provides detailed instructions for deploying the GameDin application to AWS Amplify Gen2.

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Node.js 18+ and npm installed
4. GameDin codebase cloned to your local machine

## Key Files

- `amplify.gen2.yml` - Contains Amplify Gen2 specific configuration
- `amplify.yml` - Contains standard Amplify configuration (for backward compatibility)
- `scripts/deploy-amplify.js` - Helper script for deployment preparation

## Preparation Steps

1. **Ensure you have the latest code**

   ```bash
   git pull origin main
   ```

2. **Install dependencies**

   ```bash
   npm install
   cd frontend && npm install
   cd ..
   ```

3. **Run tests to ensure everything is working**

   ```bash
   npm run test
   ```

4. **Build the application for production**

   ```bash
   cd frontend
   npm run build
   cd ..
   ```

5. **Verify your AWS configuration**

   ```bash
   aws configure list
   ```

   Ensure you have the correct AWS profile selected with permissions for Amplify.

## Deployment Options

### Option 1: AWS Amplify Console (Recommended for First Deployment)

1. Log in to the [AWS Management Console](https://console.aws.amazon.com/)
2. Navigate to AWS Amplify
3. Choose "New app" > "Host web app"
4. Select your repository provider (GitHub, GitLab, BitBucket, etc.)
5. Authorize AWS Amplify to access your repository
6. Select the GameDin repository and branch
7. Configure build settings:
   - Select "Use existing amplify.yml" and confirm the default settings
   - Alternatively, upload your customized `amplify.gen2.yml` file
8. Review your settings and choose "Save and deploy"

### Option 2: AWS CLI Deployment (For Subsequent Deployments)

1. Create a deployment package:

   ```bash
   # Create zip file containing the build artifacts
   cd frontend
   npm run build
   cd ..
   zip -r deployment.zip frontend/dist/
   ```

2. Deploy using the AWS CLI:

   ```bash
   # Start a new deployment
   aws amplify start-deployment \
     --app-id YOUR_AMPLIFY_APP_ID \
     --branch-name main \
     --source-url file://deployment.zip
   ```

   Replace `YOUR_AMPLIFY_APP_ID` with your actual Amplify app ID.

## Environment Variables

Ensure these environment variables are configured in the Amplify Console:

| Variable Name | Description | Example Value |
|---------------|-------------|--------------|
| `AMPLIFY_MONOREPO_APP_ROOT` | Root directory of the app | `frontend` |
| `NODE_OPTIONS` | Node.js memory allocation | `--max-old-space-size=4096` |
| `NODE_ENV` | Environment name | `production` |
| `NODE_VERSION` | Node.js version | `20` |
| `VITE_APP_ENV` | Application environment | `production` |

## Amplify Gen2 Feature Optimization

### 1. Performance Optimizations

- **Caching Strategy**: Configure custom cache headers for different file types
  ```yaml
  customHeaders:
    - pattern: '/assets/*'
      headers:
        - key: 'Cache-Control'
          value: 'public, max-age=31536000, immutable'
  ```

- **Auto-scaling**: Configure performance rules in your `amplify.gen2.yml`
  ```yaml
  performance:
    maxConcurrentUsers: 1000
    autoscaling:
      computeType: large
      minSize: 1
      maxSize: 10
      targetUtilization: 70
  ```

### 2. Security Enhancements

- **Web Application Firewall (WAF)**: Enable and configure WAF rules
  ```yaml
  security:
    enableWAF: true
    wafRules:
      - name: AWSManagedRulesCommonRuleSet
        priority: 1
  ```

- **Security Headers**: Add comprehensive security headers
  ```yaml
  customHeaders:
    - pattern: '**/*'
      headers:
        - key: 'Strict-Transport-Security'
          value: 'max-age=31536000; includeSubDomains; preload'
  ```

### 3. Monitoring and Alerts

- Configure monitoring alerts for critical metrics
  ```yaml
  monitoring:
    alerts:
      - name: HighErrorRate
        metric: 5XXError
        threshold: 5
        evaluationPeriods: 2
        period: 300
        comparison: GreaterThanThreshold
        notifyEmail: alerts@gamedin.com
  ```

## Post-Deployment Verification

After deployment, verify:

1. **Application Functionality**: Test key user flows in the deployed application
2. **Security Headers**: Verify security headers are correctly applied
   ```bash
   curl -I https://your-app-url.amplifyapp.com
   ```
3. **Performance**: Use Lighthouse or other tools to measure performance
4. **API Connections**: Verify backend connections and API endpoints
5. **Error Monitoring**: Check CloudWatch logs for any errors

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check build logs in the Amplify Console
   - Verify Node.js version compatibility
   - Ensure all dependencies are correctly installed

2. **Missing Environment Variables**:
   - Verify all required environment variables are set in the Amplify Console
   - Check for typos in variable names

3. **Permission Issues**:
   - Ensure your AWS user has sufficient permissions for Amplify services
   - Check IAM roles and policies

4. **Custom Domain Issues**:
   - Verify DNS configuration
   - Check SSL certificate status
   - Ensure CNAME records are properly set up

### Getting Help

If you encounter issues not covered in this guide:

1. Check the AWS Amplify documentation: [https://docs.aws.amazon.com/amplify/](https://docs.aws.amazon.com/amplify/)
2. Review the AWS Amplify GitHub repository: [https://github.com/aws-amplify/amplify-console](https://github.com/aws-amplify/amplify-console)
3. Contact AWS Support if you have an AWS support plan

## Additional Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [AWS Amplify CLI Documentation](https://docs.amplify.aws/cli/)
- [AWS Amplify Gen2 Features](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html)
- [AWS Amplify Console User Guide](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html) 