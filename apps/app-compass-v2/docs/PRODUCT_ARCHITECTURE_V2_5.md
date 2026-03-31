# Product Architecture v2.5

## Objective

Consolidate Olcan Compass v2.5 into a sustainable product architecture that supports:
- a clear microSaaS core
- modular feature development
- gamification as a retention layer rather than the product itself
- shared visual and domain primitives across app and marketing site
- future implementation by humans or AI without architectural drift

---

## Executive Product Thesis

Olcan Compass should not be built as a collection of visually rich experiences.
It should be built as a **career mobility operating system** with a **gamified companion shell**.

That distinction matters.

### Product core
The true product is the user's transition engine:
- diagnosis
- route selection
- execution planning
- document production
- interview readiness
- provider marketplace
- financial/economic tradeoff support

### Retention shell
The companion, characters, guilds, quests, inventory, achievements, and animations should operate as:
- motivation
- explanation layer
- emotional continuity
- habit reinforcement
- differentiated product identity

They should **amplify** the microSaaS core, not replace it.

---

## Current State Assessment

## What already exists and is valuable

### Strong product ingredients
- rich companion/archetype system
- psychology and route-oriented backend concepts
- document, interview, sprint, marketplace, and economics surfaces
- shared UI package for premium visual components
- marketing site being built in tandem with strong visual direction

### Strong emotional differentiation
- archetypes map user identity to product journey
- companion evolution creates narrative continuity
- gamification creates a sense of progress and ownership
- animations and character work can create a memorable brand moat

### Strong monetization potential
The current surfaces naturally support a microSaaS ladder:
- free assessment and route preview
- paid execution tools
- premium automation and intelligence
- marketplace commissions
- advisory upsells

---

## Main structural problems found

### 1. Multiple overlapping product spines
There are multiple app realities coexisting:
- a polished landing/public product narrative
- a dashboard/app shell with operational modules
- experimental standalone pages
- duplicated stores for similar concepts

Examples:
- `companionStore.ts` and `realCompanionStore.ts`
- `marketplace.ts` and `marketplaceStore.ts`
- separate navigation concepts
- mixed use of package imports and direct relative imports into package source

This creates ambiguity about what is canonical.

### 2. Domain logic is mixed with UI experimentation
A lot of product meaning currently lives inside:
- page components
- Zustand stores
- local computed logic
- visual feature components

That makes future AI/dev work fragile because behavior is spread across presentation layers.

### 3. Gamification is too horizontal and insufficiently tied to value delivery
Achievements, quests, guilds, and care loops exist, but they are not yet systematically tied to core user outcomes such as:
- completing diagnosis
- selecting a route
- creating strong documents
- finishing interview prep
- reaching application milestones
- booking verified providers

### 4. The backend exposes many valuable engines, but frontend product framing is not unified around them
The API already points to several strong product domains:
- psychology
- routes
- applications
- interviews
- sprints
- marketplace
- economics intelligence
- companions

But the frontend still presents these as partially separate features rather than one orchestrated journey engine.

### 5. Shared product primitives are not fully formalized
The marketing site and app should share:
- narrative primitives
- archetype language
- visual tokens
- product taxonomy
- onboarding funnels

Right now, these appear related, but not governed from one source of truth.

---

## Recommended Product Operating Model

Build Olcan Compass as 5 bounded product layers.

## Layer 1: Identity and Diagnosis
Purpose: understand the user and define the initial path.

Includes:
- onboarding
- psych/profile quiz
- archetype assignment
- fear cluster mapping
- motivator mapping
- readiness baseline
- route fit scoring

Canonical entities:
- UserProfile
- AssessmentProfile
- ArchetypeProfile
- MobilityIntent

Business role:
- activation
- personalization
- route conversion
- data for all downstream experiences

## Layer 2: Route OS
Purpose: translate identity into a strategic execution plan.

Includes:
- route recommendations
- route comparison
- milestones
- blockers
- timing
- risk and readiness
- economics scenarios

Canonical entities:
- Route
- RouteMilestone
- RouteConstraint
- RouteScenario
- RouteSignal

Business role:
- core product value
- habit loop anchor
- subscription justification

## Layer 3: Execution Engine
Purpose: help the user complete the work.

