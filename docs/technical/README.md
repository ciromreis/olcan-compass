# 🔧 Technical Documentation

> **Olcan Compass v2.5 technical architecture, implementation, and deployment**

---

## 🏗️ **Technical Overview**

### **🎯 Architecture Philosophy**
Olcan Compass v2.5 is built on a modern, scalable architecture using best practices for performance, security, and maintainability. The system follows a microservices approach with clear separation of concerns.

### **📊 Technology Stack**
- **Frontend**: React 18+, Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.11+, SQLAlchemy, PostgreSQL
- **State Management**: Zustand, React Query
- **Animation**: Framer Motion
- **Authentication**: JWT with refresh tokens
- **Deployment**: Docker, Vercel, Railway

### **🌐 Platform Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │   Mobile App    │    │  Marketing Site │
│   (Next.js)     │    │   (React Native)│    │   (Next.js)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      API Gateway          │
                    │     (FastAPI)             │
                    └─────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
    ┌─────┴─────┐        ┌─────┴─────┐        ┌─────┴─────┐
    │ PostgreSQL│        │   Redis   │        │   AWS S3   │
    │ Database  │        │   Cache   │        │  Storage   │
    └───────────┘        └───────────┘        └───────────┘
```

---

## 📁 **Project Structure**

### **🏗️ Monorepo Organization**
```
olcan-compass/
├── apps/                          # Application code
│   ├── app-compass-v2/           # Main SaaS application
│   │   ├── src/
│   │   │   ├── app/              # Next.js pages
│   │   │   ├── components/        # React components
│   │   │   ├── hooks/            # Custom hooks
│   │   │   ├── stores/           # State management
│   │   │   └── lib/              # Utilities
│   │   └── package.json
│   ├── api-core-v2/              # Backend API
│   │   ├── app/
│   │   │   ├── api/              # API endpoints
│   │   │   ├── core/             # Core configuration
│   │   │   ├── models/           # Database models
│   │   │   ├── schemas/          # Pydantic schemas
│   │   │   └── services/         # Business logic
│   │   └── requirements.txt
│   ├── site-marketing-v2.5/      # Marketing website
│   └── app-mvp-v1/               # Legacy prototype
├── packages/                      # Shared packages
│   ├── ui-components/             # Shared UI components
│   ├── design-tokens/            # Design system tokens
│   ├── types/                     # TypeScript types
│   └── ui/                        # UI utilities
├── docs/                          # Documentation
├── scripts/                       # Build and deployment scripts
└── .agents/                       # Agent specifications
```

---

## 🔌 **Component System**

### **🎨 UI Component Library**
The `@olcan/ui-components` package provides a comprehensive set of reusable components:

```
packages/ui-components/src/
├── components/
│   ├── companion/                 # Companion-specific components
│   │   ├── CompanionCard.tsx
│   │   ├── CompanionAvatar.tsx
│   │   ├── EvolutionViewer.tsx
│   │   └── AbilityBadge.tsx
│   ├── gamification/             # Gamification components
│   │   ├── XPBar.tsx
│   │   ├── LevelBadge.tsx
│   │   ├── ProgressBar.tsx
│   │   └── AchievementCard.tsx
│   ├── liquid-glass/             # Core UI components
│   │   ├── GlassCard.tsx
│   │   ├── GlassButton.tsx
│   │   ├── GlassModal.tsx
│   │   └── GlassInput.tsx
│   └── layout/                    # Layout components
│       ├── Navigation.tsx
│       └── Header.tsx
├── hooks/                         # Custom hooks
│   ├── useCompanionAnimation.ts
│   ├── useEvolutionAnimation.ts
│   └── useGlowEffect.ts
├── types/                         # TypeScript types
│   └── companion.ts
├── utils/                         # Utility functions
│   ├── cn.ts
│   ├── companionColors.ts
│   └── evolutionStages.ts
└── index.ts                       # Package exports
```

---

## 🗄️ **Database Architecture**

### **📊 Database Schema**
The PostgreSQL database is organized into logical schemas:

```sql
-- Core Tables
users                          -- User accounts and profiles
companions                     -- Companion entities
companion_activities           -- Care activities and interactions
companion_evolutions           -- Evolution progress
guilds                         -- Social guilds
guild_members                  -- Guild membership
guild_battles                  -- Guild battles and competitions
marketplace_transactions       -- Virtual economy
user_sessions                  -- Authentication sessions

