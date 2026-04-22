---
title: Agent Knowledge Handbook
type: drawer
layer: 0
status: active
last_seen: 2026-04-22
valid_from: 2026-04-22
valid_until: 2026-07-22
backlinks:
  - Verdade_do_Produto
  - Radiografia_do_Produto
  - MemPalace_Migration_Spec
  - Padroes_de_Codigo
  - Backend_API_Audit_v2_5
  - INFRAESTRUTURA_OVERVIEW
  - Repositorio_Organizacao_v2_5
  - Diagnostico_Topologia_Backend
  - Modelo_Core_Routes_Sprints_Tasks
---

# Agent Knowledge Handbook (2026-04-22)

**Purpose**: Single-source onboarding for any LLM or human agent. Read this first, then drill down into linked docs only when needed.

---

## ✅ AUTH FIX — RESOLVED (2026-04-22)

**Root cause**: The `User` ORM model declared `username`, `bio`, `preferences` and other columns that were **never created by Alembic migrations**. Every authenticated endpoint crashed.

**Fix applied** (deployed in PR #40):
- Migration `0026_add_users_username` — adds username column with backfill from email
- Migration `0027_ensure_all_user_columns` — defensively adds ALL missing User columns with `IF NOT EXISTS` guards
- Migration `0028_seed_psychology_questions` — seeds 12 OIOS quiz questions
- `user.py:30` — username now nullable=True
- `auth.py:155-167` — register auto-generates unique username

**Trigger migrations remotely**:
```bash
curl "https://olcan-compass-api.onrender.com/api/migrate-db-render?secret_key=olcan2026omega"
curl "https://olcan-compass-api.onrender.com/api/db-diagnostic?secret_key=olcan2026omega"
```

**Verification**: Test `POST /api/auth/register` with a new email.

---

## 🚨 CRITICAL BUGS — DO NOT IGNORE (2026-04-22)

### 🔴 EXPORT STUB — PDF/DOCX are plain text

**Location**: `app/services/export_service.py:388-413`

The `_generate_pdf_document()` and `_generate_docx_document()` methods return **plain text encoded as bytes**, NOT real PDF/DOCX files. Users download files that can't be opened properly.

**Current workaround**: Use frontend `window.print()` in `PDFExporter.tsx` instead of backend export.

**Planned fix**: Implement proper PDF generation via Playwright + Jinja2 (see `Modelo_Core_Routes_Sprints_Tasks`).

### 🔴 IMPORT CIRCULAR — tasks.py imports from route handler

**Location**: `app/api/routes/tasks.py:185`

```python
# WRONG — imports from a route file, not a service!
from app.api.v1.companions import _calculate_level_from_xp
```

Same anti-pattern in `app/services/quest_service.py:411`.

**Correct import**: Use `from app.services.xp_calculator import XPCalculator`

### ⚠️ BROKEN CELERY IMPORTS

| File | Line | Import |
|------|------|--------|
| `psychology.py` | 398 | `recalculate_temporal_matches_task` (doesn't exist) |
| `marketplace.py` | 601 | `create_escrow_task` (doesn't exist) |

These calls fail silently or cause 500 errors.

---

## 📊 Current Stats (2026-04-21)

| Metric | Value |
|--------|-------|
| Frontend (Next.js) | 169 pages, 26 Zustand stores |
| Backend (FastAPI) | 47 route files, 33 Alembic migrations |
| Alembic head | `0028_seed_psychology_questions` |
| Build status | ✅ Passes (zero errors, ~49 unused-import warnings) |
| Production auth | � Fix deployed (0027+0028) — awaiting migration trigger |
| Production health | ✅ `GET /api/health` returns 200 |

---

## 📁 Codebase Map

```
olcan-compass/                     # Monorepo root (pnpm workspaces)
├── CLAUDE.md                      # ← START HERE (quick reference)
├── apps/
│   ├── app-compass-v2.5/          # Next.js 14 frontend (ACTIVE)
│   │   ├── src/app/(app)/         # Authenticated pages (dashboard, forge, etc.)
│   │   ├── src/app/(auth)/        # Login, register, reset-password
│   │   ├── src/app/(public)/      # Marketing pages (static)
│   │   ├── src/stores/            # 26 Zustand stores
│   │   ├── src/hooks/             # use-hydration, use-document, use-session
│   │   ├── src/lib/               # format.ts, analysis.ts, api-client.ts, api.ts
│   │   └── src/components/        # UI components (PageHeader, ScoreBadge, etc.)
│   ├── api-core-v2.5/             # FastAPI backend (ACTIVE)
│   │   ├── app/api/routes/        # Main route files (auth, health, marketplace, etc.)
│   │   ├── app/api/v1/            # Versioned endpoints (documents, dossiers, users)
│   │   ├── app/db/models/         # SQLAlchemy models
│   │   ├── app/schemas/           # Pydantic schemas
│   │   ├── app/services/          # Business logic
│   │   ├── alembic/versions/      # 31 migration files
│   │   └── scripts/               # Seed scripts
│   ├── site-marketing-v2.5/       # PayloadCMS marketing site (Vercel)
│   ├── app-compass-v2/            # 🔒 FROZEN — v2 production, DO NOT MODIFY
│   └── api-core-v2/               # 🔒 FROZEN — v2 production, DO NOT MODIFY
├── packages/
│   ├── ui-components/             # Liquid Glass design system
│   └── shared-auth/               # Unified auth package
├── wiki/                          # Documentation (MemPalace methodology)
│   ├── 00_SOVEREIGN/              # 🏛️ Source of truth (read first)
│   ├── 02_Arquitetura_Compass/    # Technical architecture
│   ├── 03_Produto_Forge/          # Product specs
│   └── 05_Infraestrutura/         # Deployment runbooks
└── _GRAVEYARD/                    # Dead code archive (8963 items, IGNORE)
```

---

## 🏪 Frontend Stores (26 total)

| Store | File | Purpose | Backend-wired? |
|-------|------|---------|----------------|
| auth | `auth.ts` | Login, register, JWT, user profile | ✅ Yes |
| forge | `forge.ts` | Documents CRUD, versions, analysis | ✅ Yes |
| dossier | `dossier.ts` | Candidature bundles, timeline | ⚠️ Partial |
| applications | `applications.ts` | Opportunities, watchlist | ✅ Yes |
| interviews | `interviews.ts` | Sessions, questions, scores | ⚠️ Partial |
| routes | `routes.ts` | Career routes, milestones | ✅ Yes |
| sprints | `sprints.ts` | Sprint planning | ⚠️ Partial |
| psych | `psych.ts` | OIOS archetype quiz | ✅ Yes |
| profile | `profile.ts` | Extended profile data | ✅ Yes |
| profileIntake | `profileIntake.ts` | Onboarding flow | ❌ No |
| marketplace | `marketplace.ts` | Provider/booking listings | ✅ Yes |
| canonicalMarketplace* | 3 files | Marketplace wrappers | Re-exports |
| community | `community.ts` | Social features | ❌ No |
| admin | `admin.ts` | Admin panel data | ❌ No |
| org | `org.ts` | Organization management | ❌ No |
| taskStore | `taskStore.ts` | Task management | ⚠️ Partial |
| archetypeStore | `archetypeStore.ts` | Archetype data | ✅ Yes |
| auraStore | `auraStore.ts` | Companion system | ✅ Yes |
| economics | `economics.ts` | Economic intelligence | ❌ No |
| nudge | `nudge.ts` | Notification nudges | ❌ No |
| observability | `observability.ts` | Telemetry | ❌ No |
| submission-gate | `submission-gate.ts` | Feature gating | ❌ No |
| routeBuilderStore | `routeBuilderStore.ts` | Route creation wizard | ❌ No |
| eventDrivenGamification | `eventDrivenGamificationStore.ts` | Gamification events | ❌ No |
| canonicalContentStore | `canonicalContentStore.ts` | CMS content | ❌ No |

---

## 🔌 Backend API Route Map

**Base URL**: `https://api.olcan.com.br/api` (Render) or `http://localhost:8000/api` (local)

| Domain | Prefix | Key file | Status |
|--------|--------|----------|--------|
| Health | `/health` | `routes/health.py` | ✅ Working |
| Auth | `/auth/*` | `routes/auth.py` | 🔴 500 in prod |
| Users | `/v1/users/*` | `v1/users.py` | ⚠️ Missing settings |
| Psychology | `/psych/*` | `routes/psychology.py` | ✅ Working |
| Documents | `/v1/documents/*` | `v1/documents.py` | ✅ Working |
| Dossiers | `/v1/dossiers/*` | `v1/dossiers.py` | ⚠️ Missing export |
| Routes | `/routes/*` | `routes/routes.py` | ✅ Working |
| Tasks | `/api/tasks/*` | `routes/tasks.py` | 🔴 Broken import |
| Companions | `/companions/*` | `routes/companion.py` | ✅ Working |
| Marketplace | `/marketplace/*` | `routes/marketplace.py` | ⚠️ Missing Celery |
| Billing | `/billing/*` | `routes/billing.py` | ⚠️ Missing cancel |
| Interviews | `/interviews/*` | `routes/interview.py` | ⚠️ No AI |

**Stealth endpoints** (Render hack for free-tier — no shell access):
- `GET /api/migrate-db-render?secret_key=olcan2026omega` — runs `alembic upgrade head`
- `GET /api/seed-db-render?secret_key=olcan2026omega` — runs seed scripts

---

## 🐛 Known Bugs (2026-04-21)

| Severity | Location | Description |
|----------|----------|-------------|
| 🔴 CRITICAL | `auth.py` | Register/Login 500 in production |
| 🔴 BROKEN | `tasks.py:185-196` | Import from non-existent `app.api.v1.companions` |
| 🔴 MISSING | `psychology.py:396` | Celery task `recalculate_temporal_matches_task` doesn't exist |
| 🔴 MISSING | `marketplace.py:599` | Celery task `create_escrow_task` doesn't exist |
| 🐛 BUG | `auth.py:84` | `profile.momentum` returns hardcoded `last_activity_days: 0` |
| 🐛 BUG | `v1/users.py` | `user.username` may be None, not handled |
| ⚠️ STUB | `tasks.py:279` | Leaderboard returns empty data |
| ⚠️ STUB | `tasks.py:355` | Achievement claim not implemented |
| ⚠️ STUB | `documents.py:300` | Polish creates record but doesn't trigger AI |

---

## 🚫 Rules (MUST FOLLOW)

1. **DO NOT modify** `app-compass-v2` or `api-core-v2` (frozen v2 production)
2. **DO NOT build** gamification, social, or P3 features before core value works
3. **DO NOT create** new stores — consolidate existing ones
4. **DO NOT skip** `npm run type-check` before any commit
5. **DO NOT assume** endpoints work — always test with curl first
6. **DO NOT create** unnecessary documentation files — update existing wiki docs
7. **DO NOT hardcode** API keys — use environment variables
8. **Branding**: Always "Olcan Compass" (not "Compass" or "Olcan" alone)

---

## ✅ Pre-Commit Checklist

```bash
# In apps/app-compass-v2.5/
npm run type-check    # MUST pass
npm run lint          # MUST pass (warnings OK)
npm run build         # MUST succeed
```

---

## 🏗️ Infrastructure Quick Reference

| Component | Platform | URL |
|-----------|----------|-----|
| API | Render (Docker, Free) | `https://olcan-compass-api.onrender.com` |
| App | Vercel | `compass.olcan.com.br` |
| Marketing | Vercel | `olcan.com.br` |
| DB | Render PostgreSQL | `dpg-d7i2qnkvikkc73aj0gm0-a` |
| DNS | Cloudflare | Zone `aa51bdbdc0a503f3121f810e46c16c0e` |
| Email | Resend | `smtp.resend.com:465` |

**Critical gotcha**: `DATABASE_URL` must use `postgresql+asyncpg://` prefix (not `postgresql://`).

---

## 🔄 Common Error Patterns

| Error | Cause | Fix |
|-------|-------|-----|
| `TS2305: Module has no exported member` | Missing UI component | Check `components/ui/index.ts`, create if needed |
| `Cannot find module '@/path'` | Wrong path alias | Check `tsconfig.json` paths |
| `Feature works in frontend but doesn't persist` | Store not wired to API | Create endpoint in `api-core-v2.5/app/api/v1/` |
| `UndefinedColumnError` in Render logs | ORM model has column DB lacks | Create Alembic migration |
| `500 on any authenticated endpoint` | Auth is broken | Fix auth first (see blocker) |
| Hydration mismatch | Zustand persist + SSR | Use `useHydration()` hook from `src/hooks/` |

---

## 📋 Priority Order

1. **P0**: Fix auth 500 blocker (everything depends on this)
2. **P0**: Verify all User model columns exist in production DB
3. **P1**: OIOS quiz end-to-end (needs DB seeding)
4. **P1**: Forge credit paywall (needs Stripe keys in env)
5. **P2**: E2E testing of 7 critical flows
6. **P2**: Staging deployment validation
7. **P3**: Social/community features (AFTER revenue validation)
8. **P3**: Gamification (AFTER core product works)

---

## 🔗 Navigation

| Need | Read |
|------|------|
| Product truth (no inflation) | [[Verdade_do_Produto]] |
| Full product vision | [[Olcan_Master_PRD_v2_5]] |
| Technical architecture | [[Arquitetura_v2_5_Compass]] |
| API endpoint audit | [[Backend_API_Audit_v2_5]] |
| I/O system spec | [[SPEC_IO_System_v2_5]] |
| Deployment runbook | [[DEPLOYMENT_RENDER]] |
| Infrastructure map | [[INFRAESTRUTURA_OVERVIEW]] |
| Code standards | [[Padroes_de_Codigo]] |

---

## 💉 Validade

Este documento é válido até **Julho 2026**.
Após isso, revisar e atualizar `valid_until`.