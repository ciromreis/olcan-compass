# Web V2 Session Handoff — 2026-03-10

## Scope

This handoff consolidates the current implementation state of the active `apps/web-v2` workstream after multiple continuation batches.

Use this document as the primary session-close reference for further review, assessment, and continuation.
Prefer it over older incremental handoff notes when planning the next frontend-only implementation pass.

## Canonical constraints

- Treat `docs/main/PRD.md` as read-only canon.
- Keep work inside `apps/web-v2` unless explicitly asked to touch legacy V1.
- Frontend is Portuguese-first.
- No backend/schema changes were made in this consolidation pass.

## High-confidence current state

`apps/web-v2` is now meaningfully beyond placeholder quality in these areas:

- Community feed and cross-engine reuse workflows
- Store-backed subscription and settings management
- Marketplace messaging with local attachments
- Marketplace booking detail with deliverable visibility derived from conversation attachments
- Forge document list filtering
- Forge export workflows with real local outputs
- Forge coach persistence per document
- Forge version management without browser `prompt()` / `confirm()`
- Interview list filtering and in-progress visibility
- Interview session persistence hardened to keep the original question set stable across reloads
- Organization portal with persisted members/settings and derived analytics
- Admin portal with persisted governance state and actionable controls
- Submission gate flow with persisted attempt history and app-level enforcement
- Provider portal with active-profile context and service operations
- Provider settings route and finance export operationalized
- Cross-surface payout workflow (provider request ↔ admin approval) operationalized
- Submission rule enforcement unified across application detail and settings flows

## What was completed in this session cluster

### 1. Subscription and account operationalization

Files:

- `apps/web-v2/src/stores/profile.ts`
- `apps/web-v2/src/app/(app)/subscription/page.tsx`
- `apps/web-v2/src/app/(app)/subscription/checkout/page.tsx`
- `apps/web-v2/src/app/(app)/subscription/manage/page.tsx`
- `apps/web-v2/src/app/(app)/subscription/usage/page.tsx`
- `apps/web-v2/src/app/(app)/settings/page.tsx`

Implemented:

- persisted plan state
- persisted subscription status
- renewal/cancellation dates
- persisted payment method metadata
- invoice history generation and export
- cancellation/reactivation flows
- local account/settings export

### 2. Marketplace messaging and booking deliverables

Files:

- `apps/web-v2/src/stores/marketplace.ts`
- `apps/web-v2/src/app/(app)/marketplace/messages/[id]/page.tsx`
- `apps/web-v2/src/app/(app)/marketplace/bookings/[id]/page.tsx`

Implemented:

- attachment-aware messages in local store
- thread UI for selecting/removing/sending attachments
- booking detail “Entregas” section now reads shared attachments from the provider conversation
- deliverable export manifests for local review

### 3. Interview workflow hardening

Files:

- `apps/web-v2/src/app/(app)/interviews/page.tsx`
- `apps/web-v2/src/stores/interviews.ts`
- `apps/web-v2/src/app/(app)/interviews/[id]/session/page.tsx`

Implemented:

- search and type/status filters on interview list
- explicit surfaced in-progress sessions
- persisted question lists inside sessions
- resumed sessions no longer regenerate a different question set after reload
- guard for stale `in_progress` sessions that already contain all answers

### 4. Forge workflow operationalization

Files:

- `apps/web-v2/src/app/(app)/forge/page.tsx`
- `apps/web-v2/src/stores/forge.ts`
- `apps/web-v2/src/app/(app)/forge/[id]/coach/page.tsx`
- `apps/web-v2/src/app/(app)/forge/[id]/export/page.tsx`
- `apps/web-v2/src/app/(app)/forge/[id]/page.tsx`
- `apps/web-v2/src/app/(app)/forge/[id]/versions/page.tsx`

Implemented:

- search and type filter on document list
- persistent coach threads per document
- quick coach prompts
- export support for Markdown, TXT, LaTeX, print-to-PDF flow, and mail draft generation
- version save/restore moved to modal-based flows
- editor “Analisar com IA” button now routes into the existing analysis surface

### 5. UI cleanup

File:

- `apps/web-v2/src/components/ui/Avatar.tsx`

Implemented:

- migrated from raw `<img>` to `next/image`
- removed the long-standing build warning from this component

### 6. Organization portal operationalization

Files:

- `apps/web-v2/src/stores/org.ts`
- `apps/web-v2/src/app/(app)/org/page.tsx`
- `apps/web-v2/src/app/(app)/org/members/page.tsx`
- `apps/web-v2/src/app/(app)/org/settings/page.tsx`
- `apps/web-v2/src/app/(app)/org/analytics/page.tsx`

Implemented:

- new persisted org store (organization profile, permissions, domains, members, activity)
- members page now uses live store data with invite, role change and status toggle actions
- invite flow hardened with duplicate/invalid handling
- settings page now edits and persists org profile/permissions/domains
- org dashboard cards now derive metrics from org + routes + sprints + applications stores
- analytics page now derives dimensional scores, destination distribution, monthly progression and includes CSV export

### 7. Admin portal operationalization

Files:

