# Olcan Compass — Architecture & Project Truth
> Google NotebookLM Source · Part 3 of 4
> Last updated: April 8, 2026

---

## What This Document Covers

This document describes the full architecture of Olcan Compass — how the parts fit together, what's actually built vs. what's planned, and the honest state of the product as of April 2026. It is the reference document for strategic decisions about what to build next.

---

## The Product in One Paragraph

Olcan Compass is a career support platform for immigrants and professionals navigating new markets. It has a public website for discovery and waitlist capture, and an authenticated app offering career companions (RPG-style, tied to 12 OIOS archetypes), a document forge, interview simulator, and a marketplace of verified mentors and lawyers. As of April 2026, the website is functional and ready to deploy. The app has authentication and basic companion CRUD working, but most features are scaffolded or not started. Zero revenue-generating features are implemented.

---

## The Three Deployments

```
┌─────────────────────────────┐     ┌──────────────────────────────┐
│     OLCAN WEBSITE           │     │      OLCAN APP               │
│  site-marketing-v2.5        │     │  app-compass-v2.5            │
│                             │     │                              │
│  Public. No login.          │     │  Authenticated.              │
│  Discovery + content        │     │  Companions, forge,          │
│  Blog + store previews      │     │  marketplace, profile        │
│  Waitlist / sign-up         │     │                              │
│  Domain: www.olcan.com.br   │     │  Domain: app.olcan.com.br    │
│  Deploy: Vercel             │     │  Deploy: Vercel (blocked)    │
│  Build: ✅ Works            │     │  Build: ❌ Blocked           │
└──────────┬──────────────────┘     └──────────────┬───────────────┘
           │                                        │
           └──── shared: design-tokens, types ──────┘
                           │
           ┌───────────────▼───────────────┐
           │         BACKEND               │
           │      api-core-v2.5            │
           │                               │
           │  FastAPI, SQLAlchemy          │
           │  Auth, companions, APIs       │
           │  Deploy: Render / Railway     │
           │  Build: ✅ Works              │
           └───────────────────────────────┘
```

---

## Version History & Protection Rules

| Version | Frontend App | Backend | Status |
|---------|-------------|---------|--------|
| MVP v1 | `apps/app-mvp-v1/` | — | Legacy reference, do not develop |
| **v2** | `apps/app-compass-v2/` | `apps/api-core-v2/` | ⛔ **PROTECTED — do not modify** |
| **v2.5** | `apps/app-compass-v2.5/` | `apps/api-core-v2.5/` | Active development |
| **Website** | `apps/site-marketing-v2.5/` | (uses api-core-v2.5) | Ready to deploy |

**Protection rule:** `apps/app-compass-v2/` and `apps/api-core-v2/` are the stable production baseline. They must not be changed, refactored, or used as a testing ground. If you need to understand what v2 does, read it. Do not write to it.

---

## Shared Package Layer

All packages live in `packages/` and are part of the pnpm monorepo workspace.

| Package | Purpose | Status | Who Uses It |
|---------|---------|--------|-------------|
| `design-tokens/` | Colors, typography, spacing | ✅ Working | Website + App |
| `types/` | Shared TypeScript interfaces | ✅ Working | Website + App |
| `ui/` | Base UI library (buttons, inputs) | ✅ Working | App |
| `ui-components/` | Advanced components (glass, gamification) | ❌ **BROKEN** | App (causes build failure) |
| `shared-auth/` | Auth utilities | ✅ Working | App |

**The critical blocker:** `ui-components` has 16 TypeScript errors and an invalid `dist/` folder containing uncompiled `.ts` files. Any app that imports `@olcan/ui-components` will fail to build. The website does NOT import it and works fine.

---

## Monorepo Structure (Full)

