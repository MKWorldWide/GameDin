#!/bin/bash

# Exit on error
set -e

# Build the application
echo "🚀 Building the application..."
npm run build

# Create .env.production if it doesn't exist
if [ ! -f .env.production ]; then
    echo "🔧 Creating .env.production file..."
    cat > .env.production <<EOL
VITE_API_URL=https://api.mkww.studio
VITE_APP_ENV=production
VITE_APP_VERSION=$(date +%Y%m%d%H%M%S)
EOL
fi

echo "✅ Build complete!"
echo "📦 The application is ready for deployment to AWS Amplify"
echo "
Next steps:
1. Push these changes to your repository
2. Go to AWS Amplify Console
3. Connect your repository
4. Select the main branch
5. Review the build settings (use the amplify.yml we created)
6. Deploy!"
