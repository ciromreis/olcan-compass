# Implementation Roadmap v2.5

## Goal

Turn the current Olcan Compass codebase into a sustainable, modular, product-oriented platform that can be developed incrementally without losing strategic coherence.

---

## Phase 0: Freeze the Product Spine

Before building more features, define the canonical truth.

## Deliverables
- canonical module map
- canonical event taxonomy
- canonical domain contracts
- canonical entitlement map
- canonical store ownership map

## Required decisions

### 1. Canonical domains
Adopt these domains:
- assessment
- route_os
- execution
- marketplace
- companion
- gamification
- community
- billing_growth

### 2. Canonical source of truth per domain
Examples:
- one store per domain
- one service layer per domain
- one type contract set per domain

### 3. Product KPI map
Track these as top-level metrics:
- onboarding completion rate
- diagnosis completion rate
- first route selected
- first milestone completed
- first document generated
- first interview session completed
- first application created
- first marketplace conversion
- D7 retained users
- free to paid conversion

---

## Phase 1: Consolidate Data and State

This phase is the most important technical cleanup.

## 1. Companion domain consolidation
Current issue:
- duplicate companion stores
- mixed business logic and UI logic

### Actions
- choose one canonical companion store
- move API logic into a companion service layer
- define canonical `Companion`, `CompanionProgress`, `CompanionActivity` contracts
- ensure companion progression is driven by product events

### Target shape
```text
modules/companion/
  services/companionService.ts
  store/useCompanionStore.ts
  types.ts
  selectors.ts
  components/
```

## 2. Marketplace consolidation
Current issue:
- overlapping marketplace stores
- unclear distinction between economy, inventory, listings, and conversion

### Actions
- separate marketplace browsing from economy/inventory logic
- define one marketplace domain contract
- define monetization events and trust states

## 3. Gamification consolidation
Current issue:
- achievements and quests are defined in multiple places with overlap
- progression is partly UI-driven rather than event-driven

### Actions
- create a single rules engine module for rewards
- map achievements to product events
- make quests generate from route and execution state
- unify XP, currency, titles, streaks, and unlock logic

## 4. Shared type contracts
### Actions
- centralize archetype, stage, reward, quest, and marketplace taxonomies
- ensure frontend/backend naming compatibility
- create migration notes for inconsistent fields

---

## Phase 2: Introduce Orchestration Layer

The current app has strong features but weak orchestration.

## Purpose
Create a layer that coordinates user journey logic across domains.

### New orchestration responsibilities
- onboarding completion rules
- first-time user activation sequence
- plan gating and upgrade prompts
- cross-domain progress updates
- event publishing for analytics/gamification

### Example orchestrated journeys

#### Journey 1: New user activation
- user completes onboarding
- archetype assigned
- first route recommended
- companion created
- first quest generated
- upsell prompt withheld until route confidence established

#### Journey 2: Execution activation
- route milestone reached
- forge recommended
- sprint started
- interview prep unlocked
- companion progression updated

#### Journey 3: Monetization trigger
- user reaches execution friction point
- verified provider recommendations surface
- marketplace conversion prompt appears
- premium diagnostics or coaching presented

---

## Phase 3: Reframe the App Navigation Around Product Outcomes

Current navigation is broad and feature-heavy.
It should be structured around user jobs.

## Recommended top-level navigation
- Today
- My Route
- Execution
- Companion
- Services
- Community
- Profile

### Mapping
- Today: dashboard, next best actions, streaks, blockers
- My Route: recommendations, scenarios, milestones, timing, economics
- Execution: documents, interviews, applications, sprints
- Companion: identity, evolution, achievements, rituals
- Services: marketplace, providers, bookings, escrow
- Community: guilds, cohorts, shared missions

### Why this is better
It aligns product with outcomes, not internal feature teams.

---

## Phase 4: Connect Gamification to Real Product Value

## Replace detached loops with value-coupled loops

### Companion progression should come from:
- assessment completion
- route confidence increase
- milestone completion
- document quality improvements
- interview readiness improvements
- application consistency

### Quests should primarily be:
- complete profile section
- finish route comparison
- complete one interview session
- submit one application draft
- book one verified provider
- maintain weekly execution cadence