```
olcan-compass/
├── apps/
│   ├── site-marketing-v2.5/    ← THE WEBSITE (✅ deploy-ready)
│   ├── app-compass-v2.5/       ← THE APP (❌ blocked by ui-components)
│   ├── api-core-v2.5/          ← THE BACKEND (✅ deploy-ready)
│   ├── app-compass-v2/         ← ⛔ PROTECTED v2 frontend
│   ├── api-core-v2/            ← ⛔ PROTECTED v2 backend
│   └── app-mvp-v1/             ← Legacy reference
├── packages/
│   ├── design-tokens/          ← ✅ Working
│   ├── types/                  ← ✅ Working
│   ├── ui/                     ← ✅ Working
│   ├── ui-components/          ← ❌ BROKEN
│   └── shared-auth/            ← ✅ Working
├── 1_Pillars/                  ← Strategic documentation
│   ├── Context/                ← Architecture, product truth, bridge docs
│   ├── Architecture/           ← Technical state, API reference, roadmaps
│   ├── Business_Strategy/      ← Marketing, marketplace, copywriting
│   └── Docs/                   ← Unified auth, integration docs
├── 3_Vaults/                   ← Historical records
│   ├── Session_Logs/           ← Per-session handoff reports
│   └── Historical_Audits/      ← Audit reports, gap analyses
├── docs/                       ← Deployment guides, phase reports
├── mercur/                     ← MedusaJS marketplace (separate monorepo)
├── olcan-marketplace/          ← Marketplace integration docs
├── antigravity/                ← Product requirements
├── notebooklm/                 ← THIS FOLDER (NotebookLM source docs)
├── pnpm-workspace.yaml
└── CLAUDE.md                   ← Root context (READ FIRST in any session)
```

---

## Feature Implementation Truth (April 2026)

This is the definitive, no-inflation state of the product.

### ✅ Fully Working
- User authentication (register, login, JWT) — frontend + backend
- Basic companion CRUD (create, view, activities: feed/train/play/rest)
- Public website (18 pages, build passes, no fake data)
- Backend API (routes registered, functional)

### ⚠️ Partially Built (Code Exists, Not Functional)
- Companion evolution logic — backend has partial implementation, frontend has basic UI only
- Design system — Tailwind config, some glass components, not complete
- OIOS archetype data model — enum defined, no quiz flow or logic
- 13 Forge UI components — built but app won't compile due to ui-components blocker

### ❌ Not Built (Zero Implementation)
- Gamification: quests, achievements, leaderboards, battles, guilds
- Narrative Forge AI: no backend endpoints, no AI integration
- Interview Simulator: no audio, no AI, no endpoints
- Marketplace: no provider profiles, no booking, no Stripe
- Online store / subscriptions: no payment processing, no tiers
- Social features: no guilds, messaging, friend system
- OIOS archetype quiz: data model only
- Public store pages on app: stubs, no real routes

---

## The Website ↔ App Integration Contract

The website and app are separate deployments but must connect in specific ways.

### Currently Connected (Works Now)
- Shared design language (`packages/design-tokens/`)
- Waitlist form → `POST /waitlist` on backend

### Planned (Not Yet Built)
```
Website URL                  →  App URL (when built)
olcan.com/marketplace        →  app.olcan.com/store (public, no auth)
olcan.com/mentors            →  app.olcan.com/store/providers/[id] (public)
```

### Authentication Boundary
```
olcan.com (website, no auth)
  → app.olcan.com/store (public routes, no auth) ← NOT YET BUILT
    → app.olcan.com/dashboard (requires login)
```

For this to work, the app needs to implement two route zones:
- **Public zone:** `/store/*`, `/pricing`, `/providers/*` — no auth required
- **Authenticated zone:** `/dashboard/*`, `/forge/*`, `/companion/*` — JWT required

### Blog Integration (Planned)
1. Blog content authored in `olcan-blog-adk` (Python automation, separate repo)
2. Published to headless CMS or as MDX files
3. Consumed by website at `/blog/[slug]`
4. Website blog routes are stubs — integration not implemented

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14–15, React 18, TypeScript
- **Styling:** TailwindCSS, Framer Motion
- **State:** Zustand (app), React Query
- **Package manager:** pnpm (monorepo)