- `apps/web-v2/src/stores/admin.ts`
- `apps/web-v2/src/stores/marketplace.ts`
- `apps/web-v2/src/app/(app)/admin/users/page.tsx`
- `apps/web-v2/src/app/(app)/admin/providers/page.tsx`
- `apps/web-v2/src/app/(app)/admin/analytics/page.tsx`
- `apps/web-v2/src/app/(app)/admin/settings/page.tsx`
- `apps/web-v2/src/app/(app)/admin/moderation/page.tsx`
- `apps/web-v2/src/app/(app)/admin/ai/page.tsx`
- `apps/web-v2/src/app/(app)/admin/content/page.tsx`

Implemented:

- new persisted admin store for users, moderation cases, feature flags, platform limits and prompt registry
- users page now supports persisted role and status updates
- providers page approve/reject actions now execute real marketplace state updates
- analytics page migrated from static fixtures to derived platform metrics/funnel/destination/engine data
- settings page now persists feature flags and global limits
- moderation actions (resolve/investigate/dismiss) now persist per case
- IA page now reads persisted prompt registry and supports active toggles + usage registration
- content page now derives template/question-bank surfaces from Forge + Interview stores

### 8. Readiness/application gating operationalization

Files:

- `apps/web-v2/src/lib/readiness-gate.ts`
- `apps/web-v2/src/stores/submission-gate.ts`
- `apps/web-v2/src/app/(app)/readiness/gate/page.tsx`
- `apps/web-v2/src/app/(app)/applications/[id]/page.tsx`

Implemented:

- shared gate evaluator extracted to reusable utility
- new persisted gate-attempt store with criteria snapshots and missing criteria tracking
- readiness gate page now supports actionable attempt registration and contextual submission from `?appId=...`
- gate page can now mark application as submitted when all criteria are met
- application detail submit action now enforces gate criteria (not only documents readiness)
- application detail now links to gate with context (`/readiness/gate?appId=<id>`)

### 9. Provider workflow operationalization

Files:

- `apps/web-v2/src/stores/marketplace.ts`
- `apps/web-v2/src/app/(app)/provider/page.tsx`
- `apps/web-v2/src/app/(app)/provider/bookings/page.tsx`
- `apps/web-v2/src/app/(app)/provider/services/page.tsx`
- `apps/web-v2/src/app/(app)/provider/earnings/page.tsx`

Implemented:

- marketplace store now tracks `activeProviderId` with provider-context helpers
- provider pages now operate on active provider context instead of global aggregate rows
- provider services gained local create/toggle/remove actions backed by store mutations
- provider bookings now act on the active provider queue with status transitions and feedback
- provider earnings now derives scoped transaction data and supports CSV export

### 10. Provider settings and finance hardening

Files:

- `apps/web-v2/src/app/(app)/provider/settings/page.tsx`
- `apps/web-v2/src/app/(app)/admin/finance/page.tsx`
- `apps/web-v2/src/stores/marketplace.ts`

Implemented:

- added provider settings route with persisted profile updates (bio, languages, specialties, experience)
- removed broken provider dashboard settings link target by shipping the actual page
- admin finance transaction export now produces real CSV output
- build now includes `provider/settings` in generated routes

### 11. Payout workflow (provider/admin) operationalization

Files:

- `apps/web-v2/src/stores/marketplace.ts`
- `apps/web-v2/src/app/(app)/provider/earnings/page.tsx`
- `apps/web-v2/src/app/(app)/admin/finance/page.tsx`

Implemented:

- introduced persisted payout request entity (`pending`, `approved`, `rejected`, `paid`) in marketplace store
- provider earnings now creates real payout requests based on available balance
- provider earnings now displays payout request history with processing metadata
- admin finance now exposes payout request queue with approve/reject/pay actions
- payout state transitions now update shared persisted state across both surfaces

### 12. Submission enforcement hardening

Files:

- `apps/web-v2/src/lib/application-submission.ts`
- `apps/web-v2/src/app/(app)/applications/[id]/page.tsx`
- `apps/web-v2/src/app/(app)/applications/[id]/settings/page.tsx`

Implemented:

- extracted reusable submission-eligibility evaluator (documents + gate readiness)
- application detail submit action now uses shared eligibility evaluator
- application settings now prevents manual status bypass to `submitted` when gate/docs are not eligible
- settings page now surfaces contextual gate warning + direct link to gate page

## Verification

Latest verification command:

```bash
cd apps/web-v2
npm run build
```

Result:

- Exit code `0`
- Static generation completed successfully
- Generated `90/90` pages successfully
- No current `prompt()` / `confirm()` browser workflow remains in the active Forge path
- No current `"Anexo em breve"` or equivalent attachment placeholder remains in marketplace messaging
- Admin surfaces compile with no lint/type errors in this batch
- Readiness gate/app submission flow compiles and prerenders without suspense/hydration errors
- Provider portal pages compile cleanly with active-profile scoping
- provider settings route compiles and is statically generated
- payout workflow pages compile and sync state across provider/admin views
- application detail/settings submission behavior now follows same eligibility rule

## Consolidated bug scan

### Checked

- Forge editor/version flows for brittle browser dialogs
- interview session persistence across reloads
- marketplace attachment flow and booking deliverable derivation
- subscription/settings persistence
- org analytics and member management flows
- admin users/providers/settings/analytics/moderation/ai/content flows
- readiness gate and application submission coupling
- provider-side bookings/services/earnings operational behavior
- provider settings and admin finance export flows
- provider-admin payout request lifecycle
- anti-bypass enforcement for candidacy submission status updates
- build-time warnings/errors

