# Deployment — Vercel (Frontend)

> **Última atualização:** 2026-04-27
> **Status:** ✅ deploys passando após o fix de `package-lock.json`

---

## Visão Geral

Dois projetos Vercel ativos servem o tráfego de frontend da Olcan:

| Projeto Vercel             | Project ID                            | Domínio servido         | Root Directory               |
| -------------------------- | ------------------------------------- | ----------------------- | ---------------------------- |
| **`web-v2`**               | `prj_EYWftueWEzLOJAJmkrj6JO9jP0hx`   | `compass.olcan.com.br` | `apps/app-compass-v2.5`      |
| **`site-marketing-v2.5`**  | `prj_HtlWRkPdyayrIKEYOxQtTP8dwqTY`   | `olcan.com.br`, `www.`  | `apps/site-marketing-v2.5`   |

> ⚠️ **O nome do projeto `web-v2` é histórico** — ele serve a **v2.5**.
> Não confiar no nome; checar `rootDirectory`.

### Projetos órfãos (não servir tráfego)

| Projeto                | Status          | Ação recomendada       |
| ---------------------- | --------------- | ---------------------- |
| `app-compass-v2.5`     | 0 deploys       | Deletar (placeholder)  |
| `web`                  | última v1, 60d  | Manter (histórico) ou  |
|                        |                 | deletar se for ruído   |

---

## Configuração do Build

Cada projeto usa **npm + lockfile próprio**, não pnpm a partir do root do
monorepo. A escolha é histórica e funciona — *não* tente trocar para pnpm
sem cuidado (ver _gotcha_ abaixo).

| Setting          | `web-v2`                      | `site-marketing-v2.5`        |
| ---------------- | ----------------------------- | ---------------------------- |
| Framework        | Next.js                       | Next.js                      |
| Install Command  | `npm install --legacy-peer-deps` | `npm install --legacy-peer-deps` |
| Build Command    | `npm run build`               | `npm run build`              |
| Output Directory | `.next`                       | `.next`                      |
| Node Version     | 24.x                          | 24.x                         |

A config local em cada `apps/*/vercel.json` complementa as settings do
projeto (env vars, headers, redirects).

---

## ⚠️ GOTCHA crítico — `package-lock.json` em workspace pnpm

**O que aconteceu (2026-04-21 → 2026-04-26):** 5 dias de deploys
falhando com `Error: No Next.js version detected`. `compass.olcan.com.br`
ficou servindo build de 6 dias atrás enquanto cada commit novo entrava
em fila de erros.

**Causa raiz:** o repo é um workspace pnpm (`packageManager: pnpm@10.15.1`,
`pnpm-lock.yaml` na raiz). Em algum momento alguém rodou `npm install`
dentro de `apps/app-compass-v2.5/` e o `package-lock.json` gerado capturou
os symlinks do pnpm:

```json
"node_modules/next": {
  "resolved": "../../node_modules/.pnpm/next@14.2.35.../node_modules/next",
  "link": true
}
```

Quando a Vercel clona o repo do zero e roda `npm install`, esse caminho
relativo `../../node_modules/.pnpm/...` não existe → `node_modules/next`
fica como symlink quebrado → framework detection falha → build aborta.

**Fix:** regenerar o lockfile em diretório isolado para que o npm resolva
do registry de verdade:

```bash
TMP=$(mktemp -d)
cp apps/app-compass-v2.5/package.json "$TMP/"
cd "$TMP"
npm install --legacy-peer-deps --package-lock-only --ignore-scripts
cp package-lock.json /caminho/repo/apps/app-compass-v2.5/package-lock.json
```

Verificar antes de commitar:

```bash
grep -A2 '"node_modules/next"' apps/app-compass-v2.5/package-lock.json
# Deve mostrar:
#   "version": "14.2.35",
#   "resolved": "https://registry.npmjs.org/next/-/next-14.2.35.tgz"
# Se mostrar "link": true ou "../../node_modules/.pnpm/...", está quebrado.
```

**Como prevenir:**
- Nunca rodar `npm install` na raiz do app dentro do workspace pnpm sem
  isolar `node_modules` primeiro (`mv node_modules /tmp/`).
- Para regenerar lockfile, sempre usar diretório temporário (script acima).
- Em CI/local dev, usar `pnpm install` na raiz do monorepo. Não rodar
  `npm install` em `apps/*` em ambiente de dev.

---

## Operações úteis

### Listar deploys de um projeto

```bash
cd apps/app-compass-v2.5  # ou site-marketing-v2.5
vercel ls --scope ciros-projects-e494edf0
```

### Ver logs de uma build que falhou

```bash
vercel inspect <deployment-url> --logs
```

### Acessar via API REST (para automação)

```bash
TOKEN=$(jq -r .token ~/Library/Application\ Support/com.vercel.cli/auth.json)
TEAM=team_jX5ZJeWis1VdUGjHiaQQ9v88

# Estado do último deploy de web-v2
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.vercel.com/v6/deployments?projectId=prj_EYWftueWEzLOJAJmkrj6JO9jP0hx&teamId=$TEAM&limit=1" \
  | jq '.deployments[0] | {state, sha: .meta.githubCommitSha[:8], url}'
```

### Forçar redeploy (sem commit novo)

Pelo CLI: `vercel redeploy <deployment-url>` ou disparar via API:

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  "https://api.vercel.com/v13/deployments?teamId=$TEAM" \
  -d '{"name":"web-v2","gitSource":{"type":"github","ref":"main"}}'
```

---

## Variáveis de Ambiente

| Var                                   | web-v2                               | site-marketing-v2.5                  |
| ------------------------------------- | ------------------------------------ | ------------------------------------ |
| `NEXT_PUBLIC_API_URL`                 | `https://api.olcan.com.br`           | (n/a — server-side via cms.ts)       |
| `NEXT_PUBLIC_APP_URL`                 | (default `https://compass.olcan...`) | `https://compass.olcan.com.br`       |
| `NEXT_PUBLIC_SITE_URL`                | (n/a)                                | `https://olcan.com.br`               |
| `NEXT_PUBLIC_DEMO_MODE`               | `false`                              | (n/a)                                |
| `DEMO_MODE`                           | `false`                              | (n/a)                                |

Estão em `apps/*/vercel.json`. Para rotacionar valores em produção, usar
`vercel env add/rm` ou o dashboard.

---

## Backlinks

- [[INFRAESTRUTURA_OVERVIEW.md]] — mapa completo da infra
- [[DEPLOYMENT_RENDER.md]] — backend (API + Postgres)
- [[CI_CD_Estado_Atual.md]] — pipeline geral
- [[DNS_CLOUDFLARE.md]] — DNS (importante: Vercel NÃO é o nameserver)
