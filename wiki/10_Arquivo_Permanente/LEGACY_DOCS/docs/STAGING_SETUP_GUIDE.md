# Staging Environment Setup Guide

## Overview

This guide covers setting up a staging environment for Olcan Compass that mirrors production for safe testing before deployment.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION                            │
├─────────────────────────────────────────────────────────┤
│  Website: olcan.com.br (Vercel)                         │
│  App: compass.olcan.com.br (Production)                 │
│  API: api.olcan.com.br (Production)                     │
│  DB: PostgreSQL (Production)                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    STAGING                               │
├─────────────────────────────────────────────────────────┤
│  Website: staging.olcan.com.br (Vercel Preview)         │
│  App: staging-compass.olcan.com.br (Staging)            │
│  API: staging-api.olcan.com.br (Render/Railway)         │
│  DB: PostgreSQL (Staging)                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    DEVELOPMENT                           │
├─────────────────────────────────────────────────────────┤
│  Local: localhost:3000 (App)                            │
│  Local: localhost:8000 (API)                            │
│  Local: localhost:5432 (PostgreSQL Docker)              │
└─────────────────────────────────────────────────────────┘
```

---

## Option 1: Vercel + Render (Recommended)

### Prerequisites

- Vercel account (already have for website)
- Render or Railway account
- GitHub repository connected
- Domain access (olcan.com.br)

### Step 1: Deploy API to Render/Railway

#### Render Setup

1. **Create new Web Service:**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select repository: `olcan-compass`

2. **Configure service:**
   ```
   Name: olcan-compass-api-staging
   Root Directory: apps/api-core-v2.5
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   Environment: Python
   ```

3. **Set environment variables:**
   ```bash
   ENV=staging
   DATABASE_URL=postgresql+asyncpg://user:pass@db-host:5432/olcan_staging
   JWT_SECRET_KEY=<generate secure random string>
   STRIPE_SECRET_KEY=sk_test_staging_key
   STRIPE_PUBLISHABLE_KEY=pk_test_staging_key
   STRIPE_WEBHOOK_SECRET=whsec_staging
   STRIPE_PRICE_PRO=price_staging_pro
   STRIPE_PRICE_PREMIUM=price_staging_premium
   SENTRY_DSN=https://staging-dsn@sentry.io/project-id
   ENVIRONMENT=staging
   CORS_ALLOW_ORIGINS=https://staging-compass.olcan.com.br
   ```

4. **Attach PostgreSQL database:**
   - Click "New +" → "PostgreSQL"
   - Name: `olcan-compass-staging-db`
   - Region: Same as API
   - Copy connection string to `DATABASE_URL`

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (~2-3 minutes)
   - Note the URL: `https://olcan-compass-api-staging.onrender.com`

#### Railway Setup (Alternative)

1. **Create new project:**
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `olcan-compass`

2. **Add PostgreSQL:**
   - Click "+ New" → "Database" → "Add PostgreSQL"
   - Copy connection string

3. **Configure API service:**
   - Set root directory: `apps/api-core-v2.5`
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables (same as Render)

4. **Deploy**

### Step 2: Deploy App to Vercel (Staging)

1. **Create preview deployment:**
   - Go to Vercel Dashboard
   - Select `app-compass-v2.5` project
   - Go to Settings → Git
   - Enable Preview Deployments for all branches

2. **Create staging branch:**
   ```bash
   git checkout -b staging
   git push origin staging
   ```

3. **Configure environment variables:**
   - Go to Settings → Environment Variables
   - Add for "Preview" environment:
     ```bash
     NEXT_PUBLIC_API_URL=https://olcan-compass-api-staging.onrender.com
     NEXT_PUBLIC_SENTRY_DSN=https://staging-dsn@sentry.io/app
     DEMO_MODE=false
     ```

4. **Deploy:**
   - Vercel automatically deploys on push to `staging` branch
   - Preview URL: `https://app-compass-v2-5-xxxxx.vercel.app`

### Step 3: Configure Custom Domains

1. **API domain:**
   - Render/Railway: Add custom domain `staging-api.olcan.com.br`
   - Update DNS: Add CNAME record pointing to Render/Railway URL

