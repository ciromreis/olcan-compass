# CI/CD — Estado Atual e Gaps Conhecidos

**Last updated:** 2026-04-20  
**Versão:** v2.5

---

## Resumo Executivo

O deploy da API acontece **automaticamente via Render**, não via GitHub Actions. Os workflows do GitHub Actions existem mas têm limitações críticas documentadas abaixo. Qualquer LLM ou desenvolvedor que tente entender o pipeline olhando apenas os arquivos `.github/workflows/` vai ter uma imagem errada da realidade.

---

## Como o Deploy Realmente Acontece

```
Push para main no GitHub
        ↓
Render detecta via webhook (automático)
        ↓
Render executa docker build (apps/api-core-v2.5/Dockerfile)
        ↓
Se build OK → Render substitui o container em produção
        ↓
Alembic roda migrations no startup do container
        ↓
API disponível em https://olcan-compass-api.onrender.com
```

**O deploy do frontend (Vercel) segue o mesmo modelo**: push para main → Vercel detecta via webhook → build automático → deploy.

Não há nenhum step no GitHub Actions que acione o Render ou a Vercel. Os deploys são controlados pelas plataformas diretamente.

---

## Estado dos Workflows do GitHub Actions

### `ci.yml` — Workflow ativo com problemas de path

**O que faz:** Testa syntax do Python e faz build do frontend v2.  
**Quando roda:** Push e PR para `main` ou `develop`.

**Problemas identificados:**

| Problema | Detalhe |
|---------|---------|
| Path errado do backend | Referencia `apps/api` — o diretório correto é `apps/api-core-v2.5` |
| Testa a versão errada do frontend | Roda `pnpm build:v2` e `pnpm lint:v2` — o desenvolvimento ativo é v2.5 |
| Python 3.12 no CI | O `Dockerfile` de produção usa Python 3.11 — divergência de versão |

**Consequência:** O `ci.yml` vai falhar ao tentar acessar `apps/api/requirements.txt` pois o diretório não existe. Este workflow provavelmente não passa no estado atual.

---

### `ci-cd.yml` — Workflow template com deploys stub

**O que faz:** Testa backend e frontend com mais cobertura, mas os jobs de deploy são placeholders.  
**Quando roda:** Push e PR para `main` ou `develop`.

**Problemas identificados:**

| Problema | Detalhe |
|---------|---------|
| Deploy staging é stub | `run: echo "Deploying to staging environment..."` — não faz nada |
| Deploy produção é stub | `run: echo "Deploying to production environment..."` — não faz nada |
| DATABASE_URL sem `+asyncpg` | Testes CI usam `postgresql://test:test@...` — em produção é obrigatório `postgresql+asyncpg://` |
| Python 3.12 no CI | Produção usa 3.11 |
| Docker login com `continue-on-error: true` | Se Docker Hub não estiver configurado, silencia o erro |

**Consequência:** O workflow parece funcional mas não realiza deploy de fato. A divergência no `DATABASE_URL` pode mascarar bugs de driver nas migrations.

---

## Gaps Não Documentados (até agora)

### Gap 1 — Nenhum CI valida a v2.5

Nenhum dos dois workflows faz build do `app-compass-v2.5` ou testa o `api-core-v2.5` com migrations reais. O CI atual é um risco: mudanças que quebram a v2.5 passam sem sinal de alerta automático.

**Solução necessária:** Atualizar `ci.yml` para:
- Usar `apps/api-core-v2.5` como path do backend
- Rodar `pnpm build:v2.5` e `pnpm lint:v2.5`
- Usar Python 3.11 (alinhado com Dockerfile de produção)
- Incluir `postgresql+asyncpg://` no `DATABASE_URL` dos testes

### Gap 2 — Sem smoke test pós-deploy

Após um deploy no Render, não há verificação automática de que a API subiu corretamente. O checklist manual é:

```bash
# Verificar que a API está respondendo
curl https://olcan-compass-api.onrender.com/api/health

# Verificar status do último deploy via Render API
curl -s \
  "https://api.render.com/v1/services/srv-d6jjhuea2pns73f73e5g/deploys?limit=1" \
  -H "Authorization: Bearer $RENDER_API_KEY" | jq '.[0].deploy | {status, createdAt, finishedAt}'
```

### Gap 3 — Staging não existe de fato

Vários documentos referenciam `staging-api.olcan.com.br` e `staging-compass.olcan.com.br`, mas esses ambientes não estão provisionados. O Render Free plan executa apenas um serviço. Qualquer checklist ou runbook que instrua "teste em staging primeiro" está descrevendo um ambiente inexistente.

---

## Gotchas Críticos do Build Docker

Estes problemas foram encontrados e corrigidos durante o deployment. Estão aqui como memória operacional:

| Sintoma | Causa | Fix |
|---------|-------|-----|
| Alembic falha com `ModuleNotFoundError` no container | `PYTHONPATH` não configurado | `ENV PYTHONPATH=/app` no Dockerfile |
| `IndexError: list index out of range` em `commerce_bridge.py` | Path absoluto tinha níveis diferentes em Docker vs local | `parents[4]` → `parents[2]` |
| Catálogo de produtos não encontrado em runtime | `data/` não copiado para a imagem | `COPY data ./data` no Dockerfile |
| Queries falham silenciosamente após a API subir | `DATABASE_URL` sem `+asyncpg://` | Usar `postgresql+asyncpg://user:pass@host/db` |

---

## Referências

- [[DEPLOYMENT_RENDER.md]] — Runbook completo do deploy na Render (Docker, env vars, gotchas)
- [[RENDER_CLI.md]] — Como disparar e monitorar deploys via CLI/API
- [[INFRAESTRUTURA_OVERVIEW.md]] — Mapa geral de todos os componentes
- [[../../.github/workflows/ci.yml]] — Workflow com path errado (needs fix)
- [[../../.github/workflows/ci-cd.yml]] — Workflow com deploys stub (needs fix)
