# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Olcan Compass is a mobility intelligence platform for international students/professionals. It combines psychological profiling, route planning, narrative building, interview prep, application management, and a marketplace — unified under a "Metamodern Design System" (MMXD) philosophy.

The canonical product requirements live in `docs/main/PRD.md`. Treat it as read-only canon — never modify it during implementation.

## Build & Run

### Full Stack (Docker — recommended)

```bash
docker compose up --build
docker compose run --rm api alembic upgrade head
```

- API: http://localhost:8000/api/health
- Postgres: localhost:5432 (user/pass: postgres/postgres, db: compass)

### Backend Only (local Python, requires external Postgres)

```bash
cd apps/api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then edit DATABASE_URL for local Postgres
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd apps/web
npm install
cp .env.example .env
npm run dev
```

Frontend: http://localhost:3000

### Lint (frontend)

```bash
cd apps/web
npm run lint
```

### Build (frontend)

```bash
cd apps/web
npm run build   # runs tsc && vite build
```

### Database Migrations

```bash
# Apply all migrations
docker compose run --rm api alembic upgrade head

# Create a new migration
docker compose run --rm api alembic revision -m "description" --autogenerate
```

## Architecture

### Monorepo Layout

- `apps/api/` — FastAPI backend (Python 3.12)
- `apps/web/` — React 18 + Vite + TypeScript frontend
- `docs/main/` — Canonical PRD and screen topology (read-only)
- `docs/reference/` — Supporting research docs
- `archive/` — Legacy prototypes kept for reference only; do not deploy from here

### Backend (`apps/api/`)

**App factory pattern**: `app/main.py` → `create_app()` creates the FastAPI instance with CORS and router mounting.

**Router registry**: `app/api/router.py` aggregates all route modules under the `/api` prefix. Each engine has its own route file in `app/api/routes/`.

**API route groups** (all prefixed `/api`):
- `/health` — health check
- `/auth/*` — JWT auth (register, login, refresh, profile, password reset, email verification)
- `/psych/*` — psychological profiles, assessments, scoring
- `/routes/*` — mobility route templates and user routes with milestones
- `/narratives/*` — document versioning and AI analysis
- `/interviews/*` — question bank and mock sessions
- `/applications/*` — opportunities, applications, deadlines, watchlists
- `/sprints/*` — readiness sprints, tasks, gap analysis
- `/ai/*` — prompt registry and job queue
- `/marketplace/*` — providers, services, bookings, reviews, messaging

**Configuration**: `app/core/config.py` uses `pydantic-settings` loading from `.env`. All settings come from environment variables; only `.env.example` should be committed.

**Auth flow**: JWT-based with access + refresh tokens. `app/core/auth.py` provides `get_current_user` dependency. `app/core/security/` has password hashing, JWT creation, and token generation. Auth responses return a nested `token` object: `{ user_id, email, role, token: { access_token, refresh_token } }`.

**Database**: SQLAlchemy 2.0 async with `asyncpg`. Models in `app/db/models/`, schemas in `app/schemas/`. `app/db/session.py` provides `get_db` dependency for async sessions. All models use UUID primary keys. Alembic manages migrations (`alembic/versions/0001-0010`).

**Domain model groups** (in `app/db/models/`):
- `user.py` — User with roles (USER, PROVIDER, ORG_MEMBER, ORG_COORDINATOR, ORG_ADMIN, SUPER_ADMIN)
- `psychology.py` — PsychProfile, questions, answers, assessment sessions, score history
- `route.py` — RouteTemplate, RouteMilestoneTemplate, Route, RouteMilestone
- `narrative.py` — Narrative, NarrativeVersion, NarrativeAnalysis
- `interview.py` — InterviewQuestion, InterviewSession, InterviewAnswer
- `application.py` — Opportunity, UserApplication, documents, watchlists, matches
- `sprint.py` — SprintTemplate, UserSprint, SprintTask, ReadinessAssessment, GapAnalysis
- `prompt.py` — PromptTemplate, PromptExecutionLog, AIJobQueue
- `marketplace.py` — ProviderProfile, ServiceListing, Booking, Review, Conversation, Message

**AI endpoints** are placeholders — no real AI integration yet.

### Frontend (`apps/web/`)

**Stack**: React 18, Vite, TypeScript (strict), Tailwind CSS, React Router, Zustand (client state), React Query / @tanstack/react-query (server state), Axios, Framer Motion.

**Design system**: MMXD (Metamodern Design) tokens in `src/design-tokens.json`, consumed by `tailwind.config.js`. Color palette: Void (dark navy), Lux (silver), Lumina (blue accents), Neutral scale. Typography: Merriweather Sans (headings), Source Sans 3 (body), JetBrains Mono (code).

**UI components**: `src/components/ui/` has Button, Card, Input, Progress, Typography — exported via barrel `index.ts`.

**Auth**: `src/store/auth.ts` (Zustand with persist). API client in `src/lib/api.ts` — Axios-based singleton with JWT interceptor. Tokens stored in `localStorage`.

**Routing**: `src/App.tsx` — public routes (`/login`, `/register`) and protected routes inside `<Layout>` (dashboard, narratives, interviews, applications, sprints, marketplace). Most engine pages are currently placeholders.

**Path alias**: `@` maps to `src/` (configured in `vite.config.ts`).

**Vite dev proxy**: `/api` requests proxy to `http://localhost:8000`.

## Conventions

- Add DB tables only via Alembic migrations — never manually alter the schema.
- Keep routers modular under `apps/api/app/api/routes/`.
- Backend error messages and docstrings are in Portuguese (pt-BR).
- The frontend should also be Portuguese-first per the PRD's MMXD philosophy.
- Pydantic schemas live in `apps/api/app/schemas/` — one file per domain.
- Frontend uses `clsx` + `tailwind-merge` for conditional class composition (see `src/lib/utils.ts`).
- Environment files: only commit `.env.example` templates, never `.env`.

## Key Documentation

- **PRD (source of truth)**: `docs/main/PRD.md`
- **Screen topology**: `docs/main/screen-structure.md`
- **Handoff / what's built**: `HANDOFF.md`
- **Current status & next steps**: `STATUS.md`
- **Frontend implementation plan**: `docs/planning/implementation-plan.md`