-- Feature Tables
documents                      -- User documents and resumes
interview_sessions             -- Interview practice sessions
youtube_videos                -- User-created videos
analytics_events               -- User analytics and events
notifications                  -- User notifications
```

### **🔗 Key Relationships**
```
Users (1:N) Companions
Users (1:N) Documents
Users (1:N) Interview Sessions
Users (1:N) YouTube Videos
Companions (1:N) Activities
Companions (1:N) Evolutions
Guilds (1:N) Guild Members
Guilds (1:N) Guild Battles
Users (1:N) Marketplace Transactions
```

---

## 🔐 **Security Architecture**

### **🛡️ Authentication System**
- **JWT Tokens**: Access tokens (15 min) + refresh tokens (7 days)
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: Secure session storage with HttpOnly cookies
- **Multi-Factor**: Optional 2FA with TOTP

### **🔒 Authorization Model**
```typescript
// User Roles
type UserRole = 'user' | 'premium' | 'admin' | 'moderator'

// Permissions Matrix
const permissions = {
  user: ['read_own', 'create_own', 'update_own'],
  premium: ['read_own', 'create_own', 'update_own', 'premium_features'],
  admin: ['read_all', 'create_all', 'update_all', 'delete_all'],
  moderator: ['read_all', 'moderate_content']
}
```

### **🔐 Data Protection**
- **Encryption**: AES-256 for sensitive data at rest
- **Transit**: TLS 1.3 for all API communications
- **PII Protection**: Personal data anonymization where possible
- **Compliance**: GDPR and CCPA compliant data handling

---

## 🚀 **API Architecture**

### **🔌 RESTful API Design**
The FastAPI backend follows RESTful principles:

```
API Endpoints Structure:
├── /api/v1/auth/                 # Authentication
│   ├── POST /login
│   ├── POST /register
│   ├── POST /refresh
│   └── POST /logout
├── /api/v1/users/                # User management
│   ├── GET /me
│   ├── PUT /me
│   └── DELETE /me
├── /api/v1/companions/           # Companion system
│   ├── GET /companions
│   ├── POST /companions
│   ├── PUT /companions/{id}
│   └── POST /companions/{id}/care
├── /api/v1/guilds/               # Social features
│   ├── GET /guilds
│   ├── POST /guilds
│   └── POST /guilds/{id}/join
├── /api/v1/marketplace/          # Virtual economy
│   ├── GET /items
│   ├── POST /purchase
│   └── GET /transactions
└── /api/v1/analytics/            # Analytics and metrics
    ├── GET /user-stats
    ├── GET /platform-stats
    └── POST /events
```

### **📊 API Response Format**
```typescript
// Standard API Response
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    pagination?: {
      page: number
      limit: number
      total: number
    }
    timestamp: string
  }
}
```

---

## ⚡ **Performance Optimization**

### **🚀 Frontend Optimization**
- **Code Splitting**: Route-based and component-based splitting
- **Lazy Loading**: Components and images loaded on demand
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Caching**: Service worker for offline functionality
- **Image Optimization**: WebP format with responsive images

### **⚡ Backend Optimization**
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connection management
- **Caching Layer**: Redis for frequently accessed data
- **API Rate Limiting**: Prevent abuse and ensure stability
- **Async Processing**: Background jobs for heavy operations

### **📊 Performance Metrics**
- **First Contentful Paint**: <1.5 seconds
- **Largest Contentful Paint**: <2.5 seconds
- **Time to Interactive**: <3.5 seconds
- **API Response Time**: <200ms average
- **Database Query Time**: <50ms average

---

## 🔄 **State Management**

### **🏪 Client State**
```typescript
// Zustand Store Structure
interface AppState {
  // User State
  user: User | null
  isAuthenticated: boolean
  
  // Companion State
  companion: Companion | null
  companionStats: CompanionStats
  
  // UI State
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  
  // Actions
  setUser: (user: User) => void
  setCompanion: (companion: Companion) => void
  updateCompanionStats: (stats: Partial<CompanionStats>) => void
}
```

### **🌐 Server State**
```typescript
// React Query Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false
    }
  }
})
```

---

## 🚀 **Deployment Architecture**

### **🌐 Production Environment**
```
Production Stack:
├── Frontend (Vercel)
│   ├── Next.js Application
│   ├── Static Assets (CDN)
│   └── Edge Functions
├── Backend (Railway)
│   ├── FastAPI Application
│   ├── PostgreSQL Database
│   └── Redis Cache
├── Storage (AWS S3)
│   ├── User Uploads
│   ├── Video Files
│   └── Static Assets
└── Monitoring (Sentry)
    ├── Error Tracking
    ├── Performance Monitoring
    └── User Analytics