2. **App domain:**
   - Vercel: Add custom domain `staging-compass.olcan.com.br`
   - Vercel auto-configures DNS

3. **Verify SSL:**
   - All platforms provide automatic SSL via Let's Encrypt

### Step 4: Setup CI/CD

Create `.github/workflows/staging.yml`:

```yaml
name: Deploy to Staging

on:
  push:
    branches: [staging]

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy API to Render
        run: |
          curl -X POST "https://api.render.com/v1/services/${{ secrets.RENDER_SERVICE_ID }}/deploys" \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}"
      
      - name: Run database migrations
        run: |
          curl -X POST "https://staging-api.olcan.com.br/api/admin/migrate" \
            -H "Authorization: Bearer ${{ secrets.ADMIN_TOKEN }}"

  deploy-app:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Trigger Vercel Deployment
        run: |
          curl -X POST "https://api.vercel.com/v1/integrations/deploy/${{ secrets.VERCEL_PROJECT_ID }}" \
            -d '{"branch": "staging"}'

  run-tests:
    runs-on: ubuntu-latest
    needs: [deploy-api, deploy-app]
    steps:
      - uses: actions/checkout@v3
      
      - name: Run integration tests
        run: |
          cd apps/api-core-v2.5
          pip install -r requirements.txt
          pytest tests/test_integration.py -v
```

---

## Option 2: Docker Compose (Self-Hosted)

### Create `docker-compose.staging.yml`

```yaml
version: '3.8'

services:
  api:
    build:
      context: ./apps/api-core-v2.5
      dockerfile: Dockerfile.prod
    environment:
      - ENV=staging
      - DATABASE_URL=postgresql+asyncpg://olcan_app:${DB_PASSWORD}@db:5432/olcan_staging
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - SENTRY_DSN=${SENTRY_DSN}
    ports:
      - "8000:8000"
    depends_on:
      - db
    restart: unless-stopped

  app:
    build:
      context: ./apps/app-compass-v2.5
      dockerfile: Dockerfile.prod
    environment:
      - NEXT_PUBLIC_API_URL=https://staging-api.olcan.com.br
      - DEMO_MODE=false
    ports:
      - "3000:3000"
    depends_on:
      - api
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=olcan_app
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=olcan_staging
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    volumes:
      - ./ops/staging/nginx.conf:/etc/nginx/nginx.conf
      - ./ops/staging/ssl:/etc/nginx/ssl
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - api
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

### Deploy

```bash
# Set environment variables
export DB_PASSWORD=$(openssl rand -base64 32)
export JWT_SECRET_KEY=$(openssl rand -base64 32)

# Start services
docker compose -f docker-compose.staging.yml up -d

# Run migrations
docker compose -f docker-compose.staging.yml exec api alembic upgrade head

# Seed database
docker compose -f docker-compose.staging.yml exec api python scripts/seed_psychology_questions.py

# Check status
docker compose -f docker-compose.staging.yml ps
```

---

## Environment Variables Checklist

### API (Staging)

```bash
# Required
ENV=staging
DATABASE_URL=postgresql+asyncpg://...
JWT_SECRET_KEY=<secure-random-string>
CORS_ALLOW_ORIGINS=https://staging-compass.olcan.com.br

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_PREMIUM=price_...

# Sentry
SENTRY_DSN=https://...@sentry.io/...
ENVIRONMENT=staging

# CRM (Optional)
TWENTY_BASE_URL=https://staging-crm.olcan.com.br
TWENTY_API_KEY=...
MAUTIC_BASE_URL=https://staging-mautic.olcan.com.br
MAUTIC_API_KEY=...

# Feature Flags
FEATURE_CRM_SYNC_REGISTRATION_ENABLED=false
FEATURE_CRM_SYNC_EMAIL_VERIFICATION_ENABLED=false
```

### App (Staging)

```bash
NEXT_PUBLIC_API_URL=https://staging-api.olcan.com.br
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
DEMO_MODE=false
```

---

## Database Migration Strategy

### Automated Migrations

Add to API startup script:

```bash
#!/bin/bash
# start.sh

