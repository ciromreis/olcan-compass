# Design System: Quick Start Guide

> **Document:** Quick Start & Practical Examples
> **Version:** 1.0.0 | **Last Updated:** March 2026

## Getting Started in 5 Minutes

### Step 1: Install Dependencies

```bash
# In your Next.js app
npm install framer-motion lucide-react
npm install -D tailwindcss postcss autoprefixer
```

### Step 2: Copy Design Tokens

Create `styles/tokens.css` and copy the token definitions from `DESIGN_SYSTEM_TOKENS.md`

### Step 3: Configure Tailwind

Copy the Tailwind config from `DESIGN_SYSTEM_IMPLEMENTATION.md`

### Step 4: Import Fonts

```typescript
// app/layout.tsx
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';

const dmSerifDisplay = DM_Serif_Display({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-display'
});

const dmSans = DM_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-sans'
});

const jetBrainsMono = JetBrains_Mono({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-mono'
});
```

### Step 5: Create Your First Glass Component

```typescript
import { motion } from 'framer-motion';

export function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-md"
      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

## Common Patterns

### Hero Section with Glass Effect

```typescript
export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-bone-50 to-slate-950" />
      
      {/* Glass content card */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="glass-light rounded-3xl p-12 shadow-xl">
          <h1 className="font-display text-5xl text-ink-900 mb-6">
            Your Journey Begins Here
          </h1>
          <p className="font-sans text-lg text-ink-800 mb-8">
            Transform your international mobility dreams into reality
          </p>
          <button className="bg-flame-500 text-bone-50 px-8 py-3 rounded-xl font-medium hover:bg-flame-400 transition-colors">
            Start Your Journey
          </button>
        </div>
      </motion.div>
    </section>
  );
}
```

### Archetype-Themed Dashboard

```typescript
'use client';

import { useEffect } from 'react';
import { useArchetypeTheme } from '@olcan/ui/utils/archetype-theme';

export function Dashboard({ user }: { user: User }) {
  useArchetypeTheme(user.archetype, user.evolutionStage);
  
  return (
    <div className="min-h-screen bg-bone-50 dark:bg-slate-950">
      <header className="sticky top-0 z-50 glass-light h-16 border-b border-bone-300">
        <nav className="container mx-auto px-6 h-full flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </nav>
      </header>
      
      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ArchetypeCard archetype={user.archetype} stage={user.evolutionStage} />
          <StatsPanel stats={user.stats} />
          <ProgressTracker progress={user.progress} />
        </div>
      </main>
    </div>
  );
}
```


### Narrative Forge Editor Pattern

```typescript
export function NarrativeForge() {
  const [content, setContent] = useState('');
  const [charCount, setCharCount] = useState(0);
  const maxChars = 500;
  
  return (
    <div className="glass-light rounded-2xl p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl text-ink-900">Narrative Forge</h2>
        <CharacterCounter current={charCount} max={maxChars} />
      </div>
      
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setCharCount(e.target.value.length);
        }}
        className="w-full min-h-[300px] p-4 bg-bone-50 border border-bone-300 rounded-xl font-sans text-base text-ink-900 focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all"
        placeholder="Begin crafting your story..."
      />
      
      <div className="mt-4 flex gap-4">
        <button className="bg-flame-500 text-bone-50 px-6 py-2 rounded-lg font-medium hover:bg-flame-400 transition-colors">
          Polish with AI
        </button>
        <button className="glass-light px-6 py-2 rounded-lg font-medium text-ink-900 hover:bg-white/85 transition-colors">
          Save Draft
        </button>
      </div>
    </div>
  );
}

