# Implementation Plan: Frontend Component Library and Screens

## Overview

This plan implements the complete Olcan Compass frontend: a MMXD (Metamodern Design System) interface with 30+ reusable components, 50+ screens across 10 backend engines, and psychological state-driven UI adaptation. The implementation follows an incremental approach, building from foundational components through domain-specific features, with testing integrated throughout.

The backend APIs are complete and ready. Design tokens exist at `apps/web/src/design-tokens.json`. All implementation uses TypeScript + React with Zustand, React Query, Tailwind CSS, and Framer Motion.

## Tasks

- [x] 1. Foundation: Design System Infrastructure
  - [x] 1.1 Create design token utilities and Tailwind integration
    - Implement TypeScript utilities to consume `design-tokens.json`
    - Create Tailwind plugin to inject MMXD tokens as CSS variables
    - Export typed token accessors for components
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 1.2 Set up component library structure and tooling
    - Create `src/components/ui/` directory structure
    - Configure barrel exports (`index.ts`) for component library
    - Set up component prop type patterns and conventions
    - _Requirements: 2.1, 2.9, 2.10, 23.1, 23.2_

  - [x] 1.3 Implement base utility functions
    - Create `src/lib/utils.ts` with `cn()` for class merging
    - Implement date formatting utilities with pt-BR locale
    - Implement number/currency formatting utilities
    - Create debounce and throttle helpers
    - _Requirements: 17.6, 21.4_

- [x] 2. Core UI Components - Base Layer
  - [x] 2.1 Implement Button component with variants
    - Create Button with primary, secondary, ghost, danger variants
    - Support size variants (sm, md, lg) and loading state
    - Implement keyboard navigation and ARIA attributes
    - _Requirements: 2.2, 16.1, 16.2, 16.3_

  - [x] 2.2 Implement Input and FormField components
    - Create Input with validation states and icons
    - Create FormField wrapper with label, error, and helper text
    - Implement controlled and uncontrolled patterns
    - _Requirements: 2.7, 16.7, 18.3_

  - [x] 2.3 Implement Card, Typography, and Badge components
    - Create Card with header, body, footer slots
    - Create Typography with heading, body, caption variants
    - Create Badge with status color variants
    - _Requirements: 2.2, 1.2_

  - [x] 2.4 Implement Avatar, Icon, and Progress components
    - Create Avatar with image, initials, and placeholder states
    - Create Icon wrapper for lucide-react icons
    - Create Progress bar with percentage and indeterminate states
    - _Requirements: 2.2_

- [x] 3. Layout and Navigation Components
  - [x] 3.1 Implement Container, Grid, and Stack layout primitives
    - Create Container with max-width constraints
    - Create Grid with responsive column system
    - Create Stack for vertical/horizontal spacing
    - _Requirements: 2.3, 15.1, 15.5_

  - [x] 3.2 Implement Sidebar navigation component
    - Create collapsible Sidebar with navigation items
    - Implement active state highlighting
    - Support nested navigation groups
    - _Requirements: 2.4, 15.4, 16.1_

  - [x] 3.3 Implement TopBar and Breadcrumb components
    - Create TopBar with user menu and notifications
    - Create Breadcrumb with dynamic path generation
    - Implement responsive behavior for mobile
    - _Requirements: 2.4, 15.2, 15.3_

  - [x] 3.4 Implement Tabs and Pagination components
    - Create Tabs with keyboard navigation
    - Create Pagination with page size controls
    - Implement URL state synchronization
    - _Requirements: 2.4, 27.6_

