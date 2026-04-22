---
title: Modelo Core: Routes, Sprints, Tasks
type: drawer
layer: 3
status: active
last_seen: 2026-04-22
backlinks:
  - Verdade_do_Produto
  - Spec_Dossier_System_v2_5
  - Diagnostico_Topologia_Backend
  - SPEC_IO_System_v2_5
  - Arquitetura_v2_5_Compass
---

# Modelo Core: Routes → Sprints → Tasks → Dossier

**Resumo**: Modelo conceitual e de dados para o sistema central de execução do Olcan Compass — o loop que transforma perfil em plano de ação.
**Status**: Ativo (Modelo 2026-04-22)
**Camada**: Produto / Dados

---

## 1. Visão Geral do Fluxo

O Olcan Compass é um **Dynamic Task Orchestration Engine**. O core loop é:

```
┌─────────────────────────────────────────────────────────────────┐
│                    OLCAN CORE EXECUTION LOOP                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   │
│   │  OIOS   │ ─ │  ROUTE   │ ─ │  SPRINT  │ ─ │  TASK   │   │
│   │ QUIZ    │   │ (Path)   │   │(Phase)   │   │(Action) │   │
│   └──────────┘   └──────────┘   └──────────┘   └──────────┘   │
│        │                │                │                │        │
│        ▼                ▼                ▼                ▼        │
│   ┌───────────────────────────────────────────────────────┐    │
│   │                   DOCUMENT FORGE                      │    │
│   │         (CVs, Motivation Letters, Essays, etc.)        │    │
│   └───────────────────────────────────────────────────────┘    │
│                            │                                  │
│                            ▼                                  │
│   ┌───────────────────────────────────────────────────────┐    │
│   │              MASTER STRATEGIC DOSSIER                    │    │
│   │        (PDF export com todo o plano agregado)         │    │
│   └───────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Entidades e Relacionamentos

### 2.1 Route (Caminho Estratégico)

**Definição**: Um pathway curado para uma oportunidade internacional específica.

**Exemplos**:
- "Mestrado em Engenharia na Alemanha"
- "Tech Visa para o Reino Unido"
- "PhD em IA nos EUA"
- "Nomad Digital na Portugal"

**Atributos**:
```python
class Route:
    id: UUID
    user_id: UUID
    name: str                    # e.g., "Mestrado na Alemanha"
    destination_country: str      # e.g., "Germany"
    opportunity_type: str         # academic | corporate | nomad
    target_deadline: date         # Quando quer aplicar
    milestones: List[Milestone]    # DAG de fases
    status: RouteStatus          # draft | active | completed | archived
    progress_percentage: float    # 0-100
    created_at: datetime
    updated_at: datetime
```

### 2.2 Milestone (Marco)

**Definição**: Uma fase de execução dentro de um Route.

**Exemplos** (para "Mestrado na Alemanha"):
- "Pesquisar Universidades" (Semana 1-2)
- "Preparar Documentos" (Semana 3-4)
- "Escrever文书" (Semana 5-8)
- "Aplicar" (Semana 9-10)

**Atributos**:
```python
class Milestone:
    id: UUID
    route_id: UUID
    title: str
    description: str
    order: int                    # Posição no DAG
    target_weeks: List[int]        # Semanas target
    tasks: List[Task]            # Tarefas deste marco
    status: MilestoneStatus       # pending | in_progress | completed
    completed_at: datetime
```

### 2.3 Sprint (Ciclo de Execução)

**Definição**: Um período de execução com bandwidth definidas (semanal).

**Conceito**: Similar a SCRUM sprint — um container para agrupar tarefas de uma semana.

**Atributos**:
```python
class Sprint:
    id: UUID
    user_id: UUID
    route_id: UUID
    week_number: int              # Semana 1, 2, 3...
    start_date: date
    end_date: date
    tasks: List[Task]            # Tarefas desta semana
    capacity_hours: int         # Horas disponíveis
    status: SprintStatus        # upcoming | active | completed
    xp_earned: int             # XP gained this sprint
```

### 2.4 Task (Ação Atômica)

**Definição**: A menor unidade de ação executável.

**Exemplos**:
- "Traduzir CV para formato alemão"
- "Escrever parágrafo de motivação"
- "Buscar letter of recommendation"
- "Aplicar para奖学金"

**Atributos**:
```python
class Task:
    id: UUID
    sprint_id: UUID             #Nullable (pode estar fora de sprint)
    route_id: UUID
    milestone_id: UUID
    title: str
    description: str
    category: TaskCategory      # document | research | legal | financial
    priority: TaskPriority     # low | medium | high | critical
    status: TaskStatus        # pending | in_progress | completed
    due_date: date
    xp_reward: int             # XP ao completar
    linked_documents: List[UUID]  # Documentos vinculados
    completed_at: datetime
