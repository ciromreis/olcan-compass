# **PRODUCT REQUIREMENTS DOCUMENT: PROJECT COMPASS**

**CONFIDENTIAL // PE TECHNICAL DILIGENCE**

## **1\. INVESTMENT THESIS & PRODUCT DEFINITION**

**The Asset:** An autonomous, AI-driven career mobility engine designed to systematically route high-skill talent from the Global South to international markets. **The Mechanism:** The platform forces a deterministic progression from psychological paralysis to actionable strategy, and finally to asset production. It monetizes the reduction of execution friction. **The Moat:** High switching costs (identity and strategy lock-in), proprietary psychological frameworks (Fear Reframing), and compounding data network effects (LLM fine-tuning on a growing corpus of successful cross-border applications).

## **2\. SYSTEM ARCHITECTURE & TECH STACK**

To achieve maximum margin expansion and structural defensibility, the architecture mandates a high-performance, low-overhead stack optimized for both mobile-first engagement and deep-focus desktop execution.

### **2.1. Frontend: The Rust/Wasm Presentation Layer**

* **Core Framework:** Rust using **Dioxus** or **Leptos** (compiled to WebAssembly).  
* **Rationale:** Eliminates JavaScript garbage collection bottlenecks. Ensures 60fps rendering of complex topological maps and 3D skill matrices on low-end mobile devices (critical for Global South penetration).  
* **Desktop Strategy:** **Tauri** (Rust-based alternative to Electron). Wraps the Wasm application into a lightweight (\<10MB) native desktop app. Deep-focus document production (The Forge) mandates a premium desktop experience.  
* **State Management:** Reactive signal-based state (native to Leptos/Dioxus) for zero-latency UI updates during network drops.

### **2.2. Backend: The Python Orchestration Layer**

* **Core Framework:** **FastAPI** (Python 3.12+).  
* **Rationale:** Python is the native language of the AI ecosystem. It allows direct, low-latency integration with vector databases, embedding models, and orchestration logic without relying on fragile JS-to-Python microservices.  
* **Task Orchestration:** **Celery** or **ARQ** (Async Redis Queues) for the "Sprint Pacing Engine" (triggering nudges, evaluating user bandwidth states).  
* **Database:** **PostgreSQL** with `pgvector`.  
* **Authentication:** Supabase Auth or Auth0 (abstracted via Python middleware).

### **2.3. AI Inference & Telemetry (AI-First Core)**

* **Primary LLM:** Google Vertex AI (Gemini 1.5 Pro) for deterministic text generation (coaching, reframing).  
* **Semantic Engine:** `text-embedding-004` for multi-dimensional vector matching (mapping User Vectors to Opportunity Vectors).  
* **Strict Guardrails:** Python middleware enforces JSON-schema validation on all LLM outputs before they hit the Rust frontend. Zero hallucination tolerance.

## **3\. CORE MODULE SPECIFICATIONS (THE PIPELINE)**

The user journey is not linear; it is a Directed Acyclic Graph (DAG) controlled by the user's execution state.

### **3.1. Phase 1: Identity Extraction (The Diagnostic)**

**Objective:** Calculate the user's cognitive baseline and structural viability before revealing the paywall.

* **Mechanics:** A mobile-optimized, branching conversational UI.  
* **Data Captured:**  
  * *Operational Vector:* Budget, language proficiency, hard skills.  
  * *Cognitive Vector:* Dominant fear cluster (Competence, Rejection, Loss, Irreversibility).  
  * *Kinetic State:* Current bandwidth (\<2h, 2-5h, 5h+).  
* **Output:** The *Identity Mirror*. A Wasm-rendered radar chart proving the system "understands" the user.  
* **Commercial Trigger:** The system locks the tactical roadmap. Unlocking the roadmap requires subscription (Lite/Core conversion).

### **3.2. Phase 2: Topological Discovery (Search & Think)**

**Objective:** Eliminate opportunity overload through ruthless algorithmic pruning.

* **Semantic Matching:** The Python backend queries `pgvector`. If the user has a "Constrained Budget" and "A2 English," the UI physically redacts high-cost, high-competition English programs.  
* **Scenario Modeling:** A desktop-optimized matrix where users adjust weights (e.g., "Salary" vs. "Visa Ease"). The Rust frontend recalculates ROI projections in real-time.  
* **Psychological Intervention:** If telemetric data shows the user idling on this screen for \>3 sessions (Analysis Paralysis), the Python engine pushes a *Contextual Fear Reframe Card* via WebSocket, addressing their specific diagnosed fear.

### **3.3. Phase 3: The Asset Forge (Build)**

**Objective:** Deep-focus document generation tightly coupled with AI coaching.

* **Interface:** A native-feeling, block-based text editor built in Rust (desktop-first focus).  
* **Contextual Rubric Injection:** As the user types, the Python backend asynchronously streams AI evaluations based on the proprietary *Olcan Score*.  
  * *Example:* If targeting Germany, the AI flags narrative fluff and demands chronological precision.  
* **Version History & Diffing:** Immutable document states stored in Postgres, allowing visual diffs to track improvement.

### **3.4. Phase 4: The Execution Metronome (Sprint)**

**Objective:** Prevent churn caused by overwhelming task lists. Adapt pacing to reality.

* **Algorithmic Chunking:** If the user's Kinetic State is "Constrained (\<2h/week)", the Python backend collapses the 40-step roadmap into a 2-step micro-sprint.  
* **Mobile-First Nudges:** Push notifications (via mobile PWA/Tauri app) focusing on *atomic* actions. ("Open the editor to write 3 bullet points. That is your only task this week.")

### **3.5. Phase 5: Asynchronous Escalation (Mentorship Bridge)**

**Objective:** High-margin monetization. Replace low-margin 1-hour calls with scalable async interventions.

* **Trigger:** "I need a human" button embedded in the Forge or Discovery modules.  
* **Automated Brief Generation:** The system packages the exact document segment, the user's fear archetype, and their kinetic state into a standardized JSON payload.  
* **Mentor Interface:** Internal dashboard where Olcan experts record a 3-minute Loom video or text note.  
* **Economics:** Reduces a R$500/hour synchronous cost center into a 5-minute, high-margin transactional unit.

## **4\. DATA SCHEMA & RELATIONAL LOGIC (PYTHON/SQLALCHEMY)**

Strict relational integrity is required to maintain the orchestration engine.

\# Simplified Schema Representation  
class User(Base):  
    id \= Column(UUID, primary\_key=True)  
    subscription\_tier \= Column(Enum('LITE', 'CORE', 'PRO'))

