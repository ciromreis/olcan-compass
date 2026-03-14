# Requirements Document: Frontend Component Library and Screens

## Introduction

This document specifies the requirements for the Olcan Compass frontend implementation, a complete MMXD (Metamodern Design System) interface that serves international students and professionals navigating mobility pathways. The system implements psychological state-driven UI adaptation, oscillating between "The Map" (high-density data visualization) and "The Forge" (minimalist focus mode), with Portuguese-first microcopy and an "Alchemical" voice.

The frontend connects to 10 backend engines (auth, psychology, routes, narratives, interviews, applications, sprints, AI, marketplace, admin) through a complete REST API, providing 30+ reusable components and 50+ screens.

## Glossary

- **MMXD**: Metamodern Design System - the design philosophy combining prophetic insight with ironic self-awareness
- **The_Map**: High-density UI mode showing comprehensive data visualization and multiple information streams
- **The_Forge**: Minimalist UI mode providing focused, distraction-free interaction
- **Psych_Adapter**: Intelligence layer component that interprets psychological profile data to drive UI adaptation
- **UI_Mode_Engine**: System component that determines and transitions between Map and Forge modes
- **Microcopy_Engine**: System component that generates contextual Portuguese text based on psychological state
- **Fear_Reframe_Engine**: System component that transforms anxiety-inducing content into empowering narratives
- **Component_Library**: Collection of 30+ reusable UI components following MMXD design tokens
- **Design_Tokens**: JSON configuration defining colors, typography, spacing, and animation values
- **Backend_API**: FastAPI REST endpoints providing data for all 10 engines
- **Zustand_Store**: Client-side state management system for auth, psych, routes, editor, and UI mode
- **React_Query**: Server state management system for API data fetching and caching
- **Alchemical_Voice**: Writing style that balances prophetic insight with ironic self-awareness in Portuguese

## Requirements

### Requirement 1: Design Token System

**User Story:** As a developer, I want a centralized design token system, so that all UI components maintain visual consistency and can be updated globally.

#### Acceptance Criteria

1. THE Design_Tokens SHALL define color palettes for Void, Lux, Lumina, Neutral, and Semantic categories
2. THE Design_Tokens SHALL specify typography scales for desktop and mobile with Merriweather Sans, Source Sans 3, and JetBrains Mono fonts
3. THE Design_Tokens SHALL provide spacing values from xs (4px) to 4xl (96px)
4. THE Design_Tokens SHALL define animation durations (fast, normal, slow) and easing functions
5. WHEN a design token value is updated, THE Component_Library SHALL reflect the change across all components without code modifications

### Requirement 2: Component Library Foundation

**User Story:** As a developer, I want a comprehensive component library, so that I can build screens efficiently with consistent UI patterns.

#### Acceptance Criteria

1. THE Component_Library SHALL provide at least 30 reusable components following MMXD design principles
2. THE Component_Library SHALL include base components (Button, Input, Card, Typography, Progress, Badge, Avatar, Icon)
3. THE Component_Library SHALL include layout components (Container, Grid, Stack, Divider, Spacer)
4. THE Component_Library SHALL include navigation components (Sidebar, TopBar, Breadcrumb, Tabs, Pagination)
5. THE Component_Library SHALL include feedback components (Toast, Modal, Tooltip, Alert, LoadingSpinner, EmptyState)
6. THE Component_Library SHALL include data display components (Table, List, Timeline, StatCard, Chart)
7. THE Component_Library SHALL include form components (FormField, Select, Checkbox, Radio, DatePicker, FileUpload)
8. THE Component_Library SHALL include domain-specific components (PsychProfileCard, RouteTimeline, NarrativeEditor, InterviewCard, ApplicationCard, SprintTaskCard, ProviderCard)
9. WHEN a component is rendered, THE Component_Library SHALL apply design tokens for colors, typography, spacing, and animations
10. WHEN a component receives props, THE Component_Library SHALL validate prop types using TypeScript strict mode

### Requirement 3: Psychological State-Driven UI Adaptation

**User Story:** As a user with varying psychological states, I want the interface to adapt to my current needs, so that I receive appropriate support and information density.

#### Acceptance Criteria

