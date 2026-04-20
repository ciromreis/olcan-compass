---
title: Runbook de Deployment
type: drawer
layer: 8
status: superseded
last_seen: 2026-04-20
backlinks:
  - Padroes_de_Codigo
  - Guia_de_Desenvolvimento
---

> **⚠️ ATENÇÃO — DOCUMENTO DESATUALIZADO**
> Este runbook tem informações parcialmente incorretas (referências ao Railway, endpoint de health errado).
> A fonte de verdade operacional está em **`wiki/05_Infraestrutura/`**:
> - Deploy da API → [[../05_Infraestrutura/DEPLOYMENT_RENDER.md]]
> - Estado do CI/CD → [[../05_Infraestrutura/CI_CD_Estado_Atual.md]]
> - Mapa geral → [[../05_Infraestrutura/INFRAESTRUTURA_OVERVIEW.md]]
>
> Este arquivo é mantido apenas para referência de scripts locais e checklist geral de processo.

# Operações: Runbook de Deployment e Staging

**Resumo**: Guia mestre de procedimentos de deploy, configuração de ambientes e garantia de qualidade para o ecossistema Olcan Compass.
**Importância**: Crítica (Continuidade de Serviço)
**Status**: Ativo
**Camada (Layer)**: Infraestrutura / Operações
**Tags**: #deploy #vercel #render #railway #staging #producao #cicd
**Criado**: 15/04/2026
**Atualizado**: 17/04/2026

---

## Quick Start (tl;dr)

```bash
# Development
./2_Pipelines/scripts/START_APPLICATION.sh

# Quick Build
./2_Pipelines/scripts/QUICK_DEPLOY.sh
```

---

## 🌍 Matriz de Ambientes

| Ambiente | App URL | API URL | Finalidade |
| :--- | :--- | :--- | :--- |
| **Desenvolvimento** | `localhost:3000` | `localhost:8000` | Desenvolvimento local e iteração rápida. |
| **Staging** | `staging-compass.olcan.com.br` | `staging-api.olcan.com.br` | Testes pré-produção (Regra de 24h). |
| **Produção** | `compass.olcan.com.br` | `api.olcan.com.br` | Versão estável para usuários finais. |

---

## 🚀 Deployment Scripts

| Script | Uso | Descrição |
|--------|-----|------------|
| `2_Pipelines/scripts/START_APPLICATION.sh` | Full start | Inicia todos os serviços (DB + API + App) |
| `2_Pipelines/scripts/QUICK_DEPLOY.sh` | Quick build | Build sem dependências reinstaladas |
| `docker-compose up` | Local DB | PostgreSQL + Redis local |

---

## 📋 Checklist Pré-Deployment

### Requisitos Obrigatórios:
- [ ] Testes automatizados passando (`pytest`, `npm test`).
- [ ] Sentry sem erros críticos pendentes.
- [ ] Migrações de banco testadas em Staging.
- [ ] Backup de produção realizado (em caso de mudanças de schema).
- [ ] Notificação no canal de engenharia do Nexus.

### Type Check Obrigatório:
```bash
cd apps/app-compass-v2.5 && npm run type-check
cd apps/api-core-v2.5 && npm run type-check
```
**Build falha se houver erros de tipo.**

---

## 🚀 Fluxo de Deploy: Backend (API)

A API reside no **Render** (Docker Web Service) e utiliza deploy contínuo via branch `main`. Railway não está em uso.

1.  **Push para Main**:
    ```bash
    git checkout main && git pull origin main
    git merge feature/nova-funcionalidade
    git push origin main
    ```
2.  **Monitoramento**: Acompanhe os logs no painel do Render (olcan-compass-api).
3.  **Verificação de Saúde**:
    ```bash
    curl https://olcan-compass-api.onrender.com/api/health
    # Esperado: {"status": "ok"}
    # ATENÇÃO: O endpoint é /api/health, não /health
    ```

---

## 🎨 Fluxo de Deploy: Frontend (Vercel)

As aplicações React/Next.js são hospedadas na Vercel.

### Correções de Build (Importante):
Para evitar erro de "Double Path" em ambiente monorepo, certifique-se de que o **Root Directory** na Vercel está apontando para:
- `apps/site-marketing-v2.5` ou `apps/app-compass-v2.5`.

### Variáveis de Ambiente:
Garanta que `NEXT_PUBLIC_API_URL` aponta para o ambiente correto (Staging vs Produção).

---

## 📦 Environment Variables

### App (app-compass-v2.5)
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection |
| `NEXTAUTH_SECRET` | ✅ | Auth.js secret |
| `NEXTAUTH_URL` | ✅ | Production URL |
| `STRIPE_SECRET_KEY` | ✅ | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe webhook |
| `NEXT_PUBLIC_API_URL` | ✅ | API base URL |
| `OPENAI_API_KEY` | ✅ | OpenAI for AI features |

### API (api-core-v2.5)
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection |
| `SECRET_KEY` | ✅ | JWT secret |
| `STRIPE_SECRET_KEY` | ✅ | Stripe API key |

### Local Development
```bash
cp apps/app-compass-v2.5/.env.example apps/app-compass-v2.5/.env.local
# Edit .env.local with your values
```

---

## 🛡️ Protocolo de Staging (Regra de 24 Horas)
Nenhuma feature de alta criticidade (ex: alteração em Entitlements ou Aura Evolution) deve ir para produção sem permanecer **24 horas em Staging** sendo testada por usuários Alpha ou Agentes de QA automatizados.

---

## 🔄 Database Migrations
```bash
# Run pending migrations
docker compose run --rm api alembic upgrade head

# Check migration status
docker compose run --rm api alembic current
```

**Ver**: [[wiki/02_Arquitetura_Compass/Guia_de_Operacoes_Database]]

---

## 🔗 Referências Relacionadas
- [[Guia_de_Operacoes_Database]] ← Database ops
- [[Padroes_de_Codigo]] ← Code standards
- [[Checklist_Seguranca_Compass]] ← Security checklist
