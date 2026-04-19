# UX Polish & Branding Consistency Plan

**Date**: April 17, 2026  
**Status**: In Progress  
**Priority**: HIGH

---

## 🎯 User Feedback Summary

### Issues Identified

1. **Forge Flow Issues**
   - Buttons going off-screen on mobile
   - Weird flow between views
   - Not clear where to manage/adapt documents
   - Export functionality not visible/easy

2. **Branding Inconsistencies**
   - Some components feel "off-brand"
   - GitHub repos not 100% integrated
   - Design system not consistently applied

3. **Redundant UI Elements**
   - Message balloon (bottom left) vs Companion (top left)
   - Same functionality, poor alignment
   - Confusing for users

---

## ✅ Completed (This Session)

### 1. Forge Layout Fixes
- ✅ Made header responsive (flex-col on mobile)
- ✅ Reduced button sizes to prevent overflow
- ✅ Added document count summary
- ✅ Improved view toggle layout

### 2. Export Functionality
- ✅ Created `DossierExportPreview` component
- ✅ Added "Exportar Dossier" button to Forge page
- ✅ Preview with Olcan branding (logo, colors)
- ✅ PDF/DOCX/ZIP export options (stubs ready)

### 3. Document Management
- ✅ Created `DocumentManagementPanel` component
- ✅ Added to document detail sidebar
- ✅ Readiness level selector (draft/review/export-ready/submitted)
- ✅ Shows bound opportunities
- ✅ Export/duplicate/delete actions

---

## 🚧 Remaining Work

### Priority 1: Consolidate Companion UI

**Problem**: Two separate companion interfaces
- **Top left**: Companion toggle (nav area)
- **Bottom left**: Message balloon

**Solution**: Merge into single unified interface

**Files to Modify**:
- `src/components/layout/AppLayout.tsx` — Main layout
- `src/components/companion/CompanionPanel.tsx` — Companion UI
- `src/components/ui/MessageBalloon.tsx` — Message balloon (if exists)

**Design**:
```
┌─────────────────────────────────────┐
│ [Olcan Logo]  [Nav]    [👤 Profile] │
│                                     │
│                     [💬 Companion]  │ ← Single toggle, top right
└─────────────────────────────────────┘

When open:
┌─────────────────────────────────────┐
│                                     │
│                  ┌──────────────────┤
│                  │ 💬 Olcan Aura    │
│                  │                  │
│                  │ Como posso       │
│                  │ ajudar?          │
│                  │                  │
│                  │ [Input field]    │
│                  └──────────────────┤
└─────────────────────────────────────┘
```

---

### Priority 2: Branding Consistency Audit

**Olcan Design System**:
- **Primary Color**: `#001338` (Deep Navy)
- **Brand Color**: `#4F46E5` (Indigo) — for CTAs
- **Accent**: `#10B981` (Emerald) — for success
- **Typography**: 
  - Headings: `font-heading` (likely Inter or similar)
  - Body: `font-sans`
- **Spacing**: Consistent use of Tailwind spacing scale
- **Borders**: `rounded-xl` or `rounded-2xl` for cards
- **Shadows**: Subtle, glass-morphism style

**Components to Audit**:
1. ✅ Forge page — DONE (uses Olcan colors)
2. ✅ Document detail — DONE (added management panel)
3. ⏳ Applications page
4. ⏳ Interviews page
5. ⏳ Dashboard
6. ⏳ Quiz page
7. ⏳ Profile pages
8. ⏳ Onboarding flow

**Checklist per Component**:
- [ ] Uses `#001338` for primary text/elements
- [ ] Uses `font-heading` for titles
- [ ] Consistent button styles (rounded-xl, proper padding)
- [ ] Proper spacing (p-4, p-6, gap-4, etc.)
- [ ] Glass-morphism cards where appropriate
- [ ] Consistent icon sizes (h-4 w-4 for small, h-5 w-5 for medium)
- [ ] Proper color coding (emerald for success, amber for warning, clay for danger)

---

### Priority 3: GitHub Repo Integration

**Issue**: Some repos not fully integrated

**Repos to Check**:
1. `@olcan/ui-components` — Shared UI library
2. `@olcan/shared-auth` — Auth utilities
3. Any other workspace packages

**Action Items**:
- [ ] Verify all imports resolve correctly
- [ ] Check for version mismatches
- [ ] Ensure consistent styling from shared components
- [ ] Update any deprecated APIs

---

### Priority 4: Component Polish

**Specific Issues to Fix**:

1. **Buttons**
   - Standardize sizes: `px-4 py-2` (small), `px-6 py-3` (medium)
   - Consistent hover states
   - Proper disabled states
   - Loading states where needed

2. **Cards**
   - Use `GlassCard` component consistently
   - Proper padding: `p-4` or `p-6`
   - Consistent border radius: `rounded-2xl`

