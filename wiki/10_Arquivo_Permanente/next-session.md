# Olcan Compass - Quick Start Guide

**Last Updated:** 2026-02-24

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Authentication | ✅ Complete | 11 endpoints |
| All Backend Engines | ✅ Complete | Psychology, Routes, Narratives, Interviews, Applications, Sprints, Marketplace, AI |
| Database Migrations | ✅ Ready | 10 migrations (0001-0010) |
| Frontend Scaffold | ✅ Complete | React 18 + TypeScript + Tailwind |
| Economics Spec | ✅ Ready | Requirements, Design, Tasks complete |
| Email Integration | 🔲 Pending | TODO comments in code |
| Seed Data | 🔲 Pending | Routes & questions needed |

---

## Session Priorities (2026-02-24)

### ✅ Completed This Session

1. **SQLAlchemy Boolean Field Bug (FIXED)**
   - Fixed `client_followup_needed` field in `marketplace.py` line 255
   - Added `nullable=False` parameter to prevent type resolution errors
   - Created comprehensive troubleshooting infrastructure

2. **Economics-Driven Intelligence Spec (COMPLETE)**
   - Created complete requirements document (12 requirements, 87 acceptance criteria)
   - Created complete design document (5 tables, 30+ endpoints, 24 correctness properties)
   - Created complete tasks document (19 top-level tasks, 80+ subtasks)
   - Spec ready for implementation at `.kiro/specs/economics-driven-intelligence/`

3. **Troubleshooting Documentation (CREATED)**
   - `docs/reference/troubleshooting-sqlalchemy.md` - Complete SQLAlchemy 2.0 guide
   - `scripts/check_sqlalchemy_models.py` - Automated consistency checker
   - `scripts/test_model_imports.py` - Import tester for isolating errors

### 🎯 Next Session Priorities

**Option A: Implement Economics Features (Recommended)**
- Execute tasks from `.kiro/specs/economics-driven-intelligence/tasks.md`
- Start with database migrations (Tasks 1.1-1.3)
- Implement backend services with property-based tests (Tasks 2.1-2.10)
- 5 features: Trust Signals, Temporal Matching, Opportunity Cost, Escrow, Scenario Optimization

**Option B: Frontend Design System**
- Implement MMXD design tokens and component library
- See `STATUS.md` Phase 1 for details
- Required before building real user-facing pages

**Option C: Seed Data & Testing**
- Create seed data for routes, questions, opportunities
- Test full user flows end-to-end
- Verify all engines work together

---

## To Continue Development

### Step 1: Start Docker Desktop
```bash
open -a Docker
```

### Step 2: Build and Run
```bash
cd apps/api
docker compose up --build
```

### Step 3: Run Migrations
```bash
docker compose run --rm api alembic upgrade head
```

### Step 4: Test Endpoints

