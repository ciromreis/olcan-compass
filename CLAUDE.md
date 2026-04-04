# Olcan Compass — Critical Context
> Read this before touching any file in this monorepo.

---

## ⛔ PROTECTED — DO NOT MODIFY

These two directories are the stable v2 production baseline. They must not be changed, refactored, or used as a testing ground:

- `apps/app-compass-v2/` — stable v2 frontend (Next.js). Has its own CLAUDE.md.
- `apps/api-core-v2/` — stable v2 backend (FastAPI). Has its own CLAUDE.md.

If you need to understand what v2 does, read it. Do not write to it.

---

## Active Work Areas

### 1. The Website — `apps/site-marketing-v2.5/`
This is the **public-facing Olcan website**. It is an independent product, not a marketing add-on. It has its own CLAUDE.md.

- **Status:** 100% functional, 13 routes, build passes — ready to deploy
- **Identity:** Has its own domain, brand, and content strategy
- **Connection to v2.5 app:** Shares design tokens; hosts public store pages (no login required)
- **Blog:** Will integrate content from `olcan-blog-adk`

### 2. The App — `apps/app-compass-v2.5/`
The main authenticated app (career companions, forge, marketplace).

- **Status:** ~20–30% feature-complete. Build is blocked by `@olcan/ui-components`
- **Code exists:** ~5,400 lines, 13 Forge components, 3 pages, backend services — but does not compile
- **Blocker:** `packages/ui-components/` has 16 TypeScript errors, dist/ contains uncompiled .ts files
- **Recommended fix:** Option B — replace `@olcan/ui-components` imports with `@/components/ui` across ~30 files (~2h estimated)
- **DO NOT** attempt to fix ui-components directly (high risk, dist structure is broken)

### 3. The Backend — `apps/api-core-v2.5/`
FastAPI backend for v2.5.

- **Status:** Functional, routes registered, DB ready — ready to deploy
- **Run:** `cd apps/api-core-v2.5 && python -m uvicorn app.main:app --reload --port 8001`

### 4. Legacy — `apps/app-mvp-v1/`
Original MVP. Keep for reference only. Do not develop.

---

## The ui-components Problem (Read Before Touching Packages)

`packages/ui-components/` is broken. It has:
- 16 TypeScript compilation errors
- `dist/` folder with uncompiled `.ts` source files (not a valid build output)
- All apps that import `@olcan/ui-components` will fail to build

**Options:**
- **Option A** (zero work): Deploy only website + backend v2.5 — both work now
- **Option B** (recommended for app): Replace all `@olcan/ui-components` imports with `@/components/ui` in app-compass-v2.5 (~30 files, ~2h)
- **Option C** (risky): Fix the ui-components TypeScript errors and rebuild the package

See `README_ESTADO_REAL.md` and `_REPORTS/OPCAO_B_STATUS.md` for detailed instructions.

---

## Monorepo Structure

```
pnpm-workspace.yaml  →  apps/* and packages/*

apps/
  site-marketing-v2.5/  ← THE WEBSITE (independent, functional)
  app-compass-v2.5/     ← THE APP (in development, blocked)
  api-core-v2.5/        ← THE BACKEND (functional, deploy-ready)
  app-compass-v2/       ← ⛔ STABLE v2 frontend (do not touch)
  api-core-v2/          ← ⛔ STABLE v2 backend (do not touch)
  app-mvp-v1/           ← legacy reference only

packages/
  ui-components/        ← BROKEN — do not use as dependency until fixed
  ui/                   ← base UI library
  types/                ← shared TypeScript types
  design-tokens/        ← shared design system tokens
```

---

## Key Documents (Read in This Order)

1. `_CONTEXT/ARCHITECTURE.md` — how the website, app, and backend connect
2. `_CONTEXT/PRODUCT_TRUTH.md` — honest current feature state, what is and isn't built
3. `_CONTEXT/WEBSITE_V25_BRIDGE.md` — website/app shared layer and public store pages
4. `README_ESTADO_REAL.md` — latest technical status (ui-components blocker, deploy options)
5. `00_MISSION_CONTROL/STORE_ARCHITECTURE_GUIDE.md` — ecommerce/store architecture
6. `00_MISSION_CONTROL/MARKETPLACE_ECOMMERCE_GUIDE.md` — marketplace architecture

## For Deep Assessment or Planning Work

Read these in `_CONTEXT/product-design/` — they are the canonical product and architecture docs, pulled from across all app versions:

- `PRODUCT_ARCHITECTURE_V2_5.md` — the product vision (career mobility OS + companion shell)
- `IMPLEMENTATION_ROADMAP_V2_5.md` — the intended build sequence
- `SHARED_SYSTEMS_APP_MARKETING.md` — what the app and website share (archetypes, trust layer)
- `CANONICAL_STORES_V2_5.md` — state management architecture (Zustand store design)
- `BACKEND_ARCHITECTURE_SCALE.md` — FastAPI async patterns and event-driven design
- `VISUAL_DESIGN_GUIDE.md` — liquid-glass design system implementation
- `_CONTEXT/product-design/ASSESSMENT_GUIDE.md` — how to run a plan-vs-reality audit

Session-level reports (what was claimed done per session) are in `_REPORTS/session-features/`.
Build/audit reports are in `_REPORTS/`.

---

## What the Product Is

Olcan Compass is a career support platform for immigrants and professionals navigating new markets. It has:

- A **public website** with content, waitlist, and public store pages
- An **authenticated app** with career companions (RPG gamification), a document forge, interview simulator, and marketplace
- A **marketplace** connecting users with mentors, lawyers, and translators
- A **companion system** — 12 archetypes, evolution stages, gamification

The companion system and most app features are scaffolded but incomplete (~20-30%). Authentication and basic companion CRUD work. No revenue features are implemented yet.

---

## What NOT to Do

- Do not claim any feature is "100% complete" or "ready" unless you have verified it builds and runs
- Do not add fake data, placeholder providers, or invented statistics
- Do not modify the stable v2 apps under any circumstances
- Do not run `npm install` or `pnpm install` inside individual apps without checking workspace config first
