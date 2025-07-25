# GameDin Deployment Guide

This guide explains how to deploy the GameDin application to AWS Amplify at mkww.studio.

## Prerequisites

- Node.js 18+ and npm 9+
- AWS Account with Amplify access
- Git repository for the project

## Environment Variables

Create a `.env.production` file in the root directory with the following variables:

```env
VITE_API_URL=https://api.mkww.studio
VITE_APP_ENV=production
```

## Deployment Steps

### 1. Build the Application

```bash
# Install dependencies
npm ci

# Build the application
npm run build
```

### 2. Deploy to AWS Amplify

#### Option A: Automated Deployment (Recommended)
1. Push your code to your Git repository
2. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
3. Click "New app" > "Host web app"
4. Connect your repository (GitHub, Bitbucket, etc.)
5. Select the repository and branch
6. Review the build settings (use the provided `amplify.yml`)
7. Click "Save and deploy"

#### Option B: Manual Deployment

```bash
# Make the deployment script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh

# The script will guide you through the remaining steps
```

## Post-Deployment

1. **Verify the deployment** at https://mkww.studio
2. **Test the onboarding flow** to ensure everything works
3. **Check the logs** in AWS Amplify Console for any issues
4. **Set up monitoring** (optional) using AWS CloudWatch

## Environment Configuration

- **Production**: https://mkww.studio
- **Staging**: https://staging.mkww.studio (set up in AWS Amplify)

## Troubleshooting

- **Build fails**: Check the build logs in AWS Amplify Console
- **Environment variables not loading**: Ensure they're set in AWS Amplify environment settings
- **CORS issues**: Verify the `VITE_API_URL` is correct and the API allows requests from your domain

## Rollback

To rollback to a previous version:
1. Go to AWS Amplify Console
2. Select your app
3. Navigate to "Hosting environments"
4. Find the previous deployment and click "Redeploy this version"

## Security

- All sensitive data should be stored in AWS Parameter Store or AWS Secrets Manager
- Environment variables are automatically encrypted at rest by AWS Amplify
