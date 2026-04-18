# Deployment Runbook

## Overview

This runbook covers all deployment procedures for Olcan Compass across all environments.

---

## Environment Overview

| Environment | App URL | API URL | Database | Purpose |
|-------------|---------|---------|----------|---------|
| Development | localhost:3000 | localhost:8000 | Local PostgreSQL | Local development |
| Staging | staging-compass.olcan.com.br | staging-api.olcan.com.br | Staging DB | Pre-production testing |
| Production | compass.olcan.com.br | api.olcan.com.br | Production DB | Live users |

---

## Pre-Deployment Checklist

### All Environments

- [ ] All tests passing (`pytest`, `npm test`)
- [ ] No critical errors in Sentry
- [ ] Database migrations tested
- [ ] Environment variables documented
- [ ] Rollback plan documented
- [ ] Team notified (for staging/production)

### Production Only

- [ ] Staging deployment successful (24+ hours)
- [ ] Beta testers confirmed working
- [ ] Backup completed
- [ ] Monitoring alerts configured
- [ ] On-call engineer assigned
- [ ] Deployment scheduled during low-traffic window

---

## Deployment 1: API (FastAPI Backend)

### Option A: Render Deployment

#### 1. Push to Main Branch

```bash
git checkout main
git pull origin main
git push origin main
```

#### 2. Render Auto-Deploys

- Render detects push to main
- Builds automatically (~2-3 minutes)
- Deploys new version
- Old version replaced seamlessly

#### 3. Verify Deployment

```bash
# Check health endpoint
curl https://api.olcan.com.br/health
# Expected: {"status": "healthy", "version": "2.5.0"}

# Check API docs
curl https://api.olcan.com.br/docs
# Should return Swagger UI

# Run smoke tests
cd apps/api-core-v2.5
pytest tests/test_integration.py -v
```

#### 4. Monitor Logs

```bash
# In Render Dashboard
# Go to: Services → olcan-compass-api → Logs

# Or via CLI
render logs --service olcan-compass-api --tail 100
```

### Option B: Railway Deployment

#### 1. Push to Main Branch

```bash
git push origin main
```

#### 2. Railway Auto-Deploys

- Railway builds from main branch
- Deploys automatically
- Zero-downtime deployment

#### 3. Verify

```bash
curl https://olcan-compass-api.up.railway.app/health
```

### Option C: Docker Deployment (Self-Hosted)

#### 1. Build Image

```bash
cd apps/api-core-v2.5
docker build -f Dockerfile.prod -t olcan-api:latest .
```

#### 2. Run Container

```bash
docker run -d \
  --name olcan-api \
  -p 8000:8000 \
  --env-file .env.production \
  olcan-api:latest
```

#### 3. Verify

```bash
curl http://localhost:8000/health
docker logs olcan-api
```

---

## Deployment 2: App (Next.js Frontend)

### Vercel Deployment (Recommended)

#### 1. Push to Main Branch

```bash
git push origin main
```

#### 2. Vercel Auto-Deploys

- Vercel builds from main branch
- Deploys to production URL
- Automatic SSL certificate

#### 3. Verify Deployment

```bash
# Open in browser
https://compass.olcan.com.br

# Check for errors in browser console
# Test critical flows:
# - Registration
# - Login
# - OIOS Quiz
# - Forge document creation
```

#### 4. Monitor Vercel Logs

```bash
# Via CLI
vercel logs compass.olcan.com.br

# Or in Vercel Dashboard
# Go to: Project → Logs
```

---

## Deployment 3: Database Migrations

### Automatic Migration (Recommended)

Add to API startup script:

```bash
#!/bin/bash
# start.sh

echo "Running database migrations..."
alembic upgrade head

echo "Starting API server..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Manual Migration

#### 1. Backup Database First

```bash
# Production
./scripts/backup_database.sh

# Verify backup
ls -lh backups/
```

#### 2. Run Migration

```bash
# SSH into server or use local connection
cd apps/api-core-v2.5

# Check current version
alembic current

# Run migration
alembic upgrade head

# Verify new version
alembic current
```

#### 3. Verify Migration

```bash
# Connect to database
psql -h HOST -U olcan_app -d olcan_production

# Check tables
\dt

# Check migration version
SELECT version_num FROM alembic_version;

