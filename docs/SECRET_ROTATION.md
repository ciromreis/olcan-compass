# Secret Rotation Procedure — Olcan Compass

**Last Updated:** April 6, 2026  
**Review Frequency:** Quarterly

---

## When to Rotate Secrets

### Immediate Rotation Required
- ✅ Secret exposed in repository (even if gitignored)
- ✅ Secret exposed in logs or error messages
- ✅ Team member with access leaves organization
- ✅ Suspected security breach
- ✅ Third-party service compromise

### Scheduled Rotation
- 📅 Every 90 days (recommended)
- 📅 After major deployment
- 📅 During security audits

---

## Secrets Inventory

### Critical Secrets (Rotate Immediately if Exposed)

| Secret | Location | Type | Impact |
|--------|----------|------|--------|
| `JWT_SECRET_KEY` | All services | Symmetric key | **CRITICAL** - Invalidates all sessions |
| `STRIPE_SECRET_KEY` | FastAPI, MedusaJS | API key | **CRITICAL** - Payment access |
| `DATABASE_URL` | All services | Connection string | **CRITICAL** - Data access |
| `PAYLOAD_SECRET` | Marketing site | Symmetric key | **HIGH** - CMS access |
| `COOKIE_SECRET` | MedusaJS | Symmetric key | **HIGH** - Session security |
| `ENCRYPTION_KEY` | FastAPI | Symmetric key | **HIGH** - PII encryption |

### Medium Priority Secrets

| Secret | Location | Type | Impact |
|--------|----------|------|--------|
| `SMTP_PASSWORD` | FastAPI, Marketing | API key | **MEDIUM** - Email sending |
| `GOOGLE_APPLICATION_CREDENTIALS` | App v2.5 | Service account | **MEDIUM** - AI features |
| `SUPABASE_SERVICE_ROLE_KEY` | App v2.5 (optional) | API key | **MEDIUM** - Database access |

### Low Priority Secrets

| Secret | Location | Type | Impact |
|--------|----------|------|--------|
| `NEXT_PUBLIC_GA_ID` | Marketing | Public ID | **LOW** - Analytics only |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Marketing | Public key | **LOW** - Public API access |

---

## Rotation Procedures

### 1. JWT Secret Rotation

**Impact:** All users will be logged out  
**Downtime:** None (with blue-green deployment)  
**Time:** 30 minutes

#### Steps

```bash
# 1. Generate new secret
NEW_JWT_SECRET=$(openssl rand -base64 32)
echo "New JWT Secret: $NEW_JWT_SECRET"

# 2. Update all .env files
# - apps/api-core-v2.5/.env → JWT_SECRET_KEY
# - olcan-marketplace/packages/api/.env → JWT_SECRET

# 3. Deploy with blue-green strategy
# a. Deploy new version with new secret (green)
# b. Wait for health checks to pass
# c. Switch traffic to green
# d. Old sessions will fail, users redirected to login
# e. Shut down old version (blue)

# 4. Verify
curl -H "Authorization: Bearer OLD_TOKEN" https://api.compass.olcan.com.br/api/v1/auth/me
# Should return 401 Unauthorized

# 5. Monitor
# - Check error rates in logs
# - Verify new logins work
# - Monitor user support tickets
```

#### Communication Template

```
Subject: Scheduled Maintenance - Session Refresh Required

Dear Olcan User,

We will be performing scheduled security maintenance on [DATE] at [TIME].

Impact:
- You will be logged out of all devices
- Please log in again after maintenance
- No data will be lost

Duration: ~5 minutes

Thank you for your understanding.
- Olcan Team
```

---

### 2. Stripe Secret Rotation

**Impact:** Payment processing temporarily unavailable  
**Downtime:** 5-10 minutes  
**Time:** 45 minutes

#### Steps

```bash
# 1. Generate new secret in Stripe Dashboard
# https://dashboard.stripe.com/apikeys
# - Click "Create secret key"
# - Copy new key

# 2. Update environment variables
# - apps/api-core-v2.5/.env → STRIPE_SECRET_KEY
# - olcan-marketplace/packages/api/.env → STRIPE_API_KEY

# 3. Update webhook secret
# https://dashboard.stripe.com/webhooks
# - Create new webhook endpoint
# - Copy webhook secret
# - Update STRIPE_WEBHOOK_SECRET in both services

# 4. Deploy
# - Deploy FastAPI with new keys
# - Deploy MedusaJS with new keys
# - Test payment flow

# 5. Deactivate old keys in Stripe Dashboard
# - Wait 24 hours for any in-flight webhooks
# - Then delete old webhook endpoint
# - Delete old API key

# 6. Verify
# - Process test payment
# - Check webhook delivery
# - Monitor Stripe dashboard for errors
```

---

### 3. Database Password Rotation

**Impact:** Brief connection interruption  
**Downtime:** 1-2 minutes  
**Time:** 1 hour

#### Steps

