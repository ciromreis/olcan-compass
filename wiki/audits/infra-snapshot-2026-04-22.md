# Snapshot de Infraestrutura Olcan — 22/abr/2026

> **Última atualização:** 2026-04-22T18:00:00-03:00  
> **Auditor:** Claude Code (opencode/minimax-m2.5-free)  
> **Status:** Parcial (blockers em sistemas externos)

---

## Resumo Executivo

| Sistema | Status | Notas |
|---------|-------|-------|
| **API Backend (Render)** | ✅ ONLINE | `olcan-compass-api.onrender.com`, health OK, DB conectada |
| **Frontend (Vercel)** | ✅ ONLINE | `compass.olcan.com.br` retorna 200 |
| **Banco PostgreSQL** | ✅ ONLINE | Alembic head: `0028_seed_psychology_questions`, 30 colunasUser |
| **n8n (GCP)** | ✅ ONLINE | `n8n.olcan.com.br` retorna 200 (mas não acessível diretamente) |
| **Mautic** | ❌ OFFLINE | `mautic.olcan.com.br` retorna HTTP 404 |
| **Hostinger VPS** | ⚠️ BLOQUEADO | Sem acesso SSH |
| **DNS (Cloudflare)** | ✅ ONLINE | Migrado em 19/abr/2026 |

---

## 1. Hosting VPS (Hostinger)

**Status:** ❓ Desconhecido — Sem acesso SSH

**Blocker:** Necessário credenciais hPanel ou SSH key para acessar.

**Ação requerida:**
- Fornecer credenciais de acesso SSH
- Ou configurar VPN/tunnel para o VPS

---

## 2. Mautic (CRM Marketing)

**Status:** ❌ Offline

- **HTTP Response:** 404
- **DNS:** `mautic.olcan.com.br` → 104.21.88.114 (Cloudflare)
- **Causa provável:** Container down ou serviço não configurado na VM

**Blocker:** Sem acesso ao servidor onde Mautic deveria rodar.

**Ação requerida:**
- Verificar status do container via SSH na VPS ou GCP
- Rodar `docker ps` para ver status do container mautic

---

## 3. n8n (Automação)

**Status:** ✅ Online (via proxied Cloudflare)

- **URL:** `https://n8n.olcan.com.br`
- **HTTP:** 200
- **GCP VM:** IP 35.238.150.117 (não acessível diretamente)
- **Versão:** Unknown (sem acesso SSH)

**Blocker:** Sem acesso direto à GCP VM.

**Ação requerida:**
- Acessar GCP Console billing 0105D9-45B581-C656D3
- Verificar custos de compute e egress

---

## 4. Olcan Compass App

### Backend (Render)

| Campo | Valor |
|-------|-------|
| Platform | Render (Docker, Free) |
| URL | `olcan-compass-api.onrender.com` |
| Service ID | `srv-d6jjhuea2pns73f73e5g` |
| Health | ✅ `{"status":"ok","db":"connected"}` |
| Uptime | ~19 minutos |
| Plan | Free tier |

### Database (PostgreSQL via Render)

| Campo | Valor |
|-------|-------|
| Instance | `dpg-d7i2qnkvikkc73aj0gm0-a` |
| Alembic Head | `0028_seed_psychology_questions` |
| Users Columns | 30 |
| Psych Questions | 12 |

**Auth fix (21/abr):** ✅ Resolvido — migrations 0027 e 0028 criaram as colunas `username`, `bio`, `preferences` que faltavam.

### Frontend (Vercel)

| Campo | Valor |
|-------|-------|
| URL | `compass.olcan.com.br` |
| Status | ✅ ONLINE |
| Stack | Next.js |

### Document Export (PDF/DOCX)

**Status:** Stub ASCII — Conforme documentação, `_generate_pdf_document` e `_generate_docx_document` ainda retornam placeholders.

### Import Circular (tasks.py)

**Status:** ✅ Resolvido — importlazy usado dentro da função:

```python
# app/api/routes/tasks.py:186
from app.api.v1.companions import _determine_stage
```

### Environment Variables

