#!/bin/bash

# Build and Run Script for Olcan Compass
# Simple deployment that works

set -e

echo "🚀 Building and Running Olcan Compass..."

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "pnpm-workspace.yaml" ]; then
    echo "❌ Error: Please run this script from the root of the monorepo"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build frontend without TypeScript checking
echo "🔨 Building frontend..."
cd apps/app-compass-v2
NEXT_BUILD_ESLINT=false npm run build
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

echo "✅ Build completed successfully!"
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

# Ask if user wants to start the services
read -p "Do you want to start the services now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting services..."
    
    # Start backend in background
    echo "🔧 Starting backend..."
    cd apps/api-core-v2
    python -m uvicorn app.main_real:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    cd ../..
    
    # Wait for backend to start
    sleep 3
    
    # Start frontend
    echo "🎨 Starting frontend..."
    cd apps/app-compass-v2
    npm run dev &
    FRONTEND_PID=$!
    cd ../..
    
    echo ""
    echo "🌐 Services started:"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🌐 API: http://localhost:8000"
    echo "🌐 API Docs: http://localhost:8000/docs"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Wait for user to stop
    trap "echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
    wait
fi
