#!/bin/bash

# 🚀 Olcan Compass - Production Deployment Script
# This script deploys the Olcan Compass to production

echo "🎯 Olcan Compass - Production Deployment"
echo "=========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f "apps/api/.env" ]; then
    echo "❌ Environment file not found. Please configure apps/api/.env"
    echo "📋 Copy apps/api/.env.example to apps/api/.env and configure:"
    echo "   - SMTP settings for email service"
    echo "   - Database connection"
    echo "   - JWT secret key"
    echo "   - Production URLs"
    exit 1
fi

echo "✅ Environment file found"
echo "✅ Docker is running"
echo ""

# Build and deploy
echo "🔨 Building and deploying services..."
docker compose up --build -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "📊 Checking service status..."
docker compose ps

# Health checks
echo ""
echo "🏥 Performing health checks..."

# Check API health
echo "🔍 Checking API health..."
if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "✅ API health check passed"
else
    echo "❌ API health check failed"
    docker compose logs api
    exit 1
fi

# Check frontend
echo "🔍 Checking frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend health check passed"
else
    echo "❌ Frontend health check failed"
    docker compose logs web
    exit 1
fi

# Database check
echo "🔍 Checking database connection..."
if docker compose exec -T api python -c "from app.db.session import engine; print('Database OK')" > /dev/null 2>&1; then
    echo "✅ Database connection passed"
else
    echo "❌ Database connection failed"
    docker compose logs api
    exit 1
fi

echo ""
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo "========================"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 API: http://localhost:8000"
echo "📊 Health: http://localhost:8000/api/health"
echo ""
echo "📋 Next Steps:"
echo "1. Configure your domain DNS to point to your server"
echo "2. Update CORS_ALLOW_ORIGINS in .env for production domain"
echo "3. Set up SSL certificates"
echo "4. Test email service with password reset"
echo "5. Monitor application performance"
echo ""
echo "🎯 The Olcan Compass is now running!"
