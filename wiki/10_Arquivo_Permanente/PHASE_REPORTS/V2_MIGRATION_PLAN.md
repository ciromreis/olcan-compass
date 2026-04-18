# Olcan Compass V2 Migration Plan

**Created:** 2026-03-06 | **Source:** V2_PRD_AI_Handover.md | **Status:** Planning

---

## 0. V1 to V2 GAP ANALYSIS

### V1 Current State
- **FE:** Vite + React 18 SPA (no SSR/SEO)
- **Style:** Dark "Void" MMXD (navy/cyan), Merriweather Sans + Source Sans 3
- **BE:** Python 3.12 / FastAPI / SQLAlchemy 2.0 async
- **DB:** Plain PostgreSQL (no pgvector, no RLS)
- **Auth:** Custom JWT (access + refresh tokens)
- **AI:** Placeholder endpoints only (no real LLM)
- **Jobs:** None (inline processing)
- **Payments:** None (escrow models exist, no Stripe)
- **Screens:** ~25 total
- **Services:** opportunity_cost, deterministic_pruner, temporal_matching, scenario_optimization, escrow, credentials

### V2 Target State
- **FE:** Next.js 14 App Router (SSR + Server Components for SEO)
- **Style:** "Clinical Boutique" Premium Light (Moss/Clay/Cream), Plus Jakarta Sans + Cormorant Garamond
- **BE:** FastAPI (keep + enhance) with event-driven Inngest layer
- **DB:** Supabase PostgreSQL + pgvector + Row Level Security
- **Auth:** Supabase Auth (GoTrue)
- **AI:** Vertex AI Gemini 1.5 Pro, Vercel AI SDK, RAG pipeline, Pydantic schema enforcement
- **Jobs:** Inngest / Trigger.dev for background orchestration
- **Payments:** Stripe Connect (Escrow, subscriptions)
- **Screens:** 148 total (+123 new)
- **Viz:** Three.js / D3.js / WebGL for 3D route maps

---

## 1. PHASE 0: PRE-MIGRATION FOUNDATION (Week 0)

### 1.1 Repo Restructure
- [ ] Init `apps/web-v2` with create-next-app@14 (App Router, TS, Tailwind)
- [ ] Create `packages/design-tokens/` with V2 palette
- [ ] Create `packages/ui/` shared component library
- [ ] Set up pnpm workspaces at root
- [ ] Freeze `apps/web` (V1) for rollback safety

### 1.2 Supabase Setup
- [ ] Create Supabase project
- [ ] Export V1 PostgreSQL schema
- [ ] Enable pgvector extension
- [ ] Plan data migration script (V1 Postgres -> Supabase)
- [ ] Configure Supabase Auth (email/password provider)

### 1.3 RLS Policy Design
Tables needing RLS: users, psych_profiles, constraint_profiles, routes, route_milestones, narratives, narrative_versions, interview_sessions, user_applications, user_sprints, sprint_tasks, provider_profiles, service_listings, bookings, escrow_transactions, conversations, messages.

Core policies:
- Users read/write own data only
- B2B HR sees anonymized cohort data only
- Providers see own services/bookings only
- Admin full access

---

## 2. PHASE 1: DESIGN SYSTEM and UX PIVOT (Weeks 1-2)

### 2.1 V2 Design Tokens

**Color Palette (Premium Light):**
- Moss Primary: #2E4036 (actions, active states)
- Clay Accent: #CC5833 (CTAs, urgency)
- Cream Background: #F2F0E9 (page bg)
- Surface: #FFFFFF (cards)
- Charcoal: #1A1A1A (text primary)
- Text Secondary: #686352

**Typography:**
- Headings: Plus Jakarta Sans (tight structural tracking)
- Emphasis: Cormorant Garamond italic (dramatic emphasis)
- Body: Inter (clean readability)
- Code: JetBrains Mono

**Visual Texture:**
- CSS noise overlay (SVG turbulence at 0.05 opacity)
- Glassmorphism on cream/white: backdrop-filter blur(20px)
- +40% negative space vs V1

