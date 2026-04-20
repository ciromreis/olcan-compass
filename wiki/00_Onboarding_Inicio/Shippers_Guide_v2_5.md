---
title: Shipper's Guide - Olcan Compass v2.5
type: drawer
layer: 8
status: active
last_seen: 2026-04-20
backlinks:
  - START_HERE
  - INFRAESTRUTURA_OVERVIEW
  - DEPLOYMENT_RENDER
  - Backend_API_Audit_v2_5
  - SPEC_IO_System_v2_5
  - HIDDEN_FOLDERS_AUDIT
---

# 🚢 Shipper's Guide - Olcan Compass v2.5

**Purpose**: Ensure any model or developer can safely ship features without breaking production.
**Status**: Production Deployed
**Last Updated**: 2026-04-20

---

## ⚠️ CRITICAL: Read Before ANY Change

1. **Wiki is Source of Truth** - Always check wiki first
2. **Verify Production Health** - Run health checks before/after deploy
3. **Don't Break Existing Features** - Many are stubs, but working
4. **Test Locally First** - Never push directly to main without local testing

---

## 🏗️ Production State (WHAT'S DEPLOYED)

### Active Services

| Service | Platform | URL | Status |
|---------|----------|-----|--------|
| Frontend | Vercel | `compass.olcan.com.br` | ✅ LIVE |
| Frontend (alt) | Vercel | `app.olcan.com.br` | ✅ LIVE |
| API | Render (Docker) | `olcan-compass-api.onrender.com` | ✅ LIVE |
| Database | Render PostgreSQL | `dpg-d7i2qnkvikkc73aj0gm0-a` | ✅ LIVE |
| DNS | Cloudflare | `olcan.com.br` zone | ✅ LIVE |

### What's Working in Production

| Feature | Status | Notes |
|---------|--------|-------|
| User Registration/Login | ✅ Working | JWT auth |
| OIOS Quiz | ⚠️ Needs seed | Questions must be seeded |
| Document/Forge | ✅ Working | CRUD + versions |
| Routes/Milestones | ✅ Working | Full CRUD |
| Tasks/XP | ✅ Working | Except leaderboard |
| Aura/Companions | ⚠️ Issues | Save fails silently |
| Dossiers | ⚠️ Partial | Missing export |
| Marketplace | ✅ Working | Except escrow tasks |
| Billing | ✅ Working | Stripe integration |

---

## 🚫 DO NOT TOUCH (Unless You Know What You're Doing)

### Production Infrastructure
- DNS records (Cloudflare) - Work fine
- Database migrations - Already at head
- Render service config - Already working
- Vercel project settings - Already configured