| Variável | Status |
|----------|--------|
| DATABASE_URL | ✅ presente (postgresql+asyncpg://...) |
| JWT_SECRET_KEY | 🔒 no Render (redacted) |
| ENCRYPTION_KEY | 🔒 no Render (redacted) |
| SMTP_* | Resend configurado |

---

## 5. Website Institucional

| Sistema | Status | Notas |
|---------|-------|-------|
| **www.olcan.com.br** | ✅Online | Aponta para Vercel |
| **site-marketing-v25** | ✅Online | Vercel |
| **Wix** | ❌ Legacy | Substituído em 19/abr |

**Lead Capture:** Status desconhecido — necessária verificação manual.

---

## 6. OpenClaw

**Status:** ❓ Desconhecido

**Blocker:** Repositório ou configuração não encontrada localmente.

---

## 7. Marketing Stack

| Sistema | ID | Status |
|--------|-----|-------|
| Meta Pixel | 941115425475831 | ❓ |
| Meta Ads | 3318714181681728 | ❓ |
| GA4 | G-4GFQZHHBRN (432734295) | ❓ |
| GTM | GT-P8QBFNVN | ❓ |
| AWS SES | — | ❓ |

**Blocker:** Sem acesso a nenhum painel de marketing.

---

## 8. DNS e Email

| Record | Target | Status |
|--------|--------|--------|
| compass.olcan.com.br | Vercel | ✅ Proxied |
| app.olcan.com.br | Vercel | ✅ Proxied |
| www.olcan.com.br | Vercel | ✅ Proxied |
| mautic.olcan.com.br | Cloudflare | ⚠️ 404 |
| n8n.olcan.com.br | Cloudflare | ✅ 200 |

**Cloudflare:** Zone ID `aa51bdbdc0a503f3121f810e46c16c0e`

**Blocker:** Sem acesso API para verificar todos os records.

---

## 9. Segurança

- **Gitleaks:** ❌ Não executado (ferramenta não instalada)
- **Secrets vazados:** ❓ Sem verificação
- **2FA:** ❓ Desconhecido
- **Admin users:** ❓ Desconhecido

---

## 10. Custos

**Blocker:** Sem acesso a billing de nenhuma plataforma.

---

## Perguntas para Freelancers

### Gabriel (Backend/Infra)
1. Tem acesso SSH à VPS Hostinger?
2. Tem acesso ao GCP billing?
3. Prefere trabalhar com milestones de pagamento?
4. Stabilizar Mautic ou OpenClaw como prioridade?
5. Migrar tudo para VPS ou manter distribuídos?

### Lou (App/Site)
1. Tem experiência com FastAPI + async SQLAlchemy?
2. Prefere branch feature ou fork?
3. Já trabalhouno Payload CMS + Next.js?
4. Já fez exports de PDF/DOCX antes?

### Decisões Pendentes (Ciro)
1. Aprovar escopo Gabriel (estimado R$ 3.000+)
2. Data para migration DNS completa
3. Mautic 4.x vs 5.x
4. OpenClaw integrado ou separado?

---

## Evidências Coletadas

- `curl https://olcan-compass-api.onrender.com/api/health` → `{"status":"ok","db":"connected"}`
- `curl https://olcan-compass-api.onrender.com/api/db-diagnostic?secret_key=...` → Schema completo
- `dig +short mautic.olcan.com.br` → 104.21.88.114
- `dig +short n8n.olcan.com.br` → 104.21.88.114
- `curl -I https://n8n.olcan.com.br` → HTTP 200
- `curl -I https://compass.olcan.com.br` → HTTP 200

---

## Blockers para Auditoria Completa

| Sistema | Blocker |
|---------|---------|
| Hostinger VPS | Sem SSH |
| GCP VM n8n | Sem SSH |
| Mautic | Container offline |
| Meta Business | Sem acesso |
| GA4/Google Ads | Sem acesso |
| AWS SES | Sem acesso |
| Stripe | Sem acesso |
| Cloudflare API | Sem token |
| Render billing | Sem acesso |

---

*Este documento deve ser atualizado quando os accessos blockeados forem fornecidos.*