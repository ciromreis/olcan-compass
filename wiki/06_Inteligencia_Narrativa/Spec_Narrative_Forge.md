# Inteligência Narrativa: O Cérebro de IA do Forge

---
title: Spec Narrative Forge
type: drawer
layer: 06
status: active
last_seen: 2026-04-17
backlinks:
  - Olcan_Master_PRD_v2_5
  - Verdade_do_Produto
---

**Resumo**: Documentação dos modelos e métricas de IA utilizados para avaliar documentos, cartas de intenção e sessões de simulação de entrevista.
**Importância**: Alto (Qualidade de Entrega)
**Status**: Ativo
**Camada (Layer)**: Inteligência Artificial / Produto
**Tags**: #narrativa #ia #scoring #forge #autenticidade #feedback
**Criado**: 15/04/2026

---

## 🧠 1. Framework de Avaliação de IA
O Olcan Compass utiliza modelos de linguagem (GPT-4/Claude 3.5) customizados para analisar a "Verdade Narrativa" do usuário. Cada documento ou resposta de entrevista recebe um score baseado em 4 eixos:

- **Clarity (Clareza)**: O quão direta e compreensível é a comunicação.
- **Coherence (Coerência)**: A consistência lógica entre os marcos da carreira do usuário e o objetivo pretendido.
- **Alignment (Alinhamento)**: O fit cultural com a instituição ou país de destino.
- **Authenticity (Autenticidade)**: A presença de evidências específicas que afastam o texto de respostas genéricas.

---

## 🚩 2. Análise de Risco e Polimento
O sistema detecta automaticamente padrões que podem "queimar" o perfil do usuário em processos seletivos reais:

- **Cliche Density (Densidade de Clichês)**: Identifica frases batidas (ex: "thinking out of the box", "team player") e sugere substituições por evidências quantificáveis.
- **Authenticity Risk**: Flag acionada quando o texto parece excessivamente "gerado por IA" ou carece de voz própria.
- **Cultural Fit Score**: Analisa se o tom está adequado para o território (ex: Tom direto para Alemanha vs. Tom narrativo/Storytelling para EUA/Canadá).

---

## 🔄 3. Loop de Insights de Entrevista
A inteligência não avalia apenas o texto estático, mas também a evolução do usuário:

- **Evidence Coverage**: Mede se o usuário está utilizando todas as suas experiências catalogadas no OIOS durante as respostas.
- **Strongest Signals**: Melhores pontos de venda detectados pela IA.
- **Focus Areas**: Gaps de confiança ou hesitações (baseado em duração de resposta e hesitação semântica).

---

## 🏁 4. Exportação e Compartilhamento
Os documentos polidos pelo motor de narrativa podem ser exportados em múltiplos formatos (PDF, DOCX, Markdown), garantindo que a "Versão Mestra" esteja sempre disponível para aplicações reais.

---

## 🔗 Referências Relacionadas
- [[03_Produto_Forge/Spec_Narrative_Forge.md]]
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass.md]]
- [[05_Inteligencia_Economica/Spec_Inteligencia_Economica.md]]

## Ligações
- [[Olcan_Master_PRD_v2_5]] ← PRD Master
- [[Verdade_do_Produto]] ← Estado atual
