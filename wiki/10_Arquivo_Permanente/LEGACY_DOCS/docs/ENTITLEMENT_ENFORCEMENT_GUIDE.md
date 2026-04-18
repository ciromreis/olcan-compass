# Server-Side Entitlement Enforcement Guide

## Overview

This guide covers the server-side entitlement enforcement system that prevents client-side bypass of subscription restrictions.

---

## Architecture

### Client-Side vs Server-Side

**Client-Side (Existing):**
```typescript
// src/lib/entitlements.ts
export function canCreateForgeDocument(plan: UserPlan, documentCount: number): boolean {
  return documentCount < maxForgeDocuments(plan);
}
```
❌ Can be bypassed by modifying client code

**Server-Side (New):**
```python
# app/api/routes/forge.py
@router.post("/documents")
async def create_document(
    user: User = Depends(get_current_user),
    _: None = Depends(require_plan(UserPlan.PRO))
):
    # Enforced server-side - cannot be bypassed
    ...
```
✅ Cannot be bypassed - enforced on API level

---

## Entitlement System

### Plan Hierarchy

```
FREE → PRO → PREMIUM
```

Each plan has increasing access levels:

| Feature | Free | Pro | Premium |
|---------|------|-----|---------|
| Forge Documents | 3 | Unlimited | Unlimited |
| Mobility Routes | 1 | 3 | Unlimited |
| Forge Version Compare | ❌ | ✅ | ✅ |
| Interview Simulator | ❌ | ✅ | ✅ |
| Marketplace Booking | ❌ | ✅ | ✅ |
| Advanced Analytics | ❌ | ❌ | ✅ |
| AI Coach | ❌ | ❌ | ✅ |

---

## Usage Examples

### Example 1: Require Minimum Plan

```python
from app.core.entitlements import require_plan, UserPlan

@router.post("/forge/polish")
async def polish_document(
    payload: PolishRequest,
    user: User = Depends(get_current_user),
    _: None = Depends(require_plan(UserPlan.PRO))  # Requires pro or premium
):
    # Only pro and premium users reach here
    # Free users get 402 Payment Required
    ...
```

**Response for free user:**
```json
{
  "detail": "Upgrade to pro plan required"
}
```

**Headers:**
```
HTTP/1.1 402 Payment Required
X-Upgrade-Required: pro
X-Current-Plan: free
```

### Example 2: Require Specific Feature

```python
from app.core.entitlements import require_feature

@router.get("/analytics/advanced")
async def advanced_analytics(
    user: User = Depends(get_current_user),
    _: None = Depends(require_feature("analytics_advanced"))
):
    # Only premium users (who have analytics_advanced) reach here
    ...
```

### Example 3: Check Limits Dynamically

```python
from app.core.entitlements import get_max_documents, get_max_routes

@router.get("/forge/documents")
async def get_documents(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Get user's document limit
    max_docs = get_max_documents(UserPlan(user.plan))
    
    # Count current documents
    result = await db.execute(
        select(func.count()).select_from(Document).where(Document.user_id == user.id)
    )
    current_count = result.scalar()
    
    return {
        "documents": [...],
        "limit": max_docs if max_docs != -1 else "unlimited",
        "used": current_count,
        "remaining": max_docs - current_count if max_docs != -1 else "unlimited"
    }
```

### Example 4: Get Entitlement Context

```python
from app.core.entitlements import get_entitlement_context

@router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    return {
        "id": str(user.id),
        "email": user.email,
        "plan": user.plan,
        "entitlements": get_entitlement_context(user)
    }
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "plan": "pro",
  "entitlements": {
    "plan": "pro",
    "is_paid": true,
    "limits": {
      "forge_documents": -1,
      "routes": 3
    },
    "features": {
      "forge_version_compare": true,
      "interview_simulator": true,
      "marketplace_booking": true,
      "analytics_advanced": false,
      "coach_ai": false,
      "unlimited_routes": false
    }
  }
}
```

---

## Configuration

### Adding New Features

Edit `app/core/entitlements.py`:

