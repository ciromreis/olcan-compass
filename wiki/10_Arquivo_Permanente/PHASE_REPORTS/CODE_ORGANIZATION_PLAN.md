# 📁 Olcan Compass v2.5 - Code Organization Plan

**Objective**: Systematically organize and structure the codebase for maintainability and scalability  
**Status**: Ready for implementation  
**Priority**: High - Foundation for future development

---

## 🏗️ Current Structure Analysis

### Existing Directory Structure
```
olcan-compass/
├── apps/
│   ├── app-compass-v2/          # Next.js frontend
│   └── api-core-v2/             # FastAPI backend
├── packages/
│   └── ui-components/           # Shared component library
├── docs/                        # Documentation
├── simple_api.py               # Mock API (temporary)
└── Various assessment files
```

### Issues Identified
- Mixed file organization
- Temporary files in root directory
- Inconsistent naming conventions
- Missing standard project files
- No clear separation of concerns

---

## 🎯 Target Organization Structure

### Proposed Final Structure
```
olcan-compass/
├── README.md                    # Project overview
├── CONTRIBUTING.md              # Development guidelines
├── CHANGELOG.md                 # Version history
├── LICENSE                      # Legal information
├── .gitignore                   # Git exclusions
├── .env.example                 # Environment template
├── package.json                 # Root package config
├── docker-compose.yml           # Development environment
├── 
├── apps/                        # Applications
│   ├── web/                     # Next.js frontend (renamed)
│   │   ├── public/
│   │   ├── src/
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── .env.local
│   └── api/                     # FastAPI backend (renamed)
│       ├── app/
│       ├── alembic/
│       ├── requirements.txt
│       ├── Dockerfile
│       └── .env
│
├── packages/                    # Shared packages
│   ├── ui/                      # UI components (renamed)
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── shared/                  # Shared types and utilities
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── config/                  # Configuration packages
│       ├── eslint/
│       ├── typescript/
│       └── tailwind/
│
├── tools/                       # Development tools
│   ├── scripts/                 # Build and deployment scripts
│   ├── generators/              # Code generators
│   └── linters/                 # Custom linting rules
│
├── infrastructure/              # DevOps and deployment
│   ├── docker/                  # Docker configurations
│   ├── kubernetes/              # K8s manifests
│   ├── terraform/               # Infrastructure as code
│   └── monitoring/              # Observability configs
│
├── docs/                        # Documentation
│   ├── api/                     # API documentation
│   ├── guides/                  # User guides
│   ├── architecture/            # System design docs
│   └── deployment/              # Deployment guides
│
├── tests/                       # Testing
│   ├── e2e/                     # End-to-end tests
│   ├── integration/             # Integration tests
│   └── fixtures/                # Test data
│
└── archive/                     # Deprecated/old files
    ├── v1.0/                    # Previous version files
    └── experimental/            # Experimental features
```

---

## 📋 Organization Tasks

### Phase 1: Directory Restructuring
**Timeline**: Day 1  
**Priority**: Critical

#### Tasks
1. **Create New Directory Structure**
   ```bash
   mkdir -p packages/shared packages/config
   mkdir -p tools/{scripts,generators,linters}
   mkdir -p infrastructure/{docker,kubernetes,terraform,monitoring}
   mkdir -p tests/{e2e,integration,fixtures}
   mkdir -p archive/{v1.0,experimental}
   ```

2. **Rename Applications**
   ```bash
   mv apps/app-compass-v2 apps/web
   mv apps/api-core-v2 apps/api
   ```

3. **Rename UI Package**
   ```bash
   mv packages/ui-components packages/ui
   ```

4. **Move Temporary Files**
   ```bash
   mv simple_api.py archive/experimental/
   mv V2_5_COMPREHENSIVE_ASSESSMENT.md docs/architecture/
   mv DEVELOPMENT_ROADMAP_V2_5.md docs/planning/
   mv TECHNICAL_DEBT_ANALYSIS.md docs/technical/
   ```

### Phase 2: File Organization
**Timeline**: Day 1-2  
**Priority**: High

#### Standard Project Files
1. **Root Level Files**
   - Create comprehensive README.md
   - Add CONTRIBUTING.md with development guidelines
   - Create CHANGELOG.md for version tracking
   - Add LICENSE file
   - Update .gitignore
   - Create .env.example template
   - Add root package.json for workspace management

2. **Development Environment**
   - Create docker-compose.yml for local development
   - Add Makefile for common commands
   - Create .vscode/ settings for IDE configuration

#### Package Reorganization
1. **Shared Package** (`packages/shared`)
   - Move common types from apps/web/src/types
   - Move utility functions from apps/web/src/lib
   - Move constants and enums
   - Create shared interfaces

2. **Config Package** (`packages/config`)
   - ESLint configurations
   - TypeScript configurations
   - Tailwind configurations
   - Build configurations

### Phase 3: Import Path Updates
**Timeline**: Day 2-3  
**Priority**: High

#### Update Import Statements
1. **Frontend Imports**
   ```typescript
   // Before
   import { Button } from '@/components/ui'
   import { API_URL } from '@/lib/config'
   
   // After
   import { Button } from '@olcan/ui'
   import { API_URL } from '@olcan/shared'
   ```

2. **Backend Imports**
   ```python
   # Before
   from app.core.database import get_db
   
   # After
   from olcan.shared.database import get_db
   ```

