# **Compass by Olcan — Product Requirements Document (PRD)**

*"The only tool that takes you from 'I want to work or study abroad' to 'I have a plan, a portfolio, and a next step' — in one place."*

\<aside\> 🧭

**Concept Stage** — This PRD documents the full product vision, UX architecture, technical stack, monetization model, and go-to-market strategy for Compass, Olcan's flagship SaaS product. It is a productization of Olcan's existing intellectual framework — not an invention, but a translation.

\</aside\>

---

# **Vision**

Internationalization is not a transaction. It is a **cognitive and emotional operating system** that people need to run continuously over months or years. The person navigating this journey doesn't need a consultant to tell them what to do once — they need a co-pilot that mirrors their internal logic back to them as structured, executable action.

Compass exists to close the gap between *intention* and *execution* for people pursuing an international life — professional, academic, or otherwise. It transforms Olcan's proprietary framework (Search → Think → Write) into a navigable, personalized, and emotionally-aware product that scales beyond 1-to-1 mentorship.

The positive change it brings about: **someone who starts confused and paralyzed ends the journey with a plan, a portfolio, and the clarity to act.**

---

### **🎯 Visão**

---

**Market**: Global mobility and internationalization — career development, graduate admissions, immigration, and digital nomadism — with a primary lens on users from the **Global South** (Brazil, Colombia, Nigeria, Indonesia), underserved by US/EU-centric tools.

**Segments**:

* Young professionals (25–35) seeking international career repositioning  
* Graduate school applicants targeting programs in Europe, North America, or Asia  
* Scholarship hunters (Fulbright, DAAD, Erasmus, CNPq)  
* Corporate expats navigating relocation without institutional support  
* Digital nomads formalizing their international work structure

**Target User**: Someone who is intellectually capable, professionally ambitious, emotionally stuck, and currently underserved by tools that were built for US users with institutional backing.

### **🎱 Needs**

---

**The core problem**: Users know they want to internationalize. They do not know *where to start*, *what order to follow*, *whether they are ready*, or *what is actually blocking them* (hint: it is rarely information — it is fear and decision paralysis).

**What existing tools fail to provide**:

* A diagnostic that identifies *who* the user is before telling them *what* to do  
* A structured journey that covers information, decision-making, AND document production in one place  
* An emotional layer that names and addresses fear as a legitimate product feature  
* Mentorship that is embedded in context, not bolted on as a booking link

**Benefit delivered**: A user who completes a Compass route has a validated self-map, a curated opportunity list, a built and scored application portfolio, and at least one async mentorship touchpoint — all in one workspace.

### **💡 Product**

**What it is**: A modular SaaS with four integrated layers — Diagnostic Engine, Route Modules (FIND / DECIDE / BUILD), Async Mentorship, and Sprint Accountability — built around Olcan's proprietary personas and fear architecture.

**What makes it stand out**:

* The only tool that starts with *who you are*, not *what you want*  
* Fear architecture embedded in the UX — blockers are named and reframed, not ignored  
* Document production and strategic planning in the same workspace  
* Mentorship is a precision tool attached to specific artifacts, not a vague coaching call

**Feasibility**: High. The framework, personas, rubrics, and content already exist inside Olcan's workspace. The build is a translation of existing intelligence into a navigable product interface. MVP does not require AI — it is rule-based with progressive LLM enhancement in v2.

### **💼 Business Goals**

**Short-term (0–6 months)**:

* Validate the diagnostic accuracy and FIND/DECIDE/BUILD loop with 30 beta users  
* Achieve 60%+ task completion rate on route modules  
* Reduce mentor preparation time by 50% via structured mentorship requests

**Medium-term (6–18 months)**:

* Reach R$50k MRR through subscription tiers  
* Launch B2B pilot with 2 Brazilian universities or HR departments  
* Build a document dataset of 500+ successful internationalization applications

**Long-term (18+ months)**:

* Establish category ownership in the "internationalization operating system" space  
* Launch white-label version for institutional partners  
* Use document dataset as LLM training asset and benchmarking engine

---

## **🧬 The Diagnostic Engine — Onboarding as Identity**

The first interaction is not a form. It is a **conversation that ends in a Mirror** — a personalized map that shows the user themselves in a system that speaks their language.

The diagnostic takes **8–12 minutes** and produces four outputs:

