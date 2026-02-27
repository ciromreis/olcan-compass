# Implementation Plan: Economics-Driven Intelligence

## Overview

This plan implements five economics-driven features for Olcan Compass: Trust Signal System (verification credentials), Temporal Preference Matching (route recommendations), Opportunity Cost Intelligence (growth widget), Performance-Bound Marketplace (escrow), and Scenario Optimization Engine (feasible frontier). The implementation follows a surgical approach, embedding features naturally into existing engines without explicit economic terminology.

## Tasks

- [x] 1. Database schema and migrations
  - [x] 1.1 Create Alembic migration 0011 for new economics tables
    - Create `verification_credentials` table with indexes
    - Create `escrow_transactions` table with indexes
    - Create `scenario_simulations` table with indexes
    - Create `credential_usage_tracking` table with indexes
    - Create `opportunity_cost_widget_events` table with indexes
    - _Requirements: 1.1, 1.2, 4.1, 4.2, 5.1, 6.1, 7.1_
  
  - [x] 1.2 Create Alembic migration 0012 to extend existing tables
    - Add `temporal_preference` and `temporal_preference_updated_at` to `user_psych_profiles`
    - Add `momentum_score` and `last_momentum_check` to `users`
    - Add `opportunity_cost_daily`, `target_salary`, `competitiveness_score`, `resource_requirements_score` to `opportunities`
    - Add `recommended_temporal_range_min` and `recommended_temporal_range_max` to `route_templates`
    - Add `performance_bound` and `performance_success_rate` to `service_listings`
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.3, 5.2_
  
  - [x] 1.3 Create SQLAlchemy models for new tables
    - Create `VerificationCredential` model in `apps/api/app/db/models/economics.py`
    - Create `EscrowTransaction` model with `EscrowStatus` enum
    - Create `ScenarioSimulation` model
    - Create `CredentialUsageTracking` model
    - Create `OpportunityCostWidgetEvent` model with `WidgetEventType` enum
    - _Requirements: 1.1, 4.1, 5.1, 6.1, 7.1_

