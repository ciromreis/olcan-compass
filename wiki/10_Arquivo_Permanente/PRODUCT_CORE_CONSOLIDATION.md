# Olcan Compass v2.5 - Núcleo Consolidado de Produto

**Data:** 2026-03-27  
**Status:** Direção recomendada para execução imediata

## Objetivo
Reduzir a deriva entre documentação, frontend, backend e marketing para que a v2.5 evolua como micro-SaaS coerente, com proposta de valor clara e superfície operacional sustentável.

## Núcleo recomendado da v2.5
O produto deve concentrar sua entrega comercial em quatro frentes:

1. **Diagnóstico e leitura de perfil**
   Base para orientar linguagem, rota e recomendações.

2. **Rotas executáveis**
   País, prazo, orçamento, milestones e priorização prática.

3. **Forge / Dossiê**
   Produção e refinamento de narrativa, CV e documentos críticos.

4. **Treino de entrevista**
   Simulação, repetição e melhoria orientada.

## Papel do marketplace
O marketplace deve existir como camada premium de destravamento humano.
Ele não deve ser apresentado como um diretório genérico, e sim como acesso curado a especialistas para revisão, mentoria e aceleração.

## Papel da gamificação
Gamificação deve funcionar como linguagem de retenção e orientação.
Nao deve dominar a proposta principal nem competir com a utilidade central do produto.
O companheiro serve para:

- sinalizar progresso
- reforçar consistência
- personalizar tom e rituais
- transformar fricção em cadência

## O que sai do centro agora
As seguintes superfícies devem sair do centro da narrativa da v2.5 até ganharem maturidade:

- guildas e batalhas
- studio/youtube
- superfícies administrativas não essenciais ao fluxo principal
- variações de feature sem backend ou store estáveis

## Regras de interface
- Texto visível ao usuário em português.
- Marca baseada em azul-marinho, vidro líquido e prata metálica.
- Fundos escuros apenas onde houver função clara de contraste ou hierarquia.
- Evitar laranja como acento recorrente.
- CTAs devem vender clareza, direção e avanço, não fantasia solta.

## Regras de arquitetura
- Build não pode depender de páginas experimentais para validar o produto principal.
- Stores, páginas e contratos de API do núcleo devem ser reconciliados antes de expansão.
- Features laterais precisam ser explicitamente marcadas como secundárias ou removidas da navegação principal.

## Próximo trilho recomendado
1. Fechar contratos do núcleo `diagnóstico -> rota -> forge -> entrevista`.
2. Revisar nomenclatura e CTA das páginas principais com critério de conversão.
3. Limpar navegação e remover rotas que confundem a proposta principal.
4. Reativar lint e type gate por domínio, começando pelo núcleo comercial.

## Decisão aplicada nesta rodada
- `Forge` e `Interviews` passam a compartilhar contexto mínimo no frontend.
- Um documento do Forge pode iniciar uma simulação já com alvo, idioma e origem preenchidos.
- A sessão de entrevista passa a registrar de qual documento surgiu, reforçando continuidade de uso.
- Essa costura reduz fricção, aumenta percepção de inteligência do produto e prepara o terreno para uma integração mais profunda com feedback contextual.

## Evolução aplicada na rodada seguinte
- Perguntas de entrevista agora podem ser recalibradas localmente com base no documento de origem, no alvo e em sinais centrais do texto.
- O feedback detalhado passa a incluir leitura de aderência entre fala e dossiê quando houver documento vinculado.
- O produto começa a operar como um fluxo contínuo de preparação, em vez de módulos isolados com navegação entre páginas.
