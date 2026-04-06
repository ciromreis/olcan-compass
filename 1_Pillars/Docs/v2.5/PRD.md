# Product Requirements Document (PRD): Olcan Compass v2.5
**Status:** DRAFT | **Data:** Março 2026 | **Foco Estratégico:** Micro-SaaS, Arquitetura de Sistemas & Human-in-the-Loop (HITL)

---

## 1. Visão Executiva e Contexto Contemporâneo
**Objetivo Maior:** Transição do Olcan Compass de um painel de rastreamento passivo (v2) para um **"Dossiê Digital" ativo e guiado por IA** acoplado a uma plataforma de coaching (v2.5).

**A Meta de Negócio:** Geração imediata de receita através de um modelo estratégico de **Micro-SaaS**, convertendo alta fricção em valor rápido para candidatos internacionais. Em um cenário onde "A IA é comoditizada, mas workflows contextualizados são altamente rentáveis", a arquitetura do Compass v2.5 focará na **Orquestração Híbrida** (HITL), com privacidade de dados, extrema confiabilidade e tolerância a atrasos nulos.

---

## 2. Débitos Técnicos Críticos (Obrigatórios para a v2.5)
Antes de construir novos pilares do ecossistema, o núcleo de infraestrutura herdado da v2 precisará das seguintes correções atestadas pelo relatório de QA (`docs/operations/v2.5-bug-report.md`):

1. **Escalagem de Banco e Conexão (Cold Starts):** Implementar retries com *backoff exponencial* na Autenticação para remediar a latência de primeira requisição contra o NeonDB serverless.
2. **Correção de Crashes de Schema:** Corrigir a falta de `temporal_match_score` que hoje dispara o erro `500` na criação de rotas baseadas no Perfil Psicológico.
3. **Timer e Estado da Entrevista:** Sanear o *Memory Leak* no relógio ativo e refatorar o cálculo de `duration` (cronometrar os segundos respondendo, ignorando o tempo absoluto do relógio civil).
4. **Saneamento da UX de Comunidade e Sprints:** Criar um endpoint `BulkCreate` de Sprints (removendo as múltiplas chamadas concorrentes do frontend que geram timeouts) e criar detalhamentos de rotas autônomas na interface da Comunidade.

---

## 3. Topologia Orientada aos Usuários (Nós do Ecossistema)
O sistema existirá para atender **quatro perfis críticos (Nodes)** e seus pain points específicos.

### Node 1: "The Global Aspirant" (B2C - Alto Volume)
- **Perfil:** Estudantes competindo por bolsas cobiçadas (Fulbright, Chevening, Erasmus).
- **Pain Points:** Gestão de limites de caracteres restritos, combate à "síndrome do impostor", falta de estrutura narrativa.
- **Necessidade Sistêmica:** Atualizações otimistas da UI (Alta responsividade) para o *Narrative Forge*, auto-save seguro anti-concorrência e "Prompt-Guardrails" inflexíveis para impedir alucinações nas redações.

### Node 2: "The Skilled Professional" (B2C - Alto LTV)
- **Perfil:** Profissionais mid-career atrás de vistos de empregador (H-1B, Blaukarte).
- **Pain Points:** Falta cronológica, necessidades precisas de vistos cruzadas com banco de ofertas, desafios interculturais técnicos.
- **Necessidade Sistêmica:** Baixíssima latência (Web Audio API) no Simulador de Entrevista e Queries de Banco de Dados massivos altamente filtrados.

### Node 3: "The Ecosystem Provider" (B2B2C - O Mercado)
- **Perfil:** Revisores, Advogados de imigração, Mentores de alto gabarito.
- **Pain Points:** Aquisição garantida de clientes, revisão centralizada e segura, pagamentos de baixa fricção.
- **Necessidade Sistêmica:** Multitenancy rígido (RBAC), integrações seguras de repasses pelo **Stripe Connect** e camada de notificação tempo-real.

### Node 4: "The Platform Operator" (Admin - Visão Mestra)
- **Perfil:** Admins / Mantenedores do Produto.
- **Pain Points:** Rastreamento do consumo absurdo (custo) de tokens LLM, perdas no funil, suporte em massa.
- **Necessidade Sistêmica:** Observabilidade cirúrgica (PostHog/Datadog para métricas técnicas e Stripe para faturamento de tokens) e capacidade de impersonagem (suporte).

