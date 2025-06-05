# GameDin Deployment Guide

## Prerequisites

- Node.js >= 18.0.0
- AWS CLI configured with appropriate credentials
- Amplify CLI installed globally: `npm install -g @aws-amplify/cli`

## Environment Setup

1. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install
   ```

2. Configure Amplify:
   ```bash
   amplify configure
   ```

3. Initialize Amplify in the project:
   ```bash
   amplify init
   ```

4. Push Amplify changes:
   ```bash
   amplify push
   ```

## Environment Variables

Create the following environment files:

### Development (.env.development)
```env
VITE_API_URL=http://localhost:4000
VITE_STAGE=development
VITE_AWS_REGION=us-east-1
```

### Production (.env.production)
```env
VITE_API_URL=https://api.gamedin.xyz
VITE_STAGE=production
VITE_AWS_REGION=us-east-1
```

## Build and Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Deploy to Amplify
```bash
amplify publish
```

## CI/CD Pipeline

The project uses GitHub Actions for CI/CD. The pipeline:

1. Runs tests and linting on pull requests
2. Builds and deploys to staging on merge to develop
3. Builds and deploys to production on merge to main

### Required GitHub Secrets

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AMPLIFY_APP_ID`
- `SLACK_WEBHOOK_URL`

## Monitoring and Logging

- CloudWatch Dashboards: `/aws/gamedin`
- WAF Metrics: GameDinWAFWebACL
- Application Logs: CloudWatch Logs

## Security Measures

1. WAF Rules:
   - Rate limiting: 2000 requests per IP
   - SQL Injection protection
   - XSS protection

2. Authentication:
   - Cognito User Pools
   - Email verification required
   - Password policy enforced

3. API Security:
   - CORS configured
   - Rate limiting
   - Request validation

## Rollback Procedure

1. Identify the last stable version
2. Use Amplify Console to revert to previous build
3. Verify application functionality
4. Monitor error rates and performance

## Feature Flags

Feature flags are managed through the config/feature-flags.json file:

1. Development: All features enabled
2. Staging: Beta features at 50% rollout
3. Production: Controlled rollout based on configuration

## Performance Monitoring

1. CloudWatch Metrics:
   - API Latency
   - Error Rates
   - Authentication Failures

2. Load Testing:
   ```bash
   npm run test:load
   ```

## Troubleshooting

1. Build Issues:
   ```bash
   npm run clean
   npm install
   npm run build
   ```

2. Deployment Issues:
   ```bash
   amplify status
   amplify push
   ```

3. Runtime Issues:
   - Check CloudWatch Logs
   - Verify environment variables
   - Check AWS service health

## Support

For deployment issues:
1. Check CloudWatch Logs
2. Review Amplify Console
3. Contact DevOps team 