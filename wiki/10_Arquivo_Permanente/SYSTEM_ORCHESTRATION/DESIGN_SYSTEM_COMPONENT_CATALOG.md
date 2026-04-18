# Design System: Complete Component Catalog

> **Document:** Component Reference Catalog
> **Version:** 1.0.0 | **Last Updated:** March 2026
> **Purpose:** Comprehensive list of all components with specifications

## Component Inventory

### Tier 1: Primitives (15 components)

| Component | Variants | States | Priority | Status |
|-----------|----------|--------|----------|--------|
| Button | Primary, Secondary, Ghost, Danger | 7 states | P0 | Not Started |
| Input | Text, Email, Password, Number | 5 states | P0 | Not Started |
| Textarea | Standard, Resizable | 5 states | P0 | Not Started |
| Select | Standard, Multi-select | 5 states | P1 | Not Started |
| Checkbox | Standard, Indeterminate | 4 states | P1 | Not Started |
| Radio | Standard | 4 states | P1 | Not Started |
| Switch | Standard | 3 states | P1 | Not Started |
| Badge | Solid, Outline, Dot | 3 variants | P1 | Not Started |
| Tag | Removable, Static | 2 variants | P1 | Not Started |
| Avatar | Image, Initials, Icon | 4 sizes | P1 | Not Started |
| Icon | Lucide wrapper | 6 sizes | P0 | Not Started |
| Card | Standard, Feature, Archetype | 3 variants | P0 | Not Started |
| Divider | Horizontal, Vertical | 2 variants | P2 | Not Started |
| Spinner | Circle, Dots, Bars | 3 variants | P1 | Not Started |
| Progress | Linear, Circular | 2 variants | P1 | Not Started |

### Tier 2: Composites (12 components)

| Component | Features | Complexity | Priority | Status |
|-----------|----------|------------|----------|--------|
| Navbar | Glass, Sticky, Responsive | Medium | P0 | Not Started |
| Sidebar | Collapsible, Glass | Medium | P0 | Not Started |
| Modal | Backdrop, Focus trap, Animations | High | P0 | Not Started |
| Dropdown | Menu, Select, Nested | Medium | P1 | Not Started |
| Toast | Stack, Auto-dismiss, Variants | Medium | P1 | Not Started |
| Tooltip | Positioning, Delay | Low | P1 | Not Started |
| Popover | Positioning, Click/Hover | Medium | P2 | Not Started |
| Tabs | Horizontal, Vertical | Low | P1 | Not Started |
| Accordion | Single, Multiple | Low | P2 | Not Started |
| Breadcrumb | Standard, Collapsed | Low | P2 | Not Started |
| Pagination | Standard, Compact | Low | P2 | Not Started |
| ThemeToggle | Light/Dark/System | Low | P0 | Not Started |

### Tier 3: Patterns (10 components)

| Component | Purpose | Complexity | Priority | Status |
|-----------|---------|------------|----------|--------|
| NarrativeForge | Essay editor with AI | Very High | P0 | Not Started |
| ArchetypeCard | User profile with theming | High | P0 | Not Started |
| MentorCard | Marketplace mentor display | Medium | P0 | Not Started |
| OpportunityCard | Visa/scholarship display | Medium | P0 | Not Started |
| ProgressTracker | Journey visualization | Medium | P0 | Not Started |
| StatsDashboard | Metrics panel | Medium | P1 | Not Started |
| FearReframeCard | Nudge system | Medium | P1 | Not Started |
| InterviewSimulator | Audio interface | Very High | P1 | Not Started |
| EvolutionModal | Archetype evolution | High | P1 | Not Started |
| TimelineView | Journey timeline | Medium | P2 | Not Started |

### Tier 4: Templates (6 templates)

| Template | Purpose | Complexity | Priority | Status |
|----------|---------|------------|----------|--------|
| DashboardLayout | Main app layout | Medium | P0 | Not Started |
| LandingPage | Marketing page | High | P0 | Not Started |
| AuthLayout | Login/signup pages | Low | P0 | Not Started |
| OnboardingFlow | User onboarding | High | P1 | Not Started |
| ProfilePage | User profile view | Medium | P1 | Not Started |
| MarketplacePage | Mentor marketplace | High | P1 | Not Started |

## Priority Definitions

**P0 (Critical):** Must have for MVP, blocks other work
**P1 (High):** Important for launch, needed soon
**P2 (Medium):** Nice to have, can be added post-launch

## Implementation Sequence

### Week 1: Foundation + Critical Primitives
```
Day 1-2: Monorepo setup, tokens, Tailwind config
Day 3-4: Button, Input, Card, Icon
Day 5: Testing setup, Storybook config
```

### Week 2: Remaining Primitives + Key Composites
```
Day 1-2: Textarea, Select, Badge, Tag, Avatar
Day 3-4: Navbar, Sidebar, Modal
Day 5: ThemeToggle, responsive testing
```

### Week 3: Composites + Pattern Foundation
```
Day 1-2: Toast, Dropdown, Tooltip, Tabs
Day 3-4: ArchetypeCard, ProgressTracker
Day 5: Archetype theme manager implementation
```

