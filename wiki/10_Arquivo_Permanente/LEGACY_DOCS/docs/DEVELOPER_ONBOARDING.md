# Developer Onboarding Guide

## Welcome to Olcan Compass! 🧭

This guide will help you get up and running with the Olcan Compass codebase quickly.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Getting Started](#getting-started)
4. [Architecture](#architecture)
5. [Development Workflow](#development-workflow)
6. [Key Concepts](#key-concepts)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [Resources](#resources)

---

## System Overview

**Olcan Compass** is a career development platform that helps users:
- Complete psychological assessments (OIOS framework)
- Discover their professional archetype
- Create mobility routes (career plans)
- Use AI-powered document polishing (Forge)
- Book consultations with marketplace providers
- Track progress with analytics

**Tech Stack:**
- **Frontend:** Next.js 14, React, TypeScript, TailwindCSS
- **Backend:** FastAPI, Python 3.11+, PostgreSQL
- **Infrastructure:** Vercel (frontend), Render/Railway (backend)
- **Services:** Stripe (payments), Sentry (error tracking), Twenty CRM

---

## Prerequisites

### Required Software

- **Node.js:** 18+ (LTS recommended)
- **Python:** 3.11+
- **PostgreSQL:** 15+ (or Docker)
- **Git:** Latest version

### Recommended Tools

- **IDE:** VS Code or Cursor
- **Database Client:** TablePlus or pgAdmin
- **API Client:** Insomnia or Postman
- **Terminal:** iTerm2 (macOS) or Windows Terminal

### Required Accounts

- GitHub (code repository)
- Vercel (frontend deployment)
- Render or Railway (backend deployment)
- Stripe (payments - test mode)
- Sentry (error tracking)

---

## Getting Started

### Step 1: Clone Repository

```bash
git clone https://github.com/olcan/olcan-compass.git
cd olcan-compass
```

### Step 2: Setup Backend (API)

```bash
# Navigate to API directory
cd apps/api-core-v2.5

# Create virtual environment
python -m venv venv
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Minimum .env configuration:**
```bash
ENV=development
DATABASE_URL=postgresql+asyncpg://olcan_app:olcan_app_password@127.0.0.1:5432/olcan_dev
JWT_SECRET_KEY=your-secret-key-here
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

**Start PostgreSQL (Docker):**
```bash
docker run -d \
  --name olcan-db \
  -e POSTGRES_USER=olcan_app \
  -e POSTGRES_PASSWORD=olcan_app_password \
  -e POSTGRES_DB=olcan_dev \
  -p 5432:5432 \
  postgres:15-alpine
```

**Run migrations:**
```bash
alembic upgrade head
```

**Seed database:**
```bash
python scripts/seed_psychology_questions.py
```

**Start API server:**
```bash
uvicorn app.main:app --reload --port 8000
```

Verify: http://localhost:8000/health

### Step 3: Setup Frontend (App)

```bash
# Navigate to app directory
cd apps/app-compass-v2.5

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

**Minimum .env.local configuration:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

**Start development server:**
```bash
npm run dev
```

Verify: http://localhost:3000

### Step 4: Setup Website (Optional)

```bash
# Navigate to website directory
cd apps/website-compass-v2.5

# Install dependencies
npm install

# Start development server
npm run dev
```

Verify: http://localhost:3001

---

## Architecture

### Directory Structure

```
olcan-compass/
├── apps/
│   ├── api-core-v2.5/          # FastAPI backend
│   │   ├── app/
│   │   │   ├── api/routes/     # API endpoints
│   │   │   ├── core/           # Core utilities
│   │   │   ├── db/models/      # Database models
│   │   │   └── services/       # Business logic
│   │   ├── alembic/            # Database migrations
│   │   ├── scripts/            # Utility scripts
│   │   └── tests/              # Test suite
│   │
│   ├── app-compass-v2.5/       # Next.js app (main product)
│   │   ├── src/
│   │   │   ├── app/            # Next.js app router
│   │   │   ├── components/     # React components
│   │   │   ├── lib/            # Utilities
│   │   │   └── stores/         # Zustand state
│   │   └── public/             # Static assets
│   │
│   └── website-compass-v2.5/   # Marketing website
│
├── ops/                        # Operations & DevOps
├── docs/                       # Documentation
└── scripts/                    # Repository scripts
```

### Key Services

**API (FastAPI):**
- Authentication & authorization
- User management
- Forge document processing
- Psychology assessments
- Billing & subscriptions
- CRM integration

**App (Next.js):**
- User interface
- State management (Zustand)
- API client
- Routing & navigation
- Analytics tracking

---

## Development Workflow

### Branch Strategy

```
main          → Production (stable)
staging       → Pre-production (testing)
feature/*     → New features
bugfix/*      → Bug fixes
hotfix/*      → Emergency fixes
```

### Creating a Feature

```bash
# Create feature branch
git checkout -b feature/my-feature staging

# Make changes
# ...

# Commit with conventional commit message
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/my-feature

# Create Pull Request to staging
```

### Commit Message Convention

```
feat: New feature
fix: Bug fix
docs: Documentation
style: Code style (formatting)
refactor: Code refactoring
test: Add/update tests
chore: Maintenance tasks

Examples:
feat: add psychology quiz endpoint
fix: resolve Stripe webhook signature verification
docs: update API documentation
```

### Code Review Process

1. Create Pull Request
2. Fill PR template
3. Request review from team members
4. Address review comments
5. Merge to staging after approval
6. Deploy to staging for testing
7. Promote to production after 24+ hours

---

## Key Concepts

### OIOS Psychology Framework

The system uses the OIOS (Organizational Identity & Orientation System) framework with 4 fear clusters:

1. **Confidence** - Self-belief in professional abilities
2. **Uncertainty** - Tolerance for ambiguity
3. **Belonging** - Social integration needs
4. **Purpose** - Meaning and direction

Users complete a 12-question assessment to discover their archetype.

### Subscription Tiers

- **Free (Explorador):** Basic features, 1 route, 3 Forge documents
- **Pro (Navegador):** R$79/month, 3 routes, unlimited Forge, marketplace access
- **Premium (Comandante):** R$149/month, unlimited everything, AI coach, advanced analytics

### Forge Credits

Users can purchase credit packs for document processing:
- Starter: 10 credits for R$9
- Pro: 50 credits for R$39

### Entitlement System

Access control is enforced both client-side and server-side:

**Client-side:** `src/lib/entitlements.ts`
**Server-side:** `app/core/entitlements.py`

---

## Testing

### Backend Tests

```bash
cd apps/api-core-v2.5

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_auth.py

# Run with coverage
pytest --cov=app tests/

# Run integration tests
pytest tests/test_integration.py
```

### Frontend Tests

```bash
cd apps/app-compass-v2.5

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- src/components/Auth.test.tsx
```

### Manual Testing

**Test User Registration:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "full_name": "Test User"
  }'
```

**Test Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

---

## Deployment

### Quick Deploy

**API (Render):**
```bash
git push origin main
# Render auto-deploys
```

**App (Vercel):**
```bash
git push origin main
# Vercel auto-deploys
```

### Staging Deployment

```bash
# Push to staging branch
git checkout staging
git merge feature/my-feature
git push origin staging
```

### Production Deployment

```bash
# Merge staging to main
git checkout main
git merge staging
git push origin main
```

See [DEPLOYMENT_RUNBOOK.md](./DEPLOYMENT_RUNBOOK.md) for detailed procedures.

---

## Troubleshooting

### Issue: Database connection fails

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Start if not running
docker start olcan-db

# Test connection
psql -h 127.0.0.1 -U olcan_app -d olcan_dev -c "SELECT 1"
```

### Issue: API won't start

**Solution:**
```bash
# Check Python version
python --version  # Should be 3.11+

# Check dependencies
pip install -r requirements.txt

# Check environment variables
cat .env

# Check database migrations
alembic current
alembic upgrade head
```

### Issue: App won't start

**Solution:**
```bash
# Check Node version
node --version  # Should be 18+

# Clear cache
rm -rf .next
rm -rf node_modules
npm install

# Check environment variables
cat .env.local
```

### Issue: Tests failing

**Solution:**
```bash
# Check test database
export DATABASE_URL=postgresql+asyncpg://olcan_app:olcan_app_password@127.0.0.1:5432/olcan_test

# Run migrations
alembic upgrade head

# Run tests
pytest tests/ -v
```

### Issue: Import errors

**Solution:**
```bash
# Python import errors
cd apps/api-core-v2.5
export PYTHONPATH=$PYTHONPATH:$(pwd)

# TypeScript import errors
cd apps/app-compass-v2.5
npm run type-check
```

---

## Resources

### Documentation

- [API Versioning Strategy](./API_VERSIONING_STRATEGY.md)
- [Deployment Runbook](./DEPLOYMENT_RUNBOOK.md)
- [Database Backup Guide](./DATABASE_BACKUP_GUIDE.md)
- [Database Seeding Guide](./DATABASE_SEEDING_GUIDE.md)
- [Staging Setup Guide](./STAGING_SETUP_GUIDE.md)
- [Entitlement Enforcement Guide](./ENTITLEMENT_ENFORCEMENT_GUIDE.md)
- [CRM Integration Guide](./CRM_INTEGRATION_GUIDE.md)
- [lib/ Reorganization Plan](./LIB_REORGANIZATION_PLAN.md)

### External Resources

- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **Next.js Docs:** https://nextjs.org/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Stripe Docs:** https://stripe.com/docs
- **Sentry Docs:** https://docs.sentry.io/

### Team Communication

- **Slack:** #olcan-compass-dev
- **GitHub:** Issues and PRs
- **Sentry:** Error tracking
- **Vercel:** Frontend deployments
- **Render:** Backend deployments

---

## First Tasks for New Developers

### Week 1: Setup & Exploration

1. ✅ Complete this onboarding guide
2. ✅ Run app locally
3. ✅ Complete OIOS quiz as test user
4. ✅ Create a Forge document
5. ✅ Explore codebase structure

### Week 2: First Contributions

1. Pick a "good first issue" from GitHub
2. Create feature branch
3. Implement fix/feature
4. Write tests
5. Create Pull Request

### Week 3: Deeper Understanding

1. Review architecture documentation
2. Understand database schema
3. Learn entitlement system
4. Study CRM integration
5. Participate in code reviews

### Week 4: Independent Work

1. Take on larger feature
2. Design implementation
3. Write comprehensive tests
4. Deploy to staging
5. Monitor in production

---

## Code Style Guidelines

### Python (Backend)

- Follow PEP 8
- Use type hints
- Docstrings for all public functions
- Max line length: 120 characters

```python
def create_user(
    email: str,
    password: str,
    full_name: str,
) -> User:
    """Create a new user account.
    
    Args:
        email: User email address
        password: User password (will be hashed)
        full_name: User's full name
    
    Returns:
        Created User object
    """
    ...
```

### TypeScript (Frontend)

- Use functional components
- TypeScript strict mode
- ESLint + Prettier
- Max line length: 100 characters

```typescript
interface UserProps {
  email: string;
  fullName: string;
  plan: UserPlan;
}

export function UserProfile({ email, fullName, plan }: UserProps) {
  return (
    <div>
      <h1>{fullName}</h1>
      <p>{email}</p>
    </div>
  );
}
```

---

## Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Validate all inputs** - Use Pydantic/Zod schemas
3. **Use parameterized queries** - Prevent SQL injection
4. **Implement rate limiting** - Prevent brute force
5. **Log security events** - Audit trail
6. **Keep dependencies updated** - Security patches

---

## Performance Tips

1. **Database:** Use indexes, avoid N+1 queries
2. **API:** Implement caching, use async operations
3. **Frontend:** Lazy load components, optimize images
4. **Build:** Code splitting, tree shaking
5. **Monitoring:** Track slow queries, error rates

---

## Getting Help

- **Slack:** #olcan-compass-dev
- **GitHub Issues:** Search before creating
- **Documentation:** Check docs/ directory
- **Senior Developers:** Don't hesitate to ask!

---

**Welcome aboard! 🚀**

**Last Updated:** April 13, 2026  
**Maintainer:** Engineering Team
