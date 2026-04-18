# Design System: Component Library Specification

> **Document:** Component Library
> **Version:** 1.0.0 | **Last Updated:** March 2026

## Component Architecture

### Component Classification

**Tier 1: Primitives** - Atomic building blocks
**Tier 2: Composites** - Combined primitives
**Tier 3: Patterns** - Complex feature components
**Tier 4: Templates** - Page-level compositions

### Component Anatomy

Every component must define:
1. **Visual States:** Default, hover, active, focus, disabled, loading, error
2. **Variants:** Size, color, style variations
3. **Composition:** How it combines with other components
4. **Accessibility:** ARIA labels, keyboard navigation, screen reader support
5. **Responsive Behavior:** Mobile, tablet, desktop adaptations

## Tier 1: Primitive Components

### Button Component

**Variants:**
- Primary (Flame gradient, high emphasis)
- Secondary (Glass surface, medium emphasis)
- Ghost (Transparent, low emphasis)
- Danger (Error color, destructive actions)

**Sizes:**
- Small: 32px height
- Medium: 40px height (default)
- Large: 48px height

**States:**
- Default, Hover, Active, Focus, Disabled, Loading

**Implementation Spec:**

```css
/* Primary Button */
.btn-primary {
  height: var(--button-height-md);
  padding: 0 var(--button-padding-x-md);
  background: var(--button-primary-bg);
  color: var(--button-primary-text);
  border: none;
  border-radius: var(--button-radius);
  font-family: var(--font-body);
  font-size: var(--button-font-size);
  font-weight: var(--button-font-weight);
  box-shadow: var(--button-primary-shadow);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: var(--button-primary-bg-hover);
  box-shadow: var(--button-primary-shadow-hover);
  transform: translateY(-1px);
}

.btn-primary:active:not(:disabled) {
  background: var(--button-primary-bg-active);
  transform: translateY(0);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Secondary Button (Glass) */
.btn-secondary {
  height: var(--button-height-md);
  padding: 0 var(--button-padding-x-md);
  background: var(--button-secondary-bg);
  backdrop-filter: blur(var(--button-secondary-blur));
  color: var(--button-secondary-text);
  border: 1px solid var(--button-secondary-border);
  border-radius: var(--button-radius);
  font-family: var(--font-body);
  font-size: var(--button-font-size);
  font-weight: var(--button-font-weight);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--button-secondary-bg-hover);
  border-color: var(--color-border-focus);
  transform: translateY(-1px);
}
```

**React Component Interface:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  children: ReactNode;
}
```

### Input Component

**Variants:**
- Text, Email, Password, Number, Tel, URL
- Textarea (multi-line)
- Search (with icon)

**States:**
- Default, Focus, Error, Disabled, Read-only

**Implementation Spec:**
```css
.input {
  width: 100%;
  height: var(--input-height);
  padding: var(--input-padding-y) var(--input-padding-x);
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--input-radius);
  font-family: var(--font-body);
  font-size: var(--text-body);
  color: var(--input-text);
  transition: all var(--transition-fast);
}

.input::placeholder {
  color: var(--input-placeholder);
}

.input:hover:not(:disabled) {
  border-color: var(--input-border-hover);
}

.input:focus {
  outline: none;
  border-color: var(--input-border-focus);
  box-shadow: var(--input-shadow-focus);
}

.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-bg-tertiary);
}

.input.error {
  border-color: var(--color-error);
}

.input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}
```

**React Component Interface:**
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: ReactNode;
  maxLength?: number;
  showCharCount?: boolean;
}
```

### Card Component

**Variants:**
- Standard (Glass surface)
- Feature (Elevated, solid)
- Archetype (Dynamic color theming)
- Interactive (Clickable with hover effects)