| Output | What it reveals | User-facing label |
| ----- | ----- | ----- |
| Profile Archetype | Maps to Olcan's 12 personas; identifies the user's internationalization personality type | "The Technical Bridge Builder", "The Institutional Escapee", "The Scholarship Cartographer", etc. |
| Fear Cluster | Identifies the dominant emotional blocker: Competence Fear, Rejection Fear, Loss Fear, or Irreversibility Fear | Never labeled as "fears" — surfaced as "what tends to slow people like you down" |
| Route Match | Scores the user's fit for each route (Academic, Corporate, Nomad, Scholarship/Civic) with confidence percentages | "Your strongest match: Academic Route (78%)" |
| Readiness Score | Three-axis readiness assessment: Informational, Emotional, Operational | Radar chart visualization — shows gaps without being demotivating |

**Paywall logic**: The diagnostic is free and completed before any subscription prompt. The user sees their archetype name and fear cluster summary — but the full route map, recommended programs, and BUILD templates are behind the Core tier. This is the *aha-moment paywall*: you've already seen yourself in the mirror, now you need the directions.

**Technical implementation**:

* Conversational branching questionnaire (not a linear form)  
* Weighted scoring model — no AI required at MVP  
* Each question branches based on prior answers (decision tree with \~60 nodes)  
* Results stored in `Profile` entity linked to `User`  
* Progressive LLM enhancement in v2: GPT-4o generates a personalized narrative summary of the diagnostic results

---

## **🗺️ The Dashboard — Your Operating Map**

Not a task list. Not a feed. A **living map** structured around the three core operations.

╔══════════════════════════════════════════════════════════╗  
║   WHERE YOU ARE                  WHAT TO DO NEXT         ║  
╠══════════════════╦═══════════════════════════════════════╣  
║  🔍 FIND         ║   Programs, visas, deadlines          ║  
║  🧠 DECIDE       ║   Your strategy & tradeoffs           ║  
║  ✍️ BUILD        ║   CV, essays, portfolios              ║  
╚══════════════════╩═══════════════════════════════════════╝

Each section surfaces:

* **Current progress** — % complete with meaningful framing, not just a bar ("You've identified your top 3 programs. One deadline is 6 weeks away.")  
* **Next atomic action** — one specific, unambiguous next step  
* **Blockers** — emotional \+ operational flags that the user has self-reported or that the system infers from inactivity

The dashboard is **route-aware**: a user on the Academic Route sees different content than a user on the Corporate Route, even though the three-operation structure is identical.

---

## **🧩 Route Modules — Feature Specification**

Each of the four routes (Academic, Corporate, Nomad, Scholarship) is a self-contained module. Below is the full feature specification per operation zone.

### **🔍 FIND — Information Architecture**

**Curated Opportunity Database**

* Maintained databases (not scraped dumps) of programs, companies, visa types, scholarships, and deadlines  
* Data model: `Opportunity { id, type, country, language_requirements, budget_range, deadline, match_score, tags }`  
* **Match Score**: calculated per user based on diagnostic outputs (language, country of origin, field, budget, timeline) — not generic, not based on popularity  
* Smart filters: language requirement, country, field, funding type, application difficulty  
* "Watchlist" feature: user saves opportunities and receives deadline nudges  
* Database update cadence: weekly for scholarships, monthly for programs, quarterly for visa types

**Discovery Feed**

* Personalized feed of newly added opportunities matching the user's profile  
* "You haven't explored this region yet" prompts — surfaces blind spots in the user's search behavior

---

### **🧠 DECIDE — Decision Framework Engine**

**Interactive Route Selector Matrix**

* The static decision matrix from Olcan's framework becomes a live tool  
* User inputs their own weights for criteria (salary vs. prestige vs. flexibility vs. proximity to family)  
* System recalculates the optimal route in real time  
* Visual output: bar chart showing route scores with the user's own weights applied

**Scenario Builder**

* *"If I apply this year vs. next year, here's what changes"*  
* Variables: profile strength (current vs. projected), competition level (trend data), funding availability, language certification timeline  
* Output: a two-column comparison card the user can annotate and save

**Fear Reframe Cards**

* Triggered automatically when a user marks a task as "blocked" or goes inactive for 5+ days on a specific task  
* Card structure: (1) names the underlying fear pattern without clinical language, (2) offers a reframe drawn from Olcan's coaching library, (3) shows a case study of a similar user who moved through the same block  
* Cards are contextual — a "Rejection Fear" card triggered in the BUILD zone looks different from one triggered in the FIND zone  
* User can dismiss, save to journal, or request a mentorship session directly from the card

**Tradeoff Journal**

* Structured space for the user to document their reasoning at key decision points  
* Prompts: "What are you afraid of losing?", "What would you regret more: trying and failing, or not trying?"  
* Journal entries are private but can be optionally shared with a mentor as context

