# Handoff: Olcan Compass (repo state + next steps)

## Canonical product docs

- Source of truth PRD: `docs/main/PRD.md`
- Screen topology map: `docs/main/screen-structure.md`
- Working notes / prior agent notes: `docs/reference/update-notes.md`

Supporting reference docs live in `docs/reference/`.

## Repo layout (high signal)

- `apps/api/`: FastAPI foundation (runnable) + DB migrations
- `apps/web/`: placeholder for the future React frontend
- `archive/`: legacy prototypes and exports preserved as reference

## What was implemented (foundation)

### API

Location: `apps/api/`

- FastAPI app factory in `apps/api/app/main.py`
- Router registry in `apps/api/app/api/router.py`
- **Health endpoint**: `GET /api/health`
- **Authentication endpoints** (`/api/auth/*`):
  - Register, login, password reset, email verification
  - JWT token-based auth with refresh tokens
  - Profile management
- **Psychological Engine** (`/api/psych/*`):
  - Psych profiles with scores (confidence, anxiety, discipline, etc.)
  - Assessment sessions with questions/answers
  - Score history tracking
- **Route Engine** (`/api/routes/*`):
  - Route templates (scholarship, job, research, etc.)
  - User routes with milestones
  - Milestone tracking
- **Narrative Intelligence Engine** (`/api/narratives/*`) — **NEW**:
  - Document creation with versioning
  - AI analysis (placeholder for actual AI integration)
  - Scores: clarity, coherence, alignment, authenticity
  - Improvement suggestions and key strengths
- Settings: `apps/api/app/core/config.py` using `pydantic-settings`

### Database Models (Complete)

- **User**: Authentication, roles, verification
- **Psychology**: PsychProfile, PsychQuestion, PsychAnswer, PsychAssessmentSession, PsychScoreHistory
- **Routes**: RouteTemplate, RouteMilestoneTemplate, Route, RouteMilestone
- **Narratives**: Narrative, NarrativeVersion, NarrativeAnalysis
- **Economics** — **NEW**: VerificationCredential, EscrowTransaction, ScenarioSimulation, CredentialUsageTracking, OpportunityCostWidgetEvent
  - Config comes from environment variables (see `.env.example`)

### Database + migrations

- SQLAlchemy base: `apps/api/app/db/base.py`
- Async engine/sessionmaker (runtime): `apps/api/app/db/session.py`
- Models:
  - `apps/api/app/db/models/user.py` (table `users`)
- `apps/api/app/db/models/narrative.py` (Narrative Engine)
- `apps/api/app/db/models/economics.py` (Economics Intelligence) — **NEW**
- Alembic config:
  - `apps/api/alembic.ini`
  - `apps/api/alembic/env.py`
- Initial migration:
  - `apps/api/alembic/versions/0001_init.py` creates `users` table
- **Migrations 0002-0012**: Psychology, routes, verification, narratives, interviews, applications, sprints, prompts/AI, marketplace, **economics tables**, **economics extensions**

## Economics-Driven Intelligence Features (NEW)

Five economics-driven features were implemented to maximize business value while maintaining seamless UX:

### 1. Trust Signal System (Verification Credentials)

**Purpose:** Allow high-readiness users to prove their preparation to employers without sharing sensitive documents.

**Implementation:**
- **Database:** `verification_credentials` table with SHA-256 hashed verification URLs
- **Backend Service:** `apps/api/app/services/credentials.py` - Generate, verify, revoke credentials
- **API Endpoints:** `/api/credentials/*` (5 endpoints)
- **Background Jobs:** `apps/api/app/tasks/credentials.py` - Auto-generate at readiness threshold, expire old credentials
- **Frontend Component:** `VerificationBadge.tsx` - "Perfil Verificado" badge on Psychology Dashboard
- **Frontend Hook:** `useCredentials.ts` - Manage credentials with React Query

**Key Features:**
- Cryptographic verification with public URLs (no PII exposure)
- Rate-limited public verification endpoint (10 req/hour per IP)
- Credential usage tracking for conversion attribution
- 90-day expiration with auto-cleanup

### 2. Temporal Preference Matching

**Purpose:** Match users to routes based on their psychological time preferences (urgency vs. patience).

**Implementation:**
- **Database:** `temporal_preference` column on `user_psych_profiles`, `recommended_temporal_range` on `route_templates`
- **Backend Service:** `apps/api/app/services/temporal_matching.py` - Calculate preferences, match routes, adjust milestone density
- **API Endpoints:** `/api/temporal-matching/*` (4 endpoints)
- **Background Jobs:** `apps/api/app/tasks/temporal_matching.py` - Recalculate matches on assessment completion
- **Frontend Component:** `TemporalRouteRecommendations.tsx` - Matched routes on Routes Templates page
- **Frontend Hook:** `useTemporalMatching.ts` - Fetch matched routes and preferences
- **Integration:** Psychology Engine triggers recalculation, Routes Engine enriches recommendations

**Key Features:**
- Natural Portuguese explanations ("Esta rota combina com seu ritmo")
- Churn prediction based on temporal mismatch
- Personalized milestone density (more frequent for urgent users)

