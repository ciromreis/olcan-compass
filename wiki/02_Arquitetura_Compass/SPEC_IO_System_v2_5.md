---
title: I/O System Specification v2.5
type: drawer
layer: 2
status: active
last_seen: 2026-04-20 (code audit completo + infra verified)
backlinks:
  - Arquitetura_v2_5_Compass
  - Spec_Dossier_System_v2_5
  - Roadmap_Implementacao_v2_5
  - Olcan_Master_PRD_v2_5
  - INFRAESTRUTURA_OVERVIEW
  - DEPLOYMENT_RENDER
  - CI_CD_Estado_Atual
  - Backend_API_Audit_v2_5
  - HIDDEN_FOLDERS_AUDIT
---

# I/O System Specification v2.5

**Resumo**: Sistema completo de Input/Output para Olcan Compass - covering data entry, document management, exports, and brand integration. Designed for international application workflows.
**Importância**: Crítico
**Status**: Planejamento (Fase 5 Roadmap)
**Camada (Layer)**: Arquitetura / Produto
**Tags**: #io #input #output #export #import #pdf #dossier #brand
**Criado**: 20/04/2026
**Atualizado**: 2026-04-20 (code audit completo)

---

## Infraestrutura Real (STATE 2026-04-19)

| Componente | Plataforma | URL real |
|------------|-----------|----------|
| Frontend | Vercel | `compass.olcan.com.br` |
| API | Render (Docker) | `olcan-compass-api.onrender.com` |
| Database | Render PostgreSQL | `dpg-d7i2qnkvikkc73aj0gm0-a` |
| DNS | Cloudflare | `olcan.com.br` |
| Automação | N8N (GCP) | `n8n.olcan.com.br` |

> **CRÍTICO**: Ver [[INFRAESTRUTURA_OVERVIEW.md]] para detalhes completos.
> **API COMPLETA**: Ver [[Backend_API_Audit_v2_5.md]] para todos os endpoints com line numbers.

---

## Visão Geral do Sistema I/O

O Sistema I/O é o coração da experiência do usuário no Olcan Compass, permitindo:

1. **INPUT**: Entrada de dados para processos de candidatura internacional
2. **ORGANIZE**: Organização via Docs Forge e Task Management
3. **OUTPUT**: Exportação em PDF e Dossier com marca Olcan

```
┌─────────────────────────────────────────────────────────────────┐
│                    OLCAN COMPASS I/O SYSTEM                    │
├─────────────────────────────────────────────────────────────────┤
│  INPUT                    ORGANIZE                   OUTPUT    │
│  ├── Onboarding Quiz      ├── Docs Forge            ├── PDF    │
│  ├── Profile Builder     ├── Task Management        ├── Dossier│
│  ├── Document Import     ├── Dossier System         ├── Brand  │
│  ├── Opportunity Data    ├── Variations             └── ZIP     │
│  └── Manual Entry        └── Timeline                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## PARTE 1: SUBDOMAINS (Multitenancy)

### 1.1 DNS Records Ativos (VERIFICADO em 2026-04-19)

| Tipo | Nome | Valor | Status Real |
|------|------|-------|------------|
| A | `olcan.com.br` | `76.76.21.21` | ✅ LIVE (Vercel raiz) |
| CNAME | `www` | `cname.vercel-dns.com` | ✅ LIVE (marketing) |
| CNAME | `compass` | `cname.vercel-dns.com` | ✅ LIVE (app) |
| CNAME | `app` | `cname.vercel-dns.com` | ✅ LIVE (alias) |
| A | `n8n` | `35.238.150.117` | ✅ LIVE (GCP VM) |

### 1.2 Middleware Mapeado MAS NÃO em DNS

O middleware em `apps/app-compass-v2.5/src/middleware.ts` tem rotas definidas para:

```
admin → /admin      ⚠️ DNS NÃO-configurado
vendors → /provider ⚠️ DNS NÃO-configurado  
mentors → /provider  ⚠️ DNS NÃO-configurado
app → /dashboard   ✅ rewrites to (app) group
```

**Gap crítico:** O código existe mas não resolve via DNS. Precisa adicionar records.

### 1.3 SubdomainsPlanejados

| Subdomain | DNS Status | Middleware | Dependência |
|----------|-----------|-----------|-----------|
| admin.olcan.com.br | ⏳ PENDING | ✅ coded | Cloudflare CNAME |
| vendors.olcan.com.br | ⏳ PENDING | ✅ coded | Cloudflare CNAME |
| marketplace | ⏳ PENDING | ⏳ PENDING | Fase 5 Roadmap |
| community | ⏳ PENDING | ⏳ PENDING | Fase 5 Roadmap |

### 1.4 Como adicionar subdomínio

1. Adicionar ao Cloudflare (ver [[DNS_CLOUDFLARE.md]]):
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CNAME",
    "name": "admin.olcan.com.br",
    "content": "cname.vercel-dns.com",
    "proxied": true
  }'
```

