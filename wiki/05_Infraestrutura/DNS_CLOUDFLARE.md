# DNS Runbook — Cloudflare

**Last updated:** 2026-04-19  
**Evento:** Migração de DNS do Wix para Cloudflare  
**Status:** ✅ DNS propagado e funcionando

---

## Resumo

| Campo | Valor |
|-------|-------|
| Domínio | `olcan.com.br` |
| Registrar | GoDaddy |
| DNS Provider | Cloudflare |
| Cloudflare Zone ID | `aa51bdbdc0a503f3121f810e46c16c0e` |
| Nameservers ativos | `laylah.ns.cloudflare.com`, `viddy.ns.cloudflare.com` |

Os nameservers foram atualizados no GoDaddy apontando para a Cloudflare em 2026-04-19.

---

## Tabela de Records DNS Ativos

| Tipo | Nome | Valor | Prioridade | Observação |
|------|------|-------|-----------|------------|
| A | `olcan.com.br` | `76.76.21.21` | — | Vercel (raiz) |
| MX | `olcan.com.br` | `mx1.hostinger.com.br` | `5` | Email principal (Hostinger) |
| CNAME | `www` | `cname.vercel-dns.com` | — | Site marketing |
| CNAME | `compass` | `cname.vercel-dns.com` | — | App Compass |
| CNAME | `app` | `cname.vercel-dns.com` | — | App alias |
| A | `n8n` | `35.238.150.117` | — | N8N (GCP) |
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3D...` | — | DKIM Resend |
| MX | `send` | `feedback-smtp.sa-east-1.amazonses.com` | `10` | Bounce/feedback Resend |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | — | SPF para envio Resend |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine` | — | Política DMARC |
| CNAME | `brevo1._domainkey` | *(Brevo DKIM value)* | — | DKIM Brevo |
| CNAME | `brevo2._domainkey` | *(Brevo DKIM value)* | — | DKIM Brevo |

> **Nota sobre `n8n`:** Tecnicamente é um record `A` (IP), não CNAME, embora o subdomínio aponte para uma VM GCP.

---

## Como Adicionar Records via API Cloudflare

```bash
export CF_TOKEN="<seu_cloudflare_api_token>"
export ZONE_ID="aa51bdbdc0a503f3121f810e46c16c0e"

# Exemplo: adicionar CNAME
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CNAME",
    "name": "novo-subdominio.olcan.com.br",
    "content": "cname.vercel-dns.com",
    "ttl": 3600,
    "proxied": false
  }'

# Exemplo: adicionar TXT
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "TXT",
    "name": "subdominio.olcan.com.br",
    "content": "v=spf1 include:example.com ~all",
    "ttl": 3600
  }'

# Listar todos os records da zona
curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?per_page=100" \
  -H "Authorization: Bearer $CF_TOKEN" | jq '.result[] | {type,name,content}'
```

---

## Lição Aprendida: Migração Wix → Cloudflare

**Problema:** Ao migrar DNS de Wix para Cloudflare, o Cloudflare importa automaticamente apenas os records mais comuns. Subdomínios personalizados (como `compass`, `app`, `n8n`, `send`, `brevo1._domainkey`, etc.) **NÃO são importados**.

**Consequência:** Serviços como o app Compass, N8N e configurações de email ficaram quebrados após a migração até serem re-adicionados manualmente.

**Regra pós-migração:**
1. Após mudar os nameservers, listar TODOS os records que existiam no provedor anterior
2. Verificar cada subdomínio crítico manualmente (ping, curl, dig)
3. Re-adicionar via API ou UI da Cloudflare qualquer record que não foi importado

```bash
# Verificar resolução de subdomínio
dig compass.olcan.com.br
dig app.olcan.com.br
dig n8n.olcan.com.br
```

---

## Links Relacionados

- [[DEPLOYMENT_RENDER.md]] — Deploy da API
- [[EMAIL_RESEND.md]] — DNS de email (DKIM, SPF, MX para send.olcan.com.br)
- [[INFRAESTRUTURA_OVERVIEW.md]] — Mapa geral de infraestrutura
