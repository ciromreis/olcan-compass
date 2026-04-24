---
title: The Dossier - Master Strategic Export Specification
type: drawer
layer: 3
status: active
last_seen: 2026-04-22
backlinks:
  - Modelo_Core_Routes_Sprints_Tasks
  - SPEC_IO_System_v2_5
  - Diagnostico_Topologia_Backend
---

The reason agentic IDEs are failing to weave this dossier together is due to a **violation of Domain-Driven Design (DDD) at the presentation layer**. Currently, Olcan Compass is powered by heavily isolated engines (The Diagnostic Engine, The Route Engine, and The Artifact Forge) which run across different database schemas and fragmented frontend state stores. When an IDE attempts to build a unified PDF on the frontend, it gets trapped trying to synchronize disconnected data streams (like merging Payload CMS form data with FastAPI route logic), leading to hallucinated code and technical debt.

To fix this, we must instruct the IDE to abandon frontend PDF generation (like `react-pdf` or `jspdf`) and build a **Backend Orchestration Service**.

Here is the refined explanation of the system's output and the hyper-detailed technical blueprint you can feed directly to your IDE.

---

### **🧭 THE OLCAN MASTER DOSSIER: SYSTEM OUTPUT EXPLAINED**

The Olcan Compass system is not a linear checklist; it is a **Dynamic Task Orchestration Engine**. The final output—the **Master Strategic Dossier**—is a beautifully rendered, continuously updated PDF export that acts as the user's physical "Flight Plan." It weaves together three core data pillars:

1. **The Mirror (Identity & Readiness):** Captured via the initial diagnostic forms, this section reveals the user's **OIOS Archetype** (e.g., "The Technical Bridge Builder"), their dominant Fear Cluster (e.g., Fear of Rejection), and a radar chart of their Readiness Score across dimensions like financial, linguistic, and operational capacity.  
2. **The Compass (Strategic Route Agenda):** Based on the user's multi-dimensional profile, the system generates a personalized, execution-paced timeline. This includes the selected international Route (Academic, Corporate, Nomad), the contextual milestones, scheduled events, and the dynamic tasks assigned to their weekly bandwidth (Sprint Engine).  
3. **The Forge (Execution Artifacts):** The tangible outputs. This includes the user's custom-built documents (CVs, Motivation Letters) formatted to their target country's standards, complete with their AI-evaluated **Olcan Score** (Clarity, Coherence, Authenticity).

---

### **🛠️ TECHNICAL BLUEPRINT FOR THE AGENTIC IDE**

To permanently resolve the technical debt, copy and paste the following strict directive into Cursor or Windsurf. This forces the IDE to respect your backend boundaries and use a highly reliable headless rendering pipeline.

**Agentic IDE Directive: Architect the Olcan Master Dossier Export Pipeline**

**Context & The Complaint to Resolve:** Previous attempts to generate a unified user export failed because they relied on frontend state-stitching across isolated domains, resulting in technical debt and UI freezing. You must resolve this by shifting the entire aggregation and rendering pipeline to the **FastAPI Backend**. Do NOT use client-side PDF libraries (like `jspdf`). We will use a "Gather → Template → Render" backend pipeline.

**Phase 1: The Cross-Domain Orchestration Service**

* Create a new file: `apps/api-core-v2.5/app/services/dossier_orchestrator.py`.  
* This service must act as a read-only aggregator. It will asynchronously fetch data from the three isolated engines:  
  1. `PsychProfileService.get_user_profile()` (Fetches OIOS Archetype, Fear Clusters, and Readiness Scores).  
  2. `RouteBuilderService.get_active_route_with_milestones()` (Fetches the DAG timeline, pending tasks, and upcoming events).  
  3. `DocumentService.get_completed_documents()` (Fetches the latest approved CV/Essays and their Olcan Scores).  
* Map these three sources into a single, strict Pydantic model: `MasterDossierPayload`.

**Phase 2: The Headless Rendering Engine (Playwright \+ Jinja2)**

* Create a new file: `apps/api-core-v2.5/app/utils/pdf_renderer.py`.  
* We will use **Jinja2** to inject the `MasterDossierPayload` into a hidden HTML template.  
* The HTML template must utilize Tailwind CSS via CDN to strictly enforce the Olcan "Clinical Boutique" aesthetic: Deep Navy Blue (`#001338`), Light Slate (`#F8FAFC`), and "Hefesto Fire" (`#FBBF24`) accents. Use the `DM Serif Display` and `Source Sans` fonts.  
* Use **Playwright (headless Chromium)** to render the injected HTML string and print it to a pixel-perfect PDF buffer: `page.pdf(printBackground=True, format="A4", margin={"top": "20mm", "bottom": "20mm"})`.

