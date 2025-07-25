#!/bin/bash
set -e

# Install dependencies
echo "🚀 Installing dependencies..."
npm ci --legacy-peer-deps

# Build the application
echo "🔨 Building application..."
npm run build

# Ensure the dist directory exists and contains built files
echo "📂 Verifying build output..."
if [ ! -d "dist" ]; then
  echo "❌ Error: Build output directory 'dist' not found!"
  exit 1
fi

# List the contents of the dist directory for debugging
echo "📋 Build output contents:"
ls -la dist/

echo "✅ Build completed successfully!"
# The build artifacts should be in the 'dist' directory
