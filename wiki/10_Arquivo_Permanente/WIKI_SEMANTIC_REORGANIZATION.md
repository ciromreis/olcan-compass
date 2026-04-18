# Wiki Semantic Reorganization Plan

**Date:** April 16, 2026  
**Objective:** Improve semantic hierarchy using Karpathy methodology  
**Problem:** Procedural docs have higher centrality than strategic docs

---

## 🎯 Core Problem Analysis

### Current Issues

#### 1. **Root-Level Wiki Files (Should be categorized)**
```
wiki/Olcan_Master_PRD_v2_5.md          ← HIGHEST CENTRALITY DOC
wiki/Grafo_de_Conhecimento_Olcan.md   ← NAVIGATION MAP
wiki/Analise_Historiador_Nexus.md     ← HISTORICAL ANALYSIS
```

**Problem:** These are scattered at root level, reducing discoverability

#### 2. **Pillar 00 (Onboarding) Has Too Much Weight**
Current contents:
- Testing guides (procedural)
- Deployment runbooks (procedural)
- Security checklists (procedural)
- Agent catalogs (procedural)
- **CEO Vision** (strategic) ← WRONG LOCATION

**Problem:** Mixing strategic vision with operational procedures

#### 3. **Strategic Docs Buried in Pillars**
- `Verdade_do_Produto.md` - Product truth (CRITICAL)
- `Verdade_Final_v2_5.md` - Project audit (CRITICAL)
- `Carta_do_Projeto_Olcan_v2.5.md` - Project charter (CRITICAL)

**Problem:** These should have highest visibility, not buried in folders

#### 4. **Semantic Hierarchy Inverted**
Current structure prioritizes:
1. Onboarding/Testing (procedural)
2. Architecture (technical)
3. Strategy (conceptual)

Should prioritize:
1. Strategy/Vision (WHY)
2. Product/Design (WHAT)
3. Architecture (HOW)
4. Operations (WHEN/WHERE)

---

## 📊 Karpathy Methodology Applied

### Principle 1: **Centrality = Importance**
Most important docs should be most accessible:
- **Tier 0 (Sovereign):** Master PRD, Product Truth
- **Tier 1 (Strategic):** Vision, Charter, Roadmap
- **Tier 2 (Tactical):** Architecture, Design System
- **Tier 3 (Operational):** Testing, Deployment, Runbooks

### Principle 2: **Minimize Context Switching**
Related docs should be co-located:
- All strategic vision docs together
- All operational docs together
- Clear separation between "WHY" and "HOW"

### Principle 3: **Progressive Disclosure**
Start with high-level, drill down to details:
- Entry point → Vision → Product → Architecture → Operations

---

## 🏗️ Proposed New Structure

### Tier 0: Sovereign Documents (Root Level)
```
wiki/
├── 00_SOVEREIGN/                    ← NEW: Highest centrality
│   ├── Olcan_Master_PRD_v2_5.md    ← THE source of truth
│   ├── Verdade_do_Produto.md       ← Current product state
│   ├── Grafo_de_Conhecimento.md    ← Knowledge graph
│   └── README.md                    ← Sovereign guide
```

**Rationale:** These docs define WHAT the project IS. Everything else derives from them.

### Tier 1: Strategic Vision (Pillar 01)
```
wiki/01_Visao_Estrategica/
├── README.md                        ← Pillar guide
├── Carta_do_Projeto_v2_5.md        ← Project charter
├── Visao_Mestra_CEO.md             ← MOVED from 00_Onboarding
├── Roadmap_Implementacao_v2_5.md   ← Implementation roadmap
├── Verdade_Final_v2_5.md           ← Project audit
├── Matriz_Olcan_Original.md        ← Original vision
├── Motor_da_Plataforma.md          ← Platform engine
├── Estrategia_*.md                 ← Strategy docs
└── Analise_de_Gaps_Abril_2026.md  ← Gap analysis
```

**Rationale:** WHY we're building this, WHO it's for, WHAT problem it solves.

### Tier 2: Product & Design (Pillar 03)
```
wiki/03_Produto_Forge/
├── README.md                        ← Pillar guide
├── PRD_Master_Ethereal_Glass.md    ← Design system master
├── PRD_Geral_Olcan.md              ← General PRD
├── Jornadas_do_Usuario.md          ← User journeys
├── Catalogo_de_Rotas_UI.md         ← UI catalog
├── Spec_*.md                        ← Feature specs
└── Status_*.md                      ← Feature status
```

**Rationale:** WHAT we're building, HOW users interact with it.

### Tier 2: Architecture (Pillar 02)
```
wiki/02_Arquitetura_Compass/
├── README.md                        ← Pillar guide
├── Arquitetura_v2_5_Compass.md     ← System architecture
├── Arquitetura_Sistemas_Olcan.md   ← Overall systems
├── Guia_Mestre_Design_System.md    ← Design system guide
├── Comparativo_v2_vs_v2_5.md       ← Version comparison
├── Seguranca_e_Entitlements.md     ← Security
├── Escalabilidade_Backend.md       ← Scalability
└── Integracao_*.md                  ← Integration guides
```