2. O middleware já está configurado - apenas fazer resolve

---

## PARTE 2: ENGINEERING DATA FLOW (Código Verificado)

### 2.1 ALL Frontend Stores (I/O Related)

| Store | File | Função Principal |
|-------|------|-----------------|
| `useRouteStore` | `stores/routes.ts` | Route/milestone management |
| `useRouteBuilderStore` | `stores/routeBuilderStore.ts` | Route builder UI |
| `useTaskStore` | `stores/taskStore.ts` | Task/XP/achievements |
| `useForgeStore` | `stores/forge.ts` | Document management |
| `useDossierStore` | `stores/dossier.ts` | Dossier management |
| `useAuraStore` | `stores/auraStore.ts` | Companion/Aura |
| `useApplicationsStore` | `stores/applications.ts` | Applications/Opportunities |
| `useMarketplaceStore` | `stores/marketplace.ts` | Provider marketplace |
| `useProfileStore` | `stores/profile.ts` | User profile |
| `usePsychStore` | `stores/psych.ts` | Psychology/intake |
| `useArchetypeStore` | `stores/archetypeStore.ts` | Archetypes |
| `useEventDrivenGamificationStore` | `stores/eventDrivenGamificationStore.ts` | Event-based XP |

### 2.2 ALL Backend API Endpoints

#### Routes/Opportunities
```
GET    /routes/templates     - Route templates
POST   /routes             - Create route
GET    /routes             - List routes  
GET    /routes/{route_id}  - Get route detail
PUT    /routes/{route_id}  - Update route
DELETE /routes/{route_id}  - Delete route
PATCH  /routes/milestones/{milestone_id} - Update milestone
GET    /opportunities/{opportunity_id}
POST   /opportunities
PATCH  /opportunities/{opportunity_id}
```

#### Tasks
```
POST   /api/tasks/              - Create task (+XP)
GET    /api/tasks/              - List tasks
GET    /api/tasks/{task_id}     - Get task
PATCH  /api/tasks/{task_id}    - Update task
DELETE /api/tasks/{task_id}    - Delete task
POST   /api/tasks/{task_id}/complete  - Complete (+XP, streak)
POST   /api/tasks/{task_id}/start    - Start task
GET    /api/tasks/progress      - User progress (XP/level)
GET    /api/tasks/achievements - Achievement catalog
GET    /api/tasks/achievements/user - User achievements
GET    /api/tasks/stats        - Task statistics
```

#### Documents/Forge
```
POST   /documents              - Create document
GET    /documents             - List documents
GET    /documents/{doc_id}    - Get document
PUT    /documents/{doc_id}     - Update document
DELETE /documents/{doc_id}    - Delete document
POST   /documents/{doc_id}/analyze    - AI analyze
POST   /documents/{doc_id}/polish     - AI polish
GET    /documents/{doc_id}/versions   - Version history
POST   /documents/{doc_id}/ats-analyze - ATS scoring
```

