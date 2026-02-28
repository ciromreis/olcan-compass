# Design System: Olcan Compass — Liquid Glass (Stitch)
**Stitch Project ID:** 14634864513938792818  
**Stitch Project Title:** Readiness Dashboard  
**Platform target:** Mobile-first (390px / max-w-md), dark mode by default

## 1. Visual Theme & Atmosphere
Um “OS de mobilidade” com estética **Liquid Glass**: fundo navy profundo, superfícies translúcidas com blur forte, ruído/grain sutil, brilho ciano controlado (quase “scanner”), e tipografia limpa com hierarquia forte. A sensação deve ser **precisa, clínica, futurista e humana** — sem parecer “gaming UI”.

## 2. Color Palette & Roles
- **Deep Navy Background (#001338)** — fundo principal; base de contraste.
- **Abyss Night (#000A1A)** — variação mais escura para gradientes e bordas internas.
- **Primary Blue (#2094F3)** — ações primárias, ícones, estados ativos.
- **Cyan Accent (#00F2FF)** — highlights “inteligência/diagnóstico”, ring focus, micro-glows.
- **Silver Text / UI Ink (#E2E8F0)** — texto primário em dark.
- **Slate Secondary (#94A3B8)** — texto secundário, legendas, placeholders.
- **Glass Border (rgba(255,255,255,0.10–0.18))** — contorno de cartões e nav.
- **Primary Border (rgba(32,148,243,0.15–0.30))** — contorno contextual (ex.: seções “engine”).
- **Glow Cyan (rgba(0,242,255,0.30–0.60))** — sombras e drop-shadows em elementos “radar”.

## 3. Typography Rules
- **Display / UI:** Manrope (300–800) para títulos, headings e números.
- **Body / Editor:** Source Sans 3 (300–600) para textos longos (narrativas e instruções).
- **Optional emphasis:** Merriweather Sans (400–700) para títulos “brand/engine”.
- **Mono:** JetBrains Mono para métricas, labels técnicos e “badges”.

## 4. Component Stylings
- **App Frame:** `max-w-md mx-auto` com borda vertical sutil (`border-x border-white/5` ou `border-primary/10`) e `pb-24` para navegação inferior.
- **Noise / Grain:** overlay fixo muito sutil (opacidade ~0.03–0.06) para “materialidade”.
- **Liquid Glass Card:** superfície translúcida com `backdrop-blur(24px)` + borda leve + sombra difusa:
  - background: `rgba(0,19,56,0.35–0.55)` ou gradiente branco mínimo
  - border: `1px solid rgba(0,242,255,0.10–0.20)` ou `rgba(255,255,255,0.10)`
  - shadow: `0 8px 32px rgba(0,0,0,0.37)`
- **Primary Button (“liquid-button”):** pill/rounded-full, leve gradiente e brilho interno; hover com glow discreto.
- **Header Sticky:** topo fixo com blur (`bg-background-dark/80 backdrop-blur-md`) + ícones Material Symbols.
- **Bottom Navigation:** barra inferior fixa com 5 itens (Home / Rotas / Prática / Candidaturas / Mais), ícone + label, estado ativo com acento (Primary Blue ou Cyan Accent).
- **Charts / Radar:** linhas e polígonos com `stroke` ciano e preenchimento translúcido; drop-shadow ciano suave.

## 5. Layout Principles
- **Densidade controlada:** blocos bem espaçados (`p-4` / `px-6`, `space-y-6/8`) sem perder “instrument panel”.
- **Hierarquia clara:** título forte + subtítulo curto (pt-BR), e ações agrupadas.
- **Acessibilidade:** contraste alto, foco visível (ring ciano), texto mínimo `text-sm` (evitar 12px para conteúdo).
- **Microinterações:** transições de 250–350ms; animações apenas onde comunicam estado (ex.: radar pulse sutil).

## 6. Design System Notes for Stitch Generation (REQUIRED)
Use este bloco (copiar/colar) em **todo prompt** de geração/edição no Stitch para manter consistência:

- Platform: **Mobile**, **Dark mode**, max width **390px** (container `max-w-md`).
- Background: **Deep Navy (#001338)** com variação **Abyss Night (#000A1A)**.
- Surfaces: **Liquid Glass** (translucent + blur 24px) com borda `rgba(255,255,255,0.12)` ou `rgba(0,242,255,0.15)`.
- Accent Primary: **Primary Blue (#2094F3)** para CTAs e estados ativos.
- Accent Secondary: **Cyan Accent (#00F2FF)** para “diagnóstico/AI”, rings e glows discretos.
- Text: **Silver (#E2E8F0)** primário, **Slate (#94A3B8)** secundário.
- Typography: **Manrope** (headings/UI), **Source Sans 3** (texto longo/editor), **JetBrains Mono** (métricas).
- Iconography: **Material Symbols Outlined**.
- Nav: **bottom navigation** com 5 tabs (Home/Rotas/Prática/Candidaturas/Mais).

## 7. Stitch MCP (Troubleshooting)
Se o MCP retornar **HTTP 403** com mensagem “Stitch API has not been used…”, habilite a API `stitch.googleapis.com` no projeto Google Cloud indicado na própria mensagem do erro e aguarde alguns minutos para propagar.