---

### **✍️ BUILD — Document Production Engine**

**Document Factory**

* Tiptap-based rich text editor, Notion-like block experience  
* Pre-loaded templates for: Motivation Letter, Statement of Purpose, CV (by destination country convention), LinkedIn bio update, Scholarship personal statement, Cover letter (corporate route)  
* Templates are route-aware and persona-aware: a "Technical Bridge Builder" gets different prompts than an "Institutional Escapee"

**Smart Inline Guidance**

* The editor monitors document structure in real time and surfaces contextual prompts:  
  * *"You haven't addressed your 'why now' — this is the most common rejection trigger for this program type"*  
  * *"Your introduction is 3x longer than the recommended length for German university applications"*  
  * *"Missing: a concrete quantitative achievement in paragraph 2"*  
* Prompts are rule-based at MVP (rubric-driven), LLM-enhanced in v2

**Olcan Score**

* A rubric-based document evaluation — not AI fluff, a real scoring system derived from Olcan's coaching experience  
* Dimensions: Clarity, Specificity, Emotional Resonance, Structural Coherence, Destination-Country Fit  
* Score displayed as a 0–100 with dimension breakdown and specific improvement suggestions  
* Score history: user can see how their document has improved across versions

**Version History**

* All document saves are versioned automatically  
* User can restore any previous version  
* Version diff view: see exactly what changed between versions  
* Versions can be tagged ("sent to mentor", "submitted to program", "pre-feedback")

**Export Engine**

* Export to PDF with formatting appropriate to destination country conventions (e.g., photo on CV for Germany, no photo for US, A4 vs. Letter paper size)  
* Export to Word (.docx) for programs that require editable format  
* Filename auto-generated: `[User_LastName]_[DocumentType]_[Program]_[Date].pdf`

---

## **👤 Mentorship Layer — Embedded Async Model**

### **The Problem with Bolted-On Mentorship**

Most platforms add a "book a session" button. This creates: vague calls with no context, mentor time wasted on background-gathering, and user anxiety about "wasting" the session.

### **The Compass Approach**

**Structured Mentorship Request**

* User flags a specific document section, decision node, or blocked task with *"I need a human here"*  
* System generates a structured brief automatically:  
  * Route and current stage  
  * The specific artifact (document section, decision matrix, blocked task)  
  * The user's specific question (prompted, not free-form)  
  * Relevant diagnostic context (archetype, fear cluster, readiness score)  
* Mentor receives a brief that takes 2 minutes to read and requires zero clarification before responding

**Async Response Formats**

* Written annotation (inline on the document or decision node)  
* Audio message (recorded directly in the platform)  
* Loom video (linked via Loom API, embedded in context)

**Mentorship Credit System**

* Credits are purchased or included in subscription tier  
* Each credit \= one structured request \+ one async response cycle  
* Follow-up questions within the same thread: free (up to 2\)  
* Credit usage visible on dashboard: *"2 mentorship credits remaining this month"*

**Mentor Dashboard (internal tool)**

* Mentors see a queue of structured requests, sorted by urgency and type  
* Response time SLA: 48 hours for async responses  
* Mentor can escalate to a live session (charged separately) if the request complexity warrants it  
* Mentors can flag patterns in requests → feeds back into the rubric and Fear Reframe Card library

---

## **⏱️ Sprint Accountability System**

### **Sprint Structure**

* User commits to a **2-week sprint** with a declared output (e.g., *"First draft of motivation letter \+ shortlist of 5 programs"*)  
* System breaks the declared output into suggested atomic tasks (user can edit)  
* Each task has a type tag: FIND, DECIDE, or BUILD

### **Nudge Engine**

Not *"don't forget\!"* — contextual, progress-aware nudges:

* *"You said you'd finish the program shortlist. You're at 3 of 5\. Here are 2 more that match your profile based on your updated language score."*  
* *"You haven't opened your motivation letter draft in 4 days. Your deadline for \[Program X\] is in 18 days."*  
* *"You completed the FIND phase faster than 80% of users on the Academic Route. You're ready to move to DECIDE."*

Nudges are delivered via: in-app notification, email (Resend), and optionally WhatsApp (v2, via Twilio or Z-API for Brazil).

### **Sprint Review**

End-of-sprint screen:

* What was completed (with checkmarks, not just a percentage)  
* What was blocked (with the recorded reason)  
* What to carry forward (auto-suggested for next sprint)  
* **Momentum score**: compound metric showing velocity trend across sprints  
* Optional: share sprint summary card with a mentor or accountability partner (shareable link, no login required for recipient)

