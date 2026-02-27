# Requirements Document

## Introduction

This document specifies requirements for embedding five economics-driven intelligence features into Olcan Compass, a mobility intelligence platform for international students and professionals. These features leverage economic theory (Market for Lemons, Intertemporal Choice, Opportunity Cost, Moral Hazard, and Pareto Optimality) to maximize business value while maintaining seamless user experience. All user-facing elements use Portuguese language with MMXD "Alchemical" voice, while admin dashboards provide rich analytics.

## Glossary

- **System**: The Olcan Compass platform (backend + frontend)
- **User**: An international student or professional using the platform
- **Admin**: A platform administrator with SUPER_ADMIN role
- **Provider**: A marketplace service provider (mentor, consultant, etc.)
- **Credential**: A cryptographic verification token proving user readiness
- **Readiness_Score**: A numerical measure of user preparation (0-100)
- **Route**: A mobility pathway with milestones toward a destination
- **Temporal_Preference**: User's time preference measured as discount rate
- **Opportunity**: A job, university program, or mobility target
- **Booking**: A marketplace service reservation with payment
- **Escrow**: Payment held until performance conditions are met
- **Feasible_Frontier**: The Pareto-optimal set of opportunities given constraints
- **Psychology_Engine**: The existing psychological profiling system
- **Marketplace_Engine**: The existing provider/booking system
- **Application_Engine**: The existing opportunity/application tracking system
- **Route_Engine**: The existing route planning system
- **Sprint_Engine**: The existing readiness sprint system

## Requirements

### Requirement 1: Trust Signal System (Verification Credentials)

**User Story:** As a user with high readiness scores, I want to prove my preparation to employers without sharing sensitive documents, so that I can increase my application acceptance rate.

#### Acceptance Criteria

1. WHEN a User achieves a Readiness_Score above 80, THE System SHALL generate a cryptographic Credential containing the score, timestamp, and user identifier hash
2. THE System SHALL store Credentials in the database with UUID, user_id, credential_type, score_value, issued_at, expires_at, and verification_hash fields
3. WHEN a User requests a verification link, THE System SHALL generate a public URL containing the Credential verification_hash
4. WHEN an external party accesses a verification URL, THE System SHALL display the Credential details without exposing personally identifiable information
5. THE System SHALL display a "Perfil Verificado" badge on User profiles WHERE a valid Credential exists
6. WHEN a Credential expires after 90 days, THE System SHALL mark it as inactive and remove the badge
7. THE System SHALL allow Users to revoke Credentials at any time
8. THE Admin_Dashboard SHALL display total Credentials issued, active Credentials, verification link clicks, and conversion attribution metrics
9. THE System SHALL track which Applications included Credential links and their acceptance rates
10. THE System SHALL send a Portuguese notification "Seu perfil está verificado! Compartilhe sua credencial com empregadores" WHEN a Credential is issued

### Requirement 2: Temporal Preference Matching

**User Story:** As an impatient user, I want route recommendations that match my urgency without feeling judged, so that I can follow a pathway aligned with my natural time preferences.

#### Acceptance Criteria

1. THE Psychology_Engine SHALL include temporal preference questions measuring discount rates during assessments
2. THE System SHALL calculate a Temporal_Preference score (0-100) WHERE 0 represents high patience and 100 represents high urgency
3. WHEN a User completes a psychology assessment, THE System SHALL store the Temporal_Preference in the PsychProfile table
4. THE Route_Engine SHALL tag RouteTemplates with recommended_temporal_range (min and max values)
5. WHEN a User requests route recommendations, THE System SHALL prioritize Routes WHERE the User's Temporal_Preference falls within the Route's recommended_temporal_range
6. THE System SHALL display route recommendations with natural Portuguese explanations such as "Esta rota combina com seu ritmo" without mentioning urgency or impatience
7. THE System SHALL adjust milestone density WHEN generating personalized Routes, creating more frequent milestones for Users with Temporal_Preference above 70
8. THE Admin_Dashboard SHALL display churn prediction scores based on temporal mismatch between User preferences and chosen Routes
9. THE Admin_Dashboard SHALL calculate lifetime value (LTV) segmented by Temporal_Preference cohorts
10. WHEN a User shows temporal mismatch (preference differs from Route by more than 30 points), THE System SHALL flag the User for retention intervention

### Requirement 3: Opportunity Cost Intelligence

**User Story:** As a procrastinating user, I want to understand the financial cost of delay without feeling guilty, so that I can make informed decisions about upgrading to premium tiers.

#### Acceptance Criteria

