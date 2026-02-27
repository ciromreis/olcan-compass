# Quick Start Guide for Next Session

## What Was Completed

✅ **All TypeScript compilation errors fixed** (138 errors → 0 errors)  
✅ **MMXD Design System Foundation established**  
✅ **Design tokens created** (`apps/web/src/design-tokens.json`)  
✅ **Tailwind configured** with MMXD tokens  
✅ **Production build working**

## What's Next

### Immediate Task: Build Core MMXD Components

You need to rebuild the existing UI components to follow the MMXD design system using the new design tokens.

---

## Step 1: Read These Files First

1. **`IMPLEMENTATION_PLAN.md`** - Complete implementation strategy
2. **`apps/web/src/design-tokens.json`** - All design tokens
3. **`SESSION_SUMMARY_2026-02-24.md`** - What was done this session
4. **`docs/main/PRD.md`** - MMXD philosophy (search for "Metamodern Design")

---

## Step 2: Build 5 Core Components

### Priority Order:

#### 1. Button Component (`apps/web/src/components/ui/Button.tsx`)

**Requirements**:
- Variants: `primary`, `secondary`, `ghost`
- Sizes: `sm`, `md`, `lg`
- States: default, hover, active, disabled, loading
- Use Lumina for primary, Neutral for secondary, transparent for ghost
- Include Framer Motion animations
- Support icons (left/right position)
- Full TypeScript types

**Example Usage**:
```tsx
<Button variant="primary" size="md" icon={<Plus />} iconPosition="left">
  Nova Rota
</Button>
```

#### 2. Card Component (`apps/web/src/components/ui/Card.tsx`)

**Requirements**:
- Types: `default`, `opportunity`, `fear-reframe`, `identity-mirror`
- Support header, body, footer slots
- Use Void background with Lux borders
- Include hover states with glow effect
- Support padding variants
- Full TypeScript types

**Example Usage**:
```tsx
<Card type="opportunity" className="hover:shadow-glow">
  <CardHeader>Título</CardHeader>
  <CardBody>Conteúdo</CardBody>
  <CardFooter>Ações</CardFooter>
</Card>
```

#### 3. Input Component (`apps/web/src/components/ui/Input.tsx`)

**Requirements**:
- Support label, helper text, error message
- Validation states (default, error, success)
- Left/right icons
- Use Void background with Lux borders
- Focus state with Lumina glow
- Full TypeScript types

**Example Usage**:
```tsx
<Input
  label="Email"
  type="email"
  placeholder="seu@email.com"
  leftIcon={<Mail />}
  error="Email inválido"
  helperText="Digite seu email"
/>
```

#### 4. Progress Component (`apps/web/src/components/ui/Progress.tsx`)

**Requirements**:
- Linear progress bar
- Circular progress (for scores)
- Use Lumina for progress, Neutral for background
- Animated transitions
- Show percentage label
- Full TypeScript types

**Example Usage**:
```tsx
<Progress value={75} max={100} variant="linear" />
<Progress value={85} max={100} variant="circular" size="lg" />
```

#### 5. Typography Components (`apps/web/src/components/ui/Typography.tsx`)

**Requirements**:
- Components: `H1`, `H2`, `H3`, `H4`, `Body`, `BodySmall`, `Caption`
- Use design tokens for sizes and line heights
- Support color variants (default, muted, accent)
- Use Merriweather Sans for headings, Source Sans 3 for body
- Full TypeScript types

**Example Usage**:
```tsx
<H1>Bem-vindo ao Compass</H1>
<Body color="muted">Descrição do sistema</Body>
<Caption>Última atualização: 24/02/2026</Caption>
```

---

## Step 3: Create Component Showcase Page

Create `apps/web/src/pages/ComponentShowcase.tsx` to demonstrate all components:

```tsx
export function ComponentShowcase() {
  return (
    <div className="p-8 space-y-12 bg-void-primary min-h-screen">
      <section>
        <H2>Buttons</H2>
        <div className="flex gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      <section>
        <H2>Cards</H2>
        <div className="grid grid-cols-3 gap-4">
          <Card type="default">Default Card</Card>
          <Card type="opportunity">Opportunity Card</Card>
          <Card type="fear-reframe">Fear Reframe Card</Card>
        </div>
      </section>

      {/* Add more sections for other components */}
    </div>
  )
}
```

Add route in `apps/web/src/App.tsx`:
```tsx
<Route path="/showcase" element={<ComponentShowcase />} />
```

---

## Step 4: Test Components

1. Start dev server: `cd apps/web && npm run dev`
2. Visit `http://localhost:3000/showcase`
3. Verify all components render correctly
4. Test interactions (hover, click, focus)
5. Check responsive behavior
6. Verify accessibility (keyboard navigation, ARIA labels)

---

## Design Token Reference

### Colors

