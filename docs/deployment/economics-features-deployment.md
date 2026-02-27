# Economics Features Deployment Checklist

## Overview

This document provides a comprehensive deployment checklist for the five economics-driven intelligence features implemented in Olcan Compass. Follow these steps to ensure a smooth deployment with minimal risk.

## Pre-Deployment Checklist

### 1. Code Review and Testing

- [ ] All code merged to main branch
- [ ] All unit tests passing (`pytest apps/api/tests/`)
- [ ] All integration tests passing
- [ ] Property-based tests executed (if implemented)
- [ ] Frontend build successful (`cd apps/web && npm run build`)
- [ ] TypeScript compilation successful (`cd apps/web && npm run type-check`)
- [ ] Linting passed (`cd apps/web && npm run lint`)
- [ ] No console errors in browser dev tools

### 2. Database Migrations

- [ ] Review migration files:
  - `apps/api/alembic/versions/0011_economics_tables.py`
  - `apps/api/alembic/versions/0012_economics_extensions.py`
- [ ] Test migrations on staging database:
  ```bash
  # Backup staging database first
  pg_dump -h staging-db -U postgres compass > backup_staging_$(date +%Y%m%d).sql
  
  # Apply migrations
  docker compose run --rm api alembic upgrade head
  
  # Verify tables created
  docker compose exec postgres psql -U postgres -d compass -c "\dt"
  ```
- [ ] Verify rollback works:
  ```bash
  docker compose run --rm api alembic downgrade -1
  docker compose run --rm api alembic upgrade head
  ```
- [ ] Check indexes created:
  ```sql
  SELECT tablename, indexname FROM pg_indexes 
  WHERE schemaname = 'public' 
  AND tablename IN ('verification_credentials', 'escrow_transactions', 'scenario_simulations', 'credential_usage_tracking', 'opportunity_cost_widget_events');
  ```

### 3. Environment Configuration

- [ ] Update production `.env` file with:
  ```bash
  # Redis Configuration
  REDIS_URL=redis://redis:6379/0
  
  # Celery Configuration
  CELERY_BROKER_URL=redis://redis:6379/0
  CELERY_RESULT_BACKEND=redis://redis:6379/0
  
  # Stripe Configuration (use production keys)
  STRIPE_SECRET_KEY=sk_live_...
  STRIPE_PUBLISHABLE_KEY=pk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  
  # Feature Flags
  ENABLE_TRUST_SIGNALS=true
  ENABLE_TEMPORAL_MATCHING=true
  ENABLE_OPPORTUNITY_COST=true
  ENABLE_PERFORMANCE_MARKETPLACE=true
  ENABLE_SCENARIO_OPTIMIZATION=true
  
  # Security
  ENCRYPTION_KEY=<generate-with-openssl-rand-base64-32>
  ```
- [ ] Verify Stripe webhook endpoint configured in Stripe Dashboard:
  - URL: `https://api.compass.olcan.com/api/webhooks/stripe`
  - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `transfer.created`
- [ ] Verify Redis accessible from API container
- [ ] Verify PostgreSQL pgcrypto extension enabled:
  ```sql
  CREATE EXTENSION IF NOT EXISTS pgcrypto;
  ```

### 4. Infrastructure Readiness

- [ ] Redis service running and accessible
- [ ] Celery worker service configured in orchestration (Kubernetes/Docker Compose)
- [ ] Celery beat service configured for periodic tasks
- [ ] Monitoring alerts configured for:
  - Celery queue depth > 100
  - Redis memory usage > 80%
  - Failed background jobs > 10 per hour
  - API response time > 2s for economics endpoints
- [ ] Log aggregation configured (e.g., ELK, Datadog)
- [ ] Rate limiting configured for public verification endpoint

### 5. Data Preparation

- [ ] Backfill temporal preferences for existing users:
  ```bash
  docker compose run --rm api python -m scripts.backfill_temporal_preferences
  ```
- [ ] Calculate opportunity costs for existing opportunities:
  ```bash
  docker compose run --rm api python -m scripts.backfill_opportunity_costs
  ```
- [ ] Score existing opportunities for scenario optimization:
  ```bash
  docker compose run --rm api python -m scripts.backfill_opportunity_scores
  ```
- [ ] Tag route templates with temporal ranges:
  ```bash
  docker compose run --rm api python -m scripts.backfill_route_temporal_ranges
  ```

### 6. Security Audit

