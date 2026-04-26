---
title: Implementação — Centralização de URLs de Serviço
type: drawer
layer: 2
status: active
last_seen: 2026-04-26
backlinks:
  - Padroes_de_Codigo
  - Arquitetura_Sistemas_Olcan
---

# Implementação: Centralização de URLs de Serviço

**Resumo**: Plano de execução para eliminar URLs hardcoded e variáveis de ambiente fragmentadas em todo o ecossistema Olcan. Padrão canônico: `lib/api-endpoints.ts` é a única fonte de verdade para URLs de serviço.
**Status**: ✅ CONCLUÍDO (2026-04-26) — Todas as violações documentadas corrigidas. Restam apenas exceções aceitáveis listadas abaixo.
**Tags**: #arquitetura #urls #env-vars #refactoring #nexus

---

## ✅ Passos Complexos — CONCLUÍDOS

Os seguintes arquivos foram implementados pelo Arquiteto Líder e **não devem ser alterados** sem revisão arquitetural:

### 1. `apps/app-compass-v2.5/src/lib/api-endpoints.ts` — REESCRITO
**O quê**: Arquivo canônico de URLs para o app Compass. Todos os 6 nós do ecossistema (api, app, cms, marketplace, zenith, mautic) estão definidos com fallbacks corretos para produção e warning de desenvolvimento.
**Bugs corrigidos**:
- `cms.base`, `storefront.base`, `zenith.base` usavam `https://api.olcan.com.br` como fallback (errado). Agora usam seus próprios domínios canônicos.
- `API_ROUTES.tasks` tinha `/api/tasks` hardcoded com prefixo duplicado. Agora usa `API_ENDPOINTS.api.rest` consistentemente.
- `API_ROUTES.auth.*` e `routes.*` estavam sem o prefixo `/api`. Corrigido.
- Adicionado `API_ENDPOINTS.api.rest` (`origin/api`) e `API_ENDPOINTS.api.v1` (`origin/api/v1`) como propriedades explícitas.
- Adicionado `API_ROUTES.commerce.*` para o checkout proxy.

### 2. `apps/app-compass-v2.5/src/middleware.ts` — CSP CORRIGIDA
**O quê**: `connect-src` no CSP incluía apenas `olcan-compass-api.onrender.com` (Render hostname). Após migração DNS, conexões a `api.olcan.com.br` eram bloqueadas pelo browser.
**Fix**: Adicionados `https://api.olcan.com.br` e `wss://api.olcan.com.br`. O Render URL foi mantido durante janela de migração.
**Ação futura**: Remover `https://olcan-compass-api.onrender.com` do `connect-src` após confirmar que `api.olcan.com.br` está totalmente propagado.

### 3. `apps/app-compass-v2.5/src/stores/canonicalContentStore.ts` — CORRIGIDO
**O quê**: Variável module-level `ZENITH_API_URL` estava hardcoded na linha 55, bypassing o `api-endpoints.ts` e usando fallback incorreto (`http://localhost:3001/api` em prod).
**Fix**: Removida a constante global. Cada action (`fetchFeedChronicles`, `fetchCommunityFeed`, `postToNexus`) agora lê `API_ENDPOINTS.zenith.base` inline, garantindo que a leitura seja lazy e centralizada.

### 4. `apps/site-marketing-v2.5/src/lib/api-endpoints.ts` — CRIADO
**O quê**: O site de marketing não tinha nenhum arquivo centralizado de URLs. Criado do zero com os serviços relevantes para o contexto de marketing: `site`, `api`, `app`, `marketplace`, `mautic` (incluindo `n8n.webhook`).

### 5. `apps/site-marketing-v2.5/src/lib/cms.ts` — CORRIGIDO
**O quê**: `CMS_BASE_URL` era uma constante module-level lendo `process.env` diretamente. Agora importa `API_ENDPOINTS.site.base` do novo `api-endpoints.ts`.