- [ ] 2. Backend services layer
  - [x] 2.1 Implement credentials service
    - Create `apps/api/app/services/credentials.py`
    - Implement `generate_credential()` with SHA-256 hash generation
    - Implement `verify_credential()` for public verification
    - Implement `revoke_credential()` with timestamp update
    - Implement `track_verification_click()` for analytics
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.7, 9.1, 9.2_
  
  - [ ]* 2.2 Write property tests for credentials service
    - **Property 1: Credential Generation Threshold**
    - **Property 2: Verification URL Validity**
    - **Property 3: Public Verification Privacy**
    - **Property 4: Credential Expiration**
    - **Property 5: Credential Revocation**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.6, 1.7, 9.1, 9.2, 9.3**
  
  - [x] 2.3 Implement temporal matching service
    - Create `apps/api/app/services/temporal_matching.py`
    - Implement `calculate_temporal_preference()` from psychology answers
    - Implement `get_matched_routes()` with scoring algorithm
    - Implement `adjust_milestone_density()` for personalized routes
    - Implement `predict_churn_risk()` based on temporal mismatch
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.7, 8.1_
  
  - [ ]* 2.4 Write property tests for temporal matching service
    - **Property 6: Temporal Preference Range**
    - **Property 7: Temporal Preference Persistence**
    - **Property 8: Route Recommendation Sorting**
    - **Property 9: Milestone Density Adjustment**
    - **Validates: Requirements 2.2, 2.3, 2.5, 2.7**
  
  - [x] 2.5 Implement opportunity cost service
    - Create `apps/api/app/services/opportunity_cost.py`
    - Implement `calculate_opportunity_cost()` using (target_salary - current_salary) / 365
    - Implement `calculate_user_momentum()` counting milestones in past 30 days
    - Implement `should_show_widget()` checking momentum < 2
    - Implement `track_widget_impression()`, `track_conversion()` for analytics
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
  
  - [ ] 2.6 Write property tests for opportunity cost service
    - **Property 10: Opportunity Cost Calculation**
    - **Property 11: Opportunity Cost Storage**
    - **Property 12: Momentum Calculation**
    - **Property 13: Widget Display Trigger**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
  
  - [x] 2.7 Implement escrow service
    - Create `apps/api/app/services/escrow.py`
    - Implement `create_escrow()` with Stripe Connect integration
    - Implement `calculate_readiness_improvement()` from sprint assessments
    - Implement `resolve_escrow()` with release/refund logic
    - Implement `release_to_provider()` and `refund_to_client()` Stripe transfers
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.6, 4.7, 4.8_
  
  - [ ]* 2.8 Write property tests for escrow service
    - **Property 14: Escrow Amount Calculation**
    - **Property 15: Escrow Release Condition Structure**
    - **Property 16: Readiness Improvement Calculation**
    - **Property 17: Escrow Resolution Logic**
    - **Validates: Requirements 4.2, 4.4, 4.5, 4.6, 4.7, 4.8**
  
  - [x] 2.9 Implement scenario optimization service
    - Create `apps/api/app/services/scenario_optimization.py`
    - Implement `calculate_feasible_frontier()` with constraint filtering
    - Implement `score_opportunity()` for competitiveness and resource requirements
    - Implement `identify_pareto_optimal()` using Pareto dominance algorithm
    - Implement `track_decision_quality()` for analytics
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.9_
  
  - [ ]* 2.10 Write property tests for scenario optimization service
    - **Property 18: Opportunity Scoring Completeness**
    - **Property 19: Pareto Optimality Definition**
    - **Property 20: Decision Quality Calculation**
    - **Validates: Requirements 5.2, 5.3, 5.9**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Backend API endpoints
  - [x] 4.1 Implement credentials API routes
    - Create `apps/api/app/api/routes/credentials.py`
    - Implement `POST /api/credentials/generate` with JWT auth
    - Implement `GET /api/credentials/me` with optional expired filter
    - Implement `GET /api/credentials/verify/{verification_hash}` (public, rate-limited)
    - Implement `POST /api/credentials/{credential_id}/revoke` with ownership check
    - Implement `POST /api/credentials/{credential_id}/track-usage` for application tracking
    - Mount router in `apps/api/app/api/router.py`
    - _Requirements: 1.1, 1.3, 1.4, 1.7, 6.2, 9.1_
  
  - [ ]* 4.2 Write integration tests for credentials API
    - Test credential generation at score 80 threshold
    - Test public verification without authentication
    - Test revocation with ownership validation
    - Test rate limiting on verification endpoint
    - _Requirements: 1.1, 1.3, 1.4, 1.7_
  
  - [x] 4.3 Implement temporal matching API routes
    - Create `apps/api/app/api/routes/temporal_matching.py`
    - Implement `GET /api/temporal-matching/preference` returning user's temporal score
    - Implement `GET /api/temporal-matching/routes` with limit parameter
    - Implement `POST /api/temporal-matching/adjust-milestones` for route personalization
    - Implement `GET /api/temporal-matching/churn-prediction` (admin only)
    - Mount router in `apps/api/app/api/router.py`
    - _Requirements: 2.3, 2.5, 2.6, 2.7, 8.1_
  
  - [x] 4.4 Implement opportunity cost API routes
    - Create `apps/api/app/api/routes/opportunity_cost.py`
    - Implement `GET /api/opportunity-cost/calculate` with opportunity_id parameter
    - Implement `GET /api/opportunity-cost/momentum` returning user momentum
    - Implement `POST /api/opportunity-cost/widget/impression` for tracking
    - Implement `POST /api/opportunity-cost/widget/click` for tracking
    - Implement `POST /api/opportunity-cost/widget/conversion` for tracking
    - Mount router in `apps/api/app/api/router.py`
    - _Requirements: 3.1, 3.3, 3.5, 3.6, 3.7_
  
  - [x] 4.5 Implement escrow API routes
    - Create `apps/api/app/api/routes/escrow.py`
    - Implement `POST /api/escrow/create` with Stripe integration
    - Implement `GET /api/escrow/{escrow_id}` with ownership validation
    - Implement `POST /api/escrow/{escrow_id}/resolve` (admin/system only)
    - Implement `GET /api/escrow/booking/{booking_id}` for status check
    - Mount router in `apps/api/app/api/router.py`
    - _Requirements: 4.1, 4.2, 4.6, 4.7, 4.8_
  
  - [x] 4.6 Implement scenario optimization API routes
    - Create `apps/api/app/api/routes/scenarios.py`
    - Implement `POST /api/scenarios/calculate-frontier` with constraints validation
    - Implement `GET /api/scenarios/simulations` with pagination
    - Implement `GET /api/scenarios/{simulation_id}` with opportunity details
    - Implement `POST /api/scenarios/track-decision` for decision quality
    - Mount router in `apps/api/app/api/router.py`
    - _Requirements: 5.1, 5.3, 5.4, 5.8, 5.9_
  
  - [x] 4.7 Implement admin analytics API routes
    - Create `apps/api/app/api/routes/admin_economics.py`
    - Implement `GET /api/admin/economics-intelligence/credentials` dashboard
    - Implement `GET /api/admin/economics-intelligence/temporal` dashboard
    - Implement `GET /api/admin/economics-intelligence/opportunity-cost` dashboard
    - Implement `GET /api/admin/economics-intelligence/marketplace` dashboard
    - Implement `GET /api/admin/economics-intelligence/scenarios` dashboard
    - Implement `GET /api/admin/economics-intelligence/success-metrics` dashboard
    - Mount router in `apps/api/app/api/router.py` with SUPER_ADMIN role requirement
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Background jobs with Celery
  - [x] 6.1 Set up Celery infrastructure
    - Create `apps/api/app/core/celery_app.py` with Redis configuration
    - Create `apps/api/app/core/celery_beat.py` with periodic task schedule
    - Add Celery and Redis dependencies to `apps/api/requirements.txt`
    - _Requirements: 12.1, 12.2_
  
  - [x] 6.2 Implement credential generation task
    - Create `apps/api/app/tasks/credentials.py`
    - Implement `generate_credential_task()` with retry logic
    - Implement `expire_old_credentials_task()` for daily cleanup
    - _Requirements: 1.1, 1.6_
  
  - [x] 6.3 Implement temporal matching task
    - Create `apps/api/app/tasks/temporal_matching.py`
    - Implement `recalculate_temporal_matches_task()` triggered on assessment completion
    - _Requirements: 2.1, 2.4_
  
  - [x] 6.4 Implement opportunity cost tasks
    - Create `apps/api/app/tasks/opportunity_cost.py`
    - Implement `calculate_opportunity_costs_daily_task()` for batch processing
    - Implement `check_momentum_and_trigger_widget_task()` for individual users
    - _Requirements: 3.1, 3.3_
  
  - [x] 6.5 Implement escrow resolution task
    - Create `apps/api/app/tasks/escrow.py`
    - Implement `resolve_escrow_task()` with readiness improvement calculation
    - Implement `check_escrow_timeouts_task()` for periodic monitoring
    - _Requirements: 4.6, 4.7, 4.8_
  
  - [x] 6.6 Implement scenario optimization task
    - Create `apps/api/app/tasks/scenario_optimization.py`
    - Implement `calculate_feasible_frontier_task()` for async computation
    - _Requirements: 5.1, 5.3_

