# Responsive Design Guidelines

## Breakpoints

Tailwind CSS default breakpoints (mobile-first):
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Testing Breakpoints

Required test widths per spec:
- 320px (small mobile)
- 768px (tablet)
- 1024px (desktop)
- 1440px (large desktop)

## Responsive Patterns

### Grid Layouts
```tsx
// 1 column mobile, 2 tablet, 3 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// 1 column mobile, 2 tablet, 4 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

### Spacing
```tsx
// Smaller padding on mobile
<div className="p-4 sm:p-6 lg:p-8">

// Responsive gaps
<div className="space-y-4 md:space-y-6 lg:space-y-8">
```

### Typography
```tsx
// Responsive text sizes (already configured in design tokens)
<h1 className="text-h1"> // Auto-responsive via tokens
<p className="text-body"> // Auto-responsive via tokens
```

### Navigation
- Desktop: Sidebar (w-64)
- Mobile: Bottom tab bar + hamburger menu

### Touch Targets
- Minimum 44x44px on mobile (use `.touch-target` utility)
- Buttons automatically meet this requirement

## Component Responsive Behavior

All screens follow these patterns:
- Grid layouts stack vertically on mobile
- Multi-column cards become single column
- Sidebar hidden on mobile, replaced with bottom tabs
- Padding reduces on smaller screens
- Touch targets meet 44px minimum