class CognitiveProfile(Base): \# The "Mirror"  
    user\_id \= Column(UUID, ForeignKey('user.id'))  
    archetype \= Column(String) \# e.g., 'Insecure Corporate Dev'  
    primary\_fear \= Column(String) \# e.g., 'Competence/Imposter'  
    bandwidth\_capacity \= Column(Integer) \# hours per week  
    embedding\_vector \= Column(Vector(768)) \# For semantic matching

class Opportunity(Base): \# The Database  
    id \= Column(UUID, primary\_key=True)  
    requirements\_vector \= Column(Vector(768))  
    \# ... metadata (visas, costs, links)

class KineticSprint(Base): \# The Engine  
    user\_id \= Column(UUID, ForeignKey('user.id'))  
    status \= Column(Enum('ACTIVE', 'STALLED', 'COMPLETED'))  
    allocated\_tasks \= Column(JSONB) \# Dynamically generated by Python backend  
    velocity\_score \= Column(Float)

## **5\. ARTIFICIAL INTELLIGENCE GOVERNANCE**

The platform's valuation relies on trust. Generative AI introduces hallucination risk, which is unacceptable in immigration and career planning.

* **RAG Only:** LLMs have zero access to their parametric memory for factual data. All facts (deadlines, visa laws, program costs) are injected via strictly maintained internal databases (Retrieval-Augmented Generation).  
* **Role Constraint:** The LLM is system-prompted exclusively as a *Structural Editor* and *Psychological Mirror*, never as an Oracle of Truth.  
* **Embedding Pipeline:** Opportunity matching relies on vector distance (Cosine Similarity), a deterministic mathematical operation, rather than generative guessing.

## 

# **PRODUCT REQUIREMENTS DOCUMENT: PROJECT COMPASS (V2.0)**

## **STRICTLY CONFIDENTIAL // ARBITRAGE UNIT**

## **1\. STRATEGIC POSITIONING & THESIS**

## Compass is an **Algorithmic Labor Mobility Operating System**. It systematically eliminates the "Execution Gap" between a user's current domestic stagnation and their international viability.

* ## **The Problem:** Information overload \+ Psychological paralysis (The 4 Fears).

* ## **The Solution:** A deterministic path defined by three operations: **SEARCH (The Oracle)**, **THINK (The Mirror)**, and **WRITE (The Forge)**.

* ## **The Moat:** Proprietary **OIOS Archetypes** and a **Metamodern UX** that oscillates between clinical data density and minimalist focus.

## **2\. TECHNICAL ARCHITECTURE (THE MACHINE)**

### **2.1 Frontend: Rust-Driven Presentation Layer**

* ## **Framework:** **Dioxus** or **Leptos** (compiled to WebAssembly).

* ## **Deployment:** Mobile-first PWA and **Tauri** for Native Desktop execution.

* ## **Rationale:** \* **Performance:** Zero-latency rendering of complex D3 topographical maps and 3D skill matrices on low-end hardware.

  * ## **Security:** Memory safety for sensitive user documents (CVs/Portfolios).

  * ## **Native-Grade UX:** Ensuring the "Build" module (The Forge) feels like a premium IDE, not a web form.

### **2.2 Backend: Python Orchestration Layer**

* ## **Core Framework:** **FastAPI** (Python 3.12+).

* ## **State Machine:** **Pydantic** for strict data validation and **Temporal.io** or **ARQ** for long-running execution workflows (Sprints).

* ## **Vector Database:** **PostgreSQL \+ pgvector** (Supabase) for semantic opportunity matching.

* ## **Rationale:** Python allows direct, low-latency integration with the AI inference pipeline (Gemini Pro) and complex mathematical operations for the "Oracle" pruners.

### **2.3 AI Orchestration (The Brain)**

* ## **Model:** **Gemini 1.5 Pro** via Vertex AI.

* ## **Strategy:** No-hallucination guardrails. The AI is a **Structural Editor** and **Psychological Coach**, never a source of factual information. All factual data (visa dates, program requirements) is injected via RAG from the human-curated Olcan Database.

## **3\. CORE PLATFORM ENGINES (THE LOGIC)**

### **Engine 1: The Deterministic Oracle (SEARCH)**

* ## **Input:** User Pillar 1 (Operational Capital: Language, Budget, Degree).

* ## **Logic:** A multi-stage pruner. It calculates the **Structural Viability Score**.

* ## **Requirement:** If the user’s budget is \< R$10k, the UI physically redacts private US universities.

* ## **Technical Implementation:** `pgvector` Cosine Similarity matching against the `Opportunity` table, followed by a Python-based rule engine that filters based on hard legal constraints (Age/Visa rules).

### **Engine 2: The Adaptive Psychological Mirror (THINK)**

* ## **Input:** User Pillar 2 (Cognitive Architecture: Fear Cluster).

* ## **Logic:** **Contextual UX Mutation.** \* **Requirement:** If a user is diagnosed with "Rejection Fear," the dashboard emphasizes "Safe Paths" and highlights "Success Case Analogies." If the user is an "Insecure Developer," the system forces a "Technical Bridge Builder" narrative.

* ## **Rust Implementation:** Signal-based UI updates that toggle component visibility and copy tone without a page reload.

### **Engine 3: The Dynamic Sprint Orchestrator (EXECUTION)**

* ## **Input:** User Pillar 3 (Kinetic State: Bandwidth \+ Target Resolution).

* ## **Logic:** **DAG-Based Task Injection.** \* **Requirement:** If Bandwidth is "Constrained (\<2h/week)", the system collapses the 40-step roadmap into **Micro-Sprints** (max 2 tasks).

* ## **Python Logic:** An event-driven engine that pushes atomic notifications. "Your only task this week is to write 3 bullet points in the editor. Just 3."

### **Engine 4: The Artifact Forge & Async Bridge (WRITE)**

* ## **Component:** A block-based text editor built in Rust (Tiptap extension).

* ## **Requirement:** **Real-time Rubric Evaluation.** As the user writes, the Python backend evaluates the text against the **Olcan Score** (Clarity, Specificity, Emotional Resonance).

* ## **The Bridge:** A one-click "Escalate to Mentor" button. This triggers a **Standardized JSON Brief** containing the user's archetype, the specific text block, and the current blocker. This turns a 1-hour coaching session into a 5-minute async transaction.

## **4\. DATA MODEL & RELATIONAL INTEGRITY**

## \# System Core Entities (Python/SQLAlchemy)

## 

