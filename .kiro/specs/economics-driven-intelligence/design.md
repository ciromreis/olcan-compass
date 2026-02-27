# Design Document: Economics-Driven Intelligence

## Overview

This document specifies the technical design for embedding five economics-driven intelligence features into Olcan Compass. These features leverage economic theory to maximize business value while maintaining seamless user experience:

1. **Trust Signal System** - Cryptographic verification credentials for high-readiness users
2. **Temporal Preference Matching** - Route recommendations based on time preferences
3. **Opportunity Cost Intelligence** - Growth potential widget to drive premium conversions
4. **Performance-Bound Marketplace** - Escrow system with outcome-based payments
5. **Scenario Optimization Engine** - Pareto-optimal opportunity visualization

### Design Principles

- **Seamless Integration**: Extend existing patterns, don't create new ones
- **Portuguese-First UX**: All user-facing text uses MMXD "Alchemical" voice
- **Background Processing**: Heavy computations run asynchronously via Celery
- **Admin Analytics**: Rich dashboards for measuring business impact
- **Privacy-Preserving**: Cryptographic hashing, no PII exposure in public URLs
- **Extensible**: Designed for future feature additions

### Technology Stack

**Backend:**
- FastAPI (Python 3.12) with SQLAlchemy 2.0 async
- PostgreSQL with pgcrypto extension for encryption
- Celery with Redis for background jobs
- Stripe Connect for escrow payments

**Frontend:**
- React 18 with TypeScript (strict mode)
- Zustand for client state, React Query for server state
- Tailwind CSS with MMXD design tokens
- D3.js or Recharts for data visualization
- Framer Motion for animations

**Infrastructure:**
- Docker Compose for local development
- Alembic for database migrations
- JWT authentication with role-based access control

## Architecture

### System Context

The economics features integrate with five existing engines:

