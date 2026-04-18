# Olcan Compass — NotebookLM Document Index
> Master Map · Upload all 5 files in this folder to Google NotebookLM
> Last updated: April 10, 2026 (post-consolidation audit)

---

## How to Use This Set

Upload all 5 `.md` files from this folder (`notebooklm/`) as sources in a single Google NotebookLM notebook. Together they give a complete, structured picture of the Olcan Compass project — organized by concern so you can ask targeted questions.

---

## The 5 Source Documents

### 📄 NOTEBOOKLM_01_WEBSITE_DEPLOYMENT.md
**Topic:** The public website (`apps/site-marketing-v2.5/`)

Use this for questions about:
- Why the latest deployment is blocked on Vercel and how to fix it
- What environment variables are missing (Payload CMS, database)
- Which pages exist and which still need content
- The step-by-step checklist to ship the website fully
- What refinements are still needed after deployment

**Status of what it covers:** Website builds locally ✅, Vercel deployment blocked ❌ (fixable in ~10 min via dashboard)

---

### 📄 NOTEBOOKLM_02_APP_V25_REFINEMENT.md
**Topic:** The authenticated app (`apps/app-compass-v2.5/`) and backend (`apps/api-core-v2.5/`)

Use this for questions about:
- Why the app won't build and exactly how to fix it (Option B: ~2 hours)
- What features are scaffolded vs. what's truly missing
- The realistic timeline to get from "blocked" to "first revenue feature"
- Which parts of the backend are working vs. missing
- What the companion system actually has vs. what's intended

**Status of what it covers:** App blocked by ui-components ❌, Backend ready to deploy ✅

---

### 📄 NOTEBOOKLM_03_ARCHITECTURE_AND_TRUTH.md
**Topic:** Full system architecture and honest product state

Use this for questions about:
- How the website, app, and backend connect to each other
- The full feature matrix (what's built, what's partial, what's missing)
- The monorepo structure and what lives where
- The recommended development sequence (Phase 1 → 5)
- What tech stack is being used across the project

**Status of what it covers:** Complete project view, no inflation

---

### 📄 NOTEBOOKLM_04_V2_STABLE_REFERENCE.md
**Topic:** The protected v2 stable baseline

Use this for questions about:
- What v2 contains and why it must not be modified
- How v2 and v2.5 differ
- When v2 can be safely archived
- What patterns in v2 can be referenced (but not copied wholesale) for v2.5

**Status of what it covers:** v2 is protected, read-only reference

### 📄 NOTEBOOKLM_05_AUDIT_AND_GAPS.md
**Topic:** Gap analysis — what was planned vs. what was actually built vs. what the docs claim

Use this for questions about:
- Why sessions keep declaring features "complete" when they aren't
- The 7 specific gaps between plan and reality
- How to break the AI slop cycle going forward
- Which features have internal contradictions in the codebase
- The honest feature completion matrix (every feature, every dimension)

**Status of what it covers:** Comprehensive gap audit; the corrective document that makes the others trustworthy

---

## Quick State Summary (As of April 10, 2026)

| Component | Location | Build | Deploy | Notes |
|-----------|----------|-------|--------|-------|
| **Website** | `apps/site-marketing-v2.5/` | ✅ Works | ⚠️ Blocked (Vercel config) | Fix: 10 min in Vercel dashboard |
| **Backend v2.5** | `apps/api-core-v2.5/` | ✅ Works | ✅ Ready | Deploy to Render/Railway |
| **App v2.5** | `apps/app-compass-v2.5/` | ❌ Blocked | ❌ Blocked | Fix: Option B (~2h) |
| **App v2** | `apps/app-compass-v2/` | ❌ Blocked | ⛔ Protected | Do not touch |
| **Backend v2** | `apps/api-core-v2/` | ✅ Works | ⛔ Protected | Do not touch |

---

## The Two Active Blockers

### Blocker 1 — Website Deployment (Vercel Config)
- **What:** Vercel build fails due to Next.js 15 + Payload CMS peer dependency conflict
- **Fix:** Go to Vercel dashboard → set Root Directory to `apps/site-marketing-v2.5` + set Install Command to `npm install --legacy-peer-deps`
- **Time to fix:** ~10 minutes
- **Risk:** Zero

### Blocker 2 — App Build (ui-components package)
- **What:** `packages/ui-components/` is broken (16 TypeScript errors, invalid dist/)
- **Fix:** Option B — replace ~30 `@olcan/ui-components` imports with `@/components/ui` in `apps/app-compass-v2.5/`
- **Time to fix:** ~2 hours
- **Risk:** Medium

---

## Recommended Questions for NotebookLM

### About the Website
- "What exactly do I need to do in the Vercel dashboard to get the website deployed?"
- "Which environment variables are not yet set and what will break without them?"
- "What content is still missing or needs refinement after the site deploys?"
- "What is the relationship between the website and the Payload CMS admin panel?"

### About the App
- "Walk me through Option B for fixing the ui-components blocker step by step."
- "Which features in the app are closest to completion and could ship fastest?"
- "What does the OIOS archetype system need to become functional end-to-end?"
- "What's the minimum viable app to launch to first users?"

### About Strategy
- "What is the fastest path to the first revenue feature?"
- "What dependencies does the website have on the app that aren't yet built?"
- "What should be built in the next 30 days to have the most impact?"
- "What are the risks of proceeding with Option B vs. Option C for ui-components?"

### About Architecture
- "How do the website and the app share design tokens without sharing a codebase?"
- "What route zones does the app need to implement for the website integration to work?"
- "When can v2 safely be archived?"

---

## Other Key Documentation (In the Project, Not in This Folder)

These files contain additional detail. Reference them if NotebookLM needs more depth:

| File | Location | What It Contains |
|------|----------|-----------------|
| Root context | `CLAUDE.md` | Protection rules, active areas, monorepo overview |
| Product truth | `1_Pillars/Context/PRODUCT_TRUTH.md` | Feature state, realistic timelines |
| Architecture | `1_Pillars/Context/ARCHITECTURE.md` | System diagram, version history |
| Website/App bridge | `1_Pillars/Context/WEBSITE_V25_BRIDGE.md` | Integration contract between deployments |
| Technical state | `1_Pillars/Architecture/README_ESTADO_REAL.md` | Options A/B/C for the blocker |
| Deployment guide | `docs/MARKETING_SITE_DEPLOYMENT.md` | Full Vercel deployment instructions |
| Deployment status | `docs/DEPLOYMENT_STATUS_FINAL.md` | All 8 failed attempts, root cause analysis |
| Session handoff | `3_Vaults/Session_Logs/SESSION_HANDOFF_APR_4_2026.md` | Latest session summary |
| Master audit | `3_Vaults/Historical_Audits/ULTIMATE_TRUTH_V2.5.md` | Deep audit of v2.5 state |