### Fixed during this closeout

- interview sessions previously regenerated question sets on reload
- Forge version actions previously used `prompt()` / `confirm()`
- booking detail previously showed a static deliverables placeholder
- Avatar still used raw `<img>`
- stale completed-answer interview sessions could remain `in_progress`
- org invite flow could silently accept duplicates/invalid emails before this batch
- org analytics was previously static-only
- admin controls previously had multiple no-op action buttons and static metric fixtures
- readiness gate submit CTA was previously disabled-only with no persisted operation trail
- provider pages previously mixed all providers and had mostly inert service-management controls
- payout actions were previously toasts only without shared state lifecycle

### Residual risks

- some admin actions are still simulation-level (local-only persistence, no backend audit trail)
- readiness and application submission are now coupled locally, but still missing backend-grade submission/audit contracts
- provider-side operations are local-first and still need backend identity/ownership enforcement
- some pages still use visual “disabled” states tied to future flows, even where the rest of the engine is operational
- `apps/web-v2/src/app/(public)/page.tsx` still contains a TODO comment about deletion, though it is not currently blocking builds

## Recommended next batches

### Highest value

1. Replace remaining simulation-only admin controls with backend-ready contracts and audit history
2. Replace remaining local-only submission/gating behavior with backend API contracts and workflow states
3. Add backend-grade provider identity/ownership contracts and payout/dispute workflows

### Quality pass

1. Add smoke tests around persistent stores with critical derived flows
2. Audit all `cursor-not-allowed` surfaces to distinguish truly blocked flows from unfinished implementation
3. Normalize local export/download helpers into shared utilities

Note: `org/*` and core `admin/*` are now largely store-backed; next priority is backend contract hardening + operational gating.

## Files most important for the next AI to read first

- `docs/operations/WEB_V2_COMMUNITY_SESSION_HANDOFF_2026-03-09.md`
- `docs/operations/WEB_V2_SESSION_HANDOFF_2026-03-10.md`
- `apps/web-v2/src/stores/profile.ts`
- `apps/web-v2/src/stores/marketplace.ts`
- `apps/web-v2/src/stores/forge.ts`
- `apps/web-v2/src/stores/interviews.ts`
- `apps/web-v2/src/stores/org.ts`
- `apps/web-v2/src/stores/admin.ts`
- `apps/web-v2/src/stores/submission-gate.ts`
- `apps/web-v2/src/app/(app)/forge/[id]/page.tsx`
- `apps/web-v2/src/app/(app)/forge/[id]/versions/page.tsx`
- `apps/web-v2/src/app/(app)/interviews/[id]/session/page.tsx`
- `apps/web-v2/src/app/(app)/org/analytics/page.tsx`
- `apps/web-v2/src/app/(app)/admin/analytics/page.tsx`
- `apps/web-v2/src/app/(app)/readiness/gate/page.tsx`
- `apps/web-v2/src/app/(app)/provider/services/page.tsx`

## Final assessment

The V2 frontend workstream is now in a much better handoff state:

- fewer fake controls in active workflows
- fewer state drift risks
- clearer continuation seams
- clean production build

The best next AI session should treat this codebase as a store-driven Next.js product with several mature engine slices and a remaining backlog concentrated mostly in backend contract hardening and final operational gating flows.

## Batch addendum: payout transition hardening (latest)

Files:

- `apps/web-v2/src/stores/marketplace.ts`
- `apps/web-v2/src/app/(app)/admin/finance/page.tsx`

Implemented:

- converted payout status update action to return `boolean` success/failure
- enforced payout transition state machine in store:
  - `pending -> approved | rejected`
  - `approved -> paid`
  - `rejected` and `paid` are terminal
- blocked invalid direct transitions in state (including `pending -> paid`)
- updated admin finance payout controls to render only valid next actions per current status
- added invalid-transition toast path in admin finance when store rejects update

Verification:

- command:
  - `cd apps/web-v2 && npm run build`
- result:
  - exit code `0`
  - static generation `91/91`
  - no type/lint/build regressions introduced by payout hardening batch

## Batch addendum: critical-rule test harness (latest)

Files:

- `apps/web-v2/package.json`
- `apps/web-v2/src/lib/payout-transitions.ts`
- `apps/web-v2/src/stores/marketplace.ts`
- `apps/web-v2/src/lib/payout-transitions.test.ts`
- `apps/web-v2/src/lib/readiness-gate.test.ts`
- `apps/web-v2/src/lib/application-submission.test.ts`

Implemented:

- added a lightweight automated test harness on `web-v2` with `vitest`
- added `npm test` script (`vitest run`) to standardize quick regression checks
- extracted payout transition rules to shared pure helper (`payout-transitions.ts`)
- switched marketplace payout status validation to use shared transition helper
- added critical-rule unit tests for:
  - payout transition state machine invariants
  - readiness gate scoring + submit criteria
  - application submission eligibility (docs + readiness gate)

Verification:

- command:
  - `cd apps/web-v2 && npm test`
- result:
  - exit code `0`
  - test files: `3` passed
  - tests: `9` passed