---

## **🎨 Design System & UX Principles**

### **Visual Identity Mapping**

| Brand Element | SaaS Expression |
| ----- | ----- |
| Deep Blue `#001338` | Primary background in dark mode; primary text in light mode |
| Metamodernist fire symbolism | Animated onboarding illustration; progress milestones use fire/spark motif |
| Merriweather Sans \+ Source Sans | Merriweather Sans for headings and score displays; Source Sans for body and UI labels |
| Transformation narrative | Progress is framed as journey stages, not percentages — "You're in the Mapping Phase" |

### **Core Design Principles**

1. **Calm, not gamified** — no streaks, no points, no confetti. Life-changing decisions deserve a tool that feels serious. Progress feels like *clarity*, not dopamine.  
2. **Dark mode as default** — signals seriousness and global sophistication; resonates with the knowledge worker and developer-adjacent segment that is a primary early adopter.  
3. **Maps and flows over lists** — the user's journey is always shown as a spatial map or flow diagram, never as a flat checklist.  
4. **Generous whitespace \+ strong typographic hierarchy** — document-editing sections must feel like a premium writing tool (think Linear meets Notion).  
5. **Emotional vocabulary in microcopy** — the app talks like Olcan, not like a SaaS dashboard. *"What's slowing you down?"* not *"Add blocker"*. *"Your next move"* not *"Next task"*.

### **Accessibility**

* WCAG AA compliance from day one  
* All color choices tested for 4.5:1 contrast ratio minimum  
* Keyboard navigation for all critical flows  
* Screen reader compatibility for diagnostic and document editor

---

## **🏗️ Technical Architecture**

### **Frontend**

| Layer | Choice | Rationale |
| ----- | ----- | ----- |
| Framework | Next.js 14 (App Router) | Fast to build, excellent TypeScript support, ISR for opportunity database pages |
| Styling | Tailwind CSS \+ shadcn/ui | Rapid UI development with accessible primitives |
| Editor | Tiptap (open source) | Highly extensible, Notion-like, supports custom extensions for inline guidance |
| State | Zustand \+ React Query | Local UI state \+ server state management |
| Charts | Recharts | Readiness radar, route selector matrix, sprint velocity |

### **Backend**

| Layer | Choice | Rationale |
| ----- | ----- | ----- |
| Database | Supabase (Postgres) | Row-level security for multi-tenancy, real-time subscriptions, zero infra overhead at MVP |
| Auth | Supabase Auth | Email/password \+ Google OAuth \+ magic link |
| Storage | Supabase Storage → S3-compatible | Documents, exported PDFs, mentor audio/video responses |
| API | Next.js Route Handlers \+ tRPC | Type-safe API layer, no separate backend service needed at MVP |
| Background jobs | Inngest | Sprint nudge scheduling, deadline reminders, async processing |

### **Payments & Commerce**

| Service | Purpose |
| ----- | ----- |
| Stripe | Subscriptions, one-time purchases, credit top-ups |
| Hotmart | Brazilian market continuity, PIX support, affiliate program infrastructure |
| Stripe Billing Portal | Self-serve plan changes, invoice history |

### **Communications**

| Service | Purpose |
| ----- | ----- |
| Resend | Transactional email (sprint nudges, deadline alerts, mentor responses) |
| React Email | Email templates matching Compass visual identity |
| Loom API | Embedded mentor video responses |
| Twilio / Z-API (v2) | WhatsApp nudges for Brazilian users |

### **🤖 AI Layer — Compass AI (Powered by Google Vertex AI)**

*Compass AI is not a chatbot. It is a silent co-pilot embedded in each zone — surfacing when you need it, invisible when you don't.*

**Infrastructure**: Google **Vertex AI** \+ **Gemini Pro** (accessed via Google Antigravity for Startups credits), with **text-embedding-004** for semantic search and document matching. Hosted on **Cloud Run** (serverless, auto-scaling). No OpenAI dependency.

#### **Progressive Rollout Strategy**

| Version | Name | What it does | When |
| ----- | ----- | ----- | ----- |
| v1 | Rule-Based Engine | All scoring, guidance, and reframes are deterministic — rubric-driven, zero hallucination risk. MVP ships this. | MVP (0–3 months) |
| v2 | LLM-Enhanced | Gemini Pro generates personalized diagnostic narratives, document coaching comments, and Fear Reframe Card text. Guardrails prevent hallucinated program info. | Beta → Public (3–9 months) |
| v3 | Fine-Tuned | Gemini fine-tuned on Compass's anonymized document dataset. Benchmarking against successful applications from similar profiles. | Scale (12–24 months) |