### 6. `apps/app-compass-v2.5/src/app/api/checkout/route.ts` — CORRIGIDO
**O quê**: Linha 4 lia `process.env.NEXT_PUBLIC_API_URL` diretamente e hardcodava fallback Render URL. Agora usa `API_ROUTES.commerce.checkoutIntents` do `api-endpoints.ts`.

### 7. `apps/api-core-v2.5/app/core/medusa_client.py` — CORRIGIDO
**O quê**: `MedusaClient.__init__` lia `os.getenv("MEDUSA_URL", ...)` — env var incorreta (a var correta é `MARKETPLACE_ENGINE_URL`) e bypass do sistema de settings.
**Fix**: Substituído por `settings.marketplace_engine_url`. Removido `import os` desnecessário.

### 8. `apps/app-compass-v2.5/.env.production` — ATUALIZADO
**O quê**: Arquivo estava desatualizado: referenciava Supabase (removido em v2.5), faltavam `NEXT_PUBLIC_CMS_URL`, `NEXT_PUBLIC_ZENITH_API_URL`, `NEXT_PUBLIC_MARKETPLACE_API_URL`, `NEXT_PUBLIC_MAUTIC_URL`. `NEXT_PUBLIC_APP_URL` apontava para `app.olcan.com.br` em vez de `compass.olcan.com.br`.
**Fix**: Removidas vars Supabase. Adicionadas todas as URLs de serviço. Corrigido o App URL.

---

## ✅ Passos Simples — COMPLETADOS (2026-04-26)

Os passos abaixo são refatorações mecânicas que seguem o mesmo padrão dos passos 3 e 6 acima. Cada um consiste em: (1) adicionar o import de `api-endpoints.ts`, (2) substituir leitura direta de `process.env` pelo valor centralizado.

---

### Passo A — `RouteMetadataSidebar.tsx`

**Arquivo**: `apps/app-compass-v2.5/src/components/routes/RouteMetadataSidebar.tsx`
**Linha**: ~201

**Antes:**
```typescript
process.env.NEXT_PUBLIC_API_URL || ''
```

**Depois:**
```typescript
// No topo do arquivo, adicionar:
import { API_ENDPOINTS } from "@/lib/api-endpoints";

// Na linha ~201, substituir:
API_ENDPOINTS.api.base
```

**Verificação**: Após a mudança, confirmar que a variável é usada apenas para exibição ou para construção de URL — não para fetch direto (que deve ir pelo axios layer em `api.ts`).

---

### Passo B — `admin/crm/page.tsx`

**Arquivo**: `apps/app-compass-v2.5/src/app/(app)/admin/crm/page.tsx`
**Linha**: ~48

**Antes:**
```typescript
process.env.NEXT_PUBLIC_API_URL ?? ""
```

**Depois:**
```typescript
// No topo do arquivo, adicionar:
import { API_ENDPOINTS } from "@/lib/api-endpoints";

// Na linha ~48, substituir:
API_ENDPOINTS.api.base
```

---

### Passo C — `dossiers/[id]/export/page.tsx` (watermark URL)

**Arquivo**: `apps/app-compass-v2.5/src/app/(app)/dossiers/[id]/export/page.tsx`
**Linhas**: ~1563 e ~1798

**Antes:**
```typescript
"https://app.olcan.com.br/forge"
```

**Depois:**
```typescript
// No topo do arquivo, adicionar:
import { API_ENDPOINTS } from "@/lib/api-endpoints";

// Nas duas linhas, substituir:
`${API_ENDPOINTS.app.base}/forge`
```

**Atenção**: Este valor aparece no rodapé de PDFs exportados. Verificar que o build ainda gera o texto corretamente após a mudança.

---

### Passo D — `diagnostico/page.tsx` (CTA hardcoded)

**Arquivo**: `apps/site-marketing-v2.5/src/app/diagnostico/page.tsx`
**Linha**: ~212

