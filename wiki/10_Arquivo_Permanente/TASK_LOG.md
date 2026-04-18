# v2.5 Bug Diagnostics & Report Plan

- [x] Investigate Login Issues
  - [x] Analyze login error ("Não foi possível entrar agora" / try again succeeds) - **Diagnosis:** Neon Serverless DB cold start causes Vercel serverless function (10-15s limit) or frontend API request (30s timeout) to time out on first request. Second request hits a warm DB and succeeds.
- [x] Investigate Route Creation Issue
  - [x] Analyze "Não foi possível criar a rota na API" error - **Diagnosis:** `GET /routes/templates` crashes with 500 `AttributeError: 'RouteTemplateResponse' object has no attribute 'temporal_match_score'` when sorting templates for users with a PsychProfile (because `temporal_match_score` is not defined in `RouteTemplateResponse` schema). This 500 error is caught by `addRoute` catching any API error as a route creation error.
- [x] Investigate Interviews Timer & Stats
  - [x] Check timer continuing after finish. - **Diagnosis:** The `setInterval` in `[id]/session/page.tsx` lacks a mechanism to clear when `isFinished` gets set to true. It continues ticking indefinitely until unmount.
  - [x] Check simulator not comparing past sessions. - **Diagnosis:** Relies on matching `session.type` and having a valid `overallScore`. Falsy check `remote.overall_score ? ... : undefined` drops 0 scores. Also limited by backend pagination (first 20 sessions).
  - [x] Check duration static at 5916 min. - **Diagnosis:** Duration computed as calendar difference `completedAt - startedAt`. If user starts a session and finishes it 4 days later (e.g. 5916 mins), it records the elapsed calendar time instead of active practice time. Fix by summing `timeSpent` from recorded answers.
- [x] Investigate Community Posts Link Loop
  - [x] Check link to verify post going back to main page looping. - **Diagnosis:** Two issues. First, `CommunityContextSection.tsx` (shown in other screens) wraps every community item in a `<Link href="/community">`, redirecting users to the main feed instead of the specific post. Second, `CommunityFeedItem.tsx` only shows the first 2 replies inline, and the "Abrir" link for a question (`href: /community/[id]`) leads to a 404 because `app/(app)/community/[id]/page.tsx` does not exist. There is no individual post detail page implemented.
- [x] Investigate Sprint Configuration Issue
  - [x] Analyze "Não foi possível criar o Sprint agora" error and delay. - **Diagnosis:** The frontend generates sprint tasks locally (`buildSprintPlan`) and sends them to the backend via a `Promise.all` containing `N` concurrent `POST /{sprint_id}/tasks` requests (where `N` can be 10-20 tasks). This creates severe connection spikes on the serverless Neon DB and often triggers Vercel function timeouts (10-15s), causing the creation to fail after a long delay. Fix by adding a bulk task creation endpoint or updating `UserSprintCreate` schema to accept a list of tasks in a single POST request.
- [x] Compile Comprehensive Bug Report

# V2.5 Implementation Execution (feature/v2.5-core)

- [ ] **Step 1: Database Architecture (The Narrative Schema)**
  - [ ] Add Alembic Migration for OIOS Archetypes & Fear Clusters
  - [ ] Update SQLAlchemy Models (`user.py` / `psychology.py`)
  - [ ] Configure DB connection retries to mitigate Neon Serverless cold starts
- [ ] **Step 2: Critical V2 Fixes**
  - [ ] Fix Route Creation Error (Add `temporal_match_score` to schema)
  - [ ] Fix Sprint Batching (Create `bulk` endpoint)
  - [ ] Fix Interview Session Timer Memory Leak
- [ ] **Step 3: Frontend Foundations (MMXD & Narrative Forge)**
  - [ ] Update Nudge Store with 12 Archetypes & Digievolution Logic
  - [ ] Create basic Route and component for Narrative Forge
- [ ] **Step 4: AI Interview Coach & Resume Matcher Integrations**
  - [ ] Adapt Resume Matcher logic for Document ATS parsing
  - [ ] Adapt FoloUp logic for Web Audio Interview Simulator

# Olcan Marketing Website Redesign (Agency-Agent V2.5)

- [x] **Monorepo Global Reorganization:**
  - [x] Archive legacy projects (Olcan-frontend, olcan-blog).
  - [x] Move root .md reports to `docs/archive/legacy_milestones/`.
  - [x] Consolidate v2.5 documents in `docs/v2.5/`.
  - [x] Redesign root `README.md` as an Executive Dashboard.
- [x] **Core Components:**
  - [x] Navbar (Liquid Glass + Minimal Editorial)
  - [x] Hero Section (Video Background + Puppet Animation + Diagonal Cut)
  - [x] Cobe Globe Component (Interactive Destinations)
  - [x] About Section (OIOS Narrative + Motion)
  - [x] Insights Section (Product Spotlight)
  - [x] Footer (Clean Editorial)
- [ ] **Pages:**
  - [ ] Enhanced Homepage
  - [ ] Redesigned Diagnostic Page
  - [ ] New Route-Specific Subpages
- [ ] **Verification:**
  - [ ] Browser Subagent Visual Audit
  - [ ] Performance & Lighthouse Check
