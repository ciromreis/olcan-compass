# Web V2 Community Session Handoff — 2026-03-09

## Scope of this handoff

This document is a focused continuation handoff for the active `apps/web-v2` workstream.
It should be preferred over the legacy repo-wide handoff docs when the next AI session continues work on the Content & Community layer.

This session did **not** modify backend/API code.
This session stayed inside the frontend/community surface and supporting shared frontend utilities.

## Canonical constraints

- Treat `docs/main/PRD.md` as read-only canon.
- Do not make backend schema changes for this continuation unless explicitly requested.
- The current workstream is inside `apps/web-v2`.
- Frontend is Portuguese-first.

## What was completed before this handoff

### Community save consolidation

The duplicated save-to-community logic was consolidated across Forge, Applications, and Routes.

Implemented shared pieces:

- `apps/web-v2/src/lib/community-artifacts.ts`
  - Pure payload builders for community artifact drafts.
- `apps/web-v2/src/lib/community-feedback.ts`
  - Shared post-save feedback messages.
- `apps/web-v2/src/hooks/use-community-artifact-save.ts`
  - Shared orchestration hook for saving engine artifacts into community.
- `apps/web-v2/src/hooks/index.ts`
  - Exports the shared hook.

Adopted in engine pages:

- `apps/web-v2/src/app/(app)/forge/[id]/page.tsx`
- `apps/web-v2/src/app/(app)/applications/[id]/page.tsx`
- `apps/web-v2/src/app/(app)/routes/[id]/page.tsx`

### Shared community UI consolidation

Implemented reusable UI to replace repeated contextual/community save UI:

- `apps/web-v2/src/components/ui/CommunityContextSection.tsx`
- `apps/web-v2/src/components/ui/SaveToCommunityButton.tsx`
- `apps/web-v2/src/components/ui/index.ts`

Adopted in pages including:

- `apps/web-v2/src/app/(app)/readiness/page.tsx`
- `apps/web-v2/src/app/(app)/applications/page.tsx`
- `apps/web-v2/src/app/(app)/applications/[id]/page.tsx`
- `apps/web-v2/src/app/(app)/routes/[id]/page.tsx`
- `apps/web-v2/src/app/(app)/forge/[id]/page.tsx`

## What was completed in this session

### Community feed is now more actionable

Primary file:

- `apps/web-v2/src/app/(app)/community/page.tsx`

Additions made:

- Engine-origin badges for artifact items using `sourceRef.engine`
- Entity/source labeling via `sourceRef.entityLabel`
- Direct origin action for internal engine links (`Abrir origem`)
- Preserved general `href` open behavior for both internal and external links
- Added engine-origin filter to the main feed controls
- Added inline reply submission using the existing `addReply` store action
- Added collection-based filtering so sidebar collections now affect the main feed
- Added visible “filtered by collection” state with clear/reset action
- Extracted the feed presentation into smaller local components without changing business behavior:
  - `apps/web-v2/src/app/(app)/community/CommunityFeedItem.tsx`
  - `apps/web-v2/src/app/(app)/community/CommunityFeedFilters.tsx`
  - `apps/web-v2/src/app/(app)/community/CommunityCollectionsPanel.tsx`
- Extracted the side-panel forms into smaller local components without changing business behavior:
  - `apps/web-v2/src/app/(app)/community/CommunityQuestionForm.tsx`
  - `apps/web-v2/src/app/(app)/community/CommunityReferenceForm.tsx`
- Added collection membership chips directly on feed items so saved-board context is visible in the main feed
- Active collection filtering now visually highlights matching collection chips on feed items
- Replaced the generic internal engine CTA with engine-aware return actions in the feed:
  - Forge → `Continuar no Forge`
  - Applications → `Abrir candidatura`
  - Routes → `Voltar para rota`
- Added a clearer secondary internal CTA label (`Ver na Forge` / `Ver na Applications` / `Ver na Routes`) for artifact items with internal links
- Added workflow-aware follow-up CTAs for engine-origin artifacts using existing stable routes:
  - Forge → `Ver análise`
  - Applications → `Abrir ajustes`
  - Routes → `Ver milestones`
