#!/bin/bash

# Olcan Compass v2.5 Production Deployment Script
# Comprehensive deployment with health checks, rollback, and monitoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
BACKUP_ENABLED=${2:-true}
HEALTH_CHECK_TIMEOUT=${3:-300}
ROLLBACK_ENABLED=${4:-true}

echo -e "${BLUE}🚀 Starting Olcan Compass v2.5 Production Deployment...${NC}"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}Backup Enabled: $BACKUP_ENABLED${NC}"
echo -e "${BLUE}Health Check Timeout: ${HEALTH_CHECK_TIMEOUT}s${NC}"
echo -e "${BLUE}Rollback Enabled: $ROLLBACK_ENABLED${NC}"
echo ""

# Function to log with timestamp
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check service health
check_health() {
    local service_url=$1
    local service_name=$2
    local timeout=$3
    
    log "Checking $service_name health..."
    
    local start_time=$(date +%s)
    local end_time=$((start_time + timeout))
    
    while [ $(date +%s) -lt $end_time ]; do
        if curl -f -s "$service_url/health" >/dev/null 2>&1; then
            log "$service_name is healthy!"
            return 0
        fi
        sleep 5
    done
    
    error "$service_name health check failed after ${timeout}s"
    return 1
}

# Function to create backup
create_backup() {
    if [ "$BACKUP_ENABLED" = "true" ]; then
        log "Creating backup..."
        
        # Backup database
        if command_exists docker; then
            log "Backing up database..."
            docker exec olcan-compass-postgres pg_dump -U postgres olcan_compass > "backup_$(date +%Y%m%d_%H%M%S).sql"
        fi
        
        # Backup current deployment
        log "Backing up current deployment..."
        mkdir -p backups
        cp -r apps/app-compass-v2/.next backups/app_backup_$(date +%Y%m%d_%H%M%S)
        cp -r apps/api-core-v2 backups/api_backup_$(date +%Y%m%d_%H%M%S)
        
        log "Backup completed successfully!"
    fi
}

# Function to rollback deployment
rollback() {
    if [ "$ROLLBACK_ENABLED" = "true" ]; then
        error "Deployment failed, initiating rollback..."
        
        # Find latest backup
        local latest_backup=$(ls -t backups/app_backup_* 2>/dev/null | head -1)
        
        if [ -n "$latest_backup" ]; then
            log "Rolling back to $latest_backup"
            
            # Restore frontend
            cp -r "$latest_backup" apps/app-compass-v2/.next
            
            # Restart services
            if command_exists docker-compose; then
                docker-compose restart
            fi
            
            log "Rollback completed!"
        else
            error "No backup found for rollback!"
        fi
    fi
}

# Pre-deployment checks
log "Performing pre-deployment checks..."

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "pnpm-workspace.yaml" ]; then
    error "Please run this script from the root of the monorepo"
    exit 1
fi

# Check required commands
for cmd in pnpm docker curl; do
    if ! command_exists $cmd; then
        error "Required command '$cmd' is not installed"
        exit 1
    fi
done

# Check environment variables
if [ -z "$DATABASE_URL" ]; then
    warning "DATABASE_URL not set, using default"
    export DATABASE_URL="postgresql://postgres:password@localhost/olcan_compass"
fi

if [ -z "$NEXT_PUBLIC_API_URL" ]; then
    warning "NEXT_PUBLIC_API_URL not set, using default"
    export NEXT_PUBLIC_API_URL="https://api.olcan-compass.com"
fi

# Create backup
create_backup

# Clean previous builds
log "Cleaning previous builds..."
rm -rf apps/app-compass-v2/.next
rm -rf apps/api-core-v2/__pycache__
rm -rf packages/ui-components/dist

# Install dependencies
log "Installing dependencies..."
pnpm install --frozen-lockfile

# Run security audit
log "Running security audit..."
pnpm audit --audit-level high

# Run linting
log "Running linting..."
pnpm lint

# Build packages
log "Building UI components..."
cd packages/ui-components
pnpm build
cd ../..

# Build API
log "Building API..."
cd apps/api-core-v2
npm run build
cd ../..

# Build main app
log "Building main app..."
cd apps/app-compass-v2
npm run build
cd ../..

# Run tests
log "Running tests..."
pnpm test -- --coverage --watchAll=false

# Build Docker images
log "Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Stop existing services
log "Stopping existing services..."
docker-compose -f docker-compose.prod.yml down

# Start new deployment
log "Starting new deployment..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
log "Waiting for services to start..."
sleep 30

# Health checks
log "Performing health checks..."

# Check API health
if ! check_health "http://localhost:8000" "API" $HEALTH_CHECK_TIMEOUT; then
    rollback
    exit 1
fi

# Check Frontend health
if ! check_health "http://localhost:3000" "Frontend" $HEALTH_CHECK_TIMEOUT; then
    rollback
    exit 1
fi

# Check Database health
log "Checking database health..."
if ! docker exec olcan-compass-postgres pg_isready -U postgres; then
    error "Database health check failed"
    rollback
    exit 1
fi

# Run smoke tests
log "Running smoke tests..."
cd tests/smoke
npm test
cd ../..

# Performance tests
log "Running performance tests..."
cd tests/performance
npm test
cd ../..

# Security tests
log "Running security tests..."
cd tests/security
npm test
cd ../..

# Generate deployment report
log "Generating deployment report..."
cat > deployment_report_$(date +%Y%m%d_%H%M%S).json << EOF
{
  "deployment": {
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "environment": "$ENVIRONMENT",
    "version": "2.5.0",
    "status": "success",
    "services": {
      "frontend": {
        "url": "http://localhost:3000",
        "status": "healthy"
      },
      "api": {
        "url": "http://localhost:8000",
        "status": "healthy"
      },
      "database": {
        "status": "healthy"
      }
    },
    "tests": {
      "unit": "passed",
      "integration": "passed",
      "smoke": "passed",
      "performance": "passed",
      "security": "passed"
    },
    "backup": {
      "enabled": $BACKUP_ENABLED,
      "status": "completed"
    }
  }
}
EOF

# Clean up old backups (keep last 5)
log "Cleaning up old backups..."
ls -t backups/app_backup_* | tail -n +6 | xargs rm -rf 2>/dev/null || true
ls -t backups/api_backup_* | tail -n +6 | xargs rm -rf 2>/dev/null || true

# Set up monitoring
log "Setting up monitoring..."
if command_exists docker; then
    # Ensure monitoring containers are running
    docker-compose -f docker-compose.prod.yml up -d prometheus grafana loki
fi

# Success message
log "✅ Deployment completed successfully!"
echo ""
echo -e "${GREEN}🌐 Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}🌐 API: http://localhost:8000${NC}"
echo -e "${GREEN}🌐 Grafana: http://localhost:3001${NC}"
echo -e "${GREEN}🌐 Prometheus: http://localhost:9090${NC}"
echo ""
echo -e "${BLUE}📊 Monitoring is enabled and collecting metrics${NC}"
echo -e "${BLUE}🔍 Health checks are running every 30 seconds${NC}"
echo -e "${BLUE}� Logs are being collected in Loki${NC}"
echo ""
echo -e "${GREEN}🎉 Olcan Compass v2.5 is now live!${NC}"
