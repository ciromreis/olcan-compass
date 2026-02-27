# gemini.md — Project Constitution: Olcan Compass

> **Law**: This file is the source of truth. All code must conform to these schemas and rules.

---

## Part I: Authentication System Schemas

(Defined in apps/api/app/db/models/user.py - see above)

### 1.1 User Model Schema

```python
# apps/api/app/db/models/user.py

import uuid
import enum
from datetime import datetime

from sqlalchemy import DateTime, String, Boolean, Enum, text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class UserRole(str, enum.Enum):
    USER = "user"
    PROVIDER = "provider"
    ORG_MEMBER = "org_member"
    ORG_COORDINATOR = "org_coordinator"
    ORG_ADMIN = "org_admin"
    SUPER_ADMIN = "super_admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.USER, nullable=False)
    
    # Profile fields
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC", nullable=False)
    
    # Security
    failed_login_attempts: Mapped[int] = mapped_column(default=0, nullable=False)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"))
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
```

---

### 1.2 Token Schemas (Pydantic)

```python
# apps/api/app/schemas/token.py

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import uuid


class Token(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """JWT payload data"""
    sub: uuid.UUID  # user_id
    email: EmailStr
    role: str


class TokenPayload(BaseModel):
    """Raw token payload from JWT"""
    sub: str
    exp: int
    iat: int
    type: str  # "access" or "refresh"


# Auth Request/Response Schemas
class AuthRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    full_name: Optional[str] = None


class AuthLoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    user_id: uuid.UUID
    email: EmailStr
    role: str
    token: Token


class UserProfileResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: Optional[str]
    avatar_url: Optional[str]
    language: str
    timezone: str
    role: str
    is_verified: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    language: Optional[str] = Field(None, min_length=2, max_length=10)
    timezone: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)
```

---

### 1.3 Configuration Schema

```python
# apps/api/app/core/config.py (additions)

class Settings(BaseSettings):
    # ... existing fields ...
    
    # JWT Settings
    jwt_secret_key: str = Field(..., description="Secret key for JWT signing")
    jwt_algorithm: str = Field(default="HS256", description="JWT algorithm")
    jwt_access_token_expire_minutes: int = Field(default=15, description="Access token expiry")
    jwt_refresh_token_expire_days: int = Field(default=7, description="Refresh token expiry")
    
    # Password Settings
    password_min_length: int = Field(default=8)
    password_require_uppercase: bool = Field(default=True)
    password_require_number: bool = Field(default=True)
    password_require_special: bool = Field(default=False)
    
    # Security
    max_login_attempts: int = Field(default=5, description="Max failed attempts before lockout")
    lockout_duration_minutes: int = Field(default=30, description="Account lockout duration")
```

---

## Part I.5: Psychological Engine Schemas

### 1.5.1 Psychological Question Types

```python
# apps/api/app/db/models/psychology.py

class PsychQuestionType(str, enum.Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    SCALE = "scale"
    TEXT = "text"
    BINARY = "binary"


class PsychCategory(str, enum.Enum):
    CONFIDENCE = "confidence"
    ANXIETY = "anxiety"
    DISCIPLINE = "discipline"
    RISK_TOLERANCE = "risk_tolerance"
    NARRATIVE_CLARITY = "narrative_clarity"
    INTERVIEW_ANXIETY = "interview_anxiety"
    DECISION_STYLE = "decision_style"
    CULTURAL_ADAPTABILITY = "cultural_adaptability"
    FINANCIAL_RESILIENCE = "financial_resilience"
    COMMUNICATION_STYLE = "communication_style"
```

### 1.5.2 Psychological Profile Model

```python
class PsychProfile(Base):
    __tablename__ = "user_psych_profiles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), unique=True)
    
    # Composite scores (0-100)
    confidence_index: Mapped[float]
    anxiety_score: Mapped[float]
    discipline_score: Mapped[float]
    narrative_maturity_score: Mapped[float]
    interview_anxiety_score: Mapped[float]
    cultural_adaptability_score: Mapped[float]
    financial_resilience_score: Mapped[float]
    
    risk_profile: Mapped[str]  # low, medium, high
    decision_style: Mapped[str]
    
    mobility_state: Mapped[str]  # exploring, preparing, applying, executing
    psychological_state: Mapped[str]  # uncertain, structuring, building_confidence, executing, resilient
    
    fear_clusters: Mapped[list]  # JSON
    strengths: Mapped[list]     # JSON
    growth_areas: Mapped[list]  # JSON
    
    last_assessment_at: Mapped[datetime | None]
```

### 1.5.3 Psychological Assessment Flow

1. **Start Session**: Create PsychAssessmentSession
2. **Get Questions**: Fetch active questions ordered by display_order
3. **Submit Answer**: Save PsychAnswer with computed score
4. **Compute Profile**: After completion, calculate averages and update PsychProfile
5. **Save History**: Create PsychScoreHistory record

### 1.5.4 State Determination Rules

**Mobility State** (based on confidence + discipline average):
- < 30: exploring
- < 50: preparing
- < 70: applying
- >= 70: executing

**Psychological State** (based on anxiety + confidence):
- anxiety > 66: uncertain
- confidence < 40: structuring
- confidence < 60: building_confidence
- confidence < 80: executing
- >= 80: resilient

---

## Part II: Behavioral Rules

### 2.1 Authentication Rules

1. **Password Hashing**
   - Use Bcrypt via passlib
   - Never store plaintext passwords
   - Salt generated automatically by Bcrypt

