---
title: Plano de Integração Marketplace
type: drawer
layer: 2
status: active
last_seen: 2026-04-17
backlinks:
  - Arquitetura_v2_5_Compass
  - Verdade_do_Produto
---

# Plano de Integração do Marketplace Olcan

**Resumo**: Detalhamento técnico e estratégico para a integração do Marketplace de provedores (mentores, advogados) no ecossistema Olcan Compass.
**Importância**: Alto
**Status**: Em Refinamento
**Camada (Layer)**: Serviços
**Tags**: #marketplace #integração #medusa #serviços #finanças
**Criado**: 05/04/2026
**Atualizado**: 15/04/2026

---

## 🧠 Contexto BMAD
O Marketplace é a camada de monetização "Serviços" da Olcan. No BMAD, a integração deve ser robusta o suficiente para suportar transações reais com segurança (Stripe Connect/MedusaJS), garantindo que a promessa de "suporte de carreira" seja cumprível através de especialistas humanos verificados.

## Conteúdo

### Objetivo do Marketplace
Conectar os "Aspirantes Globais" com os recursos necessários para suas jornadas, desde mentoria de carreira até suporte jurídico de imigração.

### Arquitetura de Integração
- **Engine**: MedusaJS para gestão de catálogo e transações.
- **Pagamentos**: Stripe e Stripe Connect para split de pagamentos com provedores.
- **Bridge**: Sincronização de usuários Olcan como clientes no Marketplace.

### Próximos Passos (Pendentes)
1. **Verificação de Provedores**: Interface de onboarding para mentores.
2. **Sistema de Reservas**: Agendamento integrado ao `routesApi`.
3. **Escalonamento**: Dashboard para gestão de múltiplos provedores e resoluções de disputas.

## 🔗 Referências Relacionadas
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass]]
- [[03_Produto_Forge/PRD_Geral_Olcan]]