#### Dossiers
```
POST   /dossiers              - Create dossier
GET    /dossiers             - List dossiers
GET    /dossiers/{id}       - Get dossier
PUT    /dossiers/{id}        - Update dossier
DELETE /dossiers/{id}       - Delete dossier
POST   /dossiers/{id}/documents   - Add document
POST   /dossiers/{id}/tasks      - Add task
POST   /dossiers/{id}/evaluate   - Evaluate readiness
```

### 2.4 Gamification System (Aura + XP)

#### XP Calculator (Backend)

Arquivo: `apps/api-core-v2.5/app/services/xp_calculator.py`

```python
# LEVEL_THRESHOLDS (lines 19-31)
LEVEL_THRESHOLDS = {
    1: 0,       # Explorer
    2: 100,     # Traveler
    3: 250,     # Navigator
    4: 500,     # Pathfinder
    5: 1000,    # Voyager
    6: 2000,    # Ambassador
    7: 4000,    # Diplomat
    8: 8000,    # Consul
    9: 16000,   # Commissioner
    10: 32000,  # Legend
}

# XP_REWARDS (lines 48-56)
XP_REWARDS = {
    "task_complete_base": 10,
    "task_complete_high": 25,
    "task_complete_critical": 50,
    "streak_bonus_per_day": 5,
    "first_task_of_day": 15,
    "route_completion_bonus": 500,
}
```

#### Streak System

```python
STREAK_COOLDOWN_HOURS = 36  # Hours before streak breaks
```

#### Achievement System

- `app/services/achievement_service.py` - Achievement checking
- Tables: `achievement`, `user_achievement`

### 2.5 Data Flow Diagram

```
FRONTEND                           BACKEND                        DATABASE
┌─────────────┐                  ┌──────────────┐              ┌───────────┐
│useRoutes   │ ←──────────────→│ Routes API  │─────────────→│ Routes   │
│useTaskStore│ ←──────────────→│ Tasks API   │─────────────→│ Tasks   │
│useForge   │ ←──────────────→│Documents API│────────────→│Documents│
│useDossier │ ←──────────────→│ Dossiers API│────────────→│ Dossiers│
│useAuraStore│ ←──────────────→│Achievement │────────────→│Achievements│
└────────────┘                  └──────────────┘              └───────────┘
        ↑                               ↑
        │ XP Calculator                  │
        └───────────────────────────────┘
```

---

## PARTE 3: CODE PROBLEMS IDENTIFICADOS

### Frontend (v2.5 app)

| File | Line | Problema | Status |
|------|------|----------|--------|
| `stores/dossier.ts` | 633-650 | `evaluateReadiness` retorna 0 (hardcoded) | 🛑 NÃO FUNCIONAL |
| `stores/dossier.ts` | 595-605 | Milestone methods são stubs vazios | 🛑 NÃO FUNCIONAL |
| `stores/forge.ts` | 622 | `bindToOpportunity` - local only, TODO backend | ⚠️ PARCIAL |
| `stores/forge.ts` | 642 | `unbindFromOpportunity` - local only | ⚠️ PARCIAL |
| `stores/taskStore.ts` | 249 | `getTask()` wrong method name | 🐛 BUG |

### Backend (API v2.5) - Ver [[Backend_API_Audit_v2_5]] Completo

| Domain | Line | Problema | Status |
|--------|------|----------|--------|
| Tasks | 185-196 | Import from non-existent `app.api.v1.companions` | 🔴 BROKEN |
| Tasks | 279-291 | Leaderboard returns empty data | 🔴 STUB |
| Tasks | 355-363 | Achievement claim not implemented | 🔴 STUB |
| Psychology | 396-413 | Celery task imports that don't exist | 🔴 MISSING |
| Marketplace | 599-611 | Non-existent Celery task | 🔴 MISSING |
| Dossiers | 96-106 | N+1 query when listing | 🐛 PERFORMANCE |

