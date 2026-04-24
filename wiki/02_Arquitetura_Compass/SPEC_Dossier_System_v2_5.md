---
title: Dossier System Architecture (v2.5)
audience: model-orientation
status: active
owner: Valentino (Technical/Architecture)
last_updated: 2026-04-24
backlinks:
  - wiki/00_SOVEREIGN/Olcan_Master_PRD_v2_5.md
  - wiki/02_Arquitetura_Compass/Arquitetura_v2_5_Compass.md
  - wiki/02_Arquitetura_Compass/Backend_API_Audit_v2_5.md
  - wiki/00_Onboarding_Inicio/Dossier_Overhaul_Execution_Plan.md
---

# Dossier System — Architecture Contract (v2.5)

> **Internal model orientation only.** Do not link from user UI.  
> This document is the contract every agent working on the dossier pipeline must honor.

## 1. Mental model

Olcan Compass is a **dossier builder**, not a document editor. A **Dossier** is an opportunity-bound application package that aggregates:

1. **Profile snapshot** — the user's state at application time (OIOS scores, archetype, background)
2. **Opportunity context** — institution, program, requirements, deadline
3. **Documents** — CVs, letters, proposals, etc. (live editable objects)
4. **Tasks** — prep checklist in four MECE dimensions (see §3)
5. **Readiness evaluation** — a single 0-100 score with a weighted breakdown
6. **Exports** — PDF/DOCX/ZIP bundles for submission

Everything binds to a single `opportunity_id` via `forge.ts:604` (`bindToOpportunity`).

## 2. Unified Readiness Algorithm (v1.0.0)

**The single source of truth** lives in two mirrored files:

| Language | File | Role |
|---|---|---|
| TypeScript | [apps/app-compass-v2.5/src/lib/dossier-readiness.ts](../../apps/app-compass-v2.5/src/lib/dossier-readiness.ts) | Client-side evaluation in Zustand store |
| Python    | [apps/api-core-v2.5/app/services/dossier_readiness.py](../../apps/api-core-v2.5/app/services/dossier_readiness.py) | Server-side evaluation in `/dossiers/{id}/evaluate` |

**Any change to weights or dimension logic MUST land in both files in the same commit.** The `ALGORITHM_VERSION` constant must also bump.

### 2.1 Weights

```
documents : 0.40   # Are the required documents complete and high-quality?
tasks     : 0.30   # Is the prep checklist being executed?
profile   : 0.20   # Is the user psychologically + logistically prepared? (OIOS)
deadline  : 0.10   # How much time buffer is left?
```

### 2.2 Dimension scoring

**Documents (0-100):**
- Empty → 0, explanation nudges user to add docs
- Per doc: `completeness × (quality / 100)`
  - `completeness`: 100 if status ∈ {final, submitted}; max(completion%, 75) if in_review; else completion%
  - `quality`: average of {atsScore, competitivenessScore, alignmentScore} that exist; defaults to 100 (no penalty when signals absent)