- Refined workflow-aware CTAs to be subtype-sensitive where current artifact metadata is reliable:
  - Forge CV artifacts → `Exportar CV`
  - Forge motivation/personal statement artifacts → `Ver alinhamento`
  - Forge research proposal artifacts → `Ver coach`
  - Forge recommendation artifacts → `Ver versões`
  - Application scholarship artifacts → `Revisar critérios`
  - Application career artifacts → `Ver progresso`
  - Route visa artifacts → `Ver riscos`
  - Route readiness artifacts → `Ver timeline`
- Extracted the growing CTA/reuse-routing rules from `CommunityFeedItem.tsx` into `apps/web-v2/src/lib/community-reuse.ts`
- `CommunityFeedItem.tsx` now consumes the shared helper and remains more presentation-focused
- Feed cards now surface an inline `Próximo passo sugerido` hint based on the same shared reuse helper, making the recommended next action visible before the CTA row
- Feed cards now also show a compact workflow-context block with existing metadata such as engine, suggested step, connected origin, and whether the destination is an internal flow or external reference
- Community-page save actions now respect the active selected collection context instead of always falling back to the first collection when a collection is actively selected
- The active collection is now surfaced explicitly in the reference form and collections panel so the current save target is visible in the UI
- Non-engine community items now also receive topic-aware reuse targets through the shared helper (for example, narrative items can route back to Forge, visa/readiness items back to Routes, and scholarship/career items back to Applications)
- Community feed cards now expose direct reuse actions that deep-link into existing engine creation flows with prefilled context:
  - Narrative items → `/forge/new` with prefilled type/title/target fields where available
  - Scholarship/Career items → `/applications/new` with prefilled type/program/country where available
  - Visa/Readiness items → `/routes/new` with prefilled route intent/country where available
- `forge/new`, `applications/new`, and `routes/new` now accept those query params client-side and prefill their creation forms without introducing store-side coupling
- Direct-reuse inference is now smarter and more metadata-aware:
  - country hints are inferred from item title/description/tags/entity labels instead of only the first tag
  - Forge draft type inference uses broader metadata signals (for example CV, recommendation, research proposal, personal statement)
  - Application and route draft types also fall back to metadata keywords when topic alone is not enough
- Quality-focused hardening pass completed without adding new test infrastructure:
  - application direct reuse now continues using country labels expected by `/applications/new`
  - route direct reuse now converts country hints into route-country codes expected by `/routes/new`
  - shared country inference is now centralized instead of duplicating ad hoc label handling
- `applications/[id]/settings` is now a more operational, store-aligned page instead of a mostly placeholder settings form:
  - edits persisted fields that actually exist today (`program`, `status`, `notes`)
  - shows real document and timeline progress summaries
  - surfaces suggested related routes from the current workspace
  - removes non-persistent placeholder controls like fake route binding / fake notification toggles
- `routes/[id]/settings` is now also a store-aligned operational page instead of placeholder settings chrome:
  - focuses on persisted route fields already available in store (`name`, `type`, `country`, `timeline`, `budget`, `createdAt`)
  - shows real route progress, in-progress milestones, near-risk milestones, and grouped milestone summaries
  - links users into real route execution surfaces (`milestones`, `timeline`, `risk`) instead of fake visibility/notification controls
  - keeps archive as informational-only because archive persistence does not exist yet, while delete remains real
- `interviews/question-bank` is now a real interview workflow surface instead of a static brochure page:
  - reads the real interview question bank from `src/stores/interviews.ts` instead of duplicating hardcoded counts/content in the page
  - adds real search and interview-type filtering across the question bank
  - surfaces per-type usage signals based on completed interview sessions already stored locally
  - turns question and category rows into actionable launch points for interview practice instead of dead-end placeholder cards
- `interviews/new` now accepts client-side query-param prefills for `type`, `target`, `language`, and `difficulty`
  - this keeps the question bank lightweight and decoupled while allowing direct entry into a prepared interview setup flow
  - the prefill handling follows the same client-side URL parsing pattern already used in other `apps/web-v2` creation pages to avoid prerender issues
- `profile/psych/results` COI and route recommendation are now computed from real psych store data instead of hardcoded values:
  - COI (`R$/dia`) is derived from `getOverallScore()` via `Math.max(15, Math.round(350 * (1 - score/100)))` — scales from R$350/day (0% readiness) down to R$15/day minimum
  - Recommended route type is inferred from raw per-dimension scores using a priority waterfall: `scholarship` (high financial stress + goals) → `postgrad` (high risk/confidence/discipline) → `work_visa` (risk + goals + decisions) → `exchange` (high anxiety + low confidence) → `study_abroad` (default)
  - `ROUTE_META` table provides a `label` and `description` for each of the 5 route types, shown inline in the recommendation card