### 3. Opportunity Cost Intelligence

**Purpose:** Drive premium conversions by showing users the financial cost of delay during low momentum periods.

**Implementation:**
- **Database:** `opportunity_cost_daily` on `opportunities`, `momentum_score` on `users`, `opportunity_cost_widget_events` table
- **Backend Service:** `apps/api/app/services/opportunity_cost.py` - Calculate costs, track momentum, widget display logic
- **API Endpoints:** `/api/opportunity-cost/*` (5 endpoints)
- **Background Jobs:** `apps/api/app/tasks/opportunity_cost.py` - Daily cost calculation, momentum checks
- **Frontend Component:** `GrowthPotentialWidget.tsx` - Growth widget on Applications Opportunities page
- **Frontend Hook:** `useOpportunityCost.ts` - Track momentum and widget events
- **Integration:** Applications Engine enriches opportunities, Sprints Engine triggers momentum checks

**Key Features:**
- Motivational Portuguese messaging (no guilt-inducing language)
- Automatic impression/click/conversion tracking
- CTA for Pro/Premium upgrades
- ROI calculation for feature attribution

### 4. Performance-Bound Marketplace

**Purpose:** Increase marketplace booking value by offering outcome-based payment protection via escrow.

**Implementation:**
- **Database:** `escrow_transactions` table, `performance_bound` flag on `service_listings`
- **Backend Service:** `apps/api/app/services/escrow.py` - Create escrow, calculate readiness improvements, resolve with release/refund
- **API Endpoints:** `/api/escrow/*` (4 endpoints)
- **Background Jobs:** `apps/api/app/tasks/escrow.py` - Auto-resolve escrow, check timeouts
- **Frontend Component:** `PerformanceGuaranteeBadge.tsx` - "Garantia de Resultado" badge on service cards
- **Frontend Hook:** `useEscrow.ts` - Manage escrow transactions
- **Integration:** Marketplace Engine creates escrow on booking, resolves on completion
- **Payment Processing:** Stripe Connect integration for holds and transfers

**Key Features:**
- 30% of payment held in escrow until performance conditions met
- Readiness improvement tracking (default: 10-point minimum)
- Provider success rate display
- Automatic release or refund based on Sprint Engine assessments

### 5. Scenario Optimization Engine

**Purpose:** Reduce decision paralysis by visualizing Pareto-optimal opportunities given user constraints.

**Implementation:**
- **Database:** `scenario_simulations` table, `competitiveness_score` and `resource_requirements_score` on `opportunities`
- **Backend Service:** `apps/api/app/services/scenario_optimization.py` - Calculate feasible frontier, identify Pareto-optimal opportunities
- **API Endpoints:** `/api/scenarios/*` (4 endpoints)
- **Background Jobs:** `apps/api/app/tasks/scenario_optimization.py` - Async frontier calculation
- **Frontend Component:** `Simulator.tsx` - Interactive scatter plot with constraint sliders
- **Frontend Hook:** `useScenarios.ts` - Manage constraints with 500ms debouncing
- **Integration:** Applications Engine enriches opportunities with scores

**Key Features:**
- Interactive Recharts scatter plot (competitiveness vs. resource requirements)
- Real-time constraint adjustment (budget, time, skills, locations, industries)
- Pareto-optimal highlighting in Lumina blue
- Portuguese explanations and suggestions
- Decision quality tracking

### Infrastructure Components

**Celery + Redis:**
- `apps/api/app/core/celery_app.py` - Celery configuration with Redis broker
- `apps/api/app/core/celery_beat.py` - Periodic task schedule (3 scheduled tasks)
- `docker-compose.yml` - Redis, celery_worker, celery_beat services

**Stripe Integration:**
- `apps/api/app/core/stripe_client.py` - Payment intents, transfers, refunds, webhook verification

**Security:**
- `apps/api/app/core/security/hashing.py` - SHA-256 hashing for PII protection
- `apps/api/app/api/routes/user_data.py` - LGPD data export/deletion endpoints

**Performance:**
- `apps/api/app/core/cache.py` - Redis caching for credentials, preferences, momentum, frontiers
- Database query optimizations with eager loading and pagination

**Monitoring:**
- `apps/api/app/core/logging.py` - Structured logging with `structlog`
- `apps/api/app/api/routes/health_economics.py` - Health check endpoint for all 5 features

**Admin Analytics:**
- `apps/api/app/api/routes/admin_economics.py` - 6 dashboard endpoints for measuring business impact

### Success Metrics

The five features target these business outcomes:
1. **Credential Conversion Rate:** 15% improvement in application acceptance
2. **Temporal Churn Reduction:** 20% reduction in user churn
3. **Opportunity Cost Conversion:** 25% conversion rate from widget to premium upgrade
4. **Marketplace Booking Value:** 30% increase in average booking value
5. **Decision Paralysis Reduction:** 40% reduction in time-to-first-application

### Deployment

See `docs/deployment/economics-features-deployment.md` for comprehensive deployment checklist including:
- Pre-deployment verification (tests, migrations, environment config)
- Phased deployment steps (database → backend → frontend → backfill)
- Post-deployment smoke tests
- Rollback procedures
- Monitoring and troubleshooting