**Implementation Spec:**
```css
.card {
  background: var(--card-bg);
  backdrop-filter: blur(var(--card-blur));
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  padding: var(--card-padding);
  box-shadow: var(--card-shadow);
  transition: all var(--transition-normal);
}

.card:hover {
  background: var(--card-bg-hover);
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
}

.card-feature {
  background: var(--card-feature-bg);
  border: 1px solid var(--card-feature-border);
  padding: var(--card-feature-padding);
  box-shadow: var(--card-feature-shadow);
}

.card-archetype {
  background: var(--card-archetype-bg);
  border: 2px solid var(--card-archetype-border);
  box-shadow: var(--card-archetype-glow);
}
```

**React Component Interface:**
```typescript
interface CardProps {
  variant?: 'standard' | 'feature' | 'archetype' | 'interactive';
  padding?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  onClick?: () => void;
  children: ReactNode;
}
```

## Tier 2: Composite Components

### Navigation Bar

**Features:**
- Glass morphism background
- Sticky positioning
- Responsive collapse on mobile
- Theme toggle integration
- User profile dropdown

**Implementation Spec:**
```css
.navbar {
  position: sticky;
  top: 0;
  height: var(--nav-height);
  background: var(--nav-bg);
  backdrop-filter: blur(var(--nav-blur));
  border-bottom: 1px solid var(--nav-border);
  box-shadow: var(--nav-shadow);
  z-index: var(--z-sticky);
  padding: 0 var(--nav-padding-x);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-links {
  display: flex;
  gap: var(--spacing-component-lg);
  align-items: center;
}

.navbar-link {
  color: var(--nav-link-color);
  font-size: var(--nav-link-font-size);
  font-weight: var(--nav-link-font-weight);
  text-decoration: none;
  transition: color var(--transition-fast);
  position: relative;
}

.navbar-link:hover {
  color: var(--nav-link-color-hover);
}

.navbar-link.active {
  color: var(--nav-link-color-active);
}

.navbar-link.active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-brand-primary);
}

@media (max-width: 768px) {
  .navbar-links {
    display: none;
  }
  
  .navbar-mobile-menu {
    display: block;
  }
}
```

### Modal Dialog

**Features:**
- Backdrop with blur
- Focus trap
- Escape key to close
- Smooth enter/exit animations
- Responsive sizing

**Implementation Spec:**
```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: var(--modal-backdrop-bg);
  backdrop-filter: blur(var(--modal-backdrop-blur));
  z-index: var(--z-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-component-lg);
}

.modal {
  background: var(--modal-bg);
  border: 1px solid var(--modal-border);
  border-radius: var(--modal-radius);
  box-shadow: var(--modal-shadow);
  max-width: var(--modal-max-width);
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  padding: var(--spacing-component-xl);
  padding-bottom: var(--modal-header-padding-bottom);
  border-bottom: 1px solid var(--modal-header-border);
}

.modal-body {
  padding: var(--spacing-component-xl);
}

.modal-footer {
  padding: var(--spacing-component-xl);
  padding-top: var(--modal-header-padding-bottom);
  border-top: 1px solid var(--modal-header-border);
  display: flex;
  gap: var(--spacing-component-md);
  justify-content: flex-end;
}
```

### Toast Notification

**Features:**
- Auto-dismiss with timer
- Stack management
- Variant colors (success, warning, error, info)
- Action buttons
- Dismiss button

**Implementation Spec:**
```css
.toast-container {
  position: fixed;
  top: var(--spacing-component-lg);
  right: var(--spacing-component-lg);
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-component-md);
  max-width: var(--toast-max-width);
}

.toast {
  background: var(--toast-bg);
  border: 1px solid var(--toast-border);
  border-left: 4px solid var(--toast-accent-color);
  border-radius: var(--toast-radius);
  padding: var(--toast-padding);
  box-shadow: var(--toast-shadow);
  min-width: var(--toast-min-width);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-component-md);
}

.toast-success { --toast-accent-color: var(--toast-success-accent); }
.toast-warning { --toast-accent-color: var(--toast-warning-accent); }
.toast-error { --toast-accent-color: var(--toast-error-accent); }
.toast-info { --toast-accent-color: var(--toast-info-accent); }
```