### 2.2 UI Component Migration

Port and redesign all V1 components:
- Button -> Moss primary, Clay accent, cream ghost variants
- Card -> White surface, subtle shadow (no dark glass)
- Input -> Charcoal borders, cream bg
- Modal -> Replace with Drawer/Sheet for heavy content
- Progress -> Moss/Clay gradient fills
- Badge, Alert, Select, Sidebar, BottomTabBar -> Light theme

New V2-only components:
- Drawer (frosted-glass sliding panel for Marketplace)
- NoiseSurface (textured background wrapper)
- BentoGrid (mobile-first data grid)
- DiagnosticShuffler (3 glassmorphic spring-bounce cards)
- TickingOdometer (animated COI counter)
- LiquidSlider (drag-based priority balancer)
- FocusEditor (full-screen distraction-free Tiptap editor)
- TelemetryTypewriter (AI thought-process sidebar)
- EKGWaveform (speech pacing visualizer)

### 2.3 Layout and Navigation

**Public routes (Server Components for SEO):**
Landing, How it Works, Route Explorer, Pricing, Marketplace Preview, B2B, FAQ, About, Blog, Legal, Login, Register, Provider Signup, Org Signup, Password Reset, Email Verify (15+ pages)

**Authenticated routes:**
- /dashboard - "Next Domino" Command Center
- /profile - Merged Psych + Mobility Profile
- /routes - DAG Topographical Map
- /readiness - Diagnostic Shuffler + Gaps
- /forge - Artifact Forge (Focus Editor)
- /interviews - Performance Simulator (Pressure Matrix)
- /applications - Application Tracker + Submission Gates
- /marketplace - Contextual Mentor Matchmaking
- /shop - E-Commerce (First 48 Hours)
- /settings - Account settings
- /admin - Admin panel (role-gated)

Actions:
- [ ] Create Next.js App Router folder structure
- [ ] Build (public) layout with marketing nav
- [ ] Build (app) layout with authenticated sidebar
- [ ] Implement Next.js middleware for auth protection
- [ ] Create mobile BentoGrid dashboard layout

---

## 3. PHASE 2: AUTH and DATABASE MIGRATION (Weeks 2-3)

### 3.1 Supabase Auth Integration

V1 flow: POST /api/auth/login -> JWT tokens -> localStorage -> Axios interceptor
V2 flow: Supabase Client SDK -> Supabase session -> RLS at DB level

**Backend changes:**
- [ ] Replace `app/core/auth.py` get_current_user with Supabase JWT validation
- [ ] Replace `app/core/security/` password hashing with Supabase Auth
- [ ] Remove custom JWT creation/refresh logic
- [ ] Add Supabase service_role key for admin operations
- [ ] Update all route dependencies from custom auth to Supabase auth

**Frontend changes:**
- [ ] Install @supabase/supabase-js and @supabase/auth-helpers-nextjs
- [ ] Replace Zustand auth store with Supabase session management
- [ ] Replace Axios JWT interceptor with Supabase auth headers
- [ ] Build login/register pages using Supabase Auth UI or custom forms
- [ ] Implement auth middleware in Next.js

### 3.2 pgvector Extension

- [ ] Enable pgvector in Supabase: CREATE EXTENSION vector;
- [ ] Add vector columns to existing tables
- [ ] Create new vector tables:
  - opportunity_vectors (embedding 1536-dim for visa/job/university programs)
  - user_vectors (periodic embedding of user CV + skills)
  - rag_knowledge_base (ground-truth chunks for AI factual retrieval)
- [ ] Create Alembic migration for all vector tables
- [ ] Build embedding generation pipeline (Vertex AI text-embedding)

### 3.3 Schema Enhancements

New/modified tables for V2:
- [ ] Add financial_baseline_brl, target_salary_usd to users table
- [ ] Add node_type enum (UPLOAD, AI_GENERATION, PAYMENT, MANUAL_CHECK) to milestones
- [ ] Add dependencies JSONB to milestones (DAG support)
- [ ] Add stalled_since timestamp to user_route_state
- [ ] Add certainty_score decimal to routes
- [ ] Create escrow_transactions table with stripe_pi_id
- [ ] Create subscription tables (plans, user_subscriptions, invoices)
- [ ] Create organizations table for B2B