**Phase 3: The API Endpoint**

* Create a protected GET endpoint: `/api/v1/dossier/export`.  
* It must validate the user's JWT, trigger the `DossierOrchestrator`, pass the payload to the `PdfRenderer`, and return a `StreamingResponse` with `media_type="application/pdf"`.

**Phase 4: Frontend Trigger (Stateless UI)**

* In `apps/app-compass-v2.5/src/components/routes/RouteMetadataSidebar.tsx`, add a primary CTA: `[ 📄 Exportar Dossier Estratégico ]`.  
* When clicked, trigger a loading toast ("Compilando inteligência..."), fetch the PDF blob from the backend, and trigger a native browser download. **Do not create any new Zustand stores for this action.**

### **Why this technical approach works:**

By forcing the IDE to build a `DossierOrchestrator` on the backend, you cleanly bypass the frontend fragmentation. The database queries remain secure and fast. By using **Jinja2 \+ Playwright** instead of a raw PDF library, you guarantee that the highly specific "Metamodern" visual identity (the charts, the typography, the colors) will render exactly as it looks on the website, beautifully organizing the complex multidimensional data into a premium executive report.

The reason your Agentic IDEs (like Cursor or Windsurf) are failing to weave this unified "PDF Dossier" together is due to the strict **Domain-Driven Design (DDD)** established in the Olcan Compass architecture.

Currently, the Identity/Psychological Engine (the CMS diagnostic forms), the Route Engine (the tasks and DAG milestones), and the Artifact Forge (document creation) are heavily isolated into their own micro-services and state stores. When an AI agent tries to build a unified export, it gets lost traversing the isolated databases (FastAPI vs. Payload CMS) and fragmented Zustand stores, leading to "AI slop" and technical debt.

To solve this technically and thoroughly, we must introduce a **Cross-Domain Orchestration Layer**—specifically, a **Dossier Generator Service** that sits *above* the individual engines. It will aggregate the data and utilize the Playwright PDF generation pipeline already planned in your architecture.

Here is the exact architectural blueprint and the directive you must feed your IDE to successfully weave these features into a beautiful, unified PDF export.

---

### **1\. The Technical Architecture of the "Master Dossier"**

To generate this beautifully organized PDF without breaking the domain boundaries, the system must follow a strict **Gather → Template → Render** pipeline.

* **Step 1: The Aggregator (Python/FastAPI):** A new `dossier_service.py` must be created. This service will call the `PsychProfileService` (for the CMS-driven diagnostic/readiness data), the `RouteBuilderService` (for the milestones, tasks, and events), and the `DocumentService` (for the CVs and essays).  
* **Step 2: The Templating Engine:** Instead of trying to build a PDF line-by-line using complex libraries, the backend will inject this aggregated JSON payload into a beautiful, hidden HTML/Tailwind template (Jinja2).  
* **Step 3: The Rendering Engine:** The backend will use **Playwright** (running headless) to render the HTML template and print it to a pixel-perfect PDF. This guarantees that the "Clinical Boutique" and "Liquid Glass" design system translates perfectly to the final document.

---

### **2\. The Data Weaving Schema**

The IDE must aggregate the data into this specific JSON structure before sending it to the PDF renderer. This maps exactly to your existing database models:

{

  "dossier\_metadata": {

    "generated\_at": "2026-04-22T10:00:00Z",

    "user\_name": "Valentino",

    "target\_destination": "Germany \- Tech Visa"

  },

  "identity\_and\_readiness": {

    "archetype": "Technical Bridge Builder",

    "readiness\_score": 78,

    "dimensions": { "academic": 80, "financial": 60, "linguistic": 90 },

    "risk\_flags": \["Financial gap of 20%"\]

  },

  "strategic\_route\_agenda": {

    "route\_name": "Senior Developer Relocation",

    "timeline\_months": 6,

    "completed\_milestones": 2,

    "pending\_milestones": 4,

    "upcoming\_tasks": \[

      { "title": "Translate CV to German format", "due\_date": "2026-05-01", "status": "PENDING" }

    \]

  },

  "execution\_artifacts": \[

    {

      "type": "CV\_GLOBAL",

      "olcan\_score": 85,

      "content\_html": "\<p\>Professional summary...\</p\>"

    }

  \]

}

---

### **3\. Agentic IDE Directive (Copy & Paste to Cursor/Windsurf)**

