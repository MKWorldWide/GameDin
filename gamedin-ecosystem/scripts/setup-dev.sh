#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to the project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${YELLOW}🚀 Setting up GameDin development environment...${NC}"

# Check for required tools
check_command() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${YELLOW}⚠️  $1 is not installed. Installing...${NC}"
    return 1
  fi
  return 0
}

# Install pnpm if not already installed
if ! check_command pnpm; then
  if check_command npm; then
    npm install -g pnpm
  elif check_command yarn; then
    yarn global add pnpm
  else
    echo -e "${YELLOW}⚠️  npm or yarn is required to install pnpm. Please install Node.js first.${NC}"
    exit 1
  fi
fi

# Install Node.js dependencies
echo -e "\n${GREEN}📦 Installing project dependencies...${NC}"
pnpm install --frozen-lockfile

# Install package dependencies in parallel
echo -e "\n${GREEN}🔄 Setting up workspace packages...${NC}"
for PACKAGE in packages/*; do
  if [ -f "$PACKAGE/package.json" ]; then
    echo -e "\n${GREEN}📦 Setting up ${PACKAGE##*/}...${NC}"
    cd "$PACKAGE"
    pnpm install --frozen-lockfile
    cd "$PROJECT_ROOT"
  fi
done

# Set up environment files
if [ ! -f ".env" ]; then
  echo -e "\n${GREEN}🔧 Creating .env file...${NC}"
  cp .env.example .env
  echo -e "${YELLOW}ℹ️  Please update the .env file with your configuration.${NC}"
fi

# Set up git hooks if not already set up
if [ ! -d ".husky" ]; then
  echo -e "\n${GREEN}🔧 Setting up Git hooks...${NC}"
  pnpm prepare
fi

# Build all packages
echo -e "\n${GREEN}🔨 Building packages...${NC}"
pnpm build

# Run type checking
echo -e "\n${GREEN}🔍 Running type checking...${NC}"
pnpm typecheck

# Run tests
echo -e "\n${GREEN}🧪 Running tests...${NC}"
pnpm test

echo -e "\n${GREEN}✅ Development environment setup complete!${NC}"
echo -e "\nTo start the development servers, run:"
echo -e "  ${YELLOW}pnpm dev${NC}  # Start all services in development mode\n"
echo -e "Or start individual services:"
echo -e "  ${YELLOW}cd packages/api && pnpm dev${NC}        # API server"
echo -e "  ${YELLOW}cd apps/web && pnpm dev${NC}           # Web application\n"
echo -e "Other useful commands:"
echo -e "  ${YELLOW}pnpm lint${NC}                        # Lint all packages"
echo -e "  ${YELLOW}pnpm test${NC}                        # Run all tests"
echo -e "  ${YELLOW}pnpm build${NC}                       # Build all packages"
echo -e "  ${YELLOW}pnpm changeset${NC}                   # Create a changeset for versioning\n"
