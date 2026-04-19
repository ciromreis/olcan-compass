# Email Runbook — Resend

**Last updated:** 2026-04-19  
**Provider:** Resend  
**Status:** ⚠️ DNS adicionado — aguardando verificação de domínio no Resend

---

## Configuração SMTP

| Campo | Valor |
|-------|-------|
| Provider | Resend |
| Host | `smtp.resend.com` |
| Port | `465` |
| SSL | `true` |
| TLS (STARTTLS) | `false` |
| Username | `resend` |
| Password | API Key do Resend (ver env var `SMTP_PASSWORD`) |
| From | `noreply@olcan.com.br` |
| Região AWS SES | `sa-east-1` (São Paulo) |

---

## Environment Variables no Render

```
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USERNAME=resend
SMTP_PASSWORD=<resend_api_key>
SMTP_USE_SSL=true
SMTP_USE_TLS=false
EMAIL_FROM=noreply@olcan.com.br
```

---

## DNS Records Necessários

Todos os records abaixo foram adicionados ao Cloudflare em 2026-04-19 para o domínio `olcan.com.br`:

| Tipo | Nome | Valor |
|------|------|-------|
| TXT | `resend._domainkey.olcan.com.br` | Chave DKIM fornecida pelo Resend |
| MX | `send.olcan.com.br` | `feedback-smtp.sa-east-1.amazonses.com` (priority 10) |
| TXT | `send.olcan.com.br` | `v=spf1 include:amazonses.com ~all` |

---

## Status de Verificação

**Problema encontrado:** Após mover o DNS do Wix para Cloudflare, o Resend continuou detectando o domínio como "Wix" em cache — mostrando instruções antigas de DNS do Wix em vez de checar o Cloudflare.

**Solução:**
1. No painel do Resend → Domains → excluir o domínio `olcan.com.br`
2. Re-adicionar o domínio `olcan.com.br`
3. O Resend vai re-detectar os nameservers e mostrar os records corretos para Cloudflare
4. Os records já foram adicionados na Cloudflare — a verificação deve passar

---

## Como Atualizar SMTP via Render API

> **ATENÇÃO:** O endpoint PUT `/envVars` **substitui TODAS** as env vars. Sempre busque as vars atuais primeiro.

```bash
export RENDER_API_KEY="<seu_render_api_key>"
SERVICE_ID="srv-d6jjhuea2pns73f73e5g"

# 1. Buscar vars atuais
curl -s "https://api.render.com/v1/services/$SERVICE_ID/envVars" \
  -H "Authorization: Bearer $RENDER_API_KEY" | jq '.'

# 2. Atualizar — incluir TODAS as vars existentes + as novas/modificadas
curl -X PUT "https://api.render.com/v1/services/$SERVICE_ID/envVars" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {"key": "SMTP_HOST", "value": "smtp.resend.com"},
    {"key": "SMTP_PORT", "value": "465"},
    {"key": "SMTP_USERNAME", "value": "resend"},
    {"key": "SMTP_PASSWORD", "value": "<nova_api_key>"},
    {"key": "SMTP_USE_SSL", "value": "true"},
    {"key": "SMTP_USE_TLS", "value": "false"},
    {"key": "EMAIL_FROM", "value": "noreply@olcan.com.br"}
  ]'
```

---

## Teste de Email

Após verificação do domínio no Resend, testar via fluxo de recuperação de senha:

```bash
curl -X POST https://olcan-compass-api.onrender.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "seu-email@teste.com"}'
```

---

## Links Relacionados

- [[DNS_CLOUDFLARE.md]] — Records DNS do Resend estão documentados lá
- [[DEPLOYMENT_RENDER.md]] — Env vars na plataforma Render
- [[RENDER_CLI.md]] — Como manipular env vars via CLI/API
- [[INFRAESTRUTURA_OVERVIEW.md]] — Mapa geral de infraestrutura