- [x] 7. Integration with existing engines
  - [x] 7.1 Integrate with Psychology Engine
    - Modify `apps/api/app/api/routes/psychology.py` in `complete_assessment()` endpoint
    - Trigger `recalculate_temporal_matches_task` on assessment completion
    - Trigger `generate_credential_task` when readiness crosses 80 threshold
    - _Requirements: 1.1, 2.1, 2.4_
  
  - [x] 7.2 Integrate with Routes Engine
    - Modify `apps/api/app/api/routes/routes.py` in `get_route_templates()` endpoint
    - Add temporal match scoring and sorting to route recommendations
    - Include `temporal_match_score` and `temporal_match_reason` in response
    - _Requirements: 2.5, 2.6_
  
  - [x] 7.3 Integrate with Applications Engine
    - Modify `apps/api/app/api/routes/application.py` in `get_opportunities()` endpoint
    - Enrich opportunities with `opportunity_cost_daily` and competitiveness scores
    - Add `show_growth_widget` flag based on user momentum
    - _Requirements: 3.1, 3.5, 5.2_
  
  - [x] 7.4 Integrate with Marketplace Engine
    - Modify `apps/api/app/api/routes/marketplace.py` in `get_service_listings()` endpoint
    - Enrich services with `has_performance_guarantee` and success rate
    - Modify `create_booking()` to trigger escrow creation for performance-bound services
    - Modify `complete_booking()` to trigger escrow resolution task
    - _Requirements: 4.1, 4.2, 4.3, 4.6_
  
  - [x] 7.5 Integrate with Sprints Engine
    - Modify `apps/api/app/api/routes/sprint.py` in `complete_sprint_task()` endpoint
    - Trigger `check_momentum_and_trigger_widget_task` on task completion
    - Trigger `generate_credential_task` when readiness crosses 80 threshold
    - _Requirements: 1.1, 3.3, 4.6_

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Frontend custom hooks
  - [x] 9.1 Create useCredentials hook
    - Create `apps/web/src/hooks/useCredentials.ts`
    - Implement `useQuery` for fetching user credentials
    - Implement `useMutation` for generating and revoking credentials
    - Implement `copyVerificationLink()` helper function
    - _Requirements: 1.1, 1.3, 1.7_
  
  - [x] 9.2 Create useTemporalMatching hook
    - Create `apps/web/src/hooks/useTemporalMatching.ts`
    - Implement `useQuery` for fetching matched routes
    - Implement `useQuery` for fetching temporal preference
    - _Requirements: 2.3, 2.5_
  
  - [x] 9.3 Create useOpportunityCost hook
    - Create `apps/web/src/hooks/useOpportunityCost.ts`
    - Implement `useQuery` for fetching momentum score
    - Implement `useQuery` for checking widget display flag
    - Implement `useMutation` for tracking impressions, clicks, conversions
    - _Requirements: 3.3, 3.5, 3.6, 3.7_
  
  - [x] 9.4 Create useEscrow hook
    - Create `apps/web/src/hooks/useEscrow.ts`
    - Implement `useQuery` for fetching escrow status
    - Implement `useMutation` for creating and resolving escrow
    - _Requirements: 4.1, 4.6_
  
  - [x] 9.5 Create useScenarios hook
    - Create `apps/web/src/hooks/useScenarios.ts`
    - Implement `useState` for managing constraints
    - Implement `useQuery` for calculating frontier with debouncing
    - Implement `useMutation` for saving simulations
    - _Requirements: 5.1, 5.3, 5.8_

