# Olcan Compass — Workspace Overview

**Active version:** v2.5  
**Last updated:** 2026-04-20

---

## Repository Structure

```
olcan-compass/
├── apps/
│   ├── app-compass-v2.5/     ← Frontend (Next.js) — ACTIVE
│   ├── site-marketing-v2.5/  ← Marketing site (Next.js) — ACTIVE
│   ├── api-core-v2.5/        ← Backend API (FastAPI/Python) — ACTIVE
│   ├── app-compass-v2/       ← FROZEN (v2 legacy, read-only)
│   └── api-core-v2/          ← FROZEN (v2 legacy, read-only)
├── packages/
│   ├── ui-components/        ← Liquid Glass design system
│   └── shared-auth/          ← Unified identity service
├── wiki/                     ← Source of truth for all documentation
├── 2_Pipelines/scripts/      ← Local build and run scripts
├── CLAUDE.md                 ← Navigation guide for LLMs and agents
└── .github/workflows/        ← CI workflows (see note below)
```

---

## Where to Start

**For agents and LLMs:** Read `CLAUDE.md` first — it has the navigation protocol, deployment state, and critical gotchas.

**For humans:** Same — `CLAUDE.md` is the single entry point.

---

## Deployment Model

Deployment is **not triggered by GitHub Actions**. The workflows in `.github/workflows/` run tests only. Actual deployment works as follows:

- **API (Render):** Push to `main` → Render detects via webhook → Docker build → auto-deploy
- **Frontend (Vercel):** Push to `main` → Vercel detects via webhook → Next.js build → auto-deploy

See `wiki/05_Infraestrutura/CI_CD_Estado_Atual.md` for known gaps in the current CI setup.

---

## Known CI Issues

Both workflow files have problems:

| File | Issue |
|------|-------|
| `ci.yml` | References `apps/api` (doesn't exist — should be `apps/api-core-v2.5`) |
| `ci.yml` | Tests `pnpm build:v2` — active development is v2.5 |
| `ci-cd.yml` | Deploy jobs are stubs (`echo "Deploying..."`) |
| Both | Python 3.12 in CI vs 3.11 in production Dockerfile |

---

## Key Documentation (wiki/)

| Topic | Document |
|-------|---------|
| Navigation map | `wiki/00_SOVEREIGN/Grafo_de_Conhecimento_Olcan.md` |
| Product truth | `wiki/00_SOVEREIGN/Verdade_do_Produto.md` |
| Architecture | `wiki/02_Arquitetura_Compass/Arquitetura_v2_5_Compass.md` |
| API deployment | `wiki/05_Infraestrutura/DEPLOYMENT_RENDER.md` |
| Infrastructure map | `wiki/05_Infraestrutura/INFRAESTRUTURA_OVERVIEW.md` |
| CI/CD state | `wiki/05_Infraestrutura/CI_CD_Estado_Atual.md` |
| Go-live plan | `wiki/00_Onboarding_Inicio/Plano_GoLive_v2_5_Abril_2026.md` |