---

## 4. Pilares Centrais do Produto da v2.5

### Pilar 1: *The Narrative Forge* (Orquestração do Dossiê)
- **Fluxo UX:** O candidato submete um raciocínio de 500 palavras -> seleciona _"Ajustar para Padrão Chevening (300 tons)"_ -> a IA reconstrói utilizando a Metodologia STAR.
- **Backing Arquitetural:** 
  - **Front:** Inputs baseados em React Uncontrolled/Debouncing para contagem real-time de palavras.
  - **Back:** Versão nativa do documento com rastreabilidade (v1, v2, _ai_revision_). Implementação inicial com *Optimistic Concurrency Control*.

### Pilar 2: *AI Interview & Language Coach* (Aceleração Prática)
- **Fluxo UX:** Escolher simulador "Entrevista Comportamental" -> IA pergunta vocalmente (TTS) -> Candidato responde gravado áudio -> IA valida "Lógica Linguística" e Fluência.
- **Backing Arquitetural:**
  - **Front:** API *Web Audio* e gravação nativa (SpeechRecognition) para processar voz sem custo e a latência zero no browser.
  - **Back (Graceful Degradation):** Uso da **Gemini Flash** (processamento de fluxo interativo em milissegundos) e fallback/review sumário pela **Gemini Pro**.

### Pilar 3: *The Marketplace* (Injeção de Fator HITL)
- **Fluxo UX:** O Aspirante trava numa seção, navega pelos Mentores, compra uma *Alumni Review* (e.g. US$ 50). O Mentor obtém acesso instantâneo efêmero de leitura ou comentário direcionado a apenas um bloco narrativo do aspirante.
- **Backing Arquitetural:** 
  - **Pagamentos:** Stripe Connect (Destination Charges) para divisão instantânea de valores ($40 ao mentor, $10 à Olcan).
  - **Segurança:** Tokens JWT Efêmeros via Banco de Dados com `scope` reduzido por Documento, auto-destrutivos ao fechar do contrato.

---

## 5. Estratégia de Monetização: "Receita Rápida e Imutável"
- **Freemium ("O Isca"):** Uso livre de Banco de Oportunidades Público, uma avaliação sumária básica, e uso fixo limitado do "Narrative Polish" de teste (1 uso).
- **Micro-transações (Pay-Per-Use):**
  - **$X** por uma sessão estendida de Mock Interview com IA de profundidade vocal.
  - **$Y** para *Dossier Reviews*, onde a IA varre agressivamente todas as amarrações lógicas cruzadas da candidatura antes do envio.
- **Assinatura Recorrente (O Pro):**
  - **$Z/mês** garantindo polimentos (Narrative Forge) em modo ilimitado, simulações ilimitadas e acesso integral a um banco de dados sofisticado de patrocínio corporativo de visto corporativos.
- **Recorte do Mercado:**
  - O "Take-Rate" da Plataforma (15 a 20%) nas vendas transações ativas fechadas diretamente pelos provedores do ecossistema.

---

## 6. Paradigmas de Engenharia e Arquitetura Robusta
1.  **Gateways de Orquestração Limita (AI Gateway):**
    -   O uso excessivo ou mal-intencionado de requisições diretas de IA resultará em falência de custos. 
    -   Conexão entre LLMs deve fluir *exclusivamente e indiretamente* (Next Edge ou FastAPI backend Route) para fins vitais de: Rate Limiting (por plano/usuário), Context Injection (incluir variáveis não-autorizadas como background CV na prompt mestra oculta) e sanitização de PII antes do tráfego.
2.  **Event-Driven State Machine:** Fluxos não-lineares. Usaremos de arquiteturas emissores de eventos (`essay_polished` ou `payment_approved`) que assíncronamente acionam gatilhos paralelos e e-mails baseados na etapa em vez de monolitos processados juntos.
3.  **Privacidade de Dados (RLS):** Implementação absoluta e irredutível de *Row-Level Security* para blindar redações e perfis contra invasões horizontais. Redações e Resumos Médicos em hipótese alguma trafegam para Logs de Auditoria do Stripe/Datadog.

---

## 7. Filosofia de Design Visual: Metamodernismo Minimalista (MMXD)
O visual do Olcan Compass v2.5 e do Website de marketing abandona a "AI Slop" em favor de uma estética **Metamoderna**, equilibrando a frieza brutalista com o design orgânico líquido.