```

### **🔧 Environment Configuration**
```bash
# Production Environment Variables
NEXT_PUBLIC_APP_URL=https://app.olcan-compass.com
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
AWS_S3_BUCKET=olcan-compass-prod
STRIPE_SECRET_KEY=sk_live_...
OPENAI_API_KEY=sk-...
SENTRY_DSN=https://...
```

---

## 🧪 **Testing Strategy**

### **📋 Testing Pyramid**
```
Testing Structure:
├── Unit Tests (60%)
│   ├── Component Tests
│   ├── Utility Functions
│   └── Business Logic
├── Integration Tests (30%)
│   ├── API Endpoints
│   ├── Database Operations
│   └── Component Integration
└── E2E Tests (10%)
    ├── User Workflows
    ├── Critical Paths
    └── Cross-browser Testing
```

### **🔧 Testing Tools**
- **Frontend**: Jest, React Testing Library, Cypress
- **Backend**: Pytest, pytest-asyncio, factory_boy
- **API**: pytest-httpx, fastapi-testclient
- **Database**: pytest-postgresql, testcontainers

---

## 📊 **Monitoring & Analytics**

### **📈 Application Monitoring**
- **Error Tracking**: Sentry for error aggregation
- **Performance**: Vercel Analytics and custom metrics
- **User Behavior**: Custom event tracking
- **Infrastructure**: Railway monitoring and alerts

### **📊 Business Analytics**
```typescript
// Key Events Tracked
interface AnalyticsEvent {
  event: string
  user_id: string
  properties: Record<string, any>
  timestamp: string
}

// Example Events
- companion_discovered
- companion_evolved
- document_created
- interview_completed
- youtube_video_created
- guild_joined
- marketplace_purchase
```

---

## 🔧 **Development Workflow**

### **🔄 Development Process**
1. **Feature Branch**: Create feature branch from main
2. **Development**: Implement feature with tests
3. **Code Review**: Peer review and feedback
4. **Testing**: Run full test suite
5. **Integration**: Merge to staging
6. **Deployment**: Deploy to production

### **📋 Quality Gates**
- **Code Quality**: ESLint, Prettier, TypeScript checks
- **Test Coverage**: Minimum 80% coverage
- **Security**: Automated security scanning
- **Performance**: Bundle size and performance budgets
- **Accessibility**: WCAG 2.1 compliance checks

---

## 🎯 **Technical Roadmap**

### **🚀 Phase 1: Foundation (Complete)**
- [x] Monorepo setup with pnpm workspaces
- [x] Component library with liquid-glass design
- [x] FastAPI backend with PostgreSQL
- [x] Authentication and authorization system
- [x] Basic deployment infrastructure

### **📈 Phase 2: Enhancement (In Progress)**
- [x] Advanced companion system
- [x] Social features and guilds
- [x] YouTube studio integration
- [x] Marketplace and monetization
- [ ] Mobile application development

### **🌟 Phase 3: Scale (Planned)**
- [ ] Microservices architecture
- [ ] Advanced AI integration
- [ ] Real-time features with WebSockets
- [ ] Advanced analytics and ML
- [ ] Global infrastructure scaling

---

## 🔧 **Troubleshooting**

### **🐛 Common Issues**
1. **Import Path Errors**: Check pnpm workspace configuration
2. **Database Connection**: Verify environment variables
3. **Authentication Failures**: Check JWT configuration
4. **Performance Issues**: Monitor bundle size and queries
5. **Deployment Errors**: Review build logs and dependencies

### **🔍 Debugging Tools**
- **Frontend**: React DevTools, Redux DevTools
- **Backend**: FastAPI docs, PostgreSQL logs
- **Network**: Browser dev tools, Postman
- **Performance**: Lighthouse, WebPageTest
- **Monitoring**: Sentry dashboards, Vercel analytics

---

## 📞 **Technical Support**

### **👥 Development Team**
- **Frontend Lead**: React/Next.js specialist
- **Backend Lead**: FastAPI/Python specialist
- **DevOps Engineer**: Infrastructure and deployment
- **QA Engineer**: Testing and quality assurance

### **📧 Support Channels**
- **Technical Issues**: Create GitHub issue
- **Security Concerns**: Report to security team
- **Performance Issues**: Contact DevOps team
- **Feature Requests**: Submit to product team

---

> **🔧 Olcan Compass v2.5: Built with modern technologies and best practices for scale and performance!**
