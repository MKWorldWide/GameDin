#!/bin/bash

# Exit on error
set -e

echo "🔐 Setting up AWS credentials for Amplify..."

# Create or update AWS credentials
mkdir -p ~/.aws
cat > ~/.aws/credentials <<EOL
[default]
aws_access_key_id=AKIA3X7QKZ5Z5Z5Z5Z5X
aws_secret_access_key=YOUR_SECRET_ACCESS_KEY
EOL

# Set AWS region
export AWS_REGION=us-east-1

echo "🔧 Configuring Git for SSH access..."

# Configure Git to use SSH for GitHub
git config --global url."git@github.com:".insteadOf "https://github.com/"

# Add GitHub to known hosts
mkdir -p ~/.ssh
ssh-keyscan github.com >> ~/.ssh/known_hosts

echo "📦 Installing AWS CLI..."

# Install AWS CLI if not already installed
if ! command -v aws &> /dev/null; then
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
fi

echo "🔑 Configuring AWS SSM parameters..."

# Set up SSM parameters (replace with your actual values)
aws ssm put-parameter \
    --name "/amplify/do37rvqgawigz/main/REACT_APP_API_URL" \
    --value "https://api.mkww.studio" \
    --type "SecureString" \
    --overwrite

aws ssm put-parameter \
    --name "/amplify/do37rvqgawigz/main/REACT_APP_ENV" \
    --value "production" \
    --type "SecureString" \
    --overwrite

echo "✅ AWS and Git configuration complete!"
echo "🚀 You can now proceed with the deployment."
