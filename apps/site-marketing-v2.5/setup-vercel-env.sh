#!/bin/bash
# Setup Vercel Environment Variables for Marketing Site
# Run this script to configure all necessary environment variables

echo "🚀 Setting up Vercel environment variables for site-marketing-v2.5"
echo ""

# Essential variables for the site to work
echo "Setting NEXT_PUBLIC_SITE_URL..."
echo "https://www.olcan.com.br" | vercel env add NEXT_PUBLIC_SITE_URL production

echo "Setting NEXT_PUBLIC_API_URL..."
echo "https://api.olcan.com.br/api/v1" | vercel env add NEXT_PUBLIC_API_URL production

echo "Setting NEXT_PUBLIC_MARKETPLACE_API_URL..."
echo "https://marketplace.olcan.com.br" | vercel env add NEXT_PUBLIC_MARKETPLACE_API_URL production

echo "Setting NEXT_PUBLIC_MEDUSA_URL..."
echo "http://localhost:9000" | vercel env add NEXT_PUBLIC_MEDUSA_URL production

echo "Setting EMAIL_FROM..."
echo "contato@olcan.com.br" | vercel env add EMAIL_FROM production

echo ""
echo "✅ Essential environment variables set!"
echo ""
echo "⚠️  Note: Payload CMS variables (PAYLOAD_SECRET, JWT_SECRET, DATABASE_URI)"
echo "   need to be set manually in the Vercel dashboard for security."
echo ""
echo "🔗 Go to: https://vercel.com/dashboard → site-marketing-v25 → Settings → Environment Variables"
echo ""
