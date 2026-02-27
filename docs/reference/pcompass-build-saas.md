**Sumário**

---

## **1\. Projeto ou Ideia**

Construção do produto SaaS Compass, a plataforma de internacionalização da Olcan. Tradução do framework FIND/DECIDE/BUILD em produto navegável, escalável e monetizável.

* Objetivos

   [Untitled](https://www.notion.so/30c7511d55c581539a40f228eba59c69?pvs=21)

* Resultados

   [Untitled](https://www.notion.so/30c7511d55c5818c8372c7c0c4c40301?pvs=21)

\<aside\> 🧭

**Produto vinculado**: Compass by Olcan (Infoprodutos)

**Horizonte MVP**: 0–6 meses

**Stack**: Next.js 14 · Supabase · Tiptap · Stripe · Google Cloud (Antigravity)

**Fase atual**: Gestação → Protótipo/MVP

\</aside\>

---

## **🎯 Objetivo do Projeto**

Construir o MVP do Compass: motor de diagnóstico \+ 1 módulo de rota (Acadêmica) \+ sistema de sprint \+ camada de mentoria async. Validar o loop central e provar retenção antes de escalar para as demais rotas.

---

## **🗂️ Fases do Projeto**

### **Fase 0 — Infraestrutura & Google Antigravity Setup**

* Ativar programa Google for Startups (Antigravity) e créditos Cloud  
* Configurar Google Cloud Project, IAM e billing  
* Setup Firebase (Auth \+ Firestore como fallback) ou Supabase  
* Habilitar APIs: Vertex AI, Gemini, Cloud Run, Cloud Storage  
* Setup ambiente de desenvolvimento (Node.js, Next.js, Docker)

### **Fase 1 — Arquitetura & Design**

* Definição final de stack técnico  
* Setup repositório GitHub \+ CI/CD (Vercel ou Cloud Run)  
* Design system no Figma (baseado na identidade Olcan)  
* Wireframes das telas principais  
* Modelo de dados e schema Supabase

### **Fase 2 — Motor de Diagnóstico**

* Árvore de decisão (60 nós) mapeada e codificada  
* Sistema de scoring de arquétipos e Fear Clusters  
* UI conversacional do questionário  
* Archetype Card compartilhável (viral mechanic)  
* Paywall pós-diagnóstico

### **Fase 3 — Módulo Acadêmico (MVP Route)**

* FIND: banco de oportunidades curado (programas, bolsas, vistos)  
* DECIDE: matriz interativa de decisão \+ Scenario Builder  
* BUILD: editor Tiptap \+ templates \+ Olcan Score rubric-based  
* Sistema de Sprints \+ Nudge Engine

### **Fase 4 — Mentoria & Monetização**

* Camada de mentoria async (structured brief → response)  
* Integração Stripe (assinaturas \+ créditos)  
* Integração Hotmart (mercado BR \+ PIX)  
* Tiers Compass Lite / Compass / Compass Pro

### **Fase 5 — AI Layer (Compass AI)**

* Integração Gemini Pro via Vertex AI  
* Sugestões inline no editor BUILD (rubric → LLM)  
* Narrativa de diagnóstico personalizada  
* Fear Reframe Cards personalizados por perfil  
* Embeddings para matching de oportunidades

### **Fase 6 — Beta & Lançamento**

* Recrutamento de 30 usuários beta  
* Setup PostHog (analytics \+ feature flags)  
* Setup Resend (emails transacionais)  
* Sprint reviews com beta users  
* Ajustes e go-live público

---

## **🛠️ Stack Técnico**

| Camada | Tecnologia | Observação |
| ----- | ----- | ----- |
| Frontend | Next.js 14 (App Router) \+ Tailwind \+ shadcn/ui | Vercel deploy |
| Editor | Tiptap (open source) | Extensões customizadas Olcan |
| Backend/DB | Supabase (Postgres \+ Auth \+ Storage) | Row-level security |
| AI | Google Vertex AI \+ Gemini Pro | Via Google Antigravity credits |
| Embeddings | text-embedding-004 (Google) | Matching de oportunidades |
| Pagamentos | Stripe \+ Hotmart | Stripe para global, Hotmart para BR |
| Email | Resend \+ React Email | Nudges de sprint e alertas |
| Analytics | PostHog | Self-hostable, feature flags |
| CI/CD | GitHub Actions \+ Vercel | Deploy automático |

---

## **📊 Métricas de Sucesso (MVP)**

* 70%+ dos beta users completam o diagnóstico  
* 50%+ completam pelo menos 1 módulo DECIDE da Rota Acadêmica  
* NPS beta ≥ 40  
* Taxa de conversão free → pago ≥ 15% no beta  
* Mentor prep time reduzido em 50% com structured briefs

---

## **🔗 Recursos Relacionados**

* PRD completo: Compass by Olcan (Infoprodutos)  
* Estratégia OKR 2026: Valentino | Olcan 2026  
* Google for Startups Antigravity: [https://startup.google.com/intl/pt-br/programs/antigravity/](https://startup.google.com/intl/pt-br/programs/antigravity/)

# **4\. Gestão do Projeto**

* Processos

   [Untitled](https://www.notion.so/30c7511d55c581f1bfcac3de83dd0c4f?pvs=21)

* Tarefas

   [Untitled](https://www.notion.so/30c7511d55c581578206f43d9d26f3c3?pvs=21)

# **5\. Recursos**

* Reuniões

   [Untitled](https://www.notion.so/30c7511d55c58169b903da828d471041?pvs=21)

* Notas ou Ideias

   [Untitled](https://www.notion.so/30c7511d55c5811686b7fefef0a3e9c5?pvs=21)

* Mídia

   [Untitled](https://www.notion.so/30c7511d55c581a58bf6df2e781c34d7?pvs=21)

* Acadêmicos

   [Untitled](https://www.notion.so/30c7511d55c581a8be6ed024c58b1fe3?pvs=21)

* Legislação

   [Untitled](https://www.notion.so/30c7511d55c5811b9a27ff4d19dd1ada?pvs=21)

* Comunicações

   [Untitled](https://www.notion.so/30c7511d55c581b4ac5ffe2acff19e6c?pvs=21)

* Curso

   [Untitled](https://www.notion.so/30c7511d55c581a29dc7c2484cb26144?pvs=21)

* Dados

   [Untitled](https://www.notion.so/30c7511d55c58161a5d5d213297790ae?pvs=21)

* Códigos

   [Untitled](https://www.notion.so/30c7511d55c5812eaad7e33964b3f483?pvs=21)

* Arquivos

# **6\. Project Log**

* 

---

# **🧠 7\. Knowledge Wiki — Olcan**

Esta seção é um mapa do conhecimento vivo da Olcan. Cada entrada aponta para uma fonte no sistema com uma breve explicação de **por que ela importa** para o desenvolvimento do Compass e para a operação geral da empresa.

---

## **🏛️ Organização & Identidade**

* [Olcan Desenvolvimento Profissional e Inovador](https://www.notion.so/Olcan-Desenvolvimento-Profissional-e-Inovador-f858b3fe666a4b69b33aee80f1f7eae0?pvs=21) — O registro central da empresa. Contém missão, visão, valores, identidade de marca (azul profundo \#001338, simbologia do Hefesto/fogo, tipografia Merriweather Sans \+ Source Sans, posicionamento metamoderno). **Essencial como norte de todas as decisões de produto e comunicação do Compass.**  
* [Valentino | CEO @ Olcan](https://www.notion.so/Valentino-CEO-Olcan-a46bf23bce82496f9d6d03e080412bd0?pvs=21) — Página do operador/persona Ciro-Valentino. Funciona como o "modo gestor" da Olcan, separando a identidade criativa da operacional. **Relevante para entender o tom e a voz do Compass e de toda comunicação.**

---

## **🔬 Framework & Metodologia Central**

* [OIOS Framework | Olcan Internationalization Operating System](https://www.notion.so/OIOS-Framework-Olcan-Internationalization-Operating-System-2ae7511d55c580589524ffbee9b6c308?pvs=21) — O meta-framework proprietário da Olcan. Define as rotas, os arquétipos e a lógica FIND/DECIDE/BUILD que estrutura toda a jornada do usuário. **É a espinha dorsal do Compass: o motor de diagnóstico, os módulos de rota e o sistema de sprints derivam diretamente deste framework.**

\<aside\> 🔑

**Os 4 pilares do OIOS que o Compass digitaliza:**

* **FIND** — Descoberta de oportunidades (bolsas, programas, vistos)  
* **DECIDE** — Matriz de decisão interativa \+ Scenario Builder  
* **BUILD** — Editor de documentos \+ templates \+ rubrica Olcan Score  
* **SPRINT** — Sistema de sprints \+ nudge engine \</aside\>

\<aside\> 👤

**12 Arquétipos OIOS** — Framework de personas desenvolvido internamente. Cada usuário do Compass recebe um diagnóstico de arquétipo. Os resultados alimentam personalização de conteúdo, Fear Reframe Cards e matching de oportunidades.

**4 Clusters de Medo** — Competência · Rejeição · Perda · Irreversibilidade. São as alavancas emocionais que o Compass deve endereçar em toda a UX e copywriting.

**4 Rotas OIOS** — Acadêmica · Corporativa · Nômade Digital · Bolsas & Governo. O MVP do Compass cobre a Rota Acadêmica primeiro.

\</aside\>

---

## **🎯 Estratégia & OKRs**

* [Estratégia OKR Valentino | Olcan 2026](https://www.notion.so/Estrat-gia-OKR-Valentino-Olcan-2026-b37a577ef11b4c53af2706fb9b0a0b36?pvs=21) — Documento de estratégia completo para 2026\. Contém OKRs, KPIs, sistema de conversão, CRM e posicionamento. **O Compass é o produto central desta estratégia; as metas de ARR, conversão free→pago e NPS beta estão aqui definidas.**  
* [Olcan Wardley Map](https://www.notion.so/Olcan-Wardley-Map-9523b72b734b4539a871511f1e929eda?pvs=21) — Mapa estratégico da empresa com assessments críticos em múltiplas datas (Mai/2025, Jun/2025, Ago/2025, Set/2025). Contém análise competitiva detalhada (vs. Matheus Tomoto, Partiu Intercâmbio, Letícia Bittencourt, August Bradley, Thomas Frank), mapa de lacunas de mercado, dores dos clientes e plano de produtos priorizados por impacto × facilidade. **Leitura obrigatória para decisões de roadmap e posicionamento do Compass.**  
* [Olcan Investors](https://www.notion.so/Olcan-Investors-99de28c7949c4e07a000c10390b93843?pvs=21) — Registro de investidores e potenciais parceiros financeiros. **Relevante para o planejamento de captação após o MVP do Compass.**

---

## **📦 Portfólio de Produtos**

| Produto | Preço | Papel no Ecossistema |
| ----- | ----- | ----- |
| [Kit Application](https://www.notion.so/Kit-Application-aea980f6080e436e938940228873e53c?pvs=21) | R$75 | Template Notion para candidaturas internacionais. **Precursor direto do módulo BUILD do Compass.** |
| [Rota da Internacionalização](https://www.notion.so/Rota-da-Internacionaliza-o-3ddc4ecc84dd40ce877480fcf66d72dd?pvs=21) | R$35 | Board Miro de roadmap visual. **Produto de entrada (low-ticket) que alimenta o funil para o Compass.** |
| [Sem Fronteiras](https://www.notion.so/Sem-Fronteiras-1b17511d55c58054bfe0c2831e24ed76?pvs=21) | R$497 | Curso online com 9 módulos. **Conteúdo que pode ser reutilizado nos módulos de rota do Compass.** |
| [Mentorias Olcan](https://www.notion.so/Mentorias-Olcan-1b17511d55c58063933ade30254c1fa1?pvs=21) | R$500/h | Serviço de mentoria 1:1. **Modelo que inspira a camada de mentoria async do Compass (Fase 4).** |
| [MedMind Pro](https://www.notion.so/MedMind-Pro-1f37511d55c5804592f1f2db92ca4e60?pvs=21) | R$497 | Template Notion para médicos. **Exemplo de produto vertical (Orbital) — modelo de expansão para o Compass.** |
| [Compass by Olcan](https://www.notion.so/Compass-by-Olcan-e6b9a5f64ceb4400b72420bf9ab5c210?pvs=21) | SaaS (tiers) | **Este projeto.** PRD completo, tiers Lite/Compass/Pro, integração Stripe \+ Hotmart. |
| [Olcan Projetos OS](https://www.notion.so/Olcan-Projetos-OS-2027511d55c580489e08fce9b1352ad7?pvs=21) | — | Produto adicional do portfólio. Consultar para gaps e oportunidades de bundling. |
| [**\[OIOS\] Olcan Impact OS — O Sistema Operacional para ONGs Brasileiras**](https://www.notion.so/OIOS-Olcan-Impact-OS-O-Sistema-Operacional-para-ONGs-Brasileiras-1fc7511d55c580dea7a8d9ba46cf3ce5?pvs=21) | — | Produto adicional do portfólio. Consultar para gaps e oportunidades de bundling. |
| [*Olcan Profit Simulator & Portfolio Dashboard*](https://www.notion.so/Olcan-Profit-Simulator-Portfolio-Dashboard-2177511d55c58072ac5fed5381d8f431?pvs=21) | — | Produto adicional do portfólio. Consultar para gaps e oportunidades de bundling. |

---

## **🛒 Sistema de Vendas & Conversão**

* [Estratégia de Conversão | Desenvolvedor Corporativo Inseguro → Cliente Olcan](https://www.notion.so/Estrat-gia-de-Convers-o-Desenvolvedor-Corporativo-Inseguro-Cliente-Olcan-4920e3264b484750aadf698594920330?pvs=21) — Estratégia detalhada de conversão com 3 arquétipos de funil e escada de produtos. **Define como o Compass se posiciona na jornada de compra: diagnóstico gratuito → paywall → assinatura.**

\<aside\> 💰

**Escada de Produto Olcan (do mais barato ao mais caro):**

Rota da Internacionalização (R$35) → Kit Application (R$75) → Curso Além das Fronteiras (R$497) → **Compass Lite/Pro (SaaS)** → Mentoria 1:1 (R$500/h)

\</aside\>

---

## **📐 Design & Conhecimento de Produto**

* [Design de Produto](https://www.notion.so/Design-de-Produto-5696b11a30ed44cc9861c5ce3f5cce37?pvs=21) — Base de conhecimento sobre design de produto vinculada ao Compass. **Referência para decisões de UX, arquitetura de informação e design system no Figma.**

---

## **📊 Métricas, KPIs & Performance**

O Wardley Map ([Olcan Wardley Map](https://www.notion.so/Olcan-Wardley-Map-9523b72b734b4539a871511f1e929eda?pvs=21)) contém o framework completo de KPIs da Olcan, incluindo:

* **Financeiros**: Revenue Growth Rate · Net Profit Margin · Revenue per User (RPU)  
* **Cliente**: CLV · CSAT · NPS · Retention Rate · Churn Rate  
* **Marketing**: CAC · Conversion Rate · Email Open Rate · CTR  
* **Operacionais**: Product Dev Cycle Time · Time to Resolve Inquiries  
* **Qualidade**: Quality Index · Freelancer Performance Score

**Metas de referência para o MVP do Compass:**

* 70%+ dos beta users completam o diagnóstico  
* 50%+ completam ≥1 módulo DECIDE (Rota Acadêmica)  
* NPS beta ≥ 40  
* Conversão free → pago ≥ 15% no beta  
* Mentor prep time reduzido em 50%

---

## **🗺️ Assessments Estratégicos (linha do tempo)**

Todos os assessments estão documentados no [Olcan Wardley Map](https://www.notion.so/Olcan-Wardley-Map-9523b72b734b4539a871511f1e929eda?pvs=21):

* **Mai/2025** — Análise Wardley inicial: maioria das funções em Genesis/Custom Built. Foco em productizar templates, automatizar compliance feed, construir flywheel de distribuição.  
* **Jun/2025** — Diagnóstico financeiro: receita recorrente insuficiente para cobrir despesas. Funil fragmentado (Substack ≠ Mautic). Prioridade: tripwire R$27 \+ calendário editorial.  
* **Ago/2025** — Market Gap Finder: top 3 oportunidades \= Kit Application 2.0 · Projetos OS · Scholarship Radar BR. Identificação do espaço vazio: soluções PT-BR \+ profundidade sistêmica (quadrante superior esquerdo vs. concorrentes).  
* **Set/2025** — Critical Assessment: difusão estratégica, incerteza de product-market fit, gap de execução. Recomendação: foco único \+ métricas claras \+ iterate rápido. **O Compass é a resposta a este diagnóstico.**

---

## **🧩 Contexto de Mercado & Concorrência**

| Concorrente | Posição | Gap que o Compass explora |
| ----- | ----- | ----- |
| Matheus Tomoto | Influencer mass market, genérico | Falta profundidade \+ personalização |
| Partiu Intercâmbio | Portal/agência, SEO forte | Não foca em alta performance |
| Letícia Bittencourt | Nicho acadêmico, alto toque | Não escalável |
| August Bradley (PPV) | Produtividade premium, EN | Sem PT-BR, sem internacionalização |
| Thomas Frank (Creator OS) | Produtividade creator, EN | Sem PT-BR, genérico |

**Posicionamento único do Compass**: PT-BR · profundidade sistêmica · IA aplicada · arquétipos personalizados · jornada end-to-end (FIND → DECIDE → BUILD → SPRINT).

---

## **📌 Glossário Rápido Olcan**

* Termos e conceitos proprietários da Olcan  
  * **OIOS** — Olcan Internationalization Operating System. O framework central.  
  * **Arquétipo OIOS** — Um dos 12 perfis de internacionalizador identificados pelo diagnóstico.  
  * **Fear Cluster** — Agrupamento de medos (Competência / Rejeição / Perda / Irreversibilidade) que travam a jornada.  
  * **Rota** — Um dos 4 caminhos de internacionalização (Acadêmica · Corporativa · Nômade Digital · Bolsas & Governo).  
  * **Olcan Score** — Rubrica proprietária para avaliar qualidade de documentos de candidatura.  
  * **Fear Reframe Card** — Card gerado por IA que recontextualiza medos do usuário com base no seu arquétipo.  
  * **Archetype Card** — Card compartilhável gerado pós-diagnóstico (viral mechanic do Compass).  
  * **Nudge Engine** — Sistema de lembretes e micro-intervenções que mantém o usuário no sprint.  
  * **Compass Lite / Compass / Compass Pro** — Os 3 tiers de assinatura do SaaS.  
  * **Sul Global** — Público-alvo estratégico da Olcan: países em desenvolvimento, especialmente Brasil.  
  * **Heterônimo** — Persona operacional (Valentino) usada para separar identidade criativa de gestora.  
  * **Orbital** — Produto co-criado com expert externo (modelo de expansão do portfólio).  
  * **Olcan Club** — Assinatura MRR (R$29–59/mês) com biblioteca de templates \+ office hours.