- [ ] Review PII handling in credentials service
- [ ] Verify SHA-256 hashing applied to user identifiers
- [ ] Test rate limiting on verification endpoint (10 req/hour per IP)
- [ ] Verify JWT authentication on all protected endpoints
- [ ] Test LGPD data export endpoint (`GET /api/me/economics-data/export`)
- [ ] Test LGPD data deletion endpoint (`DELETE /api/me/economics-data`)
- [ ] Verify escrow transactions encrypted at rest
- [ ] Review Stripe Connect integration for PCI compliance

## Deployment Steps

### Phase 1: Database Migration (Maintenance Window Required)

**Estimated Duration:** 15-30 minutes

1. **Announce maintenance window** (30 minutes)
   - Send email to all users 24 hours in advance
   - Display banner on website 1 hour before

2. **Backup production database**
   ```bash
   pg_dump -h prod-db -U postgres compass > backup_prod_$(date +%Y%m%d_%H%M%S).sql
   # Upload to S3 or secure backup location
   aws s3 cp backup_prod_*.sql s3://compass-backups/
   ```

3. **Enable maintenance mode**
   ```bash
   # Set environment variable
   export MAINTENANCE_MODE=true
   # Restart API to show maintenance page
   ```

4. **Apply database migrations**
   ```bash
   docker compose run --rm api alembic upgrade head
   ```

5. **Verify migration success**
   ```bash
   # Check tables exist
   docker compose exec postgres psql -U postgres -d compass -c "\dt"
   
   # Check columns added
   docker compose exec postgres psql -U postgres -d compass -c "\d+ user_psych_profiles"
   docker compose exec postgres psql -U postgres -d compass -c "\d+ users"
   docker compose exec postgres psql -U postgres -d compass -c "\d+ opportunities"
   docker compose exec postgres psql -U postgres -d compass -c "\d+ route_templates"
   docker compose exec postgres psql -U postgres -d compass -c "\d+ service_listings"
   ```

### Phase 2: Backend Deployment

**Estimated Duration:** 10-15 minutes

1. **Deploy Redis service**
   ```bash
   # If using Docker Compose
   docker compose up -d redis
   
   # If using Kubernetes
   kubectl apply -f k8s/redis-deployment.yaml
   kubectl apply -f k8s/redis-service.yaml
   ```

2. **Deploy updated API service**
   ```bash
   # Build new image
   docker build -t compass-api:economics-v1 apps/api/
   
   # Push to registry
   docker tag compass-api:economics-v1 registry.olcan.com/compass-api:economics-v1
   docker push registry.olcan.com/compass-api:economics-v1
   
   # Deploy (Docker Compose)
   docker compose up -d api
   
   # Deploy (Kubernetes)
   kubectl set image deployment/compass-api api=registry.olcan.com/compass-api:economics-v1
   kubectl rollout status deployment/compass-api
   ```

3. **Deploy Celery worker**
   ```bash
   # Docker Compose
   docker compose up -d celery_worker
   
   # Kubernetes
   kubectl apply -f k8s/celery-worker-deployment.yaml
   ```

4. **Deploy Celery beat**
   ```bash
   # Docker Compose
   docker compose up -d celery_beat
   
   # Kubernetes
   kubectl apply -f k8s/celery-beat-deployment.yaml
   ```

5. **Verify services healthy**
   ```bash
   # Check API health
   curl https://api.compass.olcan.com/api/health
   curl https://api.compass.olcan.com/api/health/economics
   
   # Check Celery worker
   docker compose exec celery_worker celery -A app.core.celery_app inspect active
   
   # Check Redis
   docker compose exec redis redis-cli ping
   ```

### Phase 3: Frontend Deployment

**Estimated Duration:** 5-10 minutes

1. **Build frontend with economics features**
   ```bash
   cd apps/web
   npm run build
   ```

2. **Deploy to CDN/hosting**
   ```bash
   # Example: Deploy to S3 + CloudFront
   aws s3 sync dist/ s3://compass-frontend-prod/
   aws cloudfront create-invalidation --distribution-id E1234567890ABC --paths "/*"
   
   # Example: Deploy to Vercel
   vercel --prod
   ```

3. **Verify frontend loads**
   - Visit https://compass.olcan.com
   - Check browser console for errors
   - Verify API calls succeed

### Phase 4: Data Backfill (Background)

**Estimated Duration:** 1-2 hours (runs in background)