#### **How Compass AI is Embedded Per Zone**

**🔍 FIND — Semantic Opportunity Matching**

* **What it does**: Uses `text-embedding-004` to embed user profile data (archetype, readiness scores, language certs, field of interest) and match against the opportunity database using cosine similarity — not keyword filters.  
* **User experience**: *"Based on your profile, these 3 programs have the highest fit score — here's why each one maps to your archetype and readiness level."*  
* **What it doesn't do**: It never invents program details. Opportunity data is curated by humans; AI only ranks and explains, never fabricates.  
* **Guardrail**: All opportunity data is sourced from the Compass-maintained database. Gemini prompt explicitly instructed: *"Only reference programs that appear in the provided context. If a program is not in the context, do not mention it."*

**🧠 DECIDE — Diagnostic Narrative & Fear Reframe**

* **What it does**: After the rule-based scoring engine produces the archetype \+ readiness scores, Gemini Pro generates a **2–3 paragraph personalized narrative** — written in Olcan's voice — that explains the user's profile back to them in human language.  
* **Fear Reframe Cards (AI-enhanced)**: The card structure (fear identification → reframe → case analogy) is populated by Gemini using the user's specific diagnostic data. A "Rejection Fear" card for a scholarship-route user reads differently from one for a corporate-route user.  
* **User experience**: Not *"You scored 78% on Academic Route"* — but *"Your profile suggests someone who already knows the answer but is waiting for permission to trust it. The Academic Route aligns with your pattern-recognition strengths — what's slowing you down is likely not information, it's the fear that you're not 'academic enough'. You are."*  
* **Guardrail**: Gemini output is post-processed to strip any specific program names or admission rate claims. Narrative is emotional and reflective, never factual about external institutions.

**✍️ BUILD — Document Coaching**

* **What it does**: Gemini Pro reads the user's draft document (Statement of Purpose, Motivation Letter, etc.) and provides structured feedback — paragraph by paragraph — framed around the Olcan Score rubric dimensions.  
* **Coaching format**: Not a rewrite. Not generic suggestions. Specific, rubric-anchored observations:  
  * *"Your 'why now' is buried in paragraph 4\. For German university admissions committees, this needs to be in the first 3 sentences."*  
  * *"You've mentioned 'passion' 4 times. This flags as vague in the Specificity dimension. Replace with a concrete moment or decision."*  
* **Document embedding**: Successful documents (with user consent) are embedded and stored. When a user is writing a motivation letter for a European master's, Compass AI can surface: *"Here's how 3 successful applicants from similar profiles opened their letters for this program type."* — without exposing the original documents.  
* **Guardrail**: Feedback is always framed as *suggestions*, never as corrections. The system prompt includes: *"You are a writing coach, not an editor. Suggest, don't rewrite. Never claim a document will or won't be accepted."*

#### **AI Safety Architecture**

\<aside\> 🔒

**Non-Negotiable Guardrails**

* **No hallucinated program information**: Gemini is never given a task that requires it to produce facts about specific programs, deadlines, or admission rates from general knowledge. All factual content comes from the Compass-curated database, injected into the prompt as context.  
* **Rubric-first approach**: Document coaching is always anchored to the Olcan Score rubric dimensions. Gemini cannot invent new evaluation criteria.  
* **Confidence framing**: Any AI-generated output that could be construed as a prediction ("this essay will be successful") is blocked at the prompt level and at the output filter level.  
* **User agency preserved**: Compass AI always presents options and observations — never instructions. The UX framing is *"one perspective to consider"*, not *"you must do this."*  
* **Audit trail**: Every AI-generated output is logged with the prompt version, model version, and timestamp. Users can flag outputs as unhelpful, which feeds into prompt improvement. \</aside\>

#### **Technical Implementation (Vertex AI \+ Google Antigravity)**

// Compass AI Architecture  
Vertex AI (Google Cloud)  
├── Gemini Pro — narrative generation, document coaching, fear reframes  
├── text-embedding-004 — opportunity matching, document similarity  
└── Cloud Run — serverless inference endpoint (auto-scales to zero)

Antigravity Credits Usage  
├── Vertex AI API calls (Gemini Pro)  
├── Cloud Run compute (inference jobs)  
└── Cloud Storage (embedded vector store)

