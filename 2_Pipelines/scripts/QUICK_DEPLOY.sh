#!/bin/bash

# Quick Deployment Script for Olcan Compass
# Simple deployment that works

set -e

echo "🚀 Starting Quick Deployment of Olcan Compass..."

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "pnpm-workspace.yaml" ]; then
    echo "❌ Error: Please run this script from the root of the monorepo"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build UI components
echo "🔨 Building UI components..."
cd packages/ui-components
npm run build
cd ../..

# Build frontend
echo "🔨 Building frontend..."
cd apps/app-compass-v2
npm run build
cd ../..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd apps/api-core-v2
pip install -r requirements.txt
cd ../..

# Create environment files if they don't exist
echo "🔧 Setting up environment..."
if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
# Frontend Environment
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1/ws
NEXT_PUBLIC_APP_NAME=Olcan Compass
NEXT_PUBLIC_APP_VERSION=2.5.0

# Backend Environment
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost/olcan_compass
REDIS_URL=redis://localhost:6379/0
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO
EOF
fi

# Create .env for backend
if [ ! -f "apps/api-core-v2/.env" ]; then
    cat > apps/api-core-v2/.env << EOF
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost/olcan_compass
REDIS_URL=redis://localhost:6379/0
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO
SECRET_KEY=your-secret-key-here
EOF
fi

echo "✅ Quick deployment completed successfully!"
echo ""
echo "🌐 To start the application:"
echo "1. Start PostgreSQL and Redis"
echo "2. Run: cd apps/api-core-v2 && python -m uvicorn app.main_real:app --reload --host 0.0.0.0 --port 8000"
echo "3. Run: cd apps/app-compass-v2 && npm run dev"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🌐 API: http://localhost:8000"
echo "🌐 API Docs: http://localhost:8000/docs"
echo ""
echo "🎉 Olcan Compass is ready to run!"
