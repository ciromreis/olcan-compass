#!/bin/bash

# Start Olcan Compass Application
echo "🚀 Starting Olcan Compass Application..."

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "pnpm-workspace.yaml" ]; then
    echo "❌ Error: Please run this script from the root of the monorepo"
    exit 1
fi

# Create environment files if they don't exist
echo "🔧 Setting up environment..."
if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
# Frontend Environment
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1/ws
NEXT_PUBLIC_APP_NAME=Olcan Compass
NEXT_PUBLIC_APP_VERSION=2.5.0
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

echo "🌐 Starting services..."

# Start backend in background
echo "🔧 Starting backend..."
cd apps/api-core-v2
python -m uvicorn app.main_real:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ../..

# Wait for backend to start
sleep 5

# Check if backend is running
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend started successfully!"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend
echo "🎨 Starting frontend..."
cd apps/app-compass-v2
npm run dev &
FRONTEND_PID=$!
cd ../..

# Wait for frontend to start
sleep 10

echo ""
echo "🎉 Olcan Compass is now running!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🌐 API: http://localhost:8000"
echo "🌐 API Docs: http://localhost:8000/docs"
echo "🌐 Health Check: http://localhost:8000/health"
echo ""
echo "🎯 Features Available:"
echo "  🐉 Companion System - Create and care for your AI companion"
echo "  👥 Social Features - Join guilds and participate in battles"
echo "  🛒 Marketplace - Virtual economy and trading"
echo "  🎥 YouTube Studio - Video recording and upload"
echo "  📝 Document System - AI-powered document analysis"
echo "  🎤 Interview Practice - AI interview simulator"
echo "  🎮 Gamification - Achievements, quests, and rewards"
echo "  🔊 Audio System - Sound effects and music"
echo "  📊 Analytics - User behavior tracking"
echo "  ⚡ Performance Monitoring - Real-time performance metrics"
echo ""
echo "🔥 Press Ctrl+C to stop all services"
echo ""

# Wait for user to stop
trap "echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