- [x] 10. Frontend domain components
  - [x] 10.1 Create VerificationBadge component
    - Create `apps/web/src/components/domain/VerificationBadge.tsx`
    - Display "Perfil Verificado" badge when credential exists
    - Add tooltip with credential details
    - Add copy verification link button
    - Use MMXD design tokens for styling
    - _Requirements: 1.5, 9.1_
  
  - [x] 10.2 Create TemporalRouteRecommendations component
    - Create `apps/web/src/components/domain/TemporalRouteRecommendations.tsx`
    - Display routes matched to user's temporal preference
    - Show Portuguese explanations ("Esta rota combina com seu ritmo")
    - Add Framer Motion transitions
    - _Requirements: 2.5, 2.6_
  
  - [x] 10.3 Create GrowthPotentialWidget component
    - Create `apps/web/src/components/domain/GrowthPotentialWidget.tsx`
    - Display cumulative opportunity cost during low momentum
    - Show motivational Portuguese messaging
    - Add CTA button for Pro/Premium upgrade
    - Track impressions and clicks automatically
    - _Requirements: 3.5, 3.6, 3.7_
  
  - [x] 10.4 Create PerformanceGuaranteeBadge component
    - Create `apps/web/src/components/domain/PerformanceGuaranteeBadge.tsx`
    - Display "Garantia de Resultado" badge on service listings
    - Add tooltip explaining escrow protection
    - Show provider success rate
    - _Requirements: 4.3_
  
  - [x] 10.5 Create ScenarioSimulator page
    - Create `apps/web/src/pages/Applications/Simulator.tsx`
    - Implement interactive scatter plot with D3.js or Recharts
    - Add constraint sliders (budget, time, skills)
    - Implement real-time feasible frontier recalculation with debouncing
    - Highlight Pareto-optimal opportunities
    - Add Portuguese explanations and suggestions
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ]* 10.6 Write property tests for constraints serialization
    - **Property 21: Constraints Schema Completeness**
    - **Property 22: Constraints Validation**
    - **Property 23: Constraints Serialization Round-Trip**
    - **Property 24: Constraints Pretty Printing**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6**