3. **Forms**
   - Consistent input styling
   - Proper label positioning
   - Error states
   - Helper text styling

4. **Modals**
   - Consistent header/footer
   - Proper close button placement
   - Backdrop styling
   - Animation consistency

5. **Navigation**
   - Active state styling
   - Hover states
   - Mobile menu consistency

---

## 📋 Implementation Steps

### Step 1: Consolidate Companion UI (1-2 hours)

```typescript
// src/components/layout/AppLayout.tsx

// Remove message balloon
// Add unified companion toggle to header
// Position: top right, next to profile

<header className="flex items-center justify-between">
  <div className="flex items-center gap-4">
    <Logo />
    <Nav />
  </div>
  <div className="flex items-center gap-3">
    <CompanionToggle />
    <ProfileMenu />
  </div>
</header>

// Companion panel slides from right
<CompanionPanel 
  open={companionOpen}
  onClose={() => setCompanionOpen(false)}
  position="right"
/>
```

### Step 2: Branding Audit Script (30 min)

Create a script to find inconsistencies:

```bash
# Find non-Olcan colors
grep -r "bg-blue-" src/
grep -r "text-blue-" src/
grep -r "border-blue-" src/

# Find inconsistent button styles
grep -r "px-3 py-1" src/  # Should be px-4 py-2
grep -r "rounded-md" src/  # Should be rounded-xl

# Find inconsistent spacing
grep -r "gap-3" src/  # Should be gap-4
grep -r "space-y-3" src/  # Should be space-y-4
```

### Step 3: Create Shared Components (1 hour)

```typescript
// src/components/ui/OlcanButton.tsx
export function OlcanButton({ 
  variant = "primary",
  size = "md",
  ...props 
}) {
  const baseStyles = "rounded-xl font-heading font-semibold transition-all";
  const variantStyles = {
    primary: "bg-[#001338] text-white hover:shadow-xl",
    secondary: "border-2 border-brand-500 text-brand-600 hover:bg-brand-50",
    ghost: "text-text-secondary hover:bg-cream-100"
  };
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base"
  };
  
  return (
    <button 
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size])}
      {...props}
    />
  );
}

// src/components/ui/OlcanCard.tsx
export function OlcanCard({ children, ...props }) {
  return (
    <GlassCard
      variant="olcan"
      padding="md"
      className="border-[#001338]/5 bg-white/40"
      {...props}
    >
      {children}
    </GlassCard>
  );
}
```

### Step 4: Replace Inconsistent Components (2-3 hours)

Go through each page and replace:
- Generic buttons → `OlcanButton`
- Generic cards → `OlcanCard`
- Inconsistent colors → Olcan palette
- Inconsistent spacing → Standard scale

---

## 🎨 Olcan Design Tokens

```typescript
// src/lib/design-tokens.ts

export const colors = {
  primary: "#001338",
  brand: "#4F46E5",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  
  text: {
    primary: "#001338",
    secondary: "#64748B",
    muted: "#94A3B8"
  },
  
  bg: {
    primary: "#FFFFFF",
    secondary: "#F8FAFC",
    cream: "#FFFBF5"
  }
};

export const spacing = {
  xs: "0.5rem",  // 8px
  sm: "0.75rem", // 12px
  md: "1rem",    // 16px
  lg: "1.5rem",  // 24px
  xl: "2rem",    // 32px
  "2xl": "3rem"  // 48px
};

export const borderRadius = {
  sm: "0.5rem",   // 8px
  md: "0.75rem",  // 12px
  lg: "1rem",     // 16px
  xl: "1.5rem"    // 24px
};
```

---

## 🔍 Testing Checklist

After each change:
- [ ] Build passes (`npm run build`)
- [ ] No type errors
- [ ] No console errors
- [ ] Responsive on mobile (375px)
- [ ] Responsive on tablet (768px)
- [ ] Responsive on desktop (1440px)
- [ ] Consistent with Olcan brand
- [ ] Accessible (keyboard navigation, ARIA labels)

---

## 📊 Success Metrics

**Before**:
- Buttons overflow on mobile
- Inconsistent colors across pages
- Two separate companion UIs
- Export not visible

**After**:
- All buttons fit on mobile
- Consistent Olcan branding (100%)
- Single unified companion UI
- Export clearly visible and functional
- Professional, polished feel throughout

---

## 🚀 Next Session Priorities

1. **Consolidate Companion UI** (highest impact)
2. **Run branding audit script**
3. **Create shared Olcan components**
4. **Fix top 5 most-used pages**
5. **Test on real devices**

---

## 📝 Notes

- Keep changes minimal and focused
- Test after each component update
- Document any breaking changes
- Maintain backward compatibility where possible
- Get user feedback early and often

---

**Status**: Ready to implement  
**Estimated Time**: 4-6 hours total  
**Next Action**: Consolidate companion UI