To force your AI agent to build this without creating technical debt or hallucinating new databases, give it this exact, highly constrained prompt:

**Agentic IDE Directive: Implement the Olcan Master Dossier Export**

"Act as a Senior Python/React Systems Architect. We need to implement the 'Master Dossier Export' feature for Olcan Compass v2.5, which weaves together the user's psychological profile, route agenda, and generated documents into a single, beautifully organized PDF.

**1\. Backend: The Orchestration Service (`app/services/dossier_service.py`)**

* Do NOT modify the existing domain services. Create a new orchestration service `DossierGeneratorService`.  
* This service must asynchronously call `PsychProfileService.get_user_profile()`, `RouteBuilderService.get_active_route_with_milestones()`, and `DocumentService.get_completed_documents()`.  
* Aggregate this data into a single `MasterDossierPayload` Pydantic schema.

**2\. Backend: PDF Generation Pipeline (`app/utils/pdf_generator.py`)**

* Implement a Playwright-based PDF generator.  
* Create an HTML/Tailwind template (using Jinja2) that matches the Olcan 'Clinical Boutique' aesthetic (Navy Blue `#001338`, Slate, and Serif headings).  
* The template must have 3 distinct sections:  
  1. **The Mirror:** The user's Archetype, Readiness Radar data, and CMS-driven psychological insights.  
  2. **The Compass:** The generated Route, milestone DAG, and upcoming task agenda.  
  3. **The Forge:** Append the clean HTML content of their latest approved CV/Motivation Letter.  
* Use Playwright to render this HTML string and export it as a PDF buffer (`page.pdf(printBackground=True, format="A4")`).

**3\. API Endpoint (`app/api/routes/dossier.py`)**

* Create `GET /api/dossier/export/pdf`.  
* Must require JWT authentication.  
* Return a `StreamingResponse` or `FileResponse` with media type `application/pdf`.

**4\. Frontend Integration (`apps/app-compass-v2.5/src/components/routes/RouteMetadataSidebar.tsx`)**

* In the existing `RouteMetadataSidebar` (which currently houses progress and quick actions), add a primary CTA button: `[ Exportar Dossier Estratégico (PDF) ]`.  
* When clicked, trigger a loading toast, fetch the PDF blob from the new endpoint, and trigger a browser download.  
* Do NOT build a new Zustand store for this. It is a stateless functional export.

**Constraint:** Strictly respect the separation of concerns. The frontend should only make one API call. The backend is entirely responsible for the data joining and the heavy lifting of the PDF rendering."

### **Why this resolves your technical debt:**

By delegating the PDF generation to the backend using **Playwright \+ HTML templates**, you bypass the severe limitations of frontend PDF libraries (like `jspdf` or `react-pdf`) which often fail to render complex Tailwind CSS layouts, causing IDEs to spin in loops. Furthermore, by forcing the IDE to create a dedicated **Orchestration Service** (`dossier_service.py`), you maintain the strict modularity of your Database architecture while finally achieving the cross-domain "weave" you need.

### **1\. ROUTE ONTOLOGY (The Macro Journey)**

Routes are not hardcoded paths; they are instantiated from five core categories and transition through a strict state machine.

* **Route Categories (The "Where"):**  
  * `EMPLOYMENT` (Job relocation, corporate transfers, H-1B/Blue Card).  
  * `EDUCATION` (Scholarships, PhDs, academic exchanges).  
  * `ENTREPRENEURSHIP` (Startup visas, business creation).  
  * `LIFESTYLE` (Digital nomad, retirement, remote work visas).  
  * `HUMANITARIAN` (NGO, public service, impact mobility).  
* **Mobility Lifecycle States (The "When"):**  
  * `EXPLORING` $\\rightarrow$ `PREPARING` $\\rightarrow$ `APPLYING` $\\rightarrow$ `AWAITING` $\\rightarrow$ `ITERATING` (if rejected) $\\rightarrow$ `RELOCATING` (if accepted).

### **2\. EXECUTION ENGINE (Milestones, Sprints & Tasks)**

To prevent overwhelming the user, the DAG (Directed Acyclic Graph) breaks the route down into modular, bandwidth-aware chunks.

* **Milestone Dimensions (The Structural Gates):**  
  * `READINESS` (Validating credentials and background).  
  * `FINANCIAL` (Proof of funds, budget mapping).  
  * `TEST` (Language proficiency, standardized exams).  
  * `NARRATIVE` (Drafting CVs, essays, and cover letters).  
  * `APPLICATION` (The actual submission governance).  
