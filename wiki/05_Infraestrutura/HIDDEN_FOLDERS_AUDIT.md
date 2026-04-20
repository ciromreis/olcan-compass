---
title: Hidden Folders Audit & Wiki Integration
type: drawer
layer: 5
status: active
last_seen: 2026-04-20
backlinks:
  - INFRAESTRUTURA_OVERVIEW
  - CLAUDE.md
  - SPEC_IO_System_v2_5
  - Backend_API_Audit_v2_5
---

# Hidden Folders Audit

## Directory Structure (Root Level)

| Folder | Purpose | Wiki Integration |
|--------|---------|---------------|
| `.claude/` | OpenCode AI settings | ✅ INCLUDED BELOW |
| `.kiro/` | Kiro specs | ⚠️ NEEDS AUDIT |
| `.netlify/` | Netlify config (LEGACY) | ⚠️ STALE |
| `.obsidian/` | Obsidian notes | ⚠️ NEEDS AUDIT |
| `.openclaude/` | OpenClaude AI | ⚠️ NEEDS AUDIT |
| `.playwright-cli/` | Playwright CLI | 📦 OK |
| `.secrets/` | API keys | 🔒 EXCLUDED |
| `.vercel/` | Vercel config | 📦 OK |
| `.vscode/` | VSCode settings | ⚠️ NEEDS AUDIT |
| `2_Pipelines/` | Build scripts | 📦 OK |
| `3_Vaults/` | Session logs | 🚫 EXCLUDED |
| `wiki/` | **SOURCE OF TRUTH** | ✅ CRITICAL |

---

## Hidden Folders Content (VERIFIED 2026-04-20)

### .claude/  (OpenCode AI - ACTIVE)

The active AI tool settings - contains permissions and custom commands.

**Files:**
- `settings.local.json` - 105 lines of bash permissions and custom commands
- `launch.json` - VSCode launch config

**Useful Permissions for Future Models:**
```json
{
  "Bash(curl -sS -o /dev/null -w \"%{http_code}\" https://olcan-compass-api.onrender.com/api/health)",
  "Bash(npm run *)",
  "Bash(pnpm --filter @olcan/web-v2.5 type-check)",
  "Bash(git commit -m '*)",
  "Bash(git push *)",
  "Bash(python -m alembic current)",
  "Read(//tmp/**)"
}
```

### .kiro/  (Kiro - UNKNOWN)

**Contents:**
- `specs/` - Possibly document specs

**AUDIT REQUIRED:** Check if this contains active specs that should be in wiki.

### .netlify/  (Netlify - LEGACY/STALE)

**Contents:**
- `functions-internal/` - Netlify functions (not used)
- `v1/` - Old Netlify config

**Status:** LEGACY - Project uses Vercel (not Netlify). These files are stale.

### .obsidian/  (Obsidian Notes)

Used for local markdown notes - Obsidian workspace shows what's actively being worked on:

**Current workspace files:**
- `wiki/00_SOVEREIGN/MemPalace_Migration_Spec.md` - Active in Obsidian

**Graph settings:**
- Node size: 1x multiplier
- Link distance: 250
- Collapse filters: enabled

**AUDIT:** Check if local Obsidian notes contain info not yet in wiki.

### .openclaude/ (OpenClaude AI - DUPLICATE?)

**Files:**
- `settings.local.json` - Similar to .claude/ directory

**AUDIT:** Check if this is duplicating .claude/ or has unique config.

### .vscode/  (VSCode - STANDARD)

Standard dev config - likely no special settings needed.

---

## 🔴 CRITICAL ISSUES IDENTIFIED (2026-04-20)

### 1. Companion Save Fails Silently

**Location:** `apps/app-compass-v2.5/src/app/(app)/aura/discover/page.tsx:198-202`

```tsx
try {
  await createAura(name, resultArchetype)
  router.push('/aura')
} catch (error) {
  console.error('Erro ao criar a presença:', error)  // Only logs - no user feedback!
}
```

**Problem:** No user-facing error message when save fails.

**Root Cause (likely):**
- DEMO_MODE is NOT set (verified via .env.local - no demo var)
- Production mode calls API: `AuraApiClient.createAura()`
- API endpoint may be failing or not returning expected data

**Check API:**
```bash
# Test aura creation endpoint
curl -X POST https://olcan-compass-api.onrender.com/api/v1/aura \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"Test","archetype":"institutional_escapee"}'
```

**FIX REQUIRED:** Add user notification in error catch block + proper error handling.

### 2. Quiz Availability

**Cause:** Production mode requires psych_questions in database.

**Check:**
```bash
curl https://olcan-compass-api.onrender.com/api/psych/questions | head -20
```

**If empty:** Run seed script:
```bash
cd apps/api-core-v2.5
python scripts/seed_psychology_questions.py
```

### 3. Readiness Evaluation: Always 0

**Location:** `stores/dossier.ts:633-650`

**Problem:** Returns hardcoded 0 - no actual algorithm.

**FIX REQUIRED:** Implement evaluateReadiness() function.