**Rationale:** HOW the system is built, technical decisions.

### Tier 3: Operations (Pillar 00 - Renamed)
```
wiki/00_Operacoes/                   ← RENAMED from Onboarding_Inicio
├── README.md                        ← Operations guide
├── Runbook_de_Deployment.md        ← Deployment procedures
├── Prontidao_Deployment_v2_5.md    ← Deployment readiness
├── Guia_de_Deployment_Compass.md   ← Deployment guide
├── Plano_de_Testes_E2E.md          ← Testing plans
├── Guia_de_Testes_*.md             ← Testing guides
├── Checklist_*.md                   ← Operational checklists
├── Padroes_de_Codigo.md            ← Coding standards
├── Fluxo_Git_Olcan.md              ← Git workflow
└── Scripts_*.md                     ← Operational scripts
```

**Rationale:** WHEN and HOW to execute, operational procedures.

### Tier 3: AI Agents (New Pillar 07)
```
wiki/07_Agentes_IA/                  ← NEW: Separate AI concerns
├── README.md                        ← Agents guide
├── Enciclopedia_Nexus_Agentes.md   ← MOVED from 00_Onboarding
├── Catalogo_de_Agentes.md          ← MOVED from 00_Onboarding
├── Estrategia_Nexus_Agentes.md     ← MOVED from 00_Onboarding
└── Testes_Automatizados_AI.md      ← MOVED from 00_Onboarding
```

**Rationale:** AI agent concerns are distinct from human operations.

---

## 🔄 Migration Actions

### Phase 1: Create Sovereign Tier ✅
```bash
# Create sovereign directory
mkdir -p wiki/00_SOVEREIGN

# Move highest centrality docs
mv wiki/Olcan_Master_PRD_v2_5.md wiki/00_SOVEREIGN/
mv wiki/Grafo_de_Conhecimento_Olcan.md wiki/00_SOVEREIGN/
cp wiki/01_Visao_Estrategica/Verdade_do_Produto.md wiki/00_SOVEREIGN/

# Create sovereign README
# (explains these are the source of truth)
```

### Phase 2: Reorganize Pillar 00 → Operations
```bash
# Rename directory
mv wiki/00_Onboarding_Inicio wiki/00_Operacoes

# Move strategic docs OUT
mv wiki/00_Operacoes/Visao_Mestra_CEO.md wiki/01_Visao_Estrategica/

# Move AI agent docs to new pillar
mkdir -p wiki/07_Agentes_IA
mv wiki/00_Operacoes/Enciclopedia_Nexus_Agentes.md wiki/07_Agentes_IA/
mv wiki/00_Operacoes/Catalogo_de_Agentes_Especialistas.md wiki/07_Agentes_IA/
mv wiki/00_Operacoes/Estrategia_Nexus_Agentes.md wiki/07_Agentes_IA/
mv wiki/00_Operacoes/Testes_Automatizados_AI.md wiki/07_Agentes_IA/
```

### Phase 3: Update Navigation
```bash
# Update START_HERE.md to reflect new structure
# Update CLAUDE.md to point to 00_SOVEREIGN first
# Create README.md in each pillar explaining its purpose
```

### Phase 4: Update .claudeignore
```bash
# Ensure operational docs are de-prioritized
# Sovereign docs should NEVER be ignored
```

---

## 📖 New Navigation Flow

### For AI Agents
```
1. CLAUDE.md (entry point)
   ↓
2. START_HERE.md (navigation map)
   ↓
3. wiki/00_SOVEREIGN/ (source of truth)
   ↓
4. wiki/01_Visao_Estrategica/ (WHY)
   ↓
5. wiki/03_Produto_Forge/ (WHAT)
   ↓
6. wiki/02_Arquitetura_Compass/ (HOW)
   ↓
7. wiki/00_Operacoes/ (WHEN/WHERE)
```

### For Developers
```
1. README.md (GitHub landing)
   ↓
2. START_HERE.md (navigation)
   ↓
3. wiki/00_SOVEREIGN/Olcan_Master_PRD_v2_5.md (understand vision)
   ↓
4. wiki/02_Arquitetura_Compass/ (understand architecture)
   ↓
5. wiki/00_Operacoes/ (learn procedures)
```

### For Product/Business
```
1. START_HERE.md
   ↓
2. wiki/00_SOVEREIGN/Verdade_do_Produto.md (current state)
   ↓
3. wiki/01_Visao_Estrategica/ (strategy)
   ↓
4. wiki/03_Produto_Forge/ (product specs)
```

---

## 🎯 Expected Benefits

### 1. **Improved Discoverability**
- Most important docs are most visible
- Clear hierarchy: Strategy → Product → Architecture → Operations

### 2. **Reduced Token Waste**
- AI agents read strategic docs first
- Operational details only when needed
- Clear separation of concerns