1. **Trigger backfill jobs**
   ```bash
   # Queue backfill tasks in Celery
   docker compose run --rm api python -m scripts.trigger_backfill_jobs
   ```

2. **Monitor progress**
   ```bash
   # Check Celery queue
   docker compose exec celery_worker celery -A app.core.celery_app inspect active
   
   # Check logs
   docker compose logs -f celery_worker
   ```

### Phase 5: Disable Maintenance Mode

1. **Disable maintenance mode**
   ```bash
   export MAINTENANCE_MODE=false
   # Restart API
   docker compose restart api
   ```

2. **Announce deployment complete**
   - Remove maintenance banner
   - Send email to users

## Post-Deployment Verification

### Smoke Tests (Run Immediately)

1. **Credentials Feature**
   ```bash
   # Generate credential
   curl -X POST https://api.compass.olcan.com/api/credentials/generate \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"credential_type": "readiness", "score_value": 85}'
   
   # Verify credential (public)
   curl https://api.compass.olcan.com/api/credentials/verify/{hash}
   ```

2. **Temporal Matching Feature**
   ```bash
   # Get matched routes
   curl https://api.compass.olcan.com/api/temporal-matching/routes \
     -H "Authorization: Bearer $TOKEN"
   ```

3. **Opportunity Cost Feature**
   ```bash
   # Get momentum score
   curl https://api.compass.olcan.com/api/opportunity-cost/momentum \
     -H "Authorization: Bearer $TOKEN"
   ```

4. **Escrow Feature**
   ```bash
   # Create escrow (requires booking)
   curl -X POST https://api.compass.olcan.com/api/escrow/create \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"booking_id": "uuid", "amount": 100.00, "release_condition": {...}}'
   ```

5. **Scenario Optimization Feature**
   ```bash
   # Calculate frontier
   curl -X POST https://api.compass.olcan.com/api/scenarios/calculate-frontier \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"constraints": {"budget_max": 50000, "time_available_months": 12}}'
   ```

### Frontend Verification

- [ ] Visit Psychology Dashboard - verify VerificationBadge appears for high-readiness users
- [ ] Visit Routes Templates - verify TemporalRouteRecommendations section displays
- [ ] Visit Applications Opportunities - verify GrowthPotentialWidget appears for low-momentum users
- [ ] Visit Marketplace Browse - verify PerformanceGuaranteeBadge on performance-bound services
- [ ] Visit Applications Simulator - verify interactive scatter plot loads and sliders work

### Background Jobs Verification

- [ ] Check Celery beat schedule:
  ```bash
  docker compose exec celery_beat celery -A app.core.celery_app inspect scheduled
  ```
- [ ] Verify periodic tasks running:
  - `expire_old_credentials_task` (daily at 00:00 UTC)
  - `calculate_opportunity_costs_daily_task` (daily at 01:00 UTC)
  - `check_escrow_timeouts_task` (every 6 hours)
- [ ] Check for failed tasks:
  ```bash
  docker compose exec redis redis-cli llen celery:failed
  ```

### Monitoring and Alerts

- [ ] Verify metrics flowing to monitoring system:
  - API response times for economics endpoints
  - Celery queue depth
  - Redis memory usage
  - Database query performance
- [ ] Test alert triggers:
  - Simulate high queue depth
  - Simulate failed background job
  - Verify alerts received

### Performance Testing

- [ ] Load test credentials verification endpoint (public, rate-limited)
- [ ] Load test temporal matching endpoint
- [ ] Load test scenario optimization endpoint (computationally expensive)
- [ ] Verify Redis caching working (check cache hit rates)
- [ ] Verify database query performance (check slow query log)

## Rollback Plan

### If Critical Issues Detected

1. **Immediate rollback (< 5 minutes)**
   ```bash
   # Rollback API deployment
   docker compose down api
   docker compose up -d api  # Uses previous image
   
   # Or Kubernetes
   kubectl rollout undo deployment/compass-api
   ```

2. **Rollback database migrations (if necessary)**
   ```bash
   # Downgrade to previous migration
   docker compose run --rm api alembic downgrade -2
   ```

3. **Restore database from backup (last resort)**
   ```bash
   # Download backup
   aws s3 cp s3://compass-backups/backup_prod_YYYYMMDD_HHMMSS.sql .
   
   # Restore (requires maintenance window)
   psql -h prod-db -U postgres compass < backup_prod_YYYYMMDD_HHMMSS.sql
   ```

