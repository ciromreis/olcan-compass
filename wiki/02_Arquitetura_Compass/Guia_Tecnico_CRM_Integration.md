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

## 🏗️ Arquitetura de Sincronização

O sistema foi desenhado para manter o **Compass App v2.5** como a fonte da verdade para autenticação, enquanto delega a gestão de relacionamento e marketing para ferramentas especializadas.

### Componentes:
- **Compass API (v2.5)**: Orquestrador central.
- **Twenty CRM**: Control plane para o staff (pipelines, notas, gestão de usuários).
- **Mautic**: Automação de leads, tags de atribuição e campanhas de email.

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