---

## PARTE 4: INPUT SYSTEMS (Entrada de Dados)

### 2.1 Onboarding com OIOS (Diagnostic Mirror)

**Status**: ✅ Implementado
**Localização**: `(app)/onboarding/`

Fluxo:
```
Quiz de 12 perguntas → OIOS Archetype → Profile Snapshot → Dashboard Setup
```

Campos coletados:
- Nome, email, telefone
- Nacionalidade atual
- Destinos de interesse
- Nível de experiência
- Área de interesse

### 2.2 Profile Builder

**Status**: ✅ Implementado
**Localização**: `(app)/profile/`

Componentes:
- `ProfileForm.tsx` - Formulário principal
- `PresencePhenotypeEditor.tsx` - Traços de personalidade
- `ExperienceEditor.tsx` - Experiência profissional
- `EducationEditor.tsx` - Formação acadêmica
- `SkillsMatrix.tsx` - Matriz de competências

### 2.3 Document Import

**Status**: ⚠️ Parcial
**Localização**: `(app)/documents/`

Implementado:
- `PDFImporter.tsx` - Importação de PDFs existentes
- Extração de texto básico

Pendente:
- OCR avançado
- Parser estruturado para CVs
- Importação de LinkedIn

### 2.4 Opportunity Data Entry

**Status**: ✅ Implementado
**Localização**: `(app)/routes/`, `(app)/opportunities/`

Funcionalidades:
- Busca de universidades/programas
- Deadline tracking
- Requisitos por oportunidade
- Vinculação a Dossiers

### 2.5 Manual Entry (Forms)

**Status**: ✅ Implementado
**Componentes**:
- `EnhancedDocumentPanel.tsx` - Criação de documentos
- `TaskForm.tsx` - Criação de tarefas
- `DossierWizard.tsx` - Wizard de dossier

---

## PARTE 3: ORGANIZE SYSTEMS

### 3.1 Docs Forge (Narrative Forge)

**Status**: ✅ Implementado
**Localização**: `(app)/forge/`, `(app)/forge-lab/`

Componentes principais:

| Componente | Arquivo | Função |
|------------|---------|--------|
| ForgeEditor | `ForgeEditor.tsx` | Editor de documentos |
| CVBuilder | `CVBuilder.tsx` | Construtor de CV |
| CoverLetterBuilder | `CoverLetterBuilder.tsx` | Cartas de motivação |
| NarrativeScorer | `NarrativeScorer.tsx` | AI scoring |
| DocumentGuidance | `DocumentGuidancePanel.tsx` | Guias por tipo |

#### 3.1.1 Document Types Suportados

| Type | Descrição | Word Count |
| :--- | :--- | :--- |
| cv | Currículo ATS-optimized | 200-800 |
| motivation_letter | Carta de Motivação | 250-500 |
| personal_statement | Personal Narrative | 500-1000 |
| statement_of_purpose | Statement Acadêmico | 500-1500 |
| research_proposal | Proposta de Pesquisa | 1500-3000 |
| recommendation | Carta de Recomendação | 300-600 |

### 3.2 Task Management

**Status**: ✅ Implementado
**Localização**: `(app)/tasks/`, `(app)/sprints/`

Componentes:
- `TaskBoard.tsx` - Kanban board
- `SprintCommand.tsx` - Sprint execution
- `TaskForm.tsx` - Criação/edição
- XP system integrado

Funcionalidades:
- CRUD de tarefas
- Subtasks/checklists
- Due dates
- Streaks e gamificação

### 3.3 Dossier System

**Status**: ✅ Frontend Completo
**Localização**: `(app)/dossier/`