## Tier 3: Pattern Components

### Narrative Forge Editor

**Features:**
- Rich text editing with character count
- Real-time AI suggestions
- Version history sidebar
- Word limit indicators
- Auto-save status

**Component Structure:**
```
<NarrativeForge>
  <EditorToolbar />
  <EditorCanvas>
    <CharacterCounter />
    <RichTextEditor />
    <AISuggestionPanel />
  </EditorCanvas>
  <VersionHistory />
</NarrativeForge>
```

**Key Specifications:**
- Glass surface for editor canvas
- Monospace font for character counting
- Flame accent for AI suggestion highlights
- Smooth transitions between versions
- Optimistic UI updates for auto-save

### Archetype Profile Card

**Features:**
- Dynamic archetype color theming
- Evolution stage indicator
- Fear cluster visualization
- Progress metrics
- Interactive hover states

**Component Structure:**
```
<ArchetypeCard>
  <ArchetypeIcon />
  <ArchetypeHeader>
    <ArchetypeName />
    <EvolutionStage />
  </ArchetypeHeader>
  <FearClusterIndicators />
  <ProgressMetrics />
  <EvolutionButton />
</ArchetypeCard>
```

**Key Specifications:**
- Archetype-specific glow effect
- Animated evolution transitions
- Glass surface with archetype border
- Responsive layout (stacks on mobile)

### Dashboard Stats Panel

**Features:**
- Data visualization
- Real-time updates
- Comparison metrics
- Trend indicators
- Interactive tooltips

**Component Structure:**
```
<StatsPanel>
  <StatCard>
    <StatIcon />
    <StatValue />
    <StatLabel />
    <StatTrend />
  </StatCard>
</StatsPanel>
```

**Key Specifications:**
- Monospace font for numbers
- Color-coded trends (green up, red down)
- Glass cards with subtle shadows
- Grid layout (responsive)


### Marketplace Mentor Card

**Features:**
- Mentor profile information
- Specialty tags
- Pricing display
- Rating and reviews
- Book session CTA

**Component Structure:**
```
<MentorCard>
  <MentorAvatar />
  <MentorInfo>
    <MentorName />
    <MentorTitle />
    <SpecialtyTags />
  </MentorInfo>
  <MentorStats>
    <Rating />
    <ReviewCount />
    <SessionCount />
  </MentorStats>
  <PricingInfo />
  <BookButton />
</MentorCard>
```

**Key Specifications:**
- Glass card with hover elevation
- Archetype color accent for specialties
- Flame CTA button
- Avatar with subtle glow
- Responsive: full-width mobile, grid desktop

### Interview Simulator Interface

**Features:**
- Audio waveform visualization
- Recording controls
- AI feedback panel
- Question display
- Progress tracker

**Component Structure:**
```
<InterviewSimulator>
  <QuestionPanel>
    <QuestionText />
    <QuestionTimer />
  </QuestionPanel>
  <AudioInterface>
    <Waveform />
    <RecordingControls />
    <AudioPlayback />
  </AudioInterface>
  <FeedbackPanel>
    <AIAnalysis />
    <ScoreBreakdown />
    <Suggestions />
  </FeedbackPanel>
  <ProgressTracker />
</InterviewSimulator>
```

**Key Specifications:**
- Dark slate background for focus
- Flame accent for recording indicator
- Real-time waveform animation
- Glass panels for feedback
- Monospace for timer display

## Tier 4: Template Components

### Dashboard Template

**Layout Structure:**
```
<DashboardTemplate>
  <Navbar />
  <Sidebar />
  <MainContent>
    <PageHeader />
    <ContentArea />
  </MainContent>
</DashboardTemplate>
```

