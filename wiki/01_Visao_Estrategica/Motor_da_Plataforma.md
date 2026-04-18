---
title: Motor da Plataforma Olcan
type: drawer
layer: 1
status: active
last_seen: 2026-04-17
backlinks:
  - Olcan_Master_PRD_v2_5
  - Verdade_do_Produto
  - Carta_do_Projeto_Olcan_v2_5
---

# Motor da Plataforma Olcan (Platform Engine)

**Resumo**: Especificação técnica e estratégica do "motor" que impulsiona a plataforma Olcan, detalhando a orquestração de APIs, dados e fluxos de automação.
**Importância**: Alto
**Status**: Arquivado (Visão Original)
**Camada (Layer)**: Arquitetura
**Tags**: #motor #engine #plataforma #automação #n8n #mautic
**Criado**: 2024 (Original)
**Atualizado**: 15/04/2026 (Migrado para Wiki)

---

## 🧠 Contexto BMAD
O Motor da Plataforma é o "Coração do Pipeline". No BMAD, a eficiência do motor define a escalabilidade do negócio. Esta visão original detalha como n8n, Mautic e a API Olcan devem trabalhar em harmonia para que o breakthrough do usuário seja automatizado e personalizado.

## Conteúdo

### Componentes do Motor
- **Orquestração de Dados (n8n)**: O cérebro invisível que conecta compras (Stripe/Hotmart) a permissões no app e comunicações via CRM.
- **Marketing Automation (Mautic)**: Gerenciamento de leads e nutrição baseada no arquétipo Olcan Compass Core.
- **Payload CMS**: A fonte da verdade para conteúdos dinâmicos do website e blog.
- **Next.js Engine**: A interface de alta performance que entrega a experiência Liquid Glass.

### Lógica de Interrupção Contextual
O motor não apenas entrega conteúdo; ele "interrompe" o usuário estrategicamente baseado em onde ele está no funil (THINK, WRITE, ACT, MOVE), oferecendo o produto certo na hora certa.

## 🔗 Referências Relacionadas
- [[01_Visao_Estrategica/Matriz_Olcan_Original]]
- [[02_Arquitetura_Compass/Arquitetura_Sistemas_Olcan]]
- [[02_Arquitetura_Compass/Scripts_de_Automacao]]
