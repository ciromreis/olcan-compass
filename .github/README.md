# Olcan Compass — Workspace Overview

**Active version:** v2.5  
**Last updated:** 2026-04-21

> **⚠️ AUTH BLOCKER (2026-04-21):** Register/Login returns HTTP 500 in production.
> This blocks ALL authenticated features. See `wiki/00_SOVEREIGN/Agent_Knowledge_Handbook.md` for debug steps.

---

## Where to Start

**For agents, LLMs, and humans:** Read [`CLAUDE.md`](../CLAUDE.md) first — it is the single entry point. Then read [`wiki/00_SOVEREIGN/Agent_Knowledge_Handbook.md`](../wiki/00_SOVEREIGN/Agent_Knowledge_Handbook.md).

All canonical documentation lives in `wiki/` using the **MemPalace + Karpathy** methodology.

---

## Current Stats (2026-04-21)

| Metric | Value |
|--------|-------|
| Frontend pages | 169 (Next.js) |
| Frontend stores | 26 (Zustand) |
| Alembic migrations | 31 (head: `0026_add_users_username`) |
| Build | ✅ Passes |
| Auth | 🔴 500 in production |

---

## Deployment Model

Deployment is **not triggered by GitHub Actions**. The workflows in `.github/workflows/` are broken and exist only for reference. Actual deployment:

- **API (Render):** Push to `main` → Render detects via webhook → Docker build → auto-deploy
- **Frontend (Vercel):** Push to `main` → Vercel detects via webhook → Next.js build → auto-deploy

---

## Known CI Issues (⚠️ BOTH WORKFLOWS ARE BROKEN)

| File | Issue |
|------|-------|
| `ci.yml` | References `apps/api` (doesn't exist — should be `apps/api-core-v2.5`) |
| `ci.yml` | Tests `pnpm build:v2` — active development is v2.5 |
| `ci-cd.yml` | Deploy jobs are stubs (`echo "Deploying..."`) |
| `ci-cd.yml` | Uses `npm ci` instead of `pnpm install` |
| `ci-cd.yml` | References non-existent `tests/integration/` and `tests/performance/` dirs |
| Both | Python 3.12 in CI vs 3.11 in production Dockerfile |

**Do not rely on CI passing/failing — verify locally with `npm run type-check && npm run build`.**

---

## Key Documentation (wiki/)

| Topic | Document |
|-------|---------|
| Agent onboarding | `wiki/00_SOVEREIGN/Agent_Knowledge_Handbook.md` |
| Product truth | `wiki/00_SOVEREIGN/Verdade_do_Produto.md` |
| Architecture | `wiki/02_Arquitetura_Compass/Arquitetura_v2_5_Compass.md` |
| API audit | `wiki/02_Arquitetura_Compass/Backend_API_Audit_v2_5.md` |
| API deployment | `wiki/05_Infraestrutura/DEPLOYMENT_RENDER.md` |
| Infrastructure map | `wiki/05_Infraestrutura/INFRAESTRUTURA_OVERVIEW.md` |

---

## Scattered Config Warning

This repo has accumulated config files from multiple tools (`.kiro/`, `.openclaude/`, `.netlify/`, `.playwright-cli/`). **These are outdated and should not be trusted.** The `.kiro/specs/` directory in particular contains 1296 lines of stale aspirational specs that contradict current priorities. See `.kiro/AGENT_NOTICE.md`.