**Responsive Behavior:**
- Mobile: Stacked, collapsible sidebar
- Tablet: Side-by-side with narrow sidebar
- Desktop: Full sidebar with expanded content

### Landing Page Template

**Section Structure:**
```
<LandingTemplate>
  <HeroSection />
  <FeaturesSection />
  <ArchetypesSection />
  <TestimonialsSection />
  <PricingSection />
  <CTASection />
  <Footer />
</LandingTemplate>
```

**Visual Flow:**
- Bone background transitions to Slate
- Glass cards throughout
- Flame CTAs at strategic points
- Archetype colors in features section

## Component States System

### Interactive States

**Hover State Rules:**
- Subtle elevation (2px translateY)
- Increased shadow depth
- Slight background opacity increase
- Smooth transition (150ms)

**Active State Rules:**
- Return to base position (0px translateY)
- Darker background/border
- Immediate feedback (no transition)

**Focus State Rules:**
- 2px outline with flame color
- 2px outline offset
- Visible on keyboard navigation only (:focus-visible)

**Disabled State Rules:**
- 50% opacity
- No pointer events
- Cursor: not-allowed
- No hover effects

**Loading State Rules:**
- Spinner or skeleton
- Disabled interactions
- Reduced opacity (70%)
- Loading text/icon

### Error States

**Form Error Display:**
```css
.form-field.error .input {
  border-color: var(--color-error);
}

.form-field.error .input:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.error-message {
  color: var(--color-error);
  font-size: var(--text-body-sm);
  margin-top: var(--spacing-component-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-component-xs);
}
```

### Empty States

**Empty State Pattern:**
```
<EmptyState>
  <EmptyStateIcon />
  <EmptyStateHeading />
  <EmptyStateDescription />
  <EmptyStateCTA />
</EmptyState>
```

**Visual Treatment:**
- Muted colors (tertiary text)
- Large icon (64px)
- Centered alignment
- Clear call-to-action

## Component Composition Rules

### Spacing Between Components

```css
/* Vertical rhythm */
.component-stack > * + * {
  margin-top: var(--spacing-component-lg);
}

/* Horizontal rhythm */
.component-row {
  display: flex;
  gap: var(--spacing-component-md);
}

/* Grid rhythm */
.component-grid {
  display: grid;
  gap: var(--spacing-gap-normal);
}
```

### Nesting Guidelines

**Maximum Nesting Depth:** 4 levels
```
Page Template
  └─> Section Container
      └─> Component Group
          └─> Individual Component
              └─> Component Elements
```

**Glass Nesting Rules:**
- Avoid stacking multiple glass surfaces
- Use solid backgrounds for nested content
- Increase blur intensity for deeper layers

## Accessibility Requirements

### Keyboard Navigation

**Tab Order:**
1. Skip to main content link
2. Primary navigation
3. Main content interactive elements
4. Secondary navigation/sidebar
5. Footer links

**Keyboard Shortcuts:**
- `/` - Focus search
- `Esc` - Close modal/dropdown
- `Arrow keys` - Navigate lists/menus
- `Enter/Space` - Activate buttons/links

### Screen Reader Support

**Required ARIA Labels:**
```html
<!-- Buttons -->
<button aria-label="Close modal">×</button>

<!-- Icons -->
<svg aria-hidden="true">...</svg>
<span class="sr-only">Icon description</span>

<!-- Form fields -->
<input aria-describedby="error-message" aria-invalid="true" />

<!-- Status messages -->
<div role="status" aria-live="polite">Saved successfully</div>
```

### Color Independence

All information must be conveyed through multiple channels:
- Color + Icon
- Color + Text
- Color + Pattern

**Example:** Error states use red color + error icon + error text

## Component Documentation Template

Each component must have:

