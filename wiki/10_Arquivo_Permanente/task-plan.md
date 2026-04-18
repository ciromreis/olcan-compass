# Task Plan: Olcan Compass

## Current Status

**Authentication**: ✅ COMPLETE (code written + bug fixes applied)
**Psychological Engine**: ✅ COMPLETE (models + endpoints + migration)
**Route Engine**: ✅ COMPLETE (models + endpoints + migration)
**Database Migrations**: Ready (needs Docker to run)

---

## Completed Work

### Phase 1: Authentication System ✅
- [x] User model with auth/security fields
- [x] Password hashing (bcrypt via passlib)
- [x] JWT access + refresh tokens
- [x] Auth endpoints (/register, /login, /refresh, /logout)
- [x] Profile endpoints (/me GET, /me PUT, /me/password)
- [x] Account lockout (5 failed attempts → 30 min lock)
- [x] Alembic migration for user table
- [x] Configuration via .env

### Phase 2: Psychological Engine ✅
- [x] 5 database models (Profile, Question, Answer, Session, History)
- [x] Pydantic schemas for all endpoints
- [x] API routes with score computation
- [x] State determination (mobility_state, psychological_state)
- [x] Alembic migration (0002_psych.py)

### Phase 3: Route Engine ✅
- [x] 4 database models (Template, MilestoneTemplate, Route, Milestone)
- [x] Pydantic schemas for all endpoints
- [x] API routes with milestone management
- [x] Auto-unlock next milestone on completion
- [x] Progress tracking (percentage)
- [x] Alembic migration (0003_routes.py)

### Bug Fixes Applied
- Fixed UUID conversion in JWT queries
- Fixed deprecated datetime.utcnow() → datetime.now(timezone.utc)
- Added Portuguese messages for all user-facing errors

---

## Phase 4: Test & Migrate

### Prerequisites
1. Docker Desktop running
2. Run: `docker compose up --build`
3. Run: `docker compose run --rm api alembic upgrade head`

### Test Commands
```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@olcan.com", "password": "Demo1234", "full_name": "Demo User"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@olcan.com", "password": "Demo1234"}'

# Get route templates
curl -X GET http://localhost:8000/api/routes/templates

# Create route (use token)
curl -X POST http://localhost:8000/api/routes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"template_id": "<template-id>", "name": "Minha Rota", "target_country": "Alemanha"}'
```

---

## Phase 5: PRD Phase 1 - Remaining

### 5.1 Email Verification Flow
- [ ] Add `verification_token` field to User
- [ ] Create `/auth/verify-email` endpoint
- [ ] Create `/auth/resend-verification` endpoint
- [ ] Email sending (use Resend or similar)

### 5.2 Password Reset Flow
- [ ] Create `/auth/forgot-password` endpoint
- [ ] Create `/auth/reset-password` endpoint
- [ ] Send reset email with token

---

## Phase 6: PRD Phase 2+ (Future)

- Readiness engine
- Narrative intelligence
- Interview intelligence
- Application management
- Marketplace
- Payments (Stripe)

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `gemini.md` | Schema definitions & rules |
| `progress.md` | Session logs & errors |
| `findings.md` | Research & constraints |
| `apps/api/` | Backend code |
| `docker-compose.yml` | Full stack orchestration |

---

## Environment Variables

In `apps/api/.env`:
```
JWT_SECRET_KEY=<generate-secure-random-string>
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/compass
```
