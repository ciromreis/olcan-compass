#!/bin/bash
# Olcan Compass v2.5 - Deployment Script
# Automated deployment for frontend application

set -e

echo "🚀 Olcan Compass v2.5 - Deployment Script"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_DIR="apps/app-compass-v2"
BACKEND_DIR="apps/api-core-v2"
DOCS_DIR="00_Mission_Control"

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if we're in the right directory
if [ ! -d "$FRONTEND_DIR" ]; then
    print_error "Frontend directory not found. Are you in the project root?"
    exit 1
fi

echo ""
echo "📋 Pre-deployment Checklist"
echo "----------------------------"

# Check Node.js version
NODE_VERSION=$(node -v)
print_success "Node.js version: $NODE_VERSION"

# Check npm version
NPM_VERSION=$(npm -v)
print_success "npm version: $NPM_VERSION"

# Check if .env.production exists
if [ -f "$FRONTEND_DIR/.env.production" ]; then
    print_success ".env.production file found"
else
    print_warning ".env.production not found - using .env.production.example as template"
    if [ -f "$FRONTEND_DIR/.env.production.example" ]; then
        echo "Please create .env.production from .env.production.example"
        echo "Would you like to copy it now? (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            cp "$FRONTEND_DIR/.env.production.example" "$FRONTEND_DIR/.env.production"
            print_success "Created .env.production - please edit with your values"
            echo "Opening .env.production for editing..."
            ${EDITOR:-nano} "$FRONTEND_DIR/.env.production"
        fi
    fi
fi

echo ""
echo "🔨 Building Frontend"
echo "--------------------"

cd "$FRONTEND_DIR"

# Install dependencies
echo "Installing dependencies..."
npm install

# Run build
echo "Building application..."
if npm run build; then
    print_success "Frontend build successful!"
else
    print_error "Frontend build failed!"
    exit 1
fi

# Check build output
if [ -d ".next" ]; then
    BUILD_SIZE=$(du -sh .next | cut -f1)
    print_success "Build output size: $BUILD_SIZE"
else
    print_error "Build output directory not found!"
    exit 1
fi

cd ../..

echo ""
echo "📊 Build Summary"
echo "----------------"
print_success "Frontend: Built successfully"
print_success "Build directory: $FRONTEND_DIR/.next"

echo ""
echo "🎯 Next Steps"
echo "-------------"
echo "1. Review build output above"
echo "2. Test locally: cd $FRONTEND_DIR && npm run start"
echo "3. Deploy to hosting platform (Vercel, Netlify, etc.)"
echo ""
echo "📚 Documentation"
echo "----------------"
echo "- Deployment Guide: $DOCS_DIR/FINAL_DEPLOYMENT_SUMMARY.md"
echo "- Testing Guide: $DOCS_DIR/INTEGRATION_TESTING_GUIDE.md"
echo "- Backend Fix: $DOCS_DIR/BACKEND_MODEL_FIX_GUIDE.md"
echo ""
print_success "Deployment preparation complete! 🎉"