1. WHEN a user's psychological profile indicates high anxiety, THE Psych_Adapter SHALL recommend The_Forge mode
2. WHEN a user's psychological profile indicates high agency, THE Psych_Adapter SHALL recommend The_Map mode
3. WHEN a user's psychological profile indicates moderate states, THE Psych_Adapter SHALL allow manual mode selection
4. THE UI_Mode_Engine SHALL transition between Map and Forge modes with smooth animations
5. WHILE in The_Map mode, THE UI_Mode_Engine SHALL display high-density layouts with multiple information panels
6. WHILE in The_Forge mode, THE UI_Mode_Engine SHALL display minimalist layouts with single-focus content
7. WHEN transitioning between modes, THE UI_Mode_Engine SHALL preserve user context and scroll position

### Requirement 4: Microcopy and Alchemical Voice

**User Story:** As a Portuguese-speaking user, I want interface text that resonates with metamodern sensibility, so that I feel understood and empowered.

#### Acceptance Criteria

1. THE Microcopy_Engine SHALL generate all interface text in Portuguese (pt-BR)
2. THE Microcopy_Engine SHALL apply Alchemical_Voice tone balancing prophetic insight with ironic self-awareness
3. WHEN displaying success messages, THE Microcopy_Engine SHALL use empowering language without toxic positivity
4. WHEN displaying error messages, THE Microcopy_Engine SHALL provide clear guidance without blame
5. WHEN displaying empty states, THE Microcopy_Engine SHALL offer contextual next actions
6. THE Microcopy_Engine SHALL adapt text complexity based on psychological profile (simpler for high anxiety, richer for high agency)

### Requirement 5: Fear Reframing System

**User Story:** As a user experiencing anxiety about mobility challenges, I want the system to reframe threatening information, so that I can engage with difficult content constructively.

#### Acceptance Criteria

1. WHEN displaying visa rejection risks, THE Fear_Reframe_Engine SHALL present mitigation strategies alongside risks
2. WHEN displaying application deadlines, THE Fear_Reframe_Engine SHALL frame urgency as opportunity rather than threat
3. WHEN displaying gap analysis results, THE Fear_Reframe_Engine SHALL emphasize growth potential over deficiencies
4. THE Fear_Reframe_Engine SHALL avoid toxic positivity and acknowledge real challenges
5. THE Fear_Reframe_Engine SHALL provide actionable next steps with every reframed message

### Requirement 6: Authentication Screens

**User Story:** As a new user, I want to register and log in securely, so that I can access personalized mobility planning features.

#### Acceptance Criteria

1. THE Backend_API SHALL provide endpoints for registration, login, token refresh, password reset, and email verification
2. WHEN a user submits registration form, THE Component_Library SHALL validate email format, password strength, and required fields
3. WHEN registration succeeds, THE Zustand_Store SHALL store JWT tokens and user profile
4. WHEN login succeeds, THE Zustand_Store SHALL store JWT tokens and redirect to dashboard
5. WHEN token expires, THE Backend_API SHALL automatically refresh using refresh token
6. WHEN password reset is requested, THE Backend_API SHALL send reset email with secure token
7. THE Component_Library SHALL display loading states during authentication operations
8. THE Component_Library SHALL display error messages for failed authentication attempts

### Requirement 7: Psychology Engine Screens

**User Story:** As a user, I want to complete psychological assessments and view my profile, so that I can receive personalized UI adaptation and guidance.

#### Acceptance Criteria

1. WHEN a user accesses the psychology dashboard, THE Component_Library SHALL display current psychological profile with Big Five scores
2. WHEN a user starts an assessment, THE Component_Library SHALL present questions one at a time with progress indication
3. WHEN a user completes an assessment, THE Backend_API SHALL calculate scores and update profile
4. THE Component_Library SHALL visualize psychological dimensions using radar charts or similar data visualization
5. THE Component_Library SHALL display score history showing changes over time
6. THE Component_Library SHALL explain what each psychological dimension means in Portuguese
7. WHEN psychological scores change significantly, THE Psych_Adapter SHALL trigger UI mode re-evaluation

### Requirement 8: Route Planning Screens

**User Story:** As a user, I want to explore mobility route templates and create personalized routes, so that I can plan my international mobility journey.

#### Acceptance Criteria

