# API Versioning Strategy

## Overview

This document defines the API versioning strategy for Olcan Compass to ensure backward compatibility while enabling innovation.

---

## Current State

**API Structure:**
```
/api/*                    # Current API (v1 implicit)
/api/auth/register
/api/forge/polish
/api/psych/assessment/start
...

/api/v1/*                 # Legacy v1 endpoints (if any)
```

**Status:** Single version, no explicit versioning yet.

---

## Versioning Strategy: URL Versioning

We will use **URL-based versioning** as it's the most explicit and widely adopted approach.

### URL Pattern

```
https://api.olcan.com.br/api/v{version}/{resource}
```

**Examples:**
```
/api/v1/auth/register
/api/v1/forge/polish
/api/v2/auth/register          # Future v2
```

---

## When to Create New Version

### Create v2 When:

✅ **Breaking changes needed:**
- Remove required fields from responses
- Change field types (string → number)
- Remove endpoints entirely
- Change authentication method
- Modify error response format

❌ **Do NOT create v2 for:**
- Adding new endpoints
- Adding optional fields to responses
- Bug fixes
- Performance improvements
- Adding new query parameters

---

## Version Lifecycle

### Phase 1: Active (Current Version)

- Fully supported
- Receives new features
- Receives security patches
- **Duration:** Indefinite until v3 created

### Phase 2: Maintenance (Previous Version)

- Security patches only
- No new features
- **Duration:** 6 months after next version release

### Phase 3: Deprecated (Old Version)

- Marked as deprecated in docs
- Returns `Deprecation` header
- **Duration:** 3 months before sunset

### Phase 4: Sunset (Retired Version)

- Returns `410 Gone` status
- Redirects to migration guide
- **Duration:** Permanent

---

## Version Timeline Example

```
2024-01: v1 released (active)
2025-06: v2 released (v1 → maintenance)
2025-12: v1 deprecated (6 months maintenance)
2026-03: v1 sunset (3 months deprecated)

2026-06: v3 released (v2 → maintenance)
2026-12: v2 deprecated
2027-03: v2 sunset
```

---

## Deprecation Headers

When a version is deprecated, all responses include:

```http
HTTP/1.1 200 OK
Deprecation: true
Sunset: Sat, 01 Mar 2026 00:00:00 GMT
Link: <https://docs.olcan.com.br/migration/v1-to-v2>; rel="deprecation"
X-API-Version: v1
X-API-Version-Latest: v2
```

---

## Migration Guide Template

When releasing v2, provide migration guide:

### v1 → v2 Migration Guide

#### Breaking Changes

**1. Authentication Response Format**

**v1:**
```json
{
  "access_token": "jwt...",
  "token_type": "bearer"
}
```

**v2:**
```json
{
  "access_token": "jwt...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "jwt...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Migration:**
```typescript
// v1 client
const token = response.access_token;

// v2 client (backward compatible)
const token = response.access_token;
// New: access to user data
const user = response.user;
```

**2. Error Response Format**

**v1:**
```json
{
  "detail": "Error message"
}
```

**v2:**
```json
{
  "error": {
    "code": "AUTH_001",
    "message": "Invalid credentials",
    "details": {},
    "trace_id": "req_abc123"
  }
}
```

#### New Features

- Added `/api/v2/psych/assessment/recommendations`
- Added batch operations for Forge documents
- Improved rate limiting with better error messages

#### Deprecated Endpoints

- `GET /api/v1/legacy/reports` → Use `/api/v2/analytics/reports`

---

## Implementation

### FastAPI Router Structure

```python
# app/api/routes/v1/auth.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/auth", tags=["Auth v1"])

@router.post("/register")
async def register_v1(...):
    # v1 implementation
    ...

# app/api/routes/v2/auth.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/v2/auth", tags=["Auth v2"])

@router.post("/register")
async def register_v2(...):
    # v2 implementation with improvements
    ...
```

### Main App Registration

```python
# app/main.py
from app.api.routes.v1 import auth as auth_v1
from app.api.routes.v2 import auth as auth_v2

app = FastAPI()

# Register v1 routes
app.include_router(auth_v1.router)

# Register v2 routes
app.include_router(auth_v2.router)
```

### Version Detection Middleware

```python
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

class APIVersionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Extract version from URL
        path_parts = request.url.path.split('/')
        version = None
        
        if len(path_parts) > 2 and path_parts[2].startswith('v'):
            version = path_parts[2]
        
        # Process request
        response = await call_next(request)
        
        # Add version headers
        if version:
            response.headers["X-API-Version"] = version
            response.headers["X-API-Version-Latest"] = "v2"
            
            # Check if deprecated
            if version == "v1":
                from datetime import datetime, timedelta
                sunset_date = datetime.now() + timedelta(days=90)
                
                response.headers["Deprecation"] = "true"
                response.headers["Sunset"] = sunset_date.strftime("%a, %d %b %Y %H:%M:%S GMT")
        
        return response

app.add_middleware(APIVersionMiddleware)
```

---

## Backward Compatibility Rules

### Rule 1: Never Remove Fields

❌ **Bad:**
```python
# v1 response
{
  "id": "123",
  "name": "User",
  "email": "user@example.com"
}

# v2 response (removed name field)
{
  "id": "123",
  "email": "user@example.com"
}
```

✅ **Good:**
```python
# v2 response (keep all v1 fields, add new ones)
{
  "id": "123",
  "name": "User",
  "email": "user@example.com",
  "full_name": "User Full Name"  # New field
}
```

### Rule 2: Never Change Field Types

❌ **Bad:**
```python
# v1
{
  "price": "99.00"  # string
}

