# Reference Repo Mapping for Olcan Compass v2.5

Este documento registra como referências open source podem acelerar decisões de produto e implementação sem desviar o Olcan Compass do seu núcleo comercial.

## Princípio

As referências abaixo não devem virar cópia de feature set. Elas servem para validar padrões já testados em três áreas críticas:

- criação e refinamento documental no `Forge`
- preparação contextual para entrevistas
- estrutura de produto com autonomia, exportabilidade e possibilidade de auto-hospedagem

## Mapeamento recomendado

### 1. Reactive Resume

Fonte: [Reactive Resume](https://github.com/AmruthPillai/Reactive-Resume)

O README descreve alguns pilares úteis:

- preview em tempo real
- exportação em PDF e JSON
- ordenação de seções por drag and drop
- seções customizadas
- privacidade e self-hosting
- compartilhamento por link

Aplicação no Olcan Compass:

- `Forge` deve se comportar como um editor de documento vivo, não como um formulário estático.
- Exportação precisa ser confiável e previsível para CV e peças relacionadas.
- Estrutura modular de blocos é melhor do que templates rígidos para acomodar rotas acadêmicas, visto e carreira.
- Propriedade dos dados e portabilidade reforçam o posicionamento micro-SaaS premium.

Inferência:
O valor principal aqui não é “ter um builder bonito”, mas reduzir atrito entre revisão, adaptação e envio.

### 2. FoloUp

Fonte: [FoloUp](https://github.com/FoloUp/FoloUp)

O README apresenta a plataforma como um entrevistador por voz com IA para processos de contratação, com destaque para:

- entrevistas por voz com IA
- foco em hiring
- possibilidade de self-hosting
- orientação explícita para deploy em Vercel

Aplicação no Olcan Compass:

- o módulo de entrevistas deve priorizar contexto, fluidez e percepção de presença, não só banco de perguntas.
- a arquitetura futura pode separar bem sessão, feedback e configuração de contexto da vaga/programa.
- o caminho de deploy e operação precisa considerar serviços desacoplados para voz e simulação, em vez de inflar o monólito principal.

Inferência:
Para o Compass, a melhor adaptação não é replicar uma plataforma B2B de recrutamento, e sim trazer a lógica de entrevista contextual e de voz para apoiar decisão individual de carreira internacional.

### 3. Open Interview

Fonte: [open-interview](https://github.com/dsdanielpark/open-interview)

O repositório mostra um padrão útil de geração de perguntas a partir de `resume` e `jd`, com:

- suporte a texto longo de currículo e job description
- tipos de entrevista diferentes, incluindo `techQAsFromResume`
- parâmetro de idioma livre
- saída em formatos de documento e áudio
- revisão de currículo no mesmo fluxo

Aplicação no Olcan Compass:

- `interviews/new` deve continuar pedindo alvo e idioma, mas depois precisa receber insumos do `Forge`.
- o melhor fluxo futuro é: documento alvo + oportunidade alvo + idioma alvo -> sessão contextualizada.
- o mesmo contexto documental pode alimentar treino, revisão e preparação de candidatura.

Inferência:
Esse padrão valida a integração direta entre `Forge` e `Interviews` como vantagem competitiva real do produto.

## O que isso muda no roadmap

### Prioridade alta

- conectar `Forge` e `Interviews` por contexto compartilhado
- tornar o companion responsivo a sinais concretos de uso nesses módulos
- tratar exportação e qualidade documental como diferencial central de retenção

### Prioridade média

- estruturar uma camada mais robusta de comparação entre documento e alvo
- introduzir feedback guiado por documento + vaga/programa
- separar melhor serviços de sessão, análise e geração para reduzir acoplamento

### Fora do foco agora

- clonagem de builders genéricos de currículo
- experiência escura e excessivamente gamificada
- expansão de features sociais sem conexão com resultado operacional

## Conclusão

As referências confirmam um caminho claro para a v2.5:

- `Forge` como centro documental vivo
- `Interviews` como treino contextual de alta utilidade
- `Companion` como camada reativa e personalizada que lê o que o usuário realmente faz

Isso preserva o posicionamento do Olcan Compass como produto operacional e premium, em vez de virar um app genérico de produtividade com estética gamificada.