4. **Disable feature flags**
   ```bash
   # Update .env
   ENABLE_TRUST_SIGNALS=false
   ENABLE_TEMPORAL_MATCHING=false
   ENABLE_OPPORTUNITY_COST=false
   ENABLE_PERFORMANCE_MARKETPLACE=false
   ENABLE_SCENARIO_OPTIMIZATION=false
   
   # Restart API
   docker compose restart api
   ```

### Rollback Decision Criteria

Rollback if:
- API error rate > 5% for economics endpoints
- Database CPU > 90% for > 5 minutes
- Celery queue depth > 1000 tasks
- User-reported critical bugs > 10 in first hour
- Payment processing failures > 1%

## Post-Deployment Monitoring (First 24 Hours)

### Hour 1: Critical Monitoring
- [ ] Monitor API error rates every 5 minutes
- [ ] Monitor database performance
- [ ] Monitor Celery queue depth
- [ ] Monitor user feedback channels (support, social media)

### Hour 2-6: Active Monitoring
- [ ] Check metrics every 15 minutes
- [ ] Review logs for errors
- [ ] Monitor conversion funnel (widget impressions → upgrades)

### Hour 6-24: Passive Monitoring
- [ ] Check metrics every hour
- [ ] Review daily summary reports
- [ ] Analyze user engagement with new features

### Week 1: Success Metrics Tracking
- [ ] Credential conversion rate (target: 15% improvement)
- [ ] Temporal churn reduction (target: 20% reduction)
- [ ] Opportunity cost conversion (target: 25% conversion)
- [ ] Marketplace booking value (target: 30% increase)
- [ ] Decision paralysis reduction (target: 40% reduction)

## Troubleshooting Common Issues

### Issue: Celery workers not processing tasks

**Symptoms:** Queue depth increasing, tasks not completing

**Solution:**
```bash
# Check worker status
docker compose exec celery_worker celery -A app.core.celery_app inspect active

# Restart workers
docker compose restart celery_worker

# Check Redis connectivity
docker compose exec celery_worker redis-cli -h redis ping
```

### Issue: Rate limiting too aggressive on verification endpoint

**Symptoms:** Legitimate users getting 429 errors

**Solution:**
```python
# Adjust rate limit in apps/api/app/api/routes/credentials.py
@limiter.limit("20/hour")  # Increase from 10 to 20
```

### Issue: Escrow resolution failing

**Symptoms:** Escrow stuck in "pending" status

**Solution:**
```bash
# Check Stripe webhook logs
docker compose logs api | grep stripe_webhook

# Manually trigger resolution
docker compose run --rm api python -m scripts.resolve_stuck_escrow --escrow-id <uuid>
```

### Issue: Frontend components not loading

**Symptoms:** Blank sections where economics components should appear

**Solution:**
```bash
# Check browser console for errors
# Verify API endpoints responding
curl https://api.compass.olcan.com/api/credentials/me -H "Authorization: Bearer $TOKEN"

# Clear CDN cache
aws cloudfront create-invalidation --distribution-id E1234567890ABC --paths "/*"
```

## Success Criteria

Deployment is considered successful when:
- [ ] All smoke tests passing
- [ ] API error rate < 1% for economics endpoints
- [ ] Frontend components rendering correctly
- [ ] Background jobs processing successfully
- [ ] No critical user-reported bugs
- [ ] Monitoring alerts not triggered
- [ ] Database performance stable
- [ ] First 10 users successfully use each feature

## Contact Information

**On-Call Engineer:** [Your Name]
**Slack Channel:** #compass-deployments
**Incident Response:** [Runbook Link]

## Appendix: Useful Commands

### Check Database Table Sizes
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Monitor Celery Queue in Real-Time
```bash
watch -n 5 'docker compose exec redis redis-cli llen celery'
```

### Export Economics Data for Analysis
```bash
docker compose exec postgres psql -U postgres -d compass -c "COPY (SELECT * FROM verification_credentials) TO STDOUT WITH CSV HEADER" > credentials_export.csv
```

### Check API Response Times
```bash
curl -w "@curl-format.txt" -o /dev/null -s https://api.compass.olcan.com/api/credentials/me -H "Authorization: Bearer $TOKEN"
```

Create `curl-format.txt`:
```
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_appconnect:  %{time_appconnect}\n
time_pretransfer:  %{time_pretransfer}\n
time_redirect:  %{time_redirect}\n
time_starttransfer:  %{time_starttransfer}\n
----------\n
time_total:  %{time_total}\n
```