## class UserProfile(Base):

##     id \= Column(UUID, primary\_key=True)

##     archetype \= Column(Enum(OIOS\_ARCHETYPES)) \# 12 personas

##     fear\_cluster \= Column(Enum(FEAR\_CLUSTERS)) \# 4 fears

##     vector \= Column(Vector(768)) \# Embedding of the Identity Diagnostic

## 

## class Opportunity(Base):

##     id \= Column(UUID, primary\_key=True)

##     requirements\_vector \= Column(Vector(768)) \# Semantic footprint

##     hard\_constraints \= Column(JSONB) \# {min\_budget: int, min\_english: str}

## 

## class KineticSprint(Base):

##     user\_id \= Column(UUID, ForeignKey('user.id'))

##     velocity\_score \= Column(Float)

##     bandwidth\_per\_week \= Column(Integer)

##     active\_dag \= Column(JSONB) \# The sequence of tasks generated for the current state

## 

## **5\. USER EXPERIENCE: THE METAMODERN OSCILLATION (MMXD)**

## The UI must reflect the "Serious Play" of internationalization.

1. ## **Phase A: Total Minimalism (The Forge).** When writing, the UI is monochromatic, distraction-free, and high-performance Rust.

2. ## **Phase B: Topographical Density (The Map).** When deciding, the user is presented with a complex, interactive SVG map of the global opportunity landscape.

3. ## **The "Vulnerability" Pattern:** The system uses ironic, honest copy. *"You are currently procrastinating by looking at visas you can't afford. Close this tab and finish your CV."*

## **6\. DEVELOPMENT ROADMAP (PHASED ARBITRAGE)**

### **Phase 1: The Tactical Wedge (Months 0-3)**

* ## **Goal:** Validate the **Identity Mirror**.

* ## **Deliverable:** Mobile-first Rust diagnostic \+ Personal Archetype Card.

* ## **Conversion:** Free Diagnostic → Email capture → Paywall.

### **Phase 2: The Forge & Oracle (Months 3-6)**

* ## **Goal:** Systematize the **Write** operation.

* ## **Deliverable:** Tauri Desktop App \+ Tiptap Editor \+ Olcan Score AI integration.

* ## **Conversion:** Core Subscription activation.

### **Phase 3: The Arbitrage Loop (Months 6-12)**

* ## **Goal:** Scalable Human Intervention.

* ## **Deliverable:** Mentor Dashboard \+ Asynchronous Mentorship Credits.

* ## **Scale:** Integration with **Global Mobility APIs** (Deel/Remote) for final-stage execution.

## **7\. KPI & PERFORMANCE TRACKING**

* ## **Clarity Velocity:** Time from "Diagnostic" to "First Draft" (Goal: \< 14 days).

* ## **Blocker Mitigation:** % of users who resume activity after receiving a "Fear Reframe Card."

* ## **Arbitrage Efficiency:** Ratio of software revenue to human mentor hours.

## 

## 

## 

## **GO-TO-MARKET & DEPLOYMENT PHASING**

**Phase 1: The Tactical Wedge (Months 0-3)**

* **Focus:** Core Python API \+ Mobile-first Rust diagnostic flow.  
* **Deliverable:** The "Mirror" (Diagnostic) and the "Topography" (Find/Decide).  
* **Validation:** Prove users will trade email \+ data for high-fidelity psychological and strategic mapping.

**Phase 2: The Forge & Telemetry (Months 3-6)**

* **Focus:** Tauri Desktop App \+ The Asset Forge (Build module).  
* **Deliverable:** AI-assisted document editing and Sprint orchestration.  
* **Monetization:** Activation of the Core tier paywall.

**Phase 3: The Arbitrage Loop (Months 6-12)**

* **Focus:** Asynchronous Mentorship \+ B2B Routing.  
* **Deliverable:** Mentor dashboards and API endpoints for institutional partners.  
* **Scale:** Activating the "Mentorship Credits" micro-transaction ecosystem.

Com base nos novos PRDs do **Project Compass (V2.0)** e na matriz profunda do OIOS, o Compass deixa de ser um "SaaS tradicional" (um checklist linear) e evolui para um **Sistema Operacional de Mobilidade de Trabalho Algorítmica**. O grande diferencial aqui é a transição para um **Motor de Orquestração Dinâmica de Tarefas**, que usa Grafos Acíclicos Direcionados (DAGs) para montar fluxos de trabalho personalizados em tempo real, baseados na realidade de banda, psicologia e finanças de cada usuário.

Para suportar essa visão "McKinsey-grade", a arquitetura técnica sofreu um pivô profundo, abandonando o padrão full-JS para abraçar um ecossistema de alto desempenho (Rust \+ Python \+ PostgreSQL com pgvector).

Abaixo, detalho a estruturação do Banco de Dados e todos os elementos de desenvolvimento necessários para essa execução.

---

### **1\. A Nova Arquitetura de Software (The Stack)**

Para garantir margens altas, segurança de documentos e processamento nativo de IA, o desenvolvimento será dividido em camadas estritas:

* **Frontend (The Presentation Layer):** **Rust** usando **Dioxus** ou **Leptos** (compilado para WebAssembly). Isso garante que matrizes 3D e mapas topológicos complexos rodem a 60fps até em celulares de baixo custo no Sul Global.  
* **Desktop App (The Forge):** Para o editor de texto focado (BUILD/WRITE), será usado **Tauri** (alternativa leve em Rust ao Electron), criando uma experiência de IDE premium para o usuário.  
* **Backend (The Orchestration Layer):** **Python 3.12+ com FastAPI**. Python é a língua nativa da IA, permitindo integração de baixíssima latência com bancos vetoriais. Para a gestão dos "Sprints" (background jobs), usa-se **Temporal.io**, **Celery** ou **ARQ**.  
* **Banco de Dados:** **PostgreSQL** hospedado no Supabase, ativando rigorosamente a extensão **pgvector** para buscas semânticas (Cosine Similarity).

---

### **2\. Estrutura Profunda do Banco de Dados (Schema Relacional & Vetorial)**

O banco de dados precisa suportar os 3 pilares do usuário (Capital Operacional, Arquitetura Cognitiva e Estado Cinético). Aqui está o modelo de dados traduzido para SQLAlchemy/Postgres:

#### **Tabela A: `users` (Core Auth & Billing)**

* `id`: UUID (Primary Key)  
* `email`: String  
* `subscription_tier`: Enum (`LITE`, `CORE`, `PRO`)  
* `created_at`: Timestamp

