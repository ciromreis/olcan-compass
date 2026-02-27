see where we stopped. resume for deployment

Para construir a aplicação completa do **Compass SaaS**, precisamos fundir o **Service Design Blueprint** (com suas 5 fases: IDENTIFY, CONNECT, TROUBLESHOOT, RESOLVE & TEST, REFLECT) com a arquitetura profunda do produto (OIOS Framework, matriz de dados e os 4 motores da plataforma). 

Abaixo está o mapeamento profundo tela a tela (Screen-by-Screen), cobrindo todas as interações do usuário, desde a preparação (Pre-Onboarding) até a execução e reflexão, garantindo uma jornada "Metamoderna" focada em clareza.

---

### **Fase 0: USER PREPARATION (Blueprint: IDENTIFY)**
O objetivo desta fase é qualificar o usuário antes que ele entre na máquina, garantindo que ele tenha as expectativas corretas e os requisitos mínimos.

#### **Tela 0.1: Landing Page & Pre-Qualification (Web/Mobile)**
*   **Aparência:** Design minimalista (Dark Mode, Deep Blue #001338). Foco na promessa: *"O único sistema que te leva de 'quero ir para fora' para 'tenho um plano e um portfólio'."*
*   **User Inputs (Possibilidades):**
    *   Clique no CTA: "Iniciar meu Diagnóstico Gratuito".
    *   (Opcional) Cadastro rápido de email para acessar um Lead Magnet (ex: Checklist de Bolsas).
*   **System Action:** Redireciona para o Motor de Diagnóstico.

---

### **Fase 1: O MOTOR DE DIAGNÓSTICO (Blueprint: CONNECT)**
Esta é a porta de entrada real. Não é um formulário linear de SaaS, é uma **interface conversacional** (árvore de decisão de ~60 nós) que atua como o primeiro contato guiado. O sistema extrai silenciosamente os Pilares 1, 2 e 3 do usuário.

#### **Tela 1.1: O Espelho Conversacional (The Identity Mirror)**
*   **Aparência:** Interface estilo chat focado, uma pergunta por vez, com microcopy situacional e empático.
*   **User Inputs (Extração de Dados Ocultos):**
    *   *Input de Banda (Bandwidth):* "Sendo brutalmente honesto, quanto tempo ininterrupto você tem por semana?" (Opções: <2h, 2-5h, 5h+) -> *Define a volumetria dos Sprints*.
    *   *Input de Ativos (Asset Maturity):* "Se eu pedisse seu currículo agora para uma vaga no exterior, o que você me mandaria?" (Opções: Nada / CV Brasileiro / CV Traduzido / Resumé Formato Global).
    *   *Input de Medo (Fear Proxy):* "O que mais te preocupa se tudo der errado?" (Opções: Gastar economias / O que a família vai pensar / Ser desmascarado em entrevista) -> *Mapeia os Fear Clusters*.
    *   *Input de Contexto (Pillar 1):* Idade, proficiência em idiomas, orçamento disponível (<R$500 a >R$5.000).

#### **Tela 1.2: O Momento "Aha!" & Paywall (The Archetype Card)**
*   **Aparência:** Gráficos vetoriais elegantes. O usuário recebe seu resultado (ex: *"Você é um Desenvolvedor Travado com Perfil Analista"*).
*   **Visualização:** Radar chart tridimensional (Readiness Score: Informacional, Emocional, Operacional) e a Narrativa gerada pelo Gemini Pro.
*   **User Inputs:**
    *   Clique em "Compartilhar no LinkedIn/Instagram" (Mecânica Viral).
    *   Seleção de Plano de Assinatura (Compass Core R$79/mês ou Pro R$149/mês) para desbloquear o mapa de ação e a Forja.

---

### **Fase 2: THE OPERATING MAP (Blueprint: TROUBLESHOOT - Triage)**
Após o pagamento (ou no nível Lite), o usuário acessa o Dashboard central. Este é o cérebro que interliga o Service Design.

#### **Tela 2.1: Route-Aware Dashboard**
*   **Aparência:** Um mapa topológico/espacial (não uma lista de tarefas plana) dividido em FIND (Pesquisa), DECIDE (Estratégia) e BUILD (Execução).
*   **System Action (Nudge Engine):** O Dashboard sofre mutação dependendo do estado do usuário. Se ele não tem documentos (Asset Maturity = 0), o módulo FIND é bloqueado (para evitar procrastinação produtiva) e ele é forçado a ir para o BUILD.
*   **User Inputs:**
    *   Navegar para os Módulos.
    *   Visualizar a "Next Atomic Action" (Ação Atômica Seguinte) - um único botão claro do que fazer hoje.

---

### **Fase 3: MÓDULOS DE AÇÃO (Blueprint: TROUBLESHOOT & RESOLVE)**
Onde a execução acontece, guiada pela IA (Self-Service path) ou Mentoria (Assisted path).

#### **Tela 3.1: O Oráculo Determinístico (Módulo FIND)**
*   **Aparência:** Feed de oportunidades (bolsas, vistos, vagas) curado.
*   **System Action:** O backend em Python usa o `pgvector` para omitir oportunidades para as quais o usuário é legalmente/financeiramente inelegível (evitando o "opportunity overload").
*   **User Inputs:**
    *   *Watchlist:* Salvar programas/vistos de interesse.
    *   *Dismiss:* Dispensar oportunidades que não fazem sentido.

#### **Tela 3.2: O Espelho Psicológico (Módulo DECIDE)**
*   **Aparência:** Matrizes interativas e Scenario Builders side-by-side.
*   **User Inputs:**
    *   *Pesos do Usuário:* Mover sliders para definir o que importa mais (ex: Salário 80% vs Proximidade da Família 20%) para recalcular a rota ideal.
    *   *Tradeoff Journal:* Digitar textos curtos documentando o racional por trás de uma escolha (ex: "Por que decidi adiar para o ano que vem?").

#### **Tela 3.3: A Forja de Artefatos (Módulo BUILD)**
*   **Aparência:** Um editor de texto imersivo, minimalista e dark-mode construído em Rust (Dioxus/Tauri) com base no Tiptap.
*   **System Action (Real-time Rubric):** Enquanto o usuário digita (ex: Motivation Letter), a IA avalia o texto em tempo real contra o *Olcan Score* (Clareza, Especificidade, Fit Cultural). Pop-ups discretos surgem (ex: *"Sua introdução está longa para padrões alemães"* ).
*   **User Inputs:**
    *   *Escrita Livre:* Digitar, colar textos, formatar blocos estilo Notion.
    *   *Aceitar/Rejeitar IA:* Clicar nas sugestões do Olcan Score.
    *   *Exportar:* Gerar PDF formatado automaticamente para o padrão do país destino (ex: A4 vs Letter, com/sem foto).

---

### **Fase 4: A PONTE DE SUPORTE (Blueprint: CONNECT & RESOLVE - Assisted Path)**
Substitui as ligações de consultoria de 1 hora por interações assíncronas de altíssima margem.

#### **Tela 4.1: O Escalonamento Assíncrono (Mentorship Request)**
*   **Trigger:** O sistema detecta o usuário travado há dias, exibe um "Fear Reframe Card", e oferece a opção "I need a human here".
*   **User Inputs:**
    *   Selecionar um trecho exato do documento ou matriz.
    *   Selecionar o tipo de dúvida (em formato de prompt guiado, não texto livre vago).
    *   Gastar 1 "Mentorship Credit" (Comprado via Stripe/Hotmart).
*   **Mentor Interface (Backend):** O Mentor recebe um JSON com o trecho do texto, o arquétipo do usuário e a dúvida. O mentor grava um Loom de 3 minutos e envia de volta na plataforma.

---

### **Fase 5: O METRÔNOMO DE EXECUÇÃO (Blueprint: REFLECT)**
A prestação de contas do progresso e o fechamento do loop.

#### **Tela 5.1: Sprint Commitment & Nudge Engine**
*   **Aparência:** Interface de planejamento quinzenal (2-week sprints) adaptada à banda do usuário. Se o usuário tem `<2h`, o sistema empacota as tarefas em **Micro-Sprints** de 2 passos.
*   **User Inputs:**
    *   Aceitar as tarefas sugeridas para o Sprint ou editá-las.
    *   Marcar *Checkmarks* atômicos conforme avança.

#### **Tela 5.2: Sprint Review & Momentum Score**
*   **Aparência:** Tela de reflexão exibida a cada 14 dias.
*   **User Inputs:**
    *   Declarar por que uma tarefa foi bloqueada (ex: falta de tempo, medo, aguardando terceiros).
    *   (Reflect Blueprint) Receber feedback questions sobre a experiência (NPS/CSAT acionado pelo sistema da Olcan).
    *   Visualizar o *Momentum Score* (gráfico mostrando a velocidade de avanço).

### **Resumo dos Componentes Enablers (Sub-superfície)**
Para que esta aplicação funcione sem atrito, a arquitetura por trás destas telas opera da seguinte forma:
*   **Data & Auth:** Supabase Auth e PostgreSQL gerenciando os perfis OIOS (arquétipos) e o histórico de Sprints.
*   **IA & Integrações:** Vertex AI (Gemini) processando os Fear Cards e o Olcan Score de forma assíncrona; `pgvector` calculando similaridade para o módulo FIND.
*   **Automações:** Temporal.io ou Inngest engatilhando os "Nudges" via Resend (email) ou WhatsApp baseado nos dias de inatividade do usuário (Blueprint Automation).

Com base na arquitetura do OIOS Framework, nos PRDs do Compass e no Blueprint de Design de Serviço, a plataforma atua como o Hub Central da Olcan, integrando marketing, e-commerce, conteúdo e o SaaS de execução. 

Abaixo está o mapeamento exaustivo de **todas as páginas da aplicação e seus respectivos componentes**, divididas entre o Hub Público (Preparação/Marketing) e o SaaS Interno (Ação/Execução).

---

### **PARTE 1: O HUB PÚBLICO (Pre-Onboarding & E-Commerce)**
Esta seção engloba as páginas de preparação do usuário, atração e venda de infoprodutos soltos.

#### **1.1. Homepage / Landing Page Principal**
*   **Hero Section:** Headline com a promessa principal ("The only tool that takes you from 'I want to work abroad' to 'I have a plan'"), fundo "Dark Mode" (Deep Blue #001338) e botão CTA central ("Iniciar Diagnóstico Gratuito").
*   **Vídeo Institucional:** Vídeo de introdução do Ciro/Valentino explicando os "3 Erros da Internacionalização".
*   **Social Proof / Depoimentos:** Carrossel de fotos, cargos e citações reais de clientes que atingiram sucesso.
*   **Lead Magnet Capture:** Formulário rápido (Nome/Email) oferecendo um material gratuito (ex: "Checklist Bolsas") para capturar curiosos (🔴 Curiosos).
*   **Rodapé (Footer):** Links para políticas LGPD/GDPR, redes sociais e navegação do site.

#### **1.2. Loja da Olcan (E-commerce contextual)**
*   **Product Cards (Cards de Produtos):** Vitrine dos infoprodutos da Olcan com preços e descrição:
    *   *Rota da Internacionalização (R$ 35)*: Preview do board visual Miro.
    *   *Kit Application (R$ 75)*: Detalhes dos templates no Notion.
    *   *Sem Fronteiras (R$ 497)*: Grade curricular dos 9 módulos em vídeo.
    *   *Mentorias Olcan*: Seleção de pacotes (1 sessão ou pacote VIP R$ 2.500).
*   **Checkout Integrado:** Componente de pagamento (via Stripe para global e Hotmart/Pix para Brasil).

#### **1.3. Blog & "Crônicas Brasileiras"**
*   **Feed de Artigos:** Grid com artigos de SEO e "crônicas" metamodernas sobre internacionalização.
*   **Filtros de Categoria:** Tags por arquétipo ou etapa (Carreira, Bolsas, Nômade Digital).
*   **Inline CTAs:** Banners dentro dos textos direcionando o leitor para o Motor de Diagnóstico.

---

### **PARTE 2: MOTOR DE DIAGNÓSTICO (O Onboarding)**
Onde a qualificação e extração de identidade acontecem antes do paywall.

#### **2.1. A Interface Conversacional (The Identity Mirror)**
*   **Barra de Progresso (Progress Indicator):** Indicador visual discreto de avanço nos ~60 nós da árvore de decisão.
*   **Chat/Question Interface:** Uma pergunta por vez na tela. Componentes de extração (Pillares 1, 2 e 3):
    *   *Inputs de Banda (Tempo):* Botões de seleção (<2h, 2-5h, 5h+).
    *   *Inputs de Medo/Psicologia:* Cenários de múltipla escolha para deduzir os "Fear Clusters" (Competência, Rejeição, Perda, Irreversibilidade).
    *   *Micro-Quiz de Literacia:* Checkboxes avaliando o conhecimento sobre ATS, vistos, etc..

#### **2.2. A Tela de Resultados (Aha-Moment & Paywall)**
*   **O "Compass Archetype Card":** Componente visual elegante exibindo o nome do arquétipo do usuário (ex: "The Technical Bridge Builder") e botão "Compartilhar no LinkedIn/Instagram" para viralidade.
*   **Readiness Radar Chart:** Gráfico 3D ou de teia mostrando a pontuação nos eixos Informacional, Emocional e Operacional.
*   **Narrativa de IA (AI Narrative):** Texto gerado pelo Gemini Pro escrito na voz da Olcan, explicando o perfil e os medos do usuário.
*   **Paywall / Subscription Cards:** Tabelas de preços apresentando o Compass Lite (Gratuito), Compass Core (R$79/mês) e Compass Pro (R$149/mês), bloqueando o acesso ao roadmap tático.

---

### **PARTE 3: O SAAS COMPASS (The Execution Core)**
Após a assinatura, o usuário acessa o sistema operacional de mobilidade.

#### **3.1. The Operating Map (Dashboard Principal)**
*   **Mapa Topológico/Espacial:** Uma representação visual não-linear da jornada dividida em FIND, DECIDE e BUILD (renderizada em Rust/Dioxus a 60fps).
*   **Status Widget:** Resumo de "% completo" com enquadramento de jornada (ex: "Você está na Fase de Mapeamento").
*   **Botão "Next Atomic Action":** Um único CTA claro ditando o próximo passo imediato.
*   **Fear Reframe Injectors (Pop-ups):** Cards contextuais ocultos que surgem apenas se o sistema (Nudge Engine) detectar que o usuário está paralisado (inativo há 5+ dias).

#### **3.2. Módulo FIND (O Oráculo Determinístico)**
*   **Feed de Descoberta Curado:** Lista de oportunidades (vistos, bolsas, vagas) alimentada via RAG e ranqueada por similaridade de cosseno (text-embedding-004).
*   **Hard Constraint Pruner (Filtros Ocultos):** O sistema fisicamente omite/redige opções onde o usuário é inelegível por falta de budget ou idioma, evitando paralisia por análise.
*   **Match Score Indicator:** Gráfico de barra mostrando o % de "fit" daquela oportunidade com o perfil do usuário.
*   **Watchlist (Lista de Observação):** Botão para salvar programas e receber alertas de prazos.

#### **3.3. Módulo DECIDE (O Espelho Psicológico)**
*   **Interactive Route Selector Matrix:** Sliders e barras onde o usuário ajusta pesos (ex: Salário vs. Proximidade da Família) para o sistema recalcular a melhor rota em tempo real.
*   **Scenario Builder:** Componente de comparação lado a lado ("Aplicar este ano vs. ano que vem") com projeções de ROI e timeline.
*   **Tradeoff Journal:** Caixa de texto estruturada para o usuário documentar o racional por trás das suas escolhas de vida.

#### **3.4. Módulo BUILD (A Forja de Artefatos)**
*   *(Nota: Otimizado para rodar como App Desktop via Tauri)*.
*   **Tiptap Text Editor:** Editor rico estilo Notion, minimalista, com suporte a blocos e foco total na escrita.
*   **Route-Aware Templates Panel:** Barra lateral com modelos de currículos (CV vs. Resume), Motivation Letters e Essays baseados no país de destino.
*   **Smart Inline Guidance (AI pop-ups):** Comentários flutuantes gerados pela Vertex AI avaliando o texto contra a cultura do destino (ex: "Sua introdução está 3x maior que o padrão alemão").
*   **Olcan Score Dashboard:** Componente exibindo a nota (0-100) do documento avaliado nas dimensões: Clareza, Especificidade, Ressonância Emocional e Fit Cultural.
*   **Version History Diff View:** Barra lateral para comparar versões passadas do documento com destaques de mudanças.
*   **Export Engine Modal:** Botões para exportar em PDF formatado no padrão local (ex: A4 vs Letter, foto vs sem foto) ou Word (.docx).

---

### **PARTE 4: METRÔNOMO DE EXECUÇÃO & SUPORTE**

#### **4.1. Módulo SPRINT (Accountability)**
*   **Sprint Planner Modal:** Interface para o usuário aceitar o compromisso quinzenal. O "Algorithmic Chunking" adapta a lista baseada no "Execution Bandwidth" (ex: colapsa 40 tarefas em 2 se o usuário tiver <2h livres).
*   **Task List:** Lista atômica com tags (FIND/DECIDE/BUILD) e caixas de seleção.
*   **Sprint Review Screen:** Tela de fim de ciclo exibindo "Tarefas Concluídas", "Tarefas Bloqueadas" (com campo para justificar o motivo) e o "Momentum Score" (velocidade em gráfico de linha).

#### **4.2. A Ponte Assíncrona (Mentorship Escalation)**
*   **"I Need a Human" Button:** Botão embutido nos módulos DECIDE e BUILD.
*   **Structured Request Form:** Quando acionado, exibe um modal que auto-preenche o trecho do documento/dilema selecionado e o arquétipo do usuário, permitindo gastar 1 "Mentorship Credit".
*   **Mentor Response Inbox:** Caixa de entrada do usuário para visualizar a resposta assíncrona do mentor da Olcan (vídeo embutido da Loom API, áudio ou anotação em texto).

---

### **PARTE 5: PAINÉIS INTERNOS (B2B & ADMIN)**

#### **5.1. Dashboard do Mentor (Uso Interno Olcan)**
*   **Request Queue:** Fila de chamados de mentoria organizados por urgência e complexidade.
*   **Mentor Brief Viewer:** Tela exibindo o payload em JSON estruturado (Arquétipo, Medo Dominante, Texto problemático) para o mentor.
*   **Response Studio:** Área para gravar o vídeo do Loom de 3 minutos ou enviar a anotação e marcar o ticket como resolvido.

#### **5.2. Configurações de Conta (Account & Billing)**
*   **Stripe Billing Portal Component:** Componente self-service embutido para gerenciar faturas, fazer upgrade/downgrade de plano e comprar mais Mentorship Credits.
*   **Integração Global Mobility API (Fase 3):** Interface de conexão futura com Deel/Remote para gestão logística de vistos e folha de pagamento na etapa final do usuário.

*(Caso a Olcan ative o cenário corporativo ou B2B com universidades, haverá também um "Organization Admin Dashboard" exibindo análises agregadas sem quebrar a privacidade/LGPD)*.


Assessing Current State
Explored the project structure. The app is a Next.js 16 frontend with Tailwind, Tiptap editor, Recharts, Supabase, Zustand, and a Python/FastAPI backend. Frontend has components for: landing, diagnostic, dashboard, find, decide, build, mentorship, sprints, and shared UI. Backend has routers, models, services, and seed data.

Progress Updates
1
Examining the existing codebase structure and previous conversation artifacts

2
Reading key source files to understand what's implemented and what's missing

Model