* **Task Operations (The Atomic Actions):**  
  * `FIND` (Research operations: identifying programs, scraping databases).  
  * `DECIDE` (Strategic operations: weighing trade-offs, ROI scenarios).  
  * `BUILD` (Creation operations: writing, uploading, generating assets).  
* **Sprint Pacing (The "Velocity" Multiplier):**  
  * `CONSTRAINED` (\< 2h/week): Triggers Micro-Sprints (max 1-2 atomic tasks to prevent churn).  
  * `MODERATE` (2-5h/week): Standard sprint allocation.  
  * `ABUNDANT` (5h+/week): Parallel milestone execution unlocked.

### **3\. THE FORGE ARTIFACTS (Documents)**

The system tracks immutable, AI-scored documents.

* **Artifact Types:**  
  * `GLOBAL_CV` / `RESUME` (Algorithmically adjusted per region).  
  * `MOTIVATION_LETTER` (For academic or corporate framing).  
  * `STATEMENT_OF_PURPOSE` (SOP for deep academic applications).  
  * `COVER_LETTER` (Standard job applications).  
  * `RESEARCH_PROPOSAL` (For PhD/Fellowship tracks).  
* **Artifact Status:**  
  * `NOT_STARTED` $\\rightarrow$ `DRAFTING` $\\rightarrow$ `ANALYZED` $\\rightarrow$ `IMPROVING` $\\rightarrow$ `APPLICATION_LINKED`.

### **4\. THE EVENT BUS TAXONOMY (Telemetry & Gamification)**

To weave these domains together without hard-coupling the microservices, the system uses a centralized event emitter that triggers the UI, the gamification engine (Aura companion), and analytics.

* **Assessment Events:** `assessment.completed`, `psych_state.changed`.  
* **Route Events:** `route.selected`, `route.milestone_completed`, `route.sprint_created`.  
* **Document Events:** `document.created`, `document.saved`, `document.polished`, `document.version_saved`.  
* **Interview Events:** `interview.started`, `interview.completed`, `interview.score_improved`.  
* **Application Events:** `application.created`, `application.submitted`, `application.status_changed`.  
* **Marketplace Events:** `marketplace.booking_created`, `marketplace.service_completed`.

**Architectural Takeaway:** By standardizing these enums in the backend (PostgreSQL/FastAPI), the `DossierOrchestrator` can easily query a user's state. It simply grabs the active `ROUTE_CATEGORY`, filters by `COMPLETED` milestones, pulls the highest-scoring `ARTIFACT_TYPE`, and formats it all into the final PDF without any "AI slop" or frontend hallucination.

---

### **1\. ROUTE ONTOLOGY (The Macro Journey)**

Routes are not hardcoded paths; they are instantiated as dynamic execution graphs (`RouteBuilder` models) bound to a strict state machine. To successfully orchestrate and export the Master Dossier, the system requires the following granular subelements.

#### **1.1 Route Categories & Sub-Classifications (The "Where")**

The system uses the `RouteCategory` enum as the top-level identifier, but management requires a `target_outcome` sub-classification to inject the correct requirements (visas, costs) into the dossier.

* **`EMPLOYMENT`**: Job relocation, corporate transfers, H-1B/Blue Card.  
  * *Sub-elements for export:* Sponsor requirement flag (`boolean`), target salary threshold (`float`), ATS integration requirement (`boolean`).  
* **`EDUCATION`**: Scholarships, PhDs, academic exchanges.  
  * *Sub-elements for export:* Funding type (full/partial), institution name, term start date, ECA (Credential Assessment) requirement.  
* **`ENTREPRENEURSHIP`**: Startup visas, business creation.  
  * *Sub-elements for export:* Business plan validation flag, incorporation capital requirement.  
* **`LIFESTYLE`**: Digital nomad, retirement, remote work visas.  
  * *Sub-elements for export:* Passive income threshold (e.g., 4x minimum wage for Portugal D8), tax residency conditions.  
* **`HUMANITARIAN`**: NGO, public service, impact mobility.  
  * *Sub-elements for export:* Sponsoring entity, duration of mission.

#### **1.2 Mobility Lifecycle State Machine (The "When")**

For the PDF Dossier to accurately print the user's current status (e.g., "You are in the Preparing Phase"), the `mobility_state` must be governed by strict backend transition triggers rather than manual user toggles.

* **`EXPLORING`** $\\rightarrow$ **`PREPARING`**:  
  * *System Trigger:* Route is instantiated in the DB and at least 1 preparation milestone is marked `IN_PROGRESS`.  