- command:
  - `cd apps/web-v2 && npm run build`
- result:
  - exit code `0`
  - static generation `91/91`
  - no functional regression from test harness batch
  - known non-blocking warning still present in this environment: Next lockfile SWC patch warning

## Batch addendum: CSV export hardening + utility consolidation (latest)

Files:

- `apps/web-v2/src/lib/file-export.ts`
- `apps/web-v2/src/lib/file-export.test.ts`
- `apps/web-v2/src/app/(app)/admin/finance/page.tsx`
- `apps/web-v2/src/app/(app)/org/analytics/page.tsx`
- `apps/web-v2/src/app/(app)/provider/earnings/page.tsx`

Implemented:

- introduced shared file export utility with:
  - robust CSV escaping (quotes, commas, line breaks)
  - centralized download lifecycle (`Blob` + `URL.createObjectURL` + cleanup)
  - CSV export helper with UTF-8 BOM for spreadsheet compatibility
- replaced duplicated inline CSV export logic in:
  - admin finance transactions export
  - org analytics report export
  - provider earnings export
- added unit coverage for CSV builder edge cases:
  - primitives
  - escaping of commas/quotes/newlines
  - nullish cell normalization

Verification:

- command:
  - `cd apps/web-v2 && npm test`
- result:
  - exit code `0`
  - test files: `4` passed
  - tests: `12` passed

- command:
  - `cd apps/web-v2 && npm run lint`
- result:
  - exit code `0`
  - no ESLint warnings/errors

- command:
  - `cd apps/web-v2 && npm run build`
- result:
  - exit code `0`
  - static generation `91/91`
  - no regression from CSV consolidation batch
  - known non-blocking warning remains in this environment: Next lockfile SWC patch warning

## Batch addendum: unified download utility adoption (latest)

Files:

- `apps/web-v2/src/lib/file-export.ts`
- `apps/web-v2/src/app/(app)/settings/page.tsx`
- `apps/web-v2/src/app/(app)/subscription/manage/page.tsx`
- `apps/web-v2/src/app/(app)/marketplace/bookings/[id]/page.tsx`
- `apps/web-v2/src/app/(app)/forge/[id]/export/page.tsx`

Implemented:

- expanded adoption of the shared download helper so file downloads are no longer manually implemented per page
- removed duplicated `Blob`/`createObjectURL`/anchor lifecycle code from:
  - settings data export (`json`)
  - subscription invoice export (`txt`)
  - marketplace booking deliverable manifest export (`txt`)
  - forge export downloads (`md`, `txt`, `tex`)
- kept print-preview behavior for forge PDF path unchanged (by design)

Verification:

- command:
  - `cd apps/web-v2 && npm test`
- result:
  - exit code `0`
  - test files: `4` passed
  - tests: `12` passed

- command:
  - `cd apps/web-v2 && npm run lint`
- result:
  - exit code `0`
  - no ESLint warnings/errors

- command:
  - `cd apps/web-v2 && npm run build`
- result:
  - exit code `0`
  - static generation `91/91`
  - no regression from unified-download adoption batch
  - known non-blocking warning remains in this environment: Next lockfile SWC patch warning

## Batch addendum: finance metric correctness (latest)

Files:

- `apps/web-v2/src/lib/finance-metrics.ts`
- `apps/web-v2/src/lib/finance-metrics.test.ts`
- `apps/web-v2/src/app/(app)/admin/finance/page.tsx`

Implemented:

- fixed payout KPI semantics in admin finance:
  - previous card value used completed bookings (proxy)
  - now uses sum of payout requests with `status === "paid"` (real payout value)
- introduced shared payout summary helper with explicit aggregates:
  - `paidAmount`
  - `pendingAmount`
  - `approvedAmount`
  - `pendingCount`
- wired admin finance UI to helper for consistent card and pending header values
- added unit coverage for payout summary aggregation logic

Verification:

- command:
  - `cd apps/web-v2 && npm test`
- result:
  - exit code `0`
  - test files: `5` passed
  - tests: `14` passed

- command:
  - `cd apps/web-v2 && npm run lint`
- result:
  - exit code `0`
  - no ESLint warnings/errors

- command:
  - `cd apps/web-v2 && npm run build`
- result:
  - exit code `0`
  - static generation `91/91`
  - no regression from finance-metric correction batch
  - known non-blocking warning remains in this environment: Next lockfile SWC patch warning

## Batch addendum: provider withdrawable-balance rule consolidation (latest)

Files:

- `apps/web-v2/src/lib/finance-metrics.ts`
- `apps/web-v2/src/lib/finance-metrics.test.ts`
- `apps/web-v2/src/app/(app)/provider/earnings/page.tsx`

Implemented:

- extracted provider withdrawable-balance logic to shared finance helper:
  - `calculateAvailableToWithdraw(completedRevenue, requests)`
- standardized rule for committed funds:
  - subtracts `pending + approved + paid`
  - ignores `rejected`
  - clamps at zero
- replaced inline provider earnings calculation with shared helper to avoid rule drift
- added test coverage for:
  - rejected requests not reducing withdrawable balance
  - no negative withdrawable outputs

Verification:

- command:
  - `cd apps/web-v2 && npm test`
- result:
  - exit code `0`
  - test files: `5` passed
  - tests: `16` passed

