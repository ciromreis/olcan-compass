# Route Audit — Olcan Compass v2.5

**Total Routes**: 136  
**Audit Date**: 2026-04-17  
**Purpose**: Map all routes to ASPIRATION → EXECUTION flow, identify core vs. non-core

---

## 🎯 Core Flow Mapping

### ASPIRATION Layer (Where do I want to go?)
**Core Routes** (P0 - Must work perfectly):
- `/dashboard` — Central command, journey snapshot
- `/onboarding` — First-time user setup
- `/onboarding/quiz` — OIOS archetype discovery
- `/routes` — Route planning & exploration
- `/routes/[id]` — Route detail & customization
- `/routes/[id]/milestones` — Milestone tracking
- `/routes/[id]/timeline` — Timeline view
- `/routes/new` — Create new route

**Supporting Routes** (P1):
- `/routes/[id]/graph` — Visual route graph
- `/routes/[id]/risk` — Risk assessment
- `/routes/[id]/iterate` — Route iteration
- `/routes/[id]/settings` — Route configuration
- `/atlas` — Archetype exploration (post-quiz)

**Non-Core** (P2-P3 - Can be hidden/simplified):
- `/routes/[id]/milestones/[mid]` — Individual milestone detail (merge into milestones page)

---

### OPPORTUNITY Layer (What specific targets exist?)
**Core Routes** (P0):
- `/applications/opportunities` — Browse/search opportunities
- `/applications` — Active candidatures pipeline
- `/applications/[id]` — Candidature detail
- `/applications/new` — Create application from opportunity
- `/applications/calendar` — Deadline calendar view

**Supporting Routes** (P1):
- `/applications/watchlist` — Saved opportunities
- `/applications/simulator` — Opportunity cost simulator
- `/readiness/gate` — Submission gate check

**Non-Core** (P2-P3):
- `/applications/[id]/settings` — (merge into detail page)
- `/readiness/*` — Multiple readiness pages (consolidate)
  - `/readiness/[dimension]`
  - `/readiness/academic`
  - `/readiness/financial`
  - `/readiness/gaps`
  - `/readiness/history`
  - `/readiness/risk`
  - `/readiness/simulation`

---

### DOSSIER Layer (What do I need to prepare?)
**Core Routes** (P0):
- `/forge` — Dossier asset list (center of system)
- `/forge/[id]` — Document editor
- `/forge/[id]/export` — Export asset
- `/forge/new` — Create new asset
- `/tasks` — Task management (all views)

**Supporting Routes** (P1):
- `/forge/[id]/ats-optimizer` — ATS/compatibility optimization
- `/forge/[id]/analysis` — Content analysis
- `/forge/[id]/versions` — Version history
- `/forge/[id]/compare` — Version comparison
- `/forge/[id]/coach` — AI coaching
- `/forge/[id]/alignment` — Alignment check
- `/forge/[id]/competitiveness` — Competitiveness benchmark

**Non-Core** (P2-P3):
- `/forge/[id]/cv-builder` — (redundant with main editor?)
- `/forge-lab` — Experimental features
- `/forge-lab/[id]` — (consolidate into main forge)
- `/documents` — (duplicate of forge?)
- `/documents/new` — (duplicate of forge/new?)

---

### EXECUTION/PERFORMANCE Layer (How do I perform?)
**Core Routes** (P0):
- `/interviews` — Interview list & stats
- `/interviews/[id]` — Interview result detail
- `/interviews/[id]/session` — Live interview practice
- `/interviews/new` — Start new interview
- `/sprints` — Sprint planning
- `/sprints/[id]` — Sprint detail

**Supporting Routes** (P1):
- `/interviews/[id]/feedback` — Detailed feedback
- `/interviews/history` — Historical performance
- `/tools/pitch-lab` — Pitch practice
- `/sprints/new` — Create sprint

**Non-Core** (P2-P3):
- `/interviews/[id]/voice` — Voice-only interview (merge into session)
- `/interviews/question-bank` — Question library (nice-to-have)
- `/tools/budget-simulator` — Financial planning (separate tool)

---

## 🎮 Gamification & Social (P3 - Post-Revenue)
**All Non-Core** — Can be hidden or simplified until revenue validation:
- `/aura` — Aura companion (was `/companion`)
- `/aura/discover` — Aura discovery
- `/aura/achievements` — Achievement gallery
- `/aura/quests` — Quest system
- `/aura/leaderboard` — Leaderboard
- `/companion` — Old companion page (duplicate?)
- `/companion/achievements` — (duplicate?)
- `/companion/discover` — (duplicate?)
- `/companion/quests` — (duplicate?)
- `/guilds` — Guild system
- `/guilds/[id]` — Guild detail
- `/guilds/create` — Create guild
- `/community` — Community feed
- `/community/[id]` — Community item detail
- `/dashboard/gamification` — Gamification dashboard

**Action**: Hide these routes from main navigation. Keep accessible via direct URL for testing.

---

## 🛒 Marketplace (P1 - Revenue Critical)
**Core Routes** (P0):
- `/marketplace` — Provider directory
- `/marketplace/provider/[id]` — Provider profile
- `/marketplace/provider/[id]/book` — Booking flow
- `/marketplace/checkout` — Payment checkout

**Supporting Routes** (P1):
- `/marketplace/search` — Advanced search
- `/marketplace/category/[slug]` — Category browse
- `/marketplace/bookings` — My bookings
- `/marketplace/bookings/[id]` — Booking detail
- `/marketplace/messages` — Messaging inbox
- `/marketplace/messages/[id]` — Message thread

