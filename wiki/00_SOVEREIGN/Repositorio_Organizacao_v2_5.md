---
title: Repositorio Organizacao e Refatoracao v2.5
type: drawer
layer: 0
status: active
last_seen: 2026-04-21
backlinks:
  - Agent_Knowledge_Handbook
  - Verdade_do_Produto
  - Arquitetura_v2_5_Compass
  - SPEC_IO_System_v2_5
  - Padroes_de_Codigo
---

# Repositorio Organizacao e Refatoracao v2.5

**Resumo**: Analise metacognitiva da estrutura atual do repositorio, identificando problemas de organizacao, nomenclatura inconsistente, e oportunidades de otimizacao para production streamline.
**Importancia**: Critica
**Status**: Planejamento
**Camada (Layer)**: Arquitetura / Organizacao
**Tags**: #organizacao #refatoracao #clean-code #production #bugs
**Criado**: 21/04/2026
**Atualizado**: 21/04/2026

---

## Diagnostico: Estado Atual

### Metricas Coletadas

| Componente | Quantidade | Observacoes |
|------------|-----------|-------------|
| Frontend components | 150+ TSX | Espalhados em 30+ pastas |
| Zustand stores | 26 | 3 sao wrappers de re-export |
| Backend routes | 47+ Python | Duplicacao de dominios |
| Alembic migrations | 33 | Head: 0028 |
| Lib utilities | 60+ TS | 部分重复功能 |

---

## Area 1: Componentes Frontend Desorganizados

### Problema Identificado

Componentes estao espalhados em uma estrutura plana sem logica semantica:

```
src/components/
├── aura/           (13 componentes)
├── forge/          (38 componentes)
├── modais/         (19 componentes)
├── tasks/          (12 componentes)
├── ui/             (35 componentes)
├── dossier/        (4 componentes)
├── routes/         (6 componentes)
├── interviews/     (2 componentes)
├── market/         (12 componentes)
└── [arquivos soltos]
```

### Causa Raiz

1. Adicao incremental sem planejamento de estrutura
2. Falta de convencao de nesting padronizada
3. Componentes criados em diferentes sessoes por diferentes agentes

### Solucao Proposta

Manter a estrutura atual MAS adicionar indice de componentes para navegacao rapida. Criar mapa de componentes por dominio funcional.

---

## Area 2: Inconsistencias de Nomenclatura

### Stores com Problemas

| Store | Problema | Status |
|-------|----------|--------|
| `canonicalMarketplaceStore` | Wrapper que re-exporta, confunde | Precisa documentacao |
| `canonicalMarketplaceEconomyStore` | Mesmo pattern | Precisa documentacao |
| `canonicalContentStore` | Mesma situacao | Precisa documentacao |
| `auth` vs `profile` vs `profileIntake` | Duplicacao conceitual | Unificar |
| `useRouteStore` vs `useRouteBuilderStore` | Nomes similares, funcoes diferentes | Ok |

### Variaveis de Ambiente Duplicadas

| Variavel | Onde esta | Problema |
|----------|-----------|----------|
| `NEXT_PUBLIC_API_URL` | .env.local | Nao encontrada em config |
| `NEXT_PUBLIC_CMS_URL` | lib/cms.ts | Fallback para localhost:3001 |
| `NEXT_PUBLIC_STOREFRONT_URL` | lib/storefront-links.ts | Mesmo pattern |
| `NEXT_PUBLIC_ZENITH_API_URL` | canonicalContentStore.ts | Outro servico |

### Solucao Proposta

1. Consolidar todas as URLs em arquivo unico: `lib/api-endpoints.ts`
2. Documentar cada store wrapper
3. Remover `profileIntake` ou migrar sua funcao para `profile`

---

## Area 3: Valores Hardcoded

### Localizados

| Local | Valor | Problema |
|-------|-------|----------|
| `lib/cms.ts:11` | `localhost:3001` | Fallback quebrado |
| `lib/storefront-links.ts:2` | `localhost:3001` | Mesmo |
| `canonicalContentStore.ts:55` | `localhost:3001` | Mesmo |
| `stores/dossier.ts:647` | `20` (baseline score) | Magic number |
| `stores/dossier.ts:649` | `10` (min score) | Magic number |

### Solucao Proposta

1. Consolidar fallbacks em constantes nomeadas
2. Adicionar comentarios explicando valores default
3. Considerar .env com valores de production

---

## Area 4: Sistema de Dossier

### Estado: Implementado + Quebrado

#### Frontend (completo)
- Store `dossier.ts` com 747 linhas
- 4 componentes em pasta `components/dossier/`
- CRUD completo + readiness evaluation
- Document wizard multi-step

#### Backend (parcial)
- Rota `/dossiers` existe mas nao exporta
- `evaluateReadiness` retorna 0 hardcoded no backend
- Falta endpoint para `bindToOpportunity`
- Falta endpoint para milestones

#### I/O (esperando backend)
- PDF export - implementado em `lib/enhanced-export.ts`
- DOCX export - implementado em `lib/docx-export.ts`
- ZIP bundle - implementado
- Integracao com perfil - parcialmente funciona

