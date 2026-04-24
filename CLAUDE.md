# Olcan Compass Project Guide (CLAUDE.md)

**🚨 CRITICAL: Wiki Methodology - MemPalace Adapted**

This repo follows hybrid **MemPalace + Karpathy** methodology:
- **Wiki is source of truth** - All documentation lives in `wiki/`
- **Wings/Rooms/Drawers** - Semantic organization (see MemPalace_Migration_Spec.md)
- **Backlinks required** - All important docs must link to each other
- **Minimal root clutter** - Only 3 essential files in root
- **Session archives excluded** - See `.claudeignore` for what to skip
- **Frozen apps protected** - v2 apps are read-only, focus on v2.5

### Hub-and-Spoke Agent Alignment (2026-04-21)

Multiple IDEs/agents read different config files. To keep them aligned, we use a
**hub-and-spoke** model: every tool-specific file redirects to this file, which routes to `wiki/`.

| File | Audience | Content |
|------|----------|---------|
| `CLAUDE.md` (this file) | Hub — all agents | Navigation, state, gotchas |
| `.windsurfrules` | Windsurf/Cascade | Thin redirect → here + rules |
| `.cursorrules` | Cursor | Thin redirect → here + rules |
| `README.md` | GitHub / humans | Current stats, pointer to here |
| `.github/README.md` | GitHub UI | CI status, pointer to here |
| `.kiro/AGENT_NOTICE.md` | Kiro | Warning: specs are outdated |
| `.claudeignore` | Claude Code | Excludes stale configs |

**When updating project state**, update this file FIRST, then propagate to spokes if needed.
Do NOT trust `.kiro/specs/` — those are outdated aspirational specs that contradict current rules.

## Navigation Protocol (MemPalace Style)

### For any new session/agent:
1. **Always start here**: `wiki/00_SOVEREIGN/Agent_Knowledge_Handbook.md` ← **most comprehensive**
2. **Check reality**: `wiki/00_SOVEREIGN/Verdade_do_Produto.md`
3. **See knowledge map**: `wiki/00_SOVEREIGN/Grafo_de_Conhecimento_Olcan.md`
4. **If technical**: `wiki/02_Arquitetura_Compass/Arquitetura_v2_5_Compass.md`

### Backlinking Rule
Every doc in `wiki/00_SOVEREIGN/`, `wiki/02_Arquitetura_Compass/`, and `wiki/03_Produto_Forge/` MUST have:
- Links to related docs at the bottom
- backlinks field in frontmatter (for major docs)

## Quick Reference

This file provides quick reference for development commands and project structure.

## Structure
- `apps/`: Main applications
  - `app-compass-v2.5`: ✅ **Production app (ACTIVE)**
  - `site-marketing-v2.5`: ✅ **Marketing website (ACTIVE)**
  - `api-core-v2.5`: ✅ **Backend API (ACTIVE)**
  - `app-compass-v2`: 🔒 Frozen (v2 production - read-only)
  - `api-core-v2`: 🔒 Frozen (v2 production - read-only)
- `packages/`: Shared packages
  - `ui-components`: Liquid Glass design system
  - `shared-auth`: Unified identity service
- `wiki/`: **📚 Knowledge Base (The Source of Truth)** - Follows the LLM Wiki methodology

## Documentation Map

**Start here for navigation:**
1. **This file (CLAUDE.md)** - Quick reference and commands
2. **START_HERE.md** - Full navigation map to wiki pillars
3. **Wiki** - All detailed documentation organized semantically