- [x] 4. Feedback and Overlay Components
  - [x] 4.1 Implement Toast notification system
    - Create Toast component with success, error, warning, info variants
    - Implement toast queue manager with Zustand
    - Support auto-dismiss and manual close
    - _Requirements: 2.5, 28.1, 18.1_

  - [x] 4.2 Implement Modal and Alert components
    - Create Modal with backdrop, close button, and focus trap
    - Create Alert for inline notifications
    - Implement animation with Framer Motion
    - _Requirements: 2.5, 20.3, 16.1_

  - [x] 4.3 Implement Tooltip and LoadingSpinner components
    - Create Tooltip with positioning logic
    - Create LoadingSpinner with size variants
    - Implement skeleton loading states
    - _Requirements: 2.5, 17.7_

  - [x] 4.4 Implement EmptyState component
    - Create EmptyState with icon, title, description, and action
    - Support contextual messaging based on feature area
    - _Requirements: 2.5, 4.5, 26.6_

- [x] 5. Checkpoint - Core Components Complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Form Components
  - [x] 6.1 Implement Select and Checkbox components
    - Create Select with search and multi-select support
    - Create Checkbox with indeterminate state
    - Implement keyboard navigation
    - _Requirements: 2.7, 16.1_

  - [x] 6.2 Implement Radio and DatePicker components
    - Create Radio group with keyboard navigation
    - Create DatePicker with pt-BR locale
    - Integrate with form validation
    - _Requirements: 2.7, 21.4_

  - [x] 6.3 Implement FileUpload component
    - Create FileUpload with drag-and-drop support
    - Implement file type and size validation
    - Show upload progress and preview
    - _Requirements: 2.7, 25.3, 15.6_

- [x] 7. Data Display Components
  - [x] 7.1 Implement Table component with sorting and filtering
    - Create Table with sortable columns
    - Implement client-side and server-side sorting
    - Add row selection and bulk actions
    - _Requirements: 2.6, 26.5, 27.3_

  - [x] 7.2 Implement List and Timeline components
    - Create List with item templates and virtualization
    - Create Timeline for route and milestone visualization
    - Support horizontal and vertical orientations
    - _Requirements: 2.6, 26.2_

  - [x] 7.3 Implement StatCard and Chart components
    - Create StatCard for dashboard metrics
    - Integrate chart library for data visualization
    - Implement color-blind friendly palettes
    - _Requirements: 2.6, 26.1, 26.4_

- [x] 8. State Management Infrastructure
  - [x] 8.1 Implement Zustand stores for client state
    - Create auth store with token management and persistence
    - Create psych store for psychological profile state
    - Create route store for current route context
    - Create editor store for narrative editing state
    - Create UI mode store for Map/Forge mode state
    - _Requirements: 19.1, 19.2, 19.4, 19.6_

  - [x] 8.2 Configure React Query for server state
    - Set up QueryClient with cache configuration
    - Create query hooks for each backend engine
    - Implement optimistic updates for mutations
    - Configure retry logic and error handling
    - _Requirements: 19.3, 19.7, 17.2_

  - [x] 8.3 Implement API client with authentication
    - Enhance `src/lib/api.ts` with request/response interceptors
    - Implement automatic token refresh on 401
    - Add request queuing during token refresh
    - Implement error transformation to user-friendly messages
    - _Requirements: 18.1, 18.4, 18.5, 18.6_

