---
title: Padrões de Código e Qualidade
type: drawer
layer: 8
status: active
last_seen: 2026-04-17
backlinks:
  - Verdade_do_Produto
  - Guia_de_Avaliacao_Tecnica
---

# Padrões de Código e Qualidade (Coding Standards)

**Resumo**: Diretrizes obrigatórias para escrita de código no ecossistema Olcan, cobrindo TypeScript, CSS, estrutura de arquivos e práticas de clean code.
**Importância**: Alto
**Status**: Ativo
**Camada (Layer)**: Execução
**Tags**: #código #padrões #typescript #css #qualidade #linting
**Criado**: 12/04/2026
**Atualizado**: 17/04/2026

---

## 🧠 Contexto BMAD
Padrões de Código são os "Blocos de Construção do Breakthrough". No BMAD, a consistência do código reduz a carga cognitiva para humanos e agentes, permitindo manutenções ultra-rápidas e minimizando a introdução de bugs por confusão estrutural.

## Conteúdo

### Regras de Ouro
1. **TypeScript Restrito**: Proibido o uso de `any`. Interfaces e tipos devem ser explícitos.
2. **Uma Responsabilidade**: Um arquivo, um componente/módulo. Separation of Concerns (Apresentação/Lógica/Dados).
3. **CSS Vanilla/Premium**: Foco em flexibilidade e controle visual. Uso extensivo de variáveis (tokens) do design system.
4. **Documentação obrigatória**: Toda função de lógica de negócio deve ter JSDoc descritivo.
5. **URLs de Serviço Centralizadas**: **Proibido** hardcode de subdomínios ou variáveis de ambiente fragmentadas em stores, componentes ou rotas de API. Todos os URLs de serviço do ecossistema Olcan (`compass`, `marketplace`, `api`, `zenith`, etc.) devem ser centralizados em `lib/api-endpoints.ts`. Duplicação de constantes como `NEXT_PUBLIC_STOREFRONT_URL` ou `NEXT_PUBLIC_CMS_URL` em múltiplos lugares é uma violação desta regra.

### Naming Conventions
- **Componentes**: PascalCase (`GlassButton.tsx`).
- **Hooks**: camelCase (`useCompanion.ts`).
- **Arquivos de Estilo**: `[Componente].module.css` ou tokens globais.

### Linting e Testes
- Erros de linting bloqueiam o commit.
- Testes unitários são obrigatórios para funções de cálculo de XP, evolução ou lógica de crédito (Forge).

## 🔗 Referências Relacionadas
- [[00_Onboarding_Inicio/Guia_de_Desenvolvimento]]
- [[00_Onboarding_Inicio/Fluxo_Git_Olcan]]
- [[02_Arquitetura_Compass/Guia_de_Design_Visual_Liquid_Glass]]