**Semantic Hierarchy (Read in this order):**
1. **wiki/00_SOVEREIGN/** - 🏛️ **THE SOURCE OF TRUTH** (read first!)
   - `Olcan_Master_PRD_v2_5.md` - Complete product vision
   - `Verdade_do_Produto.md` - Current reality (no inflation)
   - `Grafo_de_Conhecimento_Olcan.md` - Knowledge map
2. **wiki/01_Visao_Estrategica/** - WHY we're building this
3. **wiki/03_Produto_Forge/** - WHAT we're building
4. **wiki/02_Arquitetura_Compass/** - HOW it's built
5. **wiki/07_Agentes_IA/** - AI agents and automation
6. **wiki/00_Onboarding_Inicio/** - Operational procedures (when needed)

**What's in the Wiki:**
- `00_SOVEREIGN/` - 🏛️ **Highest centrality** - Master PRD, Product Truth
- `01_Visao_Estrategica/` - Vision, strategy, roadmap
- `02_Arquitetura_Compass/` - Architecture, backend, deployment
- `03_Produto_Forge/` - Product, design system, UI catalog
- `04_Ecossistema_Aura/` - Gamification, companions, rituals
- `05_Inteligencia_Economica/` - Economic intelligence, escrow
- `06_Inteligencia_Narrativa/` - AI, narrative forge, scoring
- `07_Agentes_IA/` - AI agents, automation, Nexus system
- `00_Onboarding_Inicio/` - Operations, testing, deployment (lower priority)
- `10_Arquivo_Permanente/` - 🚫 **EXCLUDED** - Historical archives

## Critical Documentation (Wiki)
**ALWAYS READ FIRST:**
- [[wiki/00_SOVEREIGN/Olcan_Master_PRD_v2_5.md]] - **THE** source of truth
- [[wiki/00_SOVEREIGN/Verdade_do_Produto.md]] - Current product state
- [[wiki/00_SOVEREIGN/Grafo_de_Conhecimento_Olcan.md]] - Knowledge map

**Then proceed to:**
- Migration Spec: [[wiki/00_SOVEREIGN/MemPalace_Migration_Spec.md]] - Wiki structure methodology
- Shipper's Guide: [[wiki/00_Onboarding_Inicio/Shippers_Guide_v2_5.md]] - **OBRIGATÓRIO** antes de fazer mudanças
- Vision: [[wiki/01_Visao_Estrategica/Carta_do_Projeto_Olcan_v2.5.md]]
- Architecture: [[wiki/02_Arquitetura_Compass/Arquitetura_v2_5_Compass.md]]
- API Audit: [[wiki/02_Arquitetura_Compass/Backend_API_Audit_v2_5.md]]
- I/O Issues: [[wiki/02_Arquitetura_Compass/SPEC_IO_System_v2_5.md]]
- **Dossier System Spec:** [[wiki/02_Arquitetura_Compass/SPEC_Dossier_System_v2_5.md]] — readiness algo + export pipeline contract
- **Dossier Overhaul Plan:** [[wiki/00_Onboarding_Inicio/Dossier_Overhaul_Execution_Plan.md]] — EC-1 through EC-6 cards for smaller-model execution
- Product: [[wiki/03_Produto_Forge/PRD_Master_Ethereal_Glass.md]]
- Standards: [[wiki/00_Onboarding_Inicio/Padroes_de_Codigo.md]]
- Roadmap: [[wiki/01_Visao_Estrategica/Roadmap_Implementacao_v2_5.md]]

## Deployment State (atualizado 2026-04-21)

> **API em produção no Render.** Leia [[wiki/05_Infraestrutura/INFRAESTRUTURA_OVERVIEW.md]] para o mapa completo.

| Componente | Plataforma | URL / ID |
|------------|-----------|--------|
| API Core v2.5 | Render (Docker, Free) | `https://olcan-compass-api.onrender.com` |
| Render Service ID | — | `srv-d6jjhuea2pns73f73e5g` |
| PostgreSQL | Render | `dpg-d7i2qnkvikkc73aj0gm0-a` |
| App Compass | Vercel | `compass.olcan.com.br` |
| DNS | Cloudflare | Zone `aa51bdbdc0a503f3121f810e46c16c0e` |
| Email | Resend | `smtp.resend.com:465` |
| Domínio | GoDaddy | `olcan.com.br` |
| DB migration | Alembic | head = `0028_seed_psychology_questions` |

### ⚠️ AUTH FIX (2026-04-21): Root cause found and fixed

**Root cause**: The `User` ORM model declared `bio` and `preferences` columns that were
**never created by any Alembic migration**. After migration 0026 fixed the `username`
column, `db.refresh(new_user)` still crashed because PostgreSQL couldn't find `bio` and
`preferences` in the `users` table.

**Fix**: Migration `0027_ensure_all_user_columns` defensively adds ALL missing User columns
(with `IF NOT EXISTS` guards). Migration `0028` seeds 12 OIOS quiz questions.

**After deploy**, trigger migration:
1. `GET /api/migrate-db-render?secret_key=olcan2026omega`
2. Verify with `GET /api/db-diagnostic?secret_key=olcan2026omega`
3. Test `POST /api/auth/register` with a test account

### Gotchas críticos:
- `DATABASE_URL` deve ter `postgresql+asyncpg://` (não `postgresql://`)
- `ENV PYTHONPATH=/app` é obrigatório no Dockerfile (alembic exige)
- Render API PUT `/envVars` substitui TODAS as vars — sempre fetch antes de update
- Cloudflare não importa todos os subdomínios automaticamente na migração — verificar manualmente
- `GET /api/migrate-db-render?secret_key=olcan2026omega` — roda migrations remotamente sem redeploy
- `GET /api/seed-db-render?secret_key=olcan2026omega` — roda seed scripts remotamente
- `GET /api/db-diagnostic?secret_key=olcan2026omega` — inspects users table columns + alembic version + quiz count

**Infra runbooks:** `wiki/05_Infraestrutura/`

## Development Commands

### Full Environment
- Start all: `./2_Pipelines/scripts/START_APPLICATION.sh`
- Quick Build: `./2_Pipelines/scripts/QUICK_DEPLOY.sh`

### App (Compass v2.5)
- Location: `apps/app-compass-v2.5`
- Dev: `npm run dev`
- Build: `npm run build`
- Type check: `npm run type-check`
- Lint: `npm run lint`

### Backend (API v2.5)
- Location: `apps/api-core-v2.5`
- Docker: `docker compose up --build`
- Local: `uvicorn app.main:app --reload`
- Migrations: `docker compose run --rm api alembic upgrade head`

### Marketing Site
- Location: `apps/site-marketing-v2.5`
- Dev: `npm run dev`
- Build: `npm run build`

### UI Components
- Location: `packages/ui-components`
- Build: `npm run build`

## Git Guidelines
- Format: Conventional Commits (`feat:`, `fix:`, `chore:`)
- Branching: `feature/`, `fix/`, `refactor/`
- Policy: No TODOs in production. All code must pass linting.

## Current Code Stats (2026-04-21)

| Metric | Value |
|--------|-------|
| Frontend stores | 26 (Zustand) |
| Frontend pages | 169 (Next.js) |
| Backend API routes (files) | 47 Python files in `app/api/routes/` + `app/api/v1/` |
| Alembic migrations | 33 files (head: `0028_seed_psychology_questions`) |
| Build status | ✅ Passes (zero errors, ~49 unused-import warnings) |
| Auth status | � Fix deployed (0027+0028) — awaiting migration trigger |

## 🚫 What NOT to Read (Token Optimization)

**Excluded via .claudeignore:**
- `_GRAVEYARD/` - Historical archives (2275+ files, all outdated)
- `3_Vaults/` - Session logs (outdated)
- `wiki/10_Arquivo_Permanente/` - Permanent archive
- Frozen apps: `app-compass-v2/`, `api-core-v2/` (read-only)
- Build artifacts: `node_modules/`, `.next/`, `.venv/`, etc.
- Environment files: `.env*`, `.secrets/`
- `.netlify/` - LEGACY (not used anymore)

**Hidden Folders to Audit:**
- `.kiro/` - May contain specs
- `.obsidian/` - May have notes not in wiki
- `.openclaude/` - Check vs .claude/

**Full audit:** [[wiki/05_Infraestrutura/HIDDEN_FOLDERS_AUDIT.md]]

## 🏛️ MemPalace Structure (Wings/Rooms/Drawers)

| Wing | Nome | Rooms |
|------|------|-------|
| 00 | SOVEREIGN | Master PRD, Verdade, Grafo, Specs |
| 01 | ESTRATEGICA | Visão, Roadmap, KPIs, Matriz |
| 02 | ARQUITETURA | API, DB, Deploy, Auth, Stores |
| 03 | PRODUTO | UI, Features, Design System |
| 04 | AURA | Gamification, Companions |
| 05 | ECONOMIC | Escrow, Pricing, CRM |
| 06 | NARRATIVE | Narrative Forge, AI Scoring |
| 07 | AGENTES | Nexus, Automação |
| 08 | OPERATIONS | Runbooks, Testes, Onboarding |
| 09 | ARCHIVE | Histórico (não ler ativamente)

## Personas
- **Valentino**: Technical/Architecture lead
- **Greenback Boogie**: Legal/Compliance
- **Mary**: Research/Data analysis
- **Leon Greco**: Governance/Ethics

---

## 📁 Root Structure (for future auditors)

```
olcan-compass/
├── apps/                    # Applications
│   ├── app-compass-v2.5/     # Main frontend (Next.js) ✅ ACTIVE
│   ├── api-core-v2.5/       # Backend API (FastAPI) ✅ ACTIVE
│   ├── site-marketing-v2.5/  # Marketing site ✅ ACTIVE
│   ├── app-compass-v2/      # 🔒 Frozen v2 (read-only)
│   └── api-core-v2/         # 🔒 Frozen v2 (read-only)
├── packages/               # Shared packages
│   ├── ui-components/     # Design system
│   └── shared-auth/     # Auth service
├── wiki/                 # 📚 Source of Truth
├── CLAUDE.md            # This file
├── README.md           # Quick reference
├── docker-compose*.yml  # Docker configs
├── render.yaml        # Render deploy config
├── vercel.json      # Vercel config
└── package.json   # Root workspace
```

### ⚠️ DO NOT MODIFY
- `apps/app-compass-v2/` - Frozen v2 (read-only)
- `apps/api-core-v2/` - Frozen v2 (read-only)  
- `_GRAVEYARD/` - Historical archives

### 🚀 Current Production
- Frontend: `https://compass.olcan.com.br` (Vercel)
- Backend: `https://olcan-compass-api.onrender.com` (Render)

---

**For full navigation, see `START_HERE.md` and the wiki.**
