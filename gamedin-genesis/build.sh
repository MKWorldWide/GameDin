#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting GameDin build process..."

# Install dependencies with legacy peer deps
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"