Componentes:
- `DossierHub.tsx` - Central de dossiers
- `DossierTimeline.tsx` - Timeline
- `VariationsManager.tsx` - Variações
- `ExportControlPanel.tsx` - Painel de exportação
- `ReadinessPanel.tsx` - Avaliação de prontidão

Estrutura:
```
Dossier
├── Opportunity (universidade/programa)
├── Profile Snapshot
├── Documents Collection
│   ├── Base Documents
│   └── Variations (A, B, C...)
├── Preparation Tasks
└── Readiness Score
```

---

## PARTE 4: OUTPUT SYSTEMS (Export)

### 4.1 PDF Export

**Status**: ⚠️ Parcial (Print-based)
**Localização**: `components/forge/PDFExporter.tsx`

Implementação atual:
- Usa `window.print()` com CSS print
- Formatação básica de markdown
- Sem marca d'água Olcan

**LIMITADO** - Precisa de:
1. Marca Olcan (logo, cores)
2. Templates profissionais
3. ATS-optimized output
4. Multi-page support

### 4.2 Dossier Export

**Status**: ⏳ Pendente (Backend sync)
**Localização**: `(app)/dossier/[id]/export`

Planejado:
- Exportação ZIP completa
- PDFs individuais por documento
- Template unificado com marca
- Checklist de envio

### 4.3 Brand Export System

**Status**: 🎯 A IMPLEMENTAR
**Propósito**: Exportações com identidade visual Olcan

Componentes necessários:

#### 4.3.1 Brand Templates

| Template | Uso | Elementos |
|----------|-----|-----------|
| CV Professional | Candidaturas formais | Logo, cores, formatação |
| CV Creative | Áreas criativas | Design adaptativo |
| Academic | Papers, propostas | Formatação acadêmica |
| Dossier Cover | Capa de dossier | Branding unificado |

#### 4.3.2 Brand Assets

Localização atual: `packages/ui-components/src/styles/globals.css`

Cores brand:
```css
--brand-primary: #001338;    /* Navy Blue */
--brand-accent: #21264D;     /* Light Navy */
--brand-500: #3b82f6;       /* Blue accent */
--brand-gradient: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-accent) 100%);
```

#### 4.3.3 Implementação Proposta

```typescript
// Estrutura proposta para BrandExporter
interface BrandExporter {
  template: BrandTemplate;
  documents: ForgeDocument[];
  options: ExportOptions;
  
  // Methods
  exportPDF(): Promise<Blob>;
  exportDOCX(): Promise<Blob>;
  exportDossier(): Promise<Blob>; // ZIP
  exportWithWatermark(): Promise<Blob>;
}
```

### 4.4 JSON Export

**Status**: ✅ Implementado
**Localização**: `PDFExporter.tsx`

Exporta:
- Document content
- Metadata
- Timestamps
- Format: `olcan-forge-v1`

---

## PARTE 5: DATA FLOW (Fluxo Completo)

### 5.1 Input → Organize → Output

```
1. INPUT
   ├── User completes onboarding
   ├── Profile data entered
   ├── Documents imported/created
   └── Opportunities added
   
2. ORGANIZE
   ├── Documents linked to opportunities
   ├── Tasks created for preparation
   ├── Dossiers assembled
   └── Variations generated
   
3. OUTPUT
   ├── PDF generated (current: print-based)
   ├── DOCX exported
   ├── Dossier ZIP created
   └── Ready for submission
```

### 5.2 API Integration Points

| Endpoint | Método | Função |
|----------|--------|--------|
| `/api/v1/documents` | POST | Create document |
| `/api/v1/documents/:id` | PUT | Update document |
| `/api/v1/dossiers` | POST | Create dossier |
| `/api/v1/tasks` | POST | Create task |
| `/api/v1/export/pdf` | POST | Generate PDF (future) |
| `/api/v1/export/dossier` | POST | Generate dossier ZIP |

---

## PARTE 6: IMPLEMENTATION ROADMAP