---

## 4. PHASE 3: CORE ENGINES (Weeks 3-5)

### 4.1 Economics Engine (Backend)

Formulas to implement in FastAPI:

**A. Certainty Score:**
Cs = P(V) * (1 - Gf/Ct) * Ri
- P(V) = base visa probability
- Gf = financial gap
- Ct = total target capital
- Ri = behavioral readiness index

**B. Cost of Inaction (COI):**
COI_daily = ((S_target * FX_rate) - S_current) / 365
- Already partially built in opportunity_cost.py
- Need: real-time FX rate API integration
- Need: surface to dashboard TickingOdometer

**C. Dynamic Readiness Score:**
R_score = (sum(wi * Mi)) * (1 - P_penalty(Tc))
- wi = dimension weights
- Mi = milestone completion per dimension
- P_penalty = exponential penalty near deadline

**D. Provider Effectiveness Index (PEI):**
PEI = sum(R_post - R_pre) / N_sessions

Actions:
- [ ] Enhance opportunity_cost.py with real FX API (e.g., exchangerate-api.com)
- [ ] Create certainty_score_service.py
- [ ] Create readiness_score_service.py
- [ ] Create provider_effectiveness_service.py
- [ ] Create API endpoints: GET /api/v2/economics/certainty-score, GET /api/v2/economics/coi, GET /api/v2/economics/readiness
- [ ] Wire COI to dashboard TickingOdometer component

### 4.2 DAG Routing Engine (Backend)

V1: Linear milestone checklists
V2: Directed Acyclic Graph with branching, pruning, recalculation

Actions:
- [ ] Add dependencies field to RouteMilestoneTemplate model
- [ ] Implement topological sort for critical path calculation
- [ ] Create POST /api/v2/routes/calculate (recalculate DAG on constraint change)
- [ ] Create algorithmic pruning: when budget changes, grey out invalid nodes
- [ ] WebSocket endpoint for real-time DAG updates
- [ ] Implement "Pivot Nudge" logic (macro-economic shock -> route recalculation)

### 4.3 Psychological Engine (Backend Enhancement)

V1: Basic assessment with scoring
V2: Continuous behavioral assessment that adapts UI tone

Actions:
- [ ] Expand psych assessment to 9 blocks (Intro, Context, Confidence, Risk, Discipline, Decision, Interview Anxiety, Goal Clarity, Financial Stress)
- [ ] Create PsychInteractionConfig payload (adapts UI tone per 5400 state permutations)
- [ ] Create archetype generation (e.g., "Structured High Confidence", "High Anxiety High Potential")
- [ ] Emit PsychProfileCreatedEvent for UI adaptation
- [ ] Store fear_cluster in psych profile

### 4.4 Frontend: Command Center Dashboard

Replace current data-dump dashboard with "Next Domino" philosophy:
- [ ] Single massive card: user's immediate next action
- [ ] TickingOdometer widget: COI metric
- [ ] DiagnosticShuffler: 3 cards (Visa Probability, Financial Gap, Narrative Coherence)
- [ ] Certainty Score gauge
- [ ] Readiness Score progress
- [ ] Quick action shortcuts

### 4.5 Frontend: Topographical Route Map

- [ ] Install Three.js or D3.js
- [ ] Create DAG visualizer component (pan, zoom, node interaction)
- [ ] Implement "Algorithmic Pruning Animation" (invalid nodes crumble/grey out)
- [ ] Wire to WebSocket for real-time updates
- [ ] Mobile: simplified vertical DAG timeline

---

## 5. PHASE 4: AI AUTONOMOUS AGENTS (Weeks 5-7)

### 5.1 AI Infrastructure

