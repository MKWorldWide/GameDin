#!/bin/bash

# Create necessary directories
mkdir -p frontend/config
mkdir -p frontend/src
mkdir -p frontend/tests
mkdir -p backend/src
mkdir -p backend/tests
mkdir -p config
mkdir -p scripts/deployment
mkdir -p scripts/ci
mkdir -p docs/api
mkdir -p docs/deployment

# Move frontend-related files
mv src/* frontend/src/ 2>/dev/null
mv vite.config.js frontend/config/
mv tailwind.config.js frontend/config/
mv tsconfig.json frontend/config/
mv tsconfig.node.json frontend/config/
mv .prettierrc frontend/config/
mv .eslintrc.json frontend/config/

# Move backend-related files
mv amplify/backend/* backend/src/ 2>/dev/null
mv amplify/team-provider-info.yml config/
mv amplify.yml config/

# Move test files
mv tests/integration/* backend/tests/ 2>/dev/null
mv tests/unit/* frontend/tests/ 2>/dev/null
mv jest.config.js frontend/config/
mv jest.config.integration.js backend/config/
mv cypress.config.ts frontend/config/

# Move documentation
mv DEPLOYMENT.md docs/deployment/
mv README.md docs/

# Move configuration files
mv .env.example config/
mv .npmrc config/
mv .nvmrc config/
mv .prettierignore config/
mv .npmignore config/

# Create new documentation files
echo "# API Documentation" > docs/api/README.md
echo "# Deployment Guide" > docs/deployment/README.md
echo "# CI/CD Pipeline" > docs/deployment/ci-cd.md

# Create necessary configuration files
echo "# Development Environment Setup" > docs/setup.md
echo "# Contributing Guidelines" > docs/contributing.md
echo "# Security Guidelines" > docs/security.md

# Update .gitignore
cat > .gitignore << EOL
# Dependencies
**/node_modules/
**/.pnp/
.pnp.js

# Testing
**/coverage/
**/cypress/videos/
**/cypress/screenshots/

# Production
**/build/
**/dist/
**/.next/
.serverless/

# Environment
.env*
!config/.env.example

# IDE
.idea/
.vscode/
*.swp
*.swo

# AWS
aws-exports.js
aws-exports-*.js
/amplify/team-provider-info.json
/amplify/backend/amplify-meta.json
/amplify/backend/awscloudformation/
/amplify/#current-cloud-backend
/amplify/backend/api/API.json
/amplify/backend/hosting/

# Cache
.cache/
.eslintcache
.stylelintcache

# Build
*.tsbuildinfo
.next/
out/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
*.log

# System
.DS_Store
Thumbs.db
EOL

# Create deployment scripts
cat > scripts/deployment/deploy.sh << EOL
#!/bin/bash
echo "Deploying application..."
amplify push
EOL

cat > scripts/deployment/rollback.sh << EOL
#!/bin/bash
echo "Rolling back to previous version..."
amplify rollback
EOL

# Make scripts executable
chmod +x scripts/deployment/*.sh

echo "Project structure reorganized successfully!" 