- [x] 9. Intelligence Layer - Psychological Adaptation
  - [x] 9.1 Implement Psych Adapter for profile interpretation
    - Create `src/lib/psych-adapter.ts` with profile analysis logic
    - Implement anxiety/agency score interpretation
    - Generate UI mode recommendations based on scores
    - _Requirements: 3.1, 3.2, 3.3, 19.5_

  - [x] 9.2 Implement UI Mode Engine for Map/Forge transitions
    - Create `src/lib/ui-mode-engine.ts` with mode transition logic
    - Implement smooth layout transitions with Framer Motion
    - Preserve scroll position and user context during transitions
    - _Requirements: 3.4, 3.5, 3.6, 3.7, 20.4_

  - [x] 9.3 Implement Microcopy Engine for contextual text
    - Create `src/lib/microcopy-engine.ts` with Portuguese text generation
    - Implement Alchemical voice tone patterns
    - Adapt text complexity based on psychological state
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 9.4 Implement Fear Reframe Engine for anxiety mitigation
    - Create `src/lib/fear-reframe-engine.ts` with reframing logic
    - Implement risk mitigation messaging patterns
    - Transform deadline urgency into opportunity framing
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 10. Domain-Specific Components
  - [x] 10.1 Implement PsychProfileCard component
    - Create card displaying Big Five scores with radar chart
    - Show score history and trends
    - Display mode recommendation badge
    - _Requirements: 2.8, 7.4, 7.5_

  - [x] 10.2 Implement RouteTimeline component
    - Create timeline visualization for route milestones
    - Show completion status and dependencies
    - Support interactive milestone selection
    - _Requirements: 2.8, 8.4, 8.6_

  - [x] 10.3 Implement NarrativeEditor component
    - Create rich text editor with formatting toolbar
    - Implement auto-save with debouncing
    - Show AI feedback panel alongside editor
    - _Requirements: 2.8, 9.1, 9.2, 9.4, 9.7_

  - [x] 10.4 Implement InterviewCard and ApplicationCard components
    - Create InterviewCard for question display and response capture
    - Create ApplicationCard for opportunity tracking
    - Show status badges and deadline countdowns
    - _Requirements: 2.8, 10.1, 10.2, 11.4, 11.5_

  - [x] 10.5 Implement SprintTaskCard and ProviderCard components
    - Create SprintTaskCard with completion checkbox and notes
    - Create ProviderCard with rating, services, and booking CTA
    - _Requirements: 2.8, 12.3, 12.7, 13.1_

- [x] 11. Checkpoint - Foundation and Components Complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Authentication Screens
  - [x] 12.1 Implement Login and Register pages
    - Create `/login` page with email/password form
    - Create `/register` page with validation
    - Implement form error handling and loading states
    - Redirect to dashboard on success
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.7, 6.8_

  - [x] 12.2 Implement password reset and email verification flows
    - Create `/forgot-password` page with email input
    - Create `/reset-password/:token` page with new password form
    - Create `/verify-email/:token` page with verification logic
    - _Requirements: 6.6_

- [x] 13. Psychology Engine Screens
  - [x] 13.1 Implement Psychology Dashboard page
    - Create `/psychology` page with profile overview
    - Display current Big Five scores with PsychProfileCard
    - Show assessment history and score trends
    - _Requirements: 7.1, 7.4, 7.5, 7.6_

  - [x] 13.2 Implement Assessment Session page
    - Create `/psychology/assessment` page with question flow
    - Display questions one at a time with progress bar
    - Implement answer submission and navigation
    - Show completion screen with updated profile
    - _Requirements: 7.2, 7.3, 7.7_

- [x] 14. Route Planning Screens
  - [x] 14.1 Implement Route Templates page
    - Create `/routes/templates` page with template grid
    - Display template cards with descriptions and milestone counts
    - Implement template detail modal with milestone breakdown
    - _Requirements: 8.1, 8.2_

  - [x] 14.2 Implement My Routes page with Map/Forge modes
    - Create `/routes` page with route list and timeline
    - Implement Map mode showing all routes simultaneously
    - Implement Forge mode showing only active milestone
    - Add route creation from template flow
    - _Requirements: 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_

