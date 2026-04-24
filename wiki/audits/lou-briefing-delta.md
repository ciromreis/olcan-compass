# Briefing Lou — Delta vs SSOT Atual

> **Data:** 22/abr/2026  
> **Escopo:** App Olcan-Compass v2.5 + Site Marketing  
> **Status:** 🟢 Sistemas principais online

---

## O que Mudou (vs SSOT 2026-04-15)

### Alterações Confirmadas

| Sistema | Mudança | Evidence |
|---------|---------|----------|
| **API Auth** | CORRIGIDO | migrations 0027+0028 — colunas `username`, `bio`, `preferences` criadas |
| **Alembic head** | 0028 | 12 psychOIOS questions seeded |
| **Frontend** | continua no ar | `compass.olcan.com.br` → 200 |
| **Document export** | STUB ASCII | conforme docs, PDFs ainda retornam placeholders |
| **Import circular** | RESOLVIDO | `from app.api.v1.companions` importlazy em tasks.py:186 |

### Novas Informações

1. **Auth funcionando:** API `/api/auth/register` deve funcionar agora (migration была aplicada)
2. **Database health:** 30 colunas na tabela users, 12 OIOS perguntas
3. **API routes:** 47 arquivos Python em routes/v1

---

## Estado dos Sistemas (Conforme Auditoria)

### Frontend (Vercel)
- **URL:** `compass.olcan.com.br`
- **Status:** ✅ ONLINE
- **Stack:** Next.js 14
- **Evidence:** `curl https://compass.olcan.com.br` → HTML completo

### Backend (Render)
- **URL:** `olcan-compass-api.onrender.com`
- **Service ID:** `srv-d6jjhuea2pns73f73e5g`
- **Plan:** Free tier
- **Status:** ✅ ONLINE
- **Health:** `{"status":"ok","db":"connected"}`
- **Uptime:** ~19 minutos

### Database (Neon/Render)
- **Instance:** `dpg-d7i2qnkvikkc73aj0gm0-a`
- **Alembic:** `0028_seed_psychology_questions`
- **Users columns:** 30

### Website v2.5
- **URL:** `site-marketing-v25.vercel.app`
- **Status:** ✅ ATIVO
- **Stack:** Next.js + Payload CMS
- **Lead capture:** Status desconhecido (necessita teste)

---

## Bugs Conhecidos (do SSOT + auditoria)

### 🔴 Críticos
| Bug | Status | Location |
|-------|---------|----------|
| Document export PDF/DOCX | Stub ASCII — não gera arquivo real |
| Document export DOCX | Stub ASCII — idem |

### 🟡 Ações Pendentes
| Item | Notas |
|------|-------|
| Stripe integration | Webhook precisa setup (modo unknown) |
| Metrics/analytics | Sem acesso GA4 |

---

## Código Relevante

### tasks.py:186 (import circular)
```python
# ✅ RESOLVIDO — importlazy dentro da função
from app.api.v1.companions import _determine_stage
```

### db-diagnostic response
```json
{
  "users_columns": [
    "id", "email", "hashed_password", "is_active", "is_verified", "role",
    "full_name", "avatar_url", "language", "timezone", "username", "bio", "preferences", ...
  ],
  "alembic_version": ["0028_seed_psychology_questions"],
  "psych_questions_count": 12
}
```

---

## Variáveis de Ambiente (Production)

| Variável | Valor |
|----------|-------|
| DATABASE_URL | `postgresql+asyncpg://...` |
| JWT_SECRET_KEY | 🔒 (Render env) |
| ENCRYPTION_KEY | 🔒 (Render env) |
| SMTP_HOST | `smtp.resend.com` |
| SMTP_PORT | `465` |
| SMTP_USERNAME | `resend` |
| EMAIL_FROM | `noreply@olcan.com.br` |
| ENV | `production` |

---

## Perguntas Críticas para Lou

### Experiência
1. **Tens experiência com FastAPI + async SQLAlchemy?**
2. **Tens experiência com Payload CMS?**
3. **Tens experiência com exports PDF/DOCX em Python?**

### Workflow
4. **Preferes trabalhar com branch `feature/*` ou fork?**
5. **Prefers code review ou PRs?**
6. ** Tens acesso ao repo GitHub? (ciromreis/olcan-compass)**

### Escopo v2.5
7. **Quer focar no fix de bugs ou features novas?**
8. **Conforto com state management (Zustand)?**
9. **Experiência com testing (Playwright/Pytest)?**

---

## Tarefas Potenciais (baseadas no SSOT)

### Bug Fixes
1. 🔴 **Corrigir document export** — PDF/DOCX gerando stubs
2. 🟡 **Stripe webhooks** — setup completo
3. 🟡 **Melhorar error handling**

### Features
4. 🟡 **NovasOIOS questions**
5. 🟢 **Analytics dashboard**
6. 🟢 **Lead capture verification**

### Tech Debt
7. 🟢 **TypeScript strict mode**
8. 🟢 **Test coverage**

---

## Repo Structure para Referência

```
olcan-compass/
├── apps/
│   ├── app-compass-v2.5/     # Frontend Next.js
│   ├── api-core-v2.5/       # Backend FastAPI
│   └── site-marketing-v2.5/  # Website
├── packages/
│   ├── ui-components/      # Design system
│   └── shared-auth/       # Auth
├── wiki/
│   ├── 00_SOVEREIGN/     # Source of truth
│   └── 02_Arquitetura_Compass/  # Tech docs
└── CLAUDE.md            # Project guide
```

---

## Próximos Passos

1. **Lou confirma experiência + disponibilidade**
2. **Definir escopo inicial (bugs vs features)**
3. **Kickoff call com Ciro**

---

*Atualizar este documento após kickoff call.*