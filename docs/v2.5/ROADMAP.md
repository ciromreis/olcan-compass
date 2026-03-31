# 🚀 Olcan Compass Modular Roadmap (v2.5 & Beyond)

Este roadmap utiliza o framework **Value vs Effort** para priorizar a evolução do ecossistema Olcan em módulos de Micro-SaaS.

---

## 🛠️ Phase 1: Brand & Visual Shell (DONE)
*Foco: Credibilidade, Branding Metamoderno e Atração.*

- [x] **New Design System (Metamodern):** Bone/Flame/Ink tokens + Liquid Glass utilities.
- [x] **Hero Redesign:** Cobe Globe + Archetype Puppets (3D idle feel).
- [x] **Editorial Content:** About Section + Insights spotlight.
- [x] **Mobile Optimization:** Smooth performance for high-end CSS filters on mobile.

## 🧪 Phase 2: The Handshake (Identity & Path) (DONE)
*Foco: Autopreservação de Identidade e Conversão.*

- [x] **Redesign do Diagnóstico OIOS:** Trazer o formulário de 12 perguntas para a estética Metamoderna.
- [x] **Páginas de "Jornada":** 4 landings dinâmicas (Acadêmica, Corp, Nômade, Bolsas) com puppetry específico.
- [x] **Viral Achievement Cards:** Geração de cards de arquétipo para compartilhamento (Momentum building).

## 🧩 Phase 3: Micro-SaaS Modularity (Functionality)
*Foco: Extração de funcionalidades core em módulos independentes.*

- [ ] **Module: Narrative Forge:** 
  - *Value: High | Effort: Medium*
  - Refatoração do editor de texto para modo imersivo (Monge).
  - Integração Gemini Flash para polimento STAR.
- [ ] **Module: Interview Simulator:**
  - *Value: High | Effort: High*
  - Web Audio API integration + Dynamic Questions based on OIOS Psych Context.
- [ ] **Module: Sprint Orchestrator:**
  - *Value: Medium | Effort: Low*
  - Bulk creation of tasks based on the DAG path.

## 💰 Phase 4: The Bridge (Monetization & HITL)
*Foco: Receita e Fator Humano.*

- [ ] **Marketplace Integration:** Listagem de Mentores com filtragem por Arquétipo.
- [ ] **Stripe Connect:** Fluxos de pagamento Pay-per-use (Mock Interviews).
- [ ] **Mentor Dashboard:** Interface simplificada para revisões assíncronas de 5 minutos.

---

## 🏗️ Architectural Vision: The Modular Monorepo
Em vez de separar os apps em múltiplos repositórios (que gerariam latência de desenvolvimento e desvio de design), utilizaremos **Workspaces Isolados**:

- **`apps/web-site`**: A fachada de conversão.
- **`apps/web-app`**: A plataforma privada (Dashboard).
- **`packages/shared-ui`**: Onde as regras de "Liquid Glass" e Puppets moram, garantindo que o app e o site sejam visualmente idênticos.
- **`packages/oios-core`**: A lógica matemática e psicológica compartilhada entre todas as ferramentas.
