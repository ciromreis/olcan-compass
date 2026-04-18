# Olcan Compass — v2 Stable Reference (Protected)
> Google NotebookLM Source · Part 4 of 4
> Last updated: April 8, 2026

---

## What This Document Covers

This document describes the **v2 stable baseline** — the production-locked versions of the app and backend that must not be modified. It exists so you understand what v2 contains and how it differs from v2.5, without ever needing to touch it.

---

## ⛔ CRITICAL PROTECTION RULE

The following directories are the stable v2 production baseline. They must **never** be changed, refactored, or used as a testing ground:

- `apps/app-compass-v2/` — stable v2 frontend (Next.js)
- `apps/api-core-v2/` — stable v2 backend (FastAPI)

**If you need to understand what v2 does, read it. Do not write to it.**

This rule exists because v2 represents the last known-good state of the authenticated app. v2.5 is still in development and currently blocked. Until v2.5 is fully functional and deployed, v2 is the fallback reference.

---

## What v2 Contains

### app-compass-v2 (Frontend)
- **Framework:** Next.js 14, React 18, TypeScript, TailwindCSS, Supabase integration
- **Features:** User authentication, basic companion CRUD (create, view, activities)
- **Build status:** ❌ Also blocked by `@olcan/ui-components` — but this should NOT be fixed here
- **Key file:** `apps/app-compass-v2/CLAUDE.md`

### api-core-v2 (Backend)
- **Framework:** FastAPI, SQLAlchemy
- **Features:** User auth, companion CRUD, evolution logic (partial)
- **Build status:** ✅ Python backend is not affected by the ui-components issue
- **Key file:** `apps/api-core-v2/CLAUDE.md`

---

## v2 vs v2.5 — Key Differences

| Aspect | v2 | v2.5 |
|--------|----|----|
| Status | Stable, locked | Active development, blocked |
| Frontend | `app-compass-v2/` | `app-compass-v2.5/` |
| Backend | `api-core-v2/` | `api-core-v2.5/` |
| Auth | Supabase + JWT | JWT only (no Supabase) |
| Companion features | Basic CRUD | Basic CRUD + scaffolded evolution |
| Forge | Not present | 13 UI components (blocked) |
| Design system | Basic Tailwind | Liquid-glass, advanced components |
| Marketplace | Not present | Scaffolded (not functional) |
| Build | ❌ Blocked (ui-components) | ❌ Blocked (ui-components) |

**Note:** Both v2 and v2.5 apps are blocked by the same ui-components issue, but only v2.5 should have Option B applied. Do not touch v2.

---

## Why v2 Exists Alongside v2.5

v2 was the first complete iteration of the authenticated app. When v2.5 development began (adding Forge, new design system, marketplace scaffolding), v2 was preserved as:

1. A stable reference for what works
2. A fallback in case v2.5 development causes regressions
3. A source of pattern reference — how auth was implemented, how companion CRUD was structured

When v2.5 is deployed and verified in production, the v2 apps can be archived (moved to `3_Vaults/Archive_Folders/`). Until then, they stay in `apps/` but are read-only.

---

## MVP v1 (Even Older Reference)

`apps/app-mvp-v1/` is the original MVP, older than v2. It exists only as a historical reference. It should not be developed, modified, or referenced for patterns — use v2 or v2.5 instead.

---

## What to Do If You Need v2 Functionality in v2.5

If you're working on v2.5 and need to understand how a feature was done in v2:

1. Read `apps/app-compass-v2/src/` to understand the pattern
2. Reimplement the pattern in `apps/app-compass-v2.5/` — do not copy-paste wholesale
3. Update the implementation to match the v2.5 design system and TypeScript patterns
4. Never run build commands in `apps/app-compass-v2/`

---

## The CLAUDE.md Files in v2

Both v2 apps have their own CLAUDE.md files. They contain:

- `apps/app-compass-v2/CLAUDE.md` — v2 frontend context, protection rules, what the app does
- `apps/api-core-v2/CLAUDE.md` — v2 backend context, API routes, protection rules

These files exist to orient any agent or developer who reads the code without modifying it.

---

## When v2 Can Be Archived

v2 can be safely moved to `3_Vaults/Archive_Folders/v2-stable-backup/` when ALL of the following are true:

1. v2.5 app builds successfully (Option B fix applied)
2. v2.5 app is deployed and verified in production
3. v2.5 has at minimum: auth, companion CRUD, and one revenue feature working
4. All features present in v2 are also working in v2.5

Until then, v2 stays in `apps/` and remains protected.

---

## Summary for NotebookLM

If you're asking NotebookLM to reason about the project, here's how to think about v2:

- **v2 = the stable baseline** — don't change it, use it only as a read reference
- **v2.5 = where all active development happens** — but it's currently blocked
- **Website = the only part that's fully deployable right now** — ship this first
- **Backend v2.5 = also deployable** — deploy alongside the website

The v2 protection rule is not about code quality — it's about having a known-good fallback while v2.5 is being developed.
