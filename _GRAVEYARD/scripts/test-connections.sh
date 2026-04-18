#!/bin/bash
# Test database connections for all services

echo "Testing PostgreSQL connections..."
echo ""

# Test FastAPI connection (public schema)
echo "1. Testing FastAPI connection (public schema)..."
docker exec olcan-postgres psql -U olcan_app -d olcan_dev -c "SELECT current_schema(), current_user;" 2>&1 | grep -q "olcan_app" && echo "✅ FastAPI connection successful" || echo "❌ FastAPI connection failed"

# Test MedusaJS connection (medusa schema)
echo "2. Testing MedusaJS connection (medusa schema)..."
docker exec olcan-postgres psql -U olcan_medusa -d olcan_dev -c "SET search_path TO medusa; SELECT current_schema(), current_user;" 2>&1 | grep -q "olcan_medusa" && echo "✅ MedusaJS connection successful" || echo "❌ MedusaJS connection failed"

# Test Payload CMS connection (payload schema)
echo "3. Testing Payload CMS connection (payload schema)..."
docker exec olcan-postgres psql -U olcan_payload -d olcan_dev -c "SET search_path TO payload; SELECT current_schema(), current_user;" 2>&1 | grep -q "olcan_payload" && echo "✅ Payload CMS connection successful" || echo "❌ Payload CMS connection failed"

echo ""
echo "Listing all schemas..."
docker exec olcan-postgres psql -U postgres -d olcan_dev -c "\dn"

echo ""
echo "Database connection tests complete!"