1. WHEN a user accesses route templates, THE Component_Library SHALL display available templates with descriptions and milestone counts
2. WHEN a user selects a template, THE Component_Library SHALL show detailed milestone breakdown with timelines
3. WHEN a user creates a route from template, THE Backend_API SHALL instantiate user-specific route with milestones
4. THE Component_Library SHALL visualize route progress using timeline or Gantt-style display
5. WHEN a user completes a milestone, THE Backend_API SHALL update route progress and unlock dependent milestones
6. THE Component_Library SHALL display milestone dependencies and prerequisites clearly
7. THE Component_Library SHALL allow users to add custom milestones to their routes
8. WHILE in The_Map mode, THE Component_Library SHALL show all routes and milestones simultaneously
9. WHILE in The_Forge mode, THE Component_Library SHALL show only the current active milestone

### Requirement 9: Narrative Engine Screens

**User Story:** As a user, I want to write and refine personal statements and essays, so that I can create compelling application narratives.

#### Acceptance Criteria

1. WHEN a user creates a narrative, THE Component_Library SHALL provide a rich text editor with formatting options
2. THE Component_Library SHALL auto-save narrative content every 30 seconds
3. WHEN a user requests AI analysis, THE Backend_API SHALL analyze narrative and provide feedback
4. THE Component_Library SHALL display AI feedback alongside the editor without disrupting writing flow
5. THE Component_Library SHALL maintain version history for all narrative edits
6. WHEN a user views version history, THE Component_Library SHALL allow comparison between versions
7. THE Component_Library SHALL display word count, character count, and readability metrics
8. THE Component_Library SHALL support multiple narrative types (personal statement, motivation letter, research proposal)

### Requirement 10: Interview Preparation Screens

**User Story:** As a user, I want to practice interview questions and receive feedback, so that I can improve my interview performance.

#### Acceptance Criteria

1. WHEN a user accesses the interview question bank, THE Component_Library SHALL display questions filtered by category and difficulty
2. WHEN a user starts a mock interview session, THE Component_Library SHALL present questions sequentially with timer
3. THE Component_Library SHALL allow users to record text or audio responses
4. WHEN a user submits a response, THE Backend_API SHALL analyze response quality and provide feedback
5. THE Component_Library SHALL display feedback highlighting strengths and improvement areas
6. THE Component_Library SHALL track interview session history with performance metrics
7. THE Component_Library SHALL recommend questions based on user's route and application targets

### Requirement 11: Application Management Screens

**User Story:** As a user, I want to track opportunities, manage applications, and monitor deadlines, so that I can stay organized throughout the application process.

#### Acceptance Criteria

1. WHEN a user accesses opportunities, THE Component_Library SHALL display searchable and filterable opportunity listings
2. THE Component_Library SHALL allow users to add opportunities to watchlist
3. WHEN a user creates an application, THE Backend_API SHALL initialize application with required documents and deadlines
4. THE Component_Library SHALL display application status (draft, submitted, under review, accepted, rejected)
5. THE Component_Library SHALL show deadline countdown with visual urgency indicators
6. WHEN a deadline is approaching, THE Fear_Reframe_Engine SHALL frame urgency constructively
7. THE Component_Library SHALL allow users to upload and manage application documents
8. THE Component_Library SHALL display application match scores based on user profile
9. WHILE in The_Map mode, THE Component_Library SHALL show all applications in a dashboard view
10. WHILE in The_Forge mode, THE Component_Library SHALL focus on the next immediate application task

### Requirement 12: Sprint Management Screens

**User Story:** As a user, I want to participate in readiness sprints with structured tasks, so that I can systematically prepare for mobility milestones.

#### Acceptance Criteria

1. WHEN a user accesses sprint templates, THE Component_Library SHALL display available sprints with descriptions and task counts
2. WHEN a user starts a sprint, THE Backend_API SHALL create user-specific sprint instance with tasks
3. THE Component_Library SHALL display sprint progress with task completion percentage
4. WHEN a user completes a task, THE Backend_API SHALL update sprint progress and unlock dependent tasks
5. THE Component_Library SHALL display gap analysis results identifying preparation gaps
6. THE Component_Library SHALL recommend sprints based on gap analysis and route milestones
7. THE Component_Library SHALL show task dependencies and prerequisites
8. THE Component_Library SHALL allow users to mark tasks as complete with optional notes

