---
title: Integração Autenticação Unificada
type: drawer
layer: 2
status: active
last_seen: 2026-04-17
backlinks:
  - Arquitetura_v2_5_Compass
  - Verdade_do_Produto
---

# Integração de Autenticação Unificada

**Resumo**: Detalhes técnicos sobre o sistema de autenticação único (SSO) que conecta todos os apps do ecossistema Olcan (Compass, Forge, Marketplace, Marketing).
**Importância**: Alto
**Status**: Ativo
**Camada (Layer)**: Execução
**Tags**: #autenticação #segurança #JWT #SSO #integração
**Criado**: 12/04/2026
**Atualizado**: 15/04/2026

---

## 🧠 Contexto BMAD
A autenticação unificada elimina a fricção de "Identidade Fragmentada". No BMAD, a identidade do usuário (OIOS) deve ser persistente e reconhecida em todos os pontos de contato da marca, garantindo uma experiência contínua e segura.

## Conteúdo

### Mecanismo de Auth
- **Tecnologia**: Protocolo JWT (JSON Web Tokens).
- **Shared Secrets**: Todos os serviços compartilham a chave de validação de tokens para reconhecimento imediato.
- **Cross-Domain**: Cookies seguros e mecânica de redirecionamento para transição entre subdomínios (ex: `site.olcan.com.br` -> `app.olcan.com.br`).

### Fluxo do Usuário
- Registro no Landing Page ou App gera uma entrada única na tabela `users` da API Core.
- Login no Compass libera automaticamente o acesso às funcionalidades de polimento no Forge.

## 🔗 Referências Relacionadas
- [[02_Arquitetura_Compass/Referencia_de_API]]
- [[02_Arquitetura_Compass/Arquitetura_Sistemas_Olcan]]