echo "Running database migrations..."
alembic upgrade head

echo "Starting API server..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Manual Migrations

```bash
# SSH into staging server
ssh staging-server

# Navigate to API directory
cd /opt/olcan-compass/apps/api-core-v2.5

# Run migrations
alembic upgrade head

# Verify
alembic current
```

---

## Testing Staging Environment

### 1. Health Check

```bash
curl https://staging-api.olcan.com.br/health
# Expected: {"status": "healthy", "version": "2.5.0"}
```

### 2. API Documentation

```bash
curl https://staging-api.olcan.com.br/docs
# Should return Swagger UI HTML
```

### 3. Test Registration

```bash
curl -X POST https://staging-api.olcan.com.br/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staging-test@example.com",
    "password": "Test1234!",
    "full_name": "Staging Test"
  }'
```

### 4. Test App

```bash
# Open in browser
https://staging-compass.olcan.com.br

# Try registration flow
# Complete OIOS quiz
# Test Forge credits
```

### 5. Run Integration Tests

```bash
# From local machine
cd apps/api-core-v2.5

# Set staging API URL
export API_BASE_URL=https://staging-api.olcan.com.br

# Run tests
pytest tests/test_integration.py -v
```

---

## Monitoring Staging

### Sentry Configuration

1. Create separate Sentry project: "Olcan Compass Staging"
2. Set `ENVIRONMENT=staging` in both API and App
3. Monitor errors at: https://sentry.io/organizations/[org]/issues/?environment=staging

### Log Aggregation

```bash
# View API logs (Render)
render logs --service olcan-compass-api-staging

# View API logs (Railway)
railway logs

# View app logs (Vercel)
vercel logs staging-compass.olcan.com.br
```

### Uptime Monitoring

Setup uptime monitoring with:
- UptimeRobot (free): https://uptimerobot.com
- Pingdom (paid): https://www.pingdom.com

Monitor:
- `https://staging-api.olcan.com.br/health`
- `https://staging-compass.olcan.com.br`

---

## Promotion to Production

### Checklist

Before promoting staging to production:

- [ ] All integration tests passing
- [ ] No critical errors in Sentry
- [ ] Performance metrics acceptable
- [ ] Database migrations tested
- [ ] Environment variables verified
- [ ] SSL certificates valid
- [ ] Backup strategy in place
- [ ] Rollback plan documented

### Deployment Steps

1. **Merge to main:**
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

2. **CI/CD auto-deploys to production**

3. **Monitor closely for 48 hours**

4. **Enable feature flags gradually**

---

## Troubleshooting

### Issue: Database connection fails

**Solution:**
```bash
# Check database is running
render logs --service olcan-compass-staging-db

# Verify connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Issue: CORS errors

**Solution:**
```bash
# Check CORS_ALLOW_ORIGINS includes staging domain
echo $CORS_ALLOW_ORIGINS
# Should include: https://staging-compass.olcan.com.br
```

### Issue: Build fails

**Solution:**
```bash
# Check build logs
render logs --service olcan-compass-api-staging --tail 100

# Test build locally
cd apps/api-core-v2.5
docker build -f Dockerfile.prod -t olcan-api-staging .
```

---

## Cost Estimates

### Render (Monthly)

- Web Service (API): $7/month
- PostgreSQL: $7/month
- **Total: ~$14/month**

### Railway (Monthly)

- API Service: ~$5/month
- PostgreSQL: ~$5/month
- **Total: ~$10/month**

### Vercel

- Preview deployments: Free (Hobby plan)
- Custom domains: Free
- **Total: $0/month**

---

## Next Steps

1. ✅ Choose hosting provider (Render or Railway)
2. ✅ Setup staging database
3. ✅ Deploy API to staging
4. ✅ Deploy app to staging
5. ✅ Configure custom domains
6. ✅ Setup CI/CD pipeline
7. ✅ Run integration tests
8. ✅ Monitor for 1 week
9. ✅ Promote to production

---

**Last Updated:** April 13, 2026  
**Maintainer:** DevOps Team
