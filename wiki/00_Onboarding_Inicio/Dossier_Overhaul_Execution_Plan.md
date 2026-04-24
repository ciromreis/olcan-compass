---
title: Dossier Overhaul — Execution Plan
audience: model-orientation
status: ready-for-execution
model-tier: "Any (cards are self-contained)"
authored-by: "Claude Opus 4.7 (Lead Architect pass, 2026-04-24)"
backlinks:
  - wiki/02_Arquitetura_Compass/SPEC_Dossier_System_v2_5.md
  - wiki/00_SOVEREIGN/Verdade_do_Produto.md
---

# Dossier Overhaul — Execution Plan

> **Internal orientation.** This plan turns the Dossier System spec into discrete, independently-mergeable cards that a smaller model (Sonnet / Haiku) can execute one at a time.

## How to use this plan

Each **Execution Card** (EC-N) is self-contained. An agent should:
1. Read [SPEC_Dossier_System_v2_5.md](../02_Arquitetura_Compass/SPEC_Dossier_System_v2_5.md) first (the architecture contract).
2. Pick the lowest-numbered card whose dependencies are satisfied.
3. Execute ONLY that card. Do not pull in neighbor work.
4. Run the Definition of Done checks listed in the card before declaring done.
5. Commit with the specified Conventional Commit prefix.

**Rule:** If a card's assumption no longer matches reality, STOP and ask — do not improvise. The spec is the authority.

## Status snapshot (as of 2026-04-24)

| Component | State after this session |
|---|---|
| Unified readiness algorithm (TS + Python) | ✅ Landed — `src/lib/dossier-readiness.ts`, `app/services/dossier_readiness.py` |
| Frontend `evaluateReadiness` using unified algo | ✅ Wired — `stores/dossier.ts:929` |
| Backend `/evaluate` using unified algo | ✅ Wired — `app/api/v1/dossiers.py` |
| Backend `/export` — `uuid.uuid4()` crash | ✅ Fixed (import added, real ExportJob created) |
| Backend `/export` wired to `ExportService` | ✅ Wired (ExportJob created, BackgroundTasks queued) |
| Real PDF/DOCX rendering | ⏳ **EC-3** (placeholder bytes still) |
| Client-side PDF export (interim) | ⏳ **EC-2** (still `window.print()` stub) |
| MECE task generator | ⏳ **EC-1** |
| OIOS-driven wizard | ⏳ **EC-4** |
| Resume-Matcher microservice | ⏳ **EC-5** (infra decision required first) |
| Export preview UI polling | ⏳ **EC-6** |

---

## EC-1 — MECE Task Generator

**Goal:** When a user creates a dossier from an opportunity, auto-generate a default task checklist grouped into the four `ReadinessDomain` buckets (academic / financial / logistical / risk). Users can edit, add, or remove.

**Dependencies:** None. Spec §3 defines the domains.

**Complexity:** Medium. Pure business logic. No new libraries.

**Files to touch (frontend):**
- `src/types/dossier-system.ts` — add `ReadinessDomain` type and extend `Task` with `readinessDomain: ReadinessDomain`
- `src/lib/dossier-task-generator.ts` — **NEW.** Pure function `generateDefaultTasks(opportunity, profileSnapshot): Task[]`
- `src/stores/dossier.ts` — call `generateDefaultTasks` in `createDossier` when opportunity is present

**Files to touch (backend):**
- `app/services/dossier_task_generator.py` — **NEW.** Mirror the TS generator
- `app/api/v1/dossiers.py` — in `create_dossier`, when `opportunity_context` present, seed tasks via generator
- Alembic migration: add `readiness_domain` column (`String(32)`, nullable, default `'logistical'`) to `dossier_tasks` table

