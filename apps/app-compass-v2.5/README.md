# Olcan Compass v2.5 (Production App)

**Status:** ✅ Active Development  
**Documentation:** See [../../wiki/02_Arquitetura_Compass/](../../wiki/02_Arquitetura_Compass/)  
**Design System:** [../../wiki/03_Produto_Forge/PRD_Master_Ethereal_Glass.md](../../wiki/03_Produto_Forge/PRD_Master_Ethereal_Glass.md)

## Quick Start

```bash
# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## Key Features
- Next.js 14 with App Router
- TypeScript strict mode
- Zustand state management (24 stores)
- Tailwind CSS + Ethereal Glass design system
- 139 compiled pages

## Environment
Copy `.env.example` to `.env.local` and configure:
- `NEXT_PUBLIC_DEMO_MODE=true` for demo mode (no login)
- Database and API URLs
- Feature flags

**Full documentation, architecture, and deployment guides in wiki.**