- [ ] Set up Google Vertex AI project + credentials
- [ ] Install Vercel AI SDK in Next.js
- [ ] Create Python AI middleware service (app/services/ai/)
- [ ] Build RAG pipeline:
  - Curate rag_knowledge_base (visa requirements, deadlines, cost-of-living)
  - Build embedding indexer (chunk text -> pgvector)
  - Build retrieval function (cosine similarity search)
- [ ] Implement Pydantic "Air-Gap" schema enforcement on all AI outputs
- [ ] Build retry engine: if AI breaks schema, auto-retry with strict prompt
- [ ] Implement PII masking pipeline (scrub names/addresses before sending to AI)

### 5.2 The Artifact Forge (Narrative Engine V2)

V1: Basic Textarea + CRUD
V2: Full-screen Tiptap editor with AI copilot

- [ ] Install Tiptap rich-text editor
- [ ] Build FocusEditor component (distraction-free, Notion-like blocks)
- [ ] Build TelemetryTypewriter sidebar (streams AI thought process)
- [ ] Create WebSocket endpoint: ws://api/v2/ai/forge-stream
- [ ] Implement real-time text analysis:
  - Clarity score, Specificity score, Emotional Resonance
  - "Olcan Score" (0-100)
  - Semantic highlighting (orange = fluff/cliches, green = strong metrics)
- [ ] AI drafting via 3-question chat interface (not blank textarea)
- [ ] Target-country context (e.g., "German ATS optimization")
- [ ] BE: POST /api/v2/ai/generate-document (RAG + Gemini + Pydantic schema)

### 5.3 Adaptive Performance Simulator (Interview V2)

V1: Text-based Q&A with timer
V2: Voice + text, EKG waveform, escalating difficulty

- [ ] Implement browser Speech-to-Text (Web Speech API)
- [ ] Build EKGWaveform component (tracks pacing, pauses, confidence)
- [ ] Build "Pressure Matrix" split-screen UI
- [ ] Create WebSocket: ws://api/v2/ai/interview-stream
- [ ] Implement scoring: confidence_projection, delivery_score, hesitation_index
- [ ] Implement difficulty escalation based on resilience_index
- [ ] Post-session radar chart comparing user vs benchmark
- [ ] Auto-trigger: if interview_anxiety_score critical -> surface Marketplace

### 5.4 Real-Time Translation Widget (New)

- [ ] Build floating frosted-glass overlay (draggable)
- [ ] Integrate WebRTC for live call capture
- [ ] Implement simultaneous transcription
- [ ] Suggested translated replies
- [ ] Note: This is a Phase 5+ feature, lower priority

---

## 6. PHASE 5: MARKETPLACE and PAYMENTS (Weeks 7-9)

### 6.1 Stripe Connect Integration

- [ ] Set up Stripe Connect account
- [ ] Create POST /api/v2/marketplace/escrow/fund (hold funds)
- [ ] Create POST /api/v2/marketplace/escrow/release (on milestone completion)
- [ ] Create POST /api/v2/marketplace/escrow/refund
- [ ] Build 1-Click Escrow Booking UI in Marketplace Drawer
- [ ] Wire escrow status to booking state machine

### 6.2 Event-Driven Marketplace Triggers (Inngest)

- [ ] Set up Inngest project + Python SDK
- [ ] Workflow A: "Stalled User" Trigger
  1. Event: route.node.status = STALLED > 72 hours
  2. Calculate COI loss during stall period
  3. pgvector match 3 relevant mentors
  4. Push notification + email: "You've lost R$X. Hire expert to unblock."
- [ ] Workflow B: Macro-Economic Shock
  1. Event: macro.policy.updated (e.g., H1B pause)
  2. Find all users on affected route
  3. Recalculate DAG, propose pivot
  4. UI "Pivot Nudge" on next login
- [ ] Workflow C: Low Score Alert
  1. Event: interview.score.low or narrative.score.low
  2. Surface 3 relevant coaches via Marketplace
- [ ] Build "Liquid Metal Intervention Drawer" (CSS conic-gradient, frosted glass)
- [ ] Contextual framing based on psych profile

### 6.3 Subscription System

