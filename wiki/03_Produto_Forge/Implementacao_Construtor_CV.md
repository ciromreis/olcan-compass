---
title: Implementação Construtor de CV
type: drawer
layer: 3
status: active
last_seen: 2026-04-17
backlinks:
  - PRD_Geral_Olcan
  - Verdade_do_Produto
---

# Implementação: Construtor de CV (Forge)

**Resumo**: Detalhamento técnico da implementação do construtor de currículos dentro do Narrative Forge, incluindo lógica de exportação e suporte multilingue.
**Importância**: Alto
**Status**: Concluído
**Camada (Layer)**: Execução
**Tags**: #forge #cv #builder #implementação #carreira
**Criado**: 24/03/2026
**Atualizado**: 15/04/2026

---

## 🧠 Contexto BMAD
O Construtor de CV é a ferramenta de "Escrita de Destino" da Olcan. No BMAD, a facilidade de gerar um documento pronto para o mercado internacional é um salto quântico de produtividade para o usuário imigrante.

## Conteúdo

### Arquitetura do Builder
- **State Management**: Zustand para gerenciar o estado do documento em tempo real.
- **Formulários Dinâmicos**: React Hook Form para captura de dados de Experiência, Educação e Skills.
- **Preview em Tempo Real**: Renderização instantânea do template selecionado.

### Lógica de Exportação
- Uso de `react-pdf` para geração de PDFs no lado do cliente.
- Suporte para exportação em Markdown para fácil edição em outras ferramentas.

## 🔗 Referências Relacionadas
- [[03_Produto_Forge/Spec_Narrative_Forge]]
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass]]
