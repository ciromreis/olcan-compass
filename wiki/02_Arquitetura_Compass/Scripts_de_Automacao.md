---
title: Scripts de Automação Pipelines
type: drawer
layer: 2
status: active
last_seen: 2026-04-17
backlinks:
  - Arquitetura_v2_5_Compass
  - Verdade_do_Produto
---

# Scripts de Automação (Pipelines)

**Resumo**: Documentação dos utilitários de linha de comando para automação de build, deployment e execução dos serviços do ecossistema Olcan.
**Importância**: Alto
**Status**: Ativo
**Camada (Layer)**: Execução
**Tags**: #automação #scripts #bash #build #deploy #devops
**Criado**: 12/04/2026
**Atualizado**: 15/04/2026

---

## 🧠 Contexto BMAD
Os scripts de automação são os "Pipelines" que viabilizam o fluxo contínuo de valor no BMAD. Eles reduzem o erro humano e garantem que o ambiente de desenvolvimento e produção sejam configurados de forma idêntica, permitindo que os breakthroughs sejam testados e entregues com rapidez e segurança.

## Conteúdo

### Principais Scripts (`2_Pipelines/scripts/`)

#### 1. `START_APPLICATION.sh`
- **Função**: Inicia o backend (FastAPI) e o frontend (Next.js) simultaneamente.
- **Uso**: `./2_Pipelines/scripts/START_APPLICATION.sh`
- **Portas**: Frontend (3000), Backend (8000).

#### 2. `BUILD_AND_RUN.sh`
- **Função**: Executa o build completo do monorepo e inicia os serviços. Útil para validar mudanças estruturais antes do commit.

#### 3. `QUICK_DEPLOY.sh`
- **Função**: Script simplificado para instalação de dependências, build de pacotes UI e preparação de variáveis de ambiente.

#### 4. `BUILD_UI_COMPONENTS.sh`
- **Função**: Compila a biblioteca `@olcan/ui-components` dentro de `packages/` para que as mudanças visuais sejam refletidas nos apps.

### Variáveis de Ambiente
Os scripts geram automaticamente arquivos `.env.local` e `.env` com configurações padrão de desenvolvimento caso não existam.

## 🔗 Referências Relacionadas
- [[02_Arquitetura_Compass/Arquitetura_Sistemas_Olcan]]
- [[00_Onboarding_Inicio/Guia_de_Desenvolvimento]]