1. THE System SHALL calculate opportunity_cost_daily as the difference between target_salary and current_salary divided by 365
2. WHEN a User adds an Opportunity with target_salary, THE System SHALL store the opportunity_cost_daily in the database
3. THE System SHALL track user_momentum as the number of completed milestones in the past 30 days
4. WHEN user_momentum falls below 2 milestones per month, THE System SHALL classify the period as low_momentum
5. WHILE low_momentum is true, THE System SHALL display a "Potencial de Crescimento" widget showing cumulative opportunity cost
6. THE Widget SHALL use motivational Portuguese language such as "Cada dia de preparação te aproxima de R$ X.XXX/mês" rather than guilt-inducing messages
7. THE Widget SHALL include a call-to-action button linking to Pro or Premium tier upgrades
8. THE System SHALL track conversion events WHEN a User upgrades within 7 days of viewing the Widget
9. THE Admin_Dashboard SHALL display conversion funnel analytics showing Widget impressions, clicks, and revenue attribution
10. THE System SHALL calculate ROI for the Widget feature as attributed revenue divided by development cost
11. WHERE a User has no target_salary defined, THE System SHALL use market average for their target role and location

### Requirement 4: Performance-Bound Marketplace

**User Story:** As a marketplace client, I want confidence that mentors will deliver results before paying full price, so that I can invest in services without risk.

#### Acceptance Criteria

1. THE Marketplace_Engine SHALL support performance_bound flag on ServiceListings
2. WHERE performance_bound is true, THE System SHALL hold 30% of the Booking payment in escrow
3. THE System SHALL integrate Stripe Connect for escrow management
4. WHEN a Booking is created for a performance_bound service, THE System SHALL create an Escrow record with booking_id, amount_held, release_condition, and status fields
5. THE release_condition SHALL specify a minimum Readiness_Score improvement (default 10 points) measured before and after service delivery
6. WHEN a Booking is completed, THE System SHALL calculate readiness_improvement by comparing Sprint_Engine scores
7. IF readiness_improvement meets the release_condition, THEN THE System SHALL release the escrowed amount to the Provider
8. IF readiness_improvement fails to meet the release_condition, THEN THE System SHALL refund the escrowed amount to the User
9. THE System SHALL display a "Garantia de Resultado" badge on ServiceListings WHERE performance_bound is true
10. THE Provider_Profile SHALL display performance_success_rate calculated as successful escrow releases divided by total performance_bound Bookings
11. THE Admin_Dashboard SHALL track Provider performance metrics, refund rates, and average readiness improvements
12. THE System SHALL send Portuguese notifications "Seu pagamento está protegido até a melhoria ser confirmada" to Users and "Entregue resultados para receber o pagamento completo" to Providers

### Requirement 5: Scenario Optimization Engine

**User Story:** As an overwhelmed user, I want to see which opportunities are mathematically feasible given my constraints, so that I can avoid decision paralysis and focus on optimal choices.

#### Acceptance Criteria

1. THE System SHALL calculate a feasible_frontier for each User based on their constraints (budget, time, current_skills, target_location)
2. THE Application_Engine SHALL score each Opportunity on two dimensions: competitiveness (0-100) and resource_requirements (0-100)
3. THE System SHALL identify Pareto-optimal Opportunities WHERE no other Opportunity has both lower resource_requirements and higher competitiveness
4. WHEN a User accesses the "Simulador de Cenários" page, THE System SHALL display an interactive visualization of the feasible_frontier
5. THE Visualization SHALL use D3.js or Recharts to render a scatter plot with competitiveness on the Y-axis and resource_requirements on the X-axis
6. THE System SHALL highlight Pareto-optimal Opportunities in a distinct color (Lumina blue from MMXD tokens)
7. THE System SHALL allow Users to adjust constraint sliders (budget, time_available, skill_level) and recalculate the feasible_frontier in real-time
8. THE System SHALL display Portuguese explanations such as "Estas oportunidades oferecem o melhor equilíbrio entre competitividade e recursos necessários"
9. THE System SHALL track decision_quality as the percentage of User Applications targeting Pareto-optimal Opportunities
10. THE System SHALL measure time_to_first_application as days between account creation and first Application submission
11. THE Admin_Dashboard SHALL display decision_quality metrics segmented by User cohorts
12. THE Admin_Dashboard SHALL track engagement metrics for the Simulador including session duration, slider interactions, and Opportunities explored
13. WHEN a User applies to a non-optimal Opportunity, THE System SHALL display a gentle suggestion "Você considerou estas alternativas mais eficientes?" with Pareto-optimal options

### Requirement 6: Database Schema Extensions

**User Story:** As a developer, I want database tables to support economics-driven features, so that data is properly structured and queryable.

#### Acceptance Criteria

