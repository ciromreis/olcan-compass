---
title: Guia de Desenvolvimento Olcan
type: drawer
layer: 8
status: active
last_seen: 2026-04-17
backlinks:
  - Verdade_do_Produto
  - Padroes_de_Codigo
---

# Guia de Desenvolvimento Olcan

**Resumo**: Guia técnico contendo padrões de código, fluxo de trabalho e regras para desenvolvedores e agentes de IA no projeto Olcan.
**Importância**: Alto
**Status**: Ativo
**Camada (Layer)**: Execução
**Tags**: #desenvolvimento #padrões #guia #IA
**Criado**: 10/04/2026
**Atualizado**: 15/04/2026

---

## 🧠 Contexto BMAD
Este guia assegura a consistência técnica necessária para o desenvolvimento ágil. No BMAD, a padronização é o que permite que múltiplos agentes trabalhem no mesmo monorepo sem criar entropia ou "code smells" que bloqueiem futuros breakthroughs.

## Conteúdo

### Princípios de Desenvolvimento
- **Simplicidade sobre Complexidade**: Prefira soluções legíveis e modulares.
- **Segurança de Tipos**: Use TypeScript estrito em todo o projeto.
- **Documentação Ativa**: Mantenha os comentários e arquivos markdown atualizados a cada sessão.

### Fluxo de Trabalho
1. **Puxar e Sincronizar**: Sempre comece sincronizando com o repositório principal.
2. **Desenvolvimento em Monorepo**: Entenda as dependências entre `apps/` e `packages/`.
3. **Testes Antes do Commit**: Execute `npm run build` na aplicação alvo antes de entregar a tarefa.

### Regras para Agentes de IA
- Nunca escreva "resumos inflados" garantindo que tudo está pronto sem verificação real.
- Siga as regras específicas de cada aplicação (`apps/[app-name]/CLAUDE.md`).
- Utilize os canais de comunicação (Handoffs) para passar o contexto para o próximo agente.

## 🔗 Referências Relacionadas
- [[00_Onboarding_Inicio/CLAUDE_Full]]
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass]]
