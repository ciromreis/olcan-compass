# QA: Guia de Testes Automatizados por IA

---
title: Testes Automatizados AI
type: drawer
layer: 07
status: active
last_seen: 2026-04-17
backlinks:
  - Olcan_Master_PRD_v2_5
  - Verdade_do_Produto
---

**Resumo**: Metodologia e implementação do sistema de QA (Garantia de Qualidade) que utiliza Agentes de IA e Playwright para simular comportamentos reais e validar o Olcan Compass.
**Importância**: Médio (Confiabilidade)
**Status**: Ativo
**Camada (Layer)**: Operações / QA
**Tags**: #qa #testes #playwright #ia #e2e #performance
**Criado**: 15/04/2026

---

## 🤖 Filosofia de Testes por IA
No Olcan Compass, não testamos apenas cliques; testamos a **Jornada do Usuário**. Utilizamos o Playwright aliado a agentes de IA para identificar fricções de UX, lentidão e erros lógicos antes que cheguem ao usuário final.

---

## 🛤️ Jornadas Críticas Automáticas (P0)

O sistema de QA executa diariamente os seguintes fluxos:

1.  **Fluxo de Registro**: Landing Page → Sign up → Verificação → Login.
2.  **Fluxo Diagnostic Mirror (OIOS)**: Início do quiz → Resposta das 12 perguntas → Atribuição de Arquétipo.
    - *KPI*: O tempo total não deve exceder 5 minutos.
3.  **Fluxo Narrative Forge**: Criação de documento → Polimento por IA → Exportação PDF.
4.  **Fluxo Marketplace / Checkout**: Visualização de planos → Seleção → Simulação de Checkout.

---

## 🛠️ Implementação Técnica

### Stack:
- **Playwright**: Automação de browser (Chromium, Webkit, Mobile).
- **AI Scenario Generator**: Agentes que criam casos de teste baseados em User Stories.
- **AI Analysis**: Pós-processamento dos resultados para gerar insights de correção.

### Comandos Principais:
```bash
# Executar todos os testes E2E
npx playwright test

# Ver relatório visual de falhas
npx playwright show-report
```

---

## 📊 Benchmarks de Performance
Os testes automáticos também monitoram a saúde do sistema:
- **Páginas**: Devem carregar em menos de 3 segundos.
- **API**: Respostas devem ser inferiores a 1 segundo.
- **Acessibilidade**: Validação automática de contraste e navegação via teclado.

---

## 🖼️ Testes Visuais (Regression)
Utilizamos comparação de screenshots para garantir que atualizações no código não quebrem a estética **Ethereal Glass**. Qualquer desvio visual acima de 100 pixels é sinalizado para revisão manual.

---

## 🔗 Referências Relacionadas
- [[00_Onboarding_Inicio/Runbook_de_Deployment.md]]
- [[03_Produto_Forge/PRD_Master_Ethereal_Glass.md]]
- [[02_Arquitetura_Compass/Guia_Mestre_Design_System_Master.md]]

## Ligações
- [[Olcan_Master_PRD_v2_5]] ← PRD Master
- [[Verdade_do_Produto]] ← Estado atual