function CharacterCounter({ current, max }: { current: number; max: number }) {
  const percentage = (current / max) * 100;
  const isWarning = percentage > 80;
  const isError = percentage > 100;
  
  return (
    <div className="flex items-center gap-2">
      <span className={cn(
        'font-mono text-sm',
        isError ? 'text-red-500' : isWarning ? 'text-yellow-600' : 'text-ink-700'
      )}>
        {current} / {max}
      </span>
      <div className="w-24 h-2 bg-bone-200 rounded-full overflow-hidden">
        <motion.div
          className={cn(
            'h-full',
            isError ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-flame-500'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
```

### Archetype Evolution Animation

```typescript
export function ArchetypeEvolutionModal({ 
  oldStage, 
  newStage, 
  archetype 
}: EvolutionProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm" />
        
        {/* Evolution card */}
        <motion.div
          className="relative z-10 glass-light rounded-3xl p-12 max-w-lg"
          variants={evolutionVariants}
          initial="initial"
          animate="evolving"
        >
          <div className="text-center">
            <motion.div
              className="w-32 h-32 mx-auto mb-6"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360, 360]
              }}
              transition={{ duration: 1.5 }}
            >
              <ArchetypeSpirit archetype={archetype} stage={newStage} />
            </motion.div>
            
            <h2 className="font-display text-3xl text-ink-900 mb-2">
              Evolution Complete!
            </h2>
            <p className="font-sans text-lg text-ink-800 mb-6">
              You've reached {newStage} stage
            </p>
            
            <button className="bg-flame-500 text-bone-50 px-8 py-3 rounded-xl font-medium">
              Continue Journey
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

### Fear Reframe Card

```typescript
export function FearReframeCard({ 
  fearCluster, 
  archetype 
}: FearReframeProps) {
  const fearConfig = {
    competence: {
      color: '#F59E0B',
      icon: ShieldAlert,
      question: 'Is your expertise a cage?',
      message: 'Your skills are transferable. The world needs what you know.'
    },
    rejection: {
      color: '#EF4444',
      icon: UserX,
      question: 'Fear they won\'t accept you?',
      message: 'Diversity is valued. Your unique perspective is an asset.'
    },
    loss: {
      color: '#8B5CF6',
      icon: Anchor,
      question: 'Worried about leaving everything behind?',
      message: 'You\'re not losing, you\'re expanding. Home will always be there.'
    },
    irreversibility: {
      color: '#64748B',
      icon: ArrowLeftRight,
      question: 'Afraid there\'s no going back?',
      message: 'Every path has exits. This is exploration, not exile.'
    }
  };
  
  const config = fearConfig[fearCluster];
  const Icon = config.icon;
  
  return (
    <motion.div
      className="glass-light rounded-2xl p-8 border-2"
      style={{ 
        borderColor: config.color,
        boxShadow: `0 0 30px ${config.color}33`
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Icon size={64} color={config.color} className="mb-4" />
      
      <h3 className="font-display text-2xl text-ink-900 mb-3">
        {config.question}
      </h3>
      
      <p className="font-sans text-base text-ink-800 leading-relaxed mb-6">
        {config.message}
      </p>
      
      <button 
        className="bg-flame-500 text-bone-50 px-6 py-2 rounded-lg font-medium hover:bg-flame-400 transition-colors"
      >
        Face This Fear
      </button>
    </motion.div>
  );
}
```

### Mentor Card with Archetype Matching

```typescript
export function MentorCard({ mentor }: { mentor: Mentor }) {
  const archetypeMatch = mentor.specialties.includes(user.archetype);
  
  return (
    <motion.div
      className="glass-light rounded-2xl p-6 hover:shadow-lg transition-shadow"
      whileHover={{ y: -4 }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <img
            src={mentor.avatar}
            alt={mentor.name}
            className="w-16 h-16 rounded-full border-2 border-[var(--archetype-color)]"
          />
          {archetypeMatch && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-flame-500 rounded-full flex items-center justify-center">
              <Check size={14} className="text-bone-50" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-sans font-bold text-lg text-ink-900">
            {mentor.name}
          </h3>
          <p className="font-sans text-sm text-ink-700">
            {mentor.title}
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {mentor.specialties.map((specialty) => (
          <span
            key={specialty}
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: `${getArchetypeColor(specialty)}1A`,
              color: getArchetypeColor(specialty),
              border: `1px solid ${getArchetypeColor(specialty)}33`
            }}
          >
            {specialty}
          </span>
        ))}
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <Star size={16} className="text-yellow-500 fill-yellow-500" />
          <span className="font-mono text-sm text-ink-900">
            {mentor.rating}
          </span>
          <span className="font-sans text-xs text-ink-700">
            ({mentor.reviews} reviews)
          </span>
        </div>
        
        <span className="font-mono text-lg font-bold text-ink-900">
          ${mentor.price}
        </span>
      </div>
      
      <button className="w-full bg-flame-500 text-bone-50 py-2 rounded-lg font-medium hover:bg-flame-400 transition-colors">
        Book Session
      </button>
    </motion.div>
  );
}
```

## Responsive Patterns

### Mobile-First Card Grid

```typescript
export function CardGrid({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {items.map((item) => (
        <Card key={item.id} hoverable>
          {/* Card content */}
        </Card>
      ))}
    </div>
  );
}
```

### Responsive Navigation

```typescript
export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <nav className="sticky top-0 z-50 glass-light h-16 border-b border-bone-300">
      <div className="container mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <Logo />
        
        {/* Desktop navigation */}
        {!isMobile && (
          <div className="flex items-center gap-6">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/opportunities">Opportunities</NavLink>
            <NavLink href="/marketplace">Marketplace</NavLink>
            <ThemeToggle />
          </div>
        )}
        
        {/* Mobile menu button */}
        {isMobile && (
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu size={24} />
          </button>
        )}
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && isMobile && (
          <motion.div
            className="absolute top-16 left-0 right-0 glass-light border-b border-bone-300 p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/opportunities">Opportunities</NavLink>
            <NavLink href="/marketplace">Marketplace</NavLink>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
```

## Performance Tips

### Lazy Load Heavy Components

```typescript
import dynamic from 'next/dynamic';

const InterviewSimulator = dynamic(
  () => import('@/components/InterviewSimulator'),
  { 
    loading: () => <LoadingSkeleton />,
    ssr: false 
  }
);
```

### Optimize Animations

```typescript
// Use transform and opacity only
const optimizedAnimation = {
  initial: { opacity: 0, transform: 'translateY(20px)' },
  animate: { opacity: 1, transform: 'translateY(0)' }
};

// Avoid animating width, height, top, left
const badAnimation = {
  initial: { width: 0, height: 0 },  // ❌ Causes reflow
  animate: { width: 200, height: 200 }
};
```

### Debounce Expensive Operations

```typescript
import { useDebouncedCallback } from 'use-debounce';

export function SearchInput() {
  const debouncedSearch = useDebouncedCallback(
    (value: string) => {
      // Expensive search operation
      performSearch(value);
    },
    300
  );
  
  return (
    <input
      type="text"
      onChange={(e) => debouncedSearch(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

## Common Mistakes to Avoid

### ❌ Don't: Stack Multiple Glass Surfaces

```typescript
// Bad: Glass on glass loses effect
<div className="glass-light">
  <div className="glass-light">
    Content
  </div>
</div>
```

### ✅ Do: Use Solid Backgrounds for Nested Content

```typescript
// Good: Glass container with solid content
<div className="glass-light">
  <div className="bg-bone-50 rounded-lg p-4">
    Content
  </div>
</div>
```

### ❌ Don't: Animate Width/Height

```typescript
// Bad: Causes layout reflow
<motion.div animate={{ width: 200, height: 200 }} />
```

### ✅ Do: Animate Transform/Opacity

```typescript
// Good: GPU accelerated
<motion.div animate={{ scale: 1.2, opacity: 1 }} />
```

### ❌ Don't: Use Hardcoded Colors

```typescript
// Bad: Not themeable
<div style={{ color: '#E8421A' }}>Text</div>
```

### ✅ Do: Use Design Tokens

```typescript
// Good: Themeable and consistent
<div className="text-flame-500">Text</div>
```

## Troubleshooting

### Glass Effect Not Working

**Problem:** Backdrop blur not visible
**Solution:** Ensure parent has background content and element has semi-transparent background

```css
/* Parent needs content behind it */
.parent {
  background: url('/pattern.png');
}

/* Glass element needs transparency */
.glass {
  background: rgba(255, 255, 255, 0.7);  /* Not solid! */
  backdrop-filter: blur(16px);
}
```

### Archetype Colors Not Updating

**Problem:** CSS variables not changing
**Solution:** Ensure theme manager is called and CSS variables are properly scoped

```typescript
// Call theme manager on mount
useEffect(() => {
  const manager = new ArchetypeThemeManager();
  manager.applyTheme(archetype, stage);
}, [archetype, stage]);
```

### Animations Janky on Mobile

**Problem:** Poor performance on mobile devices
**Solution:** Reduce animation complexity and use GPU acceleration

```css
/* Force GPU acceleration */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0);
}
```

## Next Steps

1. **Review Full Documentation:** Read all design system documents
2. **Set Up Development Environment:** Install dependencies and configure tools
3. **Build Component Library:** Start with primitives, then composites
4. **Implement Archetype System:** Create theme manager and dynamic theming
5. **Test Across Devices:** Ensure responsive behavior works everywhere
6. **Optimize Performance:** Profile and optimize animations and rendering

## Resources

- **Design Tokens:** `DESIGN_SYSTEM_TOKENS.md`
- **Components:** `DESIGN_SYSTEM_COMPONENTS.md`
- **Motion:** `DESIGN_SYSTEM_MOTION.md`
- **OIOS Integration:** `DESIGN_SYSTEM_OIOS_INTEGRATION.md`
- **Implementation:** `DESIGN_SYSTEM_IMPLEMENTATION.md`

---

**Ready to Build:** You now have everything needed to create a high-end, liquid-glass metamodern UI for Olcan Compass v2.5