### Requirement 13: Marketplace Screens

**User Story:** As a user, I want to discover service providers, book services, and communicate with providers, so that I can access professional support for my mobility journey.

#### Acceptance Criteria

1. WHEN a user accesses the marketplace, THE Component_Library SHALL display provider listings with ratings and service descriptions
2. THE Component_Library SHALL allow users to filter providers by service type, rating, and price range
3. WHEN a user views a provider profile, THE Component_Library SHALL display services, reviews, and booking availability
4. WHEN a user books a service, THE Backend_API SHALL create booking with payment processing
5. THE Component_Library SHALL display booking status (pending, confirmed, completed, cancelled)
6. THE Component_Library SHALL allow users to write reviews after service completion
7. THE Component_Library SHALL provide messaging interface for user-provider communication
8. WHEN a new message arrives, THE Component_Library SHALL display notification badge

### Requirement 14: Admin Screens

**User Story:** As an administrator, I want to manage users, content, and system configuration, so that I can maintain platform quality and operations.

#### Acceptance Criteria

1. WHERE user role is SUPER_ADMIN, THE Component_Library SHALL display admin dashboard with system metrics
2. WHERE user role is SUPER_ADMIN or ORG_ADMIN, THE Component_Library SHALL allow user management operations
3. THE Component_Library SHALL display user list with search, filter, and pagination
4. THE Component_Library SHALL allow admins to view and edit user profiles
5. THE Component_Library SHALL allow admins to manage route templates, sprint templates, and interview questions
6. THE Component_Library SHALL display audit logs for administrative actions
7. WHERE user role is not admin, THE Component_Library SHALL hide admin navigation and routes

### Requirement 15: Responsive Design

**User Story:** As a user on mobile or tablet devices, I want the interface to adapt to my screen size, so that I can access all features comfortably.

#### Acceptance Criteria

1. THE Component_Library SHALL implement responsive layouts using mobile-first approach
2. WHEN viewport width is below 768px, THE Component_Library SHALL apply mobile typography scale
3. WHEN viewport width is 768px or above, THE Component_Library SHALL apply desktop typography scale
4. THE Component_Library SHALL adapt navigation from sidebar to bottom tab bar on mobile
5. THE Component_Library SHALL stack multi-column layouts vertically on mobile
6. THE Component_Library SHALL ensure touch targets are at least 44x44px on mobile
7. THE Component_Library SHALL test all components at breakpoints: 320px, 768px, 1024px, 1440px

### Requirement 16: Accessibility

**User Story:** As a user with disabilities, I want the interface to be accessible, so that I can use all features regardless of my abilities.

#### Acceptance Criteria

1. THE Component_Library SHALL provide keyboard navigation for all interactive elements
2. THE Component_Library SHALL maintain focus indicators with sufficient contrast
3. THE Component_Library SHALL provide ARIA labels for screen reader users
4. THE Component_Library SHALL ensure color contrast ratios meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
5. THE Component_Library SHALL support screen reader announcements for dynamic content updates
6. THE Component_Library SHALL provide skip navigation links
7. THE Component_Library SHALL ensure form inputs have associated labels

### Requirement 17: Performance

**User Story:** As a user, I want the interface to load quickly and respond smoothly, so that I can work efficiently without frustration.

#### Acceptance Criteria

1. WHEN a page loads, THE Component_Library SHALL display initial content within 2 seconds on 3G connection
2. THE React_Query SHALL cache API responses to minimize redundant network requests
3. THE Component_Library SHALL implement code splitting for route-based lazy loading
4. THE Component_Library SHALL optimize images using appropriate formats and lazy loading
5. WHEN scrolling or animating, THE Component_Library SHALL maintain 60fps frame rate
6. THE Component_Library SHALL debounce search inputs to reduce API calls
7. THE Component_Library SHALL display loading skeletons during data fetching

### Requirement 18: Error Handling

**User Story:** As a user, I want clear feedback when errors occur, so that I can understand what went wrong and how to proceed.

#### Acceptance Criteria

