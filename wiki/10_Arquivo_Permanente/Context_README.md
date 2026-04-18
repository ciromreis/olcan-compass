# _CONTEXT — Project Intelligence Directory

This directory is the single place to orient any new session working on Olcan Compass. Read here first, then go write code.

It contains docs extracted and consolidated from across all app versions (mvp-v1, v2, v2.5) — no source code lives here.

---

## Top-Level Files

| File | Purpose |
|------|---------|
| `ARCHITECTURE.md` | How the three deployments (website, app, backend) connect; start/run commands; feature status table |
| `PRODUCT_TRUTH.md` | Honest current state — what works, what's scaffolded, what doesn't exist yet |
| `WEBSITE_V25_BRIDGE.md` | The contract between the public website and the authenticated app: shared design, public store pages, blog integration |

---

## product-design/ — The Vision Layer

Planning, architecture, and design docs extracted from app versions. These are the canonical single copies — duplicates that existed across v2 and v2.5 have been consolidated here.

| File | What it covers | Originally in |
|------|---------------|---------------|
| `PRODUCT_ARCHITECTURE_V2_5.md` | Product philosophy: career mobility OS, companion as retention shell, microSaaS core | app-compass-v2/docs + v2.5/docs |
| `IMPLEMENTATION_ROADMAP_V2_5.md` | Intended build sequence; canonical module map, event taxonomy, domain contracts | app-compass-v2/docs + v2.5/docs |
| `SHARED_SYSTEMS_APP_MARKETING.md` | What app and website must share: archetypes, companion states, trust language | app-compass-v2/docs + v2.5/docs |
| `CANONICAL_STORES_V2_5.md` | Intended Zustand store architecture: four canonical entrypoints | app-compass-v2/docs + v2.5/docs |
| `BACKEND_ARCHITECTURE_SCALE.md` | FastAPI async patterns, event-driven state, feature flags | api-core-v2/docs + v2.5/docs |
| `VISUAL_DESIGN_GUIDE.md` | Liquid-glass design system, SVG illustrations, animation components | app-compass-v2.5/ root |
| `MMXD_UI_COMPONENT_LIBRARY_MVP.md` | Original Metamodern Design System from MVP v1 (design history reference) | app-mvp-v1/src/components/ui/ |
| `ASSESSMENT_GUIDE.md` | **How to audit the project** — maps vision → claimed work → reality; use for plan-vs-reality analysis | Created here |

---

## How to Use This for a Deep Assessment

Ask Claude Code to:

> "Read `_CONTEXT/product-design/ASSESSMENT_GUIDE.md` and then do a plan-vs-reality audit of [feature]."

The assessment guide tells Claude Code exactly which docs to read, in what order, and what code to cross-reference.

---

## What's NOT Here (and Where It Is)

| Type | Location |
|------|---------|
| Session/build reports | `_REPORTS/` |
| Feature implementation session summaries | `_REPORTS/session-features/` |
| v2 app source code | `apps/app-compass-v2/` (⛔ read only) |
| v2.5 active development | `apps/app-compass-v2.5/` |
| Website source | `apps/site-marketing-v2.5/` |
| Backend source | `apps/api-core-v2.5/` |
| Operational API docs (migrations, scripts) | Inside their respective app directories |
