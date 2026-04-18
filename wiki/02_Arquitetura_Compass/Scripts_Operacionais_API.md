---
title: Scripts Operacionais da API
type: drawer
layer: 2
status: active
last_seen: 2026-04-17
backlinks:
  - Arquitetura_v2_5_Compass
  - Verdade_do_Produto
---

# Scripts Operacionais da API

**Resumo**: Catálogo de scripts utilitários e de depuração localizados em `apps/api-core-v2/scripts`, abrangendo seeding de dados, manutenção de usuários e debug.
**Importância**: Médio
**Status**: Ativo
**Camada (Layer)**: Backend / Ops
**Tags**: #scripts #api #backend #seeding #debug #manutenção
**Criado**: 05/04/2026
**Atualizado**: 15/04/2026

---

## 📂 Estrutura de Scripts

- **`seed/`**: Utilitários para popular o banco de dados com dados iniciais (templates de documentos, questões de entrevista).
- **`admin/`**: Scripts para manutenção de usuários, permissões e ajustes de créditos (Forge).
- **`debug/`**: Scripts para testar mapeamentos de dados e importações complexas.

---

## 📋 Como Executar
Os scripts devem ser executados a partir da raiz do app da API para garantir que as importações de módulos funcionem:

```bash
cd apps/api-core-v2
python scripts/seed/seed_data.py
```

## 🔗 Referências Relacionadas
- [[02_Arquitetura_Compass/Guia_de_Migracao_e_DB_Alembic.md]]
- [[02_Arquitetura_Compass/Scripts_de_Automacao]]