### Week 4: Core Patterns
```
Day 1-2: NarrativeForge (complex)
Day 3: MentorCard, OpportunityCard
Day 4: StatsDashboard, FearReframeCard
Day 5: Integration testing
```

### Week 5: Advanced Patterns + Templates
```
Day 1-2: InterviewSimulator (very complex)
Day 3: EvolutionModal, TimelineView
Day 4-5: DashboardLayout, LandingPage, AuthLayout
```

### Week 6: Polish + Launch Prep
```
Day 1-2: Animation refinements
Day 3: Accessibility audit and fixes
Day 4: Performance optimization
Day 5: Final QA and documentation
```

## Component Development Checklist

### For Each Component

**Design Phase:**
- [ ] Visual design approved
- [ ] Variants defined
- [ ] States documented
- [ ] Responsive behavior specified
- [ ] Accessibility requirements listed

**Development Phase:**
- [ ] TypeScript interface defined
- [ ] Component implemented
- [ ] All variants working
- [ ] All states functional
- [ ] Responsive behavior tested

**Testing Phase:**
- [ ] Unit tests written
- [ ] Accessibility tested
- [ ] Visual regression test
- [ ] Cross-browser tested
- [ ] Performance profiled

**Documentation Phase:**
- [ ] Storybook story created
- [ ] Props documented
- [ ] Usage examples provided
- [ ] Do's and don'ts listed
- [ ] Code review completed

## Quality Gates

### Before Component Approval

**Visual Quality:**
- Matches design specifications exactly
- Consistent with design system tokens
- Smooth animations (60fps)
- No visual glitches

**Technical Quality:**
- TypeScript strict mode passes
- No console errors or warnings
- Proper prop validation
- Error boundaries implemented

**Accessibility Quality:**
- WCAG 2.1 AA compliant
- Keyboard navigation works
- Screen reader compatible
- Focus indicators visible

**Performance Quality:**
- Renders in < 16ms
- No unnecessary re-renders
- Optimized bundle size
- Lazy loaded if heavy

## Code Standards

### Component File Structure

```
Button/
├── Button.tsx           # Main component
├── Button.test.tsx      # Unit tests
├── Button.stories.tsx   # Storybook stories
├── Button.types.ts      # TypeScript interfaces
├── index.ts             # Public exports
└── README.md            # Component documentation
```

### Component Template

```typescript
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

/**
 * [Component Name]
 * 
 * [Brief description of purpose and usage]
 * 
 * @example
 * ```tsx
 * <ComponentName variant="primary">
 *   Content
 * </ComponentName>
 * ```
 */

interface ComponentNameProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  // ... other props
}

export const ComponentName = forwardRef<HTMLButtonElement, ComponentNameProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          'base-styles',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

ComponentName.displayName = 'ComponentName';
```

## Testing Standards

### Unit Test Template

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName>Test</ComponentName>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  
  it('applies variant styles', () => {
    render(<ComponentName variant="primary">Test</ComponentName>);
    // Assert styles
  });
  
  it('handles interactions', () => {
    const handleClick = jest.fn();
    render(<ComponentName onClick={handleClick}>Test</ComponentName>);
    fireEvent.click(screen.getByText('Test'));
    expect(handleClick).toHaveBeenCalled();
  });
  
  it('meets accessibility standards', () => {
    render(<ComponentName>Test</ComponentName>);
    // Assert ARIA attributes, keyboard navigation
  });
});
```

### Storybook Story Template

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Category/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary']
    }
  }
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

export const Default: Story = {
  args: {
    children: 'Default'
  }
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <ComponentName variant="primary">Primary</ComponentName>
      <ComponentName variant="secondary">Secondary</ComponentName>
    </div>
  )
};
```

## Design System Governance

### Change Request Process

1. **Proposal:** Submit design system change request
2. **Review:** Design system team reviews impact
3. **Approval:** Stakeholders approve changes
4. **Implementation:** Update tokens/components
5. **Documentation:** Update all affected docs
6. **Communication:** Announce changes to team

### Version Control

**Semantic Versioning:**
- **Major (2.0.0):** Breaking changes to component APIs
- **Minor (1.1.0):** New components or features
- **Patch (1.0.1):** Bug fixes and refinements

### Deprecation Policy

**Timeline:**
- **Announcement:** 2 weeks before deprecation
- **Warning Period:** 4 weeks with console warnings
- **Removal:** After 6 weeks total

## Support and Resources

### Documentation
- Design system docs: `/docs/v2.5/DESIGN_SYSTEM_*.md`
- Storybook: `http://localhost:6006`
- Component tests: `/packages/ui/src/components/**/*.test.tsx`

### Communication Channels
- Design system Slack channel
- Weekly design system sync
- GitHub discussions for proposals

### Training Resources
- Onboarding guide for new developers
- Video tutorials for complex components
- Office hours for questions

---

**Catalog Status:** Complete
**Total Components:** 43 (15 primitives + 12 composites + 10 patterns + 6 templates)
**Implementation Ready:** Yes
**Next Action:** Begin Phase 1 development
