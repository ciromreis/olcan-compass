# Component Specification Template

**Use this template for every component in the Olcan Compass design system.**

---

## Component Name: [Component Name]

**Category:** [Primitive / Atom / Molecule / Organism / Template]  
**Status:** [Planning / In Progress / Review / Complete]  
**Owner:** [Designer / Developer name]  
**Last Updated:** [Date]

---

## 📋 Overview

### Purpose
[1-2 sentences describing what this component does and why it exists]

### Use Cases
- [Primary use case]
- [Secondary use case]
- [Edge case if applicable]

### Replaces
[If this replaces an old component, list it here with migration notes]

---

## 🎨 Visual Specification

### Design Principles
[How does this component embody the liquid-glass metamodern aesthetic?]

### Visual Hierarchy
```
Layer 0: [Background element]
Layer 1: [Primary glass surface]
Layer 2: [Content layer]
Layer 3: [Interactive elements]
Layer 4: [Glow/focus effects]
```

### Dimensions
- **Default size:** [width × height]
- **Minimum size:** [width × height]
- **Maximum size:** [width × height]
- **Responsive behavior:** [How it adapts to screen sizes]

### Spacing
- **Internal padding:** [top, right, bottom, left]
- **Content gap:** [spacing between child elements]
- **External margin:** [recommended spacing around component]

### Colors
```css
/* Background */
--component-bg: [color value];
--component-bg-hover: [color value];
--component-bg-active: [color value];

/* Border */
--component-border: [color value];
--component-border-hover: [color value];

/* Text */
--component-text: [color value];
--component-text-secondary: [color value];

/* Glow */
--component-glow: [color value];
--component-glow-hover: [color value];
```

### Glass Effect
- **Blur amount:** [px value]
- **Opacity:** [percentage]
- **Border style:** [solid/gradient/none]
- **Glow intensity:** [subtle/medium/strong]

### Typography
- **Font family:** [font stack]
- **Font size:** [size scale]
- **Font weight:** [weight value]
- **Line height:** [ratio]
- **Letter spacing:** [value]

---

## 🎭 States & Variants

### States
Document all interactive states:

#### Default State
- **Visual:** [Description]
- **Behavior:** [What happens in this state]

#### Hover State
- **Visual:** [Changes from default]
- **Animation:** [Transition details]
- **Duration:** [ms]

#### Active/Pressed State
- **Visual:** [Changes from hover]
- **Animation:** [Transition details]
- **Duration:** [ms]

#### Focus State
- **Visual:** [Focus indicator style]
- **Keyboard:** [How it appears with keyboard navigation]

#### Disabled State
- **Visual:** [Appearance when disabled]
- **Cursor:** [cursor style]
- **Opacity:** [value]

#### Loading State (if applicable)
- **Visual:** [Loading indicator style]
- **Animation:** [Loading animation details]

#### Success State (if applicable)
- **Visual:** [Success indicator]
- **Animation:** [Success animation]
- **Duration:** [How long it shows]

#### Error State (if applicable)
- **Visual:** [Error indicator]
- **Animation:** [Error animation]
- **Message:** [Error message display]

### Variants
Document all visual variants:

#### [Variant Name 1]
- **Purpose:** [When to use this variant]
- **Visual differences:** [How it differs from default]
- **Use cases:** [Specific scenarios]

#### [Variant Name 2]
- **Purpose:** [When to use this variant]
- **Visual differences:** [How it differs from default]
- **Use cases:** [Specific scenarios]

---

## 🎬 Animation & Motion

### Entrance Animation
```typescript
{
  initial: { /* initial state */ },
  animate: { /* animated state */ },
  transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
}
```

### Exit Animation
```typescript
{
  exit: { /* exit state */ },
  transition: { duration: 0.2, ease: [0.4, 0.0, 1, 1] }
}
```

### Interaction Animations
- **Hover:** [Animation description + timing]
- **Click:** [Animation description + timing]
- **Focus:** [Animation description + timing]

### Micro-Interactions
[List any delightful micro-interactions, e.g., ripple effects, particle effects, etc.]

### Performance Notes
- [Any performance considerations for animations]
- [GPU acceleration notes]
- [Reduced motion fallback]

---

## 🔧 Technical Specification

### Component API

```typescript
interface [ComponentName]Props {
  // Required props
  [propName]: [type];  // [description]
  
  // Optional props
  [propName]?: [type];  // [description]
  
  // Variant props
  variant?: 'default' | 'variant1' | 'variant2';
  size?: 'sm' | 'md' | 'lg';
  
  // State props
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
  
  // Event handlers
  onClick?: (event: React.MouseEvent) => void;
  onHover?: (event: React.MouseEvent) => void;
  
  // Style props
  className?: string;
  style?: React.CSSProperties;
  
  // Children
  children?: React.ReactNode;
}
```

### Default Props
```typescript
const defaultProps = {
  variant: 'default',
  size: 'md',
  disabled: false,
  loading: false,
};
```

### Dependencies
- [List any component dependencies]
- [List any library dependencies]
- [List any primitive components used]

### File Structure
```
/components/[ComponentName]
  ├── [ComponentName].tsx          # Main component
  ├── [ComponentName].styles.ts    # Styled components or CSS
  ├── [ComponentName].types.ts     # TypeScript types
  ├── [ComponentName].test.tsx     # Unit tests
  ├── [ComponentName].stories.tsx  # Storybook stories
  ├── [ComponentName].docs.mdx     # Documentation
  └── index.ts                     # Exports
```

---

## 📱 Responsive Behavior

