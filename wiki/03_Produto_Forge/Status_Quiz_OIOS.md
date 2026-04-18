---
title: Status Quiz OIOS
type: drawer
layer: 3
status: active
last_seen: 2026-04-17
backlinks:
  - PRD_Geral_Olcan
  - Verdade_do_Produto
---

# Status: Quiz de Diagnóstico Olcan Compass Core

**Resumo**: Estado atual da implementação técnica do Quiz Olcan Compass Core, integrando o diagnóstico psicológico de arquétipos ao backend do Olcan Compass.
**Importância**: Médio
**Status**: Concluído
**Camada (Layer)**: Identidade
**Tags**: #oios #quiz #diagnóstico #implementação #backend
**Criado**: 12/04/2026
**Atualizado**: 15/04/2026

---

## 🧠 Contexto BMAD
O Quiz Olcan Compass Core é o "Snapshot de Identidade" do usuário. No BMAD, a precisão deste diagnóstico é o que alimenta todo o motor de personalização subsequente. O status atual confirma que a ponte técnica entre as respostas do usuário e o armazenamento seguro na API Core está operacional.

## Conteúdo

### Implementação Técnica
- **Frontend**: Página `/onboarding/quiz` totalmente integrada com `apiClient.startPsychAssessment()`.
- **Backend**: Endpoints `POST /api/psych/assessment/*` montados e roteados.
- **Persistência**: Resultados salvos no `usePsychStore` e persistidos no PostgreSQL via `psycService`.

### Dados e Seeding
- **Questões**: Seed script configurado com 12 questões iniciais cobrindo clusters de medo e motivação.
- **Arquétipos**: Algoritmo de atribuição baseado em pontuação de clusters.

## 🔗 Referências Relacionadas
- [[04_Ecossistema_Aura/Especificacao_de_Arquitetos_Olcan Compass Core]]
- [[02_Arquitetura_Compass/Referencia_de_API]]
