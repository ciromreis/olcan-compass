---
title: Plano de Testes E2E
type: drawer
layer: 8
status: active
last_seen: 2026-04-17
backlinks:
  - Verdade_do_Produto
  - Padroes_de_Codigo
---

# Plano de Testes E2E (End-to-End)

**Resumo**: Estratégia e suíte de testes ponta-a-ponta utilizando Playwright para validar os fluxos críticos do usuário no App Compass v2.5.
**Importância**: Alto
**Status**: Ativo
**Camada (Layer)**: Execução
**Tags**: #testes #E2E #playwright #automação #fluxos-críticos
**Criado**: 12/04/2026
**Atualizado**: 15/04/2026

---

## 🧠 Contexto BMAD
O Plano de Testes E2E é a "Simulação de Realidade". No BMAD, garantir que o usuário consiga completar o registro, realizar o quiz e usar o Forge sem erros é a prova definitiva de que o breakthrough entregue é robusto e está pronto para o mundo real.

## Conteúdo

### Fluxos Prioritários
1. **Onboarding**: Cadastro -> Login -> Quiz OIOS -> Resultado de Arquétipo.
2. **Narrative Forge**: Seleção de Documento -> AI Polish -> Verificação de Créditos -> Exportação.
3. **Aura Companion**: Visualização de HUD -> Atividade de Cuidado (Nutrir) -> Evolução de XP.

### Execução Técnica
- **Tooling**: Playwright com suporte a múltiplos navegadores (Chromium, Firefox, Webkit).
- **Environment**: Rodar contra Staging antes de cada release para Produção.
- **Reporting**: Geração de traces e screenshots automáticos em caso de falha.

## 🔗 Referências Relacionadas
- [[00_Onboarding_Inicio/Guia_de_Testes_Geral]]
- [[00_Onboarding_Inicio/Guia_de_Testes_de_Integracao]]