**Register:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@olcan.com", "password": "Demo1234", "full_name": "Demo User"}'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@olcan.com", "password": "Demo1234"}'
```

**Get Route Templates:**
```bash
curl -X GET http://localhost:8000/api/routes/templates
```

---

## All Endpoints

### Authentication (prefix: /api/auth)
| Method | Path | Description |
|--------|------|-------------|
| POST | /register | Register new user |
| POST | /login | Login with email/password |
| POST | /refresh | Refresh access token |
| POST | /logout | Logout (client discards tokens) |
| GET | /me | Get current user profile |
| PUT | /me | Update profile |
| PUT | /me/password | Change password |
| POST | /verify-email | Verify email with token |
| POST | /resend-verification | Resend verification email |
| POST | /forgot-password | Request password reset |
| POST | /reset-password | Reset password with token |

### Psychological Engine (prefix: /api/psych)
| Method | Path | Description |
|--------|------|-------------|
| GET | /profile | Get user's psych profile |
| PUT | /profile | Update profile (limited) |
| POST | /assessment/start | Start new assessment |
| GET | /assessment/{id}/question | Get next question |
| POST | /assessment/answer | Submit answer |
| GET | /history | Get score history |

### Route Engine (prefix: /api/routes)
| Method | Path | Description |
|--------|------|-------------|
| GET | /templates | List available templates |
| POST | / | Create new route |
| GET | / | List user's routes |
| GET | /{id} | Get route details |
| PUT | /{id} | Update route |
| DELETE | /{id} | Delete route |
| PATCH | /milestones/{id} | Update milestone |

### Narrative Engine (prefix: /api/narratives)
| Method | Path | Description |
|--------|------|-------------|
| POST | / | Create new narrative |
| GET | / | List user's narratives |
| GET | /{id} | Get narrative details |
| PUT | /{id} | Update narrative |
| DELETE | /{id} | Delete narrative |
| POST | /{id}/versions | Create new version |
| GET | /{id}/versions | List versions |
| POST | /{id}/analyze | Request AI analysis |

### Interview Engine (prefix: /api/interviews)
| Method | Path | Description |
|--------|------|-------------|
| GET | /questions | List question bank |
| POST | /sessions | Start mock session |
| GET | /sessions | List user's sessions |
| GET | /sessions/{id} | Get session details |
| POST | /sessions/{id}/answer | Submit answer |
| POST | /sessions/{id}/complete | Complete session |

### Application Engine (prefix: /api/applications)
| Method | Path | Description |
|--------|------|-------------|
| GET | /opportunities | Search opportunities |
| GET | /opportunities/{id} | Get opportunity details |
| POST | /applications | Create application |
| GET | /applications | List user's applications |
| GET | /applications/{id} | Get application details |
| PUT | /applications/{id} | Update application |
| DELETE | /applications/{id} | Delete application |

### Sprints Engine (prefix: /api/sprints)
| Method | Path | Description |
|--------|------|-------------|
| GET | /templates | List sprint templates |
| POST | / | Create user sprint |
| GET | / | List user's sprints |
| GET | /{id} | Get sprint details |
| PUT | /{id} | Update sprint |
| PATCH | /tasks/{id} | Update task status |

### Marketplace (prefix: /api/marketplace)
| Method | Path | Description |
|--------|------|-------------|
| GET | /providers | Browse providers |
| GET | /providers/{id} | Get provider profile |
| GET | /services | Browse services |
| GET | /services/{id} | Get service details |
| POST | /bookings | Create booking |
| GET | /bookings | List user's bookings |
| GET | /bookings/{id} | Get booking details |
| POST | /reviews | Submit review |

---

## Known Issues / TODOs

1. **Email Service Not Integrated**: Endpoints `/resend-verification`, `/forgot-password` have TODO comments for email integration. Need to add Resend/SendGrid.

2. **No Seed Data**: Routes and psychological questions need seed data. Create migration or script to populate:
   - `route_templates` table (visa types: scholarship, job relocation, etc.)
   - `route_milestone_templates` table (milestones for each route type)
   - `psych_questions` table (assessment questions)

3. **SQLAlchemy 2.0 Best Practices**: Always add `nullable=False` to non-nullable boolean fields. See `docs/reference/troubleshooting-sqlalchemy.md` for complete guide.

4. **Frontend Design System Not Implemented**: Current frontend is minimal scaffold. Needs MMXD design tokens, component library, and view modes. See `STATUS.md` for details.

---

## Troubleshooting Tools

### Check SQLAlchemy Models
```bash
python scripts/check_sqlalchemy_models.py
```

Scans all model files for common SQLAlchemy 2.0 issues:
- Boolean fields missing `nullable` parameter
- `server_default` with lambda functions
- Type hint / nullable parameter mismatches
- Mutable defaults without callables

### Test Model Imports
```bash
python scripts/test_model_imports.py
```

Tests each model file individually to isolate import errors.

### Verify API Container
```bash
docker compose run --rm api python -c "from app.db.models import *"
```

Tests that all models can be imported successfully.

---

## Project Structure

```
apps/api/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py          # Auth + verification
│   │   │   ├── psychology.py   # Psychological engine
│   │   │   ├── routes.py        # Route engine
│   │   │   └── health.py         # Health check
│   │   └── router.py            # Route aggregator
│   ├── core/
│   │   ├── auth.py              # Auth dependencies
│   │   ├── config.py             # Settings
│   │   └── security/
│   │       ├── password.py       # Bcrypt hashing
│   │       ├── jwt.py           # JWT tokens
│   │       └── tokens.py         # Verification tokens
│   ├── db/
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── psychology.py
│   │   │   └── route.py
│   │   ├── session.py           # DB session
│   │   └── base.py              # Base class
│   └── schemas/                 # Pydantic schemas
├── alembic/versions/            # Migrations (0001-0004)
├── .env                         # Environment variables
├── requirements.txt             # Dependencies
└── docker-compose.yml           # Docker config
```

---

## Key Technical Decisions

1. **Timezone-aware datetimes**: All `datetime.now()` uses `datetime.now(timezone.utc)`
2. **UUID for IDs**: All primary keys use UUID, converted properly in JWT queries
3. **Async SQLAlchemy**: Using asyncpg for async database operations
4. **Portuguese error messages**: All user-facing messages are in Portuguese
5. **JWT tokens**: Access (15min) + Refresh (7 days) token rotation

---

## Next Priority Tasks

1. Add seed data for route templates and milestones
2. Add seed data for psychological questions
3. Integrate email service (Resend recommended)
4. Add readiness engine (PRD Phase 2)
