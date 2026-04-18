---
title: Guia de Avaliação Técnica
type: drawer
layer: 8
status: active
last_seen: 2026-04-17
backlinks:
  - Verdade_do_Produto
  - Padroes_de_Codigo
---

# Guia de Avaliação Técnica (Assessment)

**Resumo**: Protocolo para avaliação técnica da base de código, identificação de débitos técnicos e prontidão para novos breakthroughs de engenharia.
**Importância**: Alto
**Status**: Ativo
**Camada (Layer)**: Execução
**Tags**: #avaliação #audit #código #débito-técnico #qualidade
**Criado**: 12/04/2026
**Atualizado**: 15/04/2026

---

## 🧠 Contexto BMAD
A avaliação técnica é a "Higiene do Breakthrough". No BMAD, não construímos sobre bases instáveis. Este guia define como auditar o código para garantir que ele esteja limpo o suficiente para suportar a próxima onda de inovação radical sem falhas estruturais.

## Conteúdo

### Checkpoints de Avaliação
1. **Tipagem de Dados**: Verificar cobertura TypeScript (objetivo 100% strict).
2. **Duplicação de Lógica**: Identificar stores ou funções redundantes (ex: o refactor 41 -> 23 stores).
3. **Segurança**: Auditar exposição de segredos e chaves de API.
4. **Resiliência do Build**: Garantir que as mudanças não quebrem o deployment contínuo.

### Padrão de Report
- Resumo executivo em PT-BR.
- Lista de bloqueadores (Must-Fix).
- Lista de dívidas técnicas (Non-Blocking).

## 🔗 Referências Relacionadas
- [[00_Onboarding_Inicio/Guia_de_Desenvolvimento]]
- [[02_Arquitetura_Compass/Prontidao_Deployment_v2_5]]