**Tasks (0-100):**
- No tasks → neutral 50 (we don't reward or penalize absence of tracked work)
- Active tasks only (cancelled excluded)
- `raw = (done + in_progress × 0.5 − blocked × 0.25) / active_count`
- Clamped to [0, 100]

**Profile (0-100):**
- No snapshot → 0 with explicit "complete OIOS diagnostic" explanation
- Average of the four OIOS readiness scores present: `{logistic, narrative, performance, psychological}`

**Deadline (0-100):**
- If `status ∈ {submitted, completed}` → 100 (deadline no longer matters)
- No deadline set → 50 (can't assess)
- Past deadline: 40 if `status ∈ {final, review, finalizing}`, else 0
- Otherwise step function by days remaining:

| Days remaining | Score |
|---|---|
| ≥ 90 | 100 |
| ≥ 60 | 90 |
| ≥ 30 | 75 |
| ≥ 14 | 55 |
| ≥ 7 | 35 |
| ≥ 3 | 20 |
| < 3 | 10 |

### 2.3 Test vectors (regression anchors)

All test vectors use `now = 2026-04-24T00:00:00Z`. Both TS and Python must produce identical output for these.

| Scenario | Input | `overall` | Components `{docs, tasks, profile, deadline}` |
|---|---|---|---|
| Empty dossier, 60d to deadline, draft status | no docs, no tasks, no profile, deadline `+60d` | **24** | `{0, 50, 0, 90}` |
| Mid-progress realistic dossier | 3 docs (1 final ATS 85, 1 draft 40%, 1 review 60%); 5 tasks (2 done, 1 in_progress, 1 todo, 1 blocked); OIOS `{70,80,65,60}`; deadline `+30d`; in_progress | **62** | `{67, 45, 69, 75}` |
| Submitted | 1 doc submitted; 1 task done; OIOS `{80,80,80,80}`; deadline `-5d`; submitted status | **96** | `{100, 100, 80, 100}` |

Add new cases here as behavior evolves; never change an existing row without bumping `ALGORITHM_VERSION`.

## 3. MECE Readiness Dimensions (for task generation — **TO IMPLEMENT**)

The current `TaskCategory` enum in [src/types/dossier-system.ts](../../apps/app-compass-v2.5/src/types/dossier-system.ts) is content-oriented (`content_creation`, `editing`, `formatting`…) — these are activity types, not readiness dimensions.

The overhaul introduces a **second, orthogonal taxonomy**: `ReadinessDomain`. Tasks carry both.

```ts
// NEW — to be added by the execution plan, not yet merged.
export type ReadinessDomain =
  | "academic"    // transcripts, GRE/GMAT/IELTS, recommendations, program fit
  | "financial"   // tuition, funding, scholarships, living costs, proof of funds
  | "logistical"  // visa, housing, travel, deadlines, document authentication
  | "risk";       // backup plans, rejection handling, timeline slack, fallback opportunities
```

These are MECE because every preparation task (for any opportunity type) maps to exactly one of: what I need to *qualify*, what I need to *afford*, what I need to *arrange*, or what I need to *hedge*. Users can rename but not add new root domains — that preserves the orthogonal structure.

## 4. Export Pipeline Contract

### 4.1 Three-stage flow

```
POST /api/v1/dossiers/{id}/export?format=pdf
  → 202 Accepted { job_id, status: "queued", progress_percentage: 0 }

GET /api/v1/dossiers/{id}/export/{job_id}
  → 200 OK { status, progress_percentage, download_url? }
  (poll every ~2s from the frontend; backoff to 10s after 30s elapsed)

GET /api/v1/dossiers/{id}/export/{job_id}/download
  → FileResponse (application/pdf, application/zip, etc.)
```

Endpoint code: [apps/api-core-v2.5/app/api/v1/dossiers.py](../../apps/api-core-v2.5/app/api/v1/dossiers.py) (§ "Dossier Export").

### 4.2 Where heavy work happens

`ExportService.process_export_job` in [apps/api-core-v2.5/app/services/export_service.py](../../apps/api-core-v2.5/app/services/export_service.py) drives rendering. Dispatches on `export_type`:
- `ExportType.DOSSIER` → `_export_dossier` (builds ZIP of documents)
- `ExportType.DOCUMENT` → single-document export
- `ExportType.TECHNICAL_REPORT` → report export

**Known gap:** `_generate_pdf_document` / `_generate_docx_document` / `_create_pdf_content` currently write placeholder bytes. Replacing these with real WeasyPrint/python-docx rendering is **Execution Card EC-3** in the plan.

### 4.3 Branding contract (Liquid Glass)

All rendered templates must use the following Olcan tokens:

| Token | Value | Use |
|---|---|---|
| `--olcan-deep-navy` | `#001338` | Headings, cover, footer |
| `--olcan-indigo` | `#4F46E5` | Accents, links, section dividers |
| `--olcan-paper` | `#F8F9FC` | Page background |
| Heading font | Montserrat (fallback: Inter) | H1-H3, cover title |
| Body font | Inter (fallback: system-ui) | Body, tables |
| Logo | `/public/brand/olcan-mark.svg` | Cover upper-left, footer right |

Required structural sections for every dossier PDF:
1. Cover page: program/institution, user name, deadline, overall readiness %
2. Table of contents (auto-generated from included documents + tasks)
3. One section per document (rendered from markdown)
4. Task tracker (tabular, grouped by ReadinessDomain)
5. Readiness report (overall + 4 dimensions with explanations)
6. Appendix: profile snapshot summary

## 5. Zustand store boundaries (no new stores)

The project has 24 stores (see [Guia_de_Arquitetura_de_Stores.md](Guia_de_Arquitetura_de_Stores.md)). **Do not add a new store for dossier export or OIOS integration.** Extend existing:

| Concern | Existing store | Notes |
|---|---|---|
| Dossier CRUD + readiness | `stores/dossier.ts` | Holds `evaluateReadiness` — now calls `computeReadiness()` |
| Document-to-opportunity binding | `stores/forge.ts` | `bindToOpportunity` at `forge.ts:604` |
| OIOS scores + archetype | `stores/psychology*` or `stores/profileStore` | Pull readiness scores from here |
| Export job polling state | Local component state in `DossierExportPreview.tsx` | Ephemeral — no store |

## 6. Data flow invariants (contract for future agents)

1. **Frontend and backend must compute identical readiness** for identical input. Any divergence is a bug; the TS/Python pair must stay in lockstep.
2. **Every task belongs to exactly one Dossier** (via `dossier_id`) and exactly one `ReadinessDomain` (when the taxonomy lands).
3. **Profile snapshot is immutable once a dossier is `submitted`** — we capture the user as they were at application time.
4. **Exports never mutate dossier state.** Read-only on the dossier; writes go only to `ExportJob`.
5. **The `window.print()` fallback in `PDFExporter.tsx` stays until EC-2 lands** — do not remove it mid-flight; it's the only export path users currently have.

## 7. File map (what's where)

| Concern | File |
|---|---|
| TS readiness algorithm | [src/lib/dossier-readiness.ts](../../apps/app-compass-v2.5/src/lib/dossier-readiness.ts) |
| TS types | [src/types/dossier-system.ts](../../apps/app-compass-v2.5/src/types/dossier-system.ts) |
| TS Zustand store | [src/stores/dossier.ts](../../apps/app-compass-v2.5/src/stores/dossier.ts) (`evaluateReadiness` at line 929) |
| Current PDF export (placeholder) | [src/components/forge/PDFExporter.tsx](../../apps/app-compass-v2.5/src/components/forge/PDFExporter.tsx) |
| Export preview UI | [src/components/forge/DossierExportPreview.tsx](../../apps/app-compass-v2.5/src/components/forge/DossierExportPreview.tsx) |
| Document wizard | [src/components/dossier/DocumentWizard.tsx](../../apps/app-compass-v2.5/src/components/dossier/DocumentWizard.tsx) |
| Profile-to-document integrator | [src/components/forge/ProfileDocumentIntegrator.tsx](../../apps/app-compass-v2.5/src/components/forge/ProfileDocumentIntegrator.tsx) |
| Python readiness algorithm | [app/services/dossier_readiness.py](../../apps/api-core-v2.5/app/services/dossier_readiness.py) |
| Dossier REST endpoints | [app/api/v1/dossiers.py](../../apps/api-core-v2.5/app/api/v1/dossiers.py) |
| Export service | [app/services/export_service.py](../../apps/api-core-v2.5/app/services/export_service.py) |
| ExportJob model | [app/models/enhanced_forge.py](../../apps/api-core-v2.5/app/models/enhanced_forge.py) (class `ExportJob`, line 290) |

## 8. What this document does NOT cover

These are deliberately deferred — see [Dossier_Overhaul_Execution_Plan.md](../00_Onboarding_Inicio/Dossier_Overhaul_Execution_Plan.md):

- **Resume-Matcher microservice** — separate service, separate Render deploy. Spec lives in the execution plan card EC-5.
- **Real PDF/DOCX rendering** — EC-3. ExportService placeholder bytes must be replaced.
- **OIOS-driven wizard suggestions** — EC-4. Requires archetype → tone/structure mapping table.
- **MECE task generator** — EC-1. Opportunity → ReadinessDomain tasks.

Related docs: [SPEC_IO_System_v2_5.md](SPEC_IO_System_v2_5.md), [Backend_API_Audit_v2_5.md](Backend_API_Audit_v2_5.md).