* **`PREPARING`** $\\rightarrow$ **`APPLYING`**:  
  * *System Trigger:* All mandatory preparation milestones (Language, Financials, Documents) hit 100% completion in the Readiness Engine.  
* **`APPLYING`** $\\rightarrow$ **`AWAITING`**:  
  * *System Trigger:* The Application Management Engine records `application_state = SUBMITTED`.  
* **`AWAITING`** $\\rightarrow$ **`ITERATING`**:  
  * *System Trigger:* Outcome logged as `REJECTED`, or a critical deadline expires. The route loop resets for recalibration.  
* **`AWAITING`** $\\rightarrow$ **`RELOCATING`**:  
  * *System Trigger:* Outcome logged as `ACCEPTED`. Unlocks relocation milestones (flights, housing).

#### **1.3 Route Configuration Parameters (The "Constraints")**

To accurately export the "Compass Agenda" in the PDF Dossier, every route must store these operational constraints in a JSONB configuration block (`route_config`).

* **`timeline_months`** (`Integer`): The time horizon (e.g., 3–60 months) which paces the Sprint Metronome.  
* **`budget_usd`** (`Float`): Hard financial constraint used by the Oracle Engine to redact impossible opportunities.  
* **`visa_requirements`** (`Array[String]`): Legal gating items required before transition to `APPLYING`.  
* **`language_requirements`** (`Array[String]`): Test thresholds (e.g., "IELTS 7.5") required for the Readiness dimension score.

#### **1.4 Strategic Telemetry (The "Risk & Competitiveness")**

The Route Ontology must track difficulty metrics to populate the Dossier’s "Risk Radar" charts realistically.

* **`competitiveness_index`** (`Float`, 0-100): Determines how perfect the narrative and readiness scores must be to achieve a "Ready to Submit" status (e.g., Chevening Scholarship \= 95, D7 Portugal \= 25).  
* **`interview_likelihood_score`** (`Integer`): Dictates whether the Route graph must auto-inject the "Interview Simulator" tasks as mandatory or optional.  
* **`timeline_pressure_index`** (`Float`): Calculates `current_date` vs `target_deadline` to trigger urgency nudges in the UI and highlight critical paths in the exported PDF.

---

**Architectural Takeaway for IDE/Dossier Weaving:** By formalizing the Route Ontology with these specific data types and state machine triggers, the `DossierOrchestratorService` no longer needs to "guess" what to print. It simply queries the `RouteBuilder` model for the `RouteCategory`, reads the current `mobility_state` to know which milestones to fetch, and extracts the `timeline_pressure_index` to color-code urgent items in the final PDF.

Let me know when you are ready to apply this same level of technical taxonomy to the **Sprint & Task Execution Engine (The "How")**.

To continue the architectural blueprint for your Agentic IDE and the `DossierOrchestratorService`, we must translate the conceptual "Execution Engine" into a rigid, MECE data model.

The Execution Engine is not a simple to-do list; it is a **Dynamic Task Orchestration Engine** governed by a Directed Acyclic Graph (DAG). To export a coherent Master Dossier that accurately reflects the user's "Compass Agenda," the system must mathematically compute task dependencies, atomic actions, and the user's physical time constraints.

Here is the highly technical expansion of the **2\. EXECUTION ENGINE** section.

---

### **2\. EXECUTION ENGINE (Milestones, Sprints & Tasks)**

The Execution Engine is structured as a hierarchical tree: Routes contain Milestones (Nodes), Milestones contain Tasks (Atomic Actions), and Tasks are batched into Sprints (Time-boxed execution loops).

To orchestrate and export this properly, the backend uses the `KineticSprint` and `dynamic_milestones` models.

#### **2.1 Milestone Dimensions (The DAG Nodes / Structural Gates)**

Milestones act as the primary gating mechanism in the user's journey. The Dossier exports these to show high-level strategic progress. In the database (`route_milestones`), each milestone must have strict dependency tracking to enforce the DAG.

* **`READINESS`** (Validating credentials): e.g., Degree translation, criminal background checks.  
* **`FINANCIAL`** (Proof of funds): e.g., Opening a blocked account, securing loan pre-approval.  
* **`TEST`** (Language/Exams): e.g., IELTS, TOEFL, GMAT booking and completion.  
* **`NARRATIVE`** (Asset Drafting): e.g., Motivation Letter, CV formatting.  
* **`APPLICATION`** (Governance): e.g., Form submission, visa interview scheduling.

**Subelements for System Management & Export:**