1. WHEN an API request fails, THE Component_Library SHALL display user-friendly error message in Portuguese
2. WHEN a network error occurs, THE Component_Library SHALL display offline indicator and retry option
3. WHEN form validation fails, THE Component_Library SHALL highlight invalid fields with specific error messages
4. WHEN a 401 error occurs, THE Zustand_Store SHALL clear auth state and redirect to login
5. WHEN a 403 error occurs, THE Component_Library SHALL display permission denied message
6. WHEN a 500 error occurs, THE Component_Library SHALL display generic error message and error tracking ID
7. THE Component_Library SHALL log errors to console in development mode for debugging

### Requirement 19: State Management

**User Story:** As a developer, I want predictable state management, so that I can reason about application behavior and debug issues efficiently.

#### Acceptance Criteria

1. THE Zustand_Store SHALL manage client state for auth, psych profile, route context, editor state, and UI mode
2. THE Zustand_Store SHALL persist auth tokens and user preferences to localStorage
3. THE React_Query SHALL manage server state with automatic caching, refetching, and invalidation
4. WHEN auth state changes, THE Zustand_Store SHALL notify all subscribed components
5. WHEN psych profile updates, THE Psych_Adapter SHALL re-evaluate UI mode recommendation
6. THE Zustand_Store SHALL provide TypeScript types for all state slices
7. THE React_Query SHALL configure stale time, cache time, and retry logic per query type

### Requirement 20: Animation and Transitions

**User Story:** As a user, I want smooth animations and transitions, so that the interface feels polished and responsive.

#### Acceptance Criteria

1. THE Component_Library SHALL use Framer Motion for complex animations
2. WHEN navigating between pages, THE Component_Library SHALL apply fade transition
3. WHEN opening modals, THE Component_Library SHALL apply scale and fade animation
4. WHEN toggling UI mode, THE Component_Library SHALL apply smooth layout transition over 350ms
5. THE Component_Library SHALL respect user's prefers-reduced-motion setting
6. WHEN prefers-reduced-motion is enabled, THE Component_Library SHALL disable non-essential animations
7. THE Component_Library SHALL use CSS transitions for simple hover and focus states

### Requirement 21: Internationalization Foundation

**User Story:** As a developer, I want an internationalization foundation, so that additional languages can be added in the future.

#### Acceptance Criteria

1. THE Component_Library SHALL structure all text content to support future i18n implementation
2. THE Microcopy_Engine SHALL centralize Portuguese text strings in dedicated files
3. THE Component_Library SHALL avoid hardcoded text in component implementations
4. THE Component_Library SHALL format dates, numbers, and currencies using locale-aware functions
5. THE Component_Library SHALL support RTL layout structure for future Arabic/Hebrew support

### Requirement 22: Testing Infrastructure

**User Story:** As a developer, I want comprehensive testing infrastructure, so that I can ensure component reliability and prevent regressions.

#### Acceptance Criteria

1. THE Component_Library SHALL include unit tests for all utility functions
2. THE Component_Library SHALL include component tests for all UI components
3. THE Component_Library SHALL include integration tests for critical user flows
4. THE Component_Library SHALL achieve minimum 80% code coverage for components
5. THE Component_Library SHALL use React Testing Library for component testing
6. THE Component_Library SHALL use Vitest as test runner
7. THE Component_Library SHALL include visual regression tests for design token changes

### Requirement 23: Development Experience

**User Story:** As a developer, I want excellent development experience, so that I can build features efficiently with confidence.

#### Acceptance Criteria

1. THE Component_Library SHALL provide TypeScript types for all components and props
2. THE Component_Library SHALL include Storybook documentation for all components
3. THE Component_Library SHALL provide ESLint configuration enforcing code quality standards
4. THE Component_Library SHALL provide Prettier configuration for consistent code formatting
5. THE Component_Library SHALL include hot module replacement for instant feedback during development
6. THE Component_Library SHALL provide clear error messages for prop validation failures
7. THE Component_Library SHALL include README documentation for component usage patterns

### Requirement 24: Build and Deployment

**User Story:** As a developer, I want reliable build and deployment processes, so that I can ship updates confidently.

#### Acceptance Criteria