### Achievements should celebrate:
- clarity
- readiness
- consistency
- momentum
- real-world execution

---

## Phase 5: Shared System Between Marketing Site and Product App

The marketing site and product app should share a product grammar.

## Shared assets to formalize
- archetype copy and semantics
- companion narrative states
- visual token system
- trust badge system
- plan and offer language
- event names for analytics

## Recommended shared package evolution
The current `@olcan/ui-components` package should eventually be complemented by lighter shared packages:

```text
packages/
  ui-components/
  product-taxonomy/
  design-tokens/
  event-schema/
```

### Suggested ownership
- `ui-components`: reusable visual components
- `product-taxonomy`: archetypes, stages, rewards, categories
- `design-tokens`: colors, gradients, spacing, animation primitives
- `event-schema`: analytics and gamification event names/payloads

---

## Phase 6: Monetization Discipline

The current product has many monetizable surfaces.
These should be simplified into a clean monetization ladder.

## Plan structure

### Free
- basic diagnosis
- one route preview
- limited execution actions
- companion onboarding

### Pro
- full route OS
- forge access
- interview simulator
- sprint planning
- deeper companion evolution

### Premium / Concierge
- advanced economics
- premium provider access
- expert review workflows
- concierge-style execution help

### Marketplace revenue
- service commissions
- verification/trust premium layers
- premium provider placement

### Key rule
Monetization should unlock execution leverage, not cosmetic noise.

---

## Phase 7: Animation and Character Systems

These are important, but only after product structure is stable.

## Use animations to support these jobs
- explain system state
- celebrate meaningful milestones
- reinforce identity and confidence
- make progression emotionally legible

## Do not use animation to compensate for product ambiguity
If a workflow is unclear, animation will not fix it.

## Recommended animation domains
- companion idle states
- companion evolution ceremonies
- milestone completion moments
- route clarity transitions
- premium/trust state emphasis

---

## Suggested Code Reorganization Sequence

## Step 1
Document and mark canonical stores.

## Step 2
Create service layers for duplicated domains.

## Step 3
Move duplicate rule definitions into module-owned files.

## Step 4
Introduce shared event schema.

## Step 5
Refactor navigation around product jobs.

## Step 6
Refactor pages to become composition shells.

## Step 7
Extract shared cross-surface primitives for the marketing site.

---

## Implementation Priorities by Impact

## Highest impact / lowest regret
1. consolidate stores
2. unify contracts
3. create event taxonomy
4. align gamification with outcomes
5. clean navigation and information architecture

## Medium-term leverage
6. shared packages for taxonomy/tokens/events
7. route-oriented dashboard orchestration
8. entitlement model for plans
9. verified services monetization model

## Later
10. advanced guild mechanics
11. cosmetics economy
12. richer collectible systems
13. extended animation theatre

---

## Immediate Tactical Recommendations

These are the best next concrete moves for the codebase.

### Recommendation 1
Create a `docs/` folder inside `app-compass-v2` and keep product strategy there.

### Recommendation 2
Replace generic app README with a product-aware README that explains:
- what the app is
- what domains exist
- what is canonical
- what is experimental

### Recommendation 3
Mark each current store as one of:
- canonical
- transitional
- experimental
- deprecated

### Recommendation 4
Build a small event map document before refactoring code.

### Recommendation 5
Define one canonical source for archetypes and evolution vocabulary.

---

## Future AI Handoff Notes

A future AI should follow these constraints:

### Must preserve
- product-first architecture
- modular domain ownership
- companion as an interface metaphor
- gamification tied to real value
- shared visual consistency with the marketing site

### Must avoid
- adding duplicate stores
- embedding domain rules inside pages
- creating isolated gamified mechanics unrelated to outcomes
- importing private package internals directly
- adding new modules before module ownership is clarified

### Preferred implementation style
- module-first
- event-driven
- typed contracts
- orchestration over ad hoc coupling
- shared packages for cross-surface primitives

---

## Final Product Direction

The next milestone for Olcan Compass is not more features.
It is **product coherence**.

If the team consolidates around:
- one core operating model
- one modular architecture
- one cross-surface product language
- one event-driven progression system

then all the existing ambition around characters, gamification, market systems, and execution workflows will become much easier to ship sustainably.