```
┌─────────────────────────────────────────────────────────────┐
│                    Olcan Compass Platform                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Psychology   │  │   Routes     │  │ Applications │      │
│  │   Engine     │  │   Engine     │  │    Engine    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│         ┌──────────────────┴──────────────────┐             │
│         │  Economics Intelligence Layer       │             │
│         ├─────────────────────────────────────┤             │
│         │ • Trust Signals                     │             │
│         │ • Temporal Matching                 │             │
│         │ • Opportunity Cost                  │             │
│         │ • Performance Escrow                │             │
│         │ • Scenario Optimization             │             │
│         └──────────────────┬──────────────────┘             │
│                            │                                 │
│  ┌──────────────┐  ┌──────┴───────┐  ┌──────────────┐      │
│  │ Marketplace  │  │   Sprints    │  │      AI      │      │
│  │   Engine     │  │   Engine     │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Integration Points

**Psychology Engine Integration:**
- Read `PsychProfile` for temporal preference calculation
- Add `temporal_preference` column to `user_psych_profiles` table
- Trigger credential generation when readiness crosses threshold

**Routes Engine Integration:**
- Read `RouteTemplate` and `Route` for temporal matching
- Add `recommended_temporal_range_min/max` columns to `route_templates`
- Calculate milestone density based on temporal preference

**Applications Engine Integration:**
- Read `Opportunity` for opportunity cost and scenario optimization
- Add `opportunity_cost_daily`, `competitiveness_score`, `resource_requirements_score` columns
- Track credential usage in applications

**Marketplace Engine Integration:**
- Read `ServiceListing` and `Booking` for performance-bound escrow
- Add `performance_bound` flag and `performance_success_rate` to `service_listings`
- Create `escrow_transactions` table for payment holds

**Sprints Engine Integration:**
- Read `ReadinessAssessment` for credential generation and escrow resolution
- Track `momentum_score` on `users` table
- Calculate readiness improvements for escrow release conditions

### Data Flow Architecture

```
┌─────────────┐
│   User      │
│  Actions    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│         FastAPI Endpoints               │
│  /api/credentials/*                     │
│  /api/temporal-matching/*               │
│  /api/opportunity-cost/*                │
│  /api/escrow/*                          │
│  /api/scenarios/*                       │
└──────┬──────────────────────────────────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌─────────────┐ ┌──────────┐ ┌────────────┐
│ PostgreSQL  │ │  Celery  │ │   Stripe   │
│  Database   │ │  Queue   │ │  Connect   │
└─────────────┘ └──────────┘ └────────────┘
       │              │              │
       └──────────────┴──────────────┘
                      │
                      ▼
              ┌──────────────┐
              │   React UI   │
              │  Components  │
              └──────────────┘
```

## Components and Interfaces

### Backend Components

#### 1. Credentials Service (`app/services/credentials.py`)

**Responsibilities:**
- Generate cryptographic verification credentials
- Create public verification URLs
- Validate and revoke credentials
- Track credential usage and conversions

**Key Methods:**
```python
async def generate_credential(
    user_id: UUID,
    credential_type: str,
    score_value: int,
    db: AsyncSession
) -> VerificationCredential

async def verify_credential(
    verification_hash: str,
    db: AsyncSession
) -> Optional[CredentialPublicView]

async def revoke_credential(
    credential_id: UUID,
    user_id: UUID,
    db: AsyncSession
) -> bool

async def track_verification_click(
    verification_hash: str,
    ip_address: str,
    db: AsyncSession
) -> None
```

#### 2. Temporal Matching Service (`app/services/temporal_matching.py`)

**Responsibilities:**
- Calculate temporal preference from psychology assessments
- Match users to routes based on temporal alignment
- Adjust milestone density for personalized routes
- Predict churn based on temporal mismatch

**Key Methods:**
```python
async def calculate_temporal_preference(
    assessment_answers: List[PsychAnswer],
    db: AsyncSession
) -> int

async def get_matched_routes(
    user_id: UUID,
    db: AsyncSession
) -> List[RouteTemplateWithMatch]

async def adjust_milestone_density(
    route_id: UUID,
    temporal_preference: int,
    db: AsyncSession
) -> Route

async def predict_churn_risk(
    user_id: UUID,
    route_id: UUID,
    db: AsyncSession
) -> ChurnPrediction
```

#### 3. Opportunity Cost Service (`app/services/opportunity_cost.py`)

**Responsibilities:**
- Calculate daily opportunity cost for opportunities
- Track user momentum (milestone completion rate)
- Determine when to display growth potential widget
- Attribute conversions to widget impressions

**Key Methods:**
```python
async def calculate_opportunity_cost(
    opportunity_id: UUID,
    user_id: UUID,
    db: AsyncSession
) -> Decimal

async def calculate_user_momentum(
    user_id: UUID,
    db: AsyncSession
) -> int

async def should_show_widget(
    user_id: UUID,
    db: AsyncSession
) -> bool

async def track_widget_impression(
    user_id: UUID,
    opportunity_id: UUID,
    db: AsyncSession
) -> None

async def track_conversion(
    user_id: UUID,
    upgrade_tier: str,
    db: AsyncSession
) -> None
```

#### 4. Escrow Service (`app/services/escrow.py`)

**Responsibilities:**
- Create escrow holds via Stripe Connect
- Define performance release conditions
- Calculate readiness improvements
- Release or refund escrowed amounts

**Key Methods:**
```python
async def create_escrow(
    booking_id: UUID,
    amount: Decimal,
    release_condition: Dict,
    db: AsyncSession
) -> EscrowTransaction

async def calculate_readiness_improvement(
    user_id: UUID,
    booking_id: UUID,
    db: AsyncSession
) -> int

async def resolve_escrow(
    escrow_id: UUID,
    db: AsyncSession
) -> EscrowResolution

async def release_to_provider(
    escrow_id: UUID,
    provider_id: UUID,
    db: AsyncSession
) -> bool

async def refund_to_client(
    escrow_id: UUID,
    user_id: UUID,
    db: AsyncSession
) -> bool
```

#### 5. Scenario Optimization Service (`app/services/scenario_optimization.py`)

**Responsibilities:**
- Calculate feasible frontier for user constraints
- Score opportunities on competitiveness and resource requirements
- Identify Pareto-optimal opportunities
- Track decision quality metrics

**Key Methods:**
```python
async def calculate_feasible_frontier(
    user_id: UUID,
    constraints: ScenarioConstraints,
    db: AsyncSession
) -> FeasibleFrontier

async def score_opportunity(
    opportunity_id: UUID,
    user_id: UUID,
    db: AsyncSession
) -> OpportunityScore

async def identify_pareto_optimal(
    opportunities: List[OpportunityScore]
) -> List[UUID]

async def track_decision_quality(
    user_id: UUID,
    application_id: UUID,
    db: AsyncSession
) -> None
```

### Frontend Components

#### 1. Verification Badge Component (`src/components/domain/VerificationBadge.tsx`)

**Props:**
```typescript
interface VerificationBadgeProps {
  userId: string;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

**Features:**
- Displays "Perfil Verificado" badge when credential exists
- Tooltip with credential details
- Copy verification link button
- Integrates with existing MMXD design tokens

#### 2. Route Recommendations Component (`src/components/domain/TemporalRouteRecommendations.tsx`)

**Props:**
```typescript
interface TemporalRouteRecommendationsProps {
  userId: string;
  limit?: number;
}
```

**Features:**
- Displays routes matched to user's temporal preference
- Natural Portuguese explanations ("Esta rota combina com seu ritmo")
- Smooth transitions with Framer Motion
- Integrates into existing Routes/Templates page

#### 3. Growth Potential Widget (`src/components/domain/GrowthPotentialWidget.tsx`)

**Props:**
```typescript
interface GrowthPotentialWidgetProps {
  userId: string;
  opportunityId: string;
}
```

**Features:**
- Shows cumulative opportunity cost during low momentum
- Motivational Portuguese messaging
- CTA button for Pro/Premium upgrade
- Tracks impressions and clicks

#### 4. Performance Guarantee Badge (`src/components/domain/PerformanceGuaranteeBadge.tsx`)

**Props:**
```typescript
interface PerformanceGuaranteeBadgeProps {
  serviceId: string;
  showDetails?: boolean;
}
```

**Features:**
- "Garantia de Resultado" badge on service listings
- Tooltip explaining escrow protection
- Provider success rate display
- Integrates with ProviderCard component

#### 5. Scenario Simulator Page (`src/pages/Applications/Simulator.tsx`)

**Features:**
- Interactive D3.js/Recharts scatter plot
- Constraint sliders (budget, time, skills)
- Real-time feasible frontier recalculation
- Pareto-optimal opportunity highlighting
- Portuguese explanations and suggestions

### Custom Hooks

#### `useCredentials` Hook

```typescript
export function useCredentials(userId: string) {
  const credentials = useQuery(['credentials', userId], ...)
  const generateCredential = useMutation(...)
  const revokeCredential = useMutation(...)
  const copyVerificationLink = (hash: string) => { ... }
  
  return {
    credentials,
    hasActiveCredential,
    generateCredential,
    revokeCredential,
    copyVerificationLink
  }
}
```

#### `useTemporalMatching` Hook

```typescript
export function useTemporalMatching(userId: string) {
  const matchedRoutes = useQuery(['temporal-routes', userId], ...)
  const temporalPreference = useQuery(['temporal-preference', userId], ...)
  
  return {
    matchedRoutes,
    temporalPreference,
    isLoading,
    error
  }
}
```

#### `useOpportunityCost` Hook

```typescript
export function useOpportunityCost(userId: string, opportunityId?: string) {
  const momentum = useQuery(['momentum', userId], ...)
  const shouldShowWidget = useQuery(['show-widget', userId], ...)
  const trackImpression = useMutation(...)
  const trackConversion = useMutation(...)
  
  return {
    momentum,
    shouldShowWidget,
    trackImpression,
    trackConversion
  }
}
```

#### `useEscrow` Hook

```typescript
export function useEscrow(bookingId: string) {
  const escrowStatus = useQuery(['escrow', bookingId], ...)
  const createEscrow = useMutation(...)
  const resolveEscrow = useMutation(...)
  
  return {
    escrowStatus,
    createEscrow,
    resolveEscrow,
    isLoading
  }
}
```

#### `useScenarios` Hook

```typescript
export function useScenarios(userId: string) {
  const [constraints, setConstraints] = useState<ScenarioConstraints>(...)
  const frontier = useQuery(['frontier', userId, constraints], ...)
  const saveSimulation = useMutation(...)
  
  return {
    constraints,
    setConstraints,
    frontier,
    paretoOptimal,
    saveSimulation,
    isCalculating
  }
}
```



## Data Models

### New Database Tables

#### 1. `verification_credentials` Table

Stores cryptographic verification credentials for high-readiness users.

```sql
CREATE TABLE verification_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_type VARCHAR(50) NOT NULL,  -- 'readiness', 'milestone', 'assessment'
    score_value INTEGER NOT NULL CHECK (score_value >= 0 AND score_value <= 100),
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verification_hash VARCHAR(64) NOT NULL UNIQUE,  -- SHA-256 hash for public URL
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    
    -- Tracking
    verification_clicks INTEGER NOT NULL DEFAULT 0,
    last_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    INDEX idx_verification_credentials_user_id (user_id),
    INDEX idx_verification_credentials_hash (verification_hash),
    INDEX idx_verification_credentials_active (is_active, expires_at)
);
```

**SQLAlchemy Model:**
```python
class VerificationCredential(Base):
    __tablename__ = "verification_credentials"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    credential_type: Mapped[str] = mapped_column(String(50), nullable=False)
    score_value: Mapped[int] = mapped_column(Integer, nullable=False)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    verification_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    verification_clicks: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
```

#### 2. `escrow_transactions` Table

Manages performance-bound marketplace payments.

```sql
CREATE TABLE escrow_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    
    -- Amounts
    amount_held NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Release condition (JSONB for flexibility)
    release_condition JSONB NOT NULL,  -- {"type": "readiness_improvement", "min_improvement": 10}
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, released, refunded, disputed
    
    -- Stripe references
    stripe_payment_intent_id VARCHAR(255),
    stripe_transfer_id VARCHAR(255),
    
    -- Readiness tracking
    readiness_before INTEGER,
    readiness_after INTEGER,
    improvement_achieved INTEGER,
    
    -- Resolution
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    INDEX idx_escrow_booking_id (booking_id),
    INDEX idx_escrow_status (status),
    CONSTRAINT chk_escrow_status CHECK (status IN ('pending', 'released', 'refunded', 'disputed'))
);
```

**SQLAlchemy Model:**
```python
class EscrowStatus(str, enum.Enum):
    PENDING = "pending"
    RELEASED = "released"
    REFUNDED = "refunded"
    DISPUTED = "disputed"

class EscrowTransaction(Base):
    __tablename__ = "escrow_transactions"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    booking_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    
    amount_held: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    
    release_condition: Mapped[dict] = mapped_column(JSON, nullable=False)
    status: Mapped[EscrowStatus] = mapped_column(Enum(EscrowStatus), default=EscrowStatus.PENDING, nullable=False, index=True)
    
    stripe_payment_intent_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    stripe_transfer_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    readiness_before: Mapped[int | None] = mapped_column(Integer, nullable=True)
    readiness_after: Mapped[int | None] = mapped_column(Integer, nullable=True)
    improvement_achieved: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    resolution_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
```

#### 3. `scenario_simulations` Table

Stores user scenario simulations and constraint configurations.

```sql
CREATE TABLE scenario_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Constraints (JSONB for flexibility)
    constraints JSONB NOT NULL,  -- {"budget_max": 50000, "time_available_months": 12, ...}
    
    -- Results
    pareto_opportunities JSONB NOT NULL,  -- [opportunity_id, opportunity_id, ...]
    total_opportunities_analyzed INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    simulation_name VARCHAR(200),
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    INDEX idx_scenario_user_id (user_id),
    INDEX idx_scenario_created_at (created_at DESC)
);
```

**SQLAlchemy Model:**
```python
class ScenarioSimulation(Base):
    __tablename__ = "scenario_simulations"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    constraints: Mapped[dict] = mapped_column(JSON, nullable=False)
    pareto_opportunities: Mapped[list] = mapped_column(JSON, nullable=False)
    total_opportunities_analyzed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    simulation_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
```

#### 4. `credential_usage_tracking` Table

Tracks when and where credentials are used in applications.

```sql
CREATE TABLE credential_usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credential_id UUID NOT NULL REFERENCES verification_credentials(id) ON DELETE CASCADE,
    application_id UUID REFERENCES user_applications(id) ON DELETE SET NULL,
    
    -- Usage context
    usage_type VARCHAR(50) NOT NULL,  -- 'application_link', 'profile_share', 'direct_verification'
    shared_with VARCHAR(200),  -- Organization or recipient
    
    -- Outcome tracking
    resulted_in_acceptance BOOLEAN,
    acceptance_date TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    INDEX idx_credential_usage_credential_id (credential_id),
    INDEX idx_credential_usage_application_id (application_id)
);
```

**SQLAlchemy Model:**
```python
class CredentialUsageTracking(Base):
    __tablename__ = "credential_usage_tracking"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    credential_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("verification_credentials.id", ondelete="CASCADE"), nullable=False, index=True)
    application_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("user_applications.id", ondelete="SET NULL"), nullable=True, index=True)
    
    usage_type: Mapped[str] = mapped_column(String(50), nullable=False)
    shared_with: Mapped[str | None] = mapped_column(String(200), nullable=True)
    
    resulted_in_acceptance: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    acceptance_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    used_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
```

#### 5. `opportunity_cost_widget_events` Table

Tracks widget impressions, clicks, and conversions.

```sql
CREATE TABLE opportunity_cost_widget_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    
    -- Event details
    event_type VARCHAR(20) NOT NULL,  -- 'impression', 'click', 'conversion'
    opportunity_cost_shown NUMERIC(10, 2),
    momentum_score INTEGER,
    
    -- Conversion tracking
    upgrade_tier VARCHAR(20),  -- 'pro', 'premium'
    conversion_value NUMERIC(10, 2),
    converted_at TIMESTAMP WITH TIME ZONE,
    
    -- Session tracking
    session_id VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    INDEX idx_widget_events_user_id (user_id),
    INDEX idx_widget_events_type (event_type),
    INDEX idx_widget_events_created_at (created_at DESC)
);
```

**SQLAlchemy Model:**
```python
class WidgetEventType(str, enum.Enum):
    IMPRESSION = "impression"
    CLICK = "click"
    CONVERSION = "conversion"

class OpportunityCostWidgetEvent(Base):
    __tablename__ = "opportunity_cost_widget_events"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("opportunities.id", ondelete="SET NULL"), nullable=True)
    
    event_type: Mapped[WidgetEventType] = mapped_column(Enum(WidgetEventType), nullable=False, index=True)
    opportunity_cost_shown: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    momentum_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    upgrade_tier: Mapped[str | None] = mapped_column(String(20), nullable=True)
    conversion_value: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    converted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    session_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
```

### Schema Extensions to Existing Tables

#### Extensions to `user_psych_profiles`

```sql
ALTER TABLE user_psych_profiles
ADD COLUMN temporal_preference INTEGER CHECK (temporal_preference >= 0 AND temporal_preference <= 100),
ADD COLUMN temporal_preference_updated_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_psych_profiles_temporal ON user_psych_profiles(temporal_preference);
```

#### Extensions to `users`

```sql
ALTER TABLE users
ADD COLUMN momentum_score INTEGER DEFAULT 0,
ADD COLUMN last_momentum_check TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_users_momentum ON users(momentum_score);
```

#### Extensions to `opportunities`

```sql
ALTER TABLE opportunities
ADD COLUMN opportunity_cost_daily NUMERIC(10, 2),
ADD COLUMN target_salary NUMERIC(12, 2),
ADD COLUMN competitiveness_score INTEGER CHECK (competitiveness_score >= 0 AND competitiveness_score <= 100),
ADD COLUMN resource_requirements_score INTEGER CHECK (resource_requirements_score >= 0 AND resource_requirements_score <= 100);

CREATE INDEX idx_opportunities_competitiveness ON opportunities(competitiveness_score);
CREATE INDEX idx_opportunities_resources ON opportunities(resource_requirements_score);
```

#### Extensions to `route_templates`

```sql
ALTER TABLE route_templates
ADD COLUMN recommended_temporal_range_min INTEGER CHECK (recommended_temporal_range_min >= 0 AND recommended_temporal_range_min <= 100),
ADD COLUMN recommended_temporal_range_max INTEGER CHECK (recommended_temporal_range_max >= 0 AND recommended_temporal_range_max <= 100);

CREATE INDEX idx_route_templates_temporal_range ON route_templates(recommended_temporal_range_min, recommended_temporal_range_max);
```

#### Extensions to `service_listings`

```sql
ALTER TABLE service_listings
ADD COLUMN performance_bound BOOLEAN DEFAULT FALSE,
ADD COLUMN performance_success_rate NUMERIC(5, 2) DEFAULT 0.0 CHECK (performance_success_rate >= 0 AND performance_success_rate <= 100);

CREATE INDEX idx_service_listings_performance_bound ON service_listings(performance_bound);
```



## API Endpoints

### Credentials API (`/api/credentials`)

#### `POST /api/credentials/generate`

Generate a new verification credential for a user.

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "credential_type": "readiness",
  "score_value": 85
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "credential_type": "readiness",
  "score_value": 85,
  "issued_at": "2024-01-15T10:30:00Z",
  "expires_at": "2024-04-15T10:30:00Z",
  "verification_url": "https://compass.olcan.com/verify/abc123...",
  "verification_hash": "abc123...",
  "is_active": true
}
```

#### `GET /api/credentials/me`

Get all credentials for the authenticated user.

**Authentication:** Required (JWT)

**Query Parameters:**
- `include_expired` (boolean, default: false)

**Response (200 OK):**
```json
{
  "credentials": [
    {
      "id": "uuid",
      "credential_type": "readiness",
      "score_value": 85,
      "issued_at": "2024-01-15T10:30:00Z",
      "expires_at": "2024-04-15T10:30:00Z",
      "verification_url": "https://compass.olcan.com/verify/abc123...",
      "is_active": true,
      "verification_clicks": 12
    }
  ],
  "total": 1,
  "active_count": 1
}
```

#### `GET /api/credentials/verify/{verification_hash}`

Public endpoint to verify a credential (no authentication required).

**Authentication:** None (public)

**Rate Limit:** 10 requests per IP per hour

**Response (200 OK):**
```json
{
  "credential_type": "readiness",
  "score_value": 85,
  "issued_at": "2024-01-15T10:30:00Z",
  "expires_at": "2024-04-15T10:30:00Z",
  "is_valid": true,
  "user_identifier_hash": "sha256_hash_of_user_id"
}
```

**Response (404 Not Found):**
```json
{
  "detail": "Credencial não encontrada ou expirada"
}
```

#### `POST /api/credentials/{credential_id}/revoke`

Revoke a credential.

**Authentication:** Required (JWT, must be credential owner)

**Response (200 OK):**
```json
{
  "message": "Credencial revogada com sucesso",
  "revoked_at": "2024-01-20T14:00:00Z"
}
```

#### `POST /api/credentials/{credential_id}/track-usage`

Track credential usage in an application.

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "application_id": "uuid",
  "usage_type": "application_link",
  "shared_with": "MIT Graduate Admissions"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "tracked_at": "2024-01-20T15:00:00Z"
}
```

### Temporal Matching API (`/api/temporal-matching`)

#### `GET /api/temporal-matching/preference`

Get the authenticated user's temporal preference score.

**Authentication:** Required (JWT)

**Response (200 OK):**
```json
{
  "temporal_preference": 72,
  "category": "high_urgency",
  "description": "Você prefere rotas com marcos frequentes e resultados rápidos",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### `GET /api/temporal-matching/routes`

Get route recommendations matched to user's temporal preference.

**Authentication:** Required (JWT)

**Query Parameters:**
- `limit` (integer, default: 10)

**Response (200 OK):**
```json
{
  "matched_routes": [
    {
      "route_template_id": "uuid",
      "name_pt": "Bolsa de Mestrado Acelerada",
      "description_pt": "Rota intensiva para mestrado no exterior",
      "match_score": 95,
      "match_reason": "Esta rota combina com seu ritmo",
      "recommended_temporal_range": [60, 90],
      "estimated_duration_months": 8
    }
  ],
  "user_temporal_preference": 72,
  "total_routes": 1
}
```

#### `POST /api/temporal-matching/adjust-milestones`

Adjust milestone density for a user's route based on temporal preference.

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "route_id": "uuid"
}
```

**Response (200 OK):**
```json
{
  "route_id": "uuid",
  "milestones_adjusted": 12,
  "new_milestone_count": 18,
  "adjustment_reason": "Marcos adicionais para alinhar com sua preferência temporal"
}
```

#### `GET /api/temporal-matching/churn-prediction`

Get churn risk prediction for a user-route combination.

**Authentication:** Required (JWT, SUPER_ADMIN only)

**Query Parameters:**
- `user_id` (uuid, required)
- `route_id` (uuid, required)

**Response (200 OK):**
```json
{
  "user_id": "uuid",
  "route_id": "uuid",
  "churn_risk_score": 0.35,
  "risk_level": "medium",
  "temporal_mismatch": 28,
  "recommendation": "Considere intervenção de retenção",
  "predicted_at": "2024-01-20T10:00:00Z"
}
```

### Opportunity Cost API (`/api/opportunity-cost`)

#### `GET /api/opportunity-cost/calculate`

Calculate opportunity cost for a specific opportunity.

**Authentication:** Required (JWT)

**Query Parameters:**
- `opportunity_id` (uuid, required)

**Response (200 OK):**
```json
{
  "opportunity_id": "uuid",
  "opportunity_cost_daily": 328.77,
  "currency": "BRL",
  "target_salary": 120000,
  "current_salary": 0,
  "calculation_date": "2024-01-20T10:00:00Z"
}
```

#### `GET /api/opportunity-cost/momentum`

Get user's current momentum score.

**Authentication:** Required (JWT)

**Response (200 OK):**
```json
{
  "momentum_score": 3,
  "category": "low_momentum",
  "milestones_completed_30d": 1,
  "should_show_widget": true,
  "last_check": "2024-01-20T10:00:00Z"
}
```

#### `POST /api/opportunity-cost/widget/impression`

Track widget impression event.

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "opportunity_id": "uuid",
  "opportunity_cost_shown": 328.77,
  "session_id": "session_abc123"
}
```

**Response (201 Created):**
```json
{
  "event_id": "uuid",
  "tracked_at": "2024-01-20T10:00:00Z"
}
```

#### `POST /api/opportunity-cost/widget/click`

Track widget click event.

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "opportunity_id": "uuid",
  "session_id": "session_abc123"
}
```

**Response (201 Created):**
```json
{
  "event_id": "uuid",
  "tracked_at": "2024-01-20T10:00:00Z"
}
```

#### `POST /api/opportunity-cost/widget/conversion`

Track conversion event (upgrade within 7 days of widget view).

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "upgrade_tier": "premium",
  "conversion_value": 299.00,
  "session_id": "session_abc123"
}
```

**Response (201 Created):**
```json
{
  "event_id": "uuid",
  "conversion_attributed": true,
  "tracked_at": "2024-01-20T10:00:00Z"
}
```

### Escrow API (`/api/escrow`)

#### `POST /api/escrow/create`

Create an escrow transaction for a performance-bound booking.

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "booking_id": "uuid",
  "amount_held": 150.00,
  "currency": "USD",
  "release_condition": {
    "type": "readiness_improvement",
    "min_improvement": 10
  }
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "booking_id": "uuid",
  "amount_held": 150.00,
  "currency": "USD",
  "status": "pending",
  "release_condition": {
    "type": "readiness_improvement",
    "min_improvement": 10
  },
  "created_at": "2024-01-20T10:00:00Z"
}
```

#### `GET /api/escrow/{escrow_id}`

Get escrow transaction details.

**Authentication:** Required (JWT, must be client or provider)

**Response (200 OK):**
```json
{
  "id": "uuid",
  "booking_id": "uuid",
  "amount_held": 150.00,
  "currency": "USD",
  "status": "pending",
  "release_condition": {
    "type": "readiness_improvement",
    "min_improvement": 10
  },
  "readiness_before": 65,
  "readiness_after": null,
  "improvement_achieved": null,
  "created_at": "2024-01-20T10:00:00Z"
}
```

#### `POST /api/escrow/{escrow_id}/resolve`

Resolve an escrow transaction (release or refund).

**Authentication:** Required (JWT, system or admin)

**Response (200 OK):**
```json
{
  "id": "uuid",
  "status": "released",
  "readiness_before": 65,
  "readiness_after": 78,
  "improvement_achieved": 13,
  "resolution": "released_to_provider",
  "resolved_at": "2024-02-20T10:00:00Z"
}
```

#### `GET /api/escrow/booking/{booking_id}`

Get escrow status for a booking.

**Authentication:** Required (JWT)

**Response (200 OK):**
```json
{
  "booking_id": "uuid",
  "has_escrow": true,
  "escrow": {
    "id": "uuid",
    "amount_held": 150.00,
    "status": "pending"
  }
}
```

### Scenario Optimization API (`/api/scenarios`)

#### `POST /api/scenarios/calculate-frontier`

Calculate feasible frontier for given constraints.

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "constraints": {
    "budget_max": 50000,
    "time_available_months": 12,
    "skill_level": 70,
    "target_locations": ["USA", "Canada", "UK"],
    "preferred_industries": ["technology", "research"]
  }
}
```

**Response (200 OK):**
```json
{
  "simulation_id": "uuid",
  "pareto_optimal_opportunities": [
    {
      "opportunity_id": "uuid",
      "title": "MIT Research Fellowship",
      "competitiveness_score": 85,
      "resource_requirements_score": 60,
      "is_pareto_optimal": true
    }
  ],
  "total_opportunities_analyzed": 45,
  "pareto_count": 8,
  "calculated_at": "2024-01-20T10:00:00Z"
}
```

#### `GET /api/scenarios/simulations`

Get user's saved simulations.

**Authentication:** Required (JWT)

**Query Parameters:**
- `limit` (integer, default: 10)
- `offset` (integer, default: 0)

**Response (200 OK):**
```json
{
  "simulations": [
    {
      "id": "uuid",
      "simulation_name": "High Budget Scenario",
      "constraints": {
        "budget_max": 50000,
        "time_available_months": 12
      },
      "pareto_count": 8,
      "created_at": "2024-01-20T10:00:00Z"
    }
  ],
  "total": 1
}
```

#### `GET /api/scenarios/{simulation_id}`

Get detailed simulation results.

**Authentication:** Required (JWT)

**Response (200 OK):**
```json
{
  "id": "uuid",
  "simulation_name": "High Budget Scenario",
  "constraints": {
    "budget_max": 50000,
    "time_available_months": 12,
    "skill_level": 70
  },
  "pareto_opportunities": ["uuid1", "uuid2", "uuid3"],
  "opportunities_detail": [
    {
      "opportunity_id": "uuid1",
      "title": "MIT Research Fellowship",
      "competitiveness_score": 85,
      "resource_requirements_score": 60
    }
  ],
  "total_opportunities_analyzed": 45,
  "created_at": "2024-01-20T10:00:00Z"
}
```

#### `POST /api/scenarios/track-decision`

Track decision quality when user applies to an opportunity.

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "application_id": "uuid",
  "opportunity_id": "uuid",
  "was_pareto_optimal": true
}
```

**Response (201 Created):**
```json
{
  "tracked": true,
  "decision_quality_score": 0.85
}
```

### Admin Analytics API (`/api/admin/economics-intelligence`)

All admin endpoints require `SUPER_ADMIN` role.

#### `GET /api/admin/economics-intelligence/credentials`

Get credentials dashboard metrics.

**Authentication:** Required (JWT, SUPER_ADMIN)

**Query Parameters:**
- `start_date` (ISO date, optional)
- `end_date` (ISO date, optional)

**Response (200 OK):**
```json
{
  "total_issued": 245,
  "active_count": 198,
  "expired_count": 47,
  "revoked_count": 5,
  "verification_clicks": 1234,
  "click_through_rate": 0.18,
  "conversion_attribution": {
    "applications_with_credentials": 89,
    "applications_accepted": 23,
    "conversion_rate": 0.26,
    "improvement_over_baseline": 0.15
  },
  "by_credential_type": {
    "readiness": 180,
    "milestone": 45,
    "assessment": 20
  }
}
```

#### `GET /api/admin/economics-intelligence/temporal`

Get temporal matching dashboard metrics.

**Authentication:** Required (JWT, SUPER_ADMIN)

**Response (200 OK):**
```json
{
  "user_distribution": {
    "low_patience": 120,
    "medium_patience": 450,
    "high_patience": 230
  },
  "churn_by_cohort": {
    "low_patience": 0.15,
    "medium_patience": 0.08,
    "high_patience": 0.05
  },
  "ltv_by_cohort": {
    "low_patience": 450.00,
    "medium_patience": 680.00,
    "high_patience": 920.00
  },
  "temporal_mismatch_alerts": 34,
  "retention_interventions": {
    "triggered": 28,
    "successful": 19,
    "success_rate": 0.68
  }
}
```

#### `GET /api/admin/economics-intelligence/opportunity-cost`

Get opportunity cost widget dashboard metrics.

**Authentication:** Required (JWT, SUPER_ADMIN)

**Response (200 OK):**
```json
{
  "widget_impressions": 1567,
  "widget_clicks": 423,
  "click_through_rate": 0.27,
  "conversions": 89,
  "conversion_rate": 0.21,
  "attributed_revenue": 26471.00,
  "development_cost": 15000.00,
  "roi": 1.76,
  "average_opportunity_cost_shown": 285.50,
  "by_tier": {
    "pro": {
      "conversions": 56,
      "revenue": 11144.00
    },
    "premium": {
      "conversions": 33,
      "revenue": 15327.00
    }
  }
}
```

#### `GET /api/admin/economics-intelligence/marketplace`

Get performance-bound marketplace dashboard metrics.

**Authentication:** Required (JWT, SUPER_ADMIN)

**Response (200 OK):**
```json
{
  "performance_bound_bookings": 156,
  "total_bookings": 523,
  "performance_bound_percentage": 0.30,
  "escrow_release_rate": 0.82,
  "refund_rate": 0.18,
  "average_readiness_improvement": 12.5,
  "total_escrow_value": 23400.00,
  "provider_performance": [
    {
      "provider_id": "uuid",
      "provider_name": "Dr. Silva",
      "success_rate": 0.95,
      "total_bookings": 23,
      "average_improvement": 15.2
    }
  ],
  "revenue_impact": {
    "average_performance_booking_value": 180.00,
    "average_standard_booking_value": 120.00,
    "increase_percentage": 0.50
  }
}
```

#### `GET /api/admin/economics-intelligence/scenarios`

Get scenario simulator dashboard metrics.

**Authentication:** Required (JWT, SUPER_ADMIN)

**Response (200 OK):**
```json
{
  "total_sessions": 892,
  "average_session_duration_seconds": 245,
  "slider_interactions": 3456,
  "interactions_per_session": 3.9,
  "decision_quality_distribution": {
    "0-20": 45,
    "20-40": 123,
    "40-60": 234,
    "60-80": 312,
    "80-100": 178
  },
  "average_decision_quality": 0.68,
  "time_to_first_application": {
    "with_simulator": 12.5,
    "without_simulator": 21.3,
    "reduction_percentage": 0.41
  },
  "pareto_optimal_application_rate": 0.72
}
```

#### `GET /api/admin/economics-intelligence/success-metrics`

Get the five key success metrics.

**Authentication:** Required (JWT, SUPER_ADMIN)

**Response (200 OK):**
```json
{
  "credential_conversion_rate": {
    "current": 0.26,
    "baseline": 0.22,
    "improvement": 0.18,
    "target": 0.15,
    "target_met": true
  },
  "temporal_churn_reduction": {
    "matched_churn_rate": 0.06,
    "baseline_churn_rate": 0.08,
    "reduction": 0.25,
    "target": 0.20,
    "target_met": true
  },
  "opportunity_cost_conversion": {
    "conversion_rate": 0.21,
    "target": 0.25,
    "target_met": false
  },
  "marketplace_booking_value": {
    "performance_bound_avg": 180.00,
    "standard_avg": 120.00,
    "increase": 0.50,
    "target": 0.30,
    "target_met": true
  },
  "decision_paralysis_reduction": {
    "with_simulator_days": 12.5,
    "baseline_days": 21.3,
    "reduction": 0.41,
    "target": 0.40,
    "target_met": true
  },
  "overall_status": "4 of 5 targets met"
}
```



## Background Jobs (Celery Tasks)

### Celery Configuration

**File:** `apps/api/app/core/celery_app.py`

```python
from celery import Celery
from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "compass_economics",
    broker=settings.redis_url,
    backend=settings.redis_url
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes max
    task_soft_time_limit=240,  # 4 minutes soft limit
)
```

### Task Definitions

#### 1. Credential Generation Task

**File:** `apps/api/app/tasks/credentials.py`

```python
from celery import Task
from app.core.celery_app import celery_app
from app.services.credentials import generate_credential
from app.db.session import get_sessionmaker
import uuid

@celery_app.task(bind=True, max_retries=3)
def generate_credential_task(
    self: Task,
    user_id: str,
    credential_type: str,
    score_value: int
) -> dict:
    """
    Gera credencial de verificação quando score de prontidão cruza limiar.
    
    Args:
        user_id: UUID do usuário
        credential_type: Tipo de credencial ('readiness', 'milestone', 'assessment')
        score_value: Valor do score (0-100)
    
    Returns:
        Dict com credential_id e verification_hash
    """
    try:
        sessionmaker = get_sessionmaker()
        async with sessionmaker() as db:
            credential = await generate_credential(
                user_id=uuid.UUID(user_id),
                credential_type=credential_type,
                score_value=score_value,
                db=db
            )
            await db.commit()
            
            return {
                "credential_id": str(credential.id),
                "verification_hash": credential.verification_hash
            }
    except Exception as exc:
        self.retry(exc=exc, countdown=60)
```

**Trigger:** When `ReadinessAssessment.overall_readiness` crosses 80 threshold.

#### 2. Temporal Matching Task

**File:** `apps/api/app/tasks/temporal_matching.py`

```python
@celery_app.task(bind=True, max_retries=3)
def recalculate_temporal_matches_task(
    self: Task,
    user_id: str
) -> dict:
    """
    Recalcula recomendações de rotas baseadas em preferência temporal.
    
    Args:
        user_id: UUID do usuário
    
    Returns:
        Dict com matched_routes count
    """
    try:
        sessionmaker = get_sessionmaker()
        async with sessionmaker() as db:
            # Calculate temporal preference from latest assessment
            temporal_pref = await calculate_temporal_preference(
                user_id=uuid.UUID(user_id),
                db=db
            )
            
            # Update psych profile
            await update_temporal_preference(
                user_id=uuid.UUID(user_id),
                temporal_preference=temporal_pref,
                db=db
            )
            
            # Get matched routes
            matched_routes = await get_matched_routes(
                user_id=uuid.UUID(user_id),
                db=db
            )
            
            await db.commit()
            
            return {
                "temporal_preference": temporal_pref,
                "matched_routes_count": len(matched_routes)
            }
    except Exception as exc:
        self.retry(exc=exc, countdown=60)
```

**Trigger:** When user completes psychology assessment.

#### 3. Opportunity Cost Calculation Task

**File:** `apps/api/app/tasks/opportunity_cost.py`

```python
@celery_app.task(bind=True)
def calculate_opportunity_costs_daily_task(self: Task) -> dict:
    """
    Calcula custos de oportunidade diários para todos os usuários com oportunidades ativas.
    Executa diariamente às 00:00 UTC.
    
    Returns:
        Dict com users_processed count
    """
    try:
        sessionmaker = get_sessionmaker()
        async with sessionmaker() as db:
            # Get all users with active opportunities
            users_with_opportunities = await get_users_with_opportunities(db)
            
            processed_count = 0
            for user_id in users_with_opportunities:
                # Calculate momentum
                momentum = await calculate_user_momentum(user_id, db)
                
                # Update user momentum score
                await update_user_momentum(user_id, momentum, db)
                
                # Calculate opportunity costs for user's opportunities
                await calculate_user_opportunity_costs(user_id, db)
                
                processed_count += 1
            
            await db.commit()
            
            return {
                "users_processed": processed_count,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
    except Exception as exc:
        self.retry(exc=exc, countdown=300)

@celery_app.task(bind=True, max_retries=3)
def check_momentum_and_trigger_widget_task(
    self: Task,
    user_id: str
) -> dict:
    """
    Verifica momentum do usuário e determina se deve mostrar widget.
    
    Args:
        user_id: UUID do usuário
    
    Returns:
        Dict com should_show_widget flag
    """
    try:
        sessionmaker = get_sessionmaker()
        async with sessionmaker() as db:
            momentum = await calculate_user_momentum(uuid.UUID(user_id), db)
            should_show = momentum < 2  # Low momentum threshold
            
            await update_user_momentum(uuid.UUID(user_id), momentum, db)
            await db.commit()
            
            return {
                "user_id": user_id,
                "momentum_score": momentum,
                "should_show_widget": should_show
            }
    except Exception as exc:
        self.retry(exc=exc, countdown=60)
```

**Trigger:** Daily cron job at 00:00 UTC.

#### 4. Escrow Resolution Task

**File:** `apps/api/app/tasks/escrow.py`

```python
@celery_app.task(bind=True, max_retries=3)
def resolve_escrow_task(
    self: Task,
    escrow_id: str,
    booking_id: str
) -> dict:
    """
    Resolve transação de escrow baseada em melhoria de prontidão.
    
    Args:
        escrow_id: UUID da transação de escrow
        booking_id: UUID da reserva
    
    Returns:
        Dict com resolution status
    """
    try:
        sessionmaker = get_sessionmaker()
        async with sessionmaker() as db:
            # Get escrow and booking
            escrow = await get_escrow_by_id(uuid.UUID(escrow_id), db)
            booking = await get_booking_by_id(uuid.UUID(booking_id), db)
            
            # Calculate readiness improvement
            improvement = await calculate_readiness_improvement(
                user_id=booking.client_id,
                booking_id=booking.id,
                db=db
            )
            
            # Check release condition
            min_improvement = escrow.release_condition.get("min_improvement", 10)
            
            if improvement >= min_improvement:
                # Release to provider
                await release_to_provider(escrow.id, booking.provider_id, db)
                resolution = "released"
            else:
                # Refund to client
                await refund_to_client(escrow.id, booking.client_id, db)
                resolution = "refunded"
            
            await db.commit()
            
            return {
                "escrow_id": escrow_id,
                "resolution": resolution,
                "improvement_achieved": improvement,
                "min_improvement_required": min_improvement
            }
    except Exception as exc:
        self.retry(exc=exc, countdown=120)
```

**Trigger:** When performance-bound booking is marked complete (within 5 minutes).

#### 5. Feasible Frontier Computation Task

**File:** `apps/api/app/tasks/scenario_optimization.py`

```python
@celery_app.task(bind=True, max_retries=3)
def calculate_feasible_frontier_task(
    self: Task,
    user_id: str,
    constraints: dict
) -> dict:
    """
    Calcula fronteira viável de oportunidades Pareto-ótimas.
    
    Args:
        user_id: UUID do usuário
        constraints: Dict com budget_max, time_available_months, skill_level, etc.
    
    Returns:
        Dict com simulation_id e pareto_opportunities
    """
    try:
        sessionmaker = get_sessionmaker()
        async with sessionmaker() as db:
            # Get all opportunities matching basic constraints
            opportunities = await get_opportunities_for_constraints(
                constraints=constraints,
                db=db
            )
            
            # Score each opportunity
            scored_opportunities = []
            for opp in opportunities:
                score = await score_opportunity(
                    opportunity_id=opp.id,
                    user_id=uuid.UUID(user_id),
                    db=db
                )
                scored_opportunities.append(score)
            
            # Identify Pareto-optimal opportunities
            pareto_optimal = identify_pareto_optimal(scored_opportunities)
            
            # Save simulation
            simulation = await save_simulation(
                user_id=uuid.UUID(user_id),
                constraints=constraints,
                pareto_opportunities=pareto_optimal,
                total_analyzed=len(opportunities),
                db=db
            )
            
            await db.commit()
            
            return {
                "simulation_id": str(simulation.id),
                "pareto_opportunities": [str(opp_id) for opp_id in pareto_optimal],
                "total_analyzed": len(opportunities)
            }
    except Exception as exc:
        self.retry(exc=exc, countdown=60)
```

**Trigger:** When user accesses Simulador page and no cached result exists from past 24 hours.

### Celery Beat Schedule (Periodic Tasks)

**File:** `apps/api/app/core/celery_beat.py`

```python
from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    'calculate-opportunity-costs-daily': {
        'task': 'app.tasks.opportunity_cost.calculate_opportunity_costs_daily_task',
        'schedule': crontab(hour=0, minute=0),  # Daily at midnight UTC
    },
    'expire-old-credentials': {
        'task': 'app.tasks.credentials.expire_old_credentials_task',
        'schedule': crontab(hour=1, minute=0),  # Daily at 1 AM UTC
    },
    'check-escrow-timeouts': {
        'task': 'app.tasks.escrow.check_escrow_timeouts_task',
        'schedule': crontab(minute='*/30'),  # Every 30 minutes
    },
}
```

### Job Queue Monitoring

Use existing `AIJobQueue` table for tracking:

```python
class EconomicsJobQueue(Base):
    """Extends AIJobQueue pattern for economics tasks"""
    __tablename__ = "economics_job_queue"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    task_name: Mapped[str] = mapped_column(String(100), nullable=False)
    task_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    priority: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    
    payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    result: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    retry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_retries: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
