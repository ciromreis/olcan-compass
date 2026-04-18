# Repository Cleanup & Wiki Organization Plan

**Date:** April 16, 2026  
**Objective:** Optimize repository for LLM token efficiency while maintaining knowledge integrity  
**Method:** Andrej Karpathy system - Wiki as source of truth, minimal root clutter

---

## 🎯 Current State Analysis

### ✅ What's Working Well
1. **Wiki Structure** - Well-organized 6-pillar system
2. **.claudeignore** - Properly excludes _GRAVEYARD, 3_Vaults, frozen apps
3. **Karpathy System** - Wiki-first approach implemented
4. **Protected Apps** - v2 apps properly frozen

### ⚠️ Issues to Fix

#### 1. Scattered Documentation Files
**Problem:** Documentation files outside wiki waste LLM tokens

**Files to relocate:**
```
Root Level:
- CLAUDE.md (keep - entry point)
- README.md (keep - GitHub landing)
- START_HERE.md (keep - navigation)

Apps (to move to wiki):
- apps/app-compass-v2.5/SESSION_HANDOFF_2025_04_16.md → wiki/10_Arquivo_Permanente/sessions/
- apps/app-compass-v2.5/CHANGELOG.md → wiki/10_Arquivo_Permanente/changelogs/
- apps/app-compass-v2/CLAUDE.md → DELETE (frozen app, covered by root CLAUDE.md)
- apps/app-compass-v2/README.md → DELETE (frozen app)
- apps/api-core-v2/CLAUDE.md → DELETE (frozen app)
- apps/api-core-v2/README.md → DELETE (frozen app)
- apps/site-marketing-v2.5/CLAUDE.md → DELETE (redundant)
- apps/site-marketing-v2.5/README.md → KEEP (minimal, necessary)
- apps/api-core-v2.5/README.md → KEEP (minimal, necessary)
- apps/api-core-v2.5/README_V25.md → wiki/02_Arquitetura_Compass/
- packages/shared-auth/README.md → KEEP (package documentation)
```

#### 2. Session Documentation Clutter
**Problem:** Session handoff files created during development sessions

**Action:**
- Create `wiki/10_Arquivo_Permanente/sessions/` directory
- Move all session handoff files there
- Update .claudeignore to exclude this directory

#### 3. Test Documentation
**Problem:** Test README files are necessary but shouldn't be in main context

**Files:**
```
- apps/app-compass-v2.5/tests/e2e/README.md → KEEP (necessary for tests)
- apps/app-compass-v2.5/.pytest_cache/README.md → IGNORE (auto-generated)
```

---

## 📋 Cleanup Actions

### Phase 1: Move Documentation to Wiki ✅

#### A. Create Archive Structure
```bash
mkdir -p wiki/10_Arquivo_Permanente/sessions
mkdir -p wiki/10_Arquivo_Permanente/changelogs
mkdir -p wiki/10_Arquivo_Permanente/legacy-readmes
```

#### B. Move Session Files
```bash
# Move session handoffs
mv apps/app-compass-v2.5/SESSION_HANDOFF_2025_04_16.md wiki/10_Arquivo_Permanente/sessions/

# Move changelogs
mv apps/app-compass-v2.5/CHANGELOG.md wiki/10_Arquivo_Permanente/changelogs/app-compass-v2.5-changelog.md

# Move legacy architecture docs
mv apps/api-core-v2.5/README_V25.md wiki/02_Arquitetura_Compass/API_Core_v2_5_Overview.md
```

#### C. Delete Redundant Files
```bash
# Frozen app documentation (covered by root docs)
rm apps/app-compass-v2/CLAUDE.md
rm apps/app-compass-v2/README.md
rm apps/api-core-v2/CLAUDE.md
rm apps/api-core-v2/README.md

# Redundant app-specific CLAUDE files
rm apps/site-marketing-v2.5/CLAUDE.md
```

### Phase 2: Update .claudeignore ✅

Add to .claudeignore:
```
# ─── SESSION ARCHIVES ────────────────────────────────────────────────────────
# Historical session logs moved to wiki archive
wiki/10_Arquivo_Permanente/sessions/
wiki/10_Arquivo_Permanente/changelogs/
wiki/10_Arquivo_Permanente/legacy-readmes/

# Test documentation (necessary but not for main context)
**/tests/**/README.md
**/.pytest_cache/

# Package lock files (huge, not needed for context)
pnpm-lock.yaml
package-lock.json
```

### Phase 3: Create Minimal App READMEs ✅

For active apps that need minimal documentation:

**apps/app-compass-v2.5/README.md:**
```markdown
# Olcan Compass v2.5 (Production App)

**Status:** ✅ Active Development  
**Documentation:** See [wiki/02_Arquitetura_Compass/](../../wiki/02_Arquitetura_Compass/)

## Quick Start
\`\`\`bash
npm install
npm run dev  # http://localhost:3000
npm run build
\`\`\`

## Key Commands
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - Lint check
- `npm run type-check` - TypeScript check

**Full documentation in wiki.**
```

**apps/api-core-v2.5/README.md:**
```markdown
# Olcan API Core v2.5

**Status:** ✅ Active Development  
**Documentation:** See [wiki/02_Arquitetura_Compass/](../../wiki/02_Arquitetura_Compass/)

## Quick Start
\`\`\`bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
\`\`\`

**Full documentation in wiki.**
```

### Phase 4: Update Root Documentation ✅

