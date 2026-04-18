# Olcan Compass V2.5 — Master Implementation Plan

**Branch:** `feature/v2.5-core` (isolated from `main`/V2 production)  
**Stack:** FastAPI + Next.js 14 (App Router) + Neon Postgres + Tailwind + Framer Motion  
**Design System:** Dark OLED | Fira Code (headings) + Fira Sans (body) | CTA: `#22C55E`

> [!IMPORTANT]
> **Zero disruption to V2.** All changes are on `feature/v2.5-core`. The Neon DB staging **branch** (copy-on-write) will be used for all migrations — never the production DB. Alembic migrations must be additive (nullable columns only).

---

## PHASE 0: Stabilize V2 Bugs (Week 1, Days 1–2)

**Goal:** Kill the bugs causing user churn before building new features.

### 0.1 — Fix Route Creation 500 Error

**Root cause:** `GET /api/routes/templates` crashes with `AttributeError` because `RouteTemplateResponse` schema lacks `temporal_match_score`.

#### [MODIFY] `apps/api/app/schemas/route.py`
```diff
 class RouteTemplateResponse(BaseModel):
+    temporal_match_score: float = 0.0
```

#### [MODIFY] `apps/api/app/api/routes/routes.py`
- Remove the sort that accesses `temporal_match_score` as an attribute on the model object. Use the schema field instead (already defaulted to 0.0).

---

### 0.2 — Fix Interview Timer Memory Leak & Duration Bug

**Root cause:** `setInterval` never cleared after session finishes. Duration = `completedAt - startedAt` (calendar time, not active practice time).

#### [MODIFY] `apps/web-v2/src/app/(app)/interviews/[id]/session/page.tsx`
```diff
-  useEffect(() => {
-    const interval = setInterval(() => { setElapsed(e => e + 1); }, 1000);
-    return () => clearInterval(interval);
-  }, []);
+  useEffect(() => {
+    if (isFinished) return;
+    const interval = setInterval(() => { setElapsed(e => e + 1); }, 1000);
+    return () => clearInterval(interval);
+  }, [isFinished]);
```

#### [MODIFY] `apps/web-v2/src/stores/interviews.ts`
- In `getStats()`, replace `(completedAt - startedAt)` with `sum of answer.timeSpent` across the session's answers to get real active minutes.

---

### 0.3 — Fix Sprint Timeout (Bulk Create Endpoint)

**Root cause:** Frontend fires N concurrent `POST /sprints/{id}/tasks` requests (one per task) causing Neon connection exhaustion + Vercel 10s timeout.

#### [MODIFY] `apps/api/app/api/routes/sprint.py`
- Add `POST /sprints/{sprint_id}/tasks/bulk` endpoint accepting `List[SprintTaskCreate]`.

#### [MODIFY] `apps/api/app/schemas/sprint.py`
- Add `SprintTaskBulkCreate` schema (`tasks: List[SprintTaskCreate]`).

#### [MODIFY] `apps/web-v2/src/stores/sprints.ts`
- Replace `Promise.all(tasks.map(...postTask))` with a single `POST /tasks/bulk` call.

---

### 0.4 — Fix Community Link Loop + Missing Post Detail Page

#### [MODIFY] `apps/web-v2/src/components/ui/CommunityContextSection.tsx`
- Change `href="/community"` to `href={/community/${item.id}}` for each item link.

#### [NEW] `apps/web-v2/src/app/(app)/community/[id]/page.tsx`
- Create the post detail page: fetch single post by ID, render full content + replies list + reply form.

---

### 0.5 — Fix Neon Serverless Cold-Start Timeouts (Login)

#### [MODIFY] `apps/api/app/db/session.py`
- Add `pool_pre_ping=True` and retry loop (3 attempts with exponential backoff) around the initial connection to absorb Neon scale-to-zero wake-up latency.