### Deploy Real (como funciona HOJE)

```
Push → GitHub
     → Render detecta (webhook)
     → Docker build (apps/api-core-v2.5/Dockerfile)
     → Alembic migrations no startup
     → https://olcan-compass-api.onrender.com

Frontend:
Push → Vercel (webhook automático)
     → pnpm build:v2.5
     → https://compass.olcan.com.br
```

**Ler:** [[DEPLOYMENT_RENDER.md]] para detalhes completos.

### Fase 1: CRITICAL FIXES (Week 1) — based on code audit

| Task | Status | Priority | Code Reference |
|------|--------|----------|----------------|
| [ ] FIX: readiness evaluation returns 0 | 🛑 CRITICAL | `stores/dossier.ts:633-650` |
| [ ] FIX: milestone methods empty stubs | 🛑 CRITICAL | `stores/dossier.ts:595-605` |
| [ ] FIX: taskStore getTask() wrong name | 🐛 BUG | `stores/taskStore.ts:249` |
| [ ] FIX: bindToOpportunity backend sync | ⚠️ HIGH | `stores/forge.ts:622` |
| [ ] Add admin to DNS | ⏳ PENDING | Cloudflare API |
| [ ] Add vendors to DNS | ⏳ PENDING | Cloudflare API |

### Fase 2: Brand Export (Week 2)

| Task | Status | Priority | Dependência |
|------|--------|----------|-------------|
| [ ] Brand PDF Templates | ⏳ PENDING | HIGH | Design System v2.5 |
| [ ] Enhanced PDFExporter | ⏳ PENDING | HIGH | Brand Templates |
| [ ] Dossier ZIP Export | ⏳ PENDING | HIGH | JSZip lib |

### Fase 3: Input Enhancement (Week 3-4)

| Task | Status | Priority |
|------|--------|----------|
| [ ] LinkedIn Import | ⏳ PENDING | MEDIUM |
| [ ] OCR for PDFs | ⏳ PENDING | MEDIUM |
| [ ] Structured CV Parser | ⏳ PENDING | MEDIUM |

---

## PARTE 7: HANDOVER NOTES (Para Modelos Menos Potentes)

### ⚠️ DISCLAIMER: Verifique sempre CI/CD

O deploy NÃO é pelo GitHub Actions. É:
- Vercel (frontend)
- Render (backend)

Ver [[CI_CD_Estado_Atual.md]] para gaps identificados.

### Como implementar Brand PDF

1. **Arquivo:** `apps/app-compass-v2.5/src/components/forge/PDFExporter.tsx`
2. **Modificar:** Adicionar header com logo, cores brand
3. **Testar:** `pnpm dev:v2.5`

```tsx
// Adicionar no HTML gerado:
<header style="border-bottom: 2px solid #001338; padding-bottom: 10px;">
  <img src="/logo-olcan.png" style="height: 30px;" />
</header>
```

### Como implementar Dossier ZIP

1. **Instalar:** `pnpm add jszip`
2. **Criar:** `components/forge/DossierExporter.tsx`
3. **Integrar:** Em `ExportControlPanel.tsx`

```tsx
import JSZip from 'jszip';

async function exportDossier(dossier: Dossier) {
  const zip = new JSZip();
  for (const doc of dossier.documents) {
    zip.file(`${doc.title}.pdf`, await generatePDF(doc));
  }
  return zip.generateAsync({ type: 'blob' });
}
```

### Como adicionar subdomínio (admin, vendors, etc)

1. **Verificar:** DNS não está configurado para admin/vendors
2. **Adicionar:** Cloudflare record (ver [[DNS_CLOUDFLARE.md]])
3. **Middleware:** Já está pronto em `middleware.ts` - precisa funcionar

### Como conectar Dossier API

1. **Backend:** `apps/api-core-v2.5/app/api/v1/`
2. **Criar:** `dossiers.py` endpoint
3. **Testar:** `docker compose up --build`