1. THE Component_Library SHALL build production bundle using Vite
2. WHEN building for production, THE Component_Library SHALL minify JavaScript and CSS
3. WHEN building for production, THE Component_Library SHALL generate source maps for error tracking
4. THE Component_Library SHALL output static assets with content hashing for cache busting
5. THE Component_Library SHALL validate TypeScript types during build process
6. THE Component_Library SHALL run linting checks during build process
7. THE Component_Library SHALL generate build size report for bundle analysis

### Requirement 25: Security

**User Story:** As a user, I want my data to be secure, so that I can trust the platform with sensitive personal information.

#### Acceptance Criteria

1. THE Zustand_Store SHALL store JWT tokens in httpOnly cookies when possible
2. THE Component_Library SHALL sanitize user input to prevent XSS attacks
3. THE Component_Library SHALL validate file uploads for type and size before sending to backend
4. THE Backend_API SHALL implement CORS restrictions to prevent unauthorized access
5. THE Component_Library SHALL not log sensitive data (passwords, tokens) to console
6. THE Component_Library SHALL implement Content Security Policy headers
7. WHEN handling payment information, THE Component_Library SHALL use secure third-party payment processor

### Requirement 26: Data Visualization

**User Story:** As a user, I want clear data visualizations, so that I can understand complex information about my mobility journey.

#### Acceptance Criteria

1. THE Component_Library SHALL provide chart components for psychological profile visualization
2. THE Component_Library SHALL provide timeline components for route and milestone visualization
3. THE Component_Library SHALL provide progress indicators for sprint and application tracking
4. THE Component_Library SHALL use color-blind friendly color palettes for data visualization
5. THE Component_Library SHALL provide data tables with sorting and filtering capabilities
6. THE Component_Library SHALL display empty states when no data is available
7. THE Component_Library SHALL animate data transitions for smooth visual updates

### Requirement 27: Search and Filtering

**User Story:** As a user, I want to search and filter content, so that I can find relevant information quickly.

#### Acceptance Criteria

1. THE Component_Library SHALL provide search input with debounced API calls
2. THE Component_Library SHALL display search results with highlighting of matched terms
3. THE Component_Library SHALL provide filter controls for common attributes (date, status, category)
4. THE Component_Library SHALL persist filter state in URL query parameters
5. THE Component_Library SHALL display active filter badges with clear removal option
6. THE Component_Library SHALL show result count and pagination controls
7. THE Component_Library SHALL provide "no results" state with search suggestions

### Requirement 28: Notifications

**User Story:** As a user, I want to receive notifications about important events, so that I can stay informed and take timely action.

#### Acceptance Criteria

1. THE Component_Library SHALL display toast notifications for transient messages
2. THE Component_Library SHALL display notification badge on navigation items for unread items
3. THE Component_Library SHALL provide notification center with notification history
4. THE Component_Library SHALL categorize notifications by type (deadline, message, system)
5. THE Component_Library SHALL allow users to mark notifications as read
6. THE Component_Library SHALL allow users to configure notification preferences
7. WHEN a critical deadline approaches, THE Component_Library SHALL display prominent notification

### Requirement 29: Onboarding

**User Story:** As a new user, I want guided onboarding, so that I can understand how to use the platform effectively.

#### Acceptance Criteria

1. WHEN a user logs in for the first time, THE Component_Library SHALL display welcome modal
2. THE Component_Library SHALL provide interactive tutorial highlighting key features
3. THE Component_Library SHALL guide users through initial psychological assessment
4. THE Component_Library SHALL guide users through route selection
5. THE Component_Library SHALL allow users to skip onboarding steps
6. THE Component_Library SHALL track onboarding completion status
7. THE Component_Library SHALL provide "help" tooltips on complex features

### Requirement 30: Export and Sharing

**User Story:** As a user, I want to export and share my content, so that I can use it in external applications and collaborate with others.

#### Acceptance Criteria

1. THE Component_Library SHALL allow users to export narratives as PDF or DOCX
2. THE Component_Library SHALL allow users to export route plans as PDF
3. THE Component_Library SHALL allow users to export application checklists as PDF
4. THE Component_Library SHALL generate shareable links for narratives with privacy controls
5. THE Component_Library SHALL allow users to print formatted versions of content
6. THE Component_Library SHALL preserve formatting when exporting content
7. THE Component_Library SHALL include metadata (creation date, version) in exported files
