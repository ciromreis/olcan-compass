# Arquivo Permanente (Permanent Archive)

**Purpose:** Historical documentation preserved for reference but excluded from AI context  
**Status:** 🚫 Excluded from .claudeignore to save tokens  
**Last Updated:** April 16, 2026

---

## 📋 What's Here

This directory contains historical documentation that is preserved for reference but excluded from AI agent context to optimize token usage.

### Directory Structure

```
10_Arquivo_Permanente/
├── sessions/           # Historical session handoff documents
├── changelogs/         # Application changelogs
├── legacy-readmes/     # Documentation from frozen/archived apps
└── README.md          # This file
```

---

## 📁 Contents

### Sessions
Historical session handoff documents from development sessions:
- `SESSION_HANDOFF_2025_04_16.md` - UX fixes and Wave 2 completion

### Changelogs
Application changelogs moved from app directories:
- `app-compass-v2.5-changelog.md` - Compass v2.5 changelog

### Legacy READMEs
Documentation from frozen apps (v2) and redundant files:
- `app-compass-v2-CLAUDE.md` - Frozen app CLAUDE guide
- `app-compass-v2-README.md` - Frozen app README
- `api-core-v2-CLAUDE.md` - Frozen API CLAUDE guide
- `api-core-v2-README.md` - Frozen API README
- `site-marketing-v2.5-CLAUDE.md` - Redundant marketing site guide

---

## 🎯 Why This Exists

### Problem
- Scattered documentation files waste LLM tokens
- Session handoffs accumulate over time
- Frozen app docs are redundant with root docs
- Historical information is valuable but not needed in active context

### Solution
- Centralize all historical docs in one location
- Exclude from .claudeignore to save ~45,000 tokens per context load
- Preserve for human reference and auditing
- Keep active documentation minimal and focused

---

## 📖 How to Use

### For Developers
- **Need historical context?** Browse this directory
- **Looking for old session notes?** Check `sessions/`
- **Want to see what changed?** Check `changelogs/`
- **Researching frozen apps?** Check `legacy-readmes/`

### For AI Agents
- **Don't read this directory** - It's excluded via .claudeignore
- **Need current docs?** See root CLAUDE.md and START_HERE.md
- **Need detailed info?** Read the appropriate wiki pillar (00-06)

---

## 🔄 Maintenance

### When to Add Files
- Session handoff documents after major development sessions
- Changelogs when they grow too large
- Documentation from apps being frozen/archived
- Any historical docs that waste tokens but have archival value

### When to Clean Up
- Never delete - this is permanent archive
- Organize into subdirectories if it grows too large
- Update this README when adding new categories

---

## 📊 Impact

**Token Savings:**
- Before: ~50 scattered .md files in context
- After: 3 root files + selective wiki reading
- **Savings: ~45,000 tokens per context load**

**Benefits:**
- Faster AI agent context loading
- More focused development context
- Preserved historical information
- Cleaner repository structure

---

**This archive is excluded from AI context but preserved for human reference.**