- `profile/page.tsx` edit form now persists changes instead of silently discarding them:
  - `full_name` is saved via new `updateLocalUser` action added to `src/stores/auth.ts` (in-memory + localStorage, no API call)
  - `origin` and `destination` are persisted via new `src/stores/profile.ts` store (Zustand + localStorage, key `olcan-profile-prefs`)
  - display mode reads from persisted store values instead of hardcoded defaults
  - edit mode seeds all three fields from persisted state when entering edit mode

### Community store already supports the new feed behavior

Relevant file:

- `apps/web-v2/src/stores/community.ts`

Important current store capabilities:

- `sourceRef` metadata on community artifacts
- `collectionIds` on items
- `syncCollectionMembership(...)` keeps item/collection membership aligned
- `addReply(itemId, { author, body })` appends replies locally
- `saveArtifact(...)` deduplicates by `sourceRef.engine + sourceRef.entityId`

## Build verification

The latest `apps/web-v2` production build completed successfully.

Command used:

```bash
npm run build
```

Working directory:

```bash
apps/web-v2
```

Result:

- Exit code `0`
- Community-origin actions batch: clean build
- Origin-filter batch: clean build
- Inline reply batch: clean build
- Collection-filter batch: clean build
- Feed component-extraction batch: clean build
- Side-panel form-extraction batch: clean build
- Feed collection-chip enhancement batch: clean build
- Engine-aware feed CTA enhancement batch: clean build
- Workflow-aware reuse CTA enhancement batch: clean build
- Subtype-aware reuse CTA enhancement batch: clean build
- Reuse-helper extraction batch: clean build
- In-card workflow guidance enhancement batch: clean build
- Richer workflow-context enhancement batch: clean build
- Active-collection save targeting batch: clean build
- Active-target UX cue batch: clean build
- Topic-aware reuse fallback batch: clean build
- Direct-reuse prefill batch: clean build
- Smarter direct-reuse inference batch: clean build
- Direct-reuse quality-hardening batch: clean build
- Application-settings operationalization batch: clean build
- Route-settings operationalization batch: clean build
- Interview-question-bank operationalization batch: clean build
- Profile-psych-results + profile-edit-persistence batch: clean build
- Full codebase audit + bug-fix batch: clean build
- Settings persistence + subscription operationalization batch: clean build
- Sprint creation fix + profile completeness + readiness deep-links batch: clean build
- Readiness deep-links + hydration fixes batch: clean build

Observed warning:

- Existing warning in `src/components/ui/Avatar.tsx` about using `<img>` instead of Next `<Image />`

No new build failures were introduced by this session.

## Current behavior to understand before continuing

### Community item behavior

- Feed filtering now combines:
  - search
  - item type
  - topic
  - engine origin
  - selected collection
- Artifact cards can show:
  - type badge
  - topic badge
  - source badge
  - origin badge (`Forge`, `Applications`, `Routes`)
  - connected entity label
  - collection membership chips
  - engine-aware return CTA labels
  - workflow-aware follow-up CTA labels
  - subtype-aware workflow CTA labels when tags/topic metadata is strong enough
- shared reuse-routing helper consumed by the feed item component
- inline next-step guidance text driven by the same reuse helper
- compact workflow-context block summarizing engine, next step, connected origin, and access mode
- save actions on the community page now target the active selected collection when one is in context
- the active save target is visibly echoed in the right-side community panels
- non-engine items can now surface topic-driven reuse/navigation affordances even without `sourceRef`
- If an item has `sourceRef` and internal `href`, the UI shows a direct origin CTA.
- Replies are stored locally through Zustand persist, not through any backend.
- direct-reuse CTA links can launch prefilled engine creation flows from relevant community items
- direct-reuse prefill inference now uses richer metadata analysis for subtype and country defaults
- route-prefill country handling now distinguishes correctly between application labels and route codes
- application settings now provide a real persisted-notes workflow and operational readiness summary instead of placeholder-only controls
- route settings now provide a real operational review surface aligned with current route-store capabilities
- interview question bank now reads the real store-backed question set, supports active filtering/search, and can launch directly into prefilled interview setup
- interview setup now supports URL-driven prefills so question-bank entry points can prepare the session type/context without hidden cross-store mutations
- If an item has `sourceRef` and internal `href`, the UI shows a direct origin CTA.
- Replies are stored locally through Zustand persist, not through any backend.