* **`dependency_ids`** (`Array[UUID]`): The core of the DAG. A milestone cannot transition to `IN_PROGRESS` unless all UUIDs in this array have a status of `COMPLETED`.  
* **`weight_in_progress`** (`Float`): Determines how much this specific milestone contributes to the overall route completion percentage shown in the Dossier.  
* **`evidence_required`** (`Array[String]`): Legal or narrative artifacts that must be attached (and validated) before the gate unlocks.

#### **2.2 Task Operations (The Atomic Actions)**

Tasks are the granular leaves of the DAG. Every task is categorized by a specific cognitive operation (`type: enum [find, decide, build]`) so the IDE knows exactly which UI module (The Oracle, The Mirror, or The Forge) to route the user toward.

* **`FIND`** (Research): Identifying programs, scraping visa requirements, mapping sponsor companies.  
* **`DECIDE`** (Strategy): Weighing trade-offs, calculating ROI scenarios in the matrix.  
* **`BUILD`** (Creation): Writing CVs, uploading translated documents, polishing essays.

**Subelements for System Management & Export:**

* **`task_status`** (`Enum`): Must strictly follow `PENDING`, `IN_PROGRESS`, `COMPLETED`, or `BLOCKED`.  
* **`estimated_minutes`** (`Integer`): Required by the Sprint Engine to calculate if a task fits into the user's available weekly bandwidth.  
* **`blocker_flag`** (`Boolean`) & **`blocker_reason`** (`String`): If true, the system automatically triggers a "Mentorship Request" or a "Fear Reframe Card" to unblock the user, which is also logged in the Dossier's Risk section.

#### **2.3 Sprint Pacing & Kinetic State (The "Velocity" Multiplier)**

To prevent churn, the `execution_state` table continuously monitors the user's physical constraints and adjusts the volume of tasks injected into the active Sprint. This is critical for the Dossier export, as it determines the printed timeline estimates.

* **`CONSTRAINED`** (\< 2h/week): The Orchestrator forces `max_active_tasks = 2`. Generates **Micro-Sprints** to guarantee a dopamine hit of completion and avoid guilt.  
* **`MODERATE`** (2-5h/week): Standard pacing; standard sprint allocation.  
* **`ABUNDANT`** (5h+/week): Unlocks parallel milestone execution, allowing the user to tackle `FINANCIAL` and `NARRATIVE` tracks simultaneously.

**Subelements for System Management & Export (`KineticSprint` table):**

* **`active_dag`** (`JSONB`): A snapshot of the specific task sequence generated and locked in for the current 14-day sprint.  
* **`velocity_score`** (`Float`): A rolling average of completed tasks vs. estimated minutes. Plotted on the Dossier to show the user's execution momentum.  
* **`carried_forward`** (`Integer`): Count of tasks the user failed to complete in previous sprints. A high number triggers a recalibration of their timeline.

#### **2.4 The DAG Transition Logic (The State Machine)**

For the `DossierOrchestratorService` to print an accurate "Compass Agenda," it must read the explicit state machine transitions of the execution engine.

* **The Resolution Algorithm:** Before marking a task or milestone as `COMPLETED`, the backend verifies dependencies. If a user attempts to bypass a step (e.g., jump to `APPLICATION` without completing `NARRATIVE`), the system raises a `MilestoneDependencyError` and locks the status to `BLOCKED`.  
* **The Smoothing Logic:** If a user deletes a required document or a milestone is retroactively failed (e.g., a visa requirement changes), the progress does not drop to zero immediately. The system uses a decay function (`progress_new = max(previous_progress * 0.95, recalculated_progress)`) to prevent psychological shock.

---

**Architectural Takeaway for IDE/Dossier Weaving:** When the AI agent builds the PDF Dossier, it does not need to calculate these dependencies on the frontend. The `DossierOrchestratorService` simply queries the `KineticSprint` model for the `active_dag`, filters tasks by `IN_PROGRESS` and `PENDING`, and extracts the `velocity_score`. This allows the PDF to beautifully render a personalized, mathematically accurate Gantt chart or timeline that perfectly respects the user's `< 2h/week` constraint.

Let me know when you are ready to expand the final major section: **3\. THE FORGE ARTIFACTS (Documents)**.

Here is the high-level, MECE architectural expansion for **3\. THE FORGE ARTIFACTS (Documents)**.

To solve the challenge of the user needing to fill out extensive forms about themselves, the architecture separates the **Raw Material (Structured Data/Forms)** from the **Final Artifact (The Unstructured Document)**. The system uses the user's form inputs to programmatically pre-fill and contextualize the documents before the user even begins drafting.

