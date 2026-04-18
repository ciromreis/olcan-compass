# CRM Integration Guide — Twenty + Mautic + Compass

## Overview

This document describes the CRM integration architecture for Olcan Compass, connecting:
- **Compass App v2.5** (source of truth for auth + user journey)
- **Twenty CRM** (staff control plane for customer management)
- **Mautic** (marketing automation + lead attribution)

## Architecture

```
┌─────────────────┐
│  Marketing Site │
└────────┬────────┘
         │ Lead capture
         ▼
┌─────────────────┐
│     Mautic      │ ← Tags, campaigns, attribution
└────────┬────────┘
         │ Webhook
         ▼
┌─────────────────┐         ┌──────────────────┐
│  Compass API    │────────▶│  crm_identity    │
│  (v2.5)         │         │  _links table    │
└────────┬────────┘         └──────────────────┘
         │
         │ Sync
         ▼
┌─────────────────┐
│   Twenty CRM    │ ← Staff UI, pipelines, notes
└─────────────────┘
```

## Key Design Principles

1. **Compass is source-of-truth** for authentication and core user journey
2. **Twenty is staff control plane** for CRM operations
3. **Mautic handles marketing automation** and lead attribution
4. **All sync is feature-flagged** — disabled by default to protect live v2 app
5. **Identity links are durable** — stored in `crm_identity_links` table
6. **Operations are idempotent** — safe to retry

## Database Schema

### `crm_identity_links` table

```sql
CREATE TABLE crm_identity_links (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    system VARCHAR(32) NOT NULL,          -- 'twenty' or 'mautic'
    external_id VARCHAR(128) NOT NULL,    -- External system record ID
    external_url VARCHAR(500),            -- Deep link to record
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(system, external_id),
    UNIQUE(user_id, system)
);
```

## API Endpoints

All endpoints require `SUPER_ADMIN` role.

### User Sync

#### `POST /api/admin/crm/twenty/users/{user_id}/sync`

Manually sync a Compass user to Twenty.

**Response:**
```json
{
  "status": "created|updated",
  "twenty_person_id": "uuid",
  "twenty_response": {...}
}
```

### Lead Capture

#### `POST /api/admin/crm/leads/sync`

Sync a lead from marketing site into Mautic + Twenty + Compass.

**Request:**
```json
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "tags": ["newsletter", "downloaded_ebook"],
  "source": "marketing_site",
  "metadata": {"campaign": "spring_2026"}
}
```

**Response:**
```json
{
  "email": "user@example.com",
  "mautic": {"status": "created", "contact_id": "123"},
  "twenty": {"status": "created", "person_id": "uuid"},
  "compass": {"status": "not_found", "note": "User will be created when they register"}
}
```

### Lifecycle Events

#### `POST /api/admin/crm/lifecycle/registration/{user_id}`
Trigger registration sync for a user.

#### `POST /api/admin/crm/lifecycle/email-verification/{user_id}`
Trigger email verification sync.

#### `POST /api/admin/crm/lifecycle/subscription/{user_id}?subscription_tier=pro&action=upgraded`
Trigger subscription change sync.

#### `POST /api/admin/crm/lifecycle/booking/{user_id}?booking_id=123&service_name=Consulting`
Trigger booking completion sync.

### Admin Utilities

#### `GET /api/admin/crm/users/{user_id}/crm-links`
Get all CRM identity links for a user (for deep links in admin UI).

**Response:**
```json
{
  "user_id": "uuid",
  "links": [
    {
      "system": "twenty",
      "external_id": "uuid",
      "external_url": "https://crm.olcan.com.br/object/person/uuid",
      "created_at": "2026-04-13T10:00:00Z",
      "updated_at": "2026-04-13T10:00:00Z"
    }
  ]
}
```

#### `POST /api/admin/crm/bulk-sync/historical-users?limit=100&offset=0`
Bulk sync historical users to CRM systems (migration utility).

### Webhooks

#### `POST /api/admin/crm/twenty/webhooks`
Receive Twenty webhooks (bi-directional sync).

#### `POST /api/admin/crm/mautic/webhooks`
Receive Mautic webhooks (lead capture).

## Configuration

### Environment Variables

Add to `apps/api-core-v2.5/.env`:

```bash
# ============================================================
# CRM Integration (Twenty + Mautic)
# ============================================================
# Twenty (self-hosted at https://crm.olcan.com.br or Twenty cloud)
TWENTY_BASE_URL=https://crm.olcan.com.br
# Create in Twenty: Settings → APIs & Webhooks → API Keys
TWENTY_API_KEY=your_api_key_here
# For validating Twenty webhooks (Settings → APIs & Webhooks → Webhooks)
TWENTY_WEBHOOK_SECRET=your_webhook_secret_here

# Mautic (already in place: https://mautic.olcan.com.br)
MAUTIC_BASE_URL=https://mautic.olcan.com.br
MAUTIC_API_KEY=your_api_key_here

# CRM Sync Feature Flags (disabled by default for safety)
# Set to true to enable automatic CRM sync on lifecycle events
FEATURE_CRM_SYNC_REGISTRATION_ENABLED=false
FEATURE_CRM_SYNC_EMAIL_VERIFICATION_ENABLED=false
FEATURE_CRM_SYNC_SUBSCRIPTION_ENABLED=false
FEATURE_CRM_SYNC_BOOKING_ENABLED=false
FEATURE_CRM_SYNC_QUEUE_ENABLED=false
```

### Feature Flags

