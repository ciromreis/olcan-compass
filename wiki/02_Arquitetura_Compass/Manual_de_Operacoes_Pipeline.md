---
title: Manual de Operações Pipeline
type: drawer
layer: 2
status: active
last_seen: 2026-04-17
backlinks:
  - Arquitetura_v2_5_Compass
  - Verdade_do_Produto
---

# Manual de Operações: Pipeline e Automação

**Resumo**: Guia prático sobre os scripts de automação do monorepo, facilitando o deploy rápido, build de componentes e orquestração de serviços.
**Importância**: Alto (DevOps)
**Status**: Ativo
**Camada (Layer)**: Infraestrutura / Operações
**Tags**: #pipeline #deploy #build #bash #monorepo #pnpm
**Criado**: 15/04/2026

---

## 🚀 Scripts de Orquestração (2_Pipelines)

O projeto utiliza uma série de scripts Bash para simplificar tarefas complexas de ambiente monorepo.

### 1. Início Rápido (START_APPLICATION.sh)
Orquestra o levantamento simultâneo do Backend e Frontend em modo de desenvolvimento.
- **Backend (API)**: Porta 8000.
- **Frontend**: Porta 3000.
- **Funcionalidade**: Cria arquivos `.env.local` e `.env` (backend) automaticamente se não existirem.

### 2. Build de Componentes UI (BUILD_UI_COMPONENTS.sh)
Sincroniza e empacota os componentes da biblioteca `@olcan/ui-components`.
- **Nota Técnica**: Este script realiza um "bypass" de problemas de TypeScript copiando arquivos diretamente para a pasta `dist` e injetando um `package.json` limpo. Vital para evitar quebra de builds durante a iteração rápida.

### 3. Build e Execução Full (BUILD_AND_RUN.sh)
Fluxo completo de produção local:
1. Instalação de dependências via `pnpm install`.
2. Build do frontend Next.js (bypassando ESLint para velocidade).
3. Instalação de dependências do Python.
4. Setup de ambiente.
5. Início dos serviços.

---

## 🛠️ Portas e Serviços Locais

| Serviço | Porta | Endpoint de Saúde | Docs |
| :--- | :--- | :--- | :--- |
| **Frontend** | 3000 | `/` | - |
| **API API-Core-V2** | 8000 | `/health` | `/docs` (Swagger) |
| **PostgreSQL** | 5432 | - | - |
| **Redis** | 6379 | - | - |

---

## 📋 Passo a Passo para Novo Ambiente (Dev)

1. Certifique-se de que o **Docker** (para Postgres e Redis) está rodando.
2. Execute o script de setup inicial:
   ```bash
   bash 2_Pipelines/scripts/QUICK_DEPLOY.sh
   ```
3. Inicie o sistema:
   ```bash
   bash 2_Pipelines/scripts/START_APPLICATION.sh
   ```

---

## 🔗 Referências Relacionadas
- [[02_Arquitetura_Compass/Guia_de_Deployment_Compass.md]]
- [[02_Arquitetura_Compass/Scripts_Operacionais_API.md]]