### Data model assumptions currently in place

- Community feed is frontend-local/persisted state.
- `collectionIds` on items may be empty or undefined.
- Collection selection filters against `item.collectionIds`.
- Internal engine navigation depends on `item.href` being present and not external.
- External references still use normal anchor behavior.
- Direct reuse currently remains route/query-param based; do not introduce hidden cross-store mutations unless the product explicitly wants one-click object creation from community items
- Topic-aware fallback targets should stay in the shared reuse helper so non-engine item behavior remains centralized with engine-origin item behavior
- Direct reuse currently remains route/query-param based; do not introduce hidden cross-store mutations unless the product explicitly wants one-click object creation from community items
- Keep direct-reuse inference heuristic and transparent; if reuse needs stronger guarantees later, promote explicit artifact metadata in store/builders rather than piling on opaque heuristics
- There is still no frontend test runner configured in `apps/web-v2`; prefer explicit planned setup rather than sneaking test infra into a feature batch
- When upgrading placeholder engine settings pages, prefer removing fake controls and replacing them with summaries or persisted fields that already exist in store shape
- Route settings should remain execution-focused until the route store gains true editable metadata or archival fields
- Interview question-bank behavior should stay sourced from the shared interview store helpers so question content used for practice sessions and question discovery does not drift apart

## Risks / caveats for the next AI

### 1. Legacy docs are stale for `apps/web-v2`

- `docs/operations/HANDOFF.md` and `docs/operations/STATUS.md` mainly describe older repo phases and are not authoritative for this current `apps/web-v2` community work.
- Use this handoff for the active continuation thread.

### 2. Git status is noisy

At handoff time, `git status --short` includes many unrelated repo changes outside this session, including:

- modified files in `apps/web/`
- untracked monorepo/workspace files
- `apps/web-v2/` appears as untracked at repo level

Do **not** assume all repo changes belong to this session.
Work carefully and narrow changes to the exact files you need.

### 3. Community page has grown in responsibility

`apps/web-v2/src/app/(app)/community/page.tsx` now still contains:

- feed filtering logic
- reply draft state
- collection selection/filter state
- create question/reference/collection handlers
- orchestration wiring for extracted local components

The biggest presentation-heavy parts were already extracted into:

- `CommunityFeedItem`
- `CommunityFeedFilters`
- `CommunityCollectionsPanel`
- `CommunityQuestionForm`
- `CommunityReferenceForm`

A future continuation may still benefit from extracting:

- feed filter state/helpers
- inline reply composer if it grows beyond current scope
- optional higher-level layout/container helpers if more community modules are added

Only do this if the user explicitly wants further consolidation or if the file becomes a maintenance bottleneck.

### 4. Current collection behavior has an important constraint

 `toggleSave(itemId, collectionId?)` currently toggles global `isSaved` and optionally syncs one collection membership.

 That means it is **not yet safe** to interpret the current save button as a general “add this already-saved item to another collection” control.

 Safe current behavior:

 - showing collection chips in the feed
 - filtering by selected collection
 - saving new references/artifacts into the default collection path already used by the page

 Risky without store changes:

 - repurposing the current save button into a multi-collection attachment flow

 If the next session wants richer collection targeting, update the store semantics first instead of only changing the button UI.

## Recommended next continuation options

Choose one focused batch.

### Option A — Continue extracting the remaining page-side forms

Best if the next session is about repository organization and maintainability.

Suggested targets:

- optional `CommunityReplyComposer`
- optional shared filter-state hook if the page gains more filtering modes
- optional higher-level community module layout helpers

Goal:

- Improve reuse only if new community surfaces start duplicating this structure.