### Arquivos críticos para I/O:

```
apps/app-compass-v2.5/
├── src/
│   ├── middleware.ts            # Subdomain routing (admin, vendors)
│   ├── components/forge/
│   │   ├── PDFExporter.tsx      # PDF export ← EDITAR PARA BRAND
│   │   ├── DossierHub.tsx       # Dossier hub
│   │   ├── ExportControlPanel.tsx
│   │   └── VariationsManager.tsx
│   └── app/(app)/
│       ├── forge/               # Docs Forge
│       ├── dossier/[id]/       # Dossier detail
│       └── tasks/               # Task management

apps/api-core-v2.5/
├── app/api/v1/
│   ├── documents.py             # ← ADICIONAR DOSSIER ENDPOINTS
│   └── dossiers.py             # ← NOVO - criar
└── alembic/versions/           # migrations
```

### Checklist de Deploy Saudável

```bash
# 1. Verificar API health
curl https://olcan-compass-api.onrender.com/api/health

# 2. Verificar Vercel build
curl https://compass.olcan.com.br

# 3. Alembic migrations
# Ver logs no Render dashboard
```

---

---

## PARTE 8: READINESS EVALUATION ALGORITHM (IMPLEMENTAR)

O sistema de avaliação de prontidão (`evaluateReadiness`) está retornando 0 hardcoded. Precisa ser implementado:

### 8.1 Fórmula Proposta

```typescript
// Em stores/dossier.ts - implementar evaluateReadiness()
function evaluateReadiness(dossier: Dossier): ReadinessScore {
  const factors = {
    documents: calculateDocumentScore(dossier.documents),
    tasks: calculateTaskProgress(dossier.tasks),
    profile: calculateProfileCompleteness(dossier.profileSnapshot),
    deadline: calculateTimeRemaining(dossier.deadline),
  };
  
  return {
    overall: weightedAverage(factors),
    breakdown: factors,
    recommendation: generateRecommendations(factors),
  };
}
```

### 8.2 Pesos Sugeridos

| Fator | Peso | Descrição |
|-------|-----|-----------|
| Documents | 40% | Prontidão dos documentos |
| Tasks | 30% | Progresso das tarefas |
| Profile | 20% | Completude do perfil |
| Deadline | 10% | Tempo restante |

### 8.3 Implementação

Edit file: `apps/app-compass-v2.5/src/stores/dossier.ts`
Function: lines 633-650

```typescript
const evaluateReadiness = (dossier: Dossier): ReadinessEvaluation => {
  // IMPLEMENTAR: Calcular scores reais
  const docScore = dossier.documents.filter(d => d.readinessLevel === 'export_ready').length 
    / dossier.documents.length * 100;
  
  const taskProgress = dossier.preparation.filter(t => t.completed).length 
    / dossier.preparation.length * 100;
  
  return {
    overall: (docScore * 0.4) + (taskProgress * 0.3) + (profileScore * 0.2),
    breakdown: { documents: docScore, tasks: taskProgress },
  };
};
```

---

## Backlinks

**Infraestrutura (CRÍTICO para deploy):**
- [[INFRAESTRUTURA_OVERVIEW]] - Mapa completo
- [[DEPLOYMENT_RENDER]] - Deploy manual
- [[CI_CD_Estado_Atual]] - Estado CI/CD real
- [[DNS_CLOUDFLARE]] - Subdomínios
- [[HIDDEN_FOLDERS_AUDIT]] - Hidden folders + critical code issues

**Arquitetura:**
- [[Arquitetura_v2_5_Compass]] - Arquitetura geral

**Produto:**
- [[Spec_Dossier_System_v2_5]] - Dossier spec
- [[Spec_Narrativa_Forge]] - Narrative Forge

**Estratégia:**
- [[Roadmap_Implementacao_v2_5]] - Roadmap