- [x] 15. Narrative Engine Screens
  - [x] 15.1 Implement Narratives Dashboard page
    - Create `/narratives` page with narrative list
    - Display narrative cards with type, word count, and last edited
    - Implement narrative creation modal
    - _Requirements: 9.1, 9.8_

  - [x] 15.2 Implement Narrative Editor page with AI feedback
    - Create `/narratives/:id` page with NarrativeEditor
    - Implement auto-save every 30 seconds
    - Display AI feedback panel with analysis results
    - Show version history sidebar
    - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [x] 16. Interview Preparation Screens
  - [x] 16.1 Implement Interview Question Bank page
    - Create `/interviews/questions` page with filterable question list
    - Implement category and difficulty filters
    - Display question cards with metadata
    - _Requirements: 10.1, 10.7_

  - [x] 16.2 Implement Mock Interview Session page
    - Create `/interviews/session/:id` page with question flow
    - Display timer and question navigation
    - Implement response capture (text/audio)
    - Show AI feedback after submission
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 17. Application Management Screens
  - [x] 17.1 Implement Opportunities page with search and filters
    - Create `/applications/opportunities` page with opportunity grid
    - Implement search with debounced API calls
    - Add filters for type, location, deadline
    - Display watchlist toggle on cards
    - _Requirements: 11.1, 11.2, 27.1, 27.2, 27.3, 27.4, 27.5_

  - [x] 17.2 Implement My Applications page with Map/Forge modes
    - Create `/applications` page with application dashboard
    - Implement Map mode showing all applications in grid
    - Implement Forge mode showing next immediate task
    - Display status badges and deadline countdowns
    - _Requirements: 11.3, 11.4, 11.5, 11.6, 11.9, 11.10_

  - [x] 17.3 Implement Application Detail page
    - Create `/applications/:id` page with full application view
    - Display required documents with upload interface
    - Show deadline timeline and status history
    - Display match score with explanation
    - _Requirements: 11.7, 11.8_

- [x] 18. Sprint Management Screens
  - [x] 18.1 Implement Sprint Templates page
    - Create `/sprints/templates` page with template grid
    - Display sprint cards with descriptions and task counts
    - Show recommended sprints based on gap analysis
    - _Requirements: 12.1, 12.6_

  - [x] 18.2 Implement My Sprints page
    - Create `/sprints` page with active sprint list
    - Display sprint progress with task completion percentage
    - Show gap analysis results with recommendations
    - Implement sprint creation from template
    - _Requirements: 12.2, 12.3, 12.5_

  - [x] 18.3 Implement Sprint Detail page
    - Create `/sprints/:id` page with task list
    - Display tasks with dependencies and prerequisites
    - Implement task completion with optional notes
    - Show sprint timeline and milestones
    - _Requirements: 12.4, 12.7, 12.8_

- [x] 19. Checkpoint - Core Screens Complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 20. Marketplace Screens
  - [x] 20.1 Implement Marketplace Browse page
    - Create `/marketplace` page with provider grid
    - Implement filters for service type, rating, price
    - Display provider cards with ratings and services
    - _Requirements: 13.1, 13.2_

  - [x] 20.2 Implement Provider Profile page
    - Create `/marketplace/provider/:id` page with full profile
    - Display services, reviews, and booking availability
    - Implement booking flow with service selection
    - _Requirements: 13.3, 13.4_

  - [x] 20.3 Implement My Bookings page
    - Create `/marketplace/bookings` page with booking list
    - Display booking status and upcoming appointments
    - Implement review submission after completion
    - _Requirements: 13.5, 13.6_

  - [x] 20.4 Implement Messaging interface
    - Create `/marketplace/messages` page with conversation list
    - Implement message thread view with real-time updates
    - Display notification badges for unread messages
    - _Requirements: 13.7, 13.8_

- [x] 21. Admin Screens
  - [x] 21.1 Implement Admin Dashboard page
    - Create `/admin` page with system metrics
    - Display user statistics, activity graphs, and health indicators
    - Restrict access to SUPER_ADMIN role
    - _Requirements: 14.1, 14.7_

  - [x] 21.2 Implement User Management page
    - Create `/admin/users` page with user list
    - Implement search, filter, and pagination
    - Add user edit modal with role management
    - _Requirements: 14.2, 14.3, 14.4_

  - [x] 21.3 Implement Content Management pages
    - Create `/admin/templates` page for route/sprint templates
    - Create `/admin/questions` page for interview questions
    - Implement CRUD operations with validation
    - _Requirements: 14.5, 14.6_