```bash
# 1. Create new database user with same permissions
psql -U postgres -d olcan_production
CREATE USER olcan_new WITH PASSWORD 'NEW_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE olcan_production TO olcan_new;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO olcan_new;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA medusa TO olcan_new;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA payload TO olcan_new;

# 2. Update connection strings
# - apps/api-core-v2.5/.env → DATABASE_URL
# - apps/site-marketing-v2.5/.env.local → DATABASE_URI
# - olcan-marketplace/packages/api/.env → DATABASE_URL

# 3. Deploy all services
# - Deploy in order: FastAPI → Marketing → MedusaJS
# - Verify connections before proceeding

# 4. Drop old user (after 24 hours)
psql -U postgres -d olcan_production
DROP USER olcan_old;

# 5. Verify
# - Check all services can connect
# - Run health checks
# - Monitor connection pool metrics
```

---

### 4. Payload CMS Secret Rotation

**Impact:** CMS admin logout  
**Downtime:** None  
**Time:** 15 minutes

#### Steps

```bash
# 1. Generate new secret
NEW_PAYLOAD_SECRET=$(uuidgen | tr '[:upper:]' '[:lower:]')
echo "New Payload Secret: $NEW_PAYLOAD_SECRET"

# 2. Update environment variable
# apps/site-marketing-v2.5/.env.local → PAYLOAD_SECRET

# 3. Deploy marketing site
vercel --prod

# 4. Verify
# - Log in to CMS admin panel
# - Create test content
# - Publish and verify
```

---

## Emergency Rotation (Secret Exposed)

### Immediate Actions (First 15 Minutes)

```bash
# 1. STOP - Don't panic, follow checklist
# 2. Identify which secret was exposed
# 3. Assess impact (see table above)
# 4. Generate new secret immediately
# 5. Update all affected services
# 6. Deploy emergency hotfix
# 7. Invalidate old secret at provider (if applicable)
```

### Communication (First 30 Minutes)

```markdown
## Internal Alert Template

**SECURITY INCIDENT - SECRET EXPOSURE**

**What:** [SECRET_NAME] was exposed in [LOCATION]
**When:** [TIMESTAMP]
**Impact:** [CRITICAL/HIGH/MEDIUM/LOW]
**Status:** [ROTATING/ROTATED/VERIFIED]

**Actions Taken:**
- [ ] New secret generated
- [ ] Services updated
- [ ] Deployed to production
- [ ] Old secret invalidated
- [ ] Logs checked for unauthorized access

**Next Steps:**
- [ ] Post-mortem scheduled
- [ ] Prevention measures identified
- [ ] Documentation updated
```

### Post-Incident (First 24 Hours)

1. **Audit Logs**
   - Check for unauthorized access using old secret
   - Review all API calls in timeframe
   - Identify any data accessed

2. **User Impact Assessment**
   - How many users affected?
   - Was any PII accessed?
   - Do we need to notify users?

3. **Prevention**
   - Update .gitignore patterns
   - Add pre-commit hooks
   - Review secret management practices
   - Consider using secret manager (AWS Secrets Manager, GCP Secret Manager)

---

## Secret Generation Commands

### JWT Secret (32 bytes)
```bash
openssl rand -base64 32
```

### Cookie Secret (32 bytes)
```bash
openssl rand -base64 32
```

### Encryption Key (32 bytes hex)
```bash
openssl rand -hex 32
```

### Payload Secret (UUID format)
```bash
uuidgen | tr '[:upper:]' '[:lower:]'
```

### Strong Password (20 characters)
```bash
openssl rand -base64 20 | tr -d "=+/" | cut -c1-20
```

---

## Verification Checklist

After rotating any secret:

- [ ] All services restarted with new secret
- [ ] Health checks passing
- [ ] No errors in logs
- [ ] Test user flow works (login, API calls, etc.)
- [ ] Old secret invalidated at provider
- [ ] Documentation updated
- [ ] Team notified
- [ ] Incident report filed (if applicable)

---

## Secret Storage Best Practices

### Development
- ✅ Use `.env.local` (gitignored)
- ✅ Share via 1Password or similar
- ✅ Never commit to repository
- ✅ Use `.env.example` with placeholders

### Staging
- ✅ Use Vercel/Netlify environment variables
- ✅ Different secrets from production
- ✅ Test data only

### Production
- ✅ Use Vercel/Netlify environment variables
- ✅ Consider AWS Secrets Manager / GCP Secret Manager
- ✅ Rotate every 90 days
- ✅ Audit access logs monthly

---

## Automation (Future)

### Planned Improvements

1. **Automated Rotation Script**
   ```bash
   # scripts/rotate-secrets.sh
   # - Generates new secrets
   # - Updates all .env files
   # - Creates deployment PR
   # - Runs tests
   ```

2. **Secret Scanner**
   ```bash
   # Pre-commit hook
   # - Scans for exposed secrets
   # - Blocks commit if found
   # - Suggests .gitignore patterns
   ```

3. **Rotation Reminders**
   ```bash
   # Cron job
   # - Checks secret age
   # - Sends reminder at 80 days
   # - Creates GitHub issue at 90 days
   ```

---

## Contact

**Security Issues:** security@olcan.com.br  
**On-Call Engineer:** +55 (11) XXXX-XXXX  
**Incident Response:** Follow runbook in `docs/INCIDENT_RESPONSE.md`

---

**Document Owner:** DevOps Team  
**Last Rotation:** [DATE]  
**Next Scheduled Rotation:** [DATE + 90 days]