# Test new functionality
SELECT COUNT(*) FROM new_table_if_created;
```

#### 4. Rollback (If Needed)

```bash
# Rollback one migration
alembic downgrade -1

# Rollback to specific version
alembic downgrade <revision_id>

# Verify rollback
alembic current
```

---

## Deployment 4: Environment Variables

### Render

1. Go to: Services → olcan-compass-api → Environment
2. Add/update variables
3. Click "Save Changes"
4. Service automatically restarts

### Railway

1. Go to: Project → Variables
2. Add/update variables
3. Changes applied immediately

### Vercel

1. Go to: Project Settings → Environment Variables
2. Add for appropriate environment (Production/Preview/Development)
3. Deployments after change will use new values

### Docker

```bash
# Update .env.production file
nano .env.production

# Restart container
docker restart olcan-api
```

---

## Rollback Procedures

### API Rollback (Render)

#### 1. Rollback to Previous Deployment

```bash
# In Render Dashboard
# Go to: Services → olcan-compass-api → Deployments
# Click on previous successful deployment
# Click "Rollback"
```

#### 2. Via CLI

```bash
# List deployments
render deployments list --service olcan-compass-api

# Rollback to specific deployment
render deployments rollback --service olcan-compass-api --deployment-id <id>
```

### App Rollback (Vercel)

#### 1. Rollback via Dashboard

```bash
# In Vercel Dashboard
# Go to: Project → Deployments
# Click on previous successful deployment
# Click "Promote to Production"
```

#### 2. Via CLI

```bash
# List deployments
vercel ls

# Rollback
vercel rollback <deployment-url>
```

### Database Rollback

```bash
# Rollback migration
alembic downgrade -1

# If data was modified, restore from backup
./scripts/restore_database.sh backups/latest_backup.sql.gz
```

---

## Post-Deployment Verification

### Automated Health Checks

```bash
#!/bin/bash
# verify-deployment.sh

set -e

API_URL=${1:-"https://api.olcan.com.br"}
APP_URL=${2:-"https://compass.olcan.com.br"}

echo "🔍 Verifying deployment..."

# Check API health
echo "Checking API health..."
response=$(curl -s -o /dev/null -w "%{http_code}" ${API_URL}/health)
if [ "$response" = "200" ]; then
  echo "✅ API healthy"
else
  echo "❌ API unhealthy (HTTP $response)"
  exit 1
fi

# Check API docs
echo "Checking API docs..."
response=$(curl -s -o /dev/null -w "%{http_code}" ${API_URL}/docs)
if [ "$response" = "200" ]; then
  echo "✅ API docs accessible"
else
  echo "❌ API docs not accessible"
  exit 1
fi

# Check app
echo "Checking app..."
response=$(curl -s -o /dev/null -w "%{http_code}" ${APP_URL})
if [ "$response" = "200" ]; then
  echo "✅ App accessible"
else
  echo "❌ App not accessible"
  exit 1
fi

# Test registration endpoint
echo "Testing registration endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST ${API_URL}/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test1234!"}')
if [ "$response" = "201" ] || [ "$response" = "400" ]; then
  echo "✅ Registration endpoint working"
else
  echo "❌ Registration endpoint failed (HTTP $response)"
  exit 1
fi

echo "✅ All checks passed!"
```

### Manual Testing

- [ ] User registration flow
- [ ] User login flow
- [ ] OIOS quiz completion
- [ ] Forge document creation
- [ ] Subscription checkout
- [ ] Profile page
- [ ] Settings page
- [ ] Mobile responsiveness
- [ ] No console errors

### Monitoring

```bash
# Check Sentry for new errors
# https://sentry.io/organizations/[org]/issues/

# Check Render logs
render logs --service olcan-compass-api --tail 50

# Check Vercel logs
vercel logs compass.olcan.com.br --tail 50

# Check database connections
psql -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## Emergency Procedures

### Issue: Database Connection Fails

```bash
# 1. Check database is running
render logs --service olcan-compass-db

# 2. Verify connection string
echo $DATABASE_URL

# 3. Test connection
psql $DATABASE_URL -c "SELECT 1"

# 4. If database is down, restore from backup
./scripts/restore_database.sh backups/latest.sql.gz
```

### Issue: High Error Rate

