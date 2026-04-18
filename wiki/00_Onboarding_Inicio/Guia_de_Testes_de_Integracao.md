---
title: Guia de Testes de Integração
type: drawer
layer: 8
status: active
last_seen: 2026-04-17
backlinks:
  - Verdade_do_Produto
  - Padroes_de_Codigo
---

# Guia de Testes de Integração

**Resumo**: Protocolo para testar as conexões entre o frontend (Next.js) e as APIs de backend (FastAPI/Medusa), garantindo a integridade do fluxo de dados.
**Importância**: Alto
**Status**: Ativo
**Camada (Layer)**: Execução
**Tags**: #testes #integração #backend #frontend #dados #contrato
**Criado**: 12/04/2026
**Atualizado**: 15/04/2026

---

## 🧠 Contexto BMAD
Testes de integração resolvem o problema de "Sistemas Desconectados". No BMAD, a integridade do contrato entre o cliente e o servidor é vital para que a orquestração do Nexus não sofra com quebras de esquema (schema shifts) que degradem a experiência do usuário.

## Conteúdo

### Escopo de Testes
- **Validação de Schema**: Garantir que o frontend envie e receba dados conforme definido pelo Pydantic no backend.
- **Fluxo de Autenticação**: Validar o ciclo de vida do Token JWT entre todos os subdomínios.
- **Billing Integration**: Simulação de sucesso/falha de webhooks do Stripe.

### Procedimentos
- Uso de MSW (Mock Service Worker) para interceptar requisições em ambiente de desenvolvimento.
- Testes de contrato automatizados para detectar mudanças quebrando a API.

## 🔗 Referências Relacionadas
- [[00_Onboarding_Inicio/Guia_de_Testes_Geral]]
- [[02_Arquitetura_Compass/Referencia_de_API]]