```

## Integration Patterns

### 1. Psychology Engine Integration

**Trigger Point:** `POST /api/psych/assessments/{session_id}/complete`

**Integration Flow:**
```python
# In app/api/routes/psychology.py
@router.post("/assessments/{session_id}/complete")
async def complete_assessment(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Existing logic: calculate scores, update profile
    session = await get_assessment_session(session_id, db)
    scores = await calculate_assessment_scores(session, db)
    await update_psych_profile(current_user.id, scores, db)
    
    # NEW: Trigger temporal matching recalculation
    from app.tasks.temporal_matching import recalculate_temporal_matches_task
    recalculate_temporal_matches_task.delay(str(current_user.id))
    
    # NEW: Check if readiness crossed credential threshold
    if scores.get("overall_readiness", 0) >= 80:
        from app.tasks.credentials import generate_credential_task
        generate_credential_task.delay(
            str(current_user.id),
            "readiness",
            int(scores["overall_readiness"])
        )
    
    await db.commit()
    return {"message": "Avaliação concluída com sucesso", "scores": scores}
```

### 2. Routes Engine Integration

**Display Point:** `GET /api/routes/templates`

**Integration Flow:**
```python
# In app/api/routes/routes.py
@router.get("/templates")
async def get_route_templates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Get user's temporal preference
    psych_profile = await get_psych_profile(current_user.id, db)
    temporal_pref = psych_profile.temporal_preference
    
    # Get all templates
    templates = await get_all_route_templates(db)
    
    # NEW: Filter and rank by temporal match
    if temporal_pref is not None:
        matched_templates = []
        for template in templates:
            if (template.recommended_temporal_range_min and 
                template.recommended_temporal_range_max):
                # Calculate match score
                if (template.recommended_temporal_range_min <= temporal_pref <= 
                    template.recommended_temporal_range_max):
                    match_score = 100
                    match_reason = "Esta rota combina com seu ritmo"
                else:
                    # Calculate distance from range
                    distance = min(
                        abs(temporal_pref - template.recommended_temporal_range_min),
                        abs(temporal_pref - template.recommended_temporal_range_max)
                    )
                    match_score = max(0, 100 - distance)
                    match_reason = "Rota com ritmo diferente do seu perfil"
                
                matched_templates.append({
                    **template.__dict__,
                    "temporal_match_score": match_score,
                    "temporal_match_reason": match_reason
                })
        
        # Sort by match score
        matched_templates.sort(key=lambda x: x["temporal_match_score"], reverse=True)
        return {"templates": matched_templates, "temporal_preference": temporal_pref}
    
    return {"templates": templates}
```

### 3. Applications Engine Integration

**Display Point:** `GET /api/applications/opportunities`

**Integration Flow:**
```python
# In app/api/routes/application.py
@router.get("/opportunities")
async def get_opportunities(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    opportunities = await get_all_opportunities(db)
    
    # NEW: Calculate opportunity costs
    enriched_opportunities = []
    for opp in opportunities:
        opp_dict = opp.__dict__
        
        # Add opportunity cost if target_salary exists
        if opp.target_salary:
            opp_dict["opportunity_cost_daily"] = opp.opportunity_cost_daily
            opp_dict["opportunity_cost_monthly"] = opp.opportunity_cost_daily * 30
        
        # Add competitiveness and resource scores for scenario optimization
        opp_dict["competitiveness_score"] = opp.competitiveness_score
        opp_dict["resource_requirements_score"] = opp.resource_requirements_score
        
        enriched_opportunities.append(opp_dict)
    
    # NEW: Check if should show growth potential widget
    momentum = await get_user_momentum(current_user.id, db)
    should_show_widget = momentum < 2
    
    return {
        "opportunities": enriched_opportunities,
        "show_growth_widget": should_show_widget,
        "user_momentum": momentum
    }
```

### 4. Marketplace Engine Integration

**Display Point:** `GET /api/marketplace/services`

**Integration Flow:**
```python
# In app/api/routes/marketplace.py
@router.get("/services")
async def get_service_listings(
    db: AsyncSession = Depends(get_db)
):
    services = await get_all_service_listings(db)
    
    # NEW: Enrich with performance-bound information
    enriched_services = []
    for service in services:
        service_dict = service.__dict__
        
        if service.performance_bound:
            service_dict["has_performance_guarantee"] = True
            service_dict["performance_success_rate"] = service.performance_success_rate
            service_dict["guarantee_badge_text"] = "Garantia de Resultado"
        else:
            service_dict["has_performance_guarantee"] = False
        
        enriched_services.append(service_dict)
    
    return {"services": enriched_services}

@router.post("/bookings")
async def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Existing logic: create booking
    booking = await create_booking_record(booking_data, current_user.id, db)
    
    # NEW: Create escrow if performance-bound
    service = await get_service_listing(booking_data.service_id, db)
    if service.performance_bound:
        escrow_amount = booking.price_agreed * Decimal("0.30")  # 30% held
        
        from app.tasks.escrow import create_escrow_task
        create_escrow_task.delay(
            str(booking.id),
            float(escrow_amount),
            {"type": "readiness_improvement", "min_improvement": 10}
        )
    
    await db.commit()
    return booking

@router.post("/bookings/{booking_id}/complete")
async def complete_booking(
    booking_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Existing logic: mark booking complete
    booking = await get_booking(booking_id, db)
    booking.status = BookingStatus.COMPLETED
    booking.completed_at = datetime.now(timezone.utc)
    
    # NEW: Trigger escrow resolution if performance-bound
    escrow = await get_escrow_by_booking(booking_id, db)
    if escrow:
        from app.tasks.escrow import resolve_escrow_task
        resolve_escrow_task.apply_async(
            args=[str(escrow.id), str(booking_id)],
            countdown=300  # 5 minutes delay
        )
    
    await db.commit()
    return {"message": "Reserva concluída", "booking_id": str(booking_id)}
```

### 5. Sprints Engine Integration

**Trigger Point:** `POST /api/sprints/tasks/{task_id}/complete`

**Integration Flow:**
```python
# In app/api/routes/sprint.py
@router.post("/tasks/{task_id}/complete")
async def complete_sprint_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Existing logic: mark task complete
    task = await get_sprint_task(task_id, db)
    task.status = SprintTaskStatus.COMPLETED
    task.completed_at = datetime.now(timezone.utc)
    
    # Update sprint progress
    sprint = await get_user_sprint(task.sprint_id, db)
    sprint.completed_tasks += 1
    sprint.completion_percentage = (sprint.completed_tasks / sprint.total_tasks) * 100
    
    # NEW: Recalculate momentum (affects opportunity cost widget)
    from app.tasks.opportunity_cost import check_momentum_and_trigger_widget_task
    check_momentum_and_trigger_widget_task.delay(str(current_user.id))
    
    # NEW: Check if readiness improved (affects credentials and escrow)
    old_readiness = await get_previous_readiness(current_user.id, db)
    new_readiness = await calculate_current_readiness(current_user.id, db)
    
    if new_readiness >= 80 and old_readiness < 80:
        # Crossed credential threshold
        from app.tasks.credentials import generate_credential_task
        generate_credential_task.delay(
            str(current_user.id),
            "milestone",
            int(new_readiness)
        )
    
    await db.commit()
    return {"message": "Tarefa concluída", "sprint_progress": sprint.completion_percentage}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all 87 acceptance criteria, I identified the following redundancies and consolidations:

**Consolidations Made:**
- Properties 1.2 and 1.3 (credential schema and URL generation) can be combined into a single property about credential creation completeness
- Properties 4.7 and 4.8 (escrow release vs refund) are complementary cases of the same resolution logic
- Properties 9.2 and 9.3 (PII exclusion in public URLs) overlap significantly and can be combined
- Properties 11.1, 11.4, and 11.6 (serialization, deserialization, round-trip) - the round-trip property subsumes the individual operations

**Properties Removed as Redundant:**
- Property 1.5 (badge display) is a UI concern that depends on property 1.1 (credential generation)
- Property 3.4 (low momentum classification) is subsumed by property 3.3 (momentum calculation)
- Property 4.4 (escrow record creation) is subsumed by property 4.2 (30% escrow hold)

### Trust Signal System Properties

#### Property 1: Credential Generation Threshold

*For any* user with a readiness score, when the score crosses above 80, the system should generate a verification credential with all required fields (id, user_id, credential_type, score_value, issued_at, expires_at, verification_hash, is_active).

**Validates: Requirements 1.1, 1.2**

#### Property 2: Verification URL Validity

*For any* generated credential, the verification URL should contain a valid SHA-256 hash that can be used to retrieve the credential without exposing PII.

**Validates: Requirements 1.3, 9.1**

#### Property 3: Public Verification Privacy

*For any* valid verification hash, the public verification endpoint response should contain only (credential_type, score_value, issued_at, expires_at, is_valid, user_identifier_hash) and must not contain (user_id, email, full_name).

**Validates: Requirements 1.4, 9.2, 9.3**

#### Property 4: Credential Expiration

*For any* credential, if 90 days have elapsed since issued_at, the credential should be marked as inactive (is_active = false).

**Validates: Requirements 1.6**

#### Property 5: Credential Revocation

*For any* active credential, invoking the revoke operation should set is_active to false and populate revoked_at with the current timestamp.

**Validates: Requirements 1.7**

### Temporal Preference Matching Properties

#### Property 6: Temporal Preference Range

*For any* calculated temporal preference score, the value should be between 0 and 100 inclusive.

**Validates: Requirements 2.2**

#### Property 7: Temporal Preference Persistence

*For any* completed psychology assessment, the calculated temporal preference should be stored in the psych_profiles table and retrievable for the user.

**Validates: Requirements 2.3**

#### Property 8: Route Recommendation Sorting

*For any* user with a temporal preference T, when requesting route recommendations, routes with recommended_temporal_range containing T should be ranked higher than routes where T falls outside the range.

**Validates: Requirements 2.5**

#### Property 9: Milestone Density Adjustment

*For any* route and user with temporal_preference >= 70, the personalized route should have more milestones than the template default (milestone_count_personalized > milestone_count_template).

**Validates: Requirements 2.7**

### Opportunity Cost Intelligence Properties

#### Property 10: Opportunity Cost Calculation

*For any* opportunity with target_salary T and current_salary C, the opportunity_cost_daily should equal (T - C) / 365.

**Validates: Requirements 3.1**

#### Property 11: Opportunity Cost Storage

*For any* opportunity created with a target_salary, the opportunity_cost_daily field should be populated in the database.

**Validates: Requirements 3.2**

#### Property 12: Momentum Calculation

*For any* user, the momentum_score should equal the count of route milestones completed in the past 30 days.

**Validates: Requirements 3.3, 3.4**

#### Property 13: Widget Display Trigger

*For any* user with momentum_score < 2, the should_show_widget flag should be true.

**Validates: Requirements 3.5**

### Performance-Bound Marketplace Properties

#### Property 14: Escrow Amount Calculation

*For any* booking of a performance-bound service with price P, the escrow amount_held should equal P * 0.30 (exactly 30%).

**Validates: Requirements 4.2, 4.4**

#### Property 15: Escrow Release Condition Structure

*For any* escrow transaction, the release_condition JSONB should contain a "type" field and a "min_improvement" field with an integer value.

**Validates: Requirements 4.5**

#### Property 16: Readiness Improvement Calculation

*For any* completed booking with escrow, the improvement_achieved should equal (readiness_after - readiness_before).

**Validates: Requirements 4.6**

#### Property 17: Escrow Resolution Logic

*For any* escrow transaction with improvement_achieved I and min_improvement M:
- If I >= M, then status should be "released"
- If I < M, then status should be "refunded"

**Validates: Requirements 4.7, 4.8**

### Scenario Optimization Properties

#### Property 18: Opportunity Scoring Completeness

*For any* opportunity in the system, it should have both a competitiveness_score (0-100) and a resource_requirements_score (0-100).

**Validates: Requirements 5.2**

#### Property 19: Pareto Optimality Definition

*For any* set of scored opportunities, an opportunity O is in the Pareto-optimal set if and only if there exists no other opportunity O' where:
- O'.competitiveness_score > O.competitiveness_score AND
- O'.resource_requirements_score < O.resource_requirements_score

**Validates: Requirements 5.3**

#### Property 20: Decision Quality Calculation

*For any* user with N total applications and P applications to Pareto-optimal opportunities, the decision_quality score should equal P / N (or 0 if N = 0).

**Validates: Requirements 5.9**

### Constraint Serialization Properties

#### Property 21: Constraints Schema Completeness

*For any* scenario constraints object, it should contain all required fields: budget_max, time_available_months, skill_level, target_locations, preferred_industries.

**Validates: Requirements 11.2**

#### Property 22: Constraints Validation

*For any* constraints object:
- budget_max should be >= 0
- time_available_months should be >= 1 AND <= 60
- skill_level should be >= 0 AND <= 100

**Validates: Requirements 11.3**

#### Property 23: Constraints Serialization Round-Trip

*For any* valid constraints object C, the following should hold:
```
parse(serialize(C)) == C
```
Where serialize converts to JSONB and parse converts back to a typed object.

**Validates: Requirements 11.1, 11.4, 11.6**

#### Property 24: Constraints Pretty Printing

*For any* valid constraints object, the pretty_print function should produce a Portuguese string containing all constraint values in human-readable format.

**Validates: Requirements 11.5**

### Testing Strategy

#### Dual Testing Approach

The economics-driven intelligence features require both unit tests and property-based tests:

**Unit Tests** (using pytest):
- Specific examples of credential generation at exactly score 80
- Edge cases: expired credentials, revoked credentials, missing fields
- Integration tests for Stripe Connect escrow flows
- API endpoint response format validation
- Database migration verification
- Error handling for invalid inputs

**Property-Based Tests** (using Hypothesis):
- All 24 correctness properties listed above
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number

#### Property-Based Testing Configuration

**Library:** Hypothesis (Python) for backend, fast-check (TypeScript) for frontend

**Backend Example:**
```python
from hypothesis import given, strategies as st
import pytest

@given(
    readiness_score=st.integers(min_value=0, max_value=100)
)
def test_property_1_credential_generation_threshold(readiness_score):
    """
    Feature: economics-driven-intelligence, Property 1
    For any user with readiness score above 80, credential should be generated
    """
    user = create_test_user()
    update_readiness_score(user.id, readiness_score)
    
    credentials = get_user_credentials(user.id)
    
    if readiness_score > 80:
        assert len(credentials) > 0
        credential = credentials[0]
        assert credential.score_value == readiness_score
        assert credential.verification_hash is not None
        assert len(credential.verification_hash) == 64  # SHA-256
    else:
        # Below threshold, no automatic credential
        assert len([c for c in credentials if c.credential_type == "readiness"]) == 0
```

**Frontend Example:**
```typescript
import fc from 'fast-check';

describe('Property 23: Constraints Serialization Round-Trip', () => {
  it('should preserve constraints through serialize/parse cycle', () => {
    fc.assert(
      fc.property(
        fc.record({
          budget_max: fc.float({ min: 0, max: 1000000 }),
          time_available_months: fc.integer({ min: 1, max: 60 }),
          skill_level: fc.integer({ min: 0, max: 100 }),
          target_locations: fc.array(fc.string(), { minLength: 1 }),
          preferred_industries: fc.array(fc.string(), { minLength: 1 })
        }),
        (constraints) => {
          const serialized = serializeConstraints(constraints);
          const parsed = parseConstraints(serialized);
          
          expect(parsed).toEqual(constraints);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### Test Organization

**Backend Tests:**
- `apps/api/tests/property/test_credentials.py`
- `apps/api/tests/property/test_temporal_matching.py`
- `apps/api/tests/property/test_opportunity_cost.py`
- `apps/api/tests/property/test_escrow.py`
- `apps/api/tests/property/test_scenario_optimization.py`
- `apps/api/tests/property/test_constraints.py`

**Frontend Tests:**
- `apps/web/src/__tests__/property/constraints.test.ts`
- `apps/web/src/__tests__/property/scenario-optimization.test.ts`

#### Coverage Goals

- Unit test coverage: 80% minimum for new code
- Property test coverage: 100% of identified properties
- Integration test coverage: All API endpoints
- E2E test coverage: Critical user flows (credential sharing, escrow resolution, scenario simulation)



## Error Handling

### Error Categories

#### 1. Validation Errors (400 Bad Request)

**Scenarios:**
- Invalid credential type (not in: readiness, milestone, assessment)
- Score value out of range (< 0 or > 100)
- Invalid temporal preference range (min > max)
- Negative budget or invalid time range in constraints
- Missing required fields in request body

**Response Format:**
```json
{
  "detail": "Valor de score inválido. Deve estar entre 0 e 100.",
  "error_code": "INVALID_SCORE_VALUE",
  "field": "score_value",
  "received_value": 150
}
```

#### 2. Authentication Errors (401 Unauthorized)

**Scenarios:**
- Missing JWT token
- Expired JWT token
- Invalid JWT signature

**Response Format:**
```json
{
  "detail": "Token de autenticação inválido ou expirado",
  "error_code": "INVALID_TOKEN"
}
```

#### 3. Authorization Errors (403 Forbidden)

**Scenarios:**
- Non-admin accessing admin endpoints
- User accessing another user's credentials
- Provider accessing client-only escrow details

**Response Format:**
```json
{
  "detail": "Você não tem permissão para acessar este recurso",
  "error_code": "INSUFFICIENT_PERMISSIONS",
  "required_role": "SUPER_ADMIN"
}
```

#### 4. Not Found Errors (404 Not Found)

**Scenarios:**
- Credential not found or expired
- Escrow transaction not found
- Simulation not found
- Opportunity not found

**Response Format:**
```json
{
  "detail": "Credencial não encontrada ou expirada",
  "error_code": "CREDENTIAL_NOT_FOUND",
  "credential_id": "uuid"
}
```

#### 5. Rate Limit Errors (429 Too Many Requests)

**Scenarios:**
- Verification URL accessed more than 10 times per hour from same IP
- Widget impression tracking exceeding limits

**Response Format:**
```json
{
  "detail": "Limite de requisições excedido. Tente novamente em 30 minutos.",
  "error_code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 1800
}
```

#### 6. External Service Errors (502 Bad Gateway)

**Scenarios:**
- Stripe Connect API failure
- Redis connection failure
- Celery queue unavailable

**Response Format:**
```json
{
  "detail": "Erro ao processar pagamento. Tente novamente em alguns minutos.",
  "error_code": "PAYMENT_SERVICE_ERROR",
  "service": "stripe"
}
```

#### 7. Background Job Errors

**Scenarios:**
- Credential generation task fails after 3 retries
- Escrow resolution task timeout
- Frontier calculation exceeds time limit

**Handling:**
- Log error with full context to monitoring system
- Send alert to admin dashboard
- Store error in `economics_job_queue` table
- For user-facing operations, show graceful fallback

**Example:**
```python
try:
    result = await calculate_feasible_frontier(user_id, constraints, db)
except TimeoutError:
    logger.error(f"Frontier calculation timeout for user {user_id}")
    # Return cached result if available
    cached = await get_cached_frontier(user_id, db)
    if cached:
        return {"frontier": cached, "is_cached": True}
    else:
        raise HTTPException(
            status_code=503,
            detail="Cálculo em andamento. Tente novamente em alguns minutos."
        )
```

### Error Recovery Strategies

#### Idempotent Operations

All POST endpoints that create resources should be idempotent:

```python
@router.post("/credentials/generate")
async def generate_credential(
    data: CredentialCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if credential already exists for this score
    existing = await get_credential_by_type_and_score(
        user_id=current_user.id,
        credential_type=data.credential_type,
        score_value=data.score_value,
        db=db
    )
    
    if existing and existing.is_active:
        # Return existing credential instead of creating duplicate
        return existing
    
    # Create new credential
    credential = await create_credential(current_user.id, data, db)
    await db.commit()
    return credential
```

#### Graceful Degradation

When background services are unavailable, provide cached or approximate results:

```python
async def get_temporal_matched_routes(user_id: UUID, db: AsyncSession):
    try:
        # Try to get fresh calculation
        routes = await calculate_matched_routes(user_id, db)
        return {"routes": routes, "is_fresh": True}
    except Exception as e:
        logger.warning(f"Fresh calculation failed: {e}")
        # Fall back to cached results
        cached = await get_cached_matched_routes(user_id, db)
        if cached:
            return {"routes": cached, "is_fresh": False, "cached_at": cached.created_at}
        else:
            # Ultimate fallback: return all routes without matching
            all_routes = await get_all_route_templates(db)
            return {"routes": all_routes, "is_fresh": False, "matched": False}
```

#### Transaction Rollback

All database operations should use transactions with proper rollback:

```python
async def create_escrow_with_booking(
    booking_data: BookingCreate,
    user_id: UUID,
    db: AsyncSession
):
    try:
        # Start transaction
        booking = await create_booking(booking_data, user_id, db)
        
        if booking_data.is_performance_bound:
            escrow = await create_escrow(booking.id, booking.price_agreed * 0.30, db)
            
            # Call Stripe API
            stripe_intent = await stripe.create_payment_intent(
                amount=booking.price_agreed,
                metadata={"booking_id": str(booking.id), "escrow_id": str(escrow.id)}
            )
            
            escrow.stripe_payment_intent_id = stripe_intent.id
        
        await db.commit()
        return booking
        
    except StripeError as e:
        await db.rollback()
        logger.error(f"Stripe error during booking creation: {e}")
        raise HTTPException(
            status_code=502,
            detail="Erro ao processar pagamento. Tente novamente."
        )
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error during booking creation: {e}")
        raise
```

## Security Considerations

### Authentication and Authorization

#### JWT Token Validation

All economics endpoints require valid JWT tokens:

```python
from app.core.auth import get_current_user

@router.get("/credentials/me")
async def get_my_credentials(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # current_user is guaranteed to be authenticated
    credentials = await get_user_credentials(current_user.id, db)
    return {"credentials": credentials}
```

#### Role-Based Access Control

Admin endpoints require SUPER_ADMIN role:

```python
from app.core.auth import require_role

@router.get("/admin/economics-intelligence/credentials")
async def get_credentials_dashboard(
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    metrics = await calculate_credentials_metrics(db)
    return metrics
```

#### Resource Ownership Validation

Users can only access their own resources:

```python
@router.post("/credentials/{credential_id}/revoke")
async def revoke_credential(
    credential_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    credential = await get_credential(credential_id, db)
    
    if not credential:
        raise HTTPException(status_code=404, detail="Credencial não encontrada")
    
    if credential.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Você não tem permissão para revogar esta credencial"
        )
    
    await revoke_credential_record(credential, db)
    await db.commit()
    return {"message": "Credencial revogada com sucesso"}
```

### Data Protection

#### PII Hashing

User identifiers in public credentials are hashed:

```python
import hashlib

def hash_user_identifier(user_id: UUID) -> str:
    """Hash user ID using SHA-256 for public display"""
    return hashlib.sha256(str(user_id).encode()).hexdigest()

async def create_verification_credential(
    user_id: UUID,
    score_value: int,
    db: AsyncSession
) -> VerificationCredential:
    verification_hash = hashlib.sha256(
        f"{user_id}:{score_value}:{datetime.now().isoformat()}".encode()
    ).hexdigest()
    
    credential = VerificationCredential(
        user_id=user_id,
        score_value=score_value,
        verification_hash=verification_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(days=90)
    )
    
    db.add(credential)
    return credential
```

#### Escrow Data Encryption

Sensitive escrow data encrypted at rest using PostgreSQL pgcrypto:

```sql
-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive fields
CREATE TABLE escrow_transactions (
    id UUID PRIMARY KEY,
    booking_id UUID NOT NULL,
    amount_held NUMERIC(10, 2) NOT NULL,
    -- Encrypt release condition
    release_condition_encrypted BYTEA,
    -- Encrypt Stripe IDs
    stripe_payment_intent_id_encrypted BYTEA,
    ...
);

-- Encryption functions
CREATE OR REPLACE FUNCTION encrypt_field(data TEXT, key TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(data, key);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrypt_field(data BYTEA, key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(data, key);
END;
$$ LANGUAGE plpgsql;
```

**Application Layer:**
```python
from app.core.config import get_settings

settings = get_settings()

async def create_escrow(
    booking_id: UUID,
    amount: Decimal,
    release_condition: dict,
    db: AsyncSession
) -> EscrowTransaction:
    # Encrypt sensitive data
    encrypted_condition = await db.execute(
        text("SELECT encrypt_field(:data, :key)"),
        {"data": json.dumps(release_condition), "key": settings.encryption_key}
    )
    
    escrow = EscrowTransaction(
        booking_id=booking_id,
        amount_held=amount,
        release_condition_encrypted=encrypted_condition.scalar()
    )
    
    db.add(escrow)
    return escrow
```

#### Rate Limiting

Prevent abuse of public verification endpoint:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.get("/credentials/verify/{verification_hash}")
@limiter.limit("10/hour")
async def verify_credential_public(
    verification_hash: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    credential = await get_credential_by_hash(verification_hash, db)
    
    if not credential or not credential.is_active:
        raise HTTPException(status_code=404, detail="Credencial não encontrada ou expirada")
    
    # Track verification click
    await track_verification_click(
        credential.id,
        get_remote_address(request),
        db
    )
    
    return {
        "credential_type": credential.credential_type,
        "score_value": credential.score_value,
        "issued_at": credential.issued_at,
        "expires_at": credential.expires_at,
        "is_valid": True,
        "user_identifier_hash": hash_user_identifier(credential.user_id)
    }
```

### Input Validation

#### Pydantic Schemas

All request bodies validated using Pydantic:

```python
from pydantic import BaseModel, Field, validator

class CredentialCreate(BaseModel):
    credential_type: str = Field(..., regex="^(readiness|milestone|assessment)$")
    score_value: int = Field(..., ge=0, le=100)
    
    @validator('credential_type')
    def validate_credential_type(cls, v):
        allowed = ['readiness', 'milestone', 'assessment']
        if v not in allowed:
            raise ValueError(f'credential_type deve ser um de: {", ".join(allowed)}')
        return v

class ScenarioConstraints(BaseModel):
    budget_max: Decimal = Field(..., ge=0, description="Orçamento máximo em moeda local")
    time_available_months: int = Field(..., ge=1, le=60, description="Meses disponíveis")
    skill_level: int = Field(..., ge=0, le=100, description="Nível de habilidade")
    target_locations: list[str] = Field(..., min_items=1, description="Países alvo")
    preferred_industries: list[str] = Field(..., min_items=1, description="Indústrias preferidas")
    
    @validator('target_locations', 'preferred_industries')
    def validate_non_empty_strings(cls, v):
        if any(not item.strip() for item in v):
            raise ValueError('Todos os itens devem ser strings não vazias')
        return v
```

#### SQL Injection Prevention

Use parameterized queries with SQLAlchemy:

```python
# GOOD: Parameterized query
async def get_credentials_by_type(
    user_id: UUID,
    credential_type: str,
    db: AsyncSession
) -> list[VerificationCredential]:
    result = await db.execute(
        select(VerificationCredential)
        .where(VerificationCredential.user_id == user_id)
        .where(VerificationCredential.credential_type == credential_type)
    )
    return result.scalars().all()

# BAD: String interpolation (never do this)
# query = f"SELECT * FROM credentials WHERE user_id = '{user_id}'"
```

### LGPD Compliance

#### Data Export

Users can export all their economics data:

```python
@router.get("/me/economics-data/export")
async def export_economics_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    data = {
        "credentials": await get_user_credentials(current_user.id, db),
        "temporal_preference": await get_temporal_preference(current_user.id, db),
        "momentum_score": await get_momentum_score(current_user.id, db),
        "widget_events": await get_widget_events(current_user.id, db),
        "simulations": await get_user_simulations(current_user.id, db),
        "escrow_transactions": await get_user_escrow_transactions(current_user.id, db)
    }
    
    return {
        "user_id": str(current_user.id),
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "data": data
    }
```

#### Data Deletion

Users can request deletion of economics data:

```python
@router.delete("/me/economics-data")
async def delete_economics_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Delete all economics-related data
    await delete_user_credentials(current_user.id, db)
    await delete_user_widget_events(current_user.id, db)
    await delete_user_simulations(current_user.id, db)
    
    # Anonymize escrow transactions (keep for financial records)
    await anonymize_user_escrow_transactions(current_user.id, db)
    
    # Clear temporal preference
    await clear_temporal_preference(current_user.id, db)
    
    await db.commit()
    
    return {"message": "Dados de inteligência econômica removidos com sucesso"}
```

## Performance Optimizations

### Database Indexing

#### Strategic Indexes

```sql
-- Credentials: Fast lookup by user and hash
CREATE INDEX idx_verification_credentials_user_id ON verification_credentials(user_id);
CREATE INDEX idx_verification_credentials_hash ON verification_credentials(verification_hash);
CREATE INDEX idx_verification_credentials_active ON verification_credentials(is_active, expires_at);

-- Escrow: Fast lookup by booking and status
CREATE INDEX idx_escrow_booking_id ON escrow_transactions(booking_id);
CREATE INDEX idx_escrow_status ON escrow_transactions(status);
CREATE INDEX idx_escrow_created_at ON escrow_transactions(created_at DESC);

-- Simulations: Fast lookup by user and recency
CREATE INDEX idx_scenario_user_id ON scenario_simulations(user_id);
CREATE INDEX idx_scenario_created_at ON scenario_simulations(created_at DESC);

-- Widget events: Fast analytics queries
CREATE INDEX idx_widget_events_user_id ON opportunity_cost_widget_events(user_id);
CREATE INDEX idx_widget_events_type ON opportunity_cost_widget_events(event_type);
CREATE INDEX idx_widget_events_created_at ON opportunity_cost_widget_events(created_at DESC);

-- Opportunities: Fast filtering for scenario optimization
CREATE INDEX idx_opportunities_competitiveness ON opportunities(competitiveness_score);
CREATE INDEX idx_opportunities_resources ON opportunities(resource_requirements_score);
CREATE INDEX idx_opportunities_composite ON opportunities(competitiveness_score, resource_requirements_score);

-- Temporal matching: Fast route lookup
CREATE INDEX idx_route_templates_temporal_range ON route_templates(recommended_temporal_range_min, recommended_temporal_range_max);
CREATE INDEX idx_psych_profiles_temporal ON user_psych_profiles(temporal_preference);
```

### Caching Strategy

#### Redis Caching

**Cache Keys:**
```
credentials:{user_id}:active
temporal_preference:{user_id}
momentum:{user_id}
frontier:{user_id}:{constraints_hash}
matched_routes:{user_id}
```

**Implementation:**
```python
import redis.asyncio as redis
from app.core.config import get_settings

settings = get_settings()
redis_client = redis.from_url(settings.redis_url)

async def get_user_credentials_cached(user_id: UUID, db: AsyncSession):
    cache_key = f"credentials:{user_id}:active"
    
    # Try cache first
    cached = await redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Cache miss: query database
    credentials = await get_user_credentials(user_id, db)
    
    # Store in cache for 5 minutes
    await redis_client.setex(
        cache_key,
        300,
        json.dumps([c.dict() for c in credentials])
    )
    
    return credentials

async def invalidate_credentials_cache(user_id: UUID):
    """Invalidate cache when credentials change"""
    cache_key = f"credentials:{user_id}:active"
    await redis_client.delete(cache_key)
```

#### React Query Caching

**Frontend caching with stale-while-revalidate:**
```typescript
export function useCredentials(userId: string) {
  return useQuery(
    ['credentials', userId],
    () => api.get(`/credentials/me`),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    }
  );
}

export function useTemporalMatching(userId: string) {
  return useQuery(
    ['temporal-routes', userId],
    () => api.get(`/temporal-matching/routes`),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    }
  );
}

export function useFeasibleFrontier(userId: string, constraints: ScenarioConstraints) {
  const constraintsHash = hashConstraints(constraints);
  
  return useQuery(
    ['frontier', userId, constraintsHash],
    () => api.post(`/scenarios/calculate-frontier`, { constraints }),
    {
      staleTime: 24 * 60 * 60 * 1000, // 24 hours
      cacheTime: 48 * 60 * 60 * 1000, // 48 hours
      enabled: !!constraints,
    }
  );
}
```

### Query Optimization

#### Eager Loading

Avoid N+1 queries with SQLAlchemy eager loading:

```python
from sqlalchemy.orm import selectinload

async def get_escrow_with_booking(escrow_id: UUID, db: AsyncSession):
    result = await db.execute(
        select(EscrowTransaction)
        .options(selectinload(EscrowTransaction.booking))
        .where(EscrowTransaction.id == escrow_id)
    )
    return result.scalar_one_or_none()

async def get_opportunities_with_applications(user_id: UUID, db: AsyncSession):
    result = await db.execute(
        select(Opportunity)
        .options(selectinload(Opportunity.user_applications))
        .where(Opportunity.user_applications.any(UserApplication.user_id == user_id))
    )
    return result.scalars().all()
```

#### Pagination

Paginate large result sets:

```python
from fastapi import Query

@router.get("/admin/economics-intelligence/widget-events")
async def get_widget_events(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(OpportunityCostWidgetEvent)
        .order_by(OpportunityCostWidgetEvent.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    events = result.scalars().all()
    
    # Get total count
    count_result = await db.execute(
        select(func.count(OpportunityCostWidgetEvent.id))
    )
    total = count_result.scalar()
    
    return {
        "events": events,
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total
    }
```

### Background Job Optimization

#### Batch Processing

Process multiple items in single job:

```python
@celery_app.task
def calculate_opportunity_costs_batch_task(user_ids: list[str]) -> dict:
    """Process multiple users in single task to reduce overhead"""
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as db:
        processed = 0
        for user_id in user_ids:
            await calculate_user_opportunity_costs(uuid.UUID(user_id), db)
            processed += 1
        
        await db.commit()
        return {"users_processed": processed}

# Schedule batch job instead of individual jobs
user_ids = await get_users_with_opportunities(db)
batch_size = 100
for i in range(0, len(user_ids), batch_size):
    batch = user_ids[i:i+batch_size]
    calculate_opportunity_costs_batch_task.delay([str(uid) for uid in batch])
```

#### Job Prioritization

Use Celery priorities for time-sensitive tasks:

```python
# High priority: User-facing operations
generate_credential_task.apply_async(
    args=[user_id, "readiness", 85],
    priority=9
)

# Medium priority: Background calculations
recalculate_temporal_matches_task.apply_async(
    args=[user_id],
    priority=5
)

# Low priority: Analytics and reporting
calculate_opportunity_costs_daily_task.apply_async(
    priority=1
)
```

### Frontend Performance

#### Code Splitting

Lazy load economics features:

```typescript
// In App.tsx
const Simulator = lazy(() => import('./pages/Applications/Simulator'));
const EconomicsAdmin = lazy(() => import('./pages/Admin/EconomicsIntelligence'));

<Route
  path="/applications/simulator"
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <Simulator />
    </Suspense>
  }
/>
```

#### Debounced Slider Updates

Prevent excessive API calls during constraint adjustment:

```typescript
import { useDebouncedCallback } from 'use-debounce';

export function ScenarioSimulator() {
  const [constraints, setConstraints] = useState<ScenarioConstraints>(defaultConstraints);
  
  const debouncedCalculate = useDebouncedCallback(
    (newConstraints: ScenarioConstraints) => {
      calculateFrontier.mutate(newConstraints);
    },
    500 // Wait 500ms after user stops adjusting
  );
  
  const handleSliderChange = (field: string, value: number) => {
    const newConstraints = { ...constraints, [field]: value };
    setConstraints(newConstraints);
    debouncedCalculate(newConstraints);
  };
  
  return (
    <div>
      <Slider
        value={constraints.budget_max}
        onChange={(value) => handleSliderChange('budget_max', value)}
      />
    </div>
  );
}
```

#### Virtualized Lists

Use virtualization for large opportunity lists:

```typescript
import { FixedSizeList } from 'react-window';

export function OpportunityList({ opportunities }: { opportunities: Opportunity[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <OpportunityCard opportunity={opportunities[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={opportunities.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```



## Deployment Strategy

### Database Migrations

#### Migration Sequence

Migrations must be applied in order to maintain referential integrity:

**Migration 0011: Add Economics Base Tables**
```bash
alembic revision -m "add_economics_base_tables"
```

```python
"""add_economics_base_tables

Revision ID: 0011
Revises: 0010
Create Date: 2024-01-20 10:00:00
"""

def upgrade():
    # Create verification_credentials table
    op.create_table(
        'verification_credentials',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('credential_type', sa.String(50), nullable=False),
        sa.Column('score_value', sa.Integer(), nullable=False),
        sa.Column('issued_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('verification_hash', sa.String(64), nullable=False, unique=True),
        sa.Column('is_active', sa.Boolean(), default=True, nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('verification_clicks', sa.Integer(), default=0, nullable=False),
        sa.Column('last_verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.CheckConstraint('score_value >= 0 AND score_value <= 100', name='chk_score_range')
    )
    
    op.create_index('idx_verification_credentials_user_id', 'verification_credentials', ['user_id'])
    op.create_index('idx_verification_credentials_hash', 'verification_credentials', ['verification_hash'])
    op.create_index('idx_verification_credentials_active', 'verification_credentials', ['is_active', 'expires_at'])
    
    # Create escrow_transactions table
    op.create_table(
        'escrow_transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('booking_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('amount_held', sa.Numeric(10, 2), nullable=False),
        sa.Column('currency', sa.String(3), default='USD', nullable=False),
        sa.Column('release_condition', postgresql.JSONB(), nullable=False),
        sa.Column('status', sa.String(20), default='pending', nullable=False),
        sa.Column('stripe_payment_intent_id', sa.String(255), nullable=True),
        sa.Column('stripe_transfer_id', sa.String(255), nullable=True),
        sa.Column('readiness_before', sa.Integer(), nullable=True),
        sa.Column('readiness_after', sa.Integer(), nullable=True),
        sa.Column('improvement_achieved', sa.Integer(), nullable=True),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolution_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
        sa.CheckConstraint("status IN ('pending', 'released', 'refunded', 'disputed')", name='chk_escrow_status')
    )
    
    op.create_index('idx_escrow_booking_id', 'escrow_transactions', ['booking_id'])
    op.create_index('idx_escrow_status', 'escrow_transactions', ['status'])
    
    # Create scenario_simulations table
    op.create_table(
        'scenario_simulations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('constraints', postgresql.JSONB(), nullable=False),
        sa.Column('pareto_opportunities', postgresql.JSONB(), nullable=False),
        sa.Column('total_opportunities_analyzed', sa.Integer(), default=0, nullable=False),
        sa.Column('simulation_name', sa.String(200), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )
    
    op.create_index('idx_scenario_user_id', 'scenario_simulations', ['user_id'])
    op.create_index('idx_scenario_created_at', 'scenario_simulations', [sa.text('created_at DESC')])
    
    # Create credential_usage_tracking table
    op.create_table(
        'credential_usage_tracking',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('credential_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('application_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('usage_type', sa.String(50), nullable=False),
        sa.Column('shared_with', sa.String(200), nullable=True),
        sa.Column('resulted_in_acceptance', sa.Boolean(), nullable=True),
        sa.Column('acceptance_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('used_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['credential_id'], ['verification_credentials.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['application_id'], ['user_applications.id'], ondelete='SET NULL')
    )
    
    op.create_index('idx_credential_usage_credential_id', 'credential_usage_tracking', ['credential_id'])
    op.create_index('idx_credential_usage_application_id', 'credential_usage_tracking', ['application_id'])
    
    # Create opportunity_cost_widget_events table
    op.create_table(
        'opportunity_cost_widget_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('opportunity_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('event_type', sa.String(20), nullable=False),
        sa.Column('opportunity_cost_shown', sa.Numeric(10, 2), nullable=True),
        sa.Column('momentum_score', sa.Integer(), nullable=True),
        sa.Column('upgrade_tier', sa.String(20), nullable=True),
        sa.Column('conversion_value', sa.Numeric(10, 2), nullable=True),
        sa.Column('converted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('session_id', sa.String(100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['opportunity_id'], ['opportunities.id'], ondelete='SET NULL')
    )
    
    op.create_index('idx_widget_events_user_id', 'opportunity_cost_widget_events', ['user_id'])
    op.create_index('idx_widget_events_type', 'opportunity_cost_widget_events', ['event_type'])
    op.create_index('idx_widget_events_created_at', 'opportunity_cost_widget_events', [sa.text('created_at DESC')])

def downgrade():
    op.drop_table('opportunity_cost_widget_events')
    op.drop_table('credential_usage_tracking')
    op.drop_table('scenario_simulations')
    op.drop_table('escrow_transactions')
    op.drop_table('verification_credentials')
```

**Migration 0012: Extend Existing Tables**
```python
"""extend_existing_tables_for_economics

Revision ID: 0012
Revises: 0011
Create Date: 2024-01-20 11:00:00
"""

def upgrade():
    # Extend user_psych_profiles
    op.add_column('user_psych_profiles', sa.Column('temporal_preference', sa.Integer(), nullable=True))
    op.add_column('user_psych_profiles', sa.Column('temporal_preference_updated_at', sa.DateTime(timezone=True), nullable=True))
    op.create_index('idx_psych_profiles_temporal', 'user_psych_profiles', ['temporal_preference'])
    op.create_check_constraint('chk_temporal_preference_range', 'user_psych_profiles', 'temporal_preference >= 0 AND temporal_preference <= 100')
    
    # Extend users
    op.add_column('users', sa.Column('momentum_score', sa.Integer(), default=0, nullable=True))
    op.add_column('users', sa.Column('last_momentum_check', sa.DateTime(timezone=True), nullable=True))
    op.create_index('idx_users_momentum', 'users', ['momentum_score'])
    
    # Extend opportunities
    op.add_column('opportunities', sa.Column('opportunity_cost_daily', sa.Numeric(10, 2), nullable=True))
    op.add_column('opportunities', sa.Column('target_salary', sa.Numeric(12, 2), nullable=True))
    op.add_column('opportunities', sa.Column('competitiveness_score', sa.Integer(), nullable=True))
    op.add_column('opportunities', sa.Column('resource_requirements_score', sa.Integer(), nullable=True))
    op.create_index('idx_opportunities_competitiveness', 'opportunities', ['competitiveness_score'])
    op.create_index('idx_opportunities_resources', 'opportunities', ['resource_requirements_score'])
    op.create_check_constraint('chk_competitiveness_range', 'opportunities', 'competitiveness_score >= 0 AND competitiveness_score <= 100')
    op.create_check_constraint('chk_resources_range', 'opportunities', 'resource_requirements_score >= 0 AND resource_requirements_score <= 100')
    
    # Extend route_templates
    op.add_column('route_templates', sa.Column('recommended_temporal_range_min', sa.Integer(), nullable=True))
    op.add_column('route_templates', sa.Column('recommended_temporal_range_max', sa.Integer(), nullable=True))
    op.create_index('idx_route_templates_temporal_range', 'route_templates', ['recommended_temporal_range_min', 'recommended_temporal_range_max'])
    op.create_check_constraint('chk_temporal_range_min', 'route_templates', 'recommended_temporal_range_min >= 0 AND recommended_temporal_range_min <= 100')
    op.create_check_constraint('chk_temporal_range_max', 'route_templates', 'recommended_temporal_range_max >= 0 AND recommended_temporal_range_max <= 100')
    
    # Extend service_listings
    op.add_column('service_listings', sa.Column('performance_bound', sa.Boolean(), default=False, nullable=True))
    op.add_column('service_listings', sa.Column('performance_success_rate', sa.Numeric(5, 2), default=0.0, nullable=True))
    op.create_index('idx_service_listings_performance_bound', 'service_listings', ['performance_bound'])
    op.create_check_constraint('chk_performance_success_rate', 'service_listings', 'performance_success_rate >= 0 AND performance_success_rate <= 100')

def downgrade():
    # Remove extensions in reverse order
    op.drop_column('service_listings', 'performance_success_rate')
    op.drop_column('service_listings', 'performance_bound')
    op.drop_column('route_templates', 'recommended_temporal_range_max')
    op.drop_column('route_templates', 'recommended_temporal_range_min')
    op.drop_column('opportunities', 'resource_requirements_score')
    op.drop_column('opportunities', 'competitiveness_score')
    op.drop_column('opportunities', 'target_salary')
    op.drop_column('opportunities', 'opportunity_cost_daily')
    op.drop_column('users', 'last_momentum_check')
    op.drop_column('users', 'momentum_score')
    op.drop_column('user_psych_profiles', 'temporal_preference_updated_at')
    op.drop_column('user_psych_profiles', 'temporal_preference')
```

### Environment Configuration

Add to `.env.example`:

```bash
# Economics Intelligence Features
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# Stripe Connect (for escrow)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Encryption
ENCRYPTION_KEY=your-32-byte-encryption-key-here

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_STORAGE_URL=redis://redis:6379/1

# Feature Flags
FEATURE_CREDENTIALS_ENABLED=true
FEATURE_TEMPORAL_MATCHING_ENABLED=true
FEATURE_OPPORTUNITY_COST_ENABLED=true
FEATURE_ESCROW_ENABLED=true
FEATURE_SCENARIO_OPTIMIZATION_ENABLED=true
```

### Docker Compose Updates

Add Redis and Celery services to `docker-compose.yml`:

```yaml
services:
  # ... existing services ...
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
  
  celery_worker:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    command: celery -A app.core.celery_app worker --loglevel=info --concurrency=4
    depends_on:
      - db
      - redis
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/compass
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - ./apps/api:/app
  
  celery_beat:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    command: celery -A app.core.celery_app beat --loglevel=info
    depends_on:
      - db
      - redis
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/compass
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - ./apps/api:/app

volumes:
  postgres_data:
  redis_data:
```

### Deployment Checklist

1. **Pre-Deployment:**
   - [ ] Run all property-based tests (100 iterations each)
   - [ ] Run integration tests for all API endpoints
   - [ ] Verify database migrations in staging environment
   - [ ] Test Stripe Connect integration in test mode
   - [ ] Verify Redis connection and Celery workers
   - [ ] Review security configurations (rate limits, encryption)

2. **Deployment:**
   - [ ] Apply database migrations: `alembic upgrade head`
   - [ ] Start Celery workers and beat scheduler
   - [ ] Deploy backend API with new routes
   - [ ] Deploy frontend with new components
   - [ ] Verify health checks pass

3. **Post-Deployment:**
   - [ ] Smoke test all five features
   - [ ] Verify background jobs are processing
   - [ ] Check admin dashboards display correctly
   - [ ] Monitor error rates and performance metrics
   - [ ] Verify Stripe webhooks are received

### Rollback Plan

If issues arise, rollback in reverse order:

1. **Frontend Rollback:**
   ```bash
   cd apps/web
   git checkout previous-commit
   npm run build
   # Deploy previous build
   ```

2. **Backend Rollback:**
   ```bash
   cd apps/api
   git checkout previous-commit
   # Restart API service
   ```

3. **Database Rollback:**
   ```bash
   # Only if necessary - data loss may occur
   alembic downgrade -1  # Rollback one migration
   ```

4. **Feature Flags:**
   ```bash
   # Disable features via environment variables
   FEATURE_CREDENTIALS_ENABLED=false
   FEATURE_TEMPORAL_MATCHING_ENABLED=false
   FEATURE_OPPORTUNITY_COST_ENABLED=false
   FEATURE_ESCROW_ENABLED=false
   FEATURE_SCENARIO_OPTIMIZATION_ENABLED=false
   ```

## Monitoring and Observability

### Metrics to Track

#### Application Metrics

**Credentials:**
- `credentials_generated_total` (counter)
- `credentials_active_count` (gauge)
- `verification_clicks_total` (counter)
- `credential_generation_duration_seconds` (histogram)

**Temporal Matching:**
- `temporal_matches_calculated_total` (counter)
- `temporal_mismatch_alerts_total` (counter)
- `route_recommendation_duration_seconds` (histogram)

**Opportunity Cost:**
- `widget_impressions_total` (counter)
- `widget_clicks_total` (counter)
- `widget_conversions_total` (counter)
- `momentum_calculations_total` (counter)

**Escrow:**
- `escrow_created_total` (counter)
- `escrow_released_total` (counter)
- `escrow_refunded_total` (counter)
- `escrow_resolution_duration_seconds` (histogram)

**Scenario Optimization:**
- `frontier_calculations_total` (counter)
- `frontier_calculation_duration_seconds` (histogram)
- `pareto_opportunities_count` (histogram)

#### Infrastructure Metrics

**Celery:**
- `celery_tasks_pending` (gauge)
- `celery_tasks_active` (gauge)
- `celery_tasks_failed_total` (counter)
- `celery_task_duration_seconds` (histogram)

**Redis:**
- `redis_connected_clients` (gauge)
- `redis_memory_used_bytes` (gauge)
- `redis_cache_hit_rate` (gauge)

**Database:**
- `postgres_connections_active` (gauge)
- `postgres_query_duration_seconds` (histogram)
- `postgres_deadlocks_total` (counter)

### Logging Strategy

#### Structured Logging

Use Python's `structlog` for structured JSON logs:

```python
import structlog

logger = structlog.get_logger()

# In credential generation
logger.info(
    "credential_generated",
    user_id=str(user_id),
    credential_type=credential_type,
    score_value=score_value,
    verification_hash=verification_hash[:8]  # Only log prefix
)

# In escrow resolution
logger.info(
    "escrow_resolved",
    escrow_id=str(escrow_id),
    booking_id=str(booking_id),
    resolution=resolution,
    improvement_achieved=improvement,
    min_improvement_required=min_improvement
)

# In error cases
logger.error(
    "frontier_calculation_failed",
    user_id=str(user_id),
    constraints=constraints,
    error=str(exc),
    exc_info=True
)
```

#### Log Levels

- **DEBUG:** Detailed diagnostic information (disabled in production)
- **INFO:** General informational messages (feature usage, job completion)
- **WARNING:** Unexpected but handled situations (cache miss, retry triggered)
- **ERROR:** Error events that need attention (job failures, API errors)
- **CRITICAL:** Severe errors requiring immediate action (database down, Stripe failure)

### Alerting Rules

#### Critical Alerts (PagerDuty)

- Escrow resolution failure rate > 5%
- Credential generation failure rate > 1%
- Celery queue depth > 1000 tasks
- Database connection pool exhausted
- Stripe webhook failures > 10 in 5 minutes

#### Warning Alerts (Slack)

- Widget conversion rate drops below 15%
- Temporal mismatch alerts > 50 per day
- Frontier calculation duration > 10 seconds
- Redis cache hit rate < 70%
- Background job retry rate > 10%

### Health Checks

Add economics-specific health checks:

```python
@router.get("/health/economics")
async def economics_health_check(db: AsyncSession = Depends(get_db)):
    health = {
        "status": "healthy",
        "checks": {}
    }
    
    # Check database connectivity
    try:
        await db.execute(text("SELECT 1"))
        health["checks"]["database"] = "ok"
    except Exception as e:
        health["checks"]["database"] = f"error: {str(e)}"
        health["status"] = "unhealthy"
    
    # Check Redis connectivity
    try:
        await redis_client.ping()
        health["checks"]["redis"] = "ok"
    except Exception as e:
        health["checks"]["redis"] = f"error: {str(e)}"
        health["status"] = "degraded"
    
    # Check Celery workers
    try:
        inspector = celery_app.control.inspect()
        active_workers = inspector.active()
        if active_workers:
            health["checks"]["celery"] = f"ok ({len(active_workers)} workers)"
        else:
            health["checks"]["celery"] = "no workers available"
            health["status"] = "degraded"
    except Exception as e:
        health["checks"]["celery"] = f"error: {str(e)}"
        health["status"] = "degraded"
    
    # Check Stripe connectivity
    try:
        stripe.Account.retrieve()
        health["checks"]["stripe"] = "ok"
    except Exception as e:
        health["checks"]["stripe"] = f"error: {str(e)}"
        health["status"] = "degraded"
    
    return health
```

## Future Enhancements

### Phase 2 Features

1. **Machine Learning Integration:**
   - Train models to predict credential conversion rates
   - Optimize temporal matching using collaborative filtering
   - Predict escrow resolution outcomes
   - Improve Pareto frontier calculations with user feedback

2. **Advanced Analytics:**
   - Cohort analysis for all five features
   - A/B testing framework for widget variations
   - Predictive churn modeling
   - ROI attribution modeling

3. **Enhanced Escrow:**
   - Multi-milestone escrow releases
   - Dispute resolution workflow
   - Provider performance bonuses
   - Client satisfaction guarantees

4. **Scenario Optimization Extensions:**
   - Multi-objective optimization (3+ dimensions)
   - Monte Carlo simulation for uncertainty
   - Sensitivity analysis for constraints
   - Collaborative filtering for opportunity recommendations

5. **Internationalization:**
   - Multi-currency support for escrow
   - Localized opportunity cost calculations
   - Regional temporal preference norms
   - Country-specific credential standards

### Technical Debt to Address

1. **Testing:**
   - Increase property test coverage to 100%
   - Add mutation testing for critical paths
   - Implement chaos engineering for resilience testing

2. **Performance:**
   - Implement database query caching layer
   - Add CDN for static credential verification pages
   - Optimize Pareto frontier algorithm (currently O(n²))

3. **Security:**
   - Implement credential revocation lists (CRL)
   - Add multi-factor authentication for high-value escrow
   - Conduct third-party security audit

4. **Observability:**
   - Add distributed tracing with OpenTelemetry
   - Implement real-user monitoring (RUM)
   - Create custom Grafana dashboards

## Conclusion

This design document specifies a comprehensive implementation of five economics-driven intelligence features for Olcan Compass. The features are designed to:

- **Increase Trust:** Verification credentials provide cryptographic proof of readiness
- **Reduce Churn:** Temporal matching aligns routes with user preferences
- **Drive Revenue:** Opportunity cost widget converts free users to premium tiers
- **Ensure Quality:** Performance-bound escrow guarantees marketplace outcomes
- **Reduce Paralysis:** Scenario optimization helps users make optimal decisions

The implementation follows existing architectural patterns, maintains seamless UX, and provides rich analytics for measuring business impact. All features are designed with privacy, security, and performance as first-class concerns.

**Key Success Metrics:**
- 15% improvement in credential conversion rate
- 20% reduction in temporal churn
- 25% widget conversion rate
- 30% increase in marketplace booking value
- 40% reduction in decision paralysis

With proper implementation, testing, and monitoring, these features will deliver significant business value while maintaining the high-quality user experience that defines Olcan Compass.

