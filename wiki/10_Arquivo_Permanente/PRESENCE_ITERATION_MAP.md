# Mapa de Iteração da Presença

Este documento existe para evitar que a camada de presença volte a ficar espalhada entre render, copy, gamificação e regras de produto.

## Objetivo

A presença de bordo deve:

- reagir ao uso real de cada rota
- mudar de forma conforme documento, entrevista, logística e urgência
- reforçar retenção com surpresa e leitura personalizada
- permanecer útil para um produto microSaaS, sem virar enfeite solto

## Fontes de verdade desta camada

1. [PRESENCE_RECOMBINATION_SYSTEM.md](./PRESENCE_RECOMBINATION_SYSTEM.md)
2. [NOMENCLATURE_AND_BRAND_LAYER.md](./NOMENCLATURE_AND_BRAND_LAYER.md)
3. código listado abaixo

## Arquivos para iterar

### Sinais e regras

- `apps/app-compass-v2/src/lib/presence-phenotype.ts`
- `apps/app-compass-v2/src/lib/readiness-gate.ts`

### Estado

- `apps/app-compass-v2/src/stores/companionStore.ts`
- `apps/app-compass-v2/src/stores/routes.ts`
- `apps/app-compass-v2/src/stores/forge.ts`
- `apps/app-compass-v2/src/stores/interviews.ts`

### Render visual

- `packages/ui-components/src/components/companion/ProceduralPresenceFigure.tsx`
- `packages/ui-components/src/components/companion/EnhancedCompanionCard.tsx`
- `packages/ui-components/src/components/companion/EvolutionPath.tsx`

### Superfícies do app

- `apps/app-compass-v2/src/app/companion/page.tsx`
- `apps/app-compass-v2/src/app/(app)/dashboard/page.tsx`
- `apps/app-compass-v2/src/components/presence/RoutePresencePanel.tsx`
- `apps/app-compass-v2/src/app/visual-glimpse/page.tsx`

## Ordem recomendada de trabalho

1. Ajustar sinais por rota
2. Verificar se o phenotype continua coerente
3. Refinar o render procedural
4. Revisar a linguagem visível ao usuário
5. Só então expandir a presença para novas telas

## Critérios de qualidade

- A rota ativa precisa ser selecionável e persistida
- Rotas diferentes precisam produzir leituras diferentes
- A forma não pode depender de estágios hardcoded lineares
- O texto visível precisa continuar em português
- A leitura precisa soar operacional, não infantilizada

## Próximas frentes de evolução

- comparar leituras entre rotas no dashboard
- refletir gaps de entrevista de volta no Forge
- substituir labels internas remanescentes que ainda carregam “companion”
- criar biblioteca de variações morfológicas recombinantes além da silhueta atual
- atrelar recompensas e surpresa a marcos reais, não a loops genéricos