### Documentation

- **Requirements:** `.kiro/specs/economics-driven-intelligence/requirements.md` (12 requirements, 87 acceptance criteria)
- **Design:** `.kiro/specs/economics-driven-intelligence/design.md` (complete technical design)
- **Tasks:** `.kiro/specs/economics-driven-intelligence/tasks.md` (19 top-level tasks, 80+ subtasks)
- **Deployment:** `docs/deployment/economics-features-deployment.md` (deployment checklist)



## How to run (dev)

### Option A: Docker (recommended)

From repo root:

```bash
docker compose up --build
```

Then run migrations:

```bash
docker compose run --rm api alembic upgrade head
```

Health check:
- http://localhost:8000/api/health

#### Common error

If you see:

`Cannot connect to the Docker daemon ... Is the docker daemon running?`

Start **Docker Desktop** and wait until it reports Docker is running, then re-run the commands.

### Option B: No Docker (local python)

You still need a reachable Postgres (local install or other).

From `apps/api`:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# edit DATABASE_URL to point to your Postgres, likely localhost
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Install frontend dependencies:
   ```bash
   cd apps/web
   npm install
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Run dev server:
   ```bash
   npm run dev
   ```
   Frontend will be at `http://localhost:3000`

### P0 Notes (Auth + Dev UX)

#### Frontend auth contract (single source of truth)

- The frontend should use `apps/web/src/lib/api.ts` for auth.
- `api.login()` / `api.register()` are responsible for:
  - calling backend `/api/auth/login` or `/api/auth/register`
  - storing `token` + `refresh_token`
  - fetching `/api/auth/me` to return a full user profile (including `full_name`)

React Query hooks in `apps/web/src/hooks/useAuth.ts` should call these helpers rather than duplicating token handling.

#### Password reset + emails

- Transactional emails are **not implemented yet** (see TODOs in `apps/api/app/api/routes/auth.py`).
- In development (`settings.env != "production"`), `/api/auth/forgot-password` returns a `reset_url` so you can reset without email delivery.
- The frontend `ForgotPassword` page displays `reset_url` when present.

#### Root-level frontend commands (avoid running npm in the wrong folder)

This repo is a monorepo; root has a `package.json` with convenience scripts.

From repo root:

```bash
npm run install:web
npm run dev:web
```

#### Auth smoke test (API)

From repo root:

```bash
npm run smoke:auth
```

## What failed in the last session

### Auth Bug (FIXED - 2026-02-23)
- **Problem**: Registration and login were failing due to API response structure mismatch
- **Root Cause**: Backend returns nested `token` object, frontend expected flat structure
- **Solution**: Updated `apps/web/src/lib/api.ts` to correctly extract nested token and fetch full profile
- **Status**: ✅ Auth now works correctly

### Design System Not Implemented
- **Problem**: Frontend is a minimal scaffold, doesn't implement Metamodern Design System from PRD
- **Missing**: Alchemical palette, typography system, The Map/Forge/Mirror modes, MMXD patterns
- **Status**: ⚠️ Needs complete redesign following PRD specifications

See `STATUS.md` for detailed current state and next priorities.

## Next development steps (suggested)

**Complete Backend Implementation** - All major backend systems implemented:
- ✅ All four engines (Narrative, Interview, Application, Readiness)
- ✅ AI Service Layer (prompts, adapters, job queue)
- ✅ Marketplace (providers, services, bookings, reviews)
- ✅ **Economics Intelligence Layer** — **NEW** (5 features):
  - **Trust Signal System**: Cryptographic verification credentials for high-readiness users
  - **Temporal Preference Matching**: Route recommendations based on psychological time preferences
  - **Opportunity Cost Intelligence**: Growth potential widget to drive premium conversions
  - **Performance-Bound Marketplace**: Escrow system with outcome-based payments
  - **Scenario Optimization Engine**: Pareto-optimal opportunity visualization

**Remaining priorities:**

- **Frontend** (`apps/web/`):
  - React 18 + Vite + TypeScript
  - Tailwind CSS for styling
  - React Query for server state
  - Zustand for client state
  - React Router for navigation
  - Axios API client with auth
  - Dashboard layout with sidebar navigation
  - Placeholder pages for all engines
  - **Economics Components** — **NEW**:
    - VerificationBadge (Psychology Dashboard)
    - TemporalRouteRecommendations (Routes Templates)
    - GrowthPotentialWidget (Applications Opportunities)
    - PerformanceGuaranteeBadge (Marketplace Browse)
    - Simulator (Applications/Simulator page)
  - **Economics Hooks** — **NEW**:
    - useCredentials, useTemporalMatching, useOpportunityCost, useEscrow, useScenarios

## Conventions / guardrails for other agents

- Do not modify `docs/main/PRD.md` as part of implementation changes; treat it as canon.
- Add DB tables only via Alembic migrations.
- Keep routers modular under `apps/api/app/api/routes/`.
- Keep settings in env, and commit only `.env.example` templates.