---

### **3\. THE FORGE ARTIFACTS (Document Intelligence)**

The Forge is not a simple text editor; it is a **Narrative Intelligence Engine (NIE)**. Documents are treated as version-controlled, immutable assets that are scored against the user's specific target route and psychological archetype.

#### **3.1 The Exhaustive Artifact Taxonomy (The "What")**

To maintain maximum flexibility across all 5 route categories (Employment, Education, Entrepreneurship, Lifestyle, Humanitarian), the system uses an exhaustive `document_type` Enum.

* **Corporate & Employment Assets:**  
  * `GLOBAL_CV` (Algorithmically adjusted for regional standards, e.g., photo rules, A4 vs. Letter size).  
  * `US_RESUME` (Strict, 1-2 page achievement-focused format).  
  * `COVER_LETTER` (Standard job applications, targeted to specific ATS keywords).  
  * `EXECUTIVE_BIO` (Short-form narrative for networking and portfolios).  
* **Academic & Immigration Assets:**  
  * `MOTIVATION_LETTER` (Narrative-driven, for European master's or visa justifications).  
  * `STATEMENT_OF_PURPOSE` (SOP for deep academic applications, focusing on methodology).  
  * `PERSONAL_STATEMENT` (Broader, identity-focused essay).  
  * `RESEARCH_PROPOSAL_SUMMARY` (For PhD/Fellowship tracks).  
* **Administrative & Edge-Case Assets:**  
  * `RECOMMENDATION_LETTER_DRAFT` (Ghostwritten drafts provided to former managers/professors).  
  * `WAIVER_REQUEST` (Legal/administrative appeals, such as language test waivers).  
  * `BUSINESS_PLAN_SUMMARY` (For Entrepreneur/Startup visa routes).

#### **3.2 User Data Ingestion & Component Mapping (The "Raw Material")**

Before drafting an artifact, users must fill out comprehensive CMS forms (The Mirror). The system captures this via the `RecruitmentFormHelper` logic and the `user_profiles` schema, avoiding repetitive typing.

* **`user_baseline_data` (JSONB Payload):**  
  * *Identity & Context:* Basic info, target country, OIOS Archetype (e.g., "Frontier Architect").  
  * *Academic History:* Degrees, institutions, dates, and thesis focus.  
  * *Professional Experience:* Roles, companies, quantifiable impacts, and dates.  
  * *Competency Matrix:* Hard skills, soft skills, and language proficiencies.  
* **The Scaffolding Logic:** When a user creates a new `STATEMENT_OF_PURPOSE`, the system injects the `user_baseline_data` into a hidden prompt. The AI generates a "Scaffolded Draft" using the user's actual form data, ensuring the blank page is instantly defeated while maintaining absolute factual accuracy.

#### **3.3 Artifact Lifecycle & State Machine (The "When")**

Documents inside the Forge (`narrative_documents` table) follow a strict, linear state machine to govern the user's execution bandwidth.

* **`NOT_STARTED`**: Artifact is required by the Route DAG but uninitiated.  
* **`SCAFFOLDING`**: System is pulling user form data to generate the initial structural block.  
* **`DRAFTING`**: User is actively writing in the Tiptap rich-text editor.  
* **`ANALYZED`**: The `narrative_versions` record is locked and scored by the Narrative Intelligence Engine.  
* **`IMPROVING`**: User is acting on the AI's specific `improvement_actions` (e.g., "Clarify long-term career goal in paragraph 2").  
* **`APPLICATION_LINKED`**: The highest-scoring version of the document is permanently attached to a specific real-world opportunity in the Application Management Engine.  
* **`ARCHIVED`**: Deprecated versions kept for institutional memory and LLM fine-tuning.

#### **3.4 Clinical Telemetry & AI Scoring (The "Quality")**

The Forge does not simply correct grammar. It outputs a strict JSON schema evaluating the document across several dimensions (`scores_json`). These scores are printed directly onto the final Master Dossier PDF.

* **`clarity_score`**: Sentence length distribution and thesis statement visibility.  
* **`coherence_score`**: Logical progression and causal connections between paragraphs.  
* **`route_alignment_score`**: How well the text matches the specific `RouteTemplate` expectations (e.g., academic vs. corporate framing).  
* **`authenticity_risk`**: A penalty score mapping the `cliche_density_score` (detecting overused generic phrases or AI-generated buzzwords).  
* **`cultural_alignment_score`**: Adjusts the tone based on the destination (e.g., confident for the US, humble/evidence-based for Germany).

**Architectural Takeaway for IDE/Dossier Weaving:** Because the `narrative_documents` table stores the structured form data separately from the `raw_text` versions, the `DossierOrchestrator` can pull the user's raw skillset matrices (for charts) *and* their highest-scoring, fully-written documents (for the appendix) without ever needing the frontend to parse or merge this data client-side.

Here is the high-level, MECE architectural expansion for **4\. THE EVENT BUS TAXONOMY (Telemetry & Gamification)**.

To prevent tight coupling between the microservices (where the Forge has to "know" about the Companion), Olcan Compass v2.5 uses an **Event-Driven Architecture (Pub/Sub)**. This is the central nervous system of the platform. For the `DossierOrchestratorService` to generate the PDF export, it relies heavily on this event ledger to calculate the user's "Execution Momentum" and generate accurate timeline charts.

---

### **4\. THE EVENT BUS TAXONOMY (Telemetry & Gamification)**

The Event Bus is a centralized emitter system that standardizes how user actions across isolated domains trigger UI changes, gamification rewards, and analytics.

#### **4.1 The Universal Event Catalog (The "Triggers")**

Every action in the system fires a strictly typed event payload. The IDE and backend must utilize these exact string enumerations to ensure the orchestration layer works properly:

* **Assessment & Identity Events:** `assessment.started`, `assessment.completed`, `archetype.assigned`.  
* **Route & Execution Events:** `route.selected`, `route.milestone_completed`, `route.sprint_created`.  
* **Artifact/Forge Events:** `document.created`, `document.saved`, `document.polished`, `document.version_saved`, `document.exported`.  
* **Interview Events:** `interview.started`, `interview.completed`, `interview.score_improved`.  
* **Application & Real-World Events:** `application.created`, `application.submitted`, `application.status_changed`.  
* **Marketplace Events:** `marketplace.booking_created`, `marketplace.review_submitted`.  
* **Engagement Events:** `user.daily_active`, `user.streak_updated`.

**Event Payload Schema (JSONB):** Every event broadcasts a payload containing `{ event_type, user_id, timestamp, metadata_json }`. The metadata holds context (e.g., the specific `olcan_score` achieved during a `document.polished` event).

#### **4.2 The Gamification & Evolution Bridge (The "Aura" Engine)**

The system listens to the Event Bus to drive the "Retention Shell"—specifically the user's Aura (Companion) and their RPG-style progression. This is mapped via two core bridges:

* **`initGamificationBridge()`**: Tracks achievement progress, daily/weekly quests, and streak multipliers based on event frequency.  
* **`initCompanionEvolutionBridge()`**: Grants specific XP to the companion based on the strategic weight of the event.  
  * *Micro-actions:* `document.created` (+20 XP), `document.polished` (+30 XP).  
  * *Macro-actions:* `interview.completed` (+60 XP), `route.milestone_completed` (+80 XP).  
  * *Irreversible execution:* `application.submitted` (+150 XP).

#### **4.3 Analytical Persistence (The "Append-Only" Ledger)**

For the Dossier to generate a "Velocity/Momentum" graph, these events must be permanently stored.

* The backend pipes all event emissions into an append-only `analytics_events` PostgreSQL table.  
* **Subelements for System Management:**  
  * `event_type` (`String`): The canonical event name.  
  * `metadata_json` (`JSONB`): Captures the state delta (e.g., `{ "previous_score": 65, "new_score": 82 }`).  
  * This structure allows the system to aggregate analytics daily without slowing down the primary transactional database.

#### **4.4 Real-Time Telemetry (WebSocket Broadcasting)**

To make the UI feel "alive" while the user is executing tasks, the event bus is wired to a WebSocket endpoint (`/api/websocket`). When a user finishes an AI interview, the backend processes the score and broadcasts an `interview.completed` event. The frontend instantly intercepts this, firing a Confetti Level-Up modal and updating the Gamification Panel without requiring a page refresh.

---

**Architectural Takeaway for IDE/Dossier Weaving:** By standardizing these events in the backend, the `DossierOrchestrator` does not need to perform expensive, complex JOIN queries across 20 different tables to figure out how active a user has been.

To populate the **"Execution Momentum"** chart on the Master Dossier PDF, the Orchestrator simply queries the `analytics_events` table for a specific `user_id` over the last 30 days. It groups the events by type, counts the `route.milestone_completed` and `document.polished` logs, and formats this timeline directly into the Jinja2 PDF template. This guarantees a mathematically accurate visualization of the user's velocity without any "AI slop" or frontend hallucination.

