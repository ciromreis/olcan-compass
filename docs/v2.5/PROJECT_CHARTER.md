# Project Charter: Olcan Compass v2.5 (The Metamodern Evolution)

## Project Overview
**Problem Statement**: Olcan's current digital presence (v2.0) is visually generic ("AI Slop") and technically monolithic, hindering conversion and slowing down the modular expansion into specialized Micro-SaaS features.

**Project Objectives**:
1. **Visual Overhaul**: Establish a premium, Metamodern brand identity (Website + App).
2. **Modular Architecture**: Transition the codebase into a feature-centric monorepo where each "Micro-SaaS" unit is isolated yet integrated.
3. **OIOS Integration**: Fully implement the 12-archetype "Operating System" for narrative-driven mobility.

**Scope**:
- **Marketing Website**: Next.js 14, Liquid Glass UI, Archetype Puppets (Phase 1 DONE).
- **Diagnostic Tool**: Interactive OIOS archetyping engine (Phase 2).
- **SaaS Core (v2.5)**: Modularization of the "Narrative Forge" and "Interview Simulator" (Phase 3).
- **Infrastructure**: Neon PostgreSQL branching and connection pooling.

**Success Criteria**:
- **95% Build Success Rate**: Ensuring modular changes don't break v2.0.
- **Micro-SaaS Readiness**: Clear "Bounded Contexts" for at least 3 core features.
- **User Engagement**: Qualitative "WOW" factor from the new Metamodern design.

## Stakeholder Analysis
**Executive Sponsor**: Ciro Moraes / Olcan Group.
**Project Team**: Antigravity (AI Architect), Agency Swarm (Technical Artist, Project Shepherd).
**Key Stakeholders**: Global Aspirants (B2C), Mentors/Providers (B2B2C).

## Resource Requirements
**Tech Stack**: Next.js 14 (App Router), FastAPI, Neon DB (Serverless), Framer Motion, Tailwind CSS.
**Timeline**:
- **Phase 1**: Brand & Website Core (Current).
- **Phase 2**: OIOS Diagnostic & Jornadas.
- **Phase 3**: V2.5 Feature Extraction (Micro-SaaS).

## Risk Assessment
- **Integration Risk**: v2.5 changes might disrupt stable v2.0 deployment (Mitigation: Strict RLS and additive DB migrations).
- **Performance Risk**: Liquid Glass and 3D Globe latency (Mitigation: Performance budgeting and pre-rendering).
- **Complexity Risk**: Modular monolith vs Microservices (Mitigation: Starting as a Modular Monolith inside the monorepo).
