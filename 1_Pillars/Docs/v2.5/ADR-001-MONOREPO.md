# ADR-001: Monorepo vs. Multi-repo for Modular Micro-SaaS

## Status
Accepted

## Context
As we transition to Olcan v2.5, we need to decide on a repository strategy that supports a **Modular Micro-SaaS** approach. The goal is to build several independent yet interconnected features (Narrative Forge, Interview Sim, Marketplace) while maintaining a unified "Metamodern" brand identity and shared user context (OIOS).

## Decision
We will use a **Monorepo (PNPM Workspaces)** architecture. 

**Rationale:**
1. **Design Consistency**: The "Liquid Glass" system and archetype puppet assets can be stored in a shared `packages/ui` and updated globally across the Website and the App instantly.
2. **Type Safety**: Shared TypeScript interfaces for the OIOS archetypes and user profiles prevent drift between the frontend and backend.
3. **Atomic Changes**: A single feature update (e.g., adding a new Archetype) can be implemented in the core logic, the website, and the app in a single commit.
4. **Agility**: For a small team/AI pair, the overhead of managing 5 Git repos (CI/CD, secrets, dependency syncing) is higher than managing one well-structured monorepo.

## Consequences
- **Positive**: High code reuse, simplified CI/CD, consistent branding, unified developer experience.
- **Negative**: The build script needs to be smart (using `--filter`) to avoid rebuilding everything on every change. Repository size will grow (Mitigated by LFS or archiving legacy assets).
- **Risk**: A broken shared package can break all apps (Mitigation: Strict linting and workspace isolation).
