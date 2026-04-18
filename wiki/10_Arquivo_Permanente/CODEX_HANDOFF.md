# Codex Handoff (Olcan Compass)

Este arquivo existe para manter o trabalho “sem atrito” entre sessões do Codex (frontend + Stitch + agora NotebookLM).

## Estado atual (28/02/2026)
- `apps/web` compila e passa lint (`npm run lint`, `npm run build`).
- Telas principais já foram alinhadas para o visual “Liquid Glass” e fluxos conectados ao backend (rotas, sprints, oportunidades, marketplace/mensagens).
- O backend ainda tem TODOs de hardening (permissões/roles/ownership e e-mail), mas os endpoints usados no frontend estão presentes.

## Design / Stitch
- Guia canônico: `docs/design/DESIGN.md`
- Mapa de telas Stitch: `docs/design/STITCH_SCREEN_MAP.md`
- Downloads locais do Stitch continuam em `stitch_assets/` (ignorados pelo git).

## MCP (para a próxima sessão)
Você pode verificar os MCP servers com:
```bash
codex mcp list
```
Esperado:
- `notebooklm` (via `npx notebooklm-mcp@latest`)
- `stitch` (via `npx stitch-mcp@latest`)
- `pencil` (servidor local do app)

Observação: alguns MCPs exigem autenticação/configuração própria (ex.: NotebookLM).

## Como rodar
### Stack completo (recomendado)
```bash
docker compose up --build
docker compose run --rm api alembic upgrade head
```

### Frontend
```bash
cd apps/web
npm install
npm run dev
```

## Loose ends / decisões pendentes
1. **Backend hardening (prioridade)**: várias rotas possuem TODOs de `admin check`, `role check`, `ownership/permissions`, e e-mails de verificação/reset não integrados.
2. **Higiene do repo**: adicionamos `.gitignore` para evitar adicionar acidentalmente diretórios grandes locais (`archive/`, `antigravity/`).
3. **Próximo passo de UX**: padronizar o restante dos componentes “light” remanescentes (se houver) e revisar páginas “placeholder”.

