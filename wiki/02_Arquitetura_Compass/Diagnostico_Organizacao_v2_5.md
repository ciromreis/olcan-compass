---
title: Diagnóstico de Organização - Olcan Compass v2.5
type: drawer
layer: 2
status: in_progress
last_seen: 2026-04-22
backlinks:
  - Verdade_do_Produto
  - Arquitetura_v2_5_Compass
  - Repositorio_Organizacao_v2_5
---

# Diagnóstico de Organização - v2.5

**Data**: 2026-04-22
**Escopo**: Frontend + Backend + Wiki

---

## 📊 Estrutura do Projeto

### apps/
| Pasta | Tipo | Status |
|------|------|--------|
| `app-compass-v2.5` | Frontend (Next.js) | ✅ ATIVO |
| `api-core-v2.5` | Backend (FastAPI) | ✅ ATIVO |
| `site-marketing-v2.5` | Marketing | ✅ ATIVO |
| `app-compass-v2` | Frontend v2 | 🔒 FROZEN |
| `api-core-v2` | Backend v2 | 🔒 FROZEN |

### packages/
| Pasta | Descrição |
|------|-----------|
| `ui-components` | Design system |
| `shared-auth` | Auth service |

---

## 🔴 Issues Críticos Encontrados

### 1. Rotas Duplicadas
- `dossier.py` (novo) + `dossier_export.py` (velho) → mesmo propósito
- Precisa consolidar

### 2. Frontend Components Desorganizados
```
src/components/
├── root (30 arquivos) ← PROBLEMA
├── ui/ (34 arquivos) ← ok
├── forge/ (38 subdirs) ← ok
├── routes/ (6 subdirs) ← ok
└── outros subdirs...
```

### 3. Backend Route Chaos
```
app/api/routes/
├── 41 arquivos .py
├── ~10 não estão sendo usados
├── Duplicação de functionality
```

---

## 🎯 Prioridades de Fix

### Alta (v2.5 Stability)
1. Limpar rotas não usadas
2. Consolidar dossier endpoints
3. Remover código duplicado

### Média (Organização)
1. Mover components soltos para pastas semantic
2. Padronizar nomenclatura
3. Atualizar wiki

### Baixa (Tech Debt)
1. Documentar APIs
2. Criar testes
3. Migrar para modules

---

## 📝 Wiki Atualização Necessária

### Precisa Atualização
- [ ] Verdade_do_Produto.md → status atual
- [ ] Arquitetura_v2_5_Compass.md → topology real
- [ ] Agent_Knowledge_Handbook.md → bugs atuais
- [ ] Repositorio_Organizacao_v2_5.md → estrutura atual

### Precisa Criar
- [ ] Component_Catalog_v2_5.md → lista todos components
- [ ] API_Routes_Audit.md → audit de rotas
- [ ] Frontend_Store_Map.md → Zustand stores