1. THE System SHALL create a verification_credentials table with columns: id (UUID), user_id (UUID FK), credential_type (VARCHAR), score_value (INTEGER), issued_at (TIMESTAMP), expires_at (TIMESTAMP), verification_hash (VARCHAR UNIQUE), is_active (BOOLEAN), revoked_at (TIMESTAMP)
2. THE System SHALL add temporal_preference (INTEGER 0-100) column to psych_profiles table
3. THE System SHALL add opportunity_cost_daily (DECIMAL) and target_salary (DECIMAL) columns to opportunities table
4. THE System SHALL add momentum_score (INTEGER) and last_momentum_check (TIMESTAMP) columns to users table
5. THE System SHALL create an escrow_transactions table with columns: id (UUID), booking_id (UUID FK), amount_held (DECIMAL), release_condition (JSONB), status (ENUM: pending, released, refunded), created_at (TIMESTAMP), resolved_at (TIMESTAMP)
6. THE System SHALL add performance_bound (BOOLEAN) and performance_success_rate (DECIMAL) columns to service_listings table
7. THE System SHALL add recommended_temporal_range_min (INTEGER) and recommended_temporal_range_max (INTEGER) columns to route_templates table
8. THE System SHALL create a scenario_simulations table with columns: id (UUID), user_id (UUID FK), constraints (JSONB), pareto_opportunities (JSONB), created_at (TIMESTAMP)
9. THE System SHALL add competitiveness_score (INTEGER 0-100) and resource_requirements_score (INTEGER 0-100) columns to opportunities table
10. ALL schema changes SHALL be implemented via Alembic migrations with proper up and down functions

### Requirement 7: Background Job Processing

**User Story:** As a user, I want economics calculations to happen in the background, so that my experience is never blocked by slow computations.

#### Acceptance Criteria

1. THE System SHALL use the existing AIJobQueue table for background job management
2. THE System SHALL create async Celery tasks for: credential generation, temporal matching, opportunity cost calculation, escrow resolution, and feasible frontier computation
3. WHEN a Readiness_Score crosses the 80 threshold, THE System SHALL enqueue a credential_generation job
4. WHEN a User completes a psychology assessment, THE System SHALL enqueue a temporal_matching job to recalculate route recommendations
5. THE System SHALL run an opportunity_cost_calculation job daily at 00:00 UTC for all Users with active Opportunities
6. WHEN a performance_bound Booking is marked complete, THE System SHALL enqueue an escrow_resolution job within 5 minutes
7. WHEN a User accesses the Simulador page, THE System SHALL check if a feasible_frontier calculation exists from the past 24 hours, and if not, enqueue a frontier_computation job
8. THE System SHALL return cached results WHILE a background job is processing, with a loading indicator
9. THE Admin_Dashboard SHALL display job queue health metrics: pending jobs, failed jobs, average processing time, and retry counts
10. IF a background job fails after 3 retries, THEN THE System SHALL log the error and send an alert to Admins

### Requirement 8: Admin Analytics Dashboards

**User Story:** As an admin, I want comprehensive analytics dashboards for each economics feature, so that I can measure business impact and optimize performance.

#### Acceptance Criteria

1. THE System SHALL create an Admin section at /admin/economics-intelligence accessible only to SUPER_ADMIN role
2. THE Credentials_Dashboard SHALL display: total issued, active count, expiration rate, verification link clicks, click-through rate, and conversion attribution by Credential type
3. THE Temporal_Dashboard SHALL display: User distribution by Temporal_Preference, churn rate by cohort, LTV by cohort, temporal mismatch alerts, and retention intervention success rate
4. THE Opportunity_Cost_Dashboard SHALL display: Widget impression count, click-through rate, conversion rate, attributed revenue, ROI calculation, and A/B test results
5. THE Marketplace_Dashboard SHALL display: performance_bound Booking count, escrow release rate, refund rate, average readiness improvement, Provider performance rankings, and revenue impact
6. THE Scenario_Dashboard SHALL display: Simulador session count, average session duration, slider interaction rate, decision_quality score distribution, time_to_first_application by cohort, and Pareto-optimal Application rate
7. THE System SHALL allow Admins to filter all metrics by date range, User cohort, and feature flag status
8. THE System SHALL export dashboard data as CSV or JSON for external analysis
9. THE System SHALL refresh dashboard metrics every 5 minutes using React Query with stale-while-revalidate strategy
10. THE System SHALL display Portuguese labels and tooltips on Admin dashboards with technical English terms in parentheses for clarity

### Requirement 9: Privacy and Security

**User Story:** As a user, I want my sensitive data protected when using economics features, so that my privacy is maintained.

#### Acceptance Criteria

