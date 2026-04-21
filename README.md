# 🧭 Olcan Compass Monorepo

> **🤖 AI AGENT or LLM?** Read [`CLAUDE.md`](./CLAUDE.md) first — it is the single entry point.  
> **👤 Human developer?** Same — start with [`CLAUDE.md`](./CLAUDE.md).

All documentation lives in [`wiki/`](./wiki/). Everything else is secondary.

---

## Current Status (2026-04-21)

| Metric | Value |
|--------|-------|
| Build | ✅ Passes (zero errors) |
| Frontend pages | 169 (Next.js) |
| Frontend stores | 26 (Zustand) |
| Alembic migrations | 31 (head: `0026_add_users_username`) |
| **Auth** | **🔴 Register/Login returning 500 in production** |

---

## Active Apps

| App | Path | Framework | Status |
|-----|------|-----------|--------|
| App Compass v2.5 | `apps/app-compass-v2.5/` | Next.js 14 | ✅ Active |
| API Core v2.5 | `apps/api-core-v2.5/` | FastAPI + Docker | ✅ Active |
| Marketing Site | `apps/site-marketing-v2.5/` | PayloadCMS | ✅ Live |
| App Compass v2 | `apps/app-compass-v2/` | — | 🔒 Frozen |
| API Core v2 | `apps/api-core-v2/` | — | 🔒 Frozen |

---

## Documentation (Source of Truth)

All knowledge lives in `wiki/` using the **MemPalace + Karpathy** methodology:

| Need | Document |
|------|----------|
| Agent onboarding | [`wiki/00_SOVEREIGN/Agent_Knowledge_Handbook.md`](./wiki/00_SOVEREIGN/Agent_Knowledge_Handbook.md) |
| Product truth | [`wiki/00_SOVEREIGN/Verdade_do_Produto.md`](./wiki/00_SOVEREIGN/Verdade_do_Produto.md) |
| Architecture | [`wiki/02_Arquitetura_Compass/Arquitetura_v2_5_Compass.md`](./wiki/02_Arquitetura_Compass/Arquitetura_v2_5_Compass.md) |
| API audit | [`wiki/02_Arquitetura_Compass/Backend_API_Audit_v2_5.md`](./wiki/02_Arquitetura_Compass/Backend_API_Audit_v2_5.md) |
| Infrastructure | [`wiki/05_Infraestrutura/INFRAESTRUTURA_OVERVIEW.md`](./wiki/05_Infraestrutura/INFRAESTRUTURA_OVERVIEW.md) |
| Deployment | [`wiki/05_Infraestrutura/DEPLOYMENT_RENDER.md`](./wiki/05_Infraestrutura/DEPLOYMENT_RENDER.md) |

---

## Quick Start

```bash
pnpm install                                              # Install all deps
cd apps/app-compass-v2.5 && npm run dev                   # Frontend on :3000
cd apps/api-core-v2.5 && docker compose up                # Backend on :8000
cd apps/app-compass-v2.5 && npm run type-check && npm run build  # Verify build
```

---

## Rules

1. **DO NOT modify** `app-compass-v2` or `api-core-v2` (frozen production)
2. **DO NOT create** new stores — consolidate existing ones
3. **DO NOT build** gamification or social features (P3) before core value works
4. **DO NOT skip** `npm run type-check` before commits
5. **DO read** `CLAUDE.md` → `wiki/00_SOVEREIGN/Agent_Knowledge_Handbook.md` before any work

---

**Last updated**: 2026-04-21