```

### 2.5 Document (Artefato do Forge)

**Definição**: Documento criado no Document Forge.

**Tipos**:
- CV (Global, Academic, Industry-specific)
- Motivation Letter
- Statement of Purpose
- Research Proposal
- Scholarship Essay
- Recommendation Letter
- etc.

**Atributos**:
```python
class Document:
    id: UUID
    user_id: UUID
    type: DocumentType
    title: str
    raw_text: str               # Conteúdo em markdown/text
    olcan_score: int          # 0-100 AI evaluation
    status: DocumentStatus    # draft | review | ready | submitted
    linked_tasks: List[UUID]  # Tarefas relacionadas
    dossier_id: UUID          # Dossier que pertence
    versions: List[Version]
    created_at: datetime
    updated_at: datetime
```

### 2.6 Dossier (Pacote Agregado)

**Definição**: Agregado final que combina Route + Tasks + Documents para uma candidatura.

**Atributos**:
```python
class Dossier:
    id: UUID
    user_id: UUID
    route_id: UUID
    name: str                    # e.g., "Mestrado TUM - Fall 2026"
    opportunity_url: str        # Link para oportunidade
    deadline: date
    status: DossierStatus        # drafting | ready | submitted | accepted | rejected
    
    tasks: List[Task]            # All tasks for this application
    documents: List[Document]  # All documents
    
    # Aggregated metadata
    readiness_score: float       # 0-100
    completed_percentage: float  # Tasks + Docs ready
    
    # Export
    exported_formats: List[str]     # PDF, DOCX, etc.
    exported_at: datetime
    
    created_at: datetime
    updated_at: datetime
```

---

## 3. Integração com Psychological Engine

O Route é **gerado a partir do perfil OIOS**:

```
OIOS QUIZ
    │
    ▼
┌─────────────┐
│ ARCHETYPE  │ ──────►  Route suggestions baseadas no archetype
│ (12 types)│
└─────────────┘
    │
    ▼
READINESS SCORE
    │
    ├─── Academic readiness ──────► Course selection
    ├─── Financial readiness ────────► Scholarship focus
    ├─── Linguistic readiness ────────► Language prep timeline
    └─── Operational readiness ──────► Document timeline
```

---

## 4. XP & Gamification

**Contexto**: Cada task completada dá XP, que faz o Companion evoluir.

```
Task completion
    │
    ▼ XP reward (10-50)
┌─────────────┐
│ COMPANION  │ ──────► Level up
│ (Aura)    │         Evolution stages
└─────────────┘
```

**Levels**: Explorer (1) → Traveler (2) → Navigator (3) → Pathfinder (4) → Voyager (5) → Ambassador (6) → Diplomat (7) → Consul (8) → Commissioner (9) → Legend (10)

**Stages**: egg → hatchling → juvenile → adult → elder

---

## 5. Master Dossier Export (Target: Fase 5)

### 5.1 O que o Dossier Agrega

O **Master Strategic Dossier** é o output final PDF que contém:

```
┌─────────────────────────────────────────────────────────────────┐
│              MASTER STRATEGIC DOSSIER                │
├─────────────────────────────────────────────────────────────────┤
│                                                      │
│  SECTION 1: THE MIRROR (Identity & Readiness)        │
│  ────────────────────────────────────────────────  │
│  • User archetype (e.g., "Technical Bridge")      │
│  • Readiness radar (academic, financial, etc.)   │
│  • Risk flags (e.g., "20% financial gap")         │
│                                                      │
│  SECTION 2: THE COMPASS (Strategic Route)          │
│  ────────────────────────────────────────────────  │
│  • Selected route + destination                   │
│  • Milestone DAG timeline                        │
│  • Sprint schedule (weeks 1-12)                 │
│  • Upcoming tasks with due dates                 │
│                                                      │
│  SECTION 3: THE FORGE (Execution Artifacts)       │
│  ────────────────────────────────────────────────  │
│  • CV (with Olcan Score)                         │
│  • Motivation Letter                           │
│  • Research Proposal (if academic)             │
│  • All supporting documents                    │
│                                                      │
│  FOOTER: Generation metadata + branding          │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 technical Implementation (para agentes)

Ver diretiva em [[Verdade_do_Produto.md]]: "EXPORT STUB — PDF/DOCX are plain text"

A solução planejada:
1. **Orchestrator** (`dossier_service.py`): Agrega dados de 3 fontes
2. **Renderer** (Playwright + Jinja2): Gera HTML bonito → PDF pixel-perfect
3. **Endpoint**: `GET /api/v1/dossier/export`

---

## 6. Referências

- [[SPEC_IO_System_v2_5.md]] — Sistema de I/O completo
- [[Verdade_do_Produto.md]] — Estado real do produto
- [[Diagnostico_Topologia_Backend.md]] — Topologia de rotas
- [[Backend_API_Audit_v2_5.md]] — Endpoints existentes