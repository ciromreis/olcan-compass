---
title: Especificação Simulador de Entrevista
type: drawer
layer: 3
status: active
last_seen: 2026-04-17
backlinks:
  - PRD_Geral_Olcan
  - Verdade_do_Produto
---

# Especificação: Simulador de Entrevista

**Resumo**: Requisitos técnicos para o simulador de entrevista baseado em IA e voz, focado em preparar o usuário para processos seletivos internacionais.
**Importância**: Médio
**Status**: Em Refinamento
**Camada (Layer)**: Execução
**Tags**: #entrevista #IA #voz #simulação #carreira
**Criado**: 24/03/2026
**Atualizado**: 15/04/2026

---

## 🧠 Contexto BMAD
O Simulador de Entrevista é o estágio final da "Execução" antes do mercado. No BMAD, ele resolve a ansiedade de performance do usuário. A capacidade de treinar em um ambiente seguro com feedback instantâneo de IA é um breakthrough crítico de confiança para o profissional.

## Conteúdo

### Funcionalidades Planejadas
- **Prática de Voz**: Diálogo em tempo real com IA focado em perguntas comportamentais e técnicas.
- **Feedback de Desempenho**: Análise de clareza, tom de voz e conteúdo das respostas.
- **Cenários por Indústria**: Entrevistas específicas para Tech, Finance, Marketing, etc.

### Arquitetura (Estágio Atual)
- Backend possui CRUD básico de sessões.
- **Pendente**: Integração com APIs de Speech-to-Text (Whisper) e Text-to-Speech (ElevenLabs).
- **Pendente**: Motor de prompt para análise de sentimento e correção gramatical.

## 🔗 Referências Relacionadas
- [[03_Produto_Forge/PRD_Geral_Olcan]]
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass]]
