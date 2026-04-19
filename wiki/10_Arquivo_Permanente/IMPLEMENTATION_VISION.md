# Olcan Compass v2.5 — Implementation Vision & Execution Plan

**Date**: April 17, 2026  
**Status**: Post-Codex Product Surface Pass — Build Green ✅  
**Mission**: Tighten the SaaS experience for the iceberg tipping point

---

## 🎯 Core Product Vision

### The Compass Operating System

Olcan Compass is **not a document builder** — it's an **operating system for professional internationalization**. The user journey flows through five integrated layers:

```
ASPIRATION → OPPORTUNITY → CANDIDATURE → DOSSIER → EXECUTION/PERFORMANCE
```

### Key Mental Models

1. **Start from the target, not the document**
   - Users input WHERE (scholarship, job, visa, dream)
   - System processes, orients, requests clarification
   - Output: Systematic dossier of todos, documents, information

2. **MECE Organization** (Mutually Exclusive, Collectively Exhaustive)
   - Logistic view (deadlines, calendars, Gantt)
   - Narrative view (story arc, coherence)
   - Performance view (interviews, networking events)
   - Psychological view (readiness gates, confidence tracking)

3. **Multi-Level Readiness**
   - Export-ready documents (PDF, DOCX, editable)
   - Pre-built structural responses for forms
   - Task structures (lists, Gantt, calendars)
   - Interview prep & networking management
   - All tied to one or many opportunities

4. **Three User Personas** (all MECE)
   - **End User** (aspiring professional)
   - **Provider** (curated expert in marketplace)
   - **Admin** (platform operator)

---

## 📊 What Codex Accomplished

### Product Surface Reframing ✅

| Page | Change |
|------|--------|
| `dashboard/page.tsx` | Framed as OS: aspiration → opportunity → candidature → forge/dossier → execution |
| `applications/page.tsx` | Repositioned candidatures as active pipeline with direct links to opportunities, Forge, tasks, interviews |
| `applications/opportunities/page.tsx` | "Start from target, not document" framing + applications originate from operationalized aspiration |
| `forge/page.tsx` | Repositioned as center of dossier, not just document list |
| `tasks/page.tsx` | Subtitle reflects operational execution of dossier |
| `interviews/page.tsx` | Reframed as performance layer of opportunity workflow |
| `forge/[id]/ats-optimizer/page.tsx` | Broadened ATS into compatibility lens for opportunity criteria |
| `forge/[id]/export/page.tsx` | Reframed as dossier asset export for editable downstream workflows |

### Verification ✅
- `pnpm --filter @olcan/web-v2.5 type-check` ✅
- `pnpm build:v2.5` ✅

---

## 🚀 Next Execution Slices (Priority Order)

### Phase 1: Tighten Remaining Non-Core Surfaces (P0)
**Goal**: Remove confusion, strengthen core narrative

#### 1.1 Route Discovery & Navigation Audit
- [ ] Audit all routes in `app/(app)/` for clarity
- [ ] Remove or hide non-core features (guilds, quests, achievements if not launch-critical)
- [ ] Ensure every page has clear "why am I here" framing
- [ ] Add breadcrumbs showing position in ASPIRATION → EXECUTION flow

#### 1.2 Clean Up Mock Data & Placeholders
- [ ] `export/page.tsx` — wire to real user data or show proper empty states
- [ ] `tools/pitch-lab/page.tsx` — remove "Mock" prefix, clean stats sidebar
- [ ] Audit all pages for `MOCK_`, hardcoded fake data, placeholder text
- [ ] Replace with real data hooks or intentional empty states

#### 1.3 Fix Remaining ESLint Warnings
- [ ] 49 unused-import warnings (quick cleanup, improves code quality)
- [ ] React Hooks dependency warnings (3-4 files)

---

### Phase 2: Make Forge Explicitly Multi-Asset & Opportunity-Bound (P0)
**Goal**: Forge is the dossier center — must feel like it

