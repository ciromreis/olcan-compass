#!/bin/bash

# Start Unified PostgreSQL Database for Olcan Compass
# This script starts PostgreSQL container and sets up schemas

set -e

echo "🚀 Starting Olcan Unified Database Setup..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="olcan-postgres"
POSTGRES_PASSWORD="olcan_postgres_2026"
POSTGRES_DB="olcan_production"
POSTGRES_PORT="5432"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if container already exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}⚠️  Container ${CONTAINER_NAME} already exists.${NC}"
    
    # Check if it's running
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo -e "${GREEN}✅ Container is already running.${NC}"
    else
        echo "🔄 Starting existing container..."
        docker start ${CONTAINER_NAME}
        echo -e "${GREEN}✅ Container started.${NC}"
    fi
else
    echo "📦 Creating new PostgreSQL container..."
    docker run -d \
        --name ${CONTAINER_NAME} \
        -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
        -e POSTGRES_DB=${POSTGRES_DB} \
        -p ${POSTGRES_PORT}:5432 \
        -v olcan_postgres_data:/var/lib/postgresql/data \
        postgres:16
    
    echo -e "${GREEN}✅ Container created and started.${NC}"
    
    # Wait for PostgreSQL to be ready
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 5
    
    until docker exec ${CONTAINER_NAME} pg_isready -U postgres > /dev/null 2>&1; do
        echo "   Still waiting..."
        sleep 2
    done
    
    echo -e "${GREEN}✅ PostgreSQL is ready.${NC}"
fi

# Run setup SQL
echo "🔧 Setting up schemas and users..."
docker exec -i ${CONTAINER_NAME} psql -U postgres -d ${POSTGRES_DB} < "$(dirname "$0")/setup-unified-database.sql"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database setup complete!${NC}"
else
    echo -e "${RED}❌ Database setup failed.${NC}"
    exit 1
fi

# Display connection information
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}📊 Database Connection Information${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Database: ${POSTGRES_DB}"
echo "Port: ${POSTGRES_PORT}"
echo ""
echo "FastAPI Connection:"
echo "  DATABASE_URL=postgresql+asyncpg://olcan_app:olcan_app_secure_2026@localhost:5432/${POSTGRES_DB}"
echo ""
echo "MedusaJS Connection:"
echo "  DATABASE_URL=postgresql://olcan_medusa:olcan_medusa_secure_2026@localhost:5432/${POSTGRES_DB}?schema=medusa"
echo ""
echo "PayloadCMS Connection:"
echo "  DATABASE_URI=postgresql://olcan_payload:olcan_payload_secure_2026@localhost:5432/${POSTGRES_DB}?schema=payload"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}⚠️  Next Steps:${NC}"
echo "1. Update .env files with connection strings above"
echo "2. Run FastAPI migrations: cd apps/api-core-v2.5 && alembic upgrade head"
echo "3. Run MedusaJS migrations: cd olcan-marketplace/packages/api && npx medusa migrations run"
echo "4. Run cross-schema setup: psql ... < scripts/setup-cross-schema-links.sql"
echo ""
echo -e "${GREEN}✨ Database is ready for use!${NC}"