### Code That's Stubbed But Working
- Some Celery tasks (not implemented but app works)
- Leaderboard (returns empty but doesn't crash)
- Achievement claim (stub but doesn't break)

---

## 🛠️ HOW TO SAFELY SHIP CHANGES

### 1. Before Making Changes

```bash
# Check production health FIRST
curl -sS https://olcan-compass-api.onrender.com/api/health
curl -sS -o /dev/null -w "%{http_code}" https://compass.olcan.com.br

# Read wiki for the feature area
# Frontend: wiki/02_Arquitetura_Compass/SPEC_IO_System_v2_5.md
# Backend: wiki/02_Arquitetura_Compass/Backend_API_Audit_v2_5.md
```

### 2. Make Your Changes

**Frontend** (`apps/app-compass-v2.5/`):
```bash
cd apps/app-compass-v2.5
pnpm dev  # Test locally
pnpm build  # Must pass
pnpm type-check  # Must pass
```

**Backend** (`apps/api-core-v2.5/`):
```bash
cd apps/api-core-v2.5
docker compose up --build  # Test locally
# Test API endpoints
```

### 3. Before Pushing to Main

```bash
# Verify no breaking changes
curl -sS https://olcan-compass-api.onrender.com/api/health

# Check that critical endpoints still work:
# - /api/auth/login
# - /api/psych/profile
# - /api/documents
# - /api/routes
# - /api/tasks/progress
```

### 4. After Push (Auto-Deploy)

```bash
# Wait ~2-3 minutes for Vercel + Render
# Then verify:

# API health
curl -sS https://olcan-compass-api.onrender.com/api/health

# Frontend
curl -sS -o /dev/null -w "%{http_code}" https://compass.olcan.com.br
```

---

## 🔴 KNOWN ISSUES (DO NOT IGNORE)

### High Priority Bugs to Fix

| Issue | Location | Impact | Fix Required |
|-------|----------|--------|--------------|
| Companion save fails | `aura/discover/page.tsx:198` | Users can't save companion | Add error handling |
| Readiness = 0 | `dossier.ts:633` | Dossier scoring broken | Implement algorithm |
| Leaderboard empty | `tasks.py:279` | Feature returns nothing | Implement or remove |
| Task import error | `tasks.py:185` | Broken import | Fix module path |
| Achievement claim stub | `tasks.py:355` | Feature not working | Implement or document |

### Features Needing Implementation

| Feature | Domain | Priority |
|---------|--------|----------|
| Dossier export (PDF/ZIP) | Dossiers | HIGH |
| User settings endpoints | Users | MEDIUM |
| Admin CMS content | CMS | MEDIUM |
| Billing cancellation | Billing | MEDIUM |

---

## 📋 QUICK REFERENCE

### Development Commands

```bash
# Frontend dev
pnpm dev:v2.5

# Frontend build
pnpm build:v2.5

# Backend local
docker compose up --build

# Health checks
curl https://olcan-compass-api.onrender.com/api/health
curl https://compass.olcan.com.br
```

### Key Files for Reference

| Purpose | File |
|---------|------|
| Frontend stores | `apps/app-compass-v2.5/src/stores/*.ts` |
| API endpoints | `apps/api-core-v2.5/app/api/routes/*.py` |
| Deployment | `wiki/05_Infraestrutura/DEPLOYMENT_RENDER.md` |
| API audit | `wiki/02_Arquitetura_Compass/Backend_API_Audit_v2_5.md` |
| I/O issues | `wiki/02_Arquitetura_Compass/SPEC_IO_System_v2_5.md` |

---

## 🔄 ROLLBACK PROCEDURE (If Something Breaks)

### If Frontend Breaks
1. Vercel auto-deploys from main
2. Go to Vercel dashboard → Deployments
3. Find last working deployment → Click "Promote"

### If API Breaks
1. Render auto-deploys from main
2. Go to Render dashboard → olcan-compass-api
3. Find last working deployment → Click "Redeploy"

### Emergency DB Rollback
```bash
# Check current migration
curl https://olcan-compass-api.onrender.com/api/health | grep migration

# Rollback one migration (if needed)
docker compose run --rm api alembic downgrade -1
```

---

## 📞 Environment Variables (Reference)

### Frontend (.env)
```
NEXT_PUBLIC_API_URL=https://olcan-compass-api.onrender.com
NEXT_PUBLIC_APP_NAME=Olcan Compass
NEXT_PUBLIC_DEMO_MODE=  # NOT SET - production mode
```

### Backend (.env)
```
DATABASE_URL=postgresql+asyncpg://...  # CRITICAL: must have +asyncpg
JWT_SECRET_KEY=...
ENCRYPTION_KEY=...
ENV=production
PYTHONPATH=/app
```

---

## ✅ SHIPPER'S CHECKLIST

Before ANY deploy to main:

- [ ] Read relevant wiki docs
- [ ] Local build passes (`pnpm build:v2.5`)
- [ ] Type check passes (`pnpm type-check:v2.5`)
- [ ] Health check returns 200
- [ ] Tested critical endpoints locally
- [ ] No hardcoded secrets in code
- [ ] Follows existing code patterns

After push to main:

- [ ] Wait 2-3 minutes for deploy
- [ ] Verify health check
- [ ] Test on production (quick smoke test)
- [ ] No error logs in console

---

## 🔗 Links

**Start Here:**
- [[START_HERE]] - Full navigation
- [[wiki/00_SOVEREIGN/Olcan_Master_PRD_v2_5.md|Master PRD]]

**Technical:**
- [[Backend_API_Audit_v2_5]] - Complete API reference
- [[SPEC_IO_System_v2_5]] - Frontend stores + issues

**Production:**
- [[INFRAESTRUTURA_OVERVIEW]] - Production state
- [[DEPLOYMENT_RENDER]] - Deploy procedures
- [[HIDDEN_FOLDERS_AUDIT]] - Hidden folder audit