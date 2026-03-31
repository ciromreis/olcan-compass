# Olcan Compass v2.5 - Development Guide

**Quick reference for developers working on Olcan Compass**

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Start Backend
```bash
cd apps/api-core-v2
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Start Frontend
```bash
cd apps/app-compass-v2
pnpm dev
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs

---

## 📁 Project Structure

```
olcan-compass/
├── apps/
│   ├── api-core-v2/              # FastAPI Backend
│   │   ├── app/
│   │   │   ├── api/              # API endpoints
│   │   │   ├── models/           # Database models
│   │   │   ├── services/         # Business logic
│   │   │   ├── core/             # Config, database
│   │   │   └── main.py           # App entry point
│   │   └── requirements.txt
│   │
│   └── app-compass-v2/           # Next.js Frontend
│       ├── src/
│       │   ├── app/              # App router pages
│       │   ├── components/       # React components
│       │   ├── stores/           # Zustand state
│       │   ├── lib/              # Utilities
│       │   └── styles/           # Global styles
│       └── package.json
│
├── packages/
│   └── ui-components/            # Shared UI Library
│       ├── src/
│       │   ├── components/       # Reusable components
│       │   └── utils/            # Helper functions
│       └── package.json
│
├── docs/                         # Documentation
│   ├── v2.5/                     # Product specs
│   ├── development/              # Dev guides
│   └── operations/               # API docs
│
└── scripts/                      # Build scripts
```

---

## 🔧 Development Workflow

### Backend Development

**Start server**:
```bash
cd apps/api-core-v2
uvicorn app.main:app --reload
```

**Run migrations** (if using Alembic):
```bash
alembic upgrade head
```

**Test endpoints**:
```bash
# Health check
curl http://localhost:8001/health

# Register user
curl -X POST http://localhost:8001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"Test123!","full_name":"Test User"}'

# Login
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=Test123!"
```

### Frontend Development

**Start dev server**:
```bash
cd apps/app-compass-v2
pnpm dev
```

**Build for production**:
```bash
pnpm build
```

**Run linter**:
```bash
pnpm lint
```

### UI Components Development

**Build components**:
```bash
cd packages/ui-components
pnpm build
```

**Watch mode** (auto-rebuild):
```bash
pnpm dev
```

---

## 🧪 Testing

### Backend Tests
```bash
cd apps/api-core-v2
pytest
```

### Frontend Tests
```bash
cd apps/app-compass-v2
pnpm test
```

### E2E Tests
```bash
pnpm test:e2e
```

---

## 🐛 Common Issues

### Backend won't start
```bash
# Check if port is in use
lsof -i :8001

# Kill process
pkill -f "uvicorn"

# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend build errors
```bash
# Clear cache
rm -rf .next node_modules
pnpm install
pnpm build
```

### Database errors
```bash
# Reset database (SQLite)
cd apps/api-core-v2
rm compass_v25.db
# Restart server to recreate tables
```

### CORS errors
Check `apps/api-core-v2/.env`:
```
CORS_ALLOW_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## 📝 Code Style

### Backend (Python)
- Follow PEP 8
- Use type hints
- Document functions with docstrings
- Keep functions small and focused

### Frontend (TypeScript)
- Use TypeScript strictly
- Follow React best practices
- Use functional components with hooks
- Keep components small and reusable

### Naming Conventions
- **Files**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Functions**: camelCase (`getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

---

## 🔐 Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:pass@localhost/compass
SECRET_KEY=your-secret-key
CORS_ALLOW_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📚 Key Documentation

- **API Reference**: `docs/operations/API_ENDPOINTS_TESTED.md`
- **Product Specs**: `docs/v2.5/PRD.md`
- **Troubleshooting**: `docs/development/TROUBLESHOOTING_GUIDE.md`
- **Project Status**: `PROJECT_STATUS.md`

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
vercel --prod
```

### Backend (Render/Railway)
- Push to main branch
- Automatic deployment configured

---

## 💡 Tips

1. **Use API Docs**: http://localhost:8001/docs for interactive API testing
2. **Check Network Tab**: Browser DevTools to debug API calls
3. **Read Error Messages**: They usually tell you exactly what's wrong
4. **Test Incrementally**: Don't write too much code before testing
5. **Keep Backend Running**: Frontend needs it for API calls

---

*For detailed guides, see `docs/development/` directory*