#### **Tabela B: `user_profiles` (The Cognitive & Operational Mirror)**

* `user_id`: UUID (Foreign Key)  
* `archetype`: Enum (Os 12 perfis OIOS)  
* `primary_fear`: Enum (`Competence`, `Rejection`, `Loss`, `Irreversibility`)  
* `embedding_vector`: Vector(768) *(O "footprint" semântico do usuário gerado no diagnóstico para fazer match com vagas/bolsas)*

#### **Tabela C: `execution_states` (The Kinetic Pillar \- O Motor de Sprints)**

Esta é a tabela mais dinâmica, atualizada após cada sprint:

* `user_id`: UUID (Foreign Key)  
* `target_resolution`: Integer (0=Nebulous, 1=Directional, 2=Locked)  
* `asset_maturity`: Integer (0=Non-Existent, 1=Localized/BR, 2=Drafted Global, 3=Review-Ready)  
* `system_literacy`: Integer (0=Novice, 1=Aware, 2=Fluent)  
* `weekly_bandwidth`: Enum (`CONSTRAINED <2h`, `MODERATE 2-5h`, `ABUNDANT 5h+`)  
* `last_momentum_update`: Timestamp (Usado pelo Nudge Engine para detectar se o usuário paralisou)

#### **Tabela D: `opportunities` (The Global Database \- FIND)**

* `id`: UUID (Primary Key)  
* `type`: Enum (`program`, `company`, `visa`, `scholarship`)  
* `requirements_vector`: Vector(768) *(Para matching de Similaridade de Cosseno via pgvector)*  
* `hard_constraints`: JSONB *(Filtros rígidos: `{"min_budget": 5000, "min_english": "B2"}`)*

#### **Tabela E: `kinetic_sprints` (A Orquestração de Tarefas)**

* `id`: UUID (Primary Key)  
* `user_id`: UUID (Foreign Key)  
* `status`: Enum (`ACTIVE`, `STALLED`, `COMPLETED`)  
* `bandwidth_per_week`: Integer  
* `active_dag`: JSONB *(A sequência de tarefas injetadas no sprint atual pelo Python backend)*  
* `velocity_score`: Float

#### **Tabela F: `artifacts` & `mentorship_requests` (The Forge & The Bridge)**

* `content`: JSONB *(Formato Tiptap)*  
* `olcan_score`: JSONB *(Avaliação de clareza, especificidade, etc.)*  
* `mentor_brief`: JSONB *(Brief gerado automaticamente contendo o trecho do texto, o arquétipo do usuário e a dúvida exata)*

---

### **3\. Os 4 Motores de Desenvolvimento (Engines)**

Para que o Compass execute com excelência, o time de desenvolvimento deve focar na construção destes 4 motores interdependentes:

**1\. O Oráculo Determinístico (Search / FIND):** A IA não "inventa" bolsas. Todos os dados são injetados por RAG (Retrieval-Augmented Generation) a partir de um banco de dados curado pela Olcan. O sistema de busca usa `text-embedding-004` no PostgreSQL para cruzar o vetor do usuário com o vetor da oportunidade. Se a tabela `hard_constraints` aponta que o orçamento do cliente é restrito e o inglês é A2, o backend Python fisicamente **redige/oculta** programas ingleses caros, prevenindo paralisia por análise (Opportunity Overload).

**2\. O Espelho Psicológico Adaptativo (Think / DECIDE):** O Frontend em Rust muda dinamicamente o *copy* e a UX dependendo da tabela `user_profiles`. Se o backend detecta que o cursor do usuário está ocioso há 5 dias na tela "Enviar Aplicação" e seu perfil indica *Síndrome do Impostor*, um Web-Socket engatilha um **Fear Reframe Card** contextual: *"Você está travado. A comissão de admissão usa filtros algorítmicos, isso não é reflexo da sua competência. Clique em enviar."*.

**3\. O Orquestrador Dinâmico de Sprints (Execute / SPRINT):** O fim dos checklists culposos. Usando filas assíncronas (ex: Celery), o Python lê a coluna `weekly_bandwidth`. Se o usuário reportou ter apenas **\<2h/semana (Constrained)**, o orquestrador colapsa o roadmap de 40 passos em um *Micro-Sprint* de 2 passos. A notificação não diz "não se esqueça", ela é atômica: *"Sua única tarefa hoje é abrir o editor e escrever 3 bullet points."*.

**4\. A Forja de Artefatos & Ponte Assíncrona (Build / WRITE):** A Forja é o editor (baseado em Tiptap, embrulhado no app desktop Tauri). Enquanto o usuário digita, a API do Gemini 1.5 Pro via Vertex AI avalia silenciosamente o texto usando o "Olcan Score". *A Arbitragem Comercial:* Se o cliente travar, ele clica em "I need a human". O backend não agenda uma call de 1 hora. Ele empacota o parágrafo problemático, o perfil do usuário e envia um JSON para o Dashboard do Mentor. O Mentor responde em vídeo de 3 minutos via Loom. Isso transforma uma consultoria de baixo valor agregado em uma transação assíncrona de altíssima margem.

---

### **4\. Roadmap de Execução para os Desenvolvedores (Phasing)**

* **Fase 1: The Tactical Wedge (Meses 0-3)**  
  * Foco: **Backend Python API \+ Frontend Rust Web/Mobile.**  
  * Objetivo: Codificar a árvore de decisão do Diagnóstico (Identity Mirror). O usuário entra, preenche os dados, é encaixado na matriz de arquétipos, recebe o card visual viral, e bate na *Paywall*.  
* **Fase 2: The Forge & Oracle (Meses 3-6)**  
  * Foco: Lançamento do app Desktop Nativo em Tauri \+ Editor Tiptap (The Forge).  
  * Objetivo: Integrar a Vertex AI para análise em tempo real de textos (CVs e Essays) e consolidar as rotinas de orquestração de Micro-Sprints via Temporal.io/Celery. Ativação das assinaturas de nível Core.  
* **Fase 3: The Arbitrage Loop (Meses 6-12)**  
  * Foco: Painel interno de Mentoria \+ Integração com APIs de HR Global (ex: Deel, Remote).  
  * Objetivo: Ativar o ecossistema de micro-transações (compra de *Mentorship Credits*) e transformar a Olcan em um verdadeiro "Mobility-as-a-Service", orquestrando legalidade e payroll de ponta a ponta.

O Compass desenhado nesses PRDs V2.0 deixa de ser uma plataforma que aponta o caminho. Ele passa a gerenciar ativamente as restrições de tempo, dinheiro e psicologia do trabalhador do Sul Global, forçando o movimento através da redução cirúrgica do atrito.