Setup Requirements (Phase 0\)  
├── Apply to Google Antigravity for Startups  
├── Create GCP Project \+ enable Vertex AI, Cloud Run, Cloud Build APIs  
├── Configure Service Account with Vertex AI User role  
├── Set GOOGLE\_APPLICATION\_CREDENTIALS in Vercel env vars  
└── Supabase pgvector extension for storing embeddings

**Embedding storage**: `pgvector` extension on Supabase Postgres. Opportunity embeddings (\~5k vectors at launch), document fragment embeddings (grows with user base). No external vector DB required at MVP scale.

**Cost estimate at MVP scale** (100 active users):

* Gemini Pro: \~$0.02–0.08 per diagnostic narrative  
* Document coaching session: \~$0.05–0.15 per session  
* Embedding generation: \~$0.0001 per 1k tokens  
* Antigravity credits significantly reduce or eliminate these costs during the startup program period

### **Analytics & Observability**

| Service | Purpose |
| ----- | ----- |
| PostHog | Product analytics, funnel analysis, feature flags, session recordings |
| Sentry | Error monitoring and performance tracking |
| Logflare / Axiom | Log aggregation |

---

## **🗃️ Data Model**

User  
├── id, email, name, locale, created\_at  
└── Profile  
    ├── archetype\_id (FK → Archetype)  
    ├── fear\_cluster: enum \[competence, rejection, loss, irreversibility\]  
    ├── route\_scores: JSON { academic: 78, corporate: 45, nomad: 30, scholarship: 60 }  
    ├── readiness: JSON { informational: 65, emotional: 40, operational: 55 }  
    └── diagnostic\_completed\_at

Archetype  
├── id, name, slug, description  
└── fear\_cluster\_primary, route\_affinity

Route (Academic | Corporate | Nomad | Scholarship)  
├── id, slug, name  
└── Modules (FIND | DECIDE | BUILD)  
    └── Tasks (many, ordered)  
        ├── type: enum \[find, decide, build\]  
        ├── title, instructions, estimated\_minutes  
        └── blocker\_flag, blocker\_reason, blocked\_at

Sprint  
├── user\_id, route\_id  
├── declared\_output, start\_date, end\_date  
├── status: enum \[active, completed, abandoned\]  
├── momentum\_score  
└── SprintTasks (many, linked to Route Tasks)  
    └── completed\_at, carried\_forward

Document  
├── user\_id, route\_id, template\_type  
├── title, content (JSON — Tiptap format)  
├── olcan\_score, score\_dimensions (JSON)  
└── DocumentVersions (many)  
    └── content, created\_at, tag

MentorshipRequest  
├── document\_id OR task\_id (polymorphic)  
├── user\_id, mentor\_id  
├── brief\_context (JSON — auto-generated)  
├── user\_question  
├── status: enum \[pending, in\_progress, responded, closed\]  
└── MentorResponses (many)  
    ├── format: enum \[text, audio, video\]  
    └── content\_url, created\_at

Opportunity  
├── type: enum \[program, company, visa, scholarship\]  
├── name, country, language\_requirements, deadline  
├── budget\_range, field\_tags  
└── UserOpportunityMatch  
    ├── user\_id, match\_score  
    └── watchlisted, applied\_at

Organization (B2B)  
├── id, name, plan\_type  
├── seat\_count, admin\_user\_id  
└── OrganizationMembers (many)  
    └── user\_id, role: enum \[admin, member\]

### **Multi-tenancy Strategy**

* **MVP (B2C)**: Row-level security in Supabase ensures complete user data isolation. No shared state between users.  
* **B2B**: `Organization` entity added. Org admins can view aggregate analytics (completion rates, sprint velocity by cohort) but cannot access individual user documents. LGPD/GDPR-compliant by design.

### **Security & Compliance**

* **Encryption at rest**: all documents and diagnostic data encrypted at the database level (Supabase transparent encryption \+ application-level for especially sensitive fields)  
* **LGPD (Brazil)**: cookie consent banner, data export endpoint (JSON), data deletion flow (soft delete → hard delete after 30 days)  
* **GDPR**: privacy policy, DPA template for B2B clients, right to erasure, data portability  
* **CSP headers, HTTPS enforced, rate limiting** on all API routes from day one

---

## **💰 Monetization Architecture**

