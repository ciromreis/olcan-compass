# Deployment Runbook — Render API Service

**Last updated:** 2026-04-21  
**Service:** `olcan-compass-api` (Render Docker Web Service)  
**Status:** ✅ Live em produção

---

## Visão Geral da Arquitetura

```
GitHub (monorepo)
    └── apps/api-core-v2.5/
            └── Dockerfile
                    ↓  (Render build + deploy)
        Render Web Service (Docker)
            URL: https://olcan-compass-api.onrender.com
            ↓
        Render PostgreSQL
            Host interno: dpg-d7i2qnkvikkc73aj0gm0-a
```

- **Plano:** Free (Render)
- **Região:** Oregon (padrão Render)
- **Runtime:** Docker (Python 3.11 / FastAPI / Uvicorn)
- **Build:** Render faz o build automático via `Dockerfile` em `apps/api-core-v2.5/`

---

## Render Service Details

| Campo | Valor |
|-------|-------|
| Service ID | `srv-d6jjhuea2pns73f73e5g` |
| Service Name | `olcan-compass-api` |
| URL | `https://olcan-compass-api.onrender.com` |
| Region | Oregon |
| Plan | Free |
| Build context | `apps/api-core-v2.5/` |
| Dockerfile | `apps/api-core-v2.5/Dockerfile` |

### Database PostgreSQL

| Campo | Valor |
|-------|-------|
| DB Instance ID | `dpg-d7i2qnkvikkc73aj0gm0-a` |
| Internal hostname | `dpg-d7i2qnkvikkc73aj0gm0-a` |
| Alembic status | `head` — migration `0026_add_users_username` |

---

## Environment Variables

> **ATENÇÃO:** O comando `PUT /envVars` no Render **substitui TODAS** as variáveis.
> Sempre busque as vars atuais antes de fazer um PUT para não perder configurações.

### Variáveis obrigatórias em produção

| Variável | Descrição | Secreto? |
|----------|-----------|----------|
| `DATABASE_URL` | PostgreSQL com driver `+asyncpg` (ver gotcha abaixo) | ✅ Sim |
| `JWT_SECRET_KEY` | Chave para assinar tokens JWT | ✅ Sim |
| `ENCRYPTION_KEY` | Chave Fernet para dados sensíveis | ✅ Sim |
| `SMTP_HOST` | `smtp.resend.com` | Não |
| `SMTP_PORT` | `465` | Não |
| `SMTP_USERNAME` | `resend` | Não |
| `SMTP_PASSWORD` | API key do Resend | ✅ Sim |
| `SMTP_USE_SSL` | `true` | Não |
| `SMTP_USE_TLS` | `false` | Não |
| `EMAIL_FROM` | `noreply@olcan.com.br` | Não |
| `ENV` | `production` | Não |
| `PYTHONPATH` | `/app` | Não |

### DATABASE_URL Gotcha — `+asyncpg` obrigatório

A URL do banco fornecida pelo Render usa o prefixo `postgresql://`.
O SQLAlchemy com asyncio **exige** `postgresql+asyncpg://`.

```
# ❌ Errado (Render entrega assim)
postgresql://user:pass@host/db

# ✅ Correto (o que deve estar no env var)
postgresql+asyncpg://user:pass@host/db
```

Se esquecer o `+asyncpg`, a API sobe mas todas as queries falham silenciosamente.

---

## Docker Bugs Corrigidos (2026-04-19)

### Bug 1 — PYTHONPATH ausente (Alembic não achava as migrations)

**Sintoma:** `alembic upgrade head` falhava com `ModuleNotFoundError` dentro do container.  
**Causa:** O Python dentro do container não encontrava o pacote `app` porque o PYTHONPATH não incluía `/app`.  
**Fix:** Adicionado ao `Dockerfile`:

```dockerfile
ENV PYTHONPATH=/app
```

### Bug 2 — `IndexError` em `commerce_bridge.py` (`parents[4]` → `parents[2]`)

**Sintoma:** A API iniciava mas a rota de commerce crashava com `IndexError: list index out of range`.  
**Causa:** Em desenvolvimento local, o path absoluto tinha mais segmentos. Em Docker (com build context em `apps/api-core-v2.5/`), havia menos níveis de diretório.  
**Fix:** Em `app/services/commerce_bridge.py`:

```python
# ❌ Antes (funcionava apenas local)
parents[4]

# ✅ Depois (funciona em Docker)
parents[2]
```

### Bug 3 — Arquivo `data/commerce/olcan-products.json` ausente no container

**Sintoma:** A API não encontrava o catálogo de produtos em runtime.  
**Causa:** O arquivo `data/` não estava sendo copiado para a imagem Docker.  
**Fix:** Adicionado ao `Dockerfile`:

```dockerfile
COPY data ./data
```

Também foi criado o `.dockerignore` para excluir `__pycache__`, `*.pyc`, `venv/`, `.env`, `.db`, etc.

---

## Deploy via Render API

### Trigger manual de deploy (via API REST)

```bash
curl -X POST \
  "https://api.render.com/v1/services/srv-d6jjhuea2pns73f73e5g/deploys" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache": false}'
```

### Verificar status do deploy

```bash
curl -s \
  "https://api.render.com/v1/services/srv-d6jjhuea2pns73f73e5g/deploys?limit=1" \
  -H "Authorization: Bearer $RENDER_API_KEY" | jq '.[0].deploy.status'
```

Valores possíveis: `build_in_progress`, `live`, `deactivated`, `build_failed`.

---

## Logs via Render CLI

```bash
# Instalar CLI (macOS)
brew install render

# Autenticar
render login

# Set workspace
render workspace set tea-d6irenrh46gs73ab6jsg

# Ver logs ao vivo
render logs -r srv-d6jjhuea2pns73f73e5g --limit 100 --output text
```

---

## Stealth Endpoints (Render Free-Tier Hack)

O Render free-tier não oferece acesso ao shell do container. Estes endpoints permitem rodar operações administrativas remotamente:

```bash
# Forçar migrations (sem redeploy)
curl "https://olcan-compass-api.onrender.com/api/migrate-db-render?secret_key=olcan2026omega"

# Rodar seed scripts
curl "https://olcan-compass-api.onrender.com/api/seed-db-render?secret_key=olcan2026omega"
```

> **Implementação**: `app/api/routes/health.py:48-116`
> **Segurança**: Protegido por secret key hardcoded. Em produção final, mover para env var.

---

## Checklist de Deploy Saudável

1. `GET /api/health` retorna `{"status": "ok"}`
2. Alembic em `head` — verificar via logs de startup (`Applied 0 migrations`) ou via `/api/migrate-db-render`
3. Auth funcional — testar `POST /api/auth/register` com email de teste
4. SMTP configurado — testar via fluxo de registro com email real
5. `DATABASE_URL` tem `+asyncpg` — checar env vars no Render dashboard

### ⚠️ BLOCKER CONHECIDO (2026-04-21)

`POST /api/auth/register` retorna 500. A migration `0026_add_users_username` foi deployada mas pode não ter executado. Ver [[../../00_SOVEREIGN/Agent_Knowledge_Handbook.md]] para passos de debug.

---

## Links Relacionados

- [[DNS_CLOUDFLARE.md]] — DNS e subdomínios
- [[EMAIL_RESEND.md]] — Configuração de email transacional
- [[RENDER_CLI.md]] — Referência completa de CLI e API do Render
- [[INFRAESTRUTURA_OVERVIEW.md]] — Mapa geral de infraestrutura
- [[../../02_Arquitetura_Compass/Arquitetura_v2_5_Compass.md]] — Arquitetura do sistema
