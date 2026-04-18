---
title: Guia de Testes Geral
type: drawer
layer: 8
status: active
last_seen: 2026-04-17
backlinks:
  - Padroes_de_Codigo
---

# Guia de Testes Geral (Testing Framework)

**Resumo**: Manual abrangente sobre a filosofia, ferramentas e procedimentos de teste no ecossistema Olcan, cobrindo testes unitários, de integração e manuais.
**Importância**: Alto
**Status**: Ativo
**Camada (Layer)**: Execução
**Tags**: #testes #QA #qualidade #automação #manual #estratégia
**Criado**: 24/03/2026
**Atualizado**: 17/04/2026

---

## 🧠 Contexto BMAD
O Guia de Testes é a "Garantia de Breakthrough". No BMAD, a velocidade de desenvolvimento nunca deve sacrificar a estabilidade. Este guia assegura que cada salto técnico seja verificado, permitindo que a IA e os humanos confiem na integridade de cada entrega.

## Conteúdo

### Pirâmide de Testes Olcan
1. **Unitários**: Testes de funções isoladas e componentes (Jest/Vitest).
2. **Integração**: Testes de fluxos entre frontend e backend.
3. **E2E (Ponta-a-Ponta)**: Simulação completa do usuário (Playwright/Cypress).
4. **Manuais (Humanos)**: Validação qualitativa e UX.

### Ferramentas Utilizadas
- **Frontend**: Vitest, React Testing Library, Playwright.
- **Backend**: Pytest, Pydantic (validação de tipos).
- **CI/CD**: GitHub Actions executando suítes de teste em cada PR.

### Padrão de Escrita
- Testes devem ser descritivos e focar no comportamento, não na implementação.
- Mocking de APIs externas é obrigatório para testes unitários.

## 🔗 Referências Relacionadas
- [[00_Onboarding_Inicio/Plano_de_Testes_E2E]]
- [[00_Onboarding_Inicio/Guia_de_Testes_Humanos]]
- [[00_Onboarding_Inicio/Guia_de_Avaliacao_Tecnica]]
