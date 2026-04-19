---
title: Dossier System Specification v2.5
type: drawer
layer: 3
status: active
last_seen: 2026-04-18
backlinks:
  - PRD_Geral_Olcan
  - Verdade_do_Produto
  - Olcan_Master_PRD_v2_5
  - Grafo_de_Conhecimento_Olcan
  - MemPalace_Migration_Spec
  - Roadmap_Implementacao_v2_5
  - Arquitetura_v2_5_Compass
---

<!-- Naviado por: MemPalace/Memória Local — Navegável -->

# Dossier System - Complete Application Package (v2.5)

**Resumo**: Sistema completo de gestão de pacotes de candidatura com suporte a processos paralelo, variações de documentos e exportação unificada.
**Importância**: Crítico
**Status**: Implementado✅
**Camada (Layer)**: Produto / Execução
**Tags**: #dossier #application #package #opportunity #readiness #parallel #export
**Criado**: 17/04/2026
**Atualizado**: 18/04/2026

---

## O Que é o Dossier

O Dossier é um **pacote de candidatura vinculado a uma oportunidade específica**. Substitui documentos soltos por um sistema completo de preparação que inclui:

- **Perfil do candidato** (snapshot no momento)
- **Contexto da oportunidade** (universidade, programa, prazos)
- **Coleção de documentos** (CV, carta, ensaios)
- **Tarefas e milestone** (checklist de preparação)
- **Avaliação de prontidão** (readiness score)

### Processo Paralelo (Chevening Exemplo)

Um candidato pode gerenciar múltiplos processos simultaneamente:

```
Exemplo: Chevening Scholarship + 3 Universidades

┌─────────────────────────────────────────────────────┐
│  DOSSIE PRINCIPAL: "Chevening 2027"                   │
│  ├── Documentos Base (originais)                        │
│  ├── ├── Motivational Letter                   │
│  ├── ├── Study Plan                      │
│  └── └── Passport, Transcripts                      │
├─────────────────────────────────────────────────────┤
│  VARIAÇÕES:                                          │
│  ├── Variation A → Oxford                   │
│  ├── Variation B → Cambridge              │
│  └── Variation C → LSE                          │
└─────────────────────────────────────────────────────┘
```

---

## Componentes Implementados

### 1. DossierHub (`src/components/forge/DossierHub.tsx`)
- Visualização central de todos os processos
- Agrupamento por oportunidade
- Indicadores de urgência (14 dias)
- Stats: total, ativos, concluídos, pendentes

### 2. ExportControlPanel (`src/components/forge/ExportControlPanel.tsx`)
- Botão flutuante próximo ao companion
- Seleção por processo ou global
- Formatos: DOCX, PDF, ZIP
- Badge com contagem de documentos prontos

### 3. VariationsManager (`src/components/forge/VariationsManager.tsx`)
- Gestão de variações de documentos
- Clone para todos os processos
- Tracking de prontidão por variante

### 4. DossierTimeline (`src/components/forge/DossierTimeline.tsx`)
- Linha do tempo cronológica
- Agrupamento por mês
- Prazos, documentos, tarefas

### 5. DocumentGuidancePanel (`src/components/forge/DocumentGuidancePanel.tsx`)
- Guias por tipo de documento
- Estrutura, dicas, erros comuns
- Suporte a CMS

### 6. ProfileDocumentIntegrator (`src/components/forge/ProfileDocumentIntegrator.tsx`)
- Inserção de dados do perfil via click
- Campos: header, experience, skills, etc.

### 7. EnhancedDocumentPanel (`src/components/forge/EnhancedDocumentPanel.tsx`)
- Painel de gestão avançado
- Status de prontidão granular
- Quick actions

---

## Estrutura de Dados

### Dossier Entity
```typescript
interface Dossier {
  id: string;
  userId: string;
  opportunityId: string;
  
  title: string;
  status: DossierStatus;
  deadline: Date;
  
  profileSnapshot: ProfileSnapshot;
  opportunity: OpportunityContext;
  
  documents: DossierDocument[];
  preparation: PreparationActivities;
  readiness: ReadinessEvaluation;
  exports: DossierExport[];
}
```

### ForgeDocument Enhancement
```typescript
interface ForgeDocument {
  id: string;
  title: string;
  type: DocType;
  content: string;
  
  // Opportunity binding
  primaryOpportunityId?: string;
  opportunityIds?: string[];
  
  // Readiness levels
  readinessLevel: 'draft' | 'review' | 'export_ready' | 'submitted';
  
  // Scoring
  competitivenessScore: number | null;
  
  // Versions
  versions: DocumentVersion[];
}
```

---

## Fluxo de Dados

```
Profile Input
    ↓
CMS Guidance (per document type)
    ↓
Document Forge (create/edit)
    ↓
Opportunity Binding (link)
    ↓
Variations (parallel processes)
    ↓
Task Linking (prep activities)
    ↓
Readiness Evaluation
    ↓
Export (DOCX/PDF/ZIP)
```

---

## Document Types Suportados

| Type | Description | Word Count |
| :--- | :--- | :--- |
| cv | Currículo (ATS-optimized) | 200-800 |
| motivation_letter | Carta de Motivação | 250-500 |
| personal_statement | Personal Narrative | 500-1000 |
| statement_of_purpose | Statement Acadêmico | 500-1500 |
| research_proposal | Proposta de Pesquisa | 1500-3000 |
| recommendation | Carta de Recomendação | 300-600 |

---

## Integração com CMS

O CMS agora suporta `document-guidance` para cada tipo de documento:

```typescript
interface CMSDocumentGuidance {
  document_type: DocType;
  title: string;
  description?: string;
  structure?: string[];
  tips?: string[];
  common_mistakes?: string[];
  keywords?: string[];
  word_count_range?: { min: number; max: number };
}
```

---

## Backlinks e Navegação

**Arquitetura/Produtomaindocs:**
- [[Arquitetura_v2_5_Compass]] - Arquitetura geral
- [[PRD_Master_Ethereal_Glass]] - Design system

**Produto/Forge:**
- [[Spec_Narrativa_Forge]] - Sistema de narrativa
- [[Implementacao_Construtor_CV]] - CV Builder

**Operações:**
- [[Runbook_de_Deployment]] - Deployment
- [[Guia_de_Testes_Geral]] - Testes

**Estratégia:**
- [[Roadmap_Implementacao_v2_5]] - Roadmap
- [[Verdade_do_Produto]] - Produto Verdade