### 4. DEMO_MODE Status

**Current state (2026-04-20):**
- NOT set in `.env.local`
- NOT set in Vercel env vars
- App runs in PRODUCTION mode by default

**Stores affected by DEMO_MODE:**
- `stores/auth.ts`
- `stores/marketplace.ts`
- `stores/forge.ts`
- `stores/auraStore.ts`

---

## 📋 Instructions for Future Models (OBRIGATÓRIO)

### ⚠️ CRITICAL WARNINGS

1. **NOT assume hidden folders are empty** - Check `.kiro/`, `.obsidian/`, `.openclaude/`
2. **CI/CD is NOT GitHub Actions** - It's Vercel + Render automatic webhooks
3. **Check wiki FIRST** - `wiki/00_SOVEREIGN/` is source of truth
4. **Health check ALWAYS:**
```bash
curl https://olcan-compass-api.onrender.com/api/health
curl https://compass.olcan.com.br
```

### Quick Startup Checklist

| Step | Action |
|------|--------|
| 1 | Read `wiki/00_SOVEREIGN/Olcan_Master_PRD_v2_5.md` |
| 2 | Read `wiki/00_SOVEREIGN/Verdade_do_Produto.md` |
| 3 | Check `wiki/02_Arquitetura_Compass/SPEC_IO_System_v2_5.md` for code issues |
| 4 | Look up deployment in `wiki/05_Infraestrutura/INFRAESTRUTURA_OVERVIEW.md` |

### DO NOT Assume

- Hidden folders have no useful info - audit them
- Everything works - check the "Critical Issues" section above
- DNS is configured for all subdomains - check wiki first
- Quiz questions exist - verify in DB or seed

---

## 📂 Code Reference (Common Issues)

| Issue | File:Line | Status |
|------|-----------|--------|
| Companion save fails | `aura/discover/page.tsx:198` | 🛑 FIX NEEDED |
| Readiness = 0 | `dossier.ts:633` | 🛑 FIX NEEDED |
| Milestone stub | `dossier.ts:595` | 🛑 FIX NEEDED |
| bindToOpportunity | `forge.ts:622` | ⚠️ PARTIAL |
| Leaderboard empty | `tasks.py:287` | ⚠️ PENDING |

---

## 🔗 Links

**Infra:**
- [[INFRAESTRUTURA_OVERVIEW]] - Complete infra map
- [[DEPLOYMENT_RENDER]] - Deploy manual
- [[Backend_API_Audit_v2_5]] - Full API audit

**Code:**
- [[SPEC_IO_System_v2_5]] - Full I/O spec with code audit
- [[Spec_Dossier_System_v2_5]] - Dossier system spec

**Main:**
- [[CLAUDE.md]] - Main instructions

### .kiro/  (Specs)

**Contents:**
- `specs/` - specs directory

**AUDIT:** Is this related to document specs? Are specs up to date?

### .netlify/  (Netlify - LEGACY)

**Contents:**
- `functions-internal/` - Netlify functions
- `v1/` - Netlify config version

**Status:** LEGACY - Project uses Vercel now. Netlify config may be stale.

### .obsidian/  (Obsidian Notes)

**Files to audit:**
- `workspace.json` - Obsidian vault settings
- `graph.json` - Knowledge graph
- `core-plugins.json` - Enabled plugins

**AUDIT:** Are there notes that should be in wiki?

### .openclaude/ (OpenClaude AI)

**Status:** Similar to .claude/ - check for duplicates

### .vscode/  (VSCode)

**Status:** Standard dev config - could contain useful settings

---

## Instructions for Future Models

### How to Use the Wiki

1. **START HERE** each session:
   ```
   wiki/00_SOVEREIGN/Olcan_Master_PRD_v2_5.md
   wiki/00_SOVEREIGN/Verdade_do_Produto.md
   ```

2. **For architecture:**
   ```
   wiki/02_Arquitetura_Compass/Arquitetura_v2_5_Compass.md
   wiki/02_Arquitetura_Compass/SPEC_IO_System_v2_5.md
   ```

3. **For deployment:**
   ```
   wiki/05_Infraestrutura/INFRAESTRUTURA_OVERVIEW.md
   wiki/05_Infraestrutura/DEPLOYMENT_RENDER.md
   wiki/05_Infraestrutura/CI_CD_Estado_Atual.md
   ```

4. **For current code state:**
   ```
   wiki/02_Arquitetura_Compass/SPEC_IO_System_v2_5.md (# PART 2: CODE PROBLEMS)
   ```

### Don't Assume

- Hidden folders may contain critical info
- Verify CI/CD state (NOT GitHub Actions - it's Vercel + Render)
- Check wiki for latest status
- Run health checks manually

### Health Check Commands

```bash
# API health
curl https://olcan-compass-api.onrender.com/api/health

# Frontend health
curl https://compass.olcan.com.br
```

---

## Backlinks

- [[INFRAESTRUTURA_OVERVIEW]] - Infra state
- [[CLAUDE.md]] - Main instructions
- [[SPEC_IO_System_v2_5]] - Code audit