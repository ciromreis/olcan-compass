# Infraestrutura Olcan — Mapa Geral

**Last updated:** 2026-04-19  
**Versão:** v2.5 (produção ativa)

---

## Diagrama de Alto Nível

```
                    olcan.com.br
                         │
                   [Cloudflare DNS]
                  (migrado 2026-04-19)
                    /     |      \
                   /      |       \
          compass.   app.    www.        n8n.
          olcan.    olcan.  olcan.br    olcan.
          com.br    com.br              com.br
             │        │       │            │
          [Vercel]  [Vercel] [Vercel]   [GCP VM]
              └──────────┘              35.238.150.117
         olcan-compass-web.vercel.app
```

---

## Componentes de Infraestrutura

### 1. API Backend

| Campo | Valor |
|-------|-------|
| Plataforma | Render (Docker Web Service) |
| URL | `https://olcan-compass-api.onrender.com` |
| Service ID | `srv-d6jjhuea2pns73f73e5g` |
| Plano | Free |
| Runtime | Python 3.11 / FastAPI / Uvicorn |
| Deploy | Automático via GitHub push |

### 2. Banco de Dados

| Campo | Valor |
|-------|-------|
| Plataforma | Render PostgreSQL |
| Instance ID | `dpg-d7i2qnkvikkc73aj0gm0-a` |
| Migrations | Alembic — `0025_enhanced_forge` (head) |
| Driver | `asyncpg` (conexão async) |

> **Gotcha:** A DATABASE_URL deve ter o prefixo `postgresql+asyncpg://` — não o padrão `postgresql://` que o Render fornece.

### 3. Frontend — App Compass

| Campo | Valor |
|-------|-------|
| Plataforma | Vercel |
| URL pública | `olcan-compass-web.vercel.app` |
| Domínio custom | `compass.olcan.com.br`, `app.olcan.com.br` |
| Framework | Next.js |

### 4. Email Transacional

| Campo | Valor |
|-------|-------|
| Provider | Resend |
| SMTP Host | `smtp.resend.com:465` |
| Domínio de envio | `olcan.com.br` |
| FROM | `noreply@olcan.com.br` |
| Região AWS | `sa-east-1` (São Paulo) |
| Status | ⚠️ DNS configurado, verificação pendente no Resend |

### 5. DNS

| Campo | Valor |
|-------|-------|
| Provider | Cloudflare |
| Zone ID | `aa51bdbdc0a503f3121f810e46c16c0e` |
| Nameservers | `laylah.ns.cloudflare.com`, `viddy.ns.cloudflare.com` |
| Migrado em | 2026-04-19 (antes: Wix) |

### 6. Registrar de Domínio

| Campo | Valor |
|-------|-------|
| Domínio | `olcan.com.br` |
| Registrar | GoDaddy |

### 7. CRM

| Campo | Valor |
|-------|-------|
| Plataforma | Mautic |
| URL | `mautic.olcan.com.br` |
| Status | Feature flags **desabilitadas** em produção |

### 8. Automação / N8N

| Campo | Valor |
|-------|-------|
| Plataforma | N8N self-hosted |
| URL | `n8n.olcan.com.br` |
| IP | `35.238.150.117` (GCP) |

### 9. AI / Simulation

| Campo | Valor |
|-------|-------|
| Status | **Simulation mode** — sem chamadas reais a providers de AI em produção |
| Providers futuros | OpenAI / Anthropic (não ativo ainda) |

---

## Variáveis de Ambiente Críticas em Produção

Ver detalhes em [[DEPLOYMENT_RENDER.md]].

Resumo das mais críticas:
- `DATABASE_URL` — deve ter `+asyncpg` no prefixo
- `JWT_SECRET_KEY` — não vazar; revogar todos os tokens ao trocar
- `ENCRYPTION_KEY` — Fernet key; dados criptografados quebram se trocar
- `SMTP_PASSWORD` — API key do Resend

---

## Fluxo de Deploy

```
1. Push para main no GitHub
        ↓
2. Render detecta mudança (webhook)
        ↓
3. Render faz docker build (apps/api-core-v2.5/Dockerfile)
        ↓
4. Se build OK → deploy automático
        ↓
5. Alembic roda migrations no startup
        ↓
6. API disponível em olcan-compass-api.onrender.com
```

Para deploy manual: ver [[RENDER_CLI.md]].

---

## Runbooks por Tópico

| Tópico | Documento |
|--------|-----------|
| Deploy completo da API | [[DEPLOYMENT_RENDER.md]] |
| DNS e subdomínios | [[DNS_CLOUDFLARE.md]] |
| Email transacional | [[EMAIL_RESEND.md]] |
| CLI e API do Render | [[RENDER_CLI.md]] |
| Arquitetura do sistema | [[../../02_Arquitetura_Compass/Arquitetura_v2_5_Compass.md]] |
| Migrações Alembic | [[../../02_Arquitetura_Compass/Guia_de_Migracao_e_DB_Alembic.md]] |
