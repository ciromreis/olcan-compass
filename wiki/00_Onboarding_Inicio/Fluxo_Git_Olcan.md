---
title: Fluxo Git Olcan
type: drawer
layer: 8
status: active
last_seen: 2026-04-17
backlinks:
  - Padroes_de_Codigo
  - Runbook_de_Deployment
---

# Fluxo de Trabalho Git (Git Workflow)

**Resumo**: Protocolo de versionamento e colaboração via Git, definindo padrões de commits, branches e revisões de código (PRs).
**Importância**: Alto
**Status**: Ativo
**Camada (Layer)**: Execução
**Tags**: #git #workflow #branching #commits #colaboração
**Criado**: 12/04/2026
**Atualizado**: 17/04/2026

---

## 🧠 Contexto BMAD
O Fluxo Git é a "Linha do Tempo do Breakthrough". No BMAD, commits atômicos e descriptivos permitem rastrear exatamente onde cada inovação foi introduzida ou onde um erro surgiu, mantendo a história do projeto limpa e auditável.

## Conteúdo

### Estratégia de Branching
- **main**: Sempre pronta para deploy (produção). PRs obrigatórios.
- **feature/**: Desenvolvimento de novas funcionalidades.
- **fix/**: Correção de bugs.
- **refactor/**: Melhorias estruturais sem mudança de comportamento.

### Padrão de Commits (Conventional Commits)
- `feat:`: Nova funcionalidade.
- `fix:`: Coreção de bug.
- `docs:`: Apenas documentação.
- `style:`: Mudanças visuais/formatação.
- `refactor:`: Mudança no código que não altera comportamento.

### Fluxo de Trabalho Diario
1. `git fetch origin`
2. `git checkout -b feature/minha-feature origin/main`
3. Desenvolvimento + Testes
4. `git commit -m "feat: adicionar sistema de evolução aura"`
5. `git push origin feature/minha-feature`
6. Abrir Pull Request para `main`.

## 🔗 Referências Relacionadas
- [[00_Onboarding_Inicio/Padroes_de_Codigo]]
- [[02_Arquitetura_Compass/Scripts_de_Automacao]]