| Tier | Name | Price (BRL) | What it includes |
| ----- | ----- | ----- | ----- |
| Free | Compass Lite | R$0 | Full diagnostic \+ archetype card \+ fear cluster summary \+ dashboard preview (read-only) \+ 1 route preview (FIND only, no save) |
| Core | Compass | R$79/mo · R$690/yr | Full access to 1 route (all 3 operations), 2 active documents, sprint system, Olcan Score, export to PDF |
| Pro | Compass Pro | R$149/mo · R$1.290/yr | All 4 routes, unlimited documents, 2 mentorship credits/month, priority opportunity database updates, scenario builder, version history |
| Intensive | Compass Sprint | R$490 one-time | 4-week structured sprint, 2 mentorship sessions (live or async), sprint reviews with mentor, dedicated support queue |
| Credits | Mentorship Credits | R$89/credit · R$240 for 3 | 1 structured async mentorship request \+ response cycle \+ 2 follow-up messages |
| B2B | Compass for Teams | Custom (per seat) | Org admin dashboard, aggregate analytics, custom route configuration, white-label option, dedicated account manager |

### **Revenue Logic**

* **Free tier** is a lead magnet and top-of-funnel for Olcan's content ecosystem (newsletter, social, Hotmart products). The diagnostic result card is *designed to be shared* — it is the viral loop.  
* **Annual subscriptions** are incentivized (equivalent to \~27% discount on Core, \~28% on Pro). Annual subscribers have dramatically lower churn and higher LTV.  
* **Mentorship credits** are the primary upsell path from software to human time — Olcan's highest-margin product. The credit model removes the psychological barrier of committing to a recurring coaching fee.  
* **Compass Sprint** is a time-boxed intensive designed to capture users who have hit a wall and need a forcing function. High conversion from Pro users who are stalled.  
* **B2B** is the medium-term growth lever: corporate relocation programs, scholarship offices, international student services at Brazilian universities.

### **Pricing Psychology**

* The diagnostic result is free but incomplete — users see their archetype and fear summary, but not the full route map or BUILD templates without subscribing.  
* The *aha moment* happens before the paywall — the user has already seen themselves in the mirror. The subscription is the directions, not the self-knowledge.  
* Annual pricing is displayed prominently with the monthly equivalent ("R$57.50/mês, cobrado anualmente") to anchor perception.

---

### **🤼 Competitors**

---

**Leland**: Coach marketplace. No framework, no tool, no autonomy. Compass replaces the need for a coach at the structured information \+ decision layer.

**Crimson Education**: R$15k+ elite consulting. No product layer. Compass democratizes the same outcome.

**Novoresume / Rezi**: Single-artifact (CV) focus. No journey logic, no emotional layer, no strategy.

**Pathrise**: US-centric, tech-only, ISA model. No diagnostic, no emotional architecture, no Global South positioning.

**Immigram / Boundless**: Purely administrative — legal forms and visa checklists. Zero career development or application strategy.

**ApplyBoard**: Directory of programs. No personalization engine, no decision framework, no document production.

**The White Space**: No competitor combines diagnostic \+ route-specific toolkits \+ emotional scaffolding \+ async mentorship in a single cohesive product. Compass owns this space by default.

### **🌊 Revenue Streams**

---

1. **SaaS Subscriptions** (Core \+ Pro — monthly and annual)  
2. **One-time Intensive** (Compass Sprint)  
3. **Mentorship Credits** (à la carte)  
4. **B2B Seat Licenses** (Organizations)  
5. **White-label Licensing** (partner institutions — universities, NGOs, HR departments)  
6. **Document Benchmarking API** (v3+): institutions pay to benchmark their applicants' documents against Compass's anonymized dataset  
7. **Affiliate/Partner Revenue**: Olcan earns referral fees from programs, language schools, and visa services surfaced in the FIND module

### **💰 Cost Factors**

---

**Development (MVP)**

* Frontend \+ backend engineering: 2 developers × 3 months  
* UX/UI design: 1 designer × 6 weeks  
* Content: rubric development, template library, Fear Reframe Card library (Olcan IP → productized)

**Infrastructure (monthly at scale)**

* Supabase Pro: \~$25/mo  
* Vercel Pro: \~$20/mo  
* Resend: \~$20/mo (volume-dependent)  
* PostHog Cloud: \~$0–$450/mo (usage-dependent)

**Ongoing**

* Opportunity database curation: 4h/week (intern or VA)  
* Mentor pool management and onboarding  
* Content updates (rubrics, templates, Fear Reframe Cards)  
* Customer support (async, low volume at MVP)

**AI (v2)**

* OpenAI API: \~$0.01–$0.05 per document evaluation at current pricing

### **📢 Channels**

---

**Existing channels (day one)**

