---
title: Referência de API Nexus Bridge
type: drawer
layer: 2
status: active
last_seen: 2026-04-17
backlinks:
  - Arquitetura_v2_5_Compass
  - Verdade_do_Produto
---

# Referência de API (Nexus Bridge)

**Resumo**: Documentação dos endpoints, padrões de requisição e respostas da API Core da Olcan, servindo como ponte para o App e Integrações.
**Importância**: Alto
**Status**: Ativo
**Camada (Layer)**: Execução
**Tags**: #api #referência #nexus #endpoints #backend
**Criado**: 12/04/2026
**Atualizado**: 15/04/2026

---

## 🧠 Contexto BMAD
A referência de API é a "Linguagem Comum" do ecossistema. No BMAD, APIs bem documentadas permitem que o Nexus (IA) orquestre dados entre o backend e o frontend de forma determinística, reduzindo erros de integração no Route OS.

## Conteúdo

### Padrões Globais
- **Base URL**: `https://api.olcan.com.br/api/v1`
- **Autenticação**: Bearer Token (JWT).
- **Formato**: JSON (snake_case no backend, camelCase no frontend bridge).

### Módulos Principais
- **Auth**: `/auth/login`, `/auth/register`.
- **Psych (OIOS)**: `/psych/assessment/start`, `/psych/assessment/submit`.
- **Forge**: `/forge/documents`, `/forge/polish`.
- **Companions (Aura)**: `/companions/core`, `/companions/activities`.

### Tratamento de Erros
- **401**: Token expirado ou inválido.
- **402**: Créditos insuficientes (específico para o Forge).
- **422**: Erro de validação de esquema Pydantic.

## 🔗 Referências Relacionadas
- [[02_Arquitetura_Compass/Arquitetura_Sistemas_Olcan]]
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass]]