```python
PAID_FEATURES = {
    "forge_version_compare": [UserPlan.PRO, UserPlan.PREMIUM],
    "interview_simulator": [UserPlan.PRO, UserPlan.PREMIUM],
    "marketplace_booking": [UserPlan.PRO, UserPlan.PREMIUM],
    "analytics_advanced": [UserPlan.PREMIUM],
    "coach_ai": [UserPlan.PREMIUM],
    "unlimited_routes": [UserPlan.PREMIUM],
    
    # Add new feature here:
    "new_feature": [UserPlan.PRO, UserPlan.PREMIUM],
}
```

### Adjusting Limits

```python
FORGE_DOCUMENT_LIMITS = {
    UserPlan.FREE: 3,      # Free users get 3 documents
    UserPlan.PRO: -1,      # -1 = unlimited
    UserPlan.PREMIUM: -1,
}

ROUTE_LIMITS = {
    UserPlan.FREE: 1,      # Free users get 1 route
    UserPlan.PRO: 3,       # Pro users get 3 routes
    UserPlan.PREMIUM: -1,  # Premium users get unlimited
}
```

---

## Testing Entitlements

### Unit Tests

```python
def test_require_plan_free_user():
    """Test that free users are blocked from pro features."""
    user = User(plan="free")
    
    with pytest.raises(HTTPException) as exc_info:
        require_plan(UserPlan.PRO)(user)
    
    assert exc_info.value.status_code == 402
    assert "pro" in exc_info.value.detail

def test_require_plan_pro_user():
    """Test that pro users can access pro features."""
    user = User(plan="pro")
    
    # Should not raise
    result = require_plan(UserPlan.PRO)(user)
    assert result == user

def test_feature_access():
    """Test feature access matrix."""
    assert can_use_feature(UserPlan.FREE, "interview_simulator") == False
    assert can_use_feature(UserPlan.PRO, "interview_simulator") == True
    assert can_use_feature(UserPlan.PREMIUM, "analytics_advanced") == True
```

### Integration Tests

```bash
# Test free user accessing pro feature
curl -X POST http://localhost:8000/api/forge/polish \
  -H "Authorization: Bearer FREE_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "test"}'

# Expected: 402 Payment Required

# Test pro user accessing pro feature
curl -X POST http://localhost:8000/api/forge/polish \
  -H "Authorization: Bearer PRO_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "test"}'

# Expected: 200 OK
```

---

## Migration Guide

### Step 1: Identify Endpoints to Protect

Review all routes and identify which require subscription:

- [ ] `/forge/polish` - Requires credits or pro plan
- [ ] `/forge/documents` - Limited by plan
- [ ] `/routes` - Limited by plan
- [ ] `/interview/*` - Requires pro plan
- [ ] `/marketplace/book` - Requires pro plan
- [ ] `/analytics/advanced` - Requires premium plan

### Step 2: Add Entitlement Checks

```python
# Before
@router.post("/forge/polish")
async def polish_document(
    user: User = Depends(get_current_user)
):
    ...

# After
@router.post("/forge/polish")
async def polish_document(
    user: User = Depends(get_current_user),
    _: None = Depends(require_plan(UserPlan.PRO))
):
    ...
```

### Step 3: Update Frontend

Update frontend to handle 402 responses:

```typescript
// In API client
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 402) {
      // Redirect to upgrade page
      const upgradePlan = error.response.headers['x-upgrade-required'];
      router.push(`/subscription/checkout?plan=${upgradePlan}`);
    }
    return Promise.reject(error);
  }
);
```

### Step 4: Test Thoroughly

- [ ] Test free user accessing pro features (should get 402)
- [ ] Test pro user accessing pro features (should work)
- [ ] Test premium user accessing all features (should work)
- [ ] Test downgrade scenario (user loses access)
- [ ] Test upgrade scenario (user gains access immediately)

---

## Error Handling

### 402 Payment Required

**Standard response:**
```json
{
  "detail": "Upgrade to pro plan required"
}
```

**Headers:**
```
X-Upgrade-Required: pro
X-Current-Plan: free
X-Feature-Required: interview_simulator
```

### Frontend Handling

