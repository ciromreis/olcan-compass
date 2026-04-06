# Environment Variables — Olcan Compass Ecosystem

**Last Updated:** April 6, 2026  
**Applies to:** v2.5 App, Marketing Site, FastAPI Backend, MedusaJS Marketplace

---

## Overview

This document defines all environment variables required across the Olcan Compass ecosystem. Each service has its own `.env` file, but many variables are shared or related.

### File Locations

```
olcan-compass/
├── apps/app-compass-v2.5/.env.local          # Main app (Next.js)
├── apps/site-marketing-v2.5/.env.local       # Marketing site (Next.js + Payload)
├── apps/api-core-v2.5/.env                   # FastAPI backend
└── olcan-marketplace/packages/api/.env       # MedusaJS backend
```

---

## 1. Shared Variables

These variables should have **consistent values** across all services.

### Database

```bash
# Single PostgreSQL instance with schema separation
DATABASE_URL=postgresql://user:password@host:5432/olcan_production

# Schema structure:
# - public.*           → FastAPI tables (users, routes, applications)
# - medusa.*           → MedusaJS tables (products, orders, customers)
# - payload.*          → Payload CMS tables (chronicles, pages, archetypes)
```

**Development:**
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/olcan_dev
```

**Production:**
```bash
DATABASE_URL=postgresql://olcan_user:${DB_PASSWORD}@db.olcan.com.br:5432/olcan_production
```

### Authentication (JWT)

```bash
# CRITICAL: Must be identical across all services
JWT_SECRET_KEY=<generate-with-openssl-rand-base64-32>
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
```

**Generate secure secret:**
```bash
openssl rand -base64 32
```

### Redis (Caching & Sessions)

```bash
REDIS_URL=redis://localhost:6379/0
```

**Production:**
```bash
REDIS_URL=redis://:${REDIS_PASSWORD}@redis.olcan.com.br:6379/0
```

---

## 2. App v2.5 (Next.js) — `apps/app-compass-v2.5/.env.local`

### Public Variables (Exposed to Browser)

```bash
# App URL
NEXT_PUBLIC_APP_URL=https://compass.olcan.com.br

# FastAPI Backend
NEXT_PUBLIC_API_URL=https://api.compass.olcan.com.br/api/v1

# MedusaJS Marketplace
NEXT_PUBLIC_MARKETPLACE_API_URL=https://marketplace.olcan.com.br

# Payload CMS (for content fetching)
NEXT_PUBLIC_CMS_URL=https://www.olcan.com.br

# Supabase (Optional — if using Supabase Auth)
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Feature Flags
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Private Variables (Server-side Only)

```bash
# Stripe (for payments)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Google Vertex AI (for Gemini)
GOOGLE_CLOUD_PROJECT=olcan-production
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Supabase Service Role (if using)
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Development Overrides

```bash
# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
NEXT_PUBLIC_MARKETPLACE_API_URL=http://localhost:9000
NEXT_PUBLIC_CMS_URL=http://localhost:3001
NEXT_PUBLIC_DEMO_MODE=true
```

---

## 3. Marketing Site (Next.js + Payload CMS) — `apps/site-marketing-v2.5/.env.local`

### Public Variables

```bash
# Site URL
NEXT_PUBLIC_SITE_URL=https://www.olcan.com.br

# MedusaJS Marketplace (for product fetching)
NEXT_PUBLIC_MEDUSA_URL=https://marketplace.olcan.com.br
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_live_...

# FastAPI Backend (for commerce bridge)
NEXT_PUBLIC_API_URL=https://api.compass.olcan.com.br/api/v1

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=123456789
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-123456789
```

### Private Variables (Payload CMS)

```bash
# Payload CMS Secret
PAYLOAD_SECRET=<generate-with-openssl-rand-base64-32>

# Database (same as shared DATABASE_URL)
DATABASE_URI=postgresql://user:password@host:5432/olcan_production

# Email (for transactional emails)
EMAIL_FROM=contato@olcan.com.br
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=<sendgrid-api-key>
```

### Development Overrides

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
PAYLOAD_SECRET=dev-secret-not-for-production
DATABASE_URI=postgresql://postgres:postgres@localhost:5432/olcan_dev
```

---

## 4. FastAPI Backend — `apps/api-core-v2.5/.env`

### Core Configuration