To structure the full vision of the **Compass SaaS** and its surrounding ecosystem, we must break down the platform into a strict **MECE (Mutually Exclusive, Collectively Exhaustive)** hierarchy. This ensures every variable, feature, and technical component is categorized without overlap, moving from the foundational data models up to the user interface and business architecture.

Here is the hierarchical blueprint for the Compass platform:

### **1\. User Identity & State Variables (The Data Inputs)**

This layer represents the raw data variables extracted from the user during the onboarding diagnostic. It acts as the "brain" of the system, determining everything the user will see. It is divided into three mutually exclusive pillars.

* **1.1 Pillar 1: Operational Capital (Feasibility)**  
  * **Budget Constraints:** Available financial resources (\<R$500 to \>R$5.000).  
  * **Language Proficiency:** Ranging from A2 (basic reading) to C1/C2 (fluent).  
  * **Hard Skills / Professional Context:** Years of experience, specific roles (e.g., Software Engineer, Teacher, Healthcare).  
  * **Life Stage Context:** Single, married, dependents/children, neurodivergent, LGBT+ status.  
* **1.2 Pillar 2: Cognitive Architecture (Psychology)**  
  * **12 OIOS Archetypes:** The user's psychological profile (e.g., *The Insecure Corporate Dev*, *The Trapped Public Servant*, *The Exhausted Solo Mother*).  
  * **Fear Clusters:** The primary emotional blocker paralyzing the user: *Fear of Competence, Fear of Rejection, Fear of Loss, or Fear of Irreversibility*.  
  * **Readiness Score:** Measured on three independent axes: Informational, Emotional, and Operational.  
* **1.3 Pillar 3: Execution Kinetic State (Motion/Pacing)**  
  * **Target Resolution:** The user's clarity on their destination (*Nebulous* $\\rightarrow$ *Directional* $\\rightarrow$ *Locked*).  
  * **Asset Maturity:** The state of their application documents (*Non-Existent* $\\rightarrow$ *Localized Format* $\\rightarrow$ *Drafted Global* $\\rightarrow$ *Review-Ready*).  
  * **System Literacy:** Understanding of international hiring rules, ATS systems, and visa logic (*Novice* $\\rightarrow$ *Aware* $\\rightarrow$ *Fluent*).  
  * **Execution Bandwidth:** Actual time available per week (*Constrained \<2h* $\\rightarrow$ *Moderate 2-5h* $\\rightarrow$ *Abundant 5h+*).

### **2\. Core Platform Engines (The Algorithmic Logic)**

These are the invisible backend systems that process the variables from Layer 1 and dictate the platform's behavior.

* **2.1 The Diagnostic Engine (Identity Extraction)**  
  * **Conversational Decision Tree:** A \~60-node branching questionnaire that deduces the user's profile through behavioral proxies rather than static forms.  
  * **Vector Footprinting:** Translates the user's answers into a 768-dimensional embedding vector to map their identity for future semantic matching.  
* **2.2 The Deterministic Oracle (SEARCH Logic)**  
  * **Hard Constraint Pruner:** A rule-based filter that physically redacts or hides opportunities the user is legally or financially disqualified from (preventing opportunity overload).  
  * **Semantic Opportunity Matching:** Uses Cosine Similarity to cross-reference the user's profile vector against the requirements of global visas, scholarships, and jobs.  
* **2.3 The Adaptive Psychological Mirror (THINK Logic)**  
  * **Contextual UX Mutation:** Dynamically alters the tone, copy, and layout of the UI based on the user's Fear Cluster.  
  * **Fear Reframe Injectors:** Triggers contextual pop-up cards generated by AI if the system detects the user stalling on a task, offering a psychological reframe.  
* **2.4 The Dynamic Sprint Orchestrator (EXECUTION Logic)**  
  * **DAG-Based Task Injection:** Assembles customized workflows dynamically.  
  * **Algorithmic Chunking:** If a user has "Constrained Bandwidth", the engine collapses a 40-step roadmap into a 2-step "Micro-Sprint".  
  * **Context-Aware Nudge Engine:** Sends atomic, actionable notifications based on progress and deadlines.  
* **2.5 The Artifact Forge Engine (WRITE Logic)**  
  * **Real-time Rubric Evaluation:** AI silently scores text against the proprietary "Olcan Score" (Clarity, Specificity, Emotional Resonance, Destination Fit) as the user types.

### **3\. Functional Modules & UX (The Presentation Layer)**

These are the tangible features and screens the user interacts with, built upon a Metamodern Experience Design (MMXD) philosophy.

* **3.1 Onboarding & Navigation**  
  * **The Archetype Card:** A highly shareable, visually elegant summary of the user's diagnostic results, acting as a viral marketing mechanic.  
  * **The Operating Map (Dashboard):** A living, route-aware interface guiding the user through the FIND, DECIDE, and BUILD zones.  
* **3.2 FIND Module (Information Architecture)**  
  * **Curated Opportunity Database:** Human-curated, AI-matched lists of programs, companies, visas, and scholarships.  
  * **Discovery Feed & Watchlist:** Personalized opportunity feed with automated deadline tracking.  
* **3.3 DECIDE Module (Strategy & Trade-offs)**  
  * **Interactive Route Selector:** A live matrix where users weight criteria (e.g., salary vs. family proximity) to score different routes.  
  * **Scenario Builder:** Side-by-side ROI and timeline projections (e.g., applying this year vs. next year).  
  * **Tradeoff Journal:** A structured space for documenting reasoning, which can be securely shared with mentors.  
* **3.4 BUILD Module (Document Production)**  
  * **The Forge (Tiptap Editor):** A distraction-free, Notion-like rich text editor.  
  * **Route-Aware Templates:** Frameworks for CVs, Motivation Letters, and Essays customized by the user's archetype.  
  * **Smart Inline Guidance:** Pop-ups warning of cultural misfits (e.g., "This intro is too long for a German application").  
  * **Export Engine:** Auto-formatting to country-specific standards (e.g., adding/removing photos, adjusting to A4 vs. Letter size).  
* **3.5 SPRINT Module (Accountability)**  
  * **2-Week Sprint Commitments:** Declared outputs broken into atomic tasks.  
  * **Sprint Reviews & Momentum Score:** Visual tracking of velocity and blocked tasks across sprints.

### **4\. Business & Monetization Architecture (Value Capture)**

This layer defines how the platform generates revenue through a tiered, contextual product ladder.

