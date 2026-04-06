# Olcan Compass — Architecture Overview

This document explains how the parts of the monorepo fit together and which are active.

---

## The Two Deployments

Olcan Compass produces **two separate deployments**:

```
┌─────────────────────────────┐     ┌──────────────────────────────┐
│     OLCAN WEBSITE           │     │      OLCAN APP               │
│  site-marketing-v2.5        │     │  app-compass-v2.5            │
│                             │     │                              │
│  Public. No login.          │     │  Authenticated.              │
│  Content + discovery        │     │  Companions, forge,          │
│  Blog + store previews      │     │  marketplace, profile        │
│  Waitlist / sign-up         │     │                              │
│  Deploy: Vercel (port 3001) │     │  Deploy: Vercel (port 3000)  │
└──────────┬──────────────────┘     └──────────────┬───────────────┘
           │                                        │
           └──── shared: design-tokens, types ──────┘
                           │
           ┌───────────────▼───────────────┐
           │         BACKEND               │
           │      api-core-v2.5            │
           │                               │
           │  FastAPI, SQLAlchemy          │
           │  Auth, companions, store APIs │
           │  Deploy: Render / Railway     │
           │  Port: 8001                   │
           └───────────────────────────────┘
```

---

## Shared Packages

All packages live in `packages/` and are part of the pnpm workspace.

| Package | Purpose | Status |
|---------|---------|--------|
| `design-tokens/` | Color palette, typography, spacing | ✅ Usable |
| `types/` | Shared TypeScript interfaces | ✅ Usable |
| `ui/` | Base UI library | ✅ Usable |
| `ui-components/` | Advanced components (glass, gamification) | ❌ BROKEN |

**The `ui-components` blocker:** The package has 16 TypeScript errors and an invalid dist/ folder. Both `app-compass-v2` and `app-compass-v2.5` import from it and therefore fail to build. The website does NOT import it and builds fine.

---

## Version History

| Version | Frontend | Backend | Status |
|---------|----------|---------|--------|
| MVP v1 | `app-mvp-v1/` | — | Legacy reference |
| v2 | `app-compass-v2/` | `api-core-v2/` | ⛔ Stable, do not touch |
| v2.5 | `app-compass-v2.5/` | `api-core-v2.5/` | Active development |
| Website | `site-marketing-v2.5/` | (uses api-core-v2.5) | ✅ Deploy-ready |

---

## Blog Integration (Planned)

`olcan-blog-adk` (at `../../../olcan-blog-adk/` relative to this monorepo) contains a Python-based content automation system. The plan:

1. Blog posts authored/generated via olcan-blog-adk
2. Content published as MDX or via a headless CMS
3. Consumed by `site-marketing-v2.5` blog routes
4. Integration not yet implemented — routes exist as stubs

---

## Feature Implementation State (April 2026)

| Feature | Backend | Frontend | Ready |
|---------|---------|----------|-------|
| Auth (login/register) | ✅ | ✅ | ✅ |
| Basic companion CRUD | ✅ | ✅ | ✅ |
| Companion evolution | ⚠️ partial | ⚠️ partial | ❌ |
| Gamification (quests, achievements) | ❌ | ❌ | ❌ |
| Narrative Forge | ❌ | scaffolded | ❌ |
| Interview Simulator | ❌ | ❌ | ❌ |
| Marketplace (booking, payments) | ❌ | ❌ | ❌ |
| Online store (subscription) | ❌ | ❌ | ❌ |
| Social (guilds, battles) | ❌ | ❌ | ❌ |
| OIOS Archetype quiz | data model only | ❌ | ❌ |
| Public website | — | ✅ | ✅ |
| Public store pages | ❌ (API not built) | stub | ❌ |

---

## Start Commands

```bash
# Website (works now)
cd apps/site-marketing-v2.5 && npm run dev    # http://localhost:3001

# Backend v2.5 (works now)
cd apps/api-core-v2.5 && python -m uvicorn app.main:app --reload --port 8001

# App v2.5 (blocked — fix ui-components first)
cd apps/app-compass-v2.5 && npm run dev       # will fail until ui-components is fixed
```
