---
title: Comparativo Estrutura v2 vs v2.5
type: drawer
layer: 2
status: active
last_seen: 2026-04-17
backlinks:
  - Arquitetura_v2_5_Compass
  - Verdade_do_Produto
---

# Comparativo de Estrutura: v2 vs v2.5

**Resumo**: Documento informativo comparando a estrutura legada (v2) com a nova arquitetura modular v2.5, facilitando a migração para desenvolvedores.
**Importância**: Médio
**Status**: Informativo
**Camada (Layer)**: Execução
**Tags**: #arquitetura #migração #v2.5 #comparativo #olcan
**Criado**: 11/04/2026
**Atualizado**: 15/04/2026

---

## 🧠 Contexto BMAD
O comparativo v2 vs v2.5 serve como o "Mapa de Transição". No BMAD, entender de onde viemos permite que a refatoração seja consciente e preserve as lições aprendidas nos breakthroughs anteriores, evitando a repetição de erros do passado.

## Conteúdo

### Mudanças Estruturais
- **Stores (Zustand)**: 41 stores fragmentadas na v2 -> 23 stores canônicas e centralizadas na v2.5.
- **Roteamento**: Rotas ad-hoc na v2 -> Estrutura `v1` unificada e tipada na v2.5.
- **Design**: Cores e sombras manuais na v2 -> Sistema de Design Tokens "Liquid Glass" na v2.5.

### Benefícios Alcançados
- **Escalabilidade**: Adicionar uma nova feature (ex: Aura Evolution) é 60% mais rápido na v2.5.
- **Estabilidade**: Redução drástica de efeitos colaterais entre componentes devido ao estado centralizado.

## 🔗 Referências Relacionadas
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass]]
- [[02_Arquitetura_Compass/Guia_de_Arquitetura_de_Stores]]