- [ ] Create subscription tables (plans, user_subscriptions)
- [ ] Tiers: Lite/Free, Core, Pro, Intensive/Premium
- [ ] Stripe Checkout integration
- [ ] Feature gating middleware (check tier before allowing access)
- [ ] Build pricing page, plan comparison, checkout flow
- [ ] Build upgrade/downgrade/cancellation flows

---

## 7. PHASE 6: E-COMMERCE and B2B (Weeks 9-11)

### 7.1 E-Commerce: "First 48 Hours" Supply Drop

- [ ] Create digital_products table (eSIMs, adapters, guides)
- [ ] Integrate headless commerce API or affiliate links (Airalo, Amazon)
- [ ] Build "Survival Carousel" component (horizontal scroll, product cards)
- [ ] Wire to route status: show when status = RELOCATING
- [ ] Create Infoproduct Hub for digital playbooks

### 7.2 B2B Enterprise Dashboard

- [ ] Create organizations table + org_members
- [ ] Build Corporate Relocation Dashboard (anonymized cohort heatmaps)
- [ ] Build University Pipeline Aggregator (pre-vetted candidate leads)
- [ ] Implement seat-based licensing
- [ ] RLS: org members see only their cohort data

### 7.3 Credential and Bureaucratic Services

- [ ] Credential Revalidation Pipeline (WES, NARIC tracking)
- [ ] "Pizza Tracker" visualizer for document processing
- [ ] Sworn Translation Hub (OCR upload -> marketplace routing)
- [ ] Visa Application Processing (automated form-filling)
- [ ] Cross-Border Financial Setup guidance

---

## 8. PHASE 7: POLISH, TESTING, DEPLOYMENT (Weeks 11-13)

### 8.1 Testing

- [ ] Unit tests for all Economics Engine formulas
- [ ] Integration tests for AI pipeline (schema validation, retry)
- [ ] E2E tests with Playwright (auth flow, dashboard, route DAG, forge, interview)
- [ ] Visual regression tests (Storybook + Chromatic)
- [ ] Load testing for WebSocket endpoints
- [ ] Security audit (RLS policies, PII masking, API keys)

### 8.2 Performance

- [ ] Lighthouse audit (target 90+ for public pages)
- [ ] Bundle analysis and code splitting
- [ ] Image optimization (Next.js Image component)
- [ ] Edge caching for public pages
- [ ] Database query optimization (indexes, materialized views)

### 8.3 Deployment

- [ ] Frontend: Vercel (Next.js native, Edge Functions)
- [ ] Backend: Railway / Fly.io / Cloud Run (FastAPI)
- [ ] Database: Supabase managed PostgreSQL
- [ ] Redis: Upstash (caching, rate limiting)
- [ ] CI/CD: GitHub Actions (lint, test, deploy)
- [ ] Monitoring: Sentry (errors), Vercel Analytics (performance)
- [ ] Feature flags for gradual V2 rollout

---

## 9. FILE-LEVEL CHANGE INVENTORY

### Backend (apps/api/) - Files to MODIFY

| File | Changes |
|------|---------|
| `app/main.py` | Add Inngest webhook endpoint, Supabase init |
| `app/core/auth.py` | Replace JWT validation with Supabase JWT |
| `app/core/config.py` | Add Supabase, Vertex AI, Stripe, Inngest settings |
| `app/db/session.py` | Update connection to Supabase PostgreSQL |
| `app/db/models/user.py` | Add financial_baseline_brl, target_salary_usd |
| `app/db/models/route.py` | Add dependencies JSONB, node_type enum, stalled_since |
| `app/db/models/economics.py` | Add certainty_score tracking, subscription models |
| `app/api/routes/ai.py` | Replace placeholders with real Vertex AI integration |
| `app/api/routes/routes.py` | Add DAG calculation, WebSocket, pruning endpoints |
| `app/api/routes/marketplace.py` | Add Stripe escrow, contextual matching |
| `app/services/opportunity_cost.py` | Add real FX API, enhance COI calculation |
| `app/services/escrow.py` | Wire to Stripe Connect |

