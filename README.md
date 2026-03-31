# 🧭 Olcan Compass Monorepo

Welcome to the central repository for the **Olcan Compass Ecosystem**. This monorepo is organized to separate production stability from active growth, following a high-signal "Intelligence Hub" structure.

## 🚀 Mission Status: v2.5 Transition
We are currently in the middle of a major transition from the stable v2 environment to the consolidated v2.5 platform (Marketplace + Career Companions).

- **Production (v2)**: `apps/app-compass-v2` | `apps/api-core-v2` -> **Stable / Leave Unchanged**
- **Active Development (v2.5)**: `apps/site-marketing-v2.5` -> **High Activity**

---

## 📂 Knowledge Vault (The Intelligence Layer)

All session history and "consolidations of consolidations" have been moved to prioritize the **Active Mission**.

| Category | Purpose | Key Document |
| :--- | :--- | :--- |
| **`00_Mission_Control`** | Current state, tasks, and audit. | [ULTIMATE_TRUTH_V2.5.md](./00_Mission_Control/ULTIMATE_TRUTH_V2.5.md) |
| **`01_Business_Strategy`** | Marketing, Copywriting, and Architecture. | [MARKETING_ARCHITECTURE.md](./01_Business_Strategy/MARKETING_WEBSITE_ARCHITECTURE.md) |
| **`02_Tech_Orientation`** | Dev guides and implementation logs. | [DEVELOPMENT_GUIDE.md](./02_Tech_Orientation/DEVELOPMENT_GUIDE.md) |
| **`90_Archive_Logs`** | Session history and past handoff reports. | [SESSION_CHRONICLE.md](./90_Archive_Logs/Session_History/CONSOLIDATED_CHRONICLE.md) |

---

## 🛠️ Quick Start

### For Developers
1. **Explore the Mission**: Read `00_Mission_Control/ULTIMATE_TRUTH_V2.5.md`.
2. **Setup**: Run `pnpm install` at root.
3. **Launch**: Use the scripts below to start specific environments.

### Operational Scripts
- `./START_APPLICATION.sh`: Standard development boot.
- `./BUILD_AND_RUN.sh`: Full build and local serve.
- `./QUICK_DEPLOY.sh`: Push to production/staging.

---

## 🛡️ Guidelines
1. **Context Preservation**: Always update `00_Mission_Control/CURRENT_STATUS.md` at the end of each session.
2. **Pillar Integrity**: Do not create new documentation in the root. Use the designated Pillars.
3. **Production Safety**: Verify any changes to the Shared UI library (`packages/ui-components`) against the v2 production app.

---

**Last Organized**: March 28, 2026  
**Identity**: Olcan Catalyst AI