```bash
# Environment
NODE_ENV=production
ENV=production
LOG_LEVEL=INFO
DEBUG=false

# App
APP_NAME=olcan-compass-api
API_PREFIX=/api

# Database (PostgreSQL)
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/olcan_production
DATABASE_ECHO=false
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=40
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=1800

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT (must match other services)
JWT_SECRET_KEY=<same-as-shared-secret>
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS (comma-separated)
CORS_ALLOW_ORIGINS=https://compass.olcan.com.br,https://www.olcan.com.br,https://marketplace.olcan.com.br

# Frontend URL (for email links)
FRONTEND_URL=https://compass.olcan.com.br

# Email (SMTP)
EMAIL_FROM=noreply@olcan.com.br
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=<sendgrid-api-key>
SMTP_USE_TLS=true
SMTP_USE_SSL=false

# Stripe Connect (for escrow)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Encryption (for PII)
ENCRYPTION_KEY=<generate-32-byte-key>

# Password Policy
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_NUMBER=true

# Security
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=30

# Feature Flags
FEATURE_CREDENTIALS_ENABLED=true
FEATURE_TEMPORAL_MATCHING_ENABLED=true
FEATURE_OPPORTUNITY_COST_ENABLED=true
FEATURE_ESCROW_ENABLED=true
FEATURE_SCENARIO_OPTIMIZATION_ENABLED=true
```

### Development Overrides

```bash
ENV=development
DEBUG=true
LOG_LEVEL=DEBUG
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/olcan_dev
CORS_ALLOW_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:9000
FRONTEND_URL=http://localhost:3000
```

---

## 5. MedusaJS Marketplace — `olcan-marketplace/packages/api/.env`

### Core Configuration

```bash
# Database (same as shared DATABASE_URL)
DATABASE_URL=postgresql://user:password@host:5432/olcan_production

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT & Cookies (must match other services)
JWT_SECRET=<same-as-JWT_SECRET_KEY>
COOKIE_SECRET=<generate-with-openssl-rand-base64-32>

# CORS (comma-separated)
STORE_CORS=https://compass.olcan.com.br,https://www.olcan.com.br
ADMIN_CORS=https://admin.olcan.com.br
VENDOR_CORS=https://vendor.olcan.com.br
AUTH_CORS=https://admin.olcan.com.br,https://vendor.olcan.com.br

# Stripe Payment Provider
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Admin Email (for initial setup)
ADMIN_EMAIL=admin@olcan.com.br
ADMIN_PASSWORD=<generate-secure-password>
```

### Development Overrides

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/olcan_dev
STORE_CORS=http://localhost:3000,http://localhost:3001
ADMIN_CORS=http://localhost:7000
VENDOR_CORS=http://localhost:7001
AUTH_CORS=http://localhost:7000,http://localhost:7001
JWT_SECRET=dev-secret-not-for-production
COOKIE_SECRET=dev-cookie-secret-not-for-production
```

---

## 6. Security Best Practices

### Secret Generation

```bash
# JWT Secret (32 bytes)
openssl rand -base64 32

# Encryption Key (32 bytes)
openssl rand -hex 32

# Cookie Secret (32 bytes)
openssl rand -base64 32

# Payload Secret (UUID format)
uuidgen | tr '[:upper:]' '[:lower:]'
```

### Secret Rotation

**When to rotate:**
- Immediately if exposed in repository
- Every 90 days (scheduled)
- After security incident
- When team member leaves

**How to rotate:**
1. Generate new secret
2. Update all `.env` files
3. Deploy with blue-green strategy
4. Invalidate old tokens (if applicable)

### Storage

**Development:**
- Store in `.env.local` (gitignored)
- Share via 1Password or similar

**Production:**
- Store in Vercel/Netlify environment variables
- Store in AWS Secrets Manager / GCP Secret Manager
- Never commit to repository

---

## 7. Validation

### Pre-deployment Checklist

```bash
# Check all required variables are set
□ DATABASE_URL is PostgreSQL (not SQLite)
□ JWT_SECRET_KEY is not default value
□ STRIPE_SECRET_KEY is live key (not test)
□ PAYLOAD_SECRET is not default value
□ CORS_ALLOW_ORIGINS includes production URLs
□ All secrets are rotated from defaults
□ No secrets committed to git
```

### Runtime Validation

**FastAPI** (`apps/api-core-v2.5/app/core/config.py`):
```python
def validate_runtime_configuration(self) -> None:
    insecure_defaults = {
        "jwt_secret_key": "change-this-to-a-secure-random-string-in-production",
        "stripe_secret_key": "sk_test_your_stripe_secret_key",
        # ...
    }
    
    if self.is_production:
        invalid_fields = [
            field_name
            for field_name, insecure_value in insecure_defaults.items()
            if getattr(self, field_name) == insecure_value
        ]
        
        if invalid_fields:
            raise ValueError(f"Production config has insecure defaults: {invalid_fields}")
