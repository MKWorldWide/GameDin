# Create necessary directories
New-Item -ItemType Directory -Force -Path frontend/config
New-Item -ItemType Directory -Force -Path frontend/src
New-Item -ItemType Directory -Force -Path frontend/tests
New-Item -ItemType Directory -Force -Path backend/src
New-Item -ItemType Directory -Force -Path backend/tests
New-Item -ItemType Directory -Force -Path config
New-Item -ItemType Directory -Force -Path scripts/deployment
New-Item -ItemType Directory -Force -Path scripts/ci
New-Item -ItemType Directory -Force -Path docs/api
New-Item -ItemType Directory -Force -Path docs/deployment

# Move frontend-related files
Move-Item -Path src/* -Destination frontend/src/ -Force -ErrorAction SilentlyContinue
Move-Item -Path vite.config.js -Destination frontend/config/ -Force -ErrorAction SilentlyContinue
Move-Item -Path tailwind.config.js -Destination frontend/config/ -Force -ErrorAction SilentlyContinue
Move-Item -Path tsconfig.json -Destination frontend/config/ -Force -ErrorAction SilentlyContinue
Move-Item -Path tsconfig.node.json -Destination frontend/config/ -Force -ErrorAction SilentlyContinue
Move-Item -Path .prettierrc -Destination frontend/config/ -Force -ErrorAction SilentlyContinue
Move-Item -Path .eslintrc.json -Destination frontend/config/ -Force -ErrorAction SilentlyContinue

# Move backend-related files
Move-Item -Path amplify/backend/* -Destination backend/src/ -Force -ErrorAction SilentlyContinue
Move-Item -Path amplify/team-provider-info.yml -Destination config/ -Force -ErrorAction SilentlyContinue
Move-Item -Path amplify.yml -Destination config/ -Force -ErrorAction SilentlyContinue

# Move test files
Move-Item -Path tests/integration/* -Destination backend/tests/ -Force -ErrorAction SilentlyContinue
Move-Item -Path tests/unit/* -Destination frontend/tests/ -Force -ErrorAction SilentlyContinue
Move-Item -Path jest.config.js -Destination frontend/config/ -Force -ErrorAction SilentlyContinue
Move-Item -Path jest.config.integration.js -Destination backend/config/ -Force -ErrorAction SilentlyContinue
Move-Item -Path cypress.config.ts -Destination frontend/config/ -Force -ErrorAction SilentlyContinue

# Move documentation
Move-Item -Path DEPLOYMENT.md -Destination docs/deployment/ -Force -ErrorAction SilentlyContinue
Move-Item -Path README.md -Destination docs/ -Force -ErrorAction SilentlyContinue

# Move configuration files
Move-Item -Path .env.example -Destination config/ -Force -ErrorAction SilentlyContinue
Move-Item -Path .npmrc -Destination config/ -Force -ErrorAction SilentlyContinue
Move-Item -Path .nvmrc -Destination config/ -Force -ErrorAction SilentlyContinue
Move-Item -Path .prettierignore -Destination config/ -Force -ErrorAction SilentlyContinue
Move-Item -Path .npmignore -Destination config/ -Force -ErrorAction SilentlyContinue

# Create new documentation files
Set-Content -Path docs/api/README.md -Value "# API Documentation"
Set-Content -Path docs/deployment/README.md -Value "# Deployment Guide"
Set-Content -Path docs/deployment/ci-cd.md -Value "# CI/CD Pipeline"
Set-Content -Path docs/setup.md -Value "# Development Environment Setup"
Set-Content -Path docs/contributing.md -Value "# Contributing Guidelines"
Set-Content -Path docs/security.md -Value "# Security Guidelines"

# Update .gitignore
$gitignoreContent = @"
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
"@

Set-Content -Path .gitignore -Value $gitignoreContent

# Create deployment scripts
$deployContent = @"
# Deploy application
Write-Host "Deploying application..."
amplify push
"@

$rollbackContent = @"
# Rollback to previous version
Write-Host "Rolling back to previous version..."
amplify rollback
"@

Set-Content -Path scripts/deployment/deploy.ps1 -Value $deployContent
Set-Content -Path scripts/deployment/rollback.ps1 -Value $rollbackContent

Write-Host "Project structure reorganized successfully!" 