1. THE System SHALL hash user identifiers in Credentials using SHA-256 before storage
2. THE System SHALL never expose user_id, email, or name in public verification URLs
3. THE Verification_Page SHALL display only: credential_type, score_value, issued_at, and verification_hash
4. THE System SHALL rate-limit verification URL access to 10 requests per IP per hour to prevent scraping
5. THE System SHALL encrypt escrow_transactions data at rest using PostgreSQL pgcrypto
6. THE System SHALL log all Credential generation, verification, and revocation events for audit trails
7. THE System SHALL require JWT authentication for all economics-related API endpoints except public verification URLs
8. THE System SHALL validate that Users can only access their own Credentials, Escrow records, and Scenario simulations
9. THE System SHALL sanitize all User inputs in Simulador constraint sliders to prevent injection attacks
10. THE System SHALL comply with LGPD (Brazilian data protection law) by allowing Users to export and delete all economics-related data

### Requirement 10: Frontend Integration and UX

**User Story:** As a user, I want economics features to feel like natural extensions of the existing interface, so that my experience is seamless and intuitive.

#### Acceptance Criteria

1. THE System SHALL use existing MMXD design tokens (Void, Lux, Lumina colors) for all new UI components
2. THE System SHALL follow existing component patterns from src/components/ui/ for consistency
3. THE "Perfil Verificado" badge SHALL appear on Psychology Dashboard as a subtle icon with Tooltip explaining benefits
4. THE "Rotas Recomendadas" section SHALL integrate into existing Routes/Templates page with a "Baseado no seu perfil" label
5. THE "Potencial de Crescimento" widget SHALL appear on Applications/Opportunities page as a Card component with Framer Motion entrance animation
6. THE "Garantia de Resultado" badge SHALL appear on ProviderCard components in Marketplace/Browse
7. THE "Simulador de Cenários" SHALL be a new page at /applications/simulator with Breadcrumb navigation
8. THE System SHALL use existing i18n patterns from src/i18n/pt-BR.ts for all Portuguese text
9. THE System SHALL display Toast notifications for all economics-related events (Credential issued, Escrow released, etc.)
10. THE System SHALL use existing hooks patterns (useAuth, usePsych, etc.) to create useCredentials, useEscrow, and useScenarios hooks
11. THE System SHALL ensure all new pages are responsive and work on mobile devices (320px minimum width)
12. THE System SHALL maintain existing loading states and error handling patterns using React Query

### Requirement 11: Parser and Serializer for Scenario Constraints

**User Story:** As a developer, I want to parse and serialize scenario constraint configurations, so that User preferences are correctly stored and retrieved.

#### Acceptance Criteria

1. WHEN a User adjusts constraint sliders in the Simulador, THE System SHALL serialize the constraints object to JSONB format
2. THE Constraints_Schema SHALL include fields: budget_max (DECIMAL), time_available_months (INTEGER), skill_level (INTEGER 0-100), target_locations (ARRAY), preferred_industries (ARRAY)
3. THE System SHALL validate that budget_max is non-negative and time_available_months is between 1 and 60
4. WHEN retrieving a saved simulation, THE System SHALL parse the JSONB constraints back into a typed TypeScript object
5. THE Pretty_Printer SHALL format Constraints objects into human-readable Portuguese text such as "Orçamento até R$ 50.000, 12 meses disponíveis, nível de habilidade intermediário"
6. FOR ALL valid Constraints objects, parsing then printing then parsing SHALL produce an equivalent object (round-trip property)
7. IF constraint parsing fails, THEN THE System SHALL return a descriptive Portuguese error message and use default constraint values
8. THE System SHALL version the Constraints schema to support future additions without breaking existing simulations

### Requirement 12: Success Metrics Tracking

**User Story:** As a product manager, I want to track the five key success metrics, so that I can validate the business impact of economics features.

#### Acceptance Criteria

1. THE System SHALL track credential_conversion_rate as (Applications with Credentials accepted / Total Applications with Credentials) and target 15% improvement over baseline
2. THE System SHALL track temporal_churn_reduction as (Churn rate with matching / Baseline churn rate) and target 20% reduction
3. THE System SHALL track opportunity_cost_conversion as (Pro/Premium upgrades within 7 days of Widget view / Total Widget views) and target 25% conversion rate
4. THE System SHALL track marketplace_booking_value as (Average performance_bound Booking value / Average standard Booking value) and target 30% increase
5. THE System SHALL track decision_paralysis_reduction as (Average time_to_first_application with Simulador / Baseline time_to_first_application) and target 40% reduction
6. THE Admin_Dashboard SHALL display all five metrics with trend lines, confidence intervals, and statistical significance indicators
7. THE System SHALL calculate baseline metrics from historical data before feature launch
8. THE System SHALL support A/B testing by allowing Admins to enable/disable features for specific User cohorts
9. THE System SHALL export metrics data for external statistical analysis tools
10. THE System SHALL alert Admins WHEN any metric deviates more than 2 standard deviations from expected values

