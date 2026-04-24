# ⚠️ Kiro Agent Instructions

**This is the ONLY Kiro config file. All specs are in the wiki.**

## How to Work on This Project

1. **Start here**: `wiki/00_SOVEREIGN/Agent_Knowledge_Handbook.md`
2. **Check current state**: `wiki/00_SOVEREIGN/Verdade_do_Produto.md`
3. **Read navigation**: `CLAUDE.md` or `wiki/01_Documentacao_Raiz/START_HERE.md`

## Critical Rules

- **NO new Zustand stores** — Adding stores causes auth regressions. Extend existing stores instead.
- **NO refactoring stores** — No store consolidation or renaming until explicitly authorized.
- **Wiki is source of truth** — All specs, plans, and current state live in `wiki/`.
- **Coordinate with other agents** — Check CLAUDE.md for agent alignment rules.

## Coordination Protocol

When multiple agents work on this repo:
- Write work to wiki before committing
- Use proper commit messages (Conventional Commits)
- Update `wiki/00_SOVEREIGN/Verdade_do_Produto.md` with current status

## Current Priority (2026-04-24)

See `wiki/00_SOVEREIGN/Agent_Knowledge_Handbook.md` for current priorities.

---

*The wiki is the single source of truth. Read it first.*