- [x] 22. Cross-Cutting Features - Responsive Design
  - [x] 22.1 Implement responsive navigation
    - Convert Sidebar to bottom tab bar on mobile
    - Implement hamburger menu for secondary navigation
    - Ensure touch targets meet 44x44px minimum
    - _Requirements: 15.1, 15.2, 15.4, 15.6_

  - [x] 22.2 Implement responsive layouts for all screens
    - Apply mobile-first responsive patterns to all pages
    - Stack multi-column layouts vertically on mobile
    - Test at breakpoints: 320px, 768px, 1024px, 1440px
    - _Requirements: 15.3, 15.5, 15.7_

- [x] 23. Cross-Cutting Features - Accessibility
  - [x] 23.1 Implement keyboard navigation and focus management
    - Ensure all interactive elements are keyboard accessible
    - Implement focus trap for modals
    - Add skip navigation links
    - _Requirements: 16.1, 16.2, 16.6_

  - [x] 23.2 Implement ARIA attributes and screen reader support
    - Add ARIA labels to all components
    - Implement live region announcements for dynamic updates
    - Ensure form inputs have associated labels
    - _Requirements: 16.3, 16.5, 16.7_

  - [x] 23.3 Implement color contrast and visual accessibility
    - Audit all color combinations for WCAG AA compliance
    - Ensure focus indicators have sufficient contrast
    - Use color-blind friendly palettes for data visualization
    - _Requirements: 16.4, 26.4_

- [x] 24. Cross-Cutting Features - Performance Optimization
  - [x] 24.1 Implement code splitting and lazy loading
    - Configure route-based code splitting
    - Implement lazy loading for heavy components
    - Add loading boundaries with Suspense
    - _Requirements: 17.3, 17.1_

  - [x] 24.2 Implement image optimization and caching
    - Add lazy loading for images
    - Implement responsive image srcsets
    - Configure React Query cache strategies
    - _Requirements: 17.4, 17.2_

  - [x] 24.3 Implement performance monitoring
    - Add loading skeletons for all data-fetching screens
    - Implement debouncing for search inputs
    - Monitor and optimize animation frame rates
    - _Requirements: 17.7, 17.6, 17.5_

- [x] 25. Cross-Cutting Features - Animations and Transitions
  - [x] 25.1 Implement page transitions
    - Add fade transitions for route changes
    - Implement shared element transitions where appropriate
    - Respect prefers-reduced-motion setting
    - _Requirements: 20.1, 20.2, 20.5, 20.6_

  - [x] 25.2 Implement component animations
    - Add hover and focus state transitions
    - Implement modal and toast animations
    - Configure animation timing from design tokens
    - _Requirements: 20.3, 20.7, 1.4_

- [x] 26. Cross-Cutting Features - Error Handling and Notifications
  - [x] 26.1 Implement global error boundary
    - Create error boundary component with fallback UI
    - Implement error logging to console in development
    - Display user-friendly error messages in Portuguese
    - _Requirements: 18.1, 18.6, 18.7_

  - [x] 26.2 Implement network error handling
    - Display offline indicator when network is unavailable
    - Implement retry logic with exponential backoff
    - Handle 401, 403, 500 errors appropriately
    - _Requirements: 18.2, 18.4, 18.5_

  - [x] 26.3 Implement notification system
    - Create notification center with history
    - Implement notification badges on navigation
    - Add notification preferences UI
    - Display critical deadline notifications prominently
    - _Requirements: 28.2, 28.3, 28.4, 28.5, 28.6, 28.7_

- [x] 27. Cross-Cutting Features - Search and Filtering
  - [x] 27.1 Implement global search component
    - Create search input with debounced API calls
    - Display search results with term highlighting
    - Implement keyboard navigation for results
    - _Requirements: 27.1, 27.2_

  - [x] 27.2 Implement filter system
    - Create reusable filter controls for common attributes
    - Persist filter state in URL query parameters
    - Display active filter badges with removal option
    - Show result count and "no results" state
    - _Requirements: 27.3, 27.4, 27.5, 27.7_