Includes:
- document forge
- interview simulator
- application management
- sprint system
- task completion
- readiness progression

Canonical entities:
- DocumentAsset
- InterviewSession
- Application
- Sprint
- Task
- ReadinessScore

Business role:
- recurring usage
- measurable progress
- strongest retention driver

## Layer 4: Trusted Services and Monetization
Purpose: connect execution to paid services and operational outcomes.

Includes:
- verified marketplace
- provider booking
- escrow/assurance
- premium plans
- upsell pathways

Canonical entities:
- Provider
- Booking
- EscrowFlow
- Offer
- SubscriptionPlan

Business role:
- revenue expansion
- margin leverage
- trust moat

## Layer 5: Motivation and Social Layer
Purpose: reinforce consistency and identity through emotion, status, and habit.

Includes:
- companion
- evolution
- quests
- achievements
- inventory
- guilds
- social rituals

Canonical entities:
- Companion
- CompanionState
- Achievement
- Quest
- Reward
- Guild
- Streak

Business role:
- retention
- differentiation
- emotional loyalty

Important rule:
This layer must always reference progress from Layers 1-4.
It should never become detached entertainment.

---

## Product Principle: Gamification Must Be Outcome-Coupled

### Good gamification
- gain XP for completing route milestones
- unlock companion abilities after real interview practice
- earn titles for submitting applications
- evolve companion when readiness thresholds are reached
- quests tied to product actions that create real user value

### Weak gamification
- actions that only farm points
- separate loops that do not improve migration outcomes
- artificial currencies with no clear product purpose
- social mechanics without clear mobility relevance

### Rule
Every gamified system should answer:
"What real user outcome does this reinforce?"

If no answer exists, it should not be a priority.

---

## Canonical Product Modules

These should become the bounded domains used by both roadmap and code organization.

## 1. `assessment`
Owns:
- onboarding
- psych evaluation
- archetypes
- motivators
- fear clusters
- profile completeness

## 2. `route_os`
Owns:
- route generation
- route progress
- route simulation
- milestones
- timing
- economics overlays

## 3. `execution`
Owns:
- forge
- applications
- interviews
- sprints
- readiness tasks

## 4. `marketplace`
Owns:
- providers
- listings
- bookings
- trust badges
- escrow

## 5. `gamification`
Owns:
- achievements
- quests
- streaks
- rewards
- progression economy

## 6. `companion`
Owns:
- companion identity
- evolution states
- care mechanics
- ability unlocks
- presence phenotype

## 7. `community`
Owns:
- guilds
- messaging
- collective missions
- social proof loops

## 8. `billing_growth`
Owns:
- plan gating
- upsells
- upgrades
- activation checkpoints
- lifecycle prompts

---

## Recommended Frontend Structure

The app should gradually move toward this structure:

```text
src/
  app/
    (public)/
    (auth)/
    (app)/
  modules/
    assessment/
      components/
      hooks/
      services/
      store/
      types/
    route-os/
    execution/
    marketplace/
    gamification/
    companion/
    community/
    billing-growth/
  shared/
    ui/
    lib/
    hooks/
    types/
    config/
  orchestration/
    product-journeys/
    event-mapping/
    entitlement-rules/
```

### Why this matters
Right now, stores act as both:
- local state manager
- domain layer
- API adapter
- business logic host

That is too much responsibility.

Instead:
- `modules/*/services` talk to APIs
- `modules/*/types` own contracts
- `modules/*/store` manages local UX state only
- orchestration layer coordinates cross-module product flows

---

## Store Consolidation Guidance

## Keep one canonical store per domain
Current duplication should be reduced.

### Companion
Choose one canonical implementation and retire the duplicate.
Current duplication:
- `companionStore.ts`
- `realCompanionStore.ts`

Recommendation:
- keep one `modules/companion/store/useCompanionStore.ts`
- move API calls into `modules/companion/services/companionService.ts`
- move achievement coupling out of core companion store unless it is truly companion-owned

### Marketplace
Current duplication:
- `marketplace.ts`
- `marketplaceStore.ts`

Recommendation:
- define one canonical marketplace domain store
- keep pricing, inventory, and economy models in one contract package

### Gamification
Current issue:
- separate achievement definitions exist in different places
- quest logic duplicated conceptually

