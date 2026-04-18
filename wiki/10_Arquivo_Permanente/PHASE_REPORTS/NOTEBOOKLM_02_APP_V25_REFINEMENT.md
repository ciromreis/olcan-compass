# Olcan Compass — App v2.5 Refinement & Blocker Map
> Google NotebookLM Source · Part 2 of 4
> Last updated: April 8, 2026

---

## What This Document Covers

This document is about the **authenticated app only**: `apps/app-compass-v2.5/`. It covers what's been built, what's blocked, why it won't compile, and what refinements are needed before the app can ship.

---

## What the App Is

The app is the authenticated product of Olcan Compass — a career support platform for immigrants and professionals navigating new markets. Its full intended feature set:

- **Career companions** — RPG-style virtual companions tied to 12 OIOS archetypes, with evolution stages, quests, and gamification
- **Narrative Forge** — AI-powered document polishing (CVs, personal statements, essays)
- **Interview Simulator** — Voice-based AI interview practice
- **Marketplace** — Connects users with verified mentors, immigration lawyers, and translators
- **Online store** — Subscription tiers (freemium + premium) and pay-per-use features

**Deployment target:** `app.olcan.com` · Vercel · Port 3000

---

## Current State (April 2026): What's Actually Built

### ✅ Fully Working (If the Build Were Fixed)
- User authentication (registration, login, JWT) — both frontend and backend
- Basic companion CRUD (create, view, feed/train/play/rest activities)
- ~5,400 lines of code written across components, pages, and services

### ⚠️ Scaffolded (Code Exists, Not Functional)
- Companion evolution logic — backend partial, frontend has basic UI only
- Design system — Tailwind config, some glass components present but incomplete
- OIOS archetype data model — enum defined, no quiz or logic built
- Forge components — 13 UI components built (CV Builder, ATS, etc.) but app won't compile

### ❌ Not Built Yet
- Gamification: quests, achievements, leaderboards, battles, guilds
- Narrative Forge backend: no AI endpoints, no integration
- Interview Simulator: no audio processing, no AI, no endpoints
- Marketplace: no provider profiles, no booking, no Stripe Connect
- Online store / subscriptions: no payment processing, no usage tiers
- Social features: no guilds, messaging, friend system
- OIOS archetype quiz: data model only, no quiz flow
- Public store pages: stubs exist, no actual routes built

### Revenue Status
**Zero revenue-generating features are implemented.** Path to first revenue requires at minimum one of: subscription paywall, marketplace booking + Stripe Connect, or a single pay-per-use AI feature with billing.

---

## The Compile Blocker

### What's Broken
The app (`app-compass-v2.5`) **cannot build** because it depends on `packages/ui-components/`, which has:
- 16 TypeScript compilation errors
- A `dist/` folder containing uncompiled `.ts` source files (invalid build output)
- All apps importing `@olcan/ui-components` will fail to build

### Which Apps Are Affected
- `apps/app-compass-v2.5/` — ❌ blocked (active development)
- `apps/app-compass-v2/` — ❌ blocked (stable, do not fix here)

### Which Apps Are NOT Affected
- `apps/site-marketing-v2.5/` — ✅ does not import `@olcan/ui-components`, builds fine

### How to Fix the Blocker: Option B (Recommended)

Replace all `@olcan/ui-components` imports with `@/components/ui` across ~30 files in `app-compass-v2.5/`.

**Estimated time:** ~2 hours  
**Risk:** Medium (many files, but mechanical change)  
**Instructions:** See `1_Pillars/Architecture/README_ESTADO_REAL.md` for the full list of files

The approach:
1. Search for all `from '@olcan/ui-components'` imports in `apps/app-compass-v2.5/src/`
2. Replace with `from '@/components/ui'`
3. Verify component names match what exists in `packages/ui/` (base UI library, which works)
4. Run `npm run build` to confirm

**Do NOT fix ui-components directly (Option C)** — the package's dist/ structure is broken and fixing it would take many hours with high risk of cascade failures.

---

## App Directory Structure

```
apps/app-compass-v2.5/
├── src/
│   ├── app/
│   │   ├── (app)/              ← Authenticated routes
│   │   │   ├── forge/          ← Narrative Forge (3 pages built)
│   │   │   ├── guilds/         ← Scaffold only
│   │   │   ├── marketplace/    ← Scaffold only
│   │   │   └── onboarding/     ← Scaffold only
│   │   ├── (auth)/             ← Login, register
│   │   ├── (mentor)/           ← Mentor-specific routes
│   │   ├── (public)/           ← Public store routes (stubs)
│   │   ├── analytics/
│   │   ├── export/
│   │   ├── youtube/
│   │   └── page.tsx            ← Landing/entry
│   ├── components/
│   │   └── forge/              ← 13 Forge UI components
│   └── lib/                    ← 2 utility libraries
```

---

## Backend: api-core-v2.5 (Ready to Deploy)

The FastAPI backend is **separate from the app and is not blocked**.

```
apps/api-core-v2.5/
├── app/
│   ├── main.py                 ← FastAPI entry point
│   ├── api/routes/             ← All routes registered
│   ├── services/               ← 3 backend services
│   └── models/                 ← SQLAlchemy models
```

**Status:** ✅ Functional, all API routes registered  
**Run:** `cd apps/api-core-v2.5 && python -m uvicorn app.main:app --reload --port 8001`  
**Database:** SQLite (dev), PostgreSQL config available for production  
**Deploy to:** Render or Railway

### What the Backend Has
- User auth endpoints (register, login, JWT)
- Companion CRUD endpoints
- Evolution logic (partial)
- All routes registered and responding