```markdown
## [Component Name]

### Purpose
[What problem does this component solve?]

### Variants
- [Variant 1]: [Description and use case]
- [Variant 2]: [Description and use case]

### Props/API
[TypeScript interface or prop definitions]

### States
- Default: [Visual description]
- Hover: [Visual description]
- Active: [Visual description]
- Focus: [Visual description]
- Disabled: [Visual description]
- Loading: [Visual description]
- Error: [Visual description]

### Accessibility
- Keyboard navigation: [Behavior]
- Screen reader: [ARIA labels and announcements]
- Focus management: [Focus behavior]

### Usage Examples
[Code examples showing common use cases]

### Do's and Don'ts
✅ Do: [Best practices]
❌ Don't: [Anti-patterns]
```

---

**Next Document:** DESIGN_SYSTEM_MOTION.md - Animation and interaction patterns


## Tier 4: Feature-Specific Components

### Opportunity Card

**Purpose:** Display visa/scholarship opportunities with key information

**Component Structure:**
```
<OpportunityCard>
  <OpportunityHeader>
    <CountryFlag />
    <OpportunityTitle />
    <BookmarkButton />
  </OpportunityHeader>
  <OpportunityDetails>
    <VisaType />
    <Deadline />
    <MatchScore />
  </OpportunityDetails>
  <OpportunityFooter>
    <RequirementTags />
    <ViewDetailsButton />
  </OpportunityFooter>
</OpportunityCard>
```

**Implementation:**
```typescript
interface OpportunityCardProps {
  opportunity: {
    id: string;
    country: string;
    title: string;
    visaType: string;
    deadline: Date;
    matchScore: number;
    requirements: string[];
    bookmarked: boolean;
  };
  onBookmark: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export function OpportunityCard({ opportunity, onBookmark, onViewDetails }: OpportunityCardProps) {
  const matchColor = opportunity.matchScore > 80 ? 'text-green-500' : 
                     opportunity.matchScore > 60 ? 'text-yellow-500' : 'text-ink-700';
  
  return (
    <motion.div
      className="glass-light rounded-2xl p-6 hover:shadow-lg"
      whileHover={{ y: -4 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{getFlagEmoji(opportunity.country)}</span>
          <div>
            <h3 className="font-sans font-bold text-lg text-ink-900">
              {opportunity.title}
            </h3>
            <p className="font-sans text-sm text-ink-700">
              {opportunity.visaType}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => onBookmark(opportunity.id)}
          className="p-2 hover:bg-ink-900/5 rounded-lg transition-colors"
        >
          <Bookmark 
            size={20} 
            className={opportunity.bookmarked ? 'fill-flame-500 text-flame-500' : 'text-ink-700'}
          />
        </button>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <Calendar size={16} className="text-ink-700" />
          <span className="font-mono text-sm text-ink-800">
            {formatDeadline(opportunity.deadline)}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Target size={16} className={matchColor} />
          <span className={cn('font-mono text-sm font-bold', matchColor)}>
            {opportunity.matchScore}% Match
          </span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {opportunity.requirements.slice(0, 3).map((req) => (
          <span
            key={req}
            className="px-2 py-1 bg-bone-200 text-ink-800 rounded-md text-xs font-medium"
          >
            {req}
          </span>
        ))}
        {opportunity.requirements.length > 3 && (
          <span className="px-2 py-1 text-ink-700 text-xs">
            +{opportunity.requirements.length - 3} more
          </span>
        )}
      </div>
      
      <button
        onClick={() => onViewDetails(opportunity.id)}
        className="w-full bg-flame-500 text-bone-50 py-2 rounded-lg font-medium hover:bg-flame-400 transition-colors"
      >
        View Details
      </button>
    </motion.div>
  );
}
```

### Progress Tracker Component

**Purpose:** Visualize user's journey progress with archetype theming

