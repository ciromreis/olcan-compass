---
title: Dossier System Specification
type: drawer
layer: 3
status: active
last_seen: 2026-04-17
backlinks:
  - PRD_Geral_Olcan
  - Verdade_do_Produto
  - Olcan_Master_PRD_v2_5
---

# Dossier System - Complete Application Package

**Resumo**: Sistema completo de gestão de pacotes de candidatura, vinculando oportunidades a documentos, tarefas e avaliações de prontidão.
**Importância**: Crítico (Novembro Prioridade)
**Status**: Implementado✅
**Camada (Layer)**: Produto / Execução
**Tags**: #dossier #application #package #opportunity #readiness
**Criado**: 17/04/2026
**Atualizado**: 17/04/2026

---

## O Que é o Dossier

O Dossier é um **pacote de candidatura vinculado a uma oportunidade específica**. Substitui documentos soltos por um sistema completo de preparação que inclui:

- **Perfil do candidato** (snapshot no momento)
- **Contexto da oportunidade** (universidade, programa, prazos)
- **Coleção de documentos** (CV, carta, ensaios)
- **Tarefas e milestone** (checklist de preparação)
- **Avaliação de prontidão** (readiness score)

---

## Estrutura de Dados

### Dossier Entity
```typescript
interface Dossier {
  id: string;
  userId: string;
  opportunityId: string;  // Primary binding
  
  title: string;           // e.g., "MIT PhD Application 2027"
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

### Document Types Suportados
1. **CV / Currículo** - Documento principal
2. **Motivation Letter** - Carta de motivação
3. **Research Proposal** - Proposta de pesquisa (PhD)
4. **Personal Statement** - Declaração pessoal
5. **Statement of Purpose** - Propósito de estudos
6. **Letter of Recommendation** - Carta de recomendação
7. **English Proficiency Test** - Teste de proficiência
8. **Financial Document** - Documento financeiro
9. **Passport Copy** - Passaporte

---

## UI Components

### Pages
- `/dossiers` - List page com stats dashboard
- `/dossiers/[id]` - Detail page com 4 tabs

### Tabs
1. **Overview** - Resume, documents list, tasks, readiness score
2. **Documents** - Grid de documentos com status badges
3. **Tasks** - Checklist de preparação
4. **Readiness** - Avaliação de prontidão

### Wizard
**DocumentWizard.tsx** - Multi-step para criação de documentos:
- **CV Wizard**: 8 passos (opportunity → personal → summary → experience → education → skills → ATS → review)
- **Motivation Letter**: 5 passos
- **Research Proposal**: 9 passos

---

## Stores

### Dossier Store (`stores/dossier.ts`)
- `createDossier()` - Criar novo dossier
- `updateDossier()` - Atualizar
- `deleteDossier()` - Remover
- `getDossierById()` - Buscar por ID
- `getAllDossiers()` - Listar todos
- `addDocument()` - Adicionar documento
- `updateDocument()` - Atualizar documento
- `removeDocument()` - Remover documento
- `addTask()` - Adicionar tarefa
- `updateTaskStatus()` - Atualizar status
- `calculateReadiness()` - Calcular score

---

## API Endpoints (Planejado)

| Endpoint | Método | Descrição |
|----------|--------|------------|
| `/dossiers` | GET | Listar dossiers |
| `/dossiers` | POST | Criar dossier |
| `/dossiers/:id` | GET | Detalhe dossier |
| `/dossiers/:id` | PUT | Atualizar |
| `/dossiers/:id` | DELETE | Remover |
| `/dossiers/:id/documents` | POST | Adicionar documento |
| `/dossiers/:id/tasks` | POST | Adicionar tarefa |
| `/dossiers/:id/readiness` | GET | Score de prontidão |
| `/dossiers/:id/export` | POST | Exportar pacote |

---

## Readiness Score

O score de prontidão é calculado automáticamente baseado em:

| Componente | Peso |
|------------|------|
| Documentos completos | 40% |
| Tarefas concluídas | 30% |
| Deadline proximidade | 20% |
| Perfil completo | 10% |

---

## Ligações
- [[PRD_Geral_Olcan]] ← PRD Geral
- [[Verdade_do_Produto]] ← Estado atual
- [[Olcan_Master_PRD_v2_5]] ← PRD Master
- [[wiki/02_Arquitetura_Compass/Arquitetura_v2_5_Compass]] ← Arquitetura

---

## Código Fonte
- `src/types/dossier-system.ts` - Type definitions (640+ linhas)
- `src/stores/dossier.ts` - State management (600+ linhas)
- `src/components/dossier/DocumentWizard.tsx` - Wizard
- `src/components/dossier/DocumentTypeSelector.tsx` - Type selector
- `src/app/(app)/dossiers/page.tsx` - List page
- `src/app/(app)/dossiers/[id]/page.tsx` - Detail page