- command:
  - `cd apps/web-v2 && npm run lint`
- result:
  - exit code `0`
  - no ESLint warnings/errors

- command:
  - `cd apps/web-v2 && npm run build`
- result:
  - exit code `0`
  - static generation `91/91`
  - no regression from withdrawable-balance consolidation batch
  - known non-blocking warning remains in this environment: Next lockfile SWC patch warning

## Batch addendum: workspace tooling normalization (pnpm lockfile consistency)

Files:

- `package-lock.json` (removed)
- `apps/web-v2/package-lock.json` (removed)
- `pnpm-lock.yaml` (updated by scoped install)

Implemented:

- normalized dependency management to match repository canonical manager (`pnpm`)
- removed residual npm lockfiles that were conflicting with workspace lockfile expectations
- reinstalled web-v2 dependency graph using workspace-aware command:
  - `pnpm install --filter @olcan/web-v2...`
- validated project commands with `pnpm --filter @olcan/web-v2` variants

Verification:

- command:
  - `pnpm --filter @olcan/web-v2 test`
- result:
  - exit code `0`
  - test files: `5` passed
  - tests: `16` passed

- command:
  - `pnpm --filter @olcan/web-v2 lint`
- result:
  - exit code `0`
  - no ESLint warnings/errors

- command:
  - `pnpm --filter @olcan/web-v2 build`
- result:
  - exit code `0`
  - static generation `91/91`
  - previous lockfile SWC patch warning no longer appears in this workflow

## Batch addendum: admin audit trail operationalization

Files:

- `apps/web-v2/src/stores/admin.ts`
- `apps/web-v2/src/app/(app)/admin/page.tsx`
- `apps/web-v2/src/app/(app)/admin/audit/page.tsx`
- `apps/web-v2/src/app/(app)/admin/providers/page.tsx`
- `apps/web-v2/src/app/(app)/admin/finance/page.tsx`

Implemented:

- added persistent admin audit model/state in admin store:
  - `AdminAuditLog` + `auditLogs`
  - retention cap (`300`) to prevent unbounded growth
  - `logAdminAction` and `clearAuditLogs` actions
- auto-instrumented store mutations with audit entries:
  - user role/status updates
  - moderation status transitions
  - feature flag toggles
  - platform limit updates
  - prompt activation toggles
  - prompt usage registration
- created new operational UI route:
  - `/admin/audit` with module filter, text search, CSV export, and local clear action
- integrated audit visibility into admin dashboard:
  - added “Auditoria” section card
  - merged latest audit events into “Atividade Recente”
- added manual audit emission for admin actions outside admin store:
  - provider approve/reject actions
  - payout approve/reject/paid actions

Verification:

- command:
  - `pnpm --filter @olcan/web-v2 test`
- result:
  - exit code `0`
  - test files: `5` passed
  - tests: `16` passed

- command:
  - `pnpm --filter @olcan/web-v2 lint`
- result:
  - exit code `0`
  - no ESLint warnings/errors

- command:
  - `pnpm --filter @olcan/web-v2 build`
- result:
  - exit code `0`
  - static generation `92/92` (new audit route included)
  - no build regressions introduced by audit trail batch

## Batch addendum: dynamic audit actor attribution + safe clear action

Files:

- `apps/web-v2/src/stores/admin.ts`
- `apps/web-v2/src/app/(app)/admin/users/page.tsx`
- `apps/web-v2/src/app/(app)/admin/moderation/page.tsx`
- `apps/web-v2/src/app/(app)/admin/settings/page.tsx`
- `apps/web-v2/src/app/(app)/admin/ai/page.tsx`
- `apps/web-v2/src/app/(app)/admin/providers/page.tsx`
- `apps/web-v2/src/app/(app)/admin/finance/page.tsx`
- `apps/web-v2/src/app/(app)/admin/audit/page.tsx`

Implemented:

- upgraded admin store mutation signatures to accept optional `actor` on audit-generating actions
- updated admin pages to pass current authenticated user email as actor (fallback to `admin@olcan.com`)
- updated manual audit emissions on providers/finance actions to use the same dynamic actor source
- hardened audit log clear UX with explicit destructive confirmation modal on `/admin/audit`

Verification:

- command:
  - `pnpm --filter @olcan/web-v2 test`
- result:
  - exit code `0`
  - test files: `5` passed
  - tests: `16` passed

- command:
  - `pnpm --filter @olcan/web-v2 lint`
- result:
  - exit code `0`
  - no ESLint warnings/errors

- command:
  - `pnpm --filter @olcan/web-v2 build`
- result:
  - exit code `0`
  - static generation `92/92`
  - no regressions after actor-attribution update

## Batch addendum: audited-ops hardening (testable audit helpers + invalid payout attempts)

Files:

- `apps/web-v2/src/lib/admin-audit.ts`
- `apps/web-v2/src/lib/admin-audit.test.ts`
- `apps/web-v2/src/stores/admin.ts`
- `apps/web-v2/src/app/(app)/admin/finance/page.tsx`

Implemented:

- extracted admin audit record construction/retention logic into reusable helper module:
  - `buildAuditRecord`
  - `prependAuditRecord`
  - shared constants for default actor/retention