#### [MODIFY] `apps/web-v2/src/lib/api.ts`
- Increase Axios `timeout` from 30s → 45s for auth endpoints specifically.
- Add a retry interceptor (via `axios-retry`) for network errors on login only (status 0/ECONNABORTED).

---

## PHASE 1: The Narrative Schema — OIOS Database Evolution (Week 1, Days 3–5)

**Goal:** Lay the data foundation for all gamification & AI personalization.

### 1.1 — SQLAlchemy Model Updates ✅ (done)

`apps/api/app/db/models/psychology.py` — already updated with:
- `OIOSArchetype` enum (8 defined, 4 TBD)
- `FearCluster` enum (4 values)
- `PsychProfile.dominant_archetype`, `primary_fear_cluster`, `evolution_stage`, `kinetic_energy_level`

### 1.2 — Alembic Migration

#### [MODIFY] `apps/api/alembic/versions/91e881fee226_manual_oios_gamification_logic.py`
Fill the generated stub with:
```python
def upgrade():
    op.execute("CREATE TYPE oiosarchetype AS ENUM (...)")
    op.execute("CREATE TYPE fearcluster AS ENUM (...)")
    op.add_column('user_psych_profiles', sa.Column('dominant_archetype', ...nullable=True))
    op.add_column('user_psych_profiles', sa.Column('primary_fear_cluster', ...nullable=True))
    op.add_column('user_psych_profiles', sa.Column('evolution_stage', sa.Integer, default=1))
    op.add_column('user_psych_profiles', sa.Column('kinetic_energy_level', sa.Float, default=0.0))
```

### 1.3 — Psychology API Schema Updates

#### [MODIFY] `apps/api/app/schemas/psychology.py`
- Add `dominant_archetype`, `primary_fear_cluster`, `evolution_stage` to `PsychProfileResponse`.

#### [MODIFY] `apps/api/app/api/routes/psychology.py`
- Expose PATCH endpoint to update archetype after onboarding diagnostic.

---

## PHASE 2: The Narrative Forge UI (Week 1–2)

**Goal:** Build the core monetizable UX — the focused document composition environment.

**Design Tokens (from UX Pro Max skill):**
- Background: `#020617` (OLED Black)
- Surface: `#0F172A` (Dark Navy)
- Text: `#F8FAFC`
- CTA/Accent: `#22C55E` (Green — only for AI actions + payments)
- Fonts: `Fira Code` (mono/headings) + `Fira Sans` (body)
- Effects: Minimal glow (`text-shadow: 0 0 10px`), `transition-colors duration-200`, Framer Motion fade-ins

**Inspired by:** Reactive Resume (document-as-code architecture), OpenResume (client-side PDF parsing), RenderCV (deterministic export)

### 2.1 — Forge Page Enhancement

#### [MODIFY] `apps/web-v2/src/app/(app)/forge/page.tsx`
The page directory exists. Implement:
- **"Focus Mode"** toggle: hides sidebar and global nav, enters full OLED black immersive writing mode.
- Rich text editor (Tiptap or contenteditable with debounce) with real-time word/char counter.
- Document type selector: `CV`, `Motivation Letter`, `SOP`, `Scholarship Essay`.
- **AI Polish Button** (Lumina accent, `#22C55E`): triggers `POST /api/ai/polish-document` with the current text + user archetype context injected server-side.
- Autosave every 30s using optimistic concurrency (check `updated_at` before saving).
- **ATS Score Panel** (right sidebar in non-focus mode): displays Resume Matcher-style keyword analysis vs target job description.

#### [NEW] `apps/web-v2/src/components/forge/FocusMode.tsx`
- `<FocusMode>` wrapper that triggers a Framer Motion layout animation to collapse all non-forge UI.

#### [NEW] `apps/web-v2/src/components/forge/ATSScorePanel.tsx`
- Displays keyword match score between the current document content and a pasted Job Description.

### 2.2 — AI Gateway (Backend)