### What the Backend Lacks
- Narrative Forge AI endpoints (not built)
- Interview Simulator endpoints (not built)
- Marketplace / booking endpoints (not built)
- Stripe or payment endpoints (not built)
- Public store endpoints (not built)

---

## Feature Completion Matrix

| Feature | Backend | Frontend | Overall | Notes |
|---------|---------|----------|---------|-------|
| Auth (login/register) | ✅ | ✅ | ✅ | Works — only full feature |
| Basic companion CRUD | ✅ | ✅ | ✅ | Works |
| Companion evolution | ⚠️ partial | ⚠️ partial | ❌ | Needs work both sides |
| Gamification | ❌ | ❌ | ❌ | Not started |
| Narrative Forge | ❌ | scaffolded | ❌ | 13 UI components exist, no backend |
| Interview Simulator | ❌ | ❌ | ❌ | Not started |
| Marketplace | ❌ | ❌ | ❌ | Not started |
| Online store / subscriptions | ❌ | ❌ | ❌ | Not started |
| Social (guilds, battles) | ❌ | ❌ | ❌ | Not started |
| OIOS Archetype quiz | data model | ❌ | ❌ | Enum exists, no quiz |
| Public store pages | ❌ | stubs | ❌ | Routes exist, no content |

---

## Design System — App-Specific Context

The app and the website share a design language but the app has more advanced components:

### Working Packages
- `packages/design-tokens/` — Color palette, typography, spacing ✅
- `packages/types/` — Shared TypeScript interfaces ✅
- `packages/ui/` — Base UI library (buttons, inputs, etc.) ✅

### Broken Package (Root of the Build Blocker)
- `packages/ui-components/` — Advanced components (glass, gamification) ❌

### Visual Style (Per Design Spec)
- Liquid-glass aesthetic: `backdrop-filter: blur()`, translucent surfaces
- Olcan Navy Blue palette (`#0A1628`)
- Typography: DM Serif Display (headings) + DM Sans (body)
- Framer Motion animations
- Glassmorphism: `bg-white/10 backdrop-blur border border-white/20`

---

## Companion System — Detailed State

The companion system is the core differentiator of the app. Here's what's actually built:

### OIOS Archetypes
- 12 archetypes defined as enums in the data model
- No quiz flow to assign an archetype to a user
- No archetype-specific content, visuals, or behavior

### Companion
- Users can create a companion (name, archetype selection)
- Basic activities: feed, train, play, rest
- No evolution stages implemented visually or functionally
- No companion illustrations linked to archetype+stage

### Gamification (Not Started)
- No quests system
- No achievement tracking
- No XP or leveling
- No guild formation
- No battles or competitive elements

---

## Realistic Refinement Timeline

| Work Item | Estimated Time | Dependency |
|-----------|---------------|-----------|
| Fix compile blocker (Option B) | ~2 hours | None — do this first |
| Deploy app + backend after fix | ~1 hour | Fix blocker first |
| Build OIOS archetype quiz flow | 1–2 weeks | Blocker fixed |
| Complete companion evolution (visual + logic) | 2–3 weeks | Blocker fixed |
| First revenue feature (Forge + paywall) | 2–3 weeks | Blocker fixed |
| Basic gamification (quests, XP) | 3–4 weeks | Blocker fixed |
| Marketplace (booking, Stripe) | 4–6 weeks | Blocker fixed |
| Interview Simulator (audio, AI) | 4–6 weeks | Blocker fixed |
| Full v2.5 vision | 4–6 months | All above |

---

## Priority Refinements for App (Post-Blocker Fix)

### Immediate (After Blocker is Fixed)
1. Verify all 13 Forge UI components render correctly with `@/components/ui` imports
2. Test auth flow end-to-end
3. Test companion creation and basic activities
4. Deploy backend to Render/Railway
5. Deploy app to Vercel with correct environment variables

### Short-term (First Month)
1. Build OIOS archetype quiz (needed for user onboarding)
2. Connect companion evolution UI to backend partial logic
3. Add companion illustrations per archetype
4. Set up subscription paywall (first revenue path)

### Medium-term (1–3 Months)
1. Complete Narrative Forge backend with AI integration
2. Build public store routes (`/store/*`) — needed for website integration
3. Add basic gamification (quests, XP, achievements)
4. Launch marketplace with manual booking flow

---

## What NOT to Do with the App

- Do not attempt to fix `packages/ui-components/` directly (high risk, broken dist structure)
- Do not add placeholder providers, fake testimonials, or invented metrics
- Do not claim features as "complete" without verifying the build runs
- Do not conflate website code with app code — they are separate deployments
- Do not modify `apps/app-compass-v2/` (stable v2, protected)

---

## Key Files for App Development

```
apps/app-compass-v2.5/
├── (no CLAUDE.md — see root CLAUDE.md for rules)
├── package.json                 ← Check workspace config before npm install
├── tsconfig.json
└── src/
    └── components/forge/       ← 13 Forge UI components (blocked but built)

apps/api-core-v2.5/
├── README.md                   ← Backend setup and run instructions
├── CELERY_SETUP.md             ← Async task setup
└── app/
    ├── main.py                 ← Entry point
    └── api/routes/             ← All API routes

packages/ui-components/         ← BROKEN — do not use as dependency
packages/ui/                    ← Working base UI library
packages/design-tokens/         ← Working design tokens
packages/types/                 ← Working shared types
```

---

## Questions for NotebookLM to Help Answer

When using this document in NotebookLM, useful questions to ask:

- "What is the fastest path to get app-compass-v2.5 building again?"
- "Which features are closest to completion and could ship first?"
- "What is the minimum viable set of features to launch the authenticated app?"
- "How long would it realistically take to build the first revenue feature?"
- "What are the dependencies between the website and the app that need to be resolved?"
- "What does the OIOS archetype system need to be functional end-to-end?"
