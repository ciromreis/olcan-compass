#!/bin/bash

# Olcan Compass E2E Test Runner
# This script runs the E2E tests with the correct configuration

set -e

echo "🧭 Olcan Compass E2E Test Runner"
echo "================================="
echo ""

# Navigate to app directory
cd /Users/ciromoraes/Documents/THE-Code-Base/01_Olcan_Active/olcan-compass/apps/app-compass-v2.5

# Check if app is running
echo "🔍 Checking if app is running..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    APP_URL="http://localhost:3000"
    echo "✅ App found on port 3000"
elif curl -s http://localhost:3001 > /dev/null 2>&1; then
    APP_URL="http://localhost:3001"
    echo "✅ App found on port 3001"
elif curl -s http://localhost:3002 > /dev/null 2>&1; then
    APP_URL="http://localhost:3002"
    echo "✅ App found on port 3002"
else
    echo "❌ App is not running!"
    echo ""
    echo "Start the app first:"
    echo "  cd /Users/ciromoraes/Documents/THE-Code-Base/01_Olcan_Active/olcan-compass"
    echo "  pnpm dev:v2.5"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo ""
echo "🚀 Running E2E tests against: $APP_URL"
echo ""

# Run verification test
echo "📝 Running verification test..."
APP_URL=$APP_URL npx playwright test quick-verify.spec.ts --project=chromium --reporter=list

echo ""
echo "✅ Tests complete!"
echo ""
echo "📊 View results:"
echo "  - Screenshots: ls -lh screenshots/"
echo "  - HTML Report: npx playwright show-report"
echo ""