# v2
{
  "price": 99.00    # number
}
```

✅ **Good:**
```python
# v2 (add new field with correct type)
{
  "price": "99.00",
  "price_cents": 9900  # New field, correct type
}
```

### Rule 3: Never Change HTTP Methods

❌ **Bad:**
```
v1: POST /api/v1/users/123/delete
v2: DELETE /api/v2/users/123
```

✅ **Good:**
```
v1: POST /api/v1/users/123/delete (keep)
v2: DELETE /api/v2/users/123 (new endpoint)
```

---

## Client-Side Version Selection

### Option 1: URL Path (Recommended)

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Use v1
const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});

// Use v2
const response = await fetch(`${API_BASE_URL}/api/v2/auth/register`, {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});
```

### Option 2: Header (Alternative)

```typescript
const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
  method: 'POST',
  headers: {
    'API-Version': 'v2',
  },
  body: JSON.stringify({ email, password }),
});
```

---

## Testing Strategy

### Test All Active Versions

```python
# tests/test_api_versions.py
import pytest

@pytest.mark.parametrize("version", ["v1", "v2"])
async def test_auth_register(version, client):
    """Test registration works in all active versions."""
    response = await client.post(
        f"/api/{version}/auth/register",
        json={
            "email": "test@example.com",
            "password": "Test1234!",
        }
    )
    assert response.status_code == 201

async def test_v2_has_new_features(client):
    """Test v2 has features not in v1."""
    response = await client.post("/api/v2/psych/assessment/recommendations")
    assert response.status_code == 200
    
    # v1 doesn't have this endpoint
    response = await client.post("/api/v1/psych/assessment/recommendations")
    assert response.status_code == 404
```

---

## Documentation

### Swagger UI Configuration

```python
from fastapi import FastAPI

app = FastAPI(
    title="Olcan Compass API",
    description="API documentation for all versions",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Separate docs for each version
app_v1 = FastAPI(title="API v1", docs_url="/docs/v1")
app_v2 = FastAPI(title="API v2", docs_url="/docs/v2")
```

### API Documentation Structure

```
docs/api/
├── v1/
│   ├── reference.md
│   ├── migration-guide.md
│   └── deprecation-notice.md
├── v2/
│   ├── reference.md
│   └── changelog.md
└── migration/
    ├── v1-to-v2.md
    └── v2-to-v3.md
```

---

## Monitoring

### Track Version Usage

```python
from app.db.models import APIRequest

async def log_api_request(request: Request, version: str):
    db.add(APIRequest(
        endpoint=request.url.path,
        version=version,
        method=request.method,
        status_code=response.status_code,
        timestamp=datetime.now(),
    ))
    await db.commit()
```

### Analytics Dashboard

Track:
- Requests per version (v1 vs v2)
- Error rates per version
- Most used endpoints per version
- Clients still using deprecated versions

---

## Rollout Strategy

### Step 1: Develop v2 (3-4 weeks)

- Create v2 routes alongside v1
- Implement new features
- Test thoroughly

### Step 2: Beta Release (2 weeks)

- Enable v2 for beta testers
- Monitor error rates
- Collect feedback

### Step 3: General Availability (GA)

- Announce v2 availability
- Publish migration guide
- Start deprecation clock for v1

### Step 4: Monitor Adoption (3-6 months)

- Track v2 adoption rate
- Reach out to clients still on v1
- Provide migration support

### Step 5: Deprecate v1 (after 6 months)

- Mark v1 as deprecated
- Send notifications to all v1 users
- Provide migration deadline

### Step 6: Sunset v1 (after 9 months)

- Return 410 Gone for v1 requests
- Redirect to migration guide
- Remove v1 code from codebase

---

## Emergency Rollback

If v2 has critical bugs:

```python
# Temporarily redirect v2 to v1
@app.middleware("http")
async def emergency_redirect(request: Request, call_next):
    if request.url.path.startswith("/api/v2/"):
        # Redirect to v1
        v1_path = request.url.path.replace("/api/v2/", "/api/v1/")
        return RedirectResponse(url=v1_path)
    
    return await call_next(request)
```

---

## Best Practices

### 1. Version Early

Don't wait until you have breaking changes. Version from the start if you anticipate growth.

### 2. Maintain Maximum 2 Versions

Never support more than 2 active versions simultaneously. It creates maintenance burden.

### 3. Communicate Early

Give clients at least 6 months notice before deprecating a version.

### 4. Provide Migration Tools

- Migration guides with code examples
- Automated migration scripts if possible
- Dedicated support for migration

### 5. Monitor Closely

Track version adoption and reach out to clients who haven't migrated.

---

## Future Considerations

### GraphQL Alternative

Consider GraphQL for complex queries where REST versioning becomes cumbersome:

```graphql
query GetUser {
  user(id: "123") {
    id
    email
    plan
    entitlements {
      maxDocuments
      maxRoutes
    }
  }
}
```

### API Gateway

For large-scale systems, consider API gateway for version routing:

```
api.olcan.com.br/v1/* → api-v1.internal
api.olcan.com.br/v2/* → api-v2.internal
```

---

## Decision Matrix

| Scenario | Action |
|----------|--------|
| Add new endpoint | Add to current version |
| Add optional field | Add to current version |
| Fix bug | Fix in current version |
| Remove required field | Create new version |
| Change field type | Create new version |
| Change auth method | Create new version |
| Performance improvement | Add to current version |

---

**Last Updated:** April 13, 2026  
**Status:** Strategy defined, implementation pending  
**Next Steps:** Implement when breaking changes needed
