# Cânone de Implementação v2.5

Este documento existe para reduzir ambiguidade. A v2.5 tem documentação demais e, em alguns pontos, documentação conflitante. Quando houver dúvida, siga esta ordem.

## Fonte principal de verdade

1. [PRODUCT_CORE_CONSOLIDATION.md](./PRODUCT_CORE_CONSOLIDATION.md)
2. [PRD.md](./PRD.md)
3. [INTEGRATED_DEVELOPMENT_STRATEGY.md](./INTEGRATED_DEVELOPMENT_STRATEGY.md)
4. [NOMENCLATURE_AND_BRAND_LAYER.md](./NOMENCLATURE_AND_BRAND_LAYER.md)
5. [PRESENCE_RECOMBINATION_SYSTEM.md](./PRESENCE_RECOMBINATION_SYSTEM.md)
6. [PRESENCE_ITERATION_MAP.md](./PRESENCE_ITERATION_MAP.md)
7. Código real em `apps/app-compass-v2` e `apps/site-marketing-v2.5`

Se outro documento entrar em conflito com a lista acima, trate-o como histórico, apoio ou material de consulta, não como regra.

## Núcleo comercial da v2.5

O produto precisa vender e reter como microSaaS. O núcleo não é a soma de todas as telas.

- Diagnóstico e leitura inicial
- Rotas e prontidão
- Forge como dossiê documental vivo
- Entrevistas como treino contextual
- Marketplace como destravamento humano premium
- Presença de bordo como camada de retenção e personalização

## Código que merece atenção primeiro

### App

- `apps/app-compass-v2/src/app/(app)/dashboard`
- `apps/app-compass-v2/src/app/(app)/routes`
- `apps/app-compass-v2/src/app/(app)/forge`
- `apps/app-compass-v2/src/app/(app)/interviews`
- `apps/app-compass-v2/src/app/(app)/marketplace`
- `apps/app-compass-v2/src/app/(auth)`

### Estado e contratos

- `apps/app-compass-v2/src/stores`
- `apps/app-compass-v2/src/lib`
- `packages/ui-components/src/components/companion`
- `docs/v2.5/PRESENCE_ITERATION_MAP.md`

### Site

- `apps/site-marketing-v2.5/src/app`
- `apps/site-marketing-v2.5/src/components`

## Regras práticas de desenvolvimento

### Linguagem

- Texto visível ao usuário em português, salvo necessidade real
- Evitar termos internos como nome de feature quando o mercado não entende
- Priorizar linguagem de clareza operacional, não jargão lúdico vazio

### Visual

- Navy como base
- Vidro líquido claro
- Acabamento prata e metálico
- Evitar laranja como acento principal
- Evitar telas escuras por padrão

### Produto

- Cada feature deve responder a uma utilidade concreta para quem quer internacionalizar a carreira
- A presença de bordo deve reagir ao comportamento real do usuário
- Gamificação só vale quando reforça continuidade, leitura e retenção
- Forge e entrevistas devem formar um ciclo: o documento alimenta o treino e o treino devolve sinais práticos para revisar o documento

## Documentos úteis, mas secundários

- Design system detalhado
- Roadmaps históricos
- Relatórios antigos de status
- Arquivos em `docs/archive`

## Próxima validação ao implementar

Antes de abrir uma nova frente de código, validar:

1. isso aumenta valor prático para o usuário?
2. isso aproxima o fluxo central do produto?
3. isso reforça retenção sem virar ruído visual?
4. isso está coerente com a linguagem e com a marca?