- [x] 11. Frontend integration into existing pages
  - [x] 11.1 Integrate VerificationBadge into Psychology Dashboard
    - Modify `apps/web/src/pages/Psychology/Dashboard.tsx`
    - Display badge when user has active credential
    - _Requirements: 1.5_
  
  - [x] 11.2 Integrate TemporalRouteRecommendations into Routes Templates
    - Modify `apps/web/src/pages/Routes/Templates.tsx`
    - Display matched routes at top of page
    - _Requirements: 2.5, 2.6_
  
  - [x] 11.3 Integrate GrowthPotentialWidget into Opportunities page
    - Modify `apps/web/src/pages/Applications/Opportunities.tsx`
    - Conditionally display widget when momentum is low
    - _Requirements: 3.5_
  
  - [x] 11.4 Integrate PerformanceGuaranteeBadge into Marketplace Browse
    - Modify `apps/web/src/pages/Marketplace/Browse.tsx`
    - Display badge on performance-bound service cards
    - _Requirements: 4.3_
  
  - [x] 11.5 Add Simulator route to application router
    - Modify `apps/web/src/App.tsx`
    - Add route `/applications/simulator` with lazy loading
    - Add navigation link in Applications section
    - _Requirements: 5.1_

- [x] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Portuguese i18n strings
  - [x] 13.1 Add credentials i18n strings
    - Modify `apps/web/src/i18n/pt-BR.ts`
    - Add strings for "Perfil Verificado", credential types, verification messages
    - _Requirements: 1.5, 9.1_
  
  - [x] 13.2 Add temporal matching i18n strings
    - Add strings for "Esta rota combina com seu ritmo", temporal categories
    - _Requirements: 2.6_
  
  - [x] 13.3 Add opportunity cost i18n strings
    - Add strings for growth widget, momentum messages, upgrade CTAs
    - _Requirements: 3.5_
  
  - [x] 13.4 Add escrow i18n strings
    - Add strings for "Garantia de Resultado", escrow status messages
    - _Requirements: 4.3_
  
  - [x] 13.5 Add scenario optimization i18n strings
    - Add strings for simulator UI, constraint labels, Pareto explanations
    - _Requirements: 5.5, 5.6, 5.7_