**Task template seeds** (MECE — every opportunity gets ALL four domains, but a domain may have 0 seed tasks for types where it's truly N/A):

```
ACADEMIC (for type=education)
- Gather official transcripts from each prior institution
- Prepare standardized test scores (GRE/GMAT/IELTS/TOEFL as required)
- Secure N recommendation letters (N from opportunity.requirements)
- Map program learning outcomes to your experience

FINANCIAL
- Estimate tuition + living costs for the program duration
- Apply for scholarships / assistantships / external funding
- Assemble proof-of-funds documentation
- Budget contingency (min 15% buffer)

LOGISTICAL
- Confirm application deadline + portal requirements
- Plan visa / work-permit application timeline
- Arrange housing search window
- Authenticate/apostille documents as destination country requires

RISK
- Identify 2 backup opportunities (parallel tracks)
- Set internal checkpoint deadlines (submit 7d before official)
- Plan rejection/waitlist response (which secondary do you pivot to?)
- Reserve timeline slack for unexpected document delays
```

**For `type=employment`:** replace ACADEMIC seeds with role-qualification tasks (portfolio, code samples, references, skills gap mapping).

**Acceptance (DoD):**
- [ ] Creating a new dossier with an opportunity yields ≥4 tasks (at least one per domain)
- [ ] User can add/edit/delete tasks freely; domain can be reassigned
- [ ] Backend migration applies cleanly on Render (test via `/api/migrate-db-render`)
- [ ] Frontend `type-check` passes: `cd apps/app-compass-v2.5 && npm run type-check`
- [ ] Task generator is pure — no side effects, unit-testable

**Commit:** `feat(dossier): MECE task generator with 4 readiness domains`

---

## EC-2 — Interim Client-Side PDF Export (Liquid Glass)

**Goal:** Replace `window.print()` in `PDFExporter.tsx` with a real client-side PDF using `jspdf` + `html2canvas` (or `pdfmake`), branded with Liquid Glass tokens. This is the **interim** user-facing export until EC-3 server-side lands.

**Dependencies:** None. Spec §4.3 defines branding contract.

**Complexity:** Medium. Pure frontend, no backend touch.

**Files to touch:**
- `apps/app-compass-v2.5/package.json` — add `pdfmake` (~290KB) OR `jspdf` + `jspdf-autotable`
- `apps/app-compass-v2.5/src/lib/pdf/olcan-pdf-template.ts` — **NEW.** Template builder (cover + TOC + sections + footer)
- `apps/app-compass-v2.5/src/lib/pdf/olcan-pdf-tokens.ts` — **NEW.** Export the spec §4.3 tokens as JS constants
- `apps/app-compass-v2.5/src/components/forge/PDFExporter.tsx` — replace `exportToPDF` implementation

**DO:**
- Use the exact hex colors from spec §4.3 (`#001338`, `#4F46E5`)
- Embed Montserrat/Inter via pdfmake font definition (or fall back to system serif if the library complains)
- Cover page: logo (top-left), title (program/institution), user name, deadline, overall readiness %
- Generate TOC from document sections
- Page numbers in footer
- Export filename: `dossier_{dossier.title}_{YYYY-MM-DD}.pdf`

**DO NOT:**
- Touch the backend — this is client-side only
- Remove `window.print()` path — keep as fallback behind a `USE_LEGACY_PRINT` flag if the new path errors
- Add any new Zustand store
- Break the existing `exportToJSON` button

**Acceptance (DoD):**
- [ ] Visual QA: open export, confirm cover page shows deep navy heading, indigo accents, Olcan logo
- [ ] `type-check` passes
- [ ] Bundle size impact < 400KB gzipped
- [ ] Works for dossiers with 0 docs (shows "No documents yet" placeholder section, not a crash)
- [ ] Works for dossiers with 10+ docs (multi-page, pagination correct)

**Commit:** `feat(dossier): client-side branded PDF export with Liquid Glass template`

---

## EC-3 — Real Server-Side PDF/DOCX Rendering

**Goal:** Replace `ExportService._generate_pdf_document` / `_generate_docx_document` / `_create_pdf_content` placeholder byte writers with real rendering using WeasyPrint (PDF) and python-docx (DOCX).

**Dependencies:** EC-2 (template design validated client-side first).

**Complexity:** High. Requires Docker changes on Render for WeasyPrint system deps.

**Files to touch:**
- `apps/api-core-v2.5/Dockerfile` — add WeasyPrint system deps: `libpango-1.0-0 libpangoft2-1.0-0 libcairo2 libffi-dev`
- `apps/api-core-v2.5/requirements.txt` (or `pyproject.toml`) — add `weasyprint>=61.0`, `python-docx>=1.1.0`, `jinja2>=3.1`
- `apps/api-core-v2.5/app/services/export_service.py` — replace placeholder methods
- `apps/api-core-v2.5/app/templates/dossier/` — **NEW.** Jinja2 HTML templates mirroring EC-2 design
- `apps/api-core-v2.5/app/templates/dossier/styles.css` — embedded CSS using spec §4.3 tokens

**Strategy:**
- Render dossier → Jinja2 HTML → WeasyPrint PDF (single function, `_render_dossier_pdf`)
- For DOCX: template with python-docx, pre-designed `.docx` skeleton in `app/templates/dossier/skeleton.docx`
- Keep the existing ZIP flow for multi-document exports (`_export_dossier`)

**Acceptance (DoD):**
- [ ] PDF export produces a real PDF file (not placeholder bytes) — validate with `pdfinfo` on Render
- [ ] DOCX opens in Word/LibreOffice without errors
- [ ] Liquid Glass branding matches the EC-2 client-side output visually (same logo position, colors, fonts)
- [ ] Background job completes in < 30s for a 10-doc dossier
- [ ] Render Docker build succeeds (watch the build log — WeasyPrint deps are finicky)

**Commit:** `feat(api): real PDF/DOCX rendering via WeasyPrint + python-docx`

**Deploy caution:** Forces a full Render image rebuild (~5 min). Coordinate with a low-traffic window.

---

## EC-4 — OIOS-Driven Wizard Integration

**Goal:** `DocumentWizard.tsx` adapts tone + structure suggestions based on the user's OIOS archetype and fear clusters.

**Dependencies:** None (uses existing psychology store).

**Complexity:** Medium. UI + prompt engineering.

**Files to touch:**
- `src/lib/oios/archetype-tone-map.ts` — **NEW.** Mapping table (see below)
- `src/components/dossier/DocumentWizard.tsx` — import archetype from psychology store, pass to AI suggestions
- `src/lib/oios/fear-cluster-guardrails.ts` — **NEW.** Guardrails to avoid triggering fears in generated copy

**Archetype → Tone map (seed, user-configurable later):**

```ts
export const ARCHETYPE_TONE = {
  Pioneer:    { voice: "bold, vision-forward", emphasize: "first-to-do, innovation", avoid: "derivative framing" },
  Strategist: { voice: "measured, analytical",  emphasize: "systems thinking, ROI",    avoid: "hype language" },
  Builder:    { voice: "concrete, evidence-led", emphasize: "shipped outcomes, scale", avoid: "speculative claims" },
  Connector:  { voice: "warm, collaborative",    emphasize: "relationships, teams",    avoid: "solo-hero narrative" },
  Scholar:    { voice: "precise, citation-rich", emphasize: "depth, rigor",            avoid: "commercial framing" },
  // Add any additional archetypes used by OIOS quiz results
} as const;
```

**Acceptance (DoD):**
- [ ] Wizard Step "AI Assist" shows the user's archetype at the top
- [ ] When user clicks "Suggest opening paragraph", prompt includes tone guidance from the map
- [ ] If no archetype set, wizard prompts user to take OIOS quiz (link to `/onboarding/quiz`)
- [ ] `type-check` passes

**Commit:** `feat(dossier): OIOS archetype-driven tone in DocumentWizard`

---

## EC-5 — Resume-Matcher Microservice

**Goal:** Separate Python service that semantically parses uploaded resumes and opportunity descriptions, returning structured skills + experience + keyword match.

**Dependencies:** Product decision on whether to deploy as separate Render service OR inline into `api-core-v2.5`.

**Complexity:** High. New service + infra.

**⚠️ Before starting this card:** Open a discussion with Valentino. This is NOT a pure code task — it requires:
- Infra choice (separate service vs in-process)
- Model choice (local sentence-transformers vs OpenAI embeddings)
- Cost budget (embedding API calls at scale)
- Deployment path (new Render service = new URL, new env vars, new domain)

**Don't write code until that decision is documented.** When ready, the card expands to:
- `services/resume-matcher/` (new repo folder)
- Dockerfile + pyproject.toml
- FastAPI service with `/parse-resume`, `/parse-opportunity`, `/match` endpoints
- Client wrapper in `apps/api-core-v2.5/app/services/resume_matcher_client.py`

**Commit pattern (when eventually executed):** `feat(resume-matcher): initial service scaffold`

---

## EC-6 — Export Preview UI Polling

**Goal:** `DossierExportPreview.tsx` polls `/export/{job_id}` and shows live progress; downloads automatically when `status=completed`.

**Dependencies:** EC-2 or EC-3 producing real files.

**Complexity:** Low-medium. Pure UI.

**Files to touch:**
- `src/components/forge/DossierExportPreview.tsx` — add polling hook, progress bar, auto-download

**Poll cadence:**
- First 30s: poll every 2s
- 30s–2min: poll every 5s
- 2min+: poll every 10s
- Abort button cancels polling (does NOT cancel backend job — user can come back)

**Acceptance (DoD):**
- [ ] Progress bar reflects `progress_percentage` from backend
- [ ] On `status=completed`, automatically triggers download via `/export/{job_id}/download`
- [ ] On `status=failed`, shows `error_message` with retry button
- [ ] Component unmount aborts the poll loop (no memory leaks)

**Commit:** `feat(dossier): live export progress polling in DossierExportPreview`

---

## Global rules for executing agents

1. **Never touch `apps/app-compass-v2/` or `apps/api-core-v2/`.** They're frozen. Work only in v2.5 directories.
2. **Never create a new Zustand store.** The spec §5 mandates reuse of the 24 existing.
3. **Never surface `wiki/` content to users.** These docs are model-orientation only (see `/Users/ciromoraes/.claude/projects/.../memory/feedback_wiki_internal.md`).
4. **Always run `npm run type-check` in `apps/app-compass-v2.5` before committing frontend changes.**
5. **If a card's scope creeps beyond its DoD, STOP and open a follow-up card** — don't bundle unrelated fixes.
6. **Production is live.** A broken deploy affects real users. Prefer two small correct PRs over one big ambitious one.
7. **Readiness algorithm changes MUST bump `ALGORITHM_VERSION` in both TS and Python files, in the same commit.**

## Verification runbook (after any card lands)

```bash
# Frontend
cd apps/app-compass-v2.5
npm run type-check
npm run build

# Backend (local)
cd ../api-core-v2.5
python3 -c "import ast; [ast.parse(open(p).read()) for p in ['app/services/dossier_readiness.py', 'app/api/v1/dossiers.py']]"

# Backend migrations (on Render, after deploy)
curl "https://olcan-compass-api.onrender.com/api/migrate-db-render?secret_key=olcan2026omega"
curl "https://olcan-compass-api.onrender.com/api/db-diagnostic?secret_key=olcan2026omega"
```

## Open questions parked for human decision

- **OIOS archetype taxonomy:** the spec lists 5 in the tone map — is the OIOS quiz currently producing those exact 5, or a different set? (Check `seed_psychology_questions.py` output.)
- **ReadinessDomain customization:** should advanced users be able to add 5th+ domain, or are 4 always MECE-enforced? Current recommendation: lock at 4.
- **Resume-Matcher hosting:** separate Render service or in-process? Affects cold-start and cost.
- **Export retention:** `expires_at = +7d` — is that enough, or should we keep exports for 30d given application cycles?

---

Context: the complex architectural work (unified algorithm, types, endpoint wiring, crash fixes) was done in one session by the Lead Architect pass on 2026-04-24. The remaining cards are mechanical enough for a smaller model to execute one at a time.