### Backend - Files to CREATE

| File | Purpose |
|------|---------|
| `app/services/ai/vertex_client.py` | Vertex AI Gemini client wrapper |
| `app/services/ai/rag_pipeline.py` | RAG retrieval + embedding generation |
| `app/services/ai/schema_enforcer.py` | Pydantic air-gap validation + retry |
| `app/services/ai/pii_masker.py` | PII scrubbing before AI calls |
| `app/services/certainty_score.py` | Certainty Score formula service |
| `app/services/readiness_score.py` | Dynamic Readiness Score service |
| `app/services/provider_effectiveness.py` | PEI calculation service |
| `app/services/dag_engine.py` | DAG topological sort + critical path |
| `app/services/inngest_workflows.py` | Stalled user, macro shock, low score |
| `app/services/stripe_service.py` | Stripe Connect escrow integration |
| `app/services/subscription_service.py` | Subscription management |
| `app/db/models/vector_tables.py` | pgvector models (opportunity, user, RAG) |
| `app/db/models/subscription.py` | Plans, user subscriptions, invoices |
| `app/db/models/organization.py` | B2B org tables |
| `app/api/routes/economics_v2.py` | V2 economics endpoints |
| `app/api/routes/subscriptions.py` | Subscription endpoints |
| `app/api/routes/organizations.py` | B2B org endpoints |
| `app/api/routes/websockets.py` | WS endpoints for DAG, Forge, Interview |

### Frontend (apps/web-v2/) - Full New Build

All 148 screens listed in PRD Section 3 "Exhaustive Screen and Modal Inventory":
- Public and Auth Layer: 25 screens
- Core Engines: 62 screens
- Marketplace, Monetization, Admin: 41 screens
- Shared Modals: 15 modals

Key new interactive components:
- 3D Calibration Matrix (Three.js radar chart)
- Topographical Route Map (D3.js DAG)
- Diagnostic Shuffler (glassmorphic spring cards)
- Ticking Odometer (animated COI counter)
- Telemetry Typewriter (AI thought stream)
- Pressure Matrix (split-screen interview)
- EKG Waveform (speech analysis)
- Liquid Metal Intervention Drawer (marketplace)
- Survival Carousel (e-commerce)
- Pizza Tracker (revalidation progress)

---

## 10. RISK REGISTER

| Risk | Impact | Mitigation |
|------|--------|------------|
| Next.js migration breaks existing features | High | Run V1 and V2 in parallel, gradual cutover |
| Supabase Auth migration loses user sessions | High | Migrate passwords via import, notify users |
| Vertex AI costs spiral with usage | Medium | Implement usage caps per tier, cache responses |
| pgvector query performance at scale | Medium | Create HNSW indexes, limit vector dimensions |
| 148 screens scope creep | High | Strict phase gating, MVP per phase |
| Stripe Connect compliance | Medium | Start Stripe onboarding early (KYC delays) |
| WebSocket scaling for real-time features | Medium | Use Edge Functions / serverless WS |

---

## 11. PRIORITY MATRIX (What to Build First)

### Must-Have for V2 Launch (MVP)
1. Next.js 14 scaffold + Premium Light design system
2. Supabase Auth migration
3. "Next Domino" Dashboard with COI + Certainty Score
4. DAG Route Visualizer (D3.js, simplified)
5. Artifact Forge (Tiptap + basic AI analysis)
6. Enhanced Interview Simulator (timer + results, voice optional)
7. Marketplace with Stripe Escrow

### Should-Have (V2.1)
8. Full 3D Topographical Map (Three.js)
9. EKG Waveform in interviews
10. Diagnostic Shuffler animations
11. Real-time WebSocket DAG updates
12. E-Commerce Supply Drop
13. B2B Dashboard

### Nice-to-Have (V2.2+)
14. Real-Time Translation Widget
15. 3D Calibration Matrix (WebGL psych assessment)
16. Tauri Desktop App
17. Full 5400-state PsychInteractionConfig
18. Blockchain verification for credentials

---

**End of V2 Migration Plan.**