#### [MODIFY] `apps/api/app/api/routes/ai.py`
Already exists (15KB). Add:
- `POST /ai/polish-document` — takes `{ text, doc_type, archetype, fear_cluster }`.
  - Injects OIOS Fear Cluster context into the system prompt (invisible to user).
  - Rate-limited: 3 free uses, then Stripe paywall check.
- `POST /ai/ats-score` — compares document against job description using keyword extraction.

---

## PHASE 3: Interview Coach Upgrade (Week 2–3)

**Inspired by:** FoloUp (dynamic question generation), Antriview (Web Audio pipeline)

### 3.1 — Dynamic Question Generation

#### [MODIFY] `apps/api/app/api/routes/interview.py`
- Add `POST /interviews/generate-questions` accepting `{ resume_text, job_description, type }`.
- Backend calls Gemini Flash to generate 5–10 tailored questions on the fly (no static bank).

### 3.2 — Timer & Stats Fix ✅ (Phase 0.2)

### 3.3 — Voice Interview Mode (Frontend)

#### [MODIFY] `apps/web-v2/src/app/(app)/interviews/[id]/session/page.tsx`
- Add `Web Audio API` recording button: starts `MediaRecorder`, chunks audio.
- On answer submission, send audio blob to `POST /ai/transcribe-answer`.
- Display AI feedback with Framer Motion fade-in: fluency score, STAR method adherence, filler word count.

---

## PHASE 4: Gamification Engine — OIOS Nudge System (Week 2–3)

### 4.1 — Nudge Store with 12 Archetypes

#### [MODIFY] `apps/web-v2/src/stores/nudge.ts`
Replace the existing nudge seed with the complete OIOS framework:
- 8 defined archetypes + 4 placeholder archetypes (TBD).
- Each archetype has: `defaultFear`, `motivator`, `reframeCards[]`, `evolutionMessages[]`.
- Logic: if `lastActiveAt > 7 days ago`, dispatch a Fear Reframe Card tailored to `dominant_archetype`.

### 4.2 — Evolution Stage Display

#### [NEW] `apps/web-v2/src/components/dashboard/EvolutionCard.tsx`
- Displays the user's current guardian stage (Rookie → Champion → Mega) based on `evolution_stage`.
- Framer Motion animation when stage advances.
- Shows the next milestone to trigger evolution (e.g., "Complete 1 Motivation Letter to evolve").

---

## PHASE 5: Marketplace & HITL (Week 3–4)

### 5.1 — Stripe Connect Foundation

#### [MODIFY] `apps/api/app/api/routes/marketplace.py`
Already exists (50KB). Add:
- `POST /marketplace/checkout` — Stripe Checkout Session for pay-per-use services.
- `POST /marketplace/connect/onboard` — Stripe Connect Express onboarding for mentors.

### 5.2 — Mentor Brief System

When a user purchases a review, the system auto-generates a Mentor Brief JSON:
```json
{ "text_block": "...", "archetype": "insecure_corporate_dev", "fear": "competence", "doc_type": "motivation_letter" }
```
This is delivered to the mentor's dashboard, reducing async review time from 1h → 5 min.

---

## PHASE 6: Design System Token Migration (Week 1 — Parallel)

#### [MODIFY] `apps/web-v2/src/design-tokens.json`
Update with canonical V2.5 tokens:
```json
{
  "colors": {
    "void": "#020617",
    "surface": "#0F172A",
    "surface-2": "#1E293B",
    "lux": "#F8FAFC",
    "lumina": "#22C55E",
    "clay": "#404040",
    "text-muted": "#64748B"
  },
  "fonts": {
    "heading": "Fira Code",
    "body": "Fira Sans"
  }
}
```

#### [MODIFY] `apps/web-v2/tailwind.config.js`
Ensure token aliases (`bg-void`, `text-lux`, `bg-lumina`) map to the new palette.

---

## Execution Sequence (Prioritized Kanban)