3. **Component Library**
   ```typescript
   // Before
   import { CompanionCard } from '@olcan/ui-components'
   
   // After
   import { CompanionCard } from '@olcan/ui'
   ```

### Phase 4: Workspace Configuration
**Timeline**: Day 3  
**Priority**: Medium

#### Root Package Configuration
```json
{
  "name": "olcan-compass",
  "version": "2.5.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:web\" \"npm run dev:api\"",
    "dev:web": "npm run dev --workspace=apps/web",
    "dev:api": "npm run dev --workspace=apps/api",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces",
    "clean": "npm run clean --workspaces"
  },
  "devDependencies": {
    "concurrently": "^7.6.0"
  }
}
```

#### Docker Compose Configuration
```yaml
version: '3.8'
services:
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:8000
    depends_on:
      - api
  
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/compass
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=compass
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

---

## 🔄 Migration Strategy

### Step-by-Step Migration Plan

#### Step 1: Backup Current State
```bash
# Create backup branch
git checkout -b backup-before-reorganization
git add .
git commit -m "Backup: Current state before reorganization"

# Create reorganization branch
git checkout main
git checkout -b feature/code-reorganization
```

#### Step 2: Create New Structure
```bash
# Create new directories
mkdir -p packages/shared packages/config
mkdir -p tools/{scripts,generators,linters}
mkdir -p infrastructure/{docker,kubernetes,terraform,monitoring}
mkdir -p tests/{e2e,integration,fixtures}
mkdir -p archive/{v1.0,experimental}
```

#### Step 3: Move and Rename
```bash
# Rename applications
mv apps/app-compass-v2 apps/web
mv apps/api-core-v2 apps/api

# Rename UI package
mv packages/ui-components packages/ui

# Move documentation
mkdir -p docs/{architecture,planning,technical}
mv V2_5_COMPREHENSIVE_ASSESSMENT.md docs/architecture/
mv DEVELOPMENT_ROADMAP_V2_5.md docs/planning/
mv TECHNICAL_DEBT_ANALYSIS.md docs/technical/
```

#### Step 4: Update Configurations
- Update all package.json files
- Update import statements
- Update Docker configurations
- Update CI/CD pipelines

#### Step 5: Test and Validate
- Run all tests
- Build all packages
- Start development environment
- Verify all functionality

---

## 📝 File Naming Conventions

### Directory Naming
- **kebab-case** for directories: `user-management`, `api-routes`
- **Plural** for package directories: `apps`, `packages`, `tools`
- **Singular** for feature directories: `auth`, `user`, `post`

### File Naming
- **kebab-case** for regular files: `user-service.ts`, `api-client.ts`
- **PascalCase** for React components: `UserProfile.tsx`, `Button.tsx`
- **camelCase** for utility files: `apiClient.ts`, `userService.ts`
- **UPPER_SNAKE_CASE** for constants: `API_ENDPOINTS.ts`, `COLORS.ts`

### Component File Structure
```
components/
├── UserProfile/
│   ├── index.ts              # Export barrel
│   ├── UserProfile.tsx       # Main component
│   ├── UserProfile.test.tsx   # Tests
│   ├── UserProfile.stories.tsx # Stories
│   └── types.ts              # Component types
```

---

## 🔧 Development Workflow

### Package Management
```bash
# Install dependencies for all packages
npm install

# Install dependency for specific package
npm install --workspace=apps/web react

# Run script in specific package
npm run dev --workspace=apps/web

# Run script in all packages
npm run build --workspaces
```

### Development Commands
```bash
# Start all services
npm run dev

# Start frontend only
npm run dev:web

# Start backend only
npm run dev:api

# Build all packages
npm run build

# Run all tests
npm run test

# Run linting
npm run lint

# Clean all packages
npm run clean
```

### Git Workflow
```bash
# Feature branch naming
feature/user-authentication
feature/api-integration
feature/ui-components

# Commit message format
feat: add user authentication system
fix: resolve API connection issue
docs: update API documentation
refactor: reorganize component structure
```

---

## 🎯 Success Criteria

### Organization Goals
- [ ] Clear separation of concerns
- [ ] Consistent naming conventions
- [ ] Standardized file structure
- [ ] Efficient development workflow
- [ ] Scalable package architecture

### Quality Metrics
- [ ] Zero circular dependencies
- [ ] Clear import paths
- [ ] Consistent code style
- [ ] Comprehensive documentation
- [ ] Automated testing setup

### Developer Experience
- [ ] Easy onboarding
- [ ] Clear development guidelines
- [ ] Efficient tooling
- [ ] Good documentation
- [ ] Smooth development workflow

---

## 🚀 Next Agent Handoff

### Immediate Tasks
1. **Execute directory restructuring** as outlined in Phase 1
2. **Update all import statements** according to new structure
3. **Configure workspace management** with root package.json
4. **Set up development environment** with Docker Compose

### Critical Dependencies
- All import paths must be updated before testing
- Docker configuration must be validated
- Package dependencies must be resolved
- Development workflow must be tested

### Validation Checklist
- [ ] All applications start successfully
- [ ] All imports resolve correctly
- [ ] All tests pass
- [ ] Build process works
- [ ] Development environment functional

---

**This organization plan provides a systematic approach to restructuring the codebase for long-term maintainability and scalability. The next AI agent should execute this plan methodically while maintaining development momentum.**
