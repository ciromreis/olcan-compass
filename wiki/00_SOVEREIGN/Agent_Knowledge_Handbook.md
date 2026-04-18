---
title: Agent Knowledge Handbook
type: drawer
layer: 0
status: active
last_seen: 2026-04-17
valid_from: 2026-04-17
valid_until: 2026-07-17
backlinks:
  - Verdade_do_Produto
  - MemPalace_Migration_Spec
  - Padroes_de_Codigo
---

# Agent Knowledge Handbook
**Sobrevivência e手感 para novos agentes IA**

---

## 🎯 Branding rules (CRÍTICO)

| Errado | Certo |
|--------|-------|
| "Compass" | "Olcan Compass" |
| "the app" | "app-compass-v2.5" |
| "the API" | "api-core-v2.5" |
| "Olcan" | "Olcan Compass" when referring to product |

**Regra**: Sempre usar nome completo em primeira menção, nunca abreviar.

---

## ⚠️ Checklist Obrigatório (SEMPRE)

Antes de commit:
- [ ] `npm run type-check` passando
- [ ] `npm run lint` passando
- [ ] Build local successful

Antes de feature nova:
- [ ] Verificar se endpoint API existe
- [ ] Verificar se store necessário
- [ ] Verificar se тип não existe (criar se necessário)
- [ ] Adicionar backlink entre docs相關

---

## 🔄 Padrões de Erros Recorrentes

### 1. Componentes que não existem
```
TS2305: Module has no exported member 'Tabs'
```
**Solução**: Verificar `components/ui/index.ts`, criar component se não existir

### 2. Button variants que não existem
```
TS2322: Type '"outline"' is not assignable
```
**Solução**: Adicionar variant em `Button.tsx`

### 3. Imports quebrados
```
Cannot find module '@/path'
```
**Solução**: Verificar alias em `tsconfig.json`

### 4. Stores não conectadas ao backend
```
feature funciona no frontend mas não persiste
```
**Solução**: Criar endpoint API em `apps/api-core-v2.5/app/api/v1/`

---

## 📁 Structure (Não mudar)

```
apps/
├── app-compass-v2.5/     # Next.js app
├── api-core-v2.5/          # FastAPI
└── site-marketing-v2.5/     # Marketing

packages/
├── ui-components/          # Design system
└── shared-auth/           # Auth

wiki/                      # Source of truth
├── 00_SOVEREIGN/         # MASTER docs
├── 01_Visao_Estrategica/  # Strategy
├── 02_Arquitetura_Compass/ # Technical
├── 03_Produto_Forge/    # Product
└── 10_Arquivo_Permanente/ # Archive (not for reading)
```

---

## 🚀 Quick Start Commands

```bash
# Development
./2_Pipelines/scripts/START_APPLICATION.sh

# Type check
cd apps/app-compass-v2.5 && npm run type-check

# Build
cd apps/app-compass-v2.5 && npm run build

# Database
docker compose up
docker compose run --rm api alembic upgrade head
```

---

## 🎭 Anti-Patterns (não fazer)

1. Não criar TODOs em produção - resolver ou criar task
2. Não assumir que "funciona" - verificar
3. Não ignorar type errors - sempre corrigir
4. Não pular testes de tipo - `npm run type-check` é sagrado
5. Não assumir nomes de variáveis - verificar store/types

---

## 📊 Current State (Abril 17, 2026)

- ✅ 24 stores implementado
- ✅ Dossier System completo
- ✅ Document Wizard (CV, Letter, Proposal)
- ⚠️ Backend sync pendente (dossier/sprints/tasks)
- ❌ Guilds/battles não implementado
- ❌ Entrevistas IA não implementado

---

## 🔗 Navigation

1. Começar sempre: [[Verdade_do_Produto]]
2. Se técnica: [[Arquitetura_v2_5_Compass]]
3. Se produto: [[PRD_Geral_Olcan]]
4. Se operação: [[Runbook_de_Deployment]]

---

## 💉 Validade

Este documento é válido até **Julho 2026**.
Após isso, revisar e atualizar `valid_until`.