* Olcan newsletter and content ecosystem  
* Hotmart customer base (past purchasers of Sem Fronteiras and Mentorias Olcan)  
* LinkedIn (Olcan's primary professional channel)  
* Instagram (emotional/aspirational content)

**Growth channels**

* **SEO**: content mapped to the 12 archetypes — pages optimized for queries like "how to apply for a European master's from Brazil", "Fulbright application guide for Brazilians"  
* **Archetype Card virality**: users share their diagnostic result as a card on LinkedIn/Instagram — designed for shareability  
* **B2B partnerships**: university international offices, HR departments with relocation programs  
* **Community**: Discord or Circle community for Compass users — peer accountability, country-specific channels

**Do these channels exist today?** Yes — Olcan's content infrastructure is already operational. Compass inherits it from day one.

---

## **🚀 Go-to-Market Roadmap**

### **Phase 1 — Closed Beta (0–3 months)**

* Recruit 30 users from existing Hotmart customers and Zenklub session alumni  
* Full access, no paywall, no friction  
* Weekly feedback calls (structured: clarity score, task completion rate, blocker mapping)  
* **Success criteria**: 70%+ of users complete the diagnostic; 50%+ complete at least one full DECIDE module; qualitative validation that the fear architecture resonates

### **Phase 2 — Public Beta \+ Content Amplification (3–6 months)**

* Launch with the **Compass Archetype Card** as the viral mechanic: users share their result on LinkedIn/Instagram  
* SEO content mapped to archetypes: *"Are you a Technical Expat in Formation? Here's your internationalization map"*  
* Paywall activated at end of beta; early users offered founding member pricing (lifetime 30% discount)  
* **Success criteria**: 200 paying subscribers; NPS ≥ 50; churn \< 8%/month

### **Phase 3 — B2B Expansion (6–18 months)**

* Partner with 3 Brazilian universities' international offices (pilot: USP, UNICAMP, PUC-Rio)  
* Pitch to HR departments of multinationals with Brazil-based relocation programs  
* Launch **"Powered by Olcan"** white-label option: institution gets branded version with custom route ("our company's relocation playbook")  
* **Success criteria**: 3 B2B contracts signed; B2B ARR \> R$120k

---

## **🛡️ Defensibility — The Unique Bets**

\<aside\> 🔒

**1\. The Diagnostic as Identity**

Users come back because their profile is *in there*. The switching cost is psychological, not technical. No competitor can replicate this without Olcan's persona library — which is proprietary IP built over years of coaching.

\</aside\>

\<aside\> 😮

**2\. The Fear Architecture**

No competitor names the emotional layer. Olcan owns the territory of *"the SaaS that understands why you're stuck, not just what to do."* This is a positioning moat that gets stronger as the Fear Reframe Card library grows.

\</aside\>

\<aside\> 📊

**3\. Document Quality as Network Effect**

As more users write essays and CVs in the platform, Compass builds the world's most comprehensive dataset of internationalization applications from the Global South. This becomes: an LLM training asset, a benchmarking tool (*"Your motivation letter scores in the top 23% of academic-route applicants to European programs"*), and a competitive intelligence layer that no newcomer can replicate quickly.

\</aside\>

\<aside\> 🔄

**4\. Mentor-to-Tool Feedback Loop**

Every time a mentor flags a pattern in a document, that pattern (with consent) improves the rubric, the inline guidance, and the Fear Reframe Card library. Human intelligence compounds into product intelligence over time.

\</aside\>

\<aside\> 🌍

**5\. Global South Positioning**

Not a localization of a US product — a product *built from* the specific fears, constraints, and structural disadvantages of someone starting from Brazil, Colombia, Nigeria, or Indonesia. The currency, the visa friction, the credential recognition anxiety, the imposter syndrome specific to this context — these are first-class features in Compass, invisible afterthoughts in every competitor.

\</aside\>

---

## **📅 Summary Roadmap**

SHORT TERM  (0–6 months)  
└── Diagnostic engine \+ Academic Route module (MVP)  
    → Validate core loop, prove retention and clarity outcome

MEDIUM TERM (6–18 months)  
└── All 4 routes \+ mentorship layer \+ sprint system  
    \+ B2B pilot (2 organizations)  
    → Prove monetization model, reduce mentor bottleneck

LONG TERM   (18+ months)  
└── Document intelligence engine (embeddings \+ LLM)  
    \+ Network effects (benchmarking)  
    \+ White-label institutional product  
    → Category ownership in Global South internationalization

---

\<aside\> ⚡

**Key Insight**: The SaaS is not a new product — it is Olcan's existing intelligence, made navigable at scale. The framework, personas, fear architecture, and FIND/DECIDE/BUILD logic already exist in this workspace. The build is a translation, not an invention. The moat is already built. The product is the interface to it.

\</aside\>

