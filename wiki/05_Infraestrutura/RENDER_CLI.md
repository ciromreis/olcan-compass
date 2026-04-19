# Render CLI & API — Quick Reference

**Last updated:** 2026-04-19

---

## Service IDs de Referência

| Serviço | ID | URL |
|---------|----|----|
| API Core v2.5 | `srv-d6jjhuea2pns73f73e5g` | `https://olcan-compass-api.onrender.com` |
| Workspace | `tea-d6irenrh46gs73ab6jsg` | — |

---

## Render CLI (instalação e uso)

```bash
# Instalar (macOS)
brew install render

# Autenticar
render login

# Definir workspace ativo
render workspace set tea-d6irenrh46gs73ab6jsg

# Ver logs ao vivo (últimas 100 linhas, formato texto)
render logs -r srv-d6jjhuea2pns73f73e5g --limit 100 --output text

# Ver logs em JSON
render logs -r srv-d6jjhuea2pns73f73e5g --limit 50 --output json
```

---

## Render API REST

### Autenticação

Todas as chamadas precisam do header:
```
Authorization: Bearer $RENDER_API_KEY
```

Gere o token em: https://dashboard.render.com/u/settings → API Keys

```bash
export RENDER_API_KEY="rnd_xxxxxxxxxxxx"
export SERVICE_ID="srv-d6jjhuea2pns73f73e5g"
```

### Trigger deploy manual

```bash
curl -X POST \
  "https://api.render.com/v1/services/$SERVICE_ID/deploys" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache": false}'
```

Use `"clearCache": true` se suspeitar de problema com dependências em cache.

### Verificar status do deploy mais recente

```bash
curl -s \
  "https://api.render.com/v1/services/$SERVICE_ID/deploys?limit=1" \
  -H "Authorization: Bearer $RENDER_API_KEY" | jq '.[0].deploy | {status, createdAt, finishedAt}'
```

Valores de status: `build_in_progress`, `update_in_progress`, `live`, `deactivated`, `build_failed`, `pre_deploy_failed`.

### Listar env vars atuais

```bash
curl -s \
  "https://api.render.com/v1/services/$SERVICE_ID/envVars" \
  -H "Authorization: Bearer $RENDER_API_KEY" | jq '.[] | {key: .envVar.key, value: .envVar.value}'
```

### Atualizar env vars (PUT — substitui TODAS)

> **ATENÇÃO CRÍTICA:** Este endpoint **substitui todas as variáveis**. Se você enviar apenas 1 variável, as outras serão deletadas. **Sempre busque as atuais primeiro** e inclua todas no payload.

```bash
# Exemplo: atualizar SMTP_PASSWORD sem perder as outras vars
# Passo 1: exportar vars atuais
CURRENT_VARS=$(curl -s \
  "https://api.render.com/v1/services/$SERVICE_ID/envVars" \
  -H "Authorization: Bearer $RENDER_API_KEY")

# Passo 2: editar e fazer PUT com todas as vars
curl -X PUT \
  "https://api.render.com/v1/services/$SERVICE_ID/envVars" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {"key": "DATABASE_URL", "value": "postgresql+asyncpg://..."},
    {"key": "JWT_SECRET_KEY", "value": "..."},
    {"key": "ENCRYPTION_KEY", "value": "..."},
    {"key": "SMTP_HOST", "value": "smtp.resend.com"},
    {"key": "SMTP_PORT", "value": "465"},
    {"key": "SMTP_USERNAME", "value": "resend"},
    {"key": "SMTP_PASSWORD", "value": "re_xxxx"},
    {"key": "SMTP_USE_SSL", "value": "true"},
    {"key": "SMTP_USE_TLS", "value": "false"},
    {"key": "EMAIL_FROM", "value": "noreply@olcan.com.br"},
    {"key": "ENV", "value": "production"},
    {"key": "PYTHONPATH", "value": "/app"}
  ]'
```

### Listar todos os serviços do workspace

```bash
curl -s \
  "https://api.render.com/v1/services?limit=20" \
  -H "Authorization: Bearer $RENDER_API_KEY" | jq '.[] | {name: .service.name, id: .service.id, status: .service.suspended}'
```

---

## Verificação de Saúde

```bash
# Health check da API em produção
curl https://olcan-compass-api.onrender.com/api/health

# Docs da API
open https://olcan-compass-api.onrender.com/docs
```

---

## Links Relacionados

- [[DEPLOYMENT_RENDER.md]] — Runbook completo de deployment
- [[EMAIL_RESEND.md]] — Como atualizar vars de email
- [[INFRAESTRUTURA_OVERVIEW.md]] — Mapa geral de infraestrutura