```bash
# 1. Check Sentry for error patterns
# https://sentry.io/

# 2. Check logs for errors
render logs --service olcan-compass-api --tail 200 | grep ERROR

# 3. If recent deployment, rollback
render deployments rollback --service olcan-compass-api --deployment-id <previous-id>

# 4. Monitor after rollback
render logs --service olcan-compass-api --tail 50
```

### Issue: Performance Degradation

```bash
# 1. Check database query performance
psql -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# 2. Check API response times
# In Render Dashboard → Metrics → Response Time

# 3. Check for slow queries in logs
render logs --service olcan-compass-api | grep "duration_ms"

# 4. Scale up if needed (Render)
# Increase memory/CPU in service settings
```

### Issue: Security Breach

```bash
# 1. Rotate all API keys immediately
# - Stripe keys
# - JWT secret
# - Database password
# - Sentry DSN

# 2. Revoke all active sessions
psql -c "UPDATE users SET refresh_token = NULL;"

# 3. Enable maintenance mode
# Update env: MAINTENANCE_MODE=true

# 4. Investigate and patch

# 5. Notify users if data compromised
```

---

## Scheduled Maintenance

### Weekly Tasks

- [ ] Review Sentry errors
- [ ] Check backup completion
- [ ] Review API logs
- [ ] Check database size
- [ ] Review performance metrics

### Monthly Tasks

- [ ] Update dependencies
- [ ] Rotate API keys
- [ ] Review access logs
- [ ] Test disaster recovery
- [ ] Update documentation

### Quarterly Tasks

- [ ] Security audit
- [ ] Performance optimization
- [ ] Database cleanup
- [ ] Architecture review
- [ ] Team training

---

## Deployment Automation (CI/CD)

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run API tests
        run: |
          cd apps/api-core-v2.5
          pip install -r requirements.txt
          pytest tests/ -v
      
      - name: Run App tests
        run: |
          cd apps/app-compass-v2.5
          npm ci
          npm test

  deploy-api:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Render Deployment
        run: |
          curl -X POST "https://api.render.com/v1/services/${{ secrets.RENDER_SERVICE_ID }}/deploys" \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}"
      
      - name: Wait for deployment
        run: sleep 120
      
      - name: Verify deployment
        run: |
          curl -f https://api.olcan.com.br/health || exit 1

  deploy-app:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Vercel Deployment
        run: |
          curl -X POST "https://api.vercel.com/v1/integrations/deploy/${{ secrets.VERCEL_PROJECT_ID }}" \
            -d '{"branch": "main"}'
      
      - name: Verify deployment
        run: |
          curl -f https://compass.olcan.com.br || exit 1

  notify:
    needs: [deploy-api, deploy-app]
    runs-on: ubuntu-latest
    steps:
      - name: Notify team
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H "Content-Type: application/json" \
            -d '{"text": "✅ Deployment successful!"}'
```

---

## Communication Plan

### Before Deployment

**Slack Channel: #deployments**

```
🚀 Deployment Planned
- What: API v2.5.0 + App v2.5.0
- When: Today at 14:00 BRT
- Impact: 5 min downtime expected
- Rollback: Ready if needed
- On-call: @engineer-name
```

### During Deployment

```
🔄 Deployment Started
- API deployment triggered
- ETA: 3 minutes
```

### After Deployment

```
✅ Deployment Successful
- API: https://api.olcan.com.br/health
- App: https://compass.olcan.com.br
- No errors detected
- Monitoring closely for 1 hour
```

### If Issues Found

```
⚠️ Issue Detected
- High error rate after deployment
- Rolling back to previous version
- ETA: 2 minutes
- Post-mortem scheduled
```

---

## Troubleshooting Quick Reference

| Issue | Command | Solution |
|-------|---------|----------|
| API down | `curl /health` | Restart service |
| Database down | `psql -c "SELECT 1"` | Restore from backup |
| Slow responses | Check metrics | Scale up resources |
| High errors | Check Sentry | Rollback deployment |
| SSL expired | Check cert | Renew certificate |
| Out of disk | `df -h` | Clean logs/backups |

---

## Contact Information

| Role | Name | Contact |
|------|------|---------|
| DevOps Lead | [Name] | @slack |
| Backend Lead | [Name] | @slack |
| Frontend Lead | [Name] | @slack |
| On-Call Engineer | [Rotation] | #on-call |

---

**Last Updated:** April 13, 2026  
**Maintainer:** DevOps Team  
**Review Frequency:** Monthly
