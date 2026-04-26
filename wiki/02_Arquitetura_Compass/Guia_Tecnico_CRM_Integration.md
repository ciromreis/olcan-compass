---
title: Guia Técnico CRM Integration
type: drawer
layer: 2
status: active
last_seen: 2026-04-17
backlinks:
  - Arquitetura_v2_5_Compass
  - Verdade_do_Produto
---

# Guia Técnico: Integração CRM (Twenty + Mautic)

**Resumo**: Detalhamento técnico da arquitetura de sincronização entre o ecossistema Olcan, o Twenty CRM (Gestão de Staff) e o Mautic (Automação de Marketing).
**Importância**: Crítica (Dados & Operações)
**Status**: Ativo
**Camada (Layer)**: Arquitetura / Integração
**Tags**: #crm #twenty #mautic #sincronização #api #webhooks
**Criado**: 15/04/2026

---

## ⚠️ Disambiguação Crítica: Twenty CRM vs. Mautic

**Este é o erro conceitual mais comum. Leia antes de qualquer implementação.**

| Dimensão | Twenty CRM | Mautic |
|---|---|---|
| **Propósito** | Operações internas de staff e vendas | Automação de marketing e nutrição de leads |
| **Usuários** | Time interno Olcan (vendas, CS, gestão) | Usuários externos (leads, prospects, clientes) |
| **Domínio** | `staff.olcan.com.br` (portal interno) | `mautic.olcan.com.br` |
| **Casos de uso** | Pipelines de vendas, notas de conta, gestão de parceiros | Sequências de email, lead scoring, tags de atribuição, campanhas |
| **Substitui o outro?** | **NÃO** | **NÃO** |

**Twenty CRM não é um substituto do Mautic.** São ferramentas complementares com audiências e objetivos distintos. A confusão entre elas resulta em features desativadas sem motivo e arquitetura inconsistente.

**Variáveis de ambiente obrigatórias para Twenty:**
```env
TWENTY_BASE_URL=https://twenty.olcan.com.br
TWENTY_API_KEY=<api_key>
```
**Status de ativação:** Manter `FEATURE_CRM_SYNC_QUEUE_ENABLED=false` até o core atingir estabilidade de receita. Não ativar prematuramente.

---

## 🏗️ Arquitetura de Sincronização

O sistema foi desenhado para manter o **Compass App v2.5** como a fonte da verdade para autenticação, enquanto delega a gestão de relacionamento e marketing para ferramentas especializadas.

### Componentes:
- **Compass API (v2.5)**: Orquestrador central. Todo fluxo passa por aqui — nenhum CRM fala diretamente com o app.
- **Twenty CRM**: Control plane para o staff (pipelines de vendas, notas, gestão de parceiros e equipes).
- **Mautic**: Automação de leads externos, tags de atribuição e campanhas de email de marketing.

---

## 💾 Esquema de Identidade (crm_identity_links)
Para garantir que um usuário no Compass seja o mesmo no Twenty e no Mautic, utilizamos uma tabela de mapeamento:

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `user_id` | UUID | Referência ao usuário no Compass. |
| `system` | String | 'twenty' ou 'mautic'. |
| `external_id` | String | ID do registro no sistema externo. |
| `external_url` | String | Link direto para o registro no CRM. |

---

## 🚦 Feature Flags e Segurança
A sincronização é **desativada por padrão** para proteger a integridade do sistema v2 estável. Ative via variáveis de ambiente:

- `FEATURE_CRM_SYNC_REGISTRATION_ENABLED`: Sincroniza no cadastro.
- `FEATURE_CRM_SYNC_EMAIL_VERIFICATION_ENABLED`: Sincroniza após verificação.
- `FEATURE_CRM_SYNC_SUBSCRIPTION_ENABLED`: Sincroniza mudanças de plano.
- `FEATURE_CRM_SYNC_QUEUE_ENABLED`: Utiliza Celery para processamento em background (Recomendado).

---

## 🛠️ Endpoints de Administração
Operações manuais de sincronização (exige papel `SUPER_ADMIN`):
- `POST /api/admin/crm/twenty/users/{user_id}/sync`
- `GET /api/admin/crm/users/{user_id}/crm-links`
- `POST /api/admin/crm/bulk-sync/historical-users`

---

## 🔗 Referências Relacionadas
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass.md]]
- [[00_Onboarding_Inicio/Checklist_Seguranca_Compass.md]]
