---
title: Diagnóstico de Topologia do Backend v2.5
type: drawer
layer: 2
status: active
last_seen: 2026-04-22
backlinks:
  - Arquitetura_v2_5_Compass
  - SPEC_IO_System_v2_5
  - Backend_API_Audit_v2_5
  - Verdade_do_Produto
  - Agent_Knowledge_Handbook
  - Modelo_Core_Routes_Sprints_Tasks
---

# Diagnóstico de Topologia do Backend v2.5

**Resumo**: Mapeamento completo da arquitetura de rotas FastAPI, identificando domínios, serviços, e dívida técnica.
**Status**: Ativo (Auditoria 2026-04-22)
**Camada**: Arquitetura

---

## 1. Topologia Atual: Dois Sistemas Paralelos

O backend possui **dois namespaces de rotas** que coexistem sem critério claro:

### Sistema Legado (`app/api/routes/`) — 41 arquivos

Originado do v2, contém rotas para:
- Authentication (`auth.py`, `oauth.py`)
- Task Management (`tasks.py`, `sprint.py`)
- Routes (`routes.py`, `route_builder.py`)
- Gamification (`achievement.py`, `gamification.py`, `guild.py`)
- Psychology (`psychology.py`, `archetypes.py`, `questions.py`)
- Document Forge (`forge.py`, `narrative.py`)
- Commerce (`commerce.py`, `billing.py`)
- Marketplace (`marketplace.py`, `escrow.py`)
- CRM (`crm.py`)
- Analytics (`analytics.py`, `boards.py`)
- Health Economics (`health_economics.py`, `health_advanced.py`)
- E muito mais (28+ arquivos)

### Sistema Intencional (`app/api/v1/`) — 9 arquivos

Arquitetura projetada para v2.5, contém:
- `auth.py` — v1 auth (alias do legacy?)
- `companions.py` — Companion/Aura system
- `dossiers.py` — Dossier API
- `documents.py` — Document API
- `enhanced_forge.py` — Enhanced Forge
- `leaderboard.py` — Gamification leaderboard
- `marketplace.py` — Marketplace v1
- `users.py` — User profile v1

###mounted no `router.py`

```python
# app/api/router.py
app.include_router(routes.router)       # Legacy (v2)
app.include_router(v1.router, prefix="/api/v1")  # v2.5
```

**PROBLEMA**: Não há separação lógica entre os dois. Funcionalmente equivalentes.

---

## 2. Critério de Domínio Sugerido

| Namespace | Propósito | Exemplos |
|----------|-----------|----------|
| `app/api/routes/` | System/Infra endpoints | auth, health, admin, billing, credentials |
| `app/api/v1/` | User-facing domain | companions, dossiers, documents, routes, tasks |

---

## 3. Serviços por Status de Uso

### ✅ ATIVOS (usados em produção)

| Serviço | Arquivo | Notas |
|---------|---------|-------|
| Auth | `auth.py` | JWT, registro, login |
| Task CRUD | `tasks.py` | Task management |
| Companion | `companions.py` | Aura/gamificação |
| Dossier | `dossiers.py` | Candidaturas |
| Document Forge | `enhanced_forge.py` | Document creation |
| Routes | `routes.py`, `route_builder.py` | Route building |
| Psychology | `psychology.py` | OIOS quiz |

### ⚠️ ASPIRCIONAIS / SUB-DESENVOLVIDOS

| Serviço | Arquivo | Status |
|----------|--------|--------|
| CRM | `crm.py` | Código existe mas API externa não conect |
| Marketplace | `marketplace.py` | Falta integração com Twenty CRM |
| Mautic | marketing.py (não existe) | Aspiracional |
| Temporal Matching | `temporal_matching.py` | Incompleto |

### ❌ COM IMPORT QUEBRADO

| Arquivo | Linha | Problema |
|--------|-------|---------|
| `tasks.py` | 185 | Importa de `v1/companions` (route handler) |
| `quest_service.py` | 411 | Mesmo antipadrão |
| `psychology.py` | 398 | Celery task inexistente |
| `marketplace.py` | 601 | Celery task inexistente |

---

## 4. Dívida Técnica Crítica

### 🔴 EXPORT STUB (`export_service.py`)

O serviço de exportação tem arquitetura correta (Job queue, status tracking) MAS os geradores de arquivo são **placeholders ASCII**:

```
_generate_pdf_document() → retorna texto plano encoding utf-8
_generate_docx_document() → mesmo problema
```

Ver [[Verdade_do_Produto.md]]: "EXPORT STUB — PDF/DOCX are plain text"

### 🔴 IMPORT CIRCULAR

```python
# tasks.py:185 (ERRADO)
from app.api.v1.companions import _calculate_level_from_xp

# CORRETO: deveria ser
from app.services.xp_calculator import XPCalculator
```

O `xp_calculator.py` já existe e tem as funções necessárias.

### ⚠️ LINGUAGENS DUPLICADAS

- `companions.py`: define `_calculate_level_from_xp`, `_xp_to_next_level`, `_determine_stage`
- `xp_calculator.py`: também tem `XPCalculator.calculate_level_from_xp()`, `get_xp_to_next_level()`

Duplicação que causa confusão sobre qual usar.

---

## 5. Arquivos Soltos no Backend Root

O diretório `apps/api-core-v2.5/` tem arquivos que não pertencem ao root:

| Arquivo | Destino Correto |
|--------|----------------|
| `seed_archetypes_simple.py` | `scripts/seed_archetypes.py` |
| `seed_data.py` | `scripts/seed_data.py` |
| `test_registration.py` | `tests/manual/test_registration.py` |
| `test_token.py` | `tests/manual/test_token.py` |
| `create_enhanced_forge_tables.sql` | `data/migrations_manual/` |
| `app.db`, `compass_v25.db` | `data/dev/` ou .gitignore |

---

## 6. Fluxo de Dados: Route → Sprint → Task → Dossier

Para entender o sistema, segue o fluxo:

```
1. USER ONBOARDING (OIOS Quiz)
   → Gera archetype + readiness score
   → Armazenado em Payload CMS

2. ROUTE CREATION
   → User seleciona destino (Germany, UK, etc.)
   → Route Builder gera milestones e sprints
   → Armazenado em PostgreSQL (routes, sprints table)

3. SPRINT EXECUTION
   → Sprint contém Tasks
   → User completa Tasks → ganha XP
   → XP → Companion level up

4. DOCUMENT FORGE
   → User cria CVs, motivation letters
   → Armazenar em PostgreSQL (documents table)

5. DOSSIER EXPORT
   → Agrega: Route + Tasks + Documents
   → Exporta como PDF/DOCX
```

Ver [[Modelo_Core_Routes_Sprints_Tasks.md]] para modelo conceitual completo.

---

## 7. Referências

- [[Backend_API_Audit_v2_5.md]] — Todos os endpoints com line numbers
- [[SPEC_IO_System_v2_5.md]] — Sistema de I/O completo
- [[Verdade_do_Produto.md]] — Estado real (bugs documentados)
- [[Agent_Knowledge_Handbook.md]] — Para agentes (bugs críticos)

---

## 8. Próximos Passos

1. ✅ WiKi atualizada (2026-04-22)
2. ⏳ Corrigir imports em tasks.py e quest_service.py
3. ⏳ Implementar PDF generation real (Playwright + Jinja2)
4. ⏳ Consolidar rotas legadas para v1 gradualmente
5. ⏳ Cleanup arquivos soltos no backend root