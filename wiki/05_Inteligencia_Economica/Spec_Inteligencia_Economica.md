# Inteligência Econômica: O Motor de Arbitragem Codificada

---
title: Spec Inteligência Econômica
type: drawer
layer: 05
status: active
last_seen: 2026-04-17
backlinks:
  - Olcan_Master_PRD_v2_5
  - Verdade_do_Produto
---

**Resumo**: Detalhamento da engenharia econômica do Olcan Compass, incluindo custos de oportunidade, sistemas de escrow por performance e simulação de cenários ótimos.
**Importância**: Crítica (Diferencial Competitivo)
**Status**: Ativo
**Camada (Layer)**: Negócio / Algoritmos
**Tags**: #economia #finanças #escrow #pareto #arbitragem #momentum
**Criado**: 15/04/2026

---

## 💰 1. Custo de Oportunidade (Opportunity Cost)
O sistema calcula em tempo real o custo financeiro de "não agir". Esta métrica é utilizada para converter usuários gratuitos em assinantes Pro/Premium através da visualização da perda latente.

### Lógica de Cálculo:
- **Daily Cost**: Diferença entre o `target_salary` (objetivo do usuário no exterior) e o `current_salary` (salário atual), dividida pelo tempo de antecipação que o Compass proporciona.
- **Widget de Momentum**: Exibe o "Custo Acumulado da Inação" no Dashboard, incentivando o avanço nos milestones.

---

## 🔒 2. Sistema de Escrow por Performance
Diferente de marketplaces tradicionais, o Olcan Compass utiliza um modelo de **Pagamento Vinculado a Resultados**.

### Regras de Release:
- Os fundos pagos por um usuário a um mentor/vendedor ficam retidos em **Escrow**.
- **Condição de Liberação**: Melhoria comprovada no status de "Readiness" (ex: aumento de 10% na nota de entrevista ou ajuste de 20% no CV via AI Scoring).
- **Resolution**: Caso a melhoria não ocorra conforme a `release_condition`, o sistema inicia a arbitragem automática para reembolso ou crédito.

---

## 🗺️ 3. Simulador de Fronteira de Pareto
Um algoritmo de otimização multivariada que ajuda o usuário a tomar decisões baseadas em restrições reais.

### Variáveis de Entrada:
- **Budget Max**: Orçamento total disponível.
- **Time Available**: Tempo (em meses) até o objetivo.
- **Skill Level**: Nível de proficiência atual (idioma/técnico).

### Output (Oportunidades Pareto-Ótimas):
O sistema filtra milhares de rotas para exibir apenas aquelas que oferecem o **melhor retorno (salário/sucesso) para o menor custo/risco**, eliminando a paralisia de decisão.

---

## 📊 4. Métricas de Analytics Admin
Para a gestão master, o sistema monitora:
- `roi_economico`: Retorno sobre investimento do desenvolvimento.
- `escrow_release_rate`: Taxa de sucesso dos parceiros em entregar resultados.
- `decision_quality_score`: Mede quão "ótimas" são as escolhas feitas pelos usuários após usar o simulador.

---

## 🔗 Referências Relacionadas
- [[03_Produto_Forge/Spec_Inteligencia_Economica]] — **spec básica** (objetivos e contexto do módulo — leia primeiro)
- [[01_Visao_Estrategica/Visao_Mestra_CEO]] — KPIs de sucesso do sistema econômico
- [[03_Produto_Forge/PRD_Geral_Olcan]] — PRD geral do produto
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass]] — arquitetura técnica

## Ligações
- [[00_SOVEREIGN/Olcan_Master_PRD_v2_5]] ← PRD Master
- [[00_SOVEREIGN/Verdade_do_Produto]] ← Estado atual