2. **JWT Tokens**
   - Access tokens: 15 minutes expiry (short-lived)
   - Refresh tokens: 7 days expiry (long-lived)
   - JWT must contain: `sub` (user_id), `email`, `role`, `type` (access/refresh), `exp`, `iat`

3. **Account Lockout**
   - After 5 failed login attempts, lock account for 30 minutes
   - Increment failed_attempts on each failed login
   - Reset failed_attempts on successful login

4. **Role-Based Access**
   - USER: Basic access to own data
   - PROVIDER: Access to marketplace features
   - ORG_MEMBER: Access within organization
   - ORG_COORDINATOR: Manage organization members
   - ORG_ADMIN: Organization administration
   - SUPER_ADMIN: Full system access

### 2.2 API Response Rules

1. **Success Responses**
   - 200 OK: GET requests, successful updates
   - 201 Created: POST creating new resources
   - 204 No Content: DELETE successful

2. **Error Responses**
   - 400 Bad Request: Validation errors
   - 401 Unauthorized: Missing or invalid tokens
   - 403 Forbidden: Valid token but insufficient permissions
   - 404 Not Found: Resource doesn't exist
   - 422 Unprocessable Entity: Business logic validation errors
   - 429 Too Many Requests: Rate limiting
   - 500 Internal Server Error: Unexpected errors

3. **Error Response Format**
```python
class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None
    field: Optional[str] = None
```

### 2.3 Security Rules

1. **Password Requirements**
   - Minimum 8 characters
   - At least 1 uppercase letter
   - At least 1 number
   - Optional: special character

2. **Rate Limiting**
   - Auth endpoints: 5 requests per minute
   - General API: 60 requests per minute

3. **CORS**
   - Configurable via environment
   - Default: allow specified frontend origins only

---

## Part III: Architectural Invariants

### 3.1 Database Invariants

1. **All tables must have**:
   - UUID primary key
   - `created_at` timestamp with server default
   - `updated_at` timestamp with auto-update

2. **Soft deletes** (where applicable):
   - Use `deleted_at` column instead of hard delete
   - Filter `deleted_at IS NULL` in queries

3. **Indexes**:
   - Index on `users.email` (unique)
   - Index on `users.role`
   - Composite indexes for common query patterns

### 3.2 API Layer Invariants

1. **Route Organization**
   ```
   /api/v1/auth/     - Authentication endpoints
   /api/v1/users/    - User management
   /api/v1/          - Future: routes, narratives, etc.
   ```

2. **Dependency Injection**
   - Use FastAPI Depends for auth
   - Database sessions via Depends
   - Settings via Depends

3. **Validation**
   - All inputs validated via Pydantic
   - All outputs serialized via Pydantic
   - No raw dict responses

### 3.3 Testing Invariants

1. **Unit Tests**
   - Test each auth function in isolation
   - Test password hashing/verification
   - Test JWT creation/validation

2. **Integration Tests**
   - Test endpoint behavior
   - Test database operations
   - Test error handling

---

## Part IV: Maintenance Log

### 2026-02-22: Authentication System COMPLETED

**Status**: ✅ IMPLEMENTED - Code complete, bug-fixed, needs Docker to test

**Changes**:
- Created gemini.md with auth schemas
- Defined User model with auth fields
- Defined token schemas (JWT)
- Implemented all auth endpoints
- Set behavioral rules and security invariants
- Fixed UUID conversion in JWT queries

**What Was Built**:
- User model with: email, hashed_password, role, is_active, is_verified, failed_login_attempts, locked_until, timestamps
- Password hashing via bcrypt (passlib)
- JWT tokens: access (15 min) + refresh (7 days)
- Auth endpoints: /register, /login, /refresh, /logout
- Profile endpoints: GET /me, PUT /me, PUT /me/password
- Account lockout after 5 failed attempts (30 min)
- Configuration via environment variables

**Files Created**:
- apps/api/app/schemas/token.py
- apps/api/app/core/security/password.py
- apps/api/app/core/security/jwt.py
- apps/api/app/core/security/__init__.py
- apps/api/app/core/auth.py
- apps/api/app/api/routes/auth.py
- apps/api/.env (created from .env.example)

**Bug Fixes Applied**:
- Added `import uuid` to auth files
- Fixed JWT user_id to UUID conversion in get_current_user dependency
- Fixed JWT user_id to UUID conversion in refresh token endpoint

**Next Priority** (PRD Phase 1 - continued):
1. Test auth system with Docker + database migration
2. Email verification flow
3. Password reset flow
4. Psychological engine tables ✅ COMPLETE
5. Route & milestone tables

---

### 2026-02-22: Psychological Engine COMPLETED

**Status**: ✅ IMPLEMENTED

**What Was Built**:
- 5 database models for psychological assessment
- Pydantic schemas for all endpoints
- API routes for profile, assessment, and history
- Score computation logic with state determination

**Files Created**:
- apps/api/app/db/models/psychology.py
- apps/api/app/schemas/psychology.py
- apps/api/app/api/routes/psychology.py
- apps/api/alembic/versions/0002_psych.py

**Endpoints**:
- GET /api/psych/profile - Get user profile
- PUT /api/psych/profile - Update profile
- POST /api/psych/assessment/start - Start assessment
- GET /api/psych/assessment/{id}/question - Get next question
- POST /api/psych/assessment/answer - Submit answer
- GET /api/psych/history - Get score history

---

### Previous Notes (Pre-Implementation)

**Original Notes**:
- Need to add auth dependencies to requirements.txt ✅ DONE
- Need to implement /auth routes ✅ DONE
- Need Alembic migration for user table updates ✅ DONE
