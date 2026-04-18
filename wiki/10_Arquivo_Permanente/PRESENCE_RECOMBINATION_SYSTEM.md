# Sistema de Recombinação da Presença

Este documento descreve a regra atual de implementação da presença de bordo na v2.5.

## Princípio

A presença não deve ser um mascote fixo nem um estágio linear genérico. Ela precisa reagir ao estado real das rotas ativas do usuário.

## Sinais usados

Cada rota gera um conjunto de sinais:

- progresso geral da rota
- prontidão documental
- prontidão de entrevista
- prontidão logística
- urgência temporal
- nível composto de adaptação

## Fontes de dados

- `stores/routes.ts`
- `stores/forge.ts`
- `stores/interviews.ts`

## Lógica atual

1. documentos do Forge são aproximados da rota por nome, alvo, organização e contexto textual
2. entrevistas são aproximadas da rota por alvo e documento de origem
3. milestones da rota alimentam leitura logística e de preparação
4. prazos próximos aumentam urgência
5. esses sinais formam um `phenotype` procedural
6. o phenotype altera a figura renderizada no card da presença

## Efeitos visuais atuais

- urgência aumenta chifres e tensão superior
- prontidão de entrevista altera cabeça, olhos e leitura frontal
- prontidão documental reforça carapaça e corpo
- prontidão logística amplia asas e navegação lateral
- múltiplas rotas aumentam nós orbitais

## Arquivos principais

- `apps/app-compass-v2/src/lib/presence-phenotype.ts`
- `packages/ui-components/src/components/companion/ProceduralPresenceFigure.tsx`
- `packages/ui-components/src/components/companion/EnhancedCompanionCard.tsx`

## Regra de produto

A presença sempre deve:

- refletir contexto operacional
- reforçar retenção sem distrair do fluxo principal
- responder à rota ativa e às diferenças entre rotas
- manter a lógica aberta para novas combinações sem hardcode de todos os casos possíveis