* **4.1 SaaS Subscription Tiers**  
  * **Compass Lite (Free):** Full diagnostic, Archetype Card, and a locked preview of the roadmap.  
  * **Compass Core (R$79/mo):** Full access to 1 route, the Sprint system, the BUILD editor, and AI scoring.  
  * **Compass Pro (R$149/mo):** Access to all 4 routes, unlimited documents, Scenario Builder, and priority database updates.  
* **4.2 Contextual E-commerce (Infoproducts)**  
  * **Rota da Internacionalização (R$35):** A visual Miro board map, offered to users who want a cheap, DIY entry point.  
  * **Kit Application (R$75):** Notion templates offered to "Explorers" who need structure but don't want the full SaaS.  
  * **Sem Fronteiras Course (R$497):** Deep-dive video curriculum for complex cases, like families.  
* **4.3 The Asynchronous Mentorship Bridge (High-Margin Upsell)**  
  * **Mentorship Credits:** Purchased tokens allowing a user to click "I need a human here" directly on a document or task.  
  * **Automated Mentor Briefs:** The system packages the user's data and text snippet into a structured JSON for the mentor, reducing a 1-hour live call to a 3-minute asynchronous Loom video or text response.  
* **4.4 Institutional Marketplace (B2B)**  
  * **Compass for Teams:** Seat licenses for university international offices or corporate HR departments.  
  * **Benchmarking API (Future):** Allowing institutions to compare their applicants' document quality against the anonymized Olcan database.

### **5\. Technical Infrastructure (The Stack)**

The underlying technical architecture required to run the platform at an enterprise grade, ensuring high margins and low latency.

* **5.1 Frontend (Presentation Layer)**  
  * **Framework:** Rust (compiled to WebAssembly via Dioxus or Leptos) for 60fps rendering of complex maps.  
  * **Desktop Client:** Tauri (Rust-based wrapper) to create a native, lightweight desktop app for deep-focus writing (The Forge).  
* **5.2 Backend (Orchestration Layer)**  
  * **API Framework:** Python 3.12+ with FastAPI.  
  * **Task Queues:** Temporal.io or Celery for managing the Sprint Nudge Engine and asynchronous background jobs.  
* **5.3 Data Layer**  
  * **Relational & Vector DB:** PostgreSQL hosted on Supabase.  
  * **Vector Search:** `pgvector` extension for storing and querying 768-dimensional embeddings.  
* **5.4 Artificial Intelligence (The Brain)**  
  * **Inference Engine:** Google Vertex AI (Gemini 1.5 Pro) used strictly as a structural editor and psychological coach (zero-hallucination policy via RAG).  
  * **Embeddings Model:** `text-embedding-004`.  
* **5.5 Integrations (Mobility as a Service)**  
  * **Payments:** Stripe (Global Subscriptions) and Hotmart (Brazilian continuity/PIX).  
  * **Communications:** Resend (Email) and Twilio/Z-API (WhatsApp nudges).  
  * **Global HR APIs (Phase 3):** Connections to platforms like Deel or Remote to execute actual visa and payroll logistics directly from the Compass dashboard.

To transform Olcan Compass from a standard SaaS into the **ultimate internationalization platform**, we must shift the architectural paradigm. Most EdTech or career mobility platforms operate as *linear content delivery systems* (LMS). They assume every user starts at A and ends at Z.

Given the depth of the **Olcan Diagnostic Matrix (ODM)** we just built, Compass cannot be linear. It must function as a **Dynamic Task Orchestration Engine**. Similar to how complex data pipelines (like Apache Airflow or Kestra) use Directed Acyclic Graphs (DAGs) to trigger actions based on real-time conditions, Compass will assemble bespoke, transient workflows for each user at runtime.

Here is the McKinsey-grade architectural plan mapping the platform’s solutions (The Engines) to the user’s variables (The Pillars), ensuring a strictly MECE execution of the software.

---

### **Platform Engine 1: The Deterministic Oracle**

*(Maps directly to User Pillar 1: Operational Capital)*

**The Problem:** Users drown in "opportunity overload" and often fall in love with pathways they are legally or financially disqualified from.

**The Platform Solution:** A strict, rule-based filtering and semantic matching algorithm that prioritizes structural viability over user preference.

* **The Viability Filter (Hard Gating):** The system uses PostgreSQL (pgvector via Supabase) to instantly prune the Opportunity Database. If the ODM flags Language: A2 and Funds: Tier 1, the UI physically hides highly competitive, expensive English-taught Master's degrees. It prevents the user from pursuing dead ends.  
* **Semantic Opportunity Matching:** Instead of basic keyword searches, the platform uses Google's text-embedding-004. It matches the user's specific operational constraints (Age, Field, Dependents) with the implicit requirements of global visas and scholarships.  
* **The Scenario Builder (Visualizing Trade-offs):** The platform generates a side-by-side ROI comparison. It shows the user: *"Path A (Tech Visa in Germany) gets you out in 6 months but requires B1 German. Path B (Remote US Job) takes 12 months but utilizes your existing Portuguese/English."*

### **Platform Engine 2: The Adaptive Psychological Mirror**

*(Maps directly to User Pillar 2: Cognitive Architecture)*

**The Problem:** Standard SaaS copy is static. A highly anxious user and a highly ambitious user read the same "Let's go\!" notification. One is motivated; the other is paralyzed.

**The Platform Solution:** "Contextual UX Mutation." The frontend dynamically alters its layout, pacing, and copywriting based on the user's cognitive vector scores.

* **Algorithmic Tone-Matching (Powered by Gemini Pro):** When generating Fear Reframe Cards or onboarding emails, the LLM receives the user's vector data.  
  * *If User is Defensive/Systematic:* The UI adopts a clinical, step-by-step tone. Progress bars emphasize "Risk Mitigated."  
  * *If User is Expansive/Fluid:* The UI adopts a visionary, networking-focused tone. Progress bars emphasize "Network Expanded."  
* **Fear Reframe Injectors:** The system monitors user behavior (e.g., cursor idling on a "Submit Application" button for 5 days). It correlates this with their ODM (e.g., High Imposter Syndrome) and triggers an automated, contextual pop-up: *"You are stalling. Remember, the admission committee's rejection is an algorithmic filter, not a reflection of your competence. Click send."*

### **Platform Engine 3: The Dynamic Sprint Orchestrator**

*(Maps directly to User Pillar 3: Execution Kinetic State)*

**The Problem:** Checklists create guilt. When a busy professional sees 45 tasks, they churn.

