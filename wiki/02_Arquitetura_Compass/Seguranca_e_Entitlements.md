---
title: Segurança e Entitlements
type: drawer
layer: 2
status: active
last_seen: 2026-04-17
backlinks:
  - Arquitetura_v2_5_Compass
  - Runbook_de_Deployment
  - Verdade_do_Produto
---

# Segurança: Sistema de Entitlements (Paywall Enforcement)

**Resumo**: Detalhamento técnico da lógica de proteção de recursos e planos (Paywall) implementada no Backend para evitar bypass do lado do cliente.
**Importância**: Crítica (Segurança e Revenue)
**Status**: Ativo
**Camada (Layer)**: Backend / Segurança
**Tags**: #seguranca #entitlements #paywall #backend #python #fastapi
**Criado**: 15/04/2026
**Atualizado**: 17/04/2026

---

## 🔐 Filosofia de Segurança
Diferente da v2 estável, onde algumas verificações eram puramente de UI, a arquitetura v2.5 adota o **Server-Side Enforcement**. 

A premissa é simples: **O Frontend sugere permissão, o Backend a impõe.**

---

## 🛡️ Mecanismos de Proteção

### 1. Dependências de Rota (FastAPI)
Utilizamos o padrão de injeção de dependências do FastAPI para proteger endpoints sensíveis.

```python
# Exemplo de Proteção no Backend
@router.post("/narrative-forge/generate")
async def generate_narrative(
    user: User = Depends(get_current_user),
    _: None = Depends(require_plan(UserPlan.PRO)) # Impõe plano PRO
):
    ...
```

### 2. Limites de Recursos (Quotas)
Para recursos como geração de documentos no Forge ou AI Interviews, implementamos contadores no banco de dados sincronizados por Redis.

| Recurso | Plano Free | Plano Pro | Handled By |
| :--- | :--- | :--- | :--- |
| Documentos Forge | 1 ativo | Ilimitado | `quota_manager` |
| AI Interviews | 1/mês | 10/mês | `usage_tracker` |
| Mestre Nexus | Apenas Visual | Visual + Edit | `require_plan` |

---

## 🚦 Tabela de Permissões (Entitlements)

| Código da Permissão | Descrição | Nível Mínimo |
| :--- | :--- | :--- |
| `FORGE_CREATE` | Criar novos rascunhos no Forge. | FREE |
| `FORGE_EXPORT_PDF` | Exportar documentos em alta qualidade. | PRO |
| `NEXUS_FLOW_EDIT` | Editar fluxos de agentes no Nexus. | ADMIN / CEO |
| `COMPASS_ALPHA_ACCESS`| Acesso a features experimentais (Aura v3). | EARLY_ADOPTER |

---

## 🛠️ Debugging e Override
Em ambiente de desenvolvimento, os entitlements podem ser simulados via `X-Debug-Plan` header, mas apenas se `ENVIRONMENT=development`.

---

## 🔗 Referências Relacionadas
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass.md]]
- [[03_Produto_Forge/Blueprint_Sistema_de_Tarefas.md]]
