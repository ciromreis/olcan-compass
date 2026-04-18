---
title: Status Paywall de Créditos
type: drawer
layer: 3
status: active
last_seen: 2026-04-17
backlinks:
  - PRD_Geral_Olcan
  - Verdade_do_Produto
---

# Status: Paywall de Créditos do Forge

**Resumo**: Detalhamento da implementação do sistema de créditos para a ferramenta Narrative Forge, incluindo integração com Stripe e fluxos de usuário.
**Importância**: Médio
**Status**: Concluído
**Camada (Layer)**: Serviços
**Tags**: #billing #stripe #créditos #forge #monetização
**Criado**: 12/04/2026
**Atualizado**: 15/04/2026

---

## 🧠 Contexto BMAD
O paywall de créditos é o primeiro "Breakthrough de Monetização" da Olcan. No BMAD, transformar um recurso técnico em uma transação financeira valida o modelo de negócio Micro-SaaS. A implementação garante que o valor da IA seja trocado por receita real de forma fluida.

## Conteúdo

### Regras de Negócio
- **Créditos Iniciais**: 3 créditos gratuitos por usuário novo.
- **Consumo**: 1 crédito por operação de "AI Polish" pesada.
- **Pacotes**: "Starter" (10 créditos) e "Pro" (50 créditos).

### Tecnologias
- **Gatekeeper**: Lógica no backend (`billingService`) que verifica saldo antes de processar IA.
- **Frontend**: Componente `CreditBalance` exibindo saldo e trigger de compra.
- **Gateway**: Stripe Checkout e Webhooks para conciliação.

## 🔗 Referências Relacionadas
- [[03_Produto_Forge/Spec_Narrative_Forge]]
- [[02_Arquitetura_Compass/Referencia_de_API]]
