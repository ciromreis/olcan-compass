#!/usr/bin/env bash
set -euo pipefail

# Configuration
PROJECT_ID="14634864513938792818"
SCREEN_ID="7e29d262dfe74c37a3cff06494e33c93"
TARGET_DIR="stitch_assets"

mkdir -p "$TARGET_DIR"

# Retrieve download URLs using Stitch MCP CLI (assuming stitch-mcp is installed)
HTML_URL=$(stitch-mcp get-screen --project "$PROJECT_ID" --screen "$SCREEN_ID" --field htmlCode.downloadUrl)
IMG_URL=$(stitch-mcp get-screen --project "$PROJECT_ID" --screen "$SCREEN_ID" --field screenshot.downloadUrl)

# Download assets
curl -L "$HTML_URL" -o "$TARGET_DIR/screen.html"
curl -L "$IMG_URL" -o "$TARGET_DIR/screenshot.png"

echo "Assets downloaded to $TARGET_DIR"