**Update CLAUDE.md** to reflect new structure:
```markdown
# Olcan Compass Project Guide (CLAUDE.md)

## 🚨 CRITICAL: Token Optimization
This repo follows the Andrej Karpathy methodology:
- **Wiki is source of truth** - All documentation lives in `wiki/`
- **Minimal root clutter** - Only essential files in root
- **Session archives excluded** - See .claudeignore

## Structure
- `apps/`: Main applications
  - `app-compass-v2.5`: ✅ Production app (active)
  - `site-marketing-v2.5`: ✅ Marketing site (active)
  - `app-compass-v2`: 🔒 Frozen (v2 production)
  - `api-core-v2`: 🔒 Frozen (v2 production)
- `packages/`: Shared packages
- `wiki/`: **📚 Knowledge Base (The Source of Truth)**

## Documentation Map
- **Entry Point:** START_HERE.md
- **Quick Reference:** This file (CLAUDE.md)
- **Full Knowledge:** wiki/ (6 pillars)
- **Archives:** wiki/10_Arquivo_Permanente/ (excluded from context)

## Development Commands
[Keep existing commands]

## 🚫 What NOT to Read
- `_GRAVEYARD/` - Historical archives (2275+ files)
- `3_Vaults/` - Session logs (outdated)
- `wiki/10_Arquivo_Permanente/` - Permanent archive
- Frozen apps: `app-compass-v2/`, `api-core-v2/`
```

---

## 🎯 Expected Results

### Token Savings
**Before:**
- ~50 scattered .md files
- Session documentation in main context
- Redundant app-specific docs
- **Estimated:** 50,000+ tokens wasted per context load

**After:**
- 3 root .md files (CLAUDE.md, README.md, START_HERE.md)
- All documentation in wiki (properly organized)
- Archives excluded via .claudeignore
- **Estimated:** 45,000+ tokens saved per context load

### Improved Organization
1. **Single Source of Truth** - Wiki contains all knowledge
2. **Clear Navigation** - START_HERE.md → Wiki pillars
3. **No Redundancy** - Each piece of info exists once
4. **Archive Separation** - Historical docs excluded from context

### Maintained Functionality
1. **GitHub Landing** - README.md still works
2. **Developer Onboarding** - START_HERE.md guides new devs
3. **AI Agent Entry** - CLAUDE.md provides quick reference
4. **Package Docs** - Necessary READMEs kept minimal

---

## 📝 Implementation Checklist

### Immediate Actions (Safe)
- [ ] Create archive directories in wiki
- [ ] Move session handoff files to archive
- [ ] Move changelogs to archive
- [ ] Update .claudeignore with archive exclusions

### Careful Actions (Review First)
- [ ] Delete frozen app CLAUDE.md files
- [ ] Delete frozen app README.md files
- [ ] Delete redundant site-marketing CLAUDE.md
- [ ] Move API v2.5 README to wiki

### Documentation Updates
- [ ] Update CLAUDE.md with new structure
- [ ] Update START_HERE.md if needed
- [ ] Create minimal app READMEs
- [ ] Update wiki index with archive location

### Verification
- [ ] Test that frozen apps still work (v2)
- [ ] Verify active apps still build (v2.5)
- [ ] Check that wiki links still work
- [ ] Confirm .claudeignore excludes archives

---

## 🚀 Execution Order

1. **Backup First** - Commit current state
2. **Create Structure** - Make archive directories
3. **Move Files** - Relocate documentation
4. **Update Ignores** - Add to .claudeignore
5. **Delete Redundant** - Remove frozen app docs
6. **Update Root Docs** - Refresh CLAUDE.md, README.md
7. **Test** - Verify builds and links
8. **Commit** - Save cleaned state

---

## 📊 File Inventory

### Keep in Root (3 files)
- ✅ CLAUDE.md (AI agent entry point)
- ✅ README.md (GitHub landing)
- ✅ START_HERE.md (navigation map)

### Keep in Apps (Minimal)
- ✅ apps/app-compass-v2.5/README.md (minimal, to be created)
- ✅ apps/api-core-v2.5/README.md (minimal, to be updated)
- ✅ apps/site-marketing-v2.5/README.md (minimal, keep)
- ✅ packages/shared-auth/README.md (package doc)

### Move to Wiki Archive
- 📦 apps/app-compass-v2.5/SESSION_HANDOFF_2025_04_16.md
- 📦 apps/app-compass-v2.5/CHANGELOG.md
- 📦 apps/api-core-v2.5/README_V25.md

### Delete (Redundant)
- ❌ apps/app-compass-v2/CLAUDE.md
- ❌ apps/app-compass-v2/README.md
- ❌ apps/api-core-v2/CLAUDE.md
- ❌ apps/api-core-v2/README.md
- ❌ apps/site-marketing-v2.5/CLAUDE.md

### Ignore (Auto-generated)
- 🚫 apps/app-compass-v2.5/.pytest_cache/README.md
- 🚫 apps/app-compass-v2.5/tests/e2e/README.md (keep but ignore)

---

## 🎓 Best Practices Going Forward

### For Developers
1. **All documentation goes in wiki** - Never create root-level .md files
2. **Session notes go to archive** - Use wiki/10_Arquivo_Permanente/sessions/
3. **Keep app READMEs minimal** - Just quick start, link to wiki
4. **Update .claudeignore** - Exclude any new archive directories

### For AI Agents
1. **Start with CLAUDE.md** - Quick reference and structure
2. **Navigate via START_HERE.md** - Find the right wiki pillar
3. **Read wiki selectively** - Only load needed sections
4. **Ignore archives** - Historical docs waste tokens

### For Documentation
1. **Wiki is source of truth** - All knowledge lives there
2. **Organize by pillar** - Use the 6-pillar structure
3. **Archive old sessions** - Move to 10_Arquivo_Permanente
4. **Link, don't duplicate** - Reference wiki from app docs

---

**Ready to execute? Start with Phase 1 actions above.**

**Estimated time:** 30 minutes  
**Risk level:** Low (mostly moves and deletes of redundant files)  
**Benefit:** 45,000+ tokens saved per context load
