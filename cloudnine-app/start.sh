#!/bin/bash

# Cloudnine Insurance Platform - Startup Script
# Usage: ./start.sh

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║           🏥  CLOUDNINE INSURANCE PLATFORM                     ║"
echo "║                                                                ║"
echo "║           Starting server...                                   ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo -e "${YELLOW}⚠️  Warning: Node.js version is below 14. Please upgrade.${NC}"
fi

echo -e "${BLUE}✓ Node.js version:${NC} $(node --version)"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo ""
    echo -e "${YELLOW}📦 Installing dependencies for the first time...${NC}"
    echo "This may take a few minutes..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Installation failed. Please check your Node.js installation.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"
    echo ""
fi

echo -e "${GREEN}🚀 Starting server...${NC}"
echo ""
node server.js
