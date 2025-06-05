#!/usr/bin/env node

/**
 * AWS Amplify Gen2 Deployment Script
 * 
 * This script automates the deployment process to AWS Amplify Gen2
 * and includes validation steps to ensure successful deployment.
 * 
 * Usage:
 * node scripts/deploy-amplify.js [environment]
 * 
 * Environment options: dev, staging, prod (defaults to dev)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const ENV_MAP = {
  dev: 'development',
  staging: 'staging',
  prod: 'production'
};

// Get environment from command line args
const args = process.argv.slice(2);
const envArg = args[0] || 'dev';
const environment = ENV_MAP[envArg] || 'development';

// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Utility functions
function executeCommand(command, errorMessage) {
  try {
    console.log(`Executing: ${command}`);
    return execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\n❌ ${errorMessage || 'Command failed'}`);
    console.error(error);
    process.exit(1);
  }
}

function checkFileExists(filePath, errorMessage) {
  if (!fs.existsSync(filePath)) {
    console.error(`\n❌ ${errorMessage || `File not found: ${filePath}`}`);
    process.exit(1);
  }
}

// Main deployment process
async function deploy() {
  console.log(`\n🚀 Starting deployment to ${environment} environment\n`);

  // Step 1: Validate project structure
  console.log('Step 1: Validating project structure...');
  checkFileExists('amplify.gen2.yml', 'amplify.gen2.yml not found. Please create this file first.');
  checkFileExists('frontend/package.json', 'frontend/package.json not found. Is this a monorepo structure?');
  
  // Step 2: Install dependencies
  console.log('\nStep 2: Installing dependencies...');
  executeCommand('npm ci', 'Failed to install root dependencies');
  executeCommand('cd frontend && npm ci', 'Failed to install frontend dependencies');
  
  // Step 3: Run tests
  console.log('\nStep 3: Running tests...');
  executeCommand('cd frontend && npm run test:ci', 'Tests failed. Please fix failing tests before deploying.');
  
  // Step 4: Build application
  console.log('\nStep 4: Building application...');
  executeCommand(`cd frontend && VITE_APP_ENV=${environment} npm run build`, 'Build failed');
  
  // Step 5: Validate build output
  console.log('\nStep 5: Validating build output...');
  checkFileExists('frontend/dist/index.html', 'Build output does not contain index.html');
  
  // Step 6: Configure AWS Amplify
  console.log('\nStep 6: Configuring AWS Amplify...');
  
  // Prompt for confirmation
  await new Promise(resolve => {
    rl.question(`\n⚠️ Ready to deploy to ${environment} environment. Continue? (y/n): `, (answer) => {
      if (answer.toLowerCase() !== 'y') {
        console.log('Deployment cancelled.');
        process.exit(0);
      }
      resolve();
    });
  });
  
  // Step 7: Deploy to AWS Amplify
  console.log('\nStep 7: Deploying to AWS Amplify...');
  try {
    console.log('Using AWS Amplify Gen2...');
    console.log('To deploy, run the following AWS CLI command:');
    console.log(`aws amplify start-deployment --app-id YOUR_AMPLIFY_APP_ID --branch-name ${environment === 'production' ? 'main' : environment}`);
    console.log('\nOr deploy via AWS Amplify Console');
  } catch (error) {
    console.error('\n❌ Deployment failed:');
    console.error(error);
    process.exit(1);
  }
  
  console.log('\n✅ Deployment preparation completed successfully!');
  console.log(`\nNext steps:
  1. Upload the deployment package to AWS Amplify Console
  2. Monitor the deployment in the Amplify Console
  3. Verify the application is working correctly after deployment`);
  
  rl.close();
}

// Run the deployment process
deploy().catch(error => {
  console.error('\n❌ Deployment failed with an unexpected error:');
  console.error(error);
  process.exit(1); 