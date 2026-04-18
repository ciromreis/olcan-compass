---
title: Arquitetura do Marketplace Olcan
type: drawer
layer: 2
status: active
last_seen: 2026-04-17
backlinks:
  - Arquitetura_v2_5_Compass
  - Verdade_do_Produto
---

# Arquitetura do Marketplace Olcan

**Resumo**: Especificação da arquitetura do Marketplace, integrando MedusaJS e Stripe para conectar usuários a provedores de serviços especializados.
**Importância**: Alto
**Status**: Ativo
**Camada (Layer)**: Serviços
**Tags**: #arquitetura #marketplace #medusa #stripe #e-commerce
**Criado**: 12/04/2026
**Atualizado**: 15/04/2026

---

## 🧠 Contexto BMAD
A arquitetura do Marketplace é o que viabiliza o "Breakthrough de Apoio Externo". No BMAD, a infraestrutura deve garantir transações seguras e um fluxo de serviço fluido entre o cliente (Aspirante) e o provedor (Mentor/Advogado).

## Conteúdo

### Componentes de Sistema
- **MedusaJS**: Motor Headless de e-commerce que gerencia produtos (serviços), pedidos e clientes.
- **Stripe Connect**: Gerencia o split de pagamentos e repasses para provedores de forma automática e complacente.
- **Relacionamento Compass-Marketplace**: O Compass atua como a interface de consumo e agendamento para os serviços comprados.

### Fluxos Críticos
1. **Descoberta**: Navegação por categorias de especialistas (Imigração, Carreira, Idiomas).
2. **Checkout**: Transação via Stripe com retenção de comissão Olcan.
3. **Escalonamento**: Dashboard do provedor para gestão de sessões e documentos.

## 🔗 Referências Relacionadas
- [[02_Arquitetura_Compass/Plano_de_Integracao_Marketplace]]
- [[02_Arquitetura_Compass/Arquitetura_Sistemas_Olcan]]