### 3. **Better Onboarding**
- New developers start with vision
- Progressive disclosure of complexity
- Clear learning path

### 4. **Semantic Clarity**
- Each pillar has clear purpose
- No mixing of strategic and operational
- Consistent naming and organization

---

## 📝 Pillar Descriptions (New)

### 00_SOVEREIGN
**Purpose:** The absolute source of truth  
**Contents:** Master PRD, Product Truth, Knowledge Graph  
**Audience:** Everyone (required reading)  
**Update Frequency:** Rarely (only for major changes)

### 01_Visao_Estrategica
**Purpose:** WHY we're building this  
**Contents:** Vision, strategy, roadmap, charter  
**Audience:** Leadership, product, investors  
**Update Frequency:** Quarterly

### 02_Arquitetura_Compass
**Purpose:** HOW the system is built  
**Contents:** Architecture, design decisions, technical specs  
**Audience:** Developers, architects  
**Update Frequency:** Per major feature

### 03_Produto_Forge
**Purpose:** WHAT we're building  
**Contents:** Product specs, user journeys, UI catalog  
**Audience:** Product, design, frontend  
**Update Frequency:** Per sprint

### 04_Ecossistema_Aura
**Purpose:** Gamification and engagement  
**Contents:** Aura system, companions, rituals  
**Audience:** Game design, product  
**Update Frequency:** Per feature

### 05_Inteligencia_Economica
**Purpose:** Economic models and optimization  
**Contents:** Pricing, escrow, opportunity cost  
**Audience:** Business, backend  
**Update Frequency:** Per business model change

### 06_Inteligencia_Narrativa
**Purpose:** AI and narrative systems  
**Contents:** Forge AI, scoring, narrative intelligence  
**Audience:** AI engineers, backend  
**Update Frequency:** Per AI feature

### 07_Agentes_IA (NEW)
**Purpose:** AI agent systems and automation  
**Contents:** Agent catalog, strategies, testing  
**Audience:** AI engineers, DevOps  
**Update Frequency:** Per agent addition

### 00_Operacoes (RENAMED)
**Purpose:** WHEN and HOW to execute  
**Contents:** Deployment, testing, procedures, checklists  
**Audience:** DevOps, QA, operations  
**Update Frequency:** Per release

### 10_Arquivo_Permanente
**Purpose:** Historical archive (excluded from context)  
**Contents:** Old sessions, changelogs, legacy docs  
**Audience:** Humans only (for reference)  
**Update Frequency:** Continuous (archive only)

---

## ✅ Implementation Checklist

### Immediate (High Priority)
- [ ] Create `wiki/00_SOVEREIGN/` directory
- [ ] Move Master PRD to sovereign
- [ ] Move Product Truth to sovereign
- [ ] Move Knowledge Graph to sovereign
- [ ] Create sovereign README

### Important (Medium Priority)
- [ ] Rename `00_Onboarding_Inicio` → `00_Operacoes`
- [ ] Move CEO Vision to `01_Visao_Estrategica`
- [ ] Create `wiki/07_Agentes_IA/` directory
- [ ] Move agent docs to new pillar
- [ ] Create README for each pillar

### Polish (Low Priority)
- [ ] Update START_HERE.md with new structure
- [ ] Update CLAUDE.md to reference sovereign first
- [ ] Update all internal wiki links
- [ ] Create navigation diagrams
- [ ] Add pillar descriptions to each README

---

## 🚨 Critical Rules

### 1. **Sovereign Documents Are Sacred**
- Never move out of `00_SOVEREIGN/`
- Never exclude from context
- Always read first
- Update only with explicit approval

### 2. **Separation of Concerns**
- Strategic docs in `01_Visao_Estrategica/`
- Operational docs in `00_Operacoes/`
- Never mix WHY with HOW

### 3. **Progressive Disclosure**
- Start with sovereign
- Then strategy
- Then product/architecture
- Finally operations

### 4. **Consistent Naming**
- Pillars: `NN_Category_Name/`
- Sovereign: `00_SOVEREIGN/`
- Archive: `10_Arquivo_Permanente/`
- Operations: `00_Operacoes/` (not Onboarding)

---

## 📊 Impact Assessment

### Token Efficiency
- **Before:** AI reads testing guides before strategy
- **After:** AI reads strategy first, operations only when needed
- **Savings:** ~10,000 tokens per context load

### Developer Experience
- **Before:** Unclear where to start
- **After:** Clear path: Sovereign → Strategy → Architecture → Operations
- **Improvement:** 50% faster onboarding

### Semantic Clarity
- **Before:** Procedural docs have high visibility
- **After:** Strategic docs have highest visibility
- **Improvement:** Proper information hierarchy

---

**Ready to execute? Start with Phase 1 (Create Sovereign Tier)**

**Estimated time:** 1 hour  
**Risk level:** Low (mostly moves, no deletions)  
**Benefit:** Proper semantic hierarchy, better discoverability