Recommendation:
- create a single gamification rules module
- derive XP, streaks, rewards from domain events, not direct UI mutations

---

## Event-Driven Product Model

A sustainable product architecture should be event-driven.

Examples of canonical events:
- `assessment.completed`
- `archetype.assigned`
- `route.selected`
- `route.milestone.completed`
- `document.generated`
- `interview.session.completed`
- `application.created`
- `application.submitted`
- `marketplace.provider.booked`
- `companion.care.completed`
- `companion.evolved`
- `quest.completed`

### Why this matters
Then gamification, analytics, lifecycle nudges, and monetization can all subscribe to the same event stream.

That means:
- product metrics become consistent
- achievements unlock from real actions
- lifecycle prompts become contextual
- marketing site can echo real app milestones

---

## MicroSaaS Core Definition

The microSaaS core should be framed as:

### Core promise
"Turn migration and international mobility into a guided, adaptive operating system."

### Primary recurring value
Users keep paying because Compass continuously helps them:
- decide better
- execute faster
- reduce mistakes
- reduce uncertainty
- improve competitiveness
- access trusted services

### Subscription should not be sold as access to features only
It should be sold as access to:
- clarity
- progress
- confidence
- speed
- verified execution support

### Monetization layers
- subscription plans
- marketplace commissions
- premium diagnostics
- expert reviews
- concierge execution support

---

## Visual System Strategy Across App and Website

The marketing site and app should share the same product story.

## Shared visual primitives
- companion identity
- archetype language
- gradients and visual states
- progress metaphors
- liquid-glass UI treatments where appropriate
- trust/verification badges

## Marketing site role
The website should visualize:
- emotional aspiration
- proof
- companion metaphor
- route clarity
- transformation story

## Product app role
The app should operationalize:
- assessment
- milestones
- daily progress
- execution workflows
- premium conversion points

### Rule
Marketing visuals should preview product truth.
They should not promise experiences the app cannot operationalize.

---

## Companion Strategy

The companion should be treated as a **product interface metaphor**, not just a mascot.

It should represent:
- the user's profile and state
- current route confidence
- execution energy
- growth readiness
- unlocked capabilities

### Companion should be connected to real system signals
Examples:
- route progress affects companion evolution
- document completion affects companion confidence/presence
- interview practice affects companion poise
- missed milestones affect energy or state

### Companion should not depend mainly on abstract pet care
Care interactions are useful, but should be secondary.
Primary progression should come from meaningful product progress.

---

## Guild and Social Strategy

Guilds should not be generic communities.
They should be organized around meaningful migration identity or goals:
- country target
- career track
- scholarship path
- documentation stage
- interview readiness stage

### Good guild jobs
- accountability
- peer proof
- milestone rituals
- practical advice exchange
- cohort motivation

### Weak guild jobs
- generic social feed
- chat without shared execution context

---

## Technical Consolidation Rules

## Rule 1
Do not import package internals directly using relative source paths.
Example currently seen:
- direct imports from package source under `../../packages/...`

Recommendation:
- export public components from `@olcan/ui-components`
- consume only public package entrypoints

## Rule 2
Move business rules out of page components.
Pages should compose modules, not define domain logic.

## Rule 3
Keep animation and visual experimentation behind reusable components.
Characters, motion states, and visual layers should be componentized and parameterized.

## Rule 4
Separate canonical data contracts from display variants.
A companion entity should have one canonical type.
UI projections may differ, but contracts should not.

## Rule 5
Promote shared taxonomies into a single source of truth.
Examples:
- archetypes
- evolution stages
- reward types
- quest categories
- plan entitlements

---

## What to Build Next

### Highest priority
1. canonical domain map
2. canonical data contracts
3. store consolidation
4. event taxonomy
5. entitlement model
6. shared design/token strategy across app and marketing site

### Only after that
7. deeper animation systems
8. advanced guild mechanics
9. more currencies/items
10. richer companion cosmetics

---

## Final Direction

Olcan Compass should become:
- a mobility execution operating system
- wrapped in a distinctive companion-led identity layer
- monetized like a disciplined microSaaS
- extended through modular domains
- visualized consistently across marketing and product surfaces

The app already contains the ingredients.
The next phase should focus less on adding isolated features and more on **making one coherent product system**.