### 7.1. Sistema de "Liquid Glass"
-   **Superfícies:** Uso de `backdrop-filter: blur(16px)` com gradientes de borda semi-transparentes.
-   **Transições:** Movimentos suaves via `framer-motion` simulando a física de metal líquido.
-   **Iluminação:** Pontos de luz orgânicos ("Orbs") que se movem sutilmente em seções escuras.

### 7.2. Paleta de Cores (CROMO-MMXD)
-   **Bone/Cream:** (#F7F4EF / #FBFAF7) - Cor base para leitura prolongada e ar editorial de luxo.
-   **Ink:** (#0D0C0A) - Tipografia e ícones, alto contraste e rigor.
-   **Flame:** (#E8421A) - O "Combustível" da transição. Usado estritamente em CTAs de conversão e animações de evolução.
-   **Slate:** (#0F172A) - Usado para o "Void" (espaço profundo) em mockups de plataforma e rodapés.

### 7.3. Tipografia Editorial
-   **Heading Display:** `DM Serif Display` (Editorial, sofisticado, tradicional).
-   **Body & Sans:** `DM Sans` (Limpo, legível, moderno).
-   **Monospace:** `JetBrains Mono` (Dados técnicos e código).

---

## 8. Plano Tático de Execução "Road-To-Revenue"

- **Fase 1: O Recurso de Estreia ("The Hero") & Fundações Ocultas (Semanas 1-2)**
  - Correção inicial imperativa dos Débitos da V2 (Login/Timeout, Erro de Template, Timer).
  - Construção arquitetural base: Front-end `Narrative Forge` e back-end `AI API Gateway` blindado com tokens e limites.
  - Inserção e validação do "Paywall Limitador Duro" (3 usos grátis -> lock the interface).
  
- **Fase 2: Acoplamento do Simulador Inteligente (Semanas 3-4)**
  - Expansão ao consumidor Mid-Level com "Entrevistas Cognitivas de Alta Conversão".
  - Montagem de Infra de Web Audio API e fluxo dinâmico rápido usando conectividade com Google Gemini Flash.
  - Implementação inicial de *Stripe Checkout* para liberar a compra da moeda transacional isolada de Sessão de Entrevista por pacotes (uso Pay Per Use de 5 dólares).

- **Fase 3: O Sangue do Ecossistema – Modo Plataforma e Lançamento (Semana 5)**
  - Acionamento das camadas financeiras avançadas (*Stripe Connect*) e o Dashboard do Mentor. 
  - Lançamento de permissões restritivas (Token Management / RBAC de documento).
  - Publicação go-to-market em redes como Reddit / LinkedIn alavancadas pelo "Hook" vital de problemas de "Caracteres e Formatação Europeia" focado nas teses Erasmus e Chevening. 

- **Fase 4: Olho Mestre & Aprendizado Empírico (Semana 6)**
  - Estabulação final dos Paineis Introspectivos Analísiticos dos Criadores (The Master View).
  - Criação de funis absolutos comparando conversão versus queima e sangramento de Custo Operacional API x Receita Stripe.

---

## 9. Agency Intelligence: DB Architecture & UX Design System
*Esta seção foi gerada através da síntese do "Swarm de Agentes", integrando as Skills especialistas de Banco de Dados (Neon Postgres) e UI/UX (UI/UX Pro Max).*

### 9.1. Neon Postgres Architecture (Database Agent)
Para suportar o modelo de Micro-SaaS resiliente e mitigar os problemas de *cold start* da V2, o banco de dados adotará as seguintes posturas rigorosas baseadas na plataforma Neon:
- **Connection Pooling Nativo:** Todo o tráfego serverless (especialmente durante a criação de Sprints ou logins massivos) **deve** utilizar a URL com `-pooler` (PgBouncer) para evitar o esgotamento de conexões no escalonamento.
- **Isolamento via Branching:** O desenvolvimento da V2.5 utilizará o *Copy-on-Write Branching* do Neon. Nenhuma migração ou teste será feito no banco de produção. Uma "Branch de Staging" será o espelho exato para testes e *seed* de dados do Marketplace, garantindo tolerância a falhas.
- **Scale-to-Zero Optimization:** Reconhecemos que ambientes instativos suspendem após 5 minutos. No back-end (FastAPI), implementaremos um sistema de **"Wake-up Ping"** leve ou ajustaremos o *Connection Timeout* em chamadas críticas do Axios (Frontend) para mascarar o atraso inicial de centenas de milissegundos no retorno da suspensão.
- **Integração de Driver:** Usaremos estritamente os drivers recomendados para ambiente async (`asyncpg` no Python e `@neondatabase/serverless` para rotas Edge, caso implementadas no Next.js).

### 9.2. Design System: The Dossier Dashboard (UI/UX Agent)
A estética da V2.5 abandona o visual genérico em favor do padrão **"Data-Dense Dashboard"** somado ao Minimalismo Elegante ('Metamodern Minimalism'), executado sobre a stack `html-tailwind`.

**A. Paleta de Cores e Hierarquia (Minimal Black + Accent Gold)**
- Base Imaculada: Fundo branco (`#FFFFFF`) para máximo contraste e legibilidade de documentos.
- Estruturas e Texto: Texto primário escuro (`#171717`) e elementos de separação em cinza denso (`#404040`).
- CTA (Conversão): Uso focado e escasso do tom acentuado Dourado Seleto (`#D4AF37`) para ações críticas (Pagamentos, Geração de IA).

**B. Tipografia Dupla (Tensão Cognitiva)**
- **Headings & Dados (Fira Code):** Traz precisão cirúrgica e rigor técnico para os números, datas e estatísticas do painel.
- **Body & Leitura (Fira Sans):** Para as áreas orgânicas e imersivas do *Narrative Forge*, mantendo a elegância da leitura limpa.

**C. Regras Rígidas de Implementação de UX**
- **Sinais Visuais Exatos:** Abandono absoluto de emojis para ferramentas nativas; uso restrito e exclusivo da biblioteca SVG *Lucide* ou *Heroicons*.
- **Interaction Feedback:** Todas as ações (Botões de IA, Cards do Marketplace) *devem* conter transições (`transition-colors duration-200`) e ponteiros, evitando saltos de layout (*No layout shifts*).
- **Glassmorphism Otimizado:** Na integração Dark/Light mode, transições "Glass" não podem usar fundos com opacidade excessiva em modo claro (Não usar `bg-white/10`; usar `bg-white/80+`).
- **Acessibilidade de Contraste:** Relação estrita de >4.5:1 para qualquer texto que não seja puramente decorativo.

---

## 10. The OIOS System: Core Mechanics & DB Structure
*Resgate histórico das diretrizes de arquitetura do "Olcan Internationalization Operating System" (OIOS), agora convertidas para modelagem técnica na v2.5.*

A "Espinha Dorsal" do Compass v2.5 não é um dashboard vazio, mas um motor alimentado pelo **OIOS Framework**. O sistema categoriza usuários em 1 **Arquétipo** e mapeia **Fear Clusters** (Medos) para engatilhar as "Nudges" (Notificações comportamentais) e ditar o fluxo de IA.

### 10.1. A Matriz de OIOS Archetypes (Dataset Core)
Existem **12 Arquétipos OIOS Básicos**. O detalhamento completo de motivadores, contextos e rastros de evolução encontra-se no documento de especificação dedicada:

👉 [**OIOS Archetype Specification**](./ARCHETYPE_SPEC.md)

Estes arquétipos devem ser forçados como um `enum` no banco de dados (`profiles.dominant_archetype`) para garantir integridade referencial em todos os módulos.

### 10.2. Os 4 Fear Clusters (Regras de Context Injection)
O sistema combate 4 barreiras emocionais. A IA usa estes *clusters* injetados na Prompt Mestre para ajustar o tom de voz durante as revisões de texto (*Narrative Forge*):
- **Competência** (Síndrome do Impostor)
- **Rejeição** (Medo de não ser aceito pelo Sponsor culturalmente)
- **Perda** (Medo de perder status/bens no país de origem)
- **Irreversibilidade** (Medo de fracassar e não poder voltar)

### 10.3. Modelagem de Banco de Dados (PostgreSQL/Supabase Edge)
A infraestrutura deverá refletir a estrutura OIOS estritamente em suas entidades centrais:

#### Tabela: `users_psych_context` (ou injetado em `psych_profiles`)
```sql
CREATE TYPE oios_archetype AS ENUM (
  'institutional_escapee', 'scholarship_cartographer', 'career_pivot', 
  'global_nomad', 'insecure_corporate_dev', 'trapped_public_servant', 
  'exhausted_solo_mother', 'technical_bridge_builder' /* ...and 4 more */
);

CREATE TYPE fear_cluster AS ENUM ('competence', 'rejection', 'loss', 'irreversibility');

ALTER TABLE psych_profiles 
ADD COLUMN dominant_archetype oios_archetype,
ADD COLUMN primary_fear_cluster fear_cluster;
```

#### The "Archetype Viral Card" & Nudge Engine
O estado de retenção (Momentum) do usuário na plataforma consome os dados do OIOS:
- **Momentum Drop:** Se um usuário fica inativo por > 7 dias, o `Nudge Engine` aciona um **Fear Reframe Card** (ex: *O status é uma gaiola dourada?*) customizado exatamente para seu arquétipo.
- **Escalation to Mentor:** Quando um usuário gasta $50 no Marketplace (Hit HITL), o sistema gera um um pacote JSON fechado: `{ "text_block": "...", "archetype": "insecure_corporate_dev", "fear": "competence" }`. O Advogado ou Mentor atende e revisa o essay *já sabendo* qual é o gatilho psicológico obstrutivo do Aspirante, reduzindo um call de 1h para uma resposta assíncrona de 5 minutos rica em valor.

---

## 11. Adaptação Arquitetural: Inspirações de Open-Source Micro-SaaS
*Para acelerar o 'Time to Market' e garantir robustez de funcionalidades, o Compass V2.5 absorverá a arquitetura e mecânicas provadas de repositórios Open-Source especializados em carreiras e entrevistas:*

### A. Para o Funcional de Currículos (O 'Narrative Forge')
- **Importação Dinâmica sem Server-Cost (Ref: OpenResume):** O *Narrative Forge* suportará o upload de PDFs antigos do Aspirante utilizando bibliotecas em tempo real de parsing de Client-Side (React/Browser), reduzindo o custo em servidores FastAPI e lidando rapidamente com a aquisição de dados via Drag-and-Drop.
- **Dossiês Como Código (Ref: RenderCV / Reactive Resume):** A conversão em PDF (exportação do Dossiê) ocorrerá apartada da visão de edição, com templates determinísticos (CSS to print ou YAML/LaTeX wrappers na API) em vez de captura manual da tela.
- **Otimização ATS Engine (Ref: Resume Matcher):** Integração de fluxo onde a IA (Spacy/LLM) compara o *Dossier* vs a *Job Description (JD)* do sponsor copiada pelo usuário, gerando pontuações ("Keyword Match: 75%") antes da aplicação.

### B. Para o Simulador de Entrevistas
- **Agentes Dinâmicos on-the-fly (Ref: FoloUp & Antriview):** A entrevista de simulação deixará de ser um fluxo de "perguntas fixas". O backend gerará perguntas dinamicamente, *alimentando-se* do Currículo/Dossiê do usuário + o JD alvo.
- **Agnosticidade a Idiomas (Ref: OpenInterview):** Incorporaremos suporte multilíngue para o Voice-to-Text e TTS da IA, atendendo a Aspirantes (Cartógrafos de Bolsas) que focam na Alemanha (Alemão) ou Espanha (Espanhol).

### C. Para a Operação e Ecossistema
- Todos os *tools* criados terão arquitetura inspirada em "Pillars/Vaults" autônomos. A integração de eventuais agendamentos para Mentores ou CRM usarão referências open-source leves (como mini-clones do Cal.com integrados ao dashboard).

---

## 12. The Narrative Bible & Gamification Engine (Digievolution Logic)
*Para transcender a barreira do "SaaS Burocrático" e maximizar a retenção B2C, o Olcan Compass V2.5 operará sob um prisma narrativo de RPG (Role-Playing Game). Inspirado na lógica de **Digimon**, a jornada do Aspirante não é uma linha do tempo estéril, mas a evolução de uma "Criatura Digital" baseada na superação de medos e na forja de ativos reais.*

### 12.1. O Grafo Direcionado Acíclico (DAG) e o Oráculo
A espinha dorsal narrativa não é linear. O sistema financeiro e psicológico do usuário dita os caminhos visíveis através de um **Directed Acyclic Graph (DAG)**.
- **The Deterministic Oracle:** O motor algorítmico do Compass atua como "Mestre de Jogo". Ele "omite" (redact) proativamente rotas e vistos para os quais o Aspirante não tem viabilidade estrutural ou financeira, evitando a "tragédia da falsa esperança".
- **Sprint Orchestrator (O Leveling):** Baseado na **Bandwidth Semanal**, se o usuário tem 2 horas, o DAG injeta *Micro-Sprints* atômicos (Ex: Escrever 3 bullet points) para garantir o pico de dopamina e a sensação de "Level-Up", em vez de cobrar uma redação inteira e gerar culpa.

### 12.2. Os Guardiões (Archetype Spirits) & A Lógica de Digievolução
No Onboarding (Handshake de Identidade), o *Olcan Diagnostic Matrix (ODM)* não apenas gera um dashboard; ele "choca" a entidade digital do usuário, baseada em um dos 12 Arquétipos OIOS.

**A. Estágios de Evolução (Morphology Engine)**
A evolução não ocorre por "XP", mas por **Maturidade de Ativos (Asset Maturity)**. É propositalmente anacrônica e metamoderna.
1. **O Espelho Inicial (Rookie):** O arquétipo em seu estado natural corporativo (O *Dev Travado* é um lagarto de fios de cobre; a *Mãe Solo* é uma boneca multi-braços exausta).
2. **O Nômade Armado (Champion):** Ativado quando o CV nacional é transformado na Forja. A criatura ganha tecnologia disruptiva (O lagarto ganha "Velas de Galeão" de código holográfico).
3. **O Cidadão de Estado (Ultimate/Mega):** Quando um *Motivation Letter* cruza +85 no Olcan Score, a criatura torna-se um "Operador Global" blindado (O lagarto vira uma *Esfinge Cibernética* capaz de disparar ataques contra os servidores ATS).

### 12.3. The Artifact Forge & The Boss Fights
A documentação no Olcan não é papel; é **Equipamento Militar**.
- **A Armadura (Motivation Letters):** Peças narrativas forjadas para resistir aos golpes do *Selection Committee*. Seu poder de defesa é ditado pela Rubrica do Olcan Score.
- **A Arma Branca (Global CVs):** O currículo brasileiro é "espada cega". O CV otimizado com IA pontua como "Lâmina Perfuradora de ATS".
- **Os 4 Void Bosses (Medos):** A *Competência* (O Impostor), *Rejeição* (O Guardião de Entrada), *Perda* (A Âncora Doméstica) e *Irreversibilidade*. Quando a IA rastreia ociosidade prolongada na plataforma, ela invoca um **Fear Reframe Card**. Essa carta "cura" a paralisia do Guardian, desbloqueando a submissão do formulário.

### 12.4. A Estética do Sistema: Oscilação Metamoderna (MMXD)
O visual do Compass deve vibrar entre dois extremos filosóficos, criando o tom "Boutique Clínica" (Moss, Clay, Cream, Charcoal).
- **A Forja (Minimalismo Extremo):** Quando focado na produção, o mundo externo desaparece. O usuário entra em um modo monge monocromático para escrita profunda.
- **O Mapa (Sublime Topográfico):** Uma visualização brutal de oportunidades massivas em SVG/WebGl. "Campos de Rota", "Montanhas Ivy-League" e "Vales Nômades digitais" desenham uma teia viva.
- **Skeuomorfismo Fantástico:** Botões com textura de "Metal Líquido", contrastando a solidez da vida física no Sul Global (O *Grey Shore*) com a porosidade mutável da Fronteira Digital (*The Frontier*). 
- **Vulnerabilidade Brutal:** O Copywriting do compass será honestamente violento. A IA não incentiva passivamente. Ela diz: *"Você está procrastinando pesquisando vistos que seu financeiro não suporta. Feche esta aba cruzada e termine seu CV de aplicação remota."*

### 12.5. Clímax B2B2C: A Ponte da Alquimia (Mentorship Bridge)
Quando o monstro (Fear Cluster) é intransponível (ex: Aplicação trancada por 30 dias), o usuário ativa o Marketplace. 
- **A Alquimia:** Ele submete o *Mentor Brief* cirúrgico. O Mentor Humano desce como "Deus-Ex-Machina", transformando chumbo (Aprovação negada) em ouro (Revisão final de 5 minutos assíncrona que destrava o Level-Up final do usuário para o exterior).