### Mobile (< 768px)
- **Size adjustments:** [How component scales]
- **Interaction changes:** [Touch vs mouse]
- **Performance:** [Reduced effects if needed]

### Tablet (768px - 1024px)
- **Size adjustments:** [How component scales]
- **Layout changes:** [Any layout modifications]

### Desktop (> 1024px)
- **Full features:** [All effects enabled]
- **Hover states:** [Full hover interactions]

---

## ♿ Accessibility

### WCAG Compliance
- **Level:** [A / AA / AAA]
- **Tested with:** [Screen readers used for testing]

### Keyboard Navigation
- **Tab order:** [How component fits in tab order]
- **Keyboard shortcuts:** [Any keyboard shortcuts]
- **Focus management:** [How focus is handled]

### Screen Reader Support
- **ARIA role:** [role attribute]
- **ARIA labels:** [aria-label, aria-labelledby]
- **ARIA states:** [aria-disabled, aria-expanded, etc.]
- **Announcements:** [What screen reader announces]

### Color Contrast
- **Text contrast:** [ratio - must be 4.5:1 minimum]
- **Interactive elements:** [ratio - must be 3:1 minimum]
- **Focus indicators:** [ratio - must be 3:1 minimum]

### Reduced Motion
- **Fallback behavior:** [What happens with prefers-reduced-motion]
- **Essential motion:** [Which animations are kept]

### Touch Targets
- **Minimum size:** [44px × 44px minimum]
- **Spacing:** [Adequate spacing between targets]

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] Component renders without errors
- [ ] All props work as expected
- [ ] All variants render correctly
- [ ] All states work correctly
- [ ] Event handlers fire correctly
- [ ] Default props apply correctly

### Visual Regression Tests
- [ ] Default state screenshot
- [ ] All variant screenshots
- [ ] All state screenshots
- [ ] Responsive breakpoint screenshots

### Accessibility Tests
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Color contrast passes
- [ ] Focus indicators visible
- [ ] Reduced motion respected

### Performance Tests
- [ ] Renders in < 16ms (60fps)
- [ ] Animations run at 60fps
- [ ] No layout thrashing
- [ ] Efficient re-renders

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 📖 Usage Examples

### Basic Usage
```tsx
import { [ComponentName] } from '@/design-system';

function Example() {
  return (
    <[ComponentName]>
      [Basic example]
    </[ComponentName]>
  );
}
```

### With Variants
```tsx
<[ComponentName] variant="variant1" size="lg">
  [Variant example]
</[ComponentName]>
```

### With States
```tsx
<[ComponentName] loading={true}>
  [Loading state example]
</[ComponentName]>
```

### Complex Example
```tsx
<[ComponentName]
  variant="variant1"
  size="lg"
  onClick={handleClick}
  disabled={isDisabled}
>
  [Complex example with multiple props]
</[ComponentName]>
```

---

## ✅ Do's and ❌ Don'ts

### Do's
- ✅ [Good practice 1]
- ✅ [Good practice 2]
- ✅ [Good practice 3]

### Don'ts
- ❌ [Bad practice 1]
- ❌ [Bad practice 2]
- ❌ [Bad practice 3]

---

## 🎨 Design Tokens Used

### Colors
- `--bg-deep`
- `--glass-neutral`
- `--accent-primary`
- [List all tokens used]

### Spacing
- `--space-4`
- `--space-6`
- [List all tokens used]

### Typography
- `--text-base`
- `--font-sans`
- `--weight-medium`
- [List all tokens used]

### Effects
- `--glow-medium`
- `--radius-lg`
- [List all tokens used]

---

## 🔗 Related Components

- **[Related Component 1]** - [How they relate]
- **[Related Component 2]** - [How they relate]
- **[Related Component 3]** - [How they relate]

---

## 📝 Implementation Notes

### Technical Challenges
[Any technical challenges encountered or anticipated]

### Performance Considerations
[Any performance optimizations or concerns]

### Browser Compatibility
[Any browser-specific issues or polyfills needed]

### Future Enhancements
- [ ] [Potential future feature 1]
- [ ] [Potential future feature 2]
- [ ] [Potential future feature 3]

---

## 📚 References

### Design Inspiration
- [Link to design reference 1]
- [Link to design reference 2]

### Technical References
- [Link to technical documentation]
- [Link to library documentation]

### Accessibility References
- [Link to WCAG guideline]
- [Link to ARIA pattern]

---

## 🔄 Changelog

### [Version] - [Date]
- [Change description]

### [Version] - [Date]
- [Change description]

---

## ✅ Completion Checklist

### Design Phase
- [ ] Visual specification complete
- [ ] All states documented
- [ ] All variants documented
- [ ] Mockups created
- [ ] Design review approved

### Development Phase
- [ ] Component implemented
- [ ] TypeScript types defined
- [ ] All variants working
- [ ] All states working
- [ ] Animations implemented

### Testing Phase
- [ ] Unit tests written
- [ ] Visual regression tests added
- [ ] Accessibility tests passed
- [ ] Performance tests passed
- [ ] Browser testing complete

### Documentation Phase
- [ ] Storybook story created
- [ ] Usage examples written
- [ ] Do's and don'ts documented
- [ ] API documentation complete
- [ ] Migration guide (if replacing old component)

### Review Phase
- [ ] Code review completed
- [ ] Design review completed
- [ ] Accessibility review completed
- [ ] Performance review completed
- [ ] Documentation review completed

---

**Status:** [Planning / In Progress / Review / Complete]  
**Ready for Production:** [Yes / No]  
**Blockers:** [List any blockers]

---

*This specification should be kept up-to-date as the component evolves. Any changes to the component should be reflected in this document.*
