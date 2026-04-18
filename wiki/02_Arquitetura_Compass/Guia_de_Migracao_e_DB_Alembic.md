---
title: Guia de Migração DB Alembic
type: drawer
layer: 2
status: active
last_seen: 2026-04-17
backlinks:
  - Arquitetura_v2_5_Compass
  - Verdade_do_Produto
---

# Guia de Migração de Banco de Dados (Alembic)

**Resumo**: Manual técnico para gerenciar evoluções do esquema do banco de dados PostgreSQL utilizando Alembic, incluindo fluxos de criação, revisão e execução de migrações.
**Importância**: Alto
**Status**: Ativo
**Camada (Layer)**: Backend / Database
**Tags**: #alembic #postgresql #migration #database #backend #sql
**Criado**: 12/03/2026
**Atualizado**: 15/04/2026

---

## 🛠️ Workflow de Migração

### Passo 1: Definir Modelos
Novos modelos devem ser criados em `app/models/` e importados no `__init__.py` do pacote de modelos para que o Alembic os detecte.

### Passo 2: Gerar Migração
```bash
cd apps/api-core-v2
# Gerar automaticamente a partir das mudanças nos modelos
alembic revision --autogenerate -m "Adicionar modelos v2.5: documentos, marketplace, social"
```

### Passo 3: Revisar e Executar
Sempre revise o arquivo gerado em `alembic/versions/` antes de aplicar:
```bash
# Aplicar migração à base
alembic upgrade head

# Verificar status atual
alembic current
```

---

## 🚀 Índices Recomendados para v2.5

Para garantir a performance do app, os seguintes índices devem ser criados:
- **Documents**: `ix_documents_user_id`, `ix_documents_status`.
- **Interviews**: `ix_interviews_user_id`, `ix_interviews_type`.
- **Social**: `ix_activities_user_id`, `ix_notifications_is_read`.

---

## 🚨 Troubleshooting
- **Erro: Enum already exists**: Use `DROP TYPE IF EXISTS ... CASCADE;` manualmente antes de re-rodar se houver falha parcial.
- **Rollback**: Use `alembic downgrade -1` para desfazer a última mudança.

## 🔗 Referências Relacionadas
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass.md]]
- [[02_Arquitetura_Compass/Scripts_Operacionais_API.md]]