**The Platform Solution:** Adaptive task chunking using event-driven background jobs (via Inngest). The platform creates a dynamic pathway that paces itself to the user's actual bandwidth.

* **Bandwidth-Paced Micro-Sprints:** If the ODM registers Execution Bandwidth: Constrained (\<2h/week), the orchestration engine limits the user's dashboard to **one atomic task** at a time. It hides the rest of the mountain. It asks for 15 minutes of work, ensuring a dopamine hit of completion.  
* **State-Driven Routing:** The platform acts as a traffic controller.  
  * *High Target Resolution \+ Zero Assets?* The orchestration engine locks the FIND module (stopping the user from endlessly researching) and forces them into the BUILD module.  
* **The "Nudge" Engine:** Not a generic reminder. The system sends highly specific, context-aware nudges. *"You have a 5-hour bandwidth this week. Spend 2 hours mapping 3 UK companies, and 3 hours translating your CV."*

### **Platform Engine 4: The Artifact Forge & Async Bridge**

*(The Unifying Layer: Where FIND, DECIDE, and BUILD converge)*

**The Problem:** Users write applications in Word/Google Docs, entirely disconnected from the strategy they just built. When they need help, they book a 1-hour coaching call that wastes 30 minutes just providing context.

**The Platform Solution:** An embedded Tiptap text editor wired directly to the user's ODM and the Olcan coaching rubric, backed by human-in-the-loop escalation.

* **The Contextual Editor (Live Rubric):** As the user types their Motivation Letter, the platform evaluates the text. Because it knows the user's ODM is Field: STEM and Target: Germany, the LLM-coach injects inline notes: *"German engineering recruiters prefer chronological factual precision over narrative storytelling. Reduce paragraph 2."*  
* **The "I Need a Human" Button (Structured Mentorship):** This is Olcan's ultimate monetization moat. When a user gets stuck, they click a button. The platform automatically packages a **Mentor Brief**:  
  * *The Asset:* Paragraph 3 of the Motivation Letter.  
  * *The User Context:* "32yo Dev, High Fear of Rejection, Low System Literacy."  
  * *The Ask:* "Is this technical description accurate?"  
  * The Olcan Mentor receives this brief, records a 3-minute Loom video or text note, and sends it back. **A 1-hour R$500 call is replaced by a high-margin, asynchronous 5-minute intervention.**

---

### **The Compass Core Loop (The Ultimate User Journey)**

When we weave these platform engines together, the software creates a continuous, self-optimizing loop:

1. **Extract (The Diagnostic):** The user enters. The platform runs the situational quiz, populating the 10 MECE variables of the ODM.  
2. **Lock & Load (The Paywall/Aha-Moment):** The *Deterministic Oracle* generates the Compass Radar. The user sees exactly why they are stuck. They buy the Core/Pro tier.  
3. **Pace (The Orchestrator):** The *Dynamic Sprint Orchestrator* generates a 14-day Sprint tailored to their bandwidth.  
4. **Execute & Mutate (The Forge & Mirror):** The user writes their CV in the *Artifact Forge*. The *Psychological Mirror* adjusts the UI to keep their specific fears at bay.  
5. **Escalate (The Bridge):** If they fail, they buy a Mentorship Credit. The human mentor unsticks them asynchronously. The loop repeats until the user boards the plane.

By building Compass on this architecture, you are no longer selling a "course" or a "template database." You are selling a **bespoke, autonomous career mobility agent** that adapts to the economic and psychological realities of the Global South. This is what justifies recurring SaaS revenue and creates an insurmountable competitive moat.

To structure the full vision of the **Compass SaaS** and its surrounding ecosystem, we must break down the platform into a strict **MECE (Mutually Exclusive, Collectively Exhaustive)** hierarchy. This ensures every variable, feature, and technical component is categorized without overlap, moving from the foundational data models up to the user interface and business architecture.

Here is the hierarchical blueprint for the Compass platform:

### **1\. User Identity & State Variables (The Data Inputs)**

This layer represents the raw data variables extracted from the user during the onboarding diagnostic. It acts as the "brain" of the system, determining everything the user will see. It is divided into three mutually exclusive pillars.

* **1.1 Pillar 1: Operational Capital (Feasibility)**  
  * **Budget Constraints:** Available financial resources (\<R$500 to \>R$5.000).  
  * **Language Proficiency:** Ranging from A2 (basic reading) to C1/C2 (fluent).  
  * **Hard Skills / Professional Context:** Years of experience, specific roles (e.g., Software Engineer, Teacher, Healthcare).  
  * **Life Stage Context:** Single, married, dependents/children, neurodivergent, LGBT+ status.  
* **1.2 Pillar 2: Cognitive Architecture (Psychology)**  
  * **12 OIOS Archetypes:** The user's psychological profile (e.g., *The Insecure Corporate Dev*, *The Trapped Public Servant*, *The Exhausted Solo Mother*).  
  * **Fear Clusters:** The primary emotional blocker paralyzing the user: *Fear of Competence, Fear of Rejection, Fear of Loss, or Fear of Irreversibility*.  
  * **Readiness Score:** Measured on three independent axes: Informational, Emotional, and Operational.  
* **1.3 Pillar 3: Execution Kinetic State (Motion/Pacing)**  
  * **Target Resolution:** The user's clarity on their destination (*Nebulous* $\\rightarrow$ *Directional* $\\rightarrow$ *Locked*).  
  * **Asset Maturity:** The state of their application documents (*Non-Existent* $\\rightarrow$ *Localized Format* $\\rightarrow$ *Drafted Global* $\\rightarrow$ *Review-Ready*).  
  * **System Literacy:** Understanding of international hiring rules, ATS systems, and visa logic (*Novice* $\\rightarrow$ *Aware* $\\rightarrow$ *Fluent*).  
  * **Execution Bandwidth:** Actual time available per week (*Constrained \<2h* $\\rightarrow$ *Moderate 2-5h* $\\rightarrow$ *Abundant 5h+*).

### **2\. Core Platform Engines (The Algorithmic Logic)**

These are the invisible backend systems that process the variables from Layer 1 and dictate the platform's behavior.

* **2.1 The Diagnostic Engine (Identity Extraction)**  
  * **Conversational Decision Tree:** A \~60-node branching questionnaire that deduces the user's profile through behavioral proxies rather than static forms.  
  * **Vector Footprinting:** Translates the user's answers into a 768-dimensional embedding vector to map their identity for future semantic matching.  