#### 2.1 Data Model Enhancement
```typescript
// Current: Document is standalone
interface Document {
  id: string;
  title: string;
  content: string;
  type: "resume" | "cover_letter" | "essay";
}

// Target: Document is bound to opportunities
interface DossierAsset {
  id: string;
  title: string;
  content: string;
  assetType: "resume" | "cover_letter" | "essay" | "form_response" | "reference_letter";
  
  // Opportunity binding
  opportunityIds: string[];  // Can serve multiple opportunities
  primaryOpportunityId?: string;
  
  // Readiness levels
  readinessLevel: "draft" | "review" | "export_ready" | "submitted";
  
  // Optimization metadata
  atsScore?: number;
  compatibilityScores?: Record<string, number>; // per opportunity
  lastOptimizedAt?: Date;
  
  // Version control
  versions: DocumentVersion[];
  activeVersionId: string;
}
```

#### 2.2 UI Changes
- [ ] Forge list view: Group by opportunity (not just chronological)
- [ ] Add "Create asset for [Opportunity Name]" flow
- [ ] Document detail: Show which opportunities this asset serves
- [ ] ATS optimizer: Show compatibility per-opportunity, not generic
- [ ] Export page: "Export dossier for [Opportunity]" grouped view

#### 2.3 Integration Points
- [ ] Applications detail page: "View dossier assets" button → filtered Forge view
- [ ] Opportunities page: "Start building dossier" → creates bound documents
- [ ] Tasks: Auto-generate document tasks when opportunity is created

---

### Phase 3: Rewrite E2E Test Suite Around Real Launch Journey (P1)
**Goal**: Confidence in core flows before staging

#### 3.1 Critical User Journeys to Test
1. **Aspiration → Opportunity → Dossier**
   - User creates aspiration (e.g., "PhD in AI at MIT")
   - System suggests opportunities
   - User selects opportunity → dossier scaffold created
   - Verify: Tasks, document templates, deadlines all auto-generated

2. **Forge Multi-Asset Workflow**
   - Create resume for Opportunity A
   - Optimize for ATS
   - Clone/adapt for Opportunity B
   - Export both as PDF and DOCX
   - Verify: Version control, compatibility scores, export quality

3. **Interview Preparation**
   - User has upcoming interview for Opportunity X
   - System surfaces relevant dossier assets
   - User practices with pitch lab
   - Verify: Context awareness, performance tracking

4. **Provider Marketplace**
   - User searches for visa consultant
   - Books session
   - Provider receives notification
   - Verify: Payment flow, calendar integration, communication

5. **Admin Operations**
   - Admin views economics dashboard
   - Approves provider verification
   - Monitors user funnel
   - Verify: Real-time data, no mock values

#### 3.2 Test Infrastructure
- [ ] Set up Playwright or Cypress
- [ ] Create test database seeding scripts
- [ ] Mock external APIs (Stripe, email) in test env
- [ ] CI/CD integration for automated runs

---

### Phase 4: Provider & Admin MECE Surfaces (P1)
**Goal**: Complete the three-persona system

#### 4.1 Provider Dashboard Enhancements
- [ ] Earnings & payout tracking (real data, not mocks)
- [ ] Client dossier preview (providers see relevant user assets with permission)
- [ ] Session scheduling with calendar sync
- [ ] Performance metrics (client satisfaction, booking rate)

#### 4.2 Admin Dashboard Enhancements
- [ ] Economics intelligence: Wire to real backend data
- [ ] User funnel analytics: Real conversion tracking
- [ ] Content moderation: Community feed, user-generated content
- [ ] Provider verification workflow: Document upload, approval flow

#### 4.3 Permissions & Security
- [ ] Audit all admin/provider endpoints for proper authorization
- [ ] Implement row-level security (RLS) in database
- [ ] Add audit logging for sensitive operations

---

## 🏗️ Foundation for Future AI Agents

### Documentation Standards
Every major component should have:

```typescript
/**
 * @component DossierAssetCard
 * @layer Forge / Dossier Management
 * @persona End User
 * 
 * @purpose
 * Displays a single dossier asset (resume, cover letter, etc.) with:
 * - Readiness level indicator
 * - Opportunity bindings
 * - Quick actions (edit, optimize, export)
 * 
 * @integration
 * - Reads from: forgeStore.documents
 * - Writes to: forgeStore.updateDocument
 * - Related: ApplicationDetailPage, OpportunitiesPage
 * 
 * @future_ai_context
 * When extending this component:
 * - Maintain opportunity binding display
 * - Preserve readiness level semantics
 * - Keep ATS score visible if available
 */
```