```

---

## 8. Common Issues

### Issue: CORS Errors

**Symptom:** `Access-Control-Allow-Origin` error in browser console

**Solution:**
1. Check `CORS_ALLOW_ORIGINS` includes requesting domain
2. Ensure no trailing slashes in URLs
3. Verify protocol matches (http vs https)

### Issue: Database Connection Failed

**Symptom:** `Connection refused` or `Authentication failed`

**Solution:**
1. Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
2. Check database is running: `psql $DATABASE_URL`
3. Verify firewall allows connection
4. Check connection pool settings

### Issue: JWT Token Invalid

**Symptom:** `401 Unauthorized` or `Invalid token`

**Solution:**
1. Verify `JWT_SECRET_KEY` is identical across all services
2. Check token expiration time
3. Verify token format: `Bearer <token>`
4. Check clock sync between services

### Issue: Build Fails with ECONNREFUSED

**Symptom:** Marketing site build fails fetching products

**Solution:**
1. Implement static fallback for build time
2. Use ISR instead of SSG for product pages
3. Ensure API is running during build (if required)

---

## 9. Environment-Specific Configurations

### Development

```bash
# Relaxed security for faster development
DEBUG=true
LOG_LEVEL=DEBUG
CORS_ALLOW_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:9000
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60  # Longer expiry
FEATURE_*=true  # All features enabled
```

### Staging

```bash
# Production-like but with test data
ENV=staging
DEBUG=false
LOG_LEVEL=INFO
DATABASE_URL=postgresql://...staging_db
STRIPE_SECRET_KEY=sk_test_...  # Test mode
CORS_ALLOW_ORIGINS=https://staging.olcan.com.br
```

### Production

```bash
# Maximum security
ENV=production
DEBUG=false
LOG_LEVEL=WARNING
DATABASE_URL=postgresql://...production_db
STRIPE_SECRET_KEY=sk_live_...  # Live mode
CORS_ALLOW_ORIGINS=https://compass.olcan.com.br,https://www.olcan.com.br
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15  # Short expiry
```

---

## 10. Migration Guide

### From Current State to Unified Config

**Step 1: Audit current variables**
```bash
# Find all .env files
find . -name ".env*" -not -path "*/node_modules/*"

# Check for hardcoded values
grep -r "http://localhost" apps/*/src --include="*.ts" --include="*.tsx"
```

**Step 2: Create .env.example files**
```bash
# For each app, create .env.example with dummy values
cp apps/app-compass-v2.5/.env.local apps/app-compass-v2.5/.env.example
# Replace real values with placeholders
```

**Step 3: Update code to use env vars**
```typescript
// Before
const API_URL = 'http://localhost:8001/api/v1'

// After
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'
```

**Step 4: Validate in each environment**
```bash
# Development
pnpm dev:v2.5
# Check all features work

# Staging
vercel --env staging
# Run smoke tests

# Production
vercel --prod
# Monitor for errors
```

---

## Appendix: Quick Reference

### Variable Naming Conventions

- `NEXT_PUBLIC_*` — Exposed to browser (Next.js)
- `*_URL` — Full URL with protocol
- `*_SECRET` / `*_KEY` — Sensitive credentials
- `FEATURE_*` — Feature flags (boolean)
- `*_ENABLED` — Boolean flags

### Port Assignments

| Service | Port | URL |
|---------|------|-----|
| App v2.5 | 3000 | http://localhost:3000 |
| Marketing | 3001 | http://localhost:3001 |
| MedusaJS Admin | 7000 | http://localhost:7000 |
| MedusaJS Vendor | 7001 | http://localhost:7001 |
| FastAPI | 8001 | http://localhost:8001 |
| MedusaJS API | 9000 | http://localhost:9000 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |

---

**Document maintained by:** Olcan Engineering Team  
**Last updated:** April 6, 2026  
**Next review:** July 6, 2026
