# GameDin CI/CD Setup Guide

## Overview

This guide provides step-by-step instructions for setting up a comprehensive CI/CD pipeline for the GameDin application using GitHub Actions and AWS Amplify Studio.

## Prerequisites

- GitHub repository with GameDin codebase
- AWS account with appropriate permissions
- AWS Amplify CLI installed locally
- Node.js 18+ installed

## Step 1: AWS Amplify Studio Setup

### 1.1 Create Amplify App

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Choose "GitHub" as your repository source
4. Connect your GitHub account and select the GameDin repository
5. Configure build settings:
   - **Build image**: Amazon Linux:2023
   - **Service role**: Create new role or use existing
   - **Branch**: `main`

### 1.2 Configure Build Settings

The build settings are already configured in `amplify.yml`:

```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - cd frontend
            - npm ci --ignore-scripts
        build:
          commands:
            - npm run lint
            - npm run type-check
            - npm run test:ci
            - npm run build
        postBuild:
          commands:
            - npm run build:analyze
            - npm audit --audit-level=moderate
      artifacts:
        baseDirectory: frontend/dist
        files:
          - '**/*'
```

### 1.3 Set Environment Variables

In AWS Amplify Console, go to your app → Environment variables and add:

```
NODE_ENV=production
REACT_APP_VERSION=4.0.6
REACT_APP_API_URL=https://api.gamedin.com
REACT_APP_AWS_REGION=us-east-1
REACT_APP_USER_POOL_ID=your-user-pool-id
REACT_APP_USER_POOL_WEB_CLIENT_ID=your-client-id
REACT_APP_IDENTITY_POOL_ID=your-identity-pool-id
REACT_APP_API_GATEWAY_URL=your-api-gateway-url
```

## Step 2: GitHub Repository Setup

### 2.1 Configure Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions and add:

#### Required Secrets:
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `LHCI_GITHUB_APP_TOKEN`: Lighthouse CI GitHub app token (optional)

#### How to Create AWS Credentials:

1. Go to AWS IAM Console
2. Create a new user or use existing
3. Attach the following policies:
   - `AdministratorAccess-Amplify`
   - `CloudFrontFullAccess` (if using CloudFront)
   - `S3FullAccess` (if using S3)

4. Create access keys and add them to GitHub secrets

### 2.2 Branch Protection Rules

1. Go to repository Settings → Branches
2. Add rule for `main` branch:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators
   - ✅ Require linear history

## Step 3: GitHub Actions Workflow

The CI/CD workflow is configured in `.github/workflows/ci-cd.yml` and includes:

### 3.1 Build and Test Job
- Installs dependencies
- Runs linting and type checking
- Executes unit tests
- Builds the application
- Uploads build artifacts

### 3.2 Security Scan Job
- Runs npm audit
- Performs security checks
- Validates dependencies

### 3.3 Deployment Jobs
- **Production**: Deploys to main branch
- **Preview**: Deploys PR previews
- **Performance**: Runs Lighthouse CI tests

## Step 4: Environment Configuration

### 4.1 Environment-Specific Settings

The application uses environment-specific configuration in `frontend/src/config/environment.ts`:

```typescript
// Development
{
  debug: true,
  features: { debugMode: true, analytics: false },
  api: { baseUrl: 'http://localhost:3000' }
}

// Staging
{
  debug: true,
  features: { debugMode: true, analytics: false },
  api: { baseUrl: 'https://staging-api.gamedin.com' }
}

// Production
{
  debug: false,
  features: { debugMode: false, analytics: true },
  api: { baseUrl: 'https://api.gamedin.com' }
}
```

### 4.2 Feature Flags

Feature flags are managed per environment:

- **Chat**: Enabled in all environments
- **Notifications**: Enabled in all environments
- **Offline Mode**: Enabled in all environments
- **Analytics**: Only in production
- **Performance Monitoring**: Production and staging
- **Error Tracking**: Production and staging
- **Debug Mode**: Only in development and staging

## Step 5: Testing the Pipeline

### 5.1 Manual Trigger

1. Go to GitHub repository → Actions
2. Select "GameDin CI/CD Pipeline"
3. Click "Run workflow"
4. Select branch and click "Run workflow"

### 5.2 Test Scenarios

#### Scenario 1: Push to Main Branch
1. Make a change to your code
2. Push to `main` branch
3. Verify:
   - Build and test job passes
   - Security scan passes
   - Deployment to production succeeds
   - Performance tests run

#### Scenario 2: Create Pull Request
1. Create a feature branch
2. Make changes
3. Create PR to `main`
4. Verify:
   - Build and test job passes
   - Preview deployment creates
   - PR comment with preview URL

#### Scenario 3: Security Issues
1. Introduce a security vulnerability
2. Push changes
3. Verify:
   - Security scan fails
   - Deployment is blocked
   - Appropriate error messages

## Step 6: Monitoring and Maintenance

### 6.1 Deployment Monitoring

Monitor deployments in:
- **GitHub Actions**: View workflow runs and logs
- **AWS Amplify Console**: Monitor build status and performance
- **Application Logs**: Check application performance and errors

### 6.2 Performance Monitoring

The pipeline includes:
- **Lighthouse CI**: Automated performance testing
- **Bundle Analysis**: Track bundle size changes
- **Build Time Monitoring**: Track build performance

### 6.3 Security Monitoring

Security measures include:
- **Dependency Audits**: Automated npm audit
- **Security Scans**: Custom security checks
- **Environment Validation**: Configuration validation

## Step 7: Troubleshooting

### 7.1 Common Issues

#### Build Failures
```bash
# Check build logs
cd frontend
npm run build

# Verify dependencies
npm ci --ignore-scripts
```

#### Deployment Failures
```bash
# Check Amplify status
amplify status

# Verify environment variables
amplify env list
```

#### Test Failures
```bash
# Run tests locally
npm run test:ci

# Check test coverage
npm run test -- --coverage
```

### 7.2 Debug Commands

```bash
# Validate configuration
npm run validate

# Check security
npm run security:audit

# Analyze bundle
npm run build:analyze

# Performance audit
npm run performance:audit
```

## Step 8: Advanced Configuration

### 8.1 Custom Domains

1. In AWS Amplify Console, go to Domain management
2. Add your custom domain
3. Configure SSL certificate
4. Update DNS settings

### 8.2 Environment-Specific Deployments

Create multiple environments:
```bash
# Create staging environment
amplify env add staging

# Create production environment
amplify env add production
```

### 8.3 Branch-Based Deployments

Configure branch-based deployments in Amplify Console:
- `main` → Production
- `develop` → Staging
- `feature/*` → Preview

## Step 9: Best Practices

### 9.1 Code Quality
- Always run `npm run validate` before pushing
- Keep test coverage above 80%
- Use TypeScript strict mode
- Follow ESLint rules

### 9.2 Security
- Never commit secrets to repository
- Use environment variables for sensitive data
- Regular dependency updates
- Security audits in CI/CD

### 9.3 Performance
- Monitor bundle size
- Optimize images and assets
- Use code splitting
- Implement caching strategies

### 9.4 Monitoring
- Set up error tracking
- Monitor performance metrics
- Track user analytics
- Regular health checks

## Support

For issues or questions:
1. Check GitHub Actions logs
2. Review AWS Amplify Console
3. Consult this documentation
4. Create GitHub issue with detailed information

## Changelog

- **v4.0.6**: Initial CI/CD setup with GitHub Actions and AWS Amplify
- Added comprehensive testing and security scanning
- Implemented environment-specific configuration
- Added performance monitoring and optimization 