- [x] 14. Infrastructure and configuration
  - [x] 14.1 Update Docker Compose configuration
    - Modify `docker-compose.yml`
    - Add Redis service with persistent volume
    - Add Celery worker service
    - Add Celery beat service
    - _Requirements: 12.1, 12.2_
  
  - [x] 14.2 Update environment configuration
    - Modify `.env.example`
    - Add Redis URL, Celery broker URL, Stripe keys, encryption key
    - Add feature flags for all five features
    - _Requirements: 12.1, 12.3_
  
  - [x] 14.3 Add Stripe Connect configuration
    - Create `apps/api/app/core/stripe_client.py`
    - Configure Stripe SDK with API keys
    - Implement webhook signature verification
    - _Requirements: 4.1, 4.2_
  
  - [x] 14.4 Configure rate limiting
    - Install `slowapi` or similar rate limiting library
    - Add rate limiter to verification endpoint (10 requests per IP per hour)
    - _Requirements: 9.1_

- [x] 15. Security and data protection
  - [x] 15.1 Implement PII hashing for public credentials
    - Create `apps/api/app/core/security/hashing.py`
    - Implement `hash_user_identifier()` using SHA-256
    - Apply to verification credential generation
    - _Requirements: 9.2, 9.3_
  
  - [x] 15.2 Implement LGPD data export endpoint
    - Add `GET /api/me/economics-data/export` endpoint
    - Export all user economics data (credentials, temporal preference, momentum, simulations, escrow)
    - _Requirements: 9.4_
  
  - [x] 15.3 Implement LGPD data deletion endpoint
    - Add `DELETE /api/me/economics-data` endpoint
    - Delete credentials, widget events, simulations
    - Anonymize escrow transactions (keep for financial records)
    - _Requirements: 9.4_

- [x] 16. Performance optimizations
  - [x] 16.1 Implement Redis caching layer
    - Create `apps/api/app/core/cache.py`
    - Implement caching for credentials, temporal preferences, momentum scores
    - Add cache invalidation on data updates
    - _Requirements: 12.1_
  
  - [x] 16.2 Add database query optimizations
    - Add eager loading with `selectinload` for escrow-booking queries
    - Add pagination to admin analytics endpoints
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 16.3 Implement frontend code splitting
    - Lazy load Simulator page with React.lazy
    - Lazy load admin economics dashboard
    - _Requirements: 5.1_
  
  - [x] 16.4 Add debounced slider updates in Simulator
    - Use `useDebouncedCallback` for constraint changes
    - Wait 500ms after user stops adjusting before recalculating
    - _Requirements: 5.4_

- [x] 17. Monitoring and observability
  - [x] 17.1 Add structured logging
    - Install `structlog` library
    - Add structured logs for credential generation, escrow resolution, frontier calculation
    - Include user_id, feature name, and relevant metrics in logs
    - _Requirements: 12.4_
  
  - [x] 17.2 Add health check endpoint
    - Create `GET /api/health/economics` endpoint
    - Check database, Redis, Celery connectivity
    - Return status for each economics feature
    - _Requirements: 12.4_
  
  - [x] 17.3 Add error tracking
    - Configure error handlers for all economics endpoints
    - Return Portuguese error messages with error codes
    - Log errors with full context for debugging
    - _Requirements: 12.4_

- [x] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [-] 19. Documentation and deployment preparation
  - [x] 19.1 Update API documentation
    - Document all new endpoints in OpenAPI/Swagger
    - Include request/response examples
    - Document authentication and authorization requirements
    - _Requirements: All API endpoints_
  
  - [x] 19.2 Create deployment checklist
    - Document pre-deployment steps (run tests, verify migrations)
    - Document deployment steps (apply migrations, start Celery, deploy services)
    - Document post-deployment verification (smoke tests, health checks)
    - Document rollback plan
    - _Requirements: 12.3_
  
  - [x] 19.3 Update HANDOFF.md and STATUS.md
    - Document all five implemented features
    - Update feature completion status
    - Document known limitations and future enhancements
    - _Requirements: All features_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (24 total)
- Unit tests validate specific examples and edge cases
- All user-facing text uses Portuguese with MMXD "Alchemical" voice
- Features are embedded surgically into existing engines without explicit economic terminology
- Background jobs handle heavy computations asynchronously
- Admin dashboards provide rich analytics for measuring business impact
