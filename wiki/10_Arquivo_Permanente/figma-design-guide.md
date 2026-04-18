# Guia Completo para Criar no Figma - Landing Page Sem Fronteiras

## 🎨 Setup Inicial

### Canvas
- **Tamanho:** 1440px de largura (desktop)
- **Artboards adicionais:** 768px (tablet), 375px (mobile)

### Plugins Úteis
- **Unsplash:** Para imagens placeholder
- **Content Reel:** Para textos placeholder
- **Iconify:** Para ícones
- **Auto Layout:** Nativo do Figma (essencial)

---

## 📊 Design System / Styles

### Cores (criar Color Styles)

**Primary Colors:**
```
Blue Primary: #2563EB
Green Success: #10B981
Orange Urgency: #F59E0B
```

**Secondary Colors:**
```
Gray Dark: #1F2937
Gray Medium: #6B7280
Gray Light: #F9FAFB
White: #FFFFFF
Beige: #FEF3C7
```

**Accent Colors:**
```
Gold: #D97706
Red: #DC2626
```

**Background Tints:**
```
Light Blue: #DBEAFE
Light Green: #D1FAE5
Light Red: #FEE2E2
Light Orange: #FEF3C7
```

### Tipografia (criar Text Styles)

**Fontes:**
- Heading: Montserrat (Bold 700, SemiBold 600)
- Body: Inter (Regular 400, Medium 500, SemiBold 600)

**Text Styles Desktop:**
```
H1 Hero: Montserrat Bold 48px, line-height 120%
H2 Section: Montserrat Bold 36px, line-height 120%
H3 Subsection: Montserrat Bold 24px, line-height 120%
Body Large: Inter Regular 20px, line-height 170%
Body: Inter Regular 18px, line-height 170%
Body Small: Inter Regular 16px, line-height 170%
Tiny: Inter Regular 14px, line-height 150%
CTA Button: Montserrat SemiBold 20px, uppercase, letter-spacing 0.5px
```

**Text Styles Mobile:**
```
H1 Hero: Montserrat Bold 32px
H2 Section: Montserrat Bold 24px
H3 Subsection: Montserrat Bold 20px
Body: Inter Regular 16px
```

### Espaçamento (criar Grid/Layout Grid)

**Container:**
- Max width: 1200px
- Padding lateral: 24px

**Spacing System:**
```
Section padding vertical: 80px (desktop) / 40px (mobile)
Element margin: 24px
Paragraph spacing: 16px
Card padding: 32px
```

### Efeitos (criar Effect Styles)

**Shadows:**
```
Small: 0 2px 8px rgba(0,0,0,0.08)
Medium: 0 4px 12px rgba(0,0,0,0.08)
Large: 0 8px 20px rgba(0,0,0,0.12)
XL: 0 12px 30px rgba(0,0,0,0.15)
CTA: 0 10px 25px rgba(37,99,235,0.3)
```

**Border Radius:**
```
Small: 8px
Medium: 12px
Large: 16px
```

---

## 🏗️ Estrutura de Componentes

