# Dossier System Integration Plan

**Date**: April 17, 2026  
**Status**: CRITICAL - System Redesign Required  
**Priority**: P0

---

## Core Problem

The system is a **disconnected collection of GitHub repos** rather than a unified dossier builder.

### What's Missing

1. **Resume-Matcher Integration** - Only basic keyword matching exists, not the full library
2. **Document Wizard** - No guided flow for creating documents
3. **Milestone Tracking** - No progress tracking per document
4. **Comprehensive Export** - Only exports single documents, not complete dossiers
5. **Profile Integration** - User profile not linked to exports
6. **Opportunity Context** - Opportunity data not integrated
7. **Preparation Evidence** - Interviews/events not part of dossier

---

## Vision: Dossier Operating System

A **complete application package** containing:

- Profile summary with readiness scores
- Opportunity context and requirements
- All documents (CV, letters, proposals)
- Preparation evidence (interviews, events)
- Task tracker and milestones
- Comprehensive readiness report

---

## Implementation Plan

### Phase 1: Enhanced Data Model

Create proper `Dossier` entity that binds:
- User profile
- Opportunity
- Multiple documents
- Tasks and milestones
- Preparation activities
- Readiness metrics

### Phase 2: Resume-Matcher Integration

Integrate actual Resume-Matcher library:
- Semantic matching (not just keywords)
- Skill extraction
- Experience parsing
- Multi-document optimization

### Phase 3: Document Wizards

Build guided flows for each document type:
- CV wizard (8 steps with ATS optimization)
- Motivation letter wizard
- Research proposal wizard
- Generic document wizard

### Phase 4: Comprehensive Export

Professional dossier export with:
- Cover page with Olcan branding
- Table of contents
- Profile summary (2-3 pages)
- Opportunity analysis
- All documents
- Preparation evidence
- Task tracker
- Readiness report
- Appendices

### Phase 5: UX Polish

- Redesign onboarding
- Dossier-centric navigation
- Task notifications
- Deadline tracking
- Consistent branding

---

## Next Steps

1. Create detailed technical specs
2. Set up Resume-Matcher Python service
3. Design dossier data model
4. Build export engine
5. Create wizard framework
6. Implement step by step

**Estimated Time**: 5 weeks for complete integration
