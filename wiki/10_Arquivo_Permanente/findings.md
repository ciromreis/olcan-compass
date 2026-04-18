# Findings: Olcan Compass Research & Discovery

---

## Project Context

### Repository Structure
- **Primary**: `apps/api/` (FastAPI) + `apps/web/` (React placeholder)
- **Documentation**: Comprehensive PRD, screen topology, database schema
- **Archive**: Previous prototypes (Next.js, Rust/Dioxus)

### Current Implementation State
- FastAPI app factory working
- Health endpoint (`GET /api/health`) functional
- Single `users` table with id, email, created_at
- Alembic configured but no migrations run yet

---

## Technical Decisions Made

### 1. Authentication Approach
**Decision**: Custom JWT implementation vs. fastapi-users

**Rationale**:
- PRD has specific requirements (account lockout, role-based access, refresh tokens)
- Custom implementation gives full control over JWT payload structure
- Allows exact compliance with PRD security requirements

### 2. Password Hashing
**Decision**: Bcrypt via passlib

**Rationale**:
- Industry standard
- Built-in salting
- Configurable work factor

### 3. JWT Structure
**Decision**: Separate access + refresh tokens

**Access Token**:
- Short-lived (15 minutes)
- Contains: sub, email, role, type="access", exp, iat

**Refresh Token**:
- Longer-lived (7 days)
- Contains: sub, email, role, type="refresh", exp, iat
- Used to obtain new access tokens

### 4. Role Enum
**Decision**: SQLAlchemy Enum vs. String

**Rationale**:
- Type safety in Python
- Database-level constraint via PostgreSQL enum
- Easy to extend for new roles

---

## Implementation Insights

### Key Files Created
1. `app/schemas/token.py` - All auth request/response schemas
2. `app/core/security/password.py` - Hashing utilities
3. `app/core/security/jwt.py` - Token creation/validation
4. `app/core/auth.py` - FastAPI dependencies for protected routes
5. `app/api/routes/auth.py` - All auth endpoints

### API Design Patterns Used
- **Dependency Injection**: FastAPI Depends for auth, db
- **Pydantic Models**: All input validation and output serialization
- **HTTP Status Codes**: 201 for creation, 401 for auth failures, 423 for locked
- **Error Messages**: Detailed but not exposing internal details

---

## What Was Learned

### From PRD Analysis
1. Phase 1 auth is foundational - everything depends on it
2. Psychological engine needs to come immediately after auth
3. Role-based access is critical for B2B future

### From Implementation
1. Async SQLAlchemy requires proper session management
2. JWT secret must be strong in production
3. Account lockout timing needs to be configurable

---

## Current Gaps

### Immediate (PRD Phase 1)
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] Refresh token blacklist (for logout)

### Near-term (PRD Phase 1)
- [ ] Psychological assessment tables
- [ ] Route template tables
- [ ] Milestone tables

### Future (PRD Phase 2+)
- [ ] Readiness scoring
- [ ] Narrative intelligence
- [ ] Interview simulation
- [ ] Marketplace
- [ ] Payments

---

## Testing Strategy

### Unit Tests Needed
1. Password hashing/verification
2. JWT creation/validation
3. Auth dependency resolution
4. Password strength validation

### Integration Tests Needed
1. Registration flow
2. Login flow
3. Token refresh
4. Protected route access

### Manual Testing
```bash
# With Docker running:
docker compose up --build
docker compose run --rm api alembic upgrade head

# Test registration
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@olcan.com", "password": "Demo1234", "full_name": "Demo User"}'
```

---

## Next Steps
1. Verify auth system with Docker
2. Add email verification
3. Add password reset
4. Build psychological engine tables