**Non-Core** (P2):
- `/marketplace/products/[slug]` — Product detail (if not using)
- `/marketplace/escrow` — Escrow management (admin-level)
- `/marketplace/provider/[id]/reviews` — Reviews (merge into profile)
- `/marketplace/provider/[id]/success` — Success page (simplify)

---

## 👤 Provider Dashboard (P1)
**Core Routes** (P0):
- `/provider` — Provider dashboard
- `/provider/bookings` — Manage bookings
- `/provider/earnings` — Earnings & payouts
- `/provider/onboarding` — Provider onboarding

**Supporting Routes** (P1):
- `/provider/services` — Service management
- `/provider/settings` — Provider settings

---

## 🏢 Institutional/Org (P2 - B2B Feature)
**All Non-Core** — B2B feature, not launch-critical:
- `/institutional` — Institutional landing
- `/institutional/dashboard` — Org dashboard
- `/org` — Organization management
- `/org/analytics` — Org analytics
- `/org/cohorts` — Cohort management
- `/org/members` — Member management
- `/org/settings` — Org settings

**Action**: Hide from main navigation. Keep for B2B pilot customers.

---

## ⚙️ Admin (P0 - Platform Operations)
**Core Routes** (P0):
- `/admin` — Admin dashboard
- `/admin/users` — User management
- `/admin/providers` — Provider verification
- `/admin/economics-intelligence` — Economics dashboard

**Supporting Routes** (P1):
- `/admin/analytics` — Platform analytics
- `/admin/organizations` — Org management
- `/admin/content` — CMS
- `/admin/ai` — AI/prompt management
- `/admin/observability` — Monitoring
- `/admin/audit` — Audit logs
- `/admin/moderation` — Content moderation
- `/admin/finance` — Financial operations
- `/admin/settings` — Admin settings

---

## 👤 User Profile & Settings (P1)
**Core Routes** (P0):
- `/profile` — User profile
- `/settings` — Account settings
- `/subscription` — Subscription management

**Supporting Routes** (P1):
- `/settings/billing` — Billing details
- `/subscription/checkout` — Subscribe flow
- `/subscription/manage` — Manage subscription
- `/subscription/usage` — Usage tracking

**Non-Core** (P2-P3):
- `/profile/psych` — Psychological profile (complex feature)
- `/profile/psych/*` — 10 sub-pages (anxiety, calibration, confidence, decisions, discipline, financial, goals, results, risk, summary)

**Action**: Simplify psych profile or hide until post-launch.

---

## 📚 Wiki & Knowledge Base (P1)
**Core Routes** (P1):
- `/wiki` — Wiki home
- `/wiki/[category]/[slug]` — Wiki article

---

## 🔧 Utility Routes (P2)
**Non-Core**:
- `/nudge-engine` — Nudge system (internal tool?)
- `/tools` — Tools landing page

---

## 🚨 Immediate Actions

### 1. Hide Non-Core Routes from Navigation (P0)
Remove from main nav, keep accessible via URL:
- All gamification routes (`/aura/*`, `/guilds/*`, `/community/*`)
- Institutional routes (`/institutional/*`, `/org/*`)
- Psych profile sub-pages (`/profile/psych/*`)
- Duplicate routes (`/companion/*`, `/documents/*`, `/forge-lab/*`)
- Experimental tools (`/nudge-engine`, `/tools`)

### 2. Consolidate Duplicate Routes (P0)
- `/companion/*` → `/aura/*` (already done by Codex?)
- `/documents/*` → `/forge/*`
- `/forge-lab/*` → `/forge/*`
- `/applications/[id]/settings` → merge into `/applications/[id]`
- `/routes/[id]/milestones/[mid]` → merge into `/routes/[id]/milestones`

### 3. Simplify Readiness Routes (P1)
Consolidate 7 readiness pages into 1-2:
- `/readiness` — Main readiness dashboard
- `/readiness/gate` — Submission gate (keep separate)
- Remove: `/readiness/[dimension]`, `/readiness/academic`, `/readiness/financial`, `/readiness/gaps`, `/readiness/history`, `/readiness/risk`, `/readiness/simulation`

### 4. Add Breadcrumbs to Core Routes (P1)
Show user position in ASPIRATION → EXECUTION flow:
```
Dashboard > Applications > Opportunity Detail > Create Dossier Asset
```

### 5. Audit Each Core Route for Clarity (P0)
Every P0 route must answer:
- **Why am I here?** (clear heading/subtitle)
- **What can I do?** (obvious CTAs)
- **Where do I go next?** (next step in flow)

---

## 📊 Route Priority Matrix

| Priority | Count | Action |
|----------|-------|--------|
| P0 (Core) | 45 | Polish, ensure clarity |
| P1 (Supporting) | 35 | Keep functional, lower nav priority |
| P2 (Non-Core) | 30 | Hide from nav, keep accessible |
| P3 (Post-Revenue) | 26 | Hide completely or mark "Coming Soon" |

**Total**: 136 routes

---

## 🎯 Success Criteria

- [ ] Main navigation shows only P0 routes (< 10 items)
- [ ] Every P0 route has clear framing (why/what/where)
- [ ] Breadcrumbs implemented on all P0 routes
- [ ] Duplicate routes consolidated or removed
- [ ] Non-core routes hidden but functional
- [ ] Build remains green throughout changes

---

**Next Steps**: Execute immediate actions, starting with navigation cleanup.