**Implementation:**
```typescript
interface ProgressTrackerProps {
  steps: {
    id: string;
    label: string;
    completed: boolean;
    current: boolean;
  }[];
  archetype: OIOSArchetype;
}

export function ProgressTracker({ steps, archetype }: ProgressTrackerProps) {
  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;
  
  return (
    <div className="glass-light rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-sans font-bold text-lg text-ink-900">
          Your Journey
        </h3>
        <span className="font-mono text-sm text-ink-700">
          {completedCount} / {steps.length}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-2 bg-bone-200 rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `var(--archetype-color)` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      
      {/* Step list */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="flex items-center gap-3"
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm font-bold transition-all',
                step.completed && 'bg-[var(--archetype-color)] text-bone-50',
                step.current && !step.completed && 'border-2 border-[var(--archetype-color)] text-[var(--archetype-color)]',
                !step.completed && !step.current && 'bg-bone-200 text-ink-700'
              )}
            >
              {step.completed ? <Check size={16} /> : index + 1}
            </div>
            
            <span
              className={cn(
                'font-sans text-sm',
                step.completed && 'text-ink-900 font-medium',
                step.current && 'text-ink-900 font-bold',
                !step.completed && !step.current && 'text-ink-700'
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Stats Dashboard Panel

**Purpose:** Display key metrics with visual hierarchy

**Implementation:**
```typescript
interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  icon: React.ReactNode;
}

export function StatCard({ label, value, trend, icon }: StatCardProps) {
  return (
    <div className="glass-light rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-bone-200 rounded-lg">
          {icon}
        </div>
        
        {trend && (
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
            trend.direction === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          )}>
            {trend.direction === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.value}
          </div>
        )}
      </div>
      
      <div className="font-mono text-3xl font-bold text-ink-900 mb-1">
        {value}
      </div>
      
      <div className="font-sans text-sm text-ink-700">
        {label}
      </div>
    </div>
  );
}

export function StatsDashboard({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.id} {...stat} />
      ))}
    </div>
  );
}
```

## Component Composition Examples

### Dashboard Layout

```typescript
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bone-50 dark:bg-slate-950">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 lg:p-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
```

### Landing Page Hero

```typescript
export function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-bone-50 via-bone-100 to-slate-950">
        <AnimatedOrbs />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-5xl lg:text-6xl text-ink-900 mb-6">
            Your Global Journey,
            <br />
            <span className="text-flame-500">Intelligently Guided</span>
          </h1>
          
          <p className="font-sans text-lg lg:text-xl text-ink-800 mb-8 max-w-2xl mx-auto">
            Transform your international mobility dreams into reality with AI-powered guidance tailored to your unique archetype
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-flame-500 text-bone-50 px-8 py-4 rounded-xl font-medium text-lg hover:bg-flame-400 transition-colors shadow-lg hover:shadow-xl">
              Start Your Journey
            </button>
            
            <button className="glass-light px-8 py-4 rounded-xl font-medium text-lg text-ink-900 hover:bg-white/85 transition-colors">
              Discover Your Archetype
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

## Design System Checklist

### Before Launch

- [ ] All design tokens defined and documented
- [ ] Primitive components built and tested
- [ ] Composite components implemented
- [ ] Pattern components created
- [ ] Archetype theming system working
- [ ] Dark mode fully functional
- [ ] Responsive behavior verified on all breakpoints
- [ ] Accessibility audit completed (WCAG AA)
- [ ] Performance optimization done
- [ ] Storybook documentation complete
- [ ] Component tests written
- [ ] Visual regression tests set up

### Quality Gates

**Visual Quality:**
- No layout shifts (CLS < 0.1)
- Smooth animations (60fps)
- Consistent spacing throughout
- Proper contrast ratios

**Technical Quality:**
- TypeScript strict mode
- No console errors
- Lighthouse score > 90
- Bundle size optimized

**Accessibility Quality:**
- Keyboard navigation works
- Screen reader compatible
- Focus indicators visible
- Color contrast compliant

---

**Design System Status:** Complete and ready for implementation
**Next Phase:** Begin component library development in monorepo structure