* **2.2 The Deterministic Oracle (SEARCH Logic)**  
  * **Hard Constraint Pruner:** A rule-based filter that physically redacts or hides opportunities the user is legally or financially disqualified from (preventing opportunity overload).  
  * **Semantic Opportunity Matching:** Uses Cosine Similarity to cross-reference the user's profile vector against the requirements of global visas, scholarships, and jobs.  
* **2.3 The Adaptive Psychological Mirror (THINK Logic)**  
  * **Contextual UX Mutation:** Dynamically alters the tone, copy, and layout of the UI based on the user's Fear Cluster.  
  * **Fear Reframe Injectors:** Triggers contextual pop-up cards generated by AI if the system detects the user stalling on a task, offering a psychological reframe.  
* **2.4 The Dynamic Sprint Orchestrator (EXECUTION Logic)**  
  * **DAG-Based Task Injection:** Assembles customized workflows dynamically.  
  * **Algorithmic Chunking:** If a user has "Constrained Bandwidth", the engine collapses a 40-step roadmap into a 2-step "Micro-Sprint".  
  * **Context-Aware Nudge Engine:** Sends atomic, actionable notifications based on progress and deadlines.  
* **2.5 The Artifact Forge Engine (WRITE Logic)**  
  * **Real-time Rubric Evaluation:** AI silently scores text against the proprietary "Olcan Score" (Clarity, Specificity, Emotional Resonance, Destination Fit) as the user types.

### **3\. Functional Modules & UX (The Presentation Layer)**

These are the tangible features and screens the user interacts with, built upon a Metamodern Experience Design (MMXD) philosophy.

* **3.1 Onboarding & Navigation**  
  * **The Archetype Card:** A highly shareable, visually elegant summary of the user's diagnostic results, acting as a viral marketing mechanic.  
  * **The Operating Map (Dashboard):** A living, route-aware interface guiding the user through the FIND, DECIDE, and BUILD zones.  
* **3.2 FIND Module (Information Architecture)**  
  * **Curated Opportunity Database:** Human-curated, AI-matched lists of programs, companies, visas, and scholarships.  
  * **Discovery Feed & Watchlist:** Personalized opportunity feed with automated deadline tracking.  
* **3.3 DECIDE Module (Strategy & Trade-offs)**  
  * **Interactive Route Selector:** A live matrix where users weight criteria (e.g., salary vs. family proximity) to score different routes.  
  * **Scenario Builder:** Side-by-side ROI and timeline projections (e.g., applying this year vs. next year).  
  * **Tradeoff Journal:** A structured space for documenting reasoning, which can be securely shared with mentors.  
* **3.4 BUILD Module (Document Production)**  
  * **The Forge (Tiptap Editor):** A distraction-free, Notion-like rich text editor.  
  * **Route-Aware Templates:** Frameworks for CVs, Motivation Letters, and Essays customized by the user's archetype.  
  * **Smart Inline Guidance:** Pop-ups warning of cultural misfits (e.g., "This intro is too long for a German application").  
  * **Export Engine:** Auto-formatting to country-specific standards (e.g., adding/removing photos, adjusting to A4 vs. Letter size).  
* **3.5 SPRINT Module (Accountability)**  
  * **2-Week Sprint Commitments:** Declared outputs broken into atomic tasks.  
  * **Sprint Reviews & Momentum Score:** Visual tracking of velocity and blocked tasks across sprints.

### **4\. Business & Monetization Architecture (Value Capture)**

This layer defines how the platform generates revenue through a tiered, contextual product ladder.

* **4.1 SaaS Subscription Tiers**  
  * **Compass Lite (Free):** Full diagnostic, Archetype Card, and a locked preview of the roadmap.  
  * **Compass Core (R$79/mo):** Full access to 1 route, the Sprint system, the BUILD editor, and AI scoring.  
  * **Compass Pro (R$149/mo):** Access to all 4 routes, unlimited documents, Scenario Builder, and priority database updates.  
* **4.2 Contextual E-commerce (Infoproducts)**  
  * **Rota da Internacionalização (R$35):** A visual Miro board map, offered to users who want a cheap, DIY entry point.  
  * **Kit Application (R$75):** Notion templates offered to "Explorers" who need structure but don't want the full SaaS.  
  * **Sem Fronteiras Course (R$497):** Deep-dive video curriculum for complex cases, like families.  
* **4.3 The Asynchronous Mentorship Bridge (High-Margin Upsell)**  
  * **Mentorship Credits:** Purchased tokens allowing a user to click "I need a human here" directly on a document or task.  
  * **Automated Mentor Briefs:** The system packages the user's data and text snippet into a structured JSON for the mentor, reducing a 1-hour live call to a 3-minute asynchronous Loom video or text response.  
* **4.4 Institutional Marketplace (B2B)**  
  * **Compass for Teams:** Seat licenses for university international offices or corporate HR departments.  
  * **Benchmarking API (Future):** Allowing institutions to compare their applicants' document quality against the anonymized Olcan database.

### **5\. Technical Infrastructure (The Stack)**

The underlying technical architecture required to run the platform at an enterprise grade, ensuring high margins and low latency.

* **5.1 Frontend (Presentation Layer)**  
  * **Framework:** Rust (compiled to WebAssembly via Dioxus or Leptos) for 60fps rendering of complex maps.  
  * **Desktop Client:** Tauri (Rust-based wrapper) to create a native, lightweight desktop app for deep-focus writing (The Forge).  
* **5.2 Backend (Orchestration Layer)**  
  * **API Framework:** Python 3.12+ with FastAPI.  
  * **Task Queues:** Temporal.io or Celery for managing the Sprint Nudge Engine and asynchronous background jobs.  
* **5.3 Data Layer**  
  * **Relational & Vector DB:** PostgreSQL hosted on Supabase.  
  * **Vector Search:** `pgvector` extension for storing and querying 768-dimensional embeddings.  
* **5.4 Artificial Intelligence (The Brain)**  
  * **Inference Engine:** Google Vertex AI (Gemini 1.5 Pro) used strictly as a structural editor and psychological coach (zero-hallucination policy via RAG).  
  * **Embeddings Model:** `text-embedding-004`.  
* **5.5 Integrations (Mobility as a Service)**  
  * **Payments:** Stripe (Global Subscriptions) and Hotmart (Brazilian continuity/PIX).  
  * **Communications:** Resend (Email) and Twilio/Z-API (WhatsApp nudges).  
  * **Global HR APIs (Phase 3):** Connections to platforms like Deel or Remote to execute actual visa and payroll logistics directly from the Compass dashboard.