- [x] 28. Cross-Cutting Features - Onboarding
  - [x] 28.1 Implement onboarding flow
    - Create welcome modal for first-time users
    - Implement interactive tutorial with feature highlights
    - Guide users through initial psychological assessment
    - Guide users through route selection
    - _Requirements: 29.1, 29.2, 29.3, 29.4_

  - [x] 28.2 Implement contextual help system
    - Add help tooltips on complex features
    - Track onboarding completion status
    - Allow users to skip onboarding steps
    - _Requirements: 29.5, 29.6, 29.7_

- [x] 29. Cross-Cutting Features - Export and Sharing
  - [x] 29.1 Implement export functionality
    - Add PDF export for narratives with formatting preservation
    - Add PDF export for route plans
    - Add PDF export for application checklists
    - Include metadata in exported files
    - _Requirements: 30.1, 30.2, 30.3, 30.6, 30.7_

  - [x] 29.2 Implement sharing functionality
    - Create shareable links for narratives with privacy controls
    - Implement print-friendly CSS for content
    - _Requirements: 30.4, 30.5_

- [x] 30. Internationalization Foundation
  - [x] 30.1 Structure code for future i18n support
    - Centralize all Portuguese text strings in dedicated files
    - Avoid hardcoded text in component implementations
    - Use locale-aware date/number formatting functions
    - Structure layout to support RTL in future
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5_

- [x] 31. Build and Deployment Configuration
  - [x] 31.1 Configure production build
    - Optimize Vite build configuration for production
    - Enable minification and tree-shaking
    - Generate source maps for error tracking
    - Implement content hashing for cache busting
    - _Requirements: 24.1, 24.2, 24.3, 24.4_

  - [x] 31.2 Implement build validation
    - Add TypeScript type checking to build process
    - Add ESLint checks to build process
    - Generate build size report
    - _Requirements: 24.5, 24.6, 24.7_

- [x] 32. Security Hardening
  - [x] 32.1 Implement security best practices
    - Store JWT tokens in httpOnly cookies where possible
    - Sanitize user input to prevent XSS
    - Validate file uploads before sending to backend
    - Remove sensitive data from console logs
    - _Requirements: 25.1, 25.2, 25.3, 25.5_

  - [x] 32.2 Configure security headers
    - Implement Content Security Policy
    - Configure CORS properly with backend
    - _Requirements: 25.4, 25.6_

- [x] 33. Final Integration and Polish
  - [x] 33.1 Implement Layout component with navigation
    - Create main Layout component wrapping all authenticated routes
    - Integrate Sidebar, TopBar, and notification system
    - Implement responsive navigation switching
    - _Requirements: 2.3, 2.4, 15.4_

  - [x] 33.2 Wire all screens into routing
    - Configure React Router with all page routes
    - Implement protected route wrapper checking auth state
    - Add 404 page for unknown routes
    - _Requirements: 6.4, 14.7_

  - [x] 33.3 Implement global loading and error states
    - Add global loading indicator for route transitions
    - Implement error boundary at app root
    - Add offline detection and indicator
    - _Requirements: 17.1, 18.1, 18.2_

  - [x] 33.4 Final UI polish and consistency pass
    - Audit all screens for design token consistency
    - Ensure all Portuguese text uses Alchemical voice
    - Verify all animations respect prefers-reduced-motion
    - Test all screens in Map and Forge modes
    - _Requirements: 1.5, 4.2, 20.6, 3.4_

- [x] 34. Final Checkpoint - Complete System Test
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks reference specific requirements for traceability
- The backend APIs are complete and ready for integration
- Design tokens already exist at `apps/web/src/design-tokens.json`
- Implementation uses TypeScript + React with strict type checking
- State management uses Zustand (client) and React Query (server)
- All Portuguese text should use the Alchemical voice (prophetic + ironic)
- Map/Forge mode adaptation is a core feature affecting multiple screens
- Testing tasks are integrated throughout but not marked optional per workflow rules
- Checkpoints ensure incremental validation at logical breaks