**Primary Palette**:
- `void-primary` (#001338) - Main background
- `lux-300` (#B3B3CC) - Secondary elements
- `lumina-500` (#2196F3) - Primary actions
- `ignis-500` (#FF9800) - Warnings/energy

**Semantic**:
- `success` (#4CAF50)
- `warning` (#FFC107)
- `error` (#F44336)
- `mirror` (#9C27B0)

### Typography

**Fonts**:
- Headings: `font-heading` (Merriweather Sans)
- Body: `font-body` (Source Sans 3)
- Code: `font-mono` (JetBrains Mono)

**Sizes**:
- `text-h1` (48px desktop, 36px mobile)
- `text-h2` (36px desktop, 28px mobile)
- `text-h3` (28px desktop, 24px mobile)
- `text-body` (16px desktop, 14px mobile)
- `text-body-sm` (14px desktop, 13px mobile)
- `text-caption` (12px desktop, 11px mobile)

### Spacing

Use Tailwind spacing: `p-4`, `m-6`, `gap-8`, etc.
- 1 = 4px
- 2 = 8px
- 4 = 16px
- 6 = 24px
- 8 = 32px
- 12 = 48px
- 16 = 64px

### Shadows

- `shadow-sm` - Subtle shadow
- `shadow-md` - Medium shadow
- `shadow-lg` - Large shadow
- `shadow-glow` - Lumina glow effect
- `shadow-card` - Card shadow

---

## MMXD Design Principles

### 1. Serious Play
- Professional but not corporate
- Calm and focused, not playful or gamified
- Use subtle animations, not flashy effects

### 2. Oscillation
- Support both high-density (Map) and minimalist (Forge) modes
- Components should work in both contexts

### 3. Psychological Adaptation
- UI adapts to user's psych profile
- Tone, pacing, and risk warnings change based on state

### 4. Portuguese-First
- All microcopy in Portuguese (pt-BR)
- "Alchemical" voice: prophetic + ironic
- Honest, direct, sometimes vulnerable

### 5. Color Usage
- **Void**: Backgrounds, serious contexts
- **Lux**: Borders, subtle highlights
- **Lumina**: Primary actions, focus states
- **Ignis**: Warnings, energy, momentum
- **Neutral**: Text, secondary elements

---

## Common Patterns

### Button with Icon
```tsx
<Button 
  variant="primary" 
  icon={<Plus className="w-4 h-4" />} 
  iconPosition="left"
>
  Nova Rota
</Button>
```

### Card with Hover Effect
```tsx
<Card className="hover:shadow-glow transition-shadow duration-base">
  <div className="p-6">
    <H3>Título</H3>
    <Body>Conteúdo</Body>
  </div>
</Card>
```

### Input with Validation
```tsx
<Input
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
  leftIcon={<Mail className="w-4 h-4" />}
/>
```

### Progress with Label
```tsx
<div className="space-y-2">
  <div className="flex justify-between text-body-sm">
    <span>Progresso</span>
    <span>{progress}%</span>
  </div>
  <Progress value={progress} max={100} />
</div>
```

---

## Accessibility Checklist

For each component, ensure:
- [ ] Proper ARIA labels
- [ ] Keyboard navigation support
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader friendly
- [ ] Error messages announced
- [ ] Loading states indicated

---

## Testing Checklist

For each component, test:
- [ ] Renders correctly
- [ ] All variants work
- [ ] All sizes work
- [ ] Hover states work
- [ ] Focus states work
- [ ] Disabled states work
- [ ] Loading states work (if applicable)
- [ ] Responsive on mobile
- [ ] Keyboard navigation works
- [ ] TypeScript types are correct

---

## Success Criteria

### Phase 1.3 Complete When:
- [ ] 5 core components built (Button, Card, Input, Progress, Typography)
- [ ] All components use design tokens
- [ ] All components follow MMXD principles
- [ ] Component showcase page created
- [ ] All components tested and working
- [ ] TypeScript types complete
- [ ] Accessibility standards met

---

## Resources

### Design Tokens
- File: `apps/web/src/design-tokens.json`
- All colors, typography, spacing, shadows, transitions

### Tailwind Config
- File: `apps/web/tailwind.config.js`
- All MMXD classes configured

### Existing Components (for reference)
- `apps/web/src/components/ui/Button.tsx`
- `apps/web/src/components/ui/Card.tsx`
- `apps/web/src/components/ui/Input.tsx`

### Documentation
- `IMPLEMENTATION_PLAN.md` - Full implementation strategy
- `STATUS.md` - Current project status
- `NEXT_STEPS.md` - Prioritized roadmap
- `docs/main/PRD.md` - MMXD philosophy

---

## Commands

### Start Development
```bash
cd apps/web
npm run dev
```

### Build for Production
```bash
cd apps/web
npm run build
```

### Run Linter
```bash
cd apps/web
npm run lint
```

---

## Questions?

If you're unsure about anything:
1. Check `IMPLEMENTATION_PLAN.md` for detailed guidance
2. Look at `apps/web/src/design-tokens.json` for exact values
3. Reference existing components for patterns
4. Read MMXD philosophy in `docs/main/PRD.md`

---

**Good luck! The foundation is solid. Now build beautiful, MMXD-compliant components! 🚀**
