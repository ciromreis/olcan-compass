---
title: Checklist de Segurança Compass
type: drawer
layer: 8
status: active
last_seen: 2026-04-17
backlinks:
  - Verdade_do_Produto
  - Padroes_de_Codigo
---

# Checklist de Segurança: Olcan Compass

**Resumo**: Protocolo obrigatório de segurança para o App Compass, cobrindo autenticação, proteção de dados, variáveis de ambiente e conformidade LGPD.
**Importância**: Crítico
**Status**: Ativo
**Camada (Layer)**: Segurança / Backend
**Tags**: #segurança #security #checklist #lgpd #auth #backend
**Criado**: 10/04/2026
**Atualizado**: 15/04/2026

---

## 🛡️ Controles Críticos

### 1. Autenticação e Autorização (Auth)
- [ ] **MFA Obrigatório**: Ativado para todas as contas administrativas.
- [ ] **Segurança de Tokens**: JWTs assinados com segredo forte (`HS256` ou superior).
- [ ] **Expiração de Sessão**: Refresh tokens implementados com rotação.
- [ ] **Proteção de Rotas**: Middlewares de validação em todas as rotas de API `/api/*`.

### 2. Proteção de Dados e Privacidade (LGPD)
- [ ] **Criptografia em Repouso**: Dados sensíveis no Banco de Dados (PostgreSQL/Supabase) criptografados.
- [ ] **Anonimização**: Logs de erro não devem conter PII (Personal Identifiable Information).
- [ ] **Consentimento**: Banner de cookies e política de privacidade visíveis e funcionais.
- [ ] **Direito de Exclusão**: Fluxo para deletar dados do usuário conforme solicitação.

### 3. Infraestrutura e Variáveis (Env)
- [ ] **Sem Segredos no Git**: Varredura de `.env` e chaves de API concluída.
- [ ] **HTTPS/SSL**: Forçado em todo o domínio e subdomínios.
- [ ] **CORS**: Configurado estritamente para os domínios `olcan.com.br`.
- [ ] **Rate Limiting**: Aplicado para prevenir ataques de força bruta no login e formulários.

---

## 🚨 Plano de Resposta a Incidentes
1. **Identificação**: Alerta via Sentry ou monitoramento de tráfego.
2. **Contenção**: Revogação imediata de chaves comprometidas e isolamento de serviços.
3. **Erradicação**: Patching da vulnerabilidade.
4. **Recuperação**: Restauração de backups e monitoramento intensivo.

---

## 🔗 Referências Relacionadas
- [[02_Arquitetura_Compass/Scripts_de_Automacao]]
- [[00_Onboarding_Inicio/Relatorio_de_Audit_Portugues.md]]