```typescript
async function polishDocument(content: string) {
  try {
    const response = await fetch('/api/forge/polish', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    
    if (response.status === 402) {
      const upgradePlan = response.headers.get('X-Upgrade-Required');
      showUpgradeModal(upgradePlan);
      return;
    }
    
    return await response.json();
  } catch (error) {
    handleError(error);
  }
}
```

---

## Best Practices

### 1. Always Enforce Server-Side

❌ **Don't rely only on client-side checks:**
```typescript
// Client-side only - CAN BE BYPASSED
if (user.plan === 'free') {
  setShowPaywall(true);
  return;
}
```

✅ **Always enforce server-side:**
```python
# Server-side - CANNOT BE BYPASSED
@router.post("/premium-feature")
async def premium_feature(
    _: None = Depends(require_plan(UserPlan.PRO))
):
    ...
```

### 2. Use Feature Flags for Testing

```python
# Allow bypass in demo mode
if settings.DEMO_MODE:
    return user  # Skip entitlement check
```

### 3. Log Entitlement Violations

```python
import logging

logger = logging.getLogger(__name__)

def _check_plan(user: User):
    if user_level < required_level:
        logger.warning(
            f"Entitlement violation: user {user.id} "
            f"(plan={user.plan}) tried to access {minimum_plan.value} feature"
        )
        raise HTTPException(...)
```

### 4. Provide Clear Error Messages

```python
raise HTTPException(
    status_code=402,
    detail=f"Upgrade to {minimum_plan.value} plan required",
    headers={
        "X-Upgrade-Required": minimum_plan.value,
        "X-Current-Plan": user_plan.value,
        "X-Upgrade-URL": f"/subscription/checkout?plan={minimum_plan.value}",
    }
)
```

---

## Monitoring

### Track Entitlement Violations

```python
# In middleware or dependency
from app.db.models import ProductEvent

async def log_entitlement_violation(user: User, feature: str):
    db.add(ProductEvent(
        user_id=user.id,
        event_name="entitlement_violation",
        properties={
            "feature": feature,
            "user_plan": user.plan,
        }
    ))
    await db.commit()
```

### Analytics Dashboard

Track:
- Number of 402 responses per day
- Most attempted premium features by free users
- Conversion rate after paywall
- Entitlement violations by user

---

## Troubleshooting

### Issue: User gets 402 but should have access

**Solution:**
```bash
# Check user's plan in database
psql -c "SELECT id, email, plan FROM users WHERE email='user@example.com';"

# Verify plan is correct
# If wrong, update:
psql -c "UPDATE users SET plan='pro' WHERE email='user@example.com';"
```

### Issue: Entitlement not enforced

**Solution:**
```python
# Check if dependency is added
@router.post("/endpoint")
async def endpoint(
    user: User = Depends(get_current_user),
    _: None = Depends(require_plan(UserPlan.PRO))  # <-- This line required
):
    ...
```

### Issue: Frontend not handling 402

**Solution:**
```typescript
// Add interceptor to API client
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 402) {
      // Handle upgrade flow
      handleUpgradeRequired(error.response);
    }
    return Promise.reject(error);
  }
);
```

---

## Future Enhancements

### 1. Usage-Based Billing

```python
@router.post("/forge/polish")
async def polish_document(user: User = Depends(get_current_user)):
    # Charge per document for free users
    if user.plan == "free":
        cost = await charge_per_document(user.id, amount_cents=99)
        if not cost.success:
            raise HTTPException(status_code=402, detail="Insufficient credits")
```

### 2. Time-Limited Trials

```python
def require_trial_or_paid():
    def _check(user: User):
        if user.plan != "free":
            return user
        
        if user.trial_expires_at and user.trial_expires_at > datetime.now():
            return user  # Trial active
        
        raise HTTPException(status_code=402, detail="Trial expired")
    return _check
```

### 3. Team/Enterprise Plans

```python
class UserPlan(str, Enum):
    FREE = "free"
    PRO = "pro"
    PREMIUM = "premium"
    TEAM = "team"
    ENTERPRISE = "enterprise"
```

---

**Last Updated:** April 13, 2026  
**Maintainer:** Backend Team