**Antes:**
```typescript
`https://compass.olcan.com.br/register?archetype=...`
```

**Depois:**
```typescript
// No topo do arquivo, adicionar:
import { API_ENDPOINTS } from "@/lib/api-endpoints";

// Na linha ~212, substituir o domínio hardcoded:
`${API_ENDPOINTS.app.base}/register?archetype=...`
```

**Nota**: O `archetype` query param deve ser mantido exatamente como está — apenas o domínio base é substituído.

---

### Passo E — `payload.config.ts` (CORS hardcoded)

**Arquivo**: `apps/site-marketing-v2.5/payload.config.ts`
**Linhas**: ~30–42 (array de origens CORS)

**Problema**: 7 origens CORS estão hardcoded no array. Qualquer novo subdomínio exige edição de código.

**Solução**:
```typescript
// Substituir o array hardcoded por:
const allowedOrigins = (
  process.env.PAYLOAD_CORS_ORIGINS ||
  [
    "https://olcan.com.br",
    "https://www.olcan.com.br",
    "https://compass.olcan.com.br",
    "https://app.olcan.com.br",
    "https://marketplace.olcan.com.br",
    "https://admin.olcan.com.br",
    "https://vendors.olcan.com.br",
    "https://staff.olcan.com.br",
    "https://zenith.olcan.com.br",
  ].join(",")
).split(",").map((s) => s.trim()).filter(Boolean);

// No config do Payload, usar:
cors: allowedOrigins,
```

**E adicionar ao `.env.example` do site-marketing:**
```env
# Comma-separated list of allowed CORS origins for Payload CMS admin
PAYLOAD_CORS_ORIGINS=https://olcan.com.br,https://www.olcan.com.br,...
```

---

### Passo F — `api-core-v2.5/app/core/config.py` (CORS defaults incompletos)

**Arquivo**: `apps/api-core-v2.5/app/core/config.py`
**Linhas**: ~17–23

**Problema**: `cors_allow_origins` default inclui apenas `compass.olcan.com.br`, `app.olcan.com.br`, e um Vercel preview URL. Faltam todos os outros subdomínios do ecossistema.

**Solução** — atualizar o default do campo:
```python
cors_allow_origins: str = (
    "http://localhost:3000,"
    "http://localhost:3001,"
    "https://olcan.com.br,"
    "https://www.olcan.com.br,"
    "https://compass.olcan.com.br,"
    "https://app.olcan.com.br,"
    "https://marketplace.olcan.com.br,"
    "https://admin.olcan.com.br,"
    "https://vendors.olcan.com.br,"
    "https://staff.olcan.com.br,"
    "https://zenith.olcan.com.br,"
    "https://mautic.olcan.com.br"
)
```

**Atenção**: Remover o `https://olcan-compass-web.vercel.app` do default (é um preview URL temporário). Pode ser adicionado via env var `CORS_ALLOW_ORIGINS` em Render se necessário.

---

## 🗺️ Mapa de Violações Restantes — APÓS CORREÇÃO COMPLETA

### ✅ Corrigidos neste ciclo