- refactored admin store to consume helper and centralize audit defaults
- expanded automated coverage for audit helpers:
  - default actor fallback
  - explicit actor preservation
  - retention cap behavior
- instrumented finance admin flow to log invalid payout status transition attempts (`payout_invalid_transition`) before warning toast

Verification:

- command:
  - `pnpm --filter @olcan/web-v2 test`
- result:
  - exit code `0`
  - test files: `6` passed
  - tests: `19` passed

- command:
  - `pnpm --filter @olcan/web-v2 lint`
- result:
  - exit code `0`
  - no ESLint warnings/errors

- command:
  - `pnpm --filter @olcan/web-v2 build`
- result:
  - exit code `0`
  - static generation `92/92`
  - no regressions introduced by audited-ops hardening batch

## Batch addendum: admin access guard + expanded audit reliability

Files:

- `apps/web-v2/src/app/(app)/admin/layout.tsx`
- `apps/web-v2/src/lib/admin-audit.ts`
- `apps/web-v2/src/lib/admin-audit.test.ts`
- `apps/web-v2/src/stores/admin.ts`
- `apps/web-v2/src/app/(app)/admin/finance/page.tsx`

Implemented:

- added route-segment guard for `/admin/*`:
  - only `SUPER_ADMIN` can access admin pages
  - non-admin users now see explicit restricted-access state with safe return CTA
- expanded audit reliability through helper abstraction:
  - centralized record build/default actor/retention behavior
  - store refactor now uses helper for audit entry creation
- added explicit audit log event for invalid payout transitions in admin finance flow
- increased automated test coverage with dedicated admin-audit helper tests

Verification:

- command:
  - `pnpm --filter @olcan/web-v2 test`
- result:
  - exit code `0`
  - test files: `6` passed
  - tests: `19` passed

- command:
  - `pnpm --filter @olcan/web-v2 lint`
- result:
  - exit code `0`
  - no ESLint warnings/errors

- command:
  - `pnpm --filter @olcan/web-v2 build`
- result:
  - exit code `0`
  - static generation `92/92`
  - no regressions from access-guard/audit-reliability batch

## Batch addendum: accent-insensitive readiness scoring normalization

Files:

- `apps/web-v2/src/lib/text-normalize.ts`
- `apps/web-v2/src/lib/text-normalize.test.ts`
- `apps/web-v2/src/lib/readiness-gate.ts`
- `apps/web-v2/src/lib/readiness-gate.test.ts`
- `apps/web-v2/src/app/(app)/org/analytics/page.tsx`
- `apps/web-v2/src/app/(app)/readiness/page.tsx`
- `apps/web-v2/src/app/(app)/readiness/[dimension]/page.tsx`
- `apps/web-v2/src/app/(app)/readiness/history/page.tsx`
- `apps/web-v2/src/app/(app)/readiness/gaps/page.tsx`
- `apps/web-v2/src/app/(app)/readiness/risk/page.tsx`
- `apps/web-v2/src/app/(app)/readiness/financial/page.tsx`

Implemented:

- introduced shared normalization utility for robust string comparisons:
  - removes diacritics
  - lowercases
  - trims
- applied normalization to all dimension matching flows in readiness/org analytics calculations
- replaced accent-dependent match token usage (`"linguíst"`) with normalized token (`"linguist"`) where appropriate
- fixed latent mismatch risk for user-provided/custom sprint dimension labels without accents
- expanded tests:
  - new unit tests for text normalization helper
  - readiness gate test case validating accent-insensitive matching

Verification:

- command:
  - `pnpm --filter @olcan/web-v2 test`
- result:
  - exit code `0`
  - test files: `7` passed
  - tests: `22` passed

- command:
  - `pnpm --filter @olcan/web-v2 build`
- result:
  - exit code `0`
  - static generation `92/92`
  - no regressions introduced by normalization batch

## Batch addendum: readiness history operational timeline consolidation

Files:

- `apps/web-v2/src/lib/readiness-history.ts`
- `apps/web-v2/src/lib/readiness-history.test.ts`
- `apps/web-v2/src/app/(app)/readiness/history/page.tsx`

Implemented:

- introduced normalized readiness history mapper for gate attempts:
  - `mapGateAttemptsToHistory(attempts)`
- migrated readiness history table from static-dimensional rows to operational timeline rows:
  - source (`snapshot` vs `gate`)
  - status (`approved`/`blocked`)
  - gate criteria progress (`met/total`) when available
  - contextual app label for attempt origin
- merged current snapshot + persisted gate attempts into single time-ordered history view
- added destructive confirmation flow for clearing gate attempts from history
- added helper unit tests for gate attempt history normalization

Verification:

- command:
  - `pnpm --filter @olcan/web-v2 test`
- result:
  - exit code `0`
  - test files: `8` passed
  - tests: `23` passed

- command:
  - `pnpm --filter @olcan/web-v2 build`
- result:
  - exit code `0`
  - static generation `92/92`
  - no regressions introduced by readiness-history consolidation

## Batch addendum: frontend observability baseline (runtime error + web vitals)

Files:

- `apps/web-v2/src/lib/observability.ts`
- `apps/web-v2/src/lib/observability.test.ts`
- `apps/web-v2/src/stores/observability.ts`
- `apps/web-v2/src/providers/RuntimeMonitoringProvider.tsx`
- `apps/web-v2/src/providers/QueryProvider.tsx`
- `apps/web-v2/src/app/error.tsx`
- `apps/web-v2/src/app/(app)/admin/analytics/page.tsx`
- `apps/web-v2/src/app/(public)/page.tsx` (removed obsolete TODO-only stub)