### Backend
- **Framework:** FastAPI (Python)
- **ORM:** SQLAlchemy
- **Migrations:** Alembic
- **Auth:** JWT
- **Database:** SQLite (dev) / PostgreSQL (production)

### Design System
- Liquid-glass aesthetic
- Olcan Navy Blue (`#0A1628`)
- DM Serif Display (headings) + DM Sans (body)
- Glassmorphism: `bg-white/10 backdrop-blur border border-white/20`

### Marketplace
- MedusaJS-based (in `mercur/` subdirectory)
- Configured with API key
- Currently showing as "coming soon" on website

### CMS
- Payload CMS 3.x — integrated into website for admin panel at `/admin`
- Collections: Archetypes, Chronicles, Pages, Users

---

## Start Commands

```bash
# Website (works now — deploy-ready)
cd apps/site-marketing-v2.5
npm run dev       # http://localhost:3001
npm run build     # Verify before deploying

# Backend v2.5 (works now — deploy-ready)
cd apps/api-core-v2.5
python -m uvicorn app.main:app --reload --port 8001

# App v2.5 (BLOCKED — fix ui-components first)
cd apps/app-compass-v2.5
npm run dev       # Will fail until Option B is executed
```

---

## Recommended Development Sequence

The architecture supports incremental delivery. The sequence with the highest impact-to-risk ratio:

### Phase 1 — Ship What Works (Now)
1. Deploy website to Vercel (fix build config in dashboard)
2. Deploy backend to Render/Railway
3. Set up production database for Payload CMS

### Phase 2 — Unblock the App (~2 hours)
1. Execute Option B: Replace `@olcan/ui-components` with `@/components/ui` in ~30 files
2. Verify app builds
3. Deploy app to Vercel

### Phase 3 — First Revenue Feature (2–3 weeks after Phase 2)
Choose one path:
- **Option A:** Narrative Forge + simple credit paywall (Stripe)
- **Option B:** Subscription tier (freemium/premium) with feature gating

### Phase 4 — Complete Core Experience (1–3 months)
1. OIOS archetype quiz (user onboarding)
2. Companion evolution visual + logic
3. Public store routes (website ↔ app bridge)
4. Basic gamification (quests, XP)

### Phase 5 — Full Marketplace (3–6 months)
1. Provider profiles and booking
2. Stripe Connect for provider payouts
3. Interview Simulator (audio + AI)
4. Social features (guilds)

---

## Key Documentation Files in the Project

### Always Read First
- `CLAUDE.md` (root) — protection rules, active areas, blocker explanation
- `1_Pillars/Context/PRODUCT_TRUTH.md` — honest feature state
- `1_Pillars/Context/ARCHITECTURE.md` — system architecture diagram

### For Development
- `1_Pillars/Architecture/README_ESTADO_REAL.md` — current technical state
- `1_Pillars/Architecture/API_REFERENCE.md` — API endpoints
- `apps/site-marketing-v2.5/CLAUDE.md` — website development rules

### For Strategy
- `1_Pillars/Context/WEBSITE_V25_BRIDGE.md` — website/app integration contract
- `1_Pillars/Context/product-design/PRODUCT_ARCHITECTURE_V2_5.md` — product vision
- `1_Pillars/Context/product-design/IMPLEMENTATION_ROADMAP_V2_5.md` — build sequence

### For History & Audits
- `3_Vaults/Session_Logs/SESSION_HANDOFF_APR_4_2026.md` — latest handoff
- `3_Vaults/Historical_Audits/ULTIMATE_TRUTH_V2.5.md` — master truth document
- `docs/CONSOLIDATION_AUDIT_FINAL.md` — consolidation status

---

## Critical Rules (Non-Negotiable)

1. `apps/app-compass-v2/` and `apps/api-core-v2/` are PROTECTED. Never modify them.
2. Never claim a feature is "complete" without verifying it builds and runs.
3. Never add fake data, placeholder providers, or invented statistics.
4. Never run `npm install` inside individual apps without checking workspace config.
5. Never attempt to fix `packages/ui-components/` directly (Option C) without a clear plan.
6. Never conflate website and app code — they are separate deployments.
