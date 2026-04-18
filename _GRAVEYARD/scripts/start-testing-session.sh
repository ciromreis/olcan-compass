#!/bin/bash
# Quick start script for human testing session
# Run from repo root: ./scripts/start-testing-session.sh

set -e

echo "🚀 Starting Olcan v2.5 Testing Session..."
echo ""

# Check if backend is running
if lsof -i :8000 > /dev/null 2>&1; then
    echo "✅ Backend already running on port 8000"
else
    echo "⚠️  Backend not running. Start it manually:"
    echo "   cd apps/api-core-v2.5"
    echo "   uvicorn app.main:app --reload --port 8000"
    echo ""
    exit 1
fi

# Check if frontend is running
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ Frontend already running on port 3000"
else
    echo "🔧 Starting frontend..."
    cd apps/app-compass-v2.5
    
    # Start in background
    pnpm dev > /tmp/olcan-frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    echo "⏳ Waiting for frontend to start..."
    sleep 5
    
    if lsof -i :3000 > /dev/null 2>&1; then
        echo "✅ Frontend started (PID: $FRONTEND_PID)"
    else
        echo "❌ Frontend failed to start. Check logs:"
        echo "   tail -f /tmp/olcan-frontend.log"
        exit 1
    fi
    
    cd ../..
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Testing environment ready!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Local URL: http://localhost:3000"
echo ""
echo "🌐 To create a shareable public link:"
echo ""
echo "   Option 1: ngrok (temporary, 2 hours)"
echo "   $ brew install ngrok"
echo "   $ ngrok http 3000"
echo ""
echo "   Option 2: Vercel (longer-lasting)"
echo "   $ cd apps/app-compass-v2.5"
echo "   $ vercel"
echo ""
echo "📋 Testing guide: 1_Pillars/03_Architecture/HUMAN_TESTING_GUIDE.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
