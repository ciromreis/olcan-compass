---
title: Guia de Operações Database
type: drawer
layer: 2
status: active
last_seen: 2026-04-17
backlinks:
  - Arquitetura_v2_5_Compass
  - Runbook_de_Deployment
---

# Guia de Operações: Banco de Dados e API

**Resumo**: Manual operacional para gestão de dados, seeding de ambiente e estratégia de versionamento de API.
**Importância**: Alto (Operacional)
**Status**: Ativo
**Camada (Layer)**: Backend / Infraestrutura
**Tags**: #database #postgres #seeding #backup #api #versionamento #alembic
**Criado**: 15/04/2026
**Atualizado**: 17/04/2026

---

## 🌱 Seeding de Ambiente (População Inicial)
Para preparar um novo ambiente de desenvolvimento ou staging, execute os scripts de seeding na ordem abaixo:

1.  **Arquétipos e Perguntas (OIOS)**:
    `python scripts/seed_archetypes.py`
    `python scripts/seed_psychology_questions.py`
2.  **Gamificação e Conquistas**:
    `python scripts/seed_achievements.py` (Garante as 21 conquistas base).
3.  **Tarefas de Rota**:
    `python scripts/seed_task_templates.py` (Cria os roteiros táticos para Canadá, Alemanha, etc.).

---

## 🔧 Alembic Migrations (Required)

### Run Migrations
```bash
# Docker
docker compose run --rm api alembic upgrade head

# Local
cd apps/api-core-v2.5
alembic upgrade head
```

### Create Migration
```bash
alembic revision --autogenerate -m "description"
```

### Rollback
```bash
alembic downgrade -1
```

### Check Status
```bash
alembic current
alembic history
```

---

## 💾 Backup e Recuperação (Produção)
Configurado via CRON no servidor de produção:
- **Frequência**: Diária às 02:00 AM.
- **Retenção**: 30 dias de backups rotativos.
- **Script Base**: `scripts/backup_database.sh`.

### Como restaurar (Disaster Recovery):
```bash
pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME backup_file.dump
```

---

## 🚦 Estratégia de Versionamento de API
Adotamos o **versionamento via URL** para isolar mudanças quebrassem a compatibilidade.

### Padrão de URL:
- `/api/v1/*`: Endpoints legados da v1 (suporte a longo prazo).
- `/api/v2.5/*`: Versão atual (Forge, Aura, Marketplace).
- `/api/admin/*`: Endpoints de gestão master (exige role `MASTER_CEO`).

> [!TIP]
> Em caso de mudança de banco (schema), sempre crie uma nova migração Alembic (`alembic revision --autogenerate`) e teste em Staging por 24h antes de aplicar em produção.

---

## 🔗 Referências Relacionadas
- [[Arquitetura_v2_5_Compass]] ← Arquitetura principal
- [[Runbook_de_Deployment]] ← Deployment guide
- [[Verdade_do_Produto]] ← Estado atual
