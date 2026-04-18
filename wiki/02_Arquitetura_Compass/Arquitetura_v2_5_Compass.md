---
title: Arquitetura v2.5 Compass
type: drawer
layer: 2
status: active
last_seen: 2026-04-17
backlinks:
  - Olcan_Master_PRD_v2_5
  - Verdade_do_Produto
---

# Arquitetura Técnica: Olcan Compass v2.5

**Resumo**: Visão detalhada da arquitetura do sistema, mapeamento de banco de dados (19 migrações) e estratégia de integração de serviços.
**Importância**: Crítica (Manual do Arquiteto)
**Status**: Ativo
**Camada (Layer)**: Arquitetura / Backend
**Tags**: #arquitetura #backend #fastapi #postgresql #database #fragmentação
**Criado**: 14/04/2026
**Atualizado**: 17/04/2026

---

## 🏗️ Visão Geral do Sistema
O Olcan Compass v2.5 opera como um ecossistema de micro-serviços orquestrados por uma API central em FastAPI.

---

## 💾 Arquitetura de Dados (PostgreSQL)

### Análise de Fragmentação
> [!WARNING]
> Historicamente, o projeto sofria de fragmentação entre SQLite (dev) e PostgreSQL (prod). A arquitetura v2.5 impõe o uso unificado de PostgreSQL para garantir integridade referencial.

### Esquema Detalhado (19 Migrações Alembic)
As tabelas principais estão organizadas em clusters lógicos:

#### 1. Cluster de Identidade e Acesso
- `users`: Dados básicos, hashes de senha, roles e timestamps.
- `auth_tokens`: Sessões ativas e expiração.
- `verification_codes`: Purificadores de email e reset de senha.

#### 2. Cluster de Psicologia e Perfil (OIOS)
- `oios_profiles`: Resultados do quiz, arquétipo atribuído e scores brutos.
- `presence_phenotypes`: Traços derivados para personalização da Aura.

#### 3. Cluster de Jornada e Produto (Forge/Tasks)
- `routes`: Destino, status e progresso em marcos (milestones).
- `tasks`: Entidades de tarefas com suporte a XP.
- `subtasks`: Checklists operacionais.
- `documents`: O coração do Forge; armazena versões de CVs e cartas.

#### 4. Cluster de Gamificação (Aura)
- `user_progress`: Tabela central de XP, nível e streak.
- `achievements`: Catálogo de 21 conquistas predefinidas.
- `user_achievements`: Registro de desbloqueio de conquistas.

---

## 🔌 Estratégia de API
Utilizamos **Versionamento Baseado em URL** (`/api/v1/*`) para garantir que novas iterações não quebrem as integrações existentes com o Marketplace ou o App Mobile v2.

---

## Ligações
- [[Olcan_Master_PRD_v2_5]] ← PRD Master
- [[Verdade_do_Produto]] ← Estado real

## 🔗 Referências Relacionadas
- [[02_Arquitetura_Compass/Guia_de_Operacoes_Database.md]]
- [[03_Produto_Forge/Blueprint_Sistema_de_Tarefas.md]]
- [[02_Arquitetura_Compass/Seguranca_e_Entitlements.md]]