| Flag | Purpose | Default |
|------|---------|---------|
| `FEATURE_CRM_SYNC_REGISTRATION_ENABLED` | Auto-sync on user registration | `false` |
| `FEATURE_CRM_SYNC_EMAIL_VERIFICATION_ENABLED` | Auto-sync on email verify | `false` |
| `FEATURE_CRM_SYNC_SUBSCRIPTION_ENABLED` | Auto-sync on subscription changes | `false` |
| `FEATURE_CRM_SYNC_BOOKING_ENABLED` | Auto-sync on booking completion | `false` |
| `FEATURE_CRM_SYNC_QUEUE_ENABLED` | Use Celery queue for sync | `false` |

**Important:** All flags are `false` by default to ensure zero impact on the live v2 app.

## Integration Points

### Where to Hook Sync in Compass

The integration provides orchestrator functions that respect feature flags:

```python
from app.services.crm_sync_orchestrator import (
    on_user_registered,
    on_email_verified,
    on_subscription_changed,
    on_booking_completed,
)

# In your registration endpoint:
@app.post("/api/auth/register")
async def register_user(...):
    # ... create user logic ...
    
    # Trigger CRM sync (respects feature flag)
    await on_user_registered(db, user)
    
    return {...}

# In your email verification endpoint:
@app.post("/api/auth/verify-email")
async def verify_email(...):
    # ... verification logic ...
    
    # Trigger CRM sync (respects feature flag)
    await on_email_verified(db, user)
    
    return {...}
```

### Queue-Based Sync (Production)

For production reliability, enable `FEATURE_CRM_SYNC_QUEUE_ENABLED=true` to use Celery tasks:

```python
from app.services.crm_sync_tasks import dispatch_crm_sync_task

# In your endpoint:
await dispatch_crm_sync_task(
    "registration",
    user.id,
    source="compass_registration"
)
```

Tasks are:
- Retriable on failure (3 retries with exponential backoff)
- Idempotent (safe to run multiple times)
- Logged for audit trails

## Deployment Steps

### 1. Deploy Twenty CRM

```bash
# Copy env
cp ops/crm-twenty/.env.example ops/crm-twenty/.env

# Generate secret
openssl rand -base64 32
# Set APP_SECRET in .env

# Start Twenty
docker compose --env-file ops/crm-twenty/.env -f ops/crm-twenty/docker-compose.twenty.yml up -d

# Configure Nginx for crm.olcan.com.br
# Use ops/crm-twenty/nginx-crm.conf as reference
```

### 2. Configure Twenty

1. Navigate to `https://crm.olcan.com.br`
2. Create workspace: "Olcan Compass"
3. Go to Settings → APIs & Webhooks → API Keys
4. Create API key and copy it
5. Go to Settings → APIs & Webhooks → Webhooks
6. Create webhook pointing to: `https://your-api-domain/api/admin/crm/twenty/webhooks`
7. Copy webhook secret

### 3. Configure Compass API

1. Update `apps/api-core-v2.5/.env` with CRM credentials
2. Run migrations: `alembic upgrade head`
3. Restart API

### 4. Test Integration

```bash
# Sync a test user
curl -X POST https://your-api-domain/api/admin/crm/twenty/users/{user_id}/sync \
  -H "Authorization: Bearer {admin_token}"

# Check CRM links
curl https://your-api-domain/api/admin/crm/users/{user_id}/crm-links \
  -H "Authorization: Bearer {admin_token}"
```

### 5. Enable Auto-Sync (Optional)

When ready to enable automatic sync:

```bash
# In .env
FEATURE_CRM_SYNC_REGISTRATION_ENABLED=true
FEATURE_CRM_SYNC_EMAIL_VERIFICATION_ENABLED=true
FEATURE_CRM_SYNC_SUBSCRIPTION_ENABLED=true
FEATURE_CRM_SYNC_BOOKING_ENABLED=true

# Restart API
```

## Lifecycle Events Synced

| Event | Twenty Action | Mautic Action |
|-------|---------------|---------------|
| User Registration | Create Person | Create Contact + tags: `compass_user`, `registered` |
| Email Verification | Add note: "✅ Email verified" | Add tag: `email_verified` |
| Subscription Upgrade | Add note: "💳 Subscription upgraded to X" | Add tag: `subscriber_X` |
| Booking Completion | Add note: "📅 Booking completed: X" | Add tag: `booking_completed` |

## Troubleshooting

### CRM Sync Failing

1. Check logs for errors:
   ```bash
   docker logs compass-api --tail 100 | grep -i crm
   ```

2. Verify CRM configuration:
   ```bash
   curl https://your-api-domain/api/admin/health
   ```

3. Test Twenty connection:
   ```python
   from app.services.crm_bridge import twenty
   print(twenty.is_configured())
   ```

### Webhook Not Received

1. Check Twenty webhook configuration (correct URL?)
2. Verify `TWENTY_WEBHOOK_SECRET` matches
3. Check `product_events` table for stored webhook deliveries

### Identity Links Missing

1. Run migration: `alembic upgrade head`
2. Check `crm_identity_links` table exists
3. Verify sync endpoints are being called

## Next Steps

- [ ] Integrate sync hooks into Compass registration/email/subscription/booking flows
- [ ] Set up monitoring/alerting for CRM sync failures
- [ ] Build admin UI pages with deep links to Twenty/Mautic
- [ ] Enable Celery queue-based sync for production
- [ ] Add marketplace vendor/provider sync
- [ ] Implement bi-directional sync (Twenty → Compass)

## Support

For issues or questions:
- Check logs in `product_events` table
- Review API response for detailed error messages
- Consult Twenty/Mautic API documentation