Implemented:

- added persistent frontend observability store (`olcan-observability`) with retention cap for:
  - runtime frontend errors
  - web vitals samples
- added runtime monitoring provider (client-side) to capture:
  - `window.error`
  - `window.unhandledrejection`
  - Next.js `useReportWebVitals` metrics
- wired global error boundary (`app/error.tsx`) to emit structured error events instead of showing notification text only
- expanded admin analytics with operational frontend health section:
  - total errors
  - errors in last 24h
  - web vitals sample volume in last 24h
  - poor vitals count
  - latest error list with route + timestamp
- removed obsolete TODO-only duplicate root-page stub in `(public)` route group

Verification:

- command:
  - `pnpm --filter @olcan/web-v2 test`
- result:
  - exit code `0`
  - test files: `9` passed
  - tests: `26` passed

- command:
  - `pnpm --filter @olcan/web-v2 lint`
- result:
  - exit code `0`
  - no ESLint warnings/errors

- command:
  - `pnpm --filter @olcan/web-v2 build`
- result:
  - exit code `0`
  - static generation `92/92`
  - no regressions introduced by observability/runtime monitoring batch

## Batch addendum: admin observability console (operational governance)

Files:

- `apps/web-v2/src/app/(app)/admin/observability/page.tsx`
- `apps/web-v2/src/app/(app)/admin/page.tsx`
- `apps/web-v2/src/stores/admin.ts`

Implemented:

- added dedicated admin route `/admin/observability` for operational triage of frontend telemetry
- integrated section entry on admin dashboard navigation grid
- observability console capabilities:
  - combined timeline of frontend errors + web vitals
  - search by message/route/type
  - filters by event type and vital rating
  - CSV export for `all`, `errors`, or `vitals` slices
  - destructive clear actions (`errors`, `vitals`, `all`) with confirmation modal
  - summary cards for total errors, 24h errors, 24h vitals, and poor vitals
- added admin audit support for this domain:
  - new audit module `observability`
  - logs emitted on export and clear actions

Verification:

- command:
  - `pnpm --filter @olcan/web-v2 test`
- result:
  - exit code `0`
  - test files: `9` passed
  - tests: `26` passed

- command:
  - `pnpm --filter @olcan/web-v2 lint`
- result:
  - exit code `0`
  - no ESLint warnings/errors

- command:
  - `pnpm --filter @olcan/web-v2 build`
- result:
  - exit code `0`
  - static generation `93/93` (new admin observability route included)
  - no regressions introduced by observability console batch

## Batch addendum: root-level failure boundary hardening

Files:

- `apps/web-v2/src/app/global-error.tsx`

Implemented:

- added App Router root-level error boundary (`global-error.tsx`) to handle catastrophic failures above segment-level boundaries
- integrated root-level error fallback with observability store logging:
  - captures error name/message/stack/digest
  - records current pathname when available
- shipped explicit recovery actions in fallback UI:
  - retry (`reset`)
  - return to homepage

Verification:

- command:
  - `pnpm --filter @olcan/web-v2 lint`
- result:
  - exit code `0`
  - no ESLint warnings/errors

- command:
  - `pnpm --filter @olcan/web-v2 build`
- result:
  - exit code `0`
  - static generation `93/93`
  - no regressions introduced by global error boundary hardening

## Batch addendum: incident management over observability telemetry

Files:

- `apps/web-v2/src/lib/observability-incidents.ts`
- `apps/web-v2/src/lib/observability-incidents.test.ts`
- `apps/web-v2/src/stores/observability.ts`
- `apps/web-v2/src/app/(app)/admin/observability/page.tsx`

Implemented:

- added deterministic incident derivation layer over 24h telemetry windows:
  - `error_spike` incidents (per route + error name, threshold >= 3)
  - `vital_regression` incidents (poor vitals per route + metric, threshold >= 3)
  - severity calculation based on evidence count
  - stable incident IDs for status persistence
- expanded observability store with operational incident state:
  - persisted `incidentStates` map
  - status transitions (`open`, `acknowledged`, `resolved`)
  - clear action for incident state cache
- upgraded `/admin/observability` with incident operations:
  - incident list sorted by severity + recency
  - actions to acknowledge, resolve, and reopen incidents
  - incident CSV export
  - incident-state cleanup with confirmation
  - admin audit logs for export and status transitions
- added unit coverage for incident derivation and status-map application

Verification:

- command:
  - `pnpm --filter @olcan/web-v2 test`
- result:
  - exit code `0`
  - test files: `10` passed
  - tests: `28` passed

- command:
  - `pnpm --filter @olcan/web-v2 lint`
- result:
  - exit code `0`
  - no ESLint warnings/errors

- command:
  - `pnpm --filter @olcan/web-v2 build`
- result:
  - exit code `0`
  - static generation `93/93`
  - no regressions introduced by incident-management batch

## Batch addendum: executive incident visibility in admin analytics

Files:

- `apps/web-v2/src/app/(app)/admin/analytics/page.tsx`