### Code Organization Principles
1. **Feature folders** over type folders
   ```
   ✅ /features/dossier/components/AssetCard.tsx
   ❌ /components/AssetCard.tsx
   ```

2. **Explicit dependencies** in package.json
   - No implicit peer deps
   - Lock file committed
   - Clear upgrade path

3. **Type safety everywhere**
   - No `any` without eslint-disable + comment
   - Shared types in `/types`
   - API contracts in `/lib/api-client`

4. **State management clarity**
   - One store per domain (forge, applications, interviews, etc.)
   - No cross-store direct access (use hooks)
   - Clear hydration guards

---

## 🎨 Design System Consistency

### Current State
- **Tokens**: `tokens.json` (brand, cream, clay, moss, sage, slate)
- **Components**: shadcn/ui + custom Glass components
- **Typography**: Heading hierarchy established
- **Spacing**: Consistent rounded corners, padding scale

### Enforcement
- [ ] Audit all pages for token usage (no hardcoded colors)
- [ ] Ensure all CTAs use GlassButton or Button with variant
- [ ] Standardize card styles (GlassCard vs Card usage)
- [ ] Mobile responsiveness check (all critical flows)

---

## 📦 Deployment Readiness Checklist

### Environment Variables
- [ ] All `.env.example` files up to date
- [ ] Production secrets documented (Stripe, SMTP, JWT)
- [ ] No hardcoded API keys in codebase

### Performance
- [ ] Lighthouse score > 90 on key pages
- [ ] Bundle size analysis (no bloated deps)
- [ ] Image optimization (Next.js Image component)
- [ ] API response caching strategy

### Monitoring
- [ ] Sentry error tracking configured
- [ ] Analytics events for key actions
- [ ] Uptime monitoring (backend health checks)

### Documentation
- [ ] README with setup instructions
- [ ] API documentation (Swagger/OpenAPI)
- [ ] User guide for core flows
- [ ] Provider onboarding guide

---

## 🧭 North Star Metrics

### User Success
1. **Time to First Dossier**: < 15 minutes from signup
2. **Opportunity Conversion**: % of opportunities → submitted applications
3. **Export Quality**: User satisfaction with exported documents
4. **Readiness Gate Pass Rate**: % passing submission gates

### Business Health
1. **Provider Utilization**: % of users booking sessions
2. **MRR Growth**: Monthly recurring revenue
3. **Churn Rate**: < 5% monthly
4. **NPS**: > 50

### Platform Quality
1. **Uptime**: 99.9%
2. **API Response Time**: p95 < 500ms
3. **Error Rate**: < 0.1%
4. **Build Success**: 100% on main branch

---

## 🔄 Handoff Protocol for Future Agents

### When picking up this work:

1. **Read this document first** — understand the vision
2. **Check build status** — `npm run build` must pass
3. **Review recent commits** — `git log --oneline -20`
4. **Identify current phase** — see priority order above
5. **Pick smallest atomic task** — ship incrementally
6. **Update this doc** — mark completed items, add learnings
7. **Keep build green** — never commit broken code

### Communication Style
- **Terse updates**: "Fixed X. Build green. Next: Y."
- **Link to code**: Use file citations `@/path/to/file.tsx:10-20`
- **Show, don't tell**: Code diffs > long explanations
- **Ask when blocked**: Don't guess on product decisions

---

## 📝 Session Log

### 2026-04-17: Codex Product Surface Pass
- ✅ Reframed 8 key pages with OS narrative
- ✅ Build passing, type-check clean
- 📝 Next: Tighten non-core surfaces, Forge multi-asset binding

### 2026-04-17: Cascade Continuation (This Session)
- 🔄 Reviewing Codex work
- 🔄 Creating implementation vision doc
- ⏭️ Next: Execute Phase 1 (route audit, mock cleanup, ESLint)

---

**Remember**: We're building an operating system for professional mobility, not a document editor. Every feature must serve the ASPIRATION → EXECUTION flow. Stay MECE. Keep the build green. Ship value.