### Lista de Pendencias

| Componente | Frontend | Backend | Status |
|------------|----------|---------|--------|
| CRUD basico | ✅ | ⚠️ Parcial | Endpoint existe |
| Readiness eval | ✅ | ❌ Retorna 0 | Bug |
| Document link | ✅ | ❌ Falta | Pendente |
| Opportunity binding | ✅ Local | ❌ Falta | Pendente |
| PDF export | ✅ | ⚠️ Stub | Falta engine |
| DOCX export | ✅ | ⚠️ Stub | Falta engine |
| Milestones | ⚠️ Stub | ❌ Falta | Pendente |

### Solucao Proposta

1. Primeiro: arrumar backend `/dossiers/{id}/evaluate`
2. Segundo: adicionar `bindToOpportunity` endpoint
3. Terceiro: integrar com sistema de export ja existente

---

## Area 5: Bugs e Pendencias

### Frontend (6 TODOs)

| Arquivo | Linha | Descricao | Prioridade |
|---------|-------|-----------|------------|
| dossier.ts | 595 | Milestones stub | Baixa |
| dossier.ts | 600 | Milestones stub | Baixa |
| dossier.ts | 604 | Milestones stub | Baixa |
| forge.ts | 601 | Sync readiness_level | Media |
| forge.ts | 622 | Sync opportunity binding | Media |
| forge.ts | 642 | Sync opportunity binding | Media |

### Backend (36 TODOs)

| Categoria | Quantidade | Maiores Problemas |
|-----------|-----------|-------------------|
| Tasks | 3 | Calculo real nao implementado |
| AI Services | 5 | Integração real pendente |
| Economy | 4 | Impostos, shipping |
| Route Builder | 1 | Resume-matcher |
| Credenciais | 3 | Tracking real |
| Analytics | 4 | Calculos reais |

### Bugs Conhecidos em Producao

| Severidade | Local | Problema |
|------------|-------|----------|
| Critico | auth.py | 500 em producao (colunas faltando) |
| Critico | tasks.py:185 | Import de modulo que nao existe |
| Alto | documents.py:300 | Polish nao dispara AI |
| Medio | dossier.ts:633-650 | Evaluate retorna valores fixos |
| Baixo | psych.py:396 | Celery task referencia faltando |

---

## Area 6: Observabilidade

### Infraestrutura Existente

Ja existe sistema de error tracking local:

```
src/lib/
├── observability.ts          (97 linhas)
├── observability-incidents.ts
├── monitoring.ts             (Sentry hooks)
└── stores/observability.ts   (Zustand store)
```

### Problema: Nao Integrado

- Hooks para Sentry existem em `monitoring.ts`
- CSP em `middleware.ts` permite sentry.io
- MAS nenhuma key Sentry configurada
- Erros vao apenas para localStorage (ate 300 itens)

### Solucao Proposta

1. Adicionar Sentry para producao (criar projeto em sentry.io)
2. Configurar `NEXT_PUBLIC_SENTRY_DSN` em .env
3. Ativar em `middleware.ts`
4. Considerar backend tambem (sentry-python)

---

## Area 7: Padroes de Codigo

### Regras ja Existentes

De `Padroes_de_Codigo.md`:

1. TypeScript restrito - prohibited `any`
2. Um arquivo, uma responsabilidade
3. CSS com tokens do design system
4. JSDoc obrigatorio para logica de negocio

### O que Falta

1. **Enforcement**: Como garantir que regras sao seguidas?
2. **Lint mais estrito**: Currently warnings only
3. **Prettier**: Nao configurado
4. **Conventional Commits**: Ja segue, mas nao valida

---

## Plano de Acao: Priorizacao

### Fase 1: Bugs Criticos (IMEDIATO)

1. [ ] Arrumar auth 500 em producao (ver Agent_Knowledge_Handbook)
2. [ ] Arrumar import error em tasks.py:185
3. [ ] Implementar evaluateReadiness no backend

### Fase 2: Dossier Funcional

4. [ ] Adicionar endpoint bindToOpportunity
5. [ ] Conectar PDF/DOCX export ao backend
6. [ ] Testar fluxo completo: criar dossier -> docs -> export

### Fase 3: Observabilidade

7. [ ] Configurar Sentry para frontend
8. [ ] Configurar Sentry para backend
9. [ ] Adicionar health check com status de integracao

### Fase 4: Organizacao

10. [ ] Consolidar URLs em lib/api-endpoints.ts
11. [ ] Documentar stores wrapper (canonical*)
12. [ ] Limpar TODOs de alta prioridade
13. [ ] Criar Runbook de Debugging

---

## Links Relacionados

- [[Agent_Knowledge_Handbook]] - Conhecimento do agente
- [[Verdade_do_Produto]] - Estado real do produto
- [[SPEC_IO_System_v2_5]] - Sistema de Input/Output
- [[Backend_API_Audit_v2_5]] - Auditoria completa da API
- [[Padroes_de_Codigo]] - Convencoes de codigo