| Arquivo | Linha | Antes | Depois | Status |
|---|---|---|---|---|
| `components/routes/RouteMetadataSidebar.tsx` | ~201 | `process.env.NEXT_PUBLIC_API_URL` | `API_ENDPOINTS.api.base` | ✅ |
| `app/(app)/admin/crm/page.tsx` | ~48 | `process.env.NEXT_PUBLIC_API_URL` | `API_ENDPOINTS.api.base` | ✅ |
| `app/(app)/dossiers/[id]/export/page.tsx` | ~1563 | `olcan.com.br` | `${API_ENDPOINTS.app.base.replace('https://','')}` | ✅ |
| `app/(app)/dossiers/[id]/export/page.tsx` | ~1799 | `olcan.com.br` (template) | `${API_ENDPOINTS.app.base.replace(...)}` | ✅ |
| `app/diagnostico/page.tsx` (mktg) | ~212 | `https://compass.olcan.com.br` | `${API_ENDPOINTS.app.base}` | ✅ |
| `payload.config.ts` | ~27-37 | `cors: [...]` hardcoded | `cors: allowedOrigins` (env var) | ✅ |
| `lib/enhanced-export.ts` | ~99 | `https://app.olcan.com.br/forge` | `${API_ENDPOINTS.app.base}/forge` | ✅ |
| `app/(auth)/login/page.tsx` | ~25 | `TRUSTED_ORIGINS = ["olcan.com.br"]` | `new URL(API_ENDPOINTS.app.base).hostname` | ✅ |
| `app/sitemap.ts` (mktg) | 4 | `'https://www.olcan.com.br'` | `API_ENDPOINTS.site.base` | ✅ |
| `app/layout.tsx` (mktg) | 8, 31 | `new URL("https://...")` | `new URL(API_ENDPOINTS.site.base)` | ✅ |
| `config.py` (api-core) | ~17-23 | CORS incompleto | Todos os subdomínios, sem preview URL | ✅ |

### ✅ Aceitáveis — Nenhuma ação necessária

| Arquivo | Linha | Tipo | Motivo |
|---|---|---|---|
| `app/(app)/admin/page.tsx` | ~173-176 | Display strings (UI labels) | Não são URLs de fetch — texto de exibição |
| `middleware.ts` | 88 | CSP `connect-src` | Configuração de segurança, não URL de fetch |
| `payload.config.ts` | ~22-30 | Fallback array em `allowedOrigins` | Backup quando `PAYLOAD_CORS_ORIGINS` não está definida |
| `components/home/MarketplaceSection.tsx` | 90 | `NEXT_PUBLIC_STOREFRONT_URL` fallback | Variável distinta (`NEXT_PUBLIC_STOREFRONT_URL`, não `_URL` genérica) |
| `components/home/CompassSpotlight.tsx` | 69 | CTA link hardcoded | Texto de âncora de marketing — considerado display string |
| `components/home/InsightsSection.tsx` | 100 | CTA link hardcoded | Mesmo above |
| `lib/wordpress.ts` | 7 | Comentário de documentação | Apenas comentário com exemplo de URL |
| `lib/supabase/*` | — | `SUPABASE_URL` | Supabase usa vars específicas, não genéricas `_URL` |
| `lib/cms.ts`, `lib/storefront-links.ts` | — | CMS/Storefront URL | Servços distintos com vars próprias |

---

## 📋 Regra de Verificação para Revisores

Após qualquer PR neste ecossistema, o revisor deve executar:

```bash
# Nenhum resultado deve aparecer para leitura direta de env vars de URL
grep -rn "process\.env\.NEXT_PUBLIC_.*_URL" apps/app-compass-v2.5/src --include="*.ts" --include="*.tsx" \
  | grep -v "lib/api-endpoints.ts" \
  | grep -v "lib/api.ts"

grep -rn "process\.env\.NEXT_PUBLIC_.*_URL" apps/site-marketing-v2.5/src --include="*.ts" --include="*.tsx" \
  | grep -v "lib/api-endpoints.ts"

# Nenhum hardcode de domínio olcan.com.br deve aparecer (exceto display strings)
grep -rn "olcan\.com\.br" apps/app-compass-v2.5/src --include="*.ts" --include="*.tsx" \
  | grep -v "api-endpoints.ts" \
  | grep "https://"
```

---

## 🔗 Referências Relacionadas
- [[00_Onboarding_Inicio/Padroes_de_Codigo]] — Regra 5: URLs centralizadas
- [[02_Arquitetura_Compass/Arquitetura_Sistemas_Olcan]] — Mapa topográfico do ecossistema
- [[05_Infraestrutura/DNS_CLOUDFLARE]] — Registros DNS dos subdomínios