### 1. Header (Component)
**Dimensões:** 1440px × 80px
**Background:** White (#FFFFFF)
**Shadow:** Small (0 2px 8px rgba(0,0,0,0.08))

**Elementos:**
- Logo (esquerda): "Sem Fronteiras" - Montserrat Bold 24px, Blue Primary
- Button (direita): "QUERO O CURSO" - outline style, 2px border Blue Primary

**Auto Layout:**
- Horizontal, space-between
- Padding: 0 24px
- Height: 80px

---

### 2. Hero Section
**Dimensões:** 1440px × 100vh (mínimo 800px)
**Background:** Gradient overlay sobre imagem
- Gradient: Linear 135°, Blue Primary 95% → Green Success 90%
- Imagem de fundo: Placeholder (mãe + filho + mapa)

**Content Container:**
- Max width: 800px
- Centered (horizontal e vertical)
- Padding: 40px 24px

**Elementos:**
1. **Headline:**
   - Text: "Você Adiou Seu Sonho. Mas Ele Pode Ser Realidade Para Seu Filho."
   - Style: H1 Hero, White
   - Margin bottom: 24px

2. **Subheadline:**
   - Text: [Copy do briefing]
   - Style: Body Large, White 95% opacity
   - Margin bottom: 32px

3. **CTA Button:**
   - Width: 380px (desktop) / 95% (mobile)
   - Height: 64px
   - Background: Green Success
   - Text: "QUERO TRANSFORMAR O SONHO EM REALIDADE"
   - Style: CTA Button, White
   - Border radius: 8px
   - Shadow: CTA
   - Hover state: Scale 105%, darker green

4. **Trust Line:**
   - Text: "Acesso imediato • Garantia 30 dias • R$ 497"
   - Style: Tiny, White 90% opacity
   - Margin top: 16px

---

### 3. Section Container (Component)
**Dimensões:** 1440px × auto
**Padding:** 80px 0 (desktop) / 40px 0 (mobile)
**Variants:** White background, Gray background

**Content:**
- Container: Max width 1200px, centered
- Padding lateral: 24px

---

### 4. Section Title (Component)
**Style:** H2 Section
**Border left:** 4px solid Blue Primary
**Padding left:** 24px
**Margin bottom:** 32px

---

### 5. Button Component (Variants)

**Primary:**
- Background: Green Success
- Text: White, CTA Button style
- Padding: 20px 40px
- Border radius: 8px
- Shadow: CTA
- Hover: Scale 105%, darker green (#059669)

**Outline:**
- Border: 2px solid Blue Primary
- Text: Blue Primary
- Background: Transparent
- Padding: 10px 20px
- Hover: Background Blue Primary, Text White

**Large:**
- Padding: 20px 40px
- Min height: 64px
- Font size: 20px

---

### 6. Callout Box (Component - Variants)

**Base:**
- Border radius: 12px
- Padding: 32px
- Shadow: Medium

**Variants:**
1. **Insight** (Yellow)
   - Background: Beige (#FEF3C7)
   - Border: 2px solid Orange Urgency

2. **Bonus** (Yellow)
   - Background: Beige
   - Border: 2px solid Orange Urgency

3. **Warning** (Orange)
   - Background: Light Orange
   - Border: 2px solid Orange Urgency

4. **Guarantee** (Blue)
   - Background: Light Blue (#DBEAFE)
   - Border: 2px solid Blue Primary
   - Text align: center

5. **Urgency** (Orange)
   - Background: Light Orange
   - Border: 2px solid Orange Urgency
   - Text align: center

**Elementos:**
- Icon (emoji): 32px, margin bottom 16px
- Title: H3 Subsection
- Content: Body text

---

### 7. Accordion Item (Component)

**Collapsed State:**
- Border: 1px solid #E5E7EB
- Border radius: 8px
- Margin bottom: 16px
- Background: White

**Header:**
- Padding: 20px 24px
- Display: Horizontal auto layout, space-between
- Hover: Background Gray Light

**Elements:**
- Title: Montserrat SemiBold 20px, Gray Dark
- Meta: Tiny, Gray Medium (ex: "3 vídeos • 45 min")
- Icon: "+" 24px, Blue Primary

**Expanded State:**
- Icon rotates 45° (becomes "×")
- Content visible below header
- Content background: Gray Light
- Content padding: 24px

**Content:**
- List items: disc style, padding left 48px
- Bonus items: Gold color, bold

---

### 8. Transformation Boxes (Component)

**Grid:** 2 columns, 32px gap

**Before Box:**
- Background: Light Red (#FEE2E2)
- Padding: 32px
- Border radius: 12px

**After Box:**
- Background: Light Green (#D1FAE5)
- Padding: 32px
- Border radius: 12px

**Title:** H3 Subsection with emoji (❌ or ✅)

**List items:**
- Margin bottom: 12px
- Padding left: 32px
- Icon absolute positioned at left

---

### 9. Testimonial Card (Component)

**Dimensions:** Auto width (1/3 of grid)
**Background:** White
**Border:** 1px solid #E5E7EB
**Border radius:** 16px
**Padding:** 32px
**Shadow:** Medium
**Hover:** translateY(-4px), shadow Large

**Elements:**
1. **Quote Icon:**
   - Position: Absolute top-right
   - Text: " (aspas)
   - Size: 48px
   - Color: Blue Primary 20% opacity

2. **Title:**
   - Style: Body Large, Blue Primary
   - Margin bottom: 16px

3. **Text:**
   - Style: Body Small
   - Line height: 1.6
   - Margin bottom: 16px

4. **Author:**
   - Style: Tiny, SemiBold, Gray Dark
   - Margin bottom: 4px

5. **Result:**
   - Style: Tiny, Medium, Green Success

---

### 10. Countdown Timer (Component)

**Container:** Horizontal auto layout, 16px gap, centered

**Countdown Box (4x):**
- Background: White
- Padding: 16px 24px
- Border radius: 8px
- Min width: 80px
- Vertical auto layout, centered

**Elements:**
- Number: Montserrat Bold 32px, Orange Urgency
- Label: 12px uppercase, Gray Medium, margin top 4px
- Labels: "Dias", "Horas", "Minutos", "Segundos"

---

### 11. Pricing Card (Component)

**Background:** White
**Border:** 2px solid Blue Primary
**Border radius:** 16px
**Padding:** 40px
**Shadow:** 0 12px 30px rgba(37,99,235,0.2)

**Elements:**
1. **Old Price:**
   - Text: "De R$ 1.394" (strikethrough)
   - Style: Body, Gray Medium
   - Text align: center

2. **Current Price:**
   - Text: "R$ 497"
   - Style: Montserrat Bold 48px, Blue Primary
   - Text align: center

3. **Payment Info:**
   - Text: "à vista ou 12x no cartão"
   - Style: Tiny, Gray Medium
   - Text align: center

4. **Features List:**
   - Margin: 24px 0
   - List items with checkmarks
   - Style: Body

5. **CTA Button:**
   - Width: 100%
   - Primary Large variant

6. **Trust Badges:**
   - Horizontal layout, centered, 16px gap
   - Icons + text (🔒 Pagamento Seguro, etc.)

---

### 12. Footer (Component)

**Background:** Gray Dark (#1F2937)
**Padding:** 40px 0

**Content:** Horizontal auto layout, space-between

**Left:**
- Logo: "Sem Fronteiras" - Montserrat Bold 20px, White 80%
- Copyright: Tiny, White 80%

**Right:**
- Links: Horizontal, 24px gap
- Style: Tiny, White 80%
- Hover: White 100%

---

## 📱 Responsive Breakpoints

### Desktop (1440px)
- Use todas as especificações acima

### Tablet (768px)
- Grids 2-column → 1 column
- Reduce font sizes ~20%
- Section padding: 60px vertical

### Mobile (375px)
- All grids → 1 column
- Font sizes: Use mobile text styles
- Section padding: 40px vertical
- Buttons: 95% width
- Hero: auto height (não force 100vh)

---

## 🎯 Seções da Landing Page (Ordem)

1. **Header** (fixed)
2. **Hero Section**
3. **Emotional Identification** (Section White)
4. **Authority** (Section Gray) - Grid 2 columns
5. **Transformation** (Section White) - Before/After boxes
6. **Course Modules** (Section Gray) - 9 accordions
7. **Bonus** (Section White) - Callout Bonus
8. **Target Audience** (Section Gray) - 2 boxes
9. **Testimonials** (Section White) - 3 cards grid
10. **Guarantee** (Section Gray) - Callout Guarantee
11. **Urgency** (Section White) - Callout Urgency + Countdown
12. **FAQ** (Section Gray) - 6 accordions
13. **Final CTA** (Section CTA - gradient) - Grid 2 columns + Pricing Card
14. **Footer**

---

## 💡 Dicas de Workflow no Figma

1. **Crie o Design System primeiro:**
   - Color styles
   - Text styles
   - Effect styles
   - Components base

2. **Use Auto Layout em tudo:**
   - Facilita responsividade
   - Permite ajustes rápidos

3. **Crie Variants para estados:**
   - Buttons: default, hover
   - Accordions: collapsed, expanded
   - Callouts: diferentes tipos

4. **Use Constraints:**
   - Para elementos que devem crescer/encolher
   - Para manter alinhamentos

5. **Organize Layers:**
   ```
   📄 Landing Page
   ├── 🎨 Design System
   │   ├── Colors
   │   ├── Typography
   │   └── Components
   ├── 🖥️ Desktop (1440px)
   ├── 📱 Tablet (768px)
   └── 📱 Mobile (375px)
   ```

6. **Plugins úteis:**
   - **Stark:** Verificar contraste de cores (acessibilidade)
   - **Unsplash:** Imagens placeholder
   - **Lorem Ipsum:** Textos placeholder
   - **Iconify:** Ícones

---

## 🖼️ Imagens Necessárias

Use placeholders do Unsplash ou crie frames com:

1. **Hero Background:** 1920×1080px
   - Buscar: "mother child world map education"

2. **Ciro Portrait:** 800×1000px (4:5 ratio)
   - Placeholder: Círculo com iniciais "CM"
   - Gradient: Blue → Green

3. **Emotional Images:** 800×600px (4:3 ratio)
   - Buscar: "mother studying", "family planning"

4. **Credential Badges:** 60px height
   - Logos: LSE, Harvard, Brown, Chevening, TI
   - Grayscale filter

---

## ✅ Checklist Final

- [ ] Design System completo (cores, tipografia, efeitos)
- [ ] Todos os componentes criados
- [ ] 3 artboards (desktop, tablet, mobile)
- [ ] Auto Layout aplicado
- [ ] Constraints configurados
- [ ] Imagens placeholder inseridas
- [ ] Textos reais do briefing
- [ ] Estados hover nos botões
- [ ] Accordions com estados collapsed/expanded
- [ ] Protótipo básico (scroll + cliques)
- [ ] Exportar para desenvolvimento

---

**Tempo estimado:** 6-8 horas para design completo
**Nível:** Intermediário a Avançado no Figma