### Option B — Make saved artifacts more reusable
 
 Best if the next session is feature-facing.
 
 Ideas:
 
 - Show related engine metadata more prominently
 - Add direct reuse actions from community back into engine workflows
 - Add richer collection targeting only after adjusting store semantics beyond the current `toggleSave(...)` behavior
 - If needed later, upgrade engine-aware CTAs from labels-only to engine-specific deep-link targets once each engine exposes a stable sub-route contract for reuse
 - If needed later, refine workflow CTAs per artifact subtype once Forge/Application/Route artifact metadata becomes more granular than engine-level `sourceRef`
 - If needed later, move subtype CTA routing into a dedicated community reuse helper so the feed component stays presentation-focused
 - The helper extraction is now done; if this logic grows further, prefer extending `src/lib/community-reuse.ts` instead of re-expanding the feed component
 - Keep the inline guidance text and CTA targets sourced from the same helper so recommendation copy and navigation do not drift apart
 - Keep richer workflow context derived from existing metadata only unless store-level artifact metadata becomes intentionally more granular
 - Active collection targeting is currently safe on the community page because it still passes only one collection context into the existing store actions
 - Keep the visible save-target cues aligned with the same `activeCollectionId` / `activeCollectionName` logic used by the page actions
  - Topic-aware fallback targets should stay in the shared reuse helper so non-engine item behavior remains centralized with engine-origin item behavior

### Option C — Add basic test coverage for community state

Best if the next session is quality-focused.

Suggested target:

- lightweight tests around `src/stores/community.ts`

High-value cases:

- `saveArtifact` deduplicates by `sourceRef`
- `toggleSave` updates counts safely
- collection membership stays synced
- `addReply` increments `replyCount`

## Recommended immediate next move

 If continuing tomorrow, the safest next task is:
 
 1. Decide whether the next step is feature-facing or quality-facing
 2. If feature-facing, prioritize artifact reuse or engine-return affordances before multi-collection save behavior
 3. If quality-facing, add targeted tests around `src/stores/community.ts`

The maintainability extraction path is now in a good state, so the next batch can move to behavior or test coverage.

## Files most relevant for next session

High priority reads:

- `apps/web-v2/src/app/(app)/community/page.tsx`
- `apps/web-v2/src/app/(app)/community/CommunityFeedItem.tsx`
- `apps/web-v2/src/app/(app)/community/CommunityFeedFilters.tsx`
- `apps/web-v2/src/app/(app)/community/CommunityCollectionsPanel.tsx`
- `apps/web-v2/src/app/(app)/community/CommunityQuestionForm.tsx`
- `apps/web-v2/src/app/(app)/community/CommunityReferenceForm.tsx`
- `apps/web-v2/src/stores/community.ts`
- `apps/web-v2/src/hooks/use-community-artifact-save.ts`
- `apps/web-v2/src/lib/community-artifacts.ts`
- `apps/web-v2/src/lib/community-feedback.ts`
- `apps/web-v2/src/lib/community-reuse.ts`

Secondary context:

- `apps/web-v2/src/app/(app)/forge/[id]/page.tsx`
- `apps/web-v2/src/app/(app)/applications/[id]/page.tsx`
- `apps/web-v2/src/app/(app)/routes/[id]/page.tsx`
- `apps/web-v2/src/components/ui/CommunityContextSection.tsx`
- `apps/web-v2/src/components/ui/SaveToCommunityButton.tsx`

## Session close state

This session is safe to pause.

State at pause:

- Community save logic consolidated
- Community feed origin navigation implemented
- Engine filter implemented
- Inline replies implemented
- Collection-based feed filtering implemented
- Feed presentation extracted into dedicated local components
- Side-panel forms extracted into dedicated local components
- Collection membership chips surfaced in the feed
- Engine-aware return CTAs surfaced in the feed
- Workflow-aware follow-up CTAs surfaced in the feed
- Subtype-aware workflow CTAs surfaced in the feed
- Reuse-routing logic extracted into a shared helper
- Inline next-step guidance surfaced inside feed cards
- Richer workflow context surfaced inside feed cards
- Active selected collection now drives community-page save targeting
- Active save target is now visible in the community side panels
- Topic-aware reuse targets now cover non-engine community items too
- Direct reuse into prefilled engine creation flows is now available from the feed
- Direct reuse now uses smarter metadata-driven prefill inference
- Direct reuse country handling is now hardened for both application labels and route codes
- Application settings now feel operational and aligned with current store capabilities
- Route settings now feel operational and aligned with current store capabilities
- Build passing
- No backend changes pending from this session
- Interview question bank now behaves like a real launch surface into interview practice, not just static reference content

Continue from this handoff in the next session.
