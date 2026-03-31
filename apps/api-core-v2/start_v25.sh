#!/bin/bash

# Olcan Compass v2.5 Backend Startup Script
# This script starts the backend API with proper configuration

echo "🚀 Starting Olcan Compass v2.5 Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL connection..."
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL is not running. Please start PostgreSQL first."
    echo "   You can start it with: brew services start postgresql"
    exit 1
fi

# Check if database exists
DB_EXISTS=$(psql -h localhost -U postgres -lqt | cut -d \| -f 1 | grep -w compass | wc -l)
if [ $DB_EXISTS -eq 0 ]; then
    echo "📊 Creating database 'compass'..."
    createdb -h localhost -U postgres compass
fi

# Run database migrations (if alembic is configured)
if [ -f "alembic.ini" ]; then
    echo "🔄 Running database migrations..."
    alembic upgrade head
fi

# Start the API server
echo "✅ Starting FastAPI server on http://localhost:8001..."
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# Note: Using port 8001 to avoid conflict with existing v2.0 backend