Implemented:

- integrated derived incident stream into admin analytics summary layer
- added incident status rollups to “Saúde do Frontend”:
  - incidentes abertos
  - incidentes reconhecidos
  - incidentes resolvidos
- wired analytics incident counts to the same derivation/status model used by `/admin/observability`, preventing metric drift between detailed and executive surfaces

Verification:

- command:
  - `pnpm --filter @olcan/web-v2 lint`
- result:
  - exit code `0`
  - no ESLint warnings/errors

- command:
  - `pnpm --filter @olcan/web-v2 build`
- result:
  - exit code `0`
  - static generation `93/93`
  - no regressions introduced by analytics incident-rollup batch

## Batch addendum: role-based area guards for org/provider surfaces

Files:

- `apps/web-v2/src/lib/roles.ts`
- `apps/web-v2/src/lib/roles.test.ts`
- `apps/web-v2/src/app/(app)/admin/layout.tsx`
- `apps/web-v2/src/app/(app)/provider/layout.tsx`
- `apps/web-v2/src/app/(app)/org/layout.tsx`

Implemented:

- introduced shared role helpers for area access decisions:
  - `isSuperAdminRole`
  - `isProviderAreaRole`
  - `isOrgAreaRole`
- migrated admin guard to helper-based role check (removing inline hard-coded check drift risk)
- added missing route-segment guards:
  - `/provider/*` now restricted to `PROVIDER` and `SUPER_ADMIN`
  - `/org/*` now restricted to org-family roles (`ORG_MEMBER`, `ORG_COORDINATOR`, `ORG_ADMIN`, `SUPER_ADMIN`)
- both new guards include:
  - hydration-safe skeleton state
  - explicit restricted-access message
  - safe CTA back to dashboard
- added unit coverage for role helper invariants and role-family membership rules

Verification:

- command:
  - `pnpm --filter @olcan/web-v2 test`
- result:
  - exit code `0`
  - test files: `11` passed
  - tests: `31` passed

- command:
  - `pnpm --filter @olcan/web-v2 lint`
- result:
  - exit code `0`
  - no ESLint warnings/errors

- command:
  - `pnpm --filter @olcan/web-v2 build`
- result:
  - exit code `0`
  - static generation `93/93`
  - no regressions introduced by role-guard hardening batch

## Batch addendum: role-aware navigation for provider/org/admin journeys

Files:

- `apps/web-v2/src/lib/navigation.ts`
- `apps/web-v2/src/lib/navigation.test.ts`

Implemented:

- upgraded navigation mapping to be role-aware instead of role-neutral:
  - `PROVIDER` now receives `Provider Ops` section (`/provider`, `/provider/services`, `/provider/bookings`, `/provider/earnings`)
  - org-family roles now receive `Operação Org` section (`/org`, `/org/members`, `/org/analytics`)
  - `SUPER_ADMIN` now receives governance shortcuts (`/admin`, `/admin/observability`, `/admin/audit`)
- preserved end-user sections while prepending role-specific operational context
- added automated tests for role → navigation invariants and alias matching behavior

Verification:

- command:
  - `pnpm --filter @olcan/web-v2 test`
- result:
  - exit code `0`
  - test files: `12` passed
  - tests: `35` passed

- command:
  - `pnpm --filter @olcan/web-v2 lint`
- result:
  - exit code `0`
  - no ESLint warnings/errors

- command:
  - `pnpm --filter @olcan/web-v2 build`
- result:
  - exit code `0`
  - static generation `93/93`
  - no regressions introduced by role-aware navigation batch

## Batch addendum: auth bootstrap hardening for protected app shell

Files:

- `apps/web-v2/src/app/(app)/layout.tsx`
- `apps/web-v2/src/stores/auth.ts`
- `apps/web-v2/src/app/(auth)/login/page.tsx`
- `apps/web-v2/src/lib/auth-redirect.ts`
- `apps/web-v2/src/lib/auth-redirect.test.ts`
- `apps/web-v2/src/lib/supabase/middleware.ts`

Implemented:

- added client-side auth bootstrap in protected app shell (`(app)/layout`):
  - checks access token presence before rendering protected UI
  - validates token by calling `fetchProfile()` once during hydration
  - redirects to `/login?redirect=<current-path>` when token is missing/invalid
  - shows hydration-safe loading skeleton while auth bootstrap is unresolved
- upgraded `fetchProfile` contract in auth store:
  - now returns `Promise<boolean>` to explicitly signal valid/invalid session
- hardened login success routing:
  - login now respects optional `redirect` query parameter
  - safely falls back to `/dashboard` for invalid/missing redirect values
- added tested helper for consistent login redirect URL generation
- expanded middleware protected-route matcher set to match active app surfaces:
  - added `/community`, `/provider`, `/org`, `/subscription`

Verification:

- command:
  - `pnpm --filter @olcan/web-v2 test`
- result:
  - exit code `0`
  - test files: `13` passed
  - tests: `37` passed

- command:
  - `pnpm --filter @olcan/web-v2 lint`
- result:
  - exit code `0`
  - no ESLint warnings/errors

- command:
  - `pnpm --filter @olcan/web-v2 build`
- result:
  - exit code `0`
  - static generation `93/93`
  - no regressions introduced by auth-bootstrap hardening batch