| Priority | Item | Owner | Complexity |
|----------|------|-------|------------|
| 🔴 P0 | Route 500 Fix (`temporal_match_score`) | Backend | 30 min |
| 🔴 P0 | Interview Timer Memory Leak | Frontend | 30 min |
| 🔴 P0 | Sprint Bulk Create Endpoint | Backend | 2h |
| 🔴 P0 | Community Link Loop + Post Detail | Frontend | 3h |
| 🔴 P0 | Neon Cold-Start Retry Logic | Backend | 1h |
| 🟠 P1 | OIOS Alembic Migration (fill stub) | Backend | 2h |
| 🟠 P1 | Design Token Migration | Frontend | 1h |
| 🟠 P1 | Forge Page — Focus Mode + AI Polish | Frontend | 1 day |
| 🟠 P1 | AI Gateway — `/polish-document` | Backend | 4h |
| 🟡 P2 | Nudge Store — 12 Archetypes | Frontend | 3h |
| 🟡 P2 | Evolution Card Component | Frontend | 2h |
| 🟡 P2 | Dynamic Interview Questions | Backend | 4h |
| 🟢 P3 | Voice Recording Mode (Web Audio) | Frontend | 1 day |
| 🟢 P3 | Stripe Checkout + Connect Onboarding | Backend | 2 days |
| 🟢 P3 | Mentor Brief Auto-Generation | Backend | 3h |

---

## Verification Plan

### Automated
- `npm run lint` — zero errors before any commit to `feature/v2.5-core`
- `npm run build` — must pass (tsc + vite build)
- Manual Swagger/curl tests for all new endpoints before deployment

### Manual Browser Testing
1. **Login flow:** Cold-start simulation — verify retry resolves within 5s.
2. **Route creation:** Verify no 500; routes page loads correctly with PsychProfile.
3. **Sprint creation:** Verify single-request bulk creation completes in < 3s.
4. **Interview session:** Verify timer stops at session end; duration is accurate.
5. **Community:** Verify post detail page loads; no link loops.
6. **Forge:** Verify AI polish triggers and renders with Framer Motion; focus mode hides nav.
---

## PHASE 7: Marketing Website — Metamodern Redesign (V2.5)

**Goal:** Transform the marketing site from "AI slop" into a high-end, editorial, game-like experience.

**Design tokens (Metamodern / Liquid Glass):**
- **Backgrounds:** `#FBFAF7` (Cream), `#F7F4EF` (Bone)
- **Typography:** `DM Serif Display` (Editorial H1/H2), `DM Sans` (Body), `JetBrains Mono` (Labels)
- **Accents:** `#E8421A` (Flame Orange - primary CTA), `#B5830A` (Amber)
- **Surfaces:** `Liquid Glass` (blur + glass reflections + mask border shadows)

### 7.1 — Global UI Rebuild

#### [NEW] `apps/web-site/src/components/layout/Navbar.tsx`
- Implementation of a minimal editorial nav with liquid glass background.
- Floating design, high-contrast ink text.

#### [NEW] `apps/web-site/src/components/home/HeroRedesign.tsx`
- Full-screen section with a background video (masked/blended).
- Uses the **archetype puppets** (Cartographer, Bridge, Nomad, Escapee) as interactive animated elements.
- Features a **diagonal cut** transition to the "About" section.

#### [NEW] `apps/web-site/src/components/home/GlobeSubcomponent.tsx`
- Interactive 3D globe using `cobe` and `canvas`.
- Visualizes "Migration Flows" with arcs targeting global career hubs.

---

## Verification Plan (Website)

### Visual Audit
- Verify **no emojis** are used in icons (use `Lucide` or `SVGs`).
- Check contrast of `ink` text on `cream` backgrounds.
- Validate `liquid-glass` blur performance on mobile.

### Animation Audit
- Ensure `puppet-idle` breathing animation feels organic.
- Verify `hero-video` doesn't layout-shift during load.
