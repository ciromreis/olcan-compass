---
trigger: always_on
---

# Rule: Compass Coding Standards
# Scope: compass-* repositories

## TypeScript
- Strict mode ALWAYS enabled
- No `any` types - use proper typing or `unknown` with type guards
- Prefer interfaces over types for object shapes
- Use discriminated unions for state management
- Zod schemas as single source of truth for validation
- Export types from barrel files (index.ts)

## Next.js 14 App Router
- Server Components by default
- Client Components ("use client") only when:
  - Using hooks (useState, useEffect, etc.)
  - Event handlers needed
  - Browser APIs required
- Use route groups: (auth)/ for protected, (public)/ for public
- Loading.tsx and error.tsx for every route segment
- Not-found.tsx for 404 handling
- Metadata API for SEO (generateMetadata)

## Supabase Integration
- Use @supabase/ssr (NOT deprecated auth-helpers)
- createServerClient() for Server Components and Server Actions
- createBrowserClient() for Client Components
- Never expose service_role key to client
- RLS enabled on ALL tables (defense in depth)
- All queries filter by organization_id
- Run `supabase gen types typescript` after every migration

## Component Standards
- shadcn/ui as base component library
- Tailwind utility-first (no custom CSS unless necessary)
- React Hook Form for all forms
- Zod for validation (shared with tRPC)
- Loading states for all async operations
- Error boundaries for fault isolation
- Accessible (WCAG 2.1 AA minimum)

## tRPC API Layer
- All API calls through tRPC (no raw fetch)
- protectedProcedure for authenticated routes
- Input validation with Zod
- Error handling with TRPCError
- Optimistic updates for better UX

## State Management
- Zustand for client-side global state
- React Query (via tRPC) for server state
- No prop drilling beyond 2 levels (use context or store)
- URL state for shareable filters/views

## Performance
- Dynamic imports for heavy components
- Image optimization with next/image
- Font optimization with next/font
- Suspense boundaries for streaming
- React.memo only when profiler confirms benefit