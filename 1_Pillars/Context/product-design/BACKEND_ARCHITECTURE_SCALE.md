# Backend Architecture for Scale - Olcan Compass v2.5

## Executive Summary

This document establishes the production backend architecture for Olcan Compass v2.5, designed to support:
- MicroSaaS core operations at scale
- Game-state persistence for companion/gamification systems
- Event-driven progression tracking
- Future AI/developer handoffs without architectural drift

**Current Status**: Backend hardened with production-safe patterns; runtime validation enforced.

---

## Architecture Principles

### 1. Single Source of Truth for Configuration
All runtime configuration flows through `app.core.config.Settings`:
- Database connection pooling (PostgreSQL production, SQLite dev only)
- CORS origins parsed from environment
- JWT secrets validated at boot in production
- Feature flags for progressive rollouts

### 2. Async-First Database Layer
SQLAlchemy 2.0 async with connection pooling:
```python
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=40,
    pool_timeout=30,
    pool_recycle=1800,
    pool_pre_ping=True
)
```

### 3. Event-Driven State Changes
Game state changes (companion evolution, achievements, quests) must emit canonical events for:
- Gamification progression
- Analytics tracking
- Cross-domain orchestration
- Frontend real-time updates

### 4. Domain-Bounded Module Structure
Each product domain owns its models, schemas, services, and API routes.

---

## Canonical Domains (Backend)

| Domain | Models | Status | Production Ready |
|--------|--------|--------|------------------|
| **Auth** | User, Session, Token | ✅ | Yes |
| **Companion** | Companion, CompanionActivity, CompanionEvolution, CompanionStats | ⚠️ | Partial |
| **Progress/Gamification** | UserProgress, Achievement, UserAchievement, Quest, UserQuest | ✅ | Yes |
| **Archetypes** | Archetype, FearCluster, Motivator | ⚠️ | Data only |
| **Routes** | Route, RouteMilestone, RouteConstraint | ❌ | Not implemented |
| **Execution** | Document, InterviewSession, Sprint, Task | ❌ | Not implemented |
| **Marketplace** | Provider, Service, Booking, Transaction | ❌ | Not implemented |
| **Guilds/Social** | Guild, GuildMember, GuildMessage, Battle | ❌ | Not implemented |
| **Monetization** | Subscription, Payment, UsageRecord | ❌ | Not implemented |

---

## Database Architecture

### PostgreSQL Production Schema

**Core Tables**:
```sql
-- Users & Auth
users (id, email, hashed_password, is_active, created_at)
sessions (id, user_id, token, expires_at)

-- Companion System
companions (
    id, user_id, archetype_id, name, type,
    level, xp, xp_to_next, evolution_stage,
    current_health, max_health, energy, max_energy,
    abilities (JSON), stats (JSON),
    created_at, updated_at, last_cared_at
)

companion_activities (
    id, companion_id, activity_type,
    xp_reward, energy_cost, description,
    completed_at
)

companion_evolutions (
    id, companion_id, from_stage, to_stage,
    evolution_reason, level_at_evolution,
    stats_before (JSON), stats_after (JSON),
    evolved_at
)

-- Gamification
user_progress (
    id, user_id, total_xp, level, xp_to_next_level,
    total_sessions, total_time_spent, streak_days,
    longest_streak, last_activity_date,
    quests_completed, achievements_unlocked,
    companions_evolved, stats (JSON)
)

achievements (
    id, name, description, icon, category,
    requirements (JSON), xp_reward, rarity, is_hidden
)

user_achievements (
    id, progress_id, achievement_id,
    unlocked_at, progress_data (JSON)
)

quests (
    id, name, description, category, difficulty,
    requirements (JSON), xp_reward, rewards (JSON),
    prerequisite_quest_id, is_repeatable, cooldown_hours,
    is_active, start_date, end_date
)

user_quests (
    id, progress_id, quest_id, status,
    progress_data (JSON), completion_percentage,
    started_at, completed_at, last_progress_at
)
```

### Critical Database Rules

1. **Never use SQLite in production** - Runtime check enforces this
2. **JSON columns for flexible schemas** - Abilities, stats, requirements stored as JSON
3. **Timestamp all state changes** - Every mutation tracked with `created_at`, `updated_at`
4. **Soft deletes for audit trails** - Use `is_active` flags, never hard delete

---

## Event Schema for Game State

### Canonical Event Types

All significant user actions emit events for downstream processing:

```python
# Core progression events
"assessment.completed"      # User finished archetype quiz
"companion.created"         # New companion hatched
"companion.cared"           # Care activity performed
"companion.evolved"         # Evolution stage reached
"companion.leveled"         # Level up achieved

# Gamification events
"achievement.unlocked"      # Achievement earned
"quest.started"             # Quest accepted
"quest.completed"           # Quest finished
"streak.maintained"         # Daily streak continued
"streak.broken"             # Streak reset

# Product value events (when implemented)
"route.selected"            # User chose migration route
"document.created"          # Document generated
"interview.completed"       # Practice session done
"marketplace.booked"        # Service booked
```

### Event Payload Structure

```python
{
    "event_id": "uuid",
    "event_type": "companion.evolved",
    "user_id": 123,
    "timestamp": "2024-01-15T10:30:00Z",
    "payload": {
        "companion_id": 456,
        "from_stage": "egg",
        "to_stage": "sprout",
        "trigger": "level_up",  # or "care_streak", "milestone"
        "context": {
            "level": 5,
            "total_xp": 2500,
            "care_streak_days": 7
        }
    },
    "metadata": {
        "source": "backend_api",
        "version": "2.5.0"
    }
}
```

---

## API Route Structure

### Current Implementation

```
/api/v1/
├── /auth
│   ├── POST /register
│   ├── POST /login
│   ├── POST /refresh
│   └── POST /logout
├── /companions
│   ├── GET /                    # List user's companions
│   ├── POST /                   # Create companion
│   ├── GET /{id}                # Get companion details
│   ├── PUT /{id}                # Update companion
│   ├── POST /{id}/care          # Perform care activity
│   ├── POST /{id}/evolve      # Trigger evolution check
│   └── GET /{id}/stats        # Get companion statistics
├── /progress
│   ├── GET /                    # Get user progress
│   ├── GET /achievements      # List achievements
│   ├── GET /quests            # List available quests
│   └── POST /quests/{id}/complete
```

### Missing Routes (To Implement)

```
/api/v1/
├── /archetypes
│   ├── GET /                    # List all archetypes
│   ├── GET /{id}              # Get archetype details
│   └── POST /discover         # Archetype quiz result
├── /routes
│   ├── GET /recommendations   # Get route suggestions
│   ├── POST /                 # Select a route
│   └── GET /{id}/milestones   # Get route milestones
├── /guilds
│   ├── GET /                  # List guilds
│   ├── POST /                 # Create guild
│   ├── GET /{id}              # Get guild details
│   ├── POST /{id}/join        # Join guild
│   └── POST /{id}/battles     # Initiate battle
├── /marketplace
│   ├── GET /providers         # List providers
│   ├── GET /services          # List services
│   └── POST /bookings         # Create booking
```

---

## Service Layer Pattern

### Current: Logic in API Routes (Anti-pattern)

```python
# ❌ Don't do this - business logic in route
@router.post("/{id}/care")
async def perform_care(...):
    companion = await get_companion(id)
    companion.xp += 10  # Hardcoded logic
    companion.energy -= 5
    await db.commit()
```

### Target: Service Layer with Domain Logic

```python
# ✅ Do this - delegate to service
@router.post("/{id}/care")
async def perform_care(...):
    result = await companion_service.perform_care_activity(
        companion_id=id,
        activity_type=activity.type,
        user_id=current_user.id
    )
    return result

# In services/companion_service.py
class CompanionService:
    async def perform_care_activity(...):
        # 1. Validate companion state
        # 2. Calculate effects (XP, energy, happiness)
        # 3. Apply mutations
        # 4. Check for level up
        # 5. Check for evolution trigger
        # 6. Emit events
        # 7. Return enriched result
```

---

## Game State Persistence Rules

### Companion State Machine

```
Egg → Sprout → Young → Mature → Master → Legendary
```

**Evolution Triggers**:
1. **Level-based**: Reach required level for stage
2. **Care-streak based**: Consecutive care days
3. **Achievement-based**: Unlock specific achievements
4. **Time-based**: Minimum days at current stage

**State Consistency Requirements**:
- All companion mutations within a transaction
- Activity log entries created atomically with state changes
- Evolution events emit after successful commit
- Frontend receives optimistic updates with rollback capability

### Achievement System

**Achievement Types**:
```python
{
    "progression": ["first_companion", "first_evolution", "max_level"],
    "care": ["streak_7", "streak_30", "all_activities"],
    "social": ["join_guild", "win_battle", "help_friend"],
    "completion": ["complete_route", "finish_document", "book_service"]
}
```

**Unlock Rules**:
- Progress-tracked: Store partial progress in `user_achievements.progress_data`
- Instant: Check conditions on relevant event
- Scheduled: Daily/weekly batch job for time-based achievements

### Quest System

**Quest Categories**:
- **Daily**: Reset every 24h, simple tasks (care companion, check progress)
- **Weekly**: 7-day cycles, moderate complexity (reach milestone, maintain streak)
- **Special**: One-time, story-driven (discover archetype, first evolution)
- **Event**: Time-limited, seasonal/holiday themed

**Quest State**:
```python
{
    "active": "In progress",
    "completed": "Finished, reward claimed",
    "failed": "Time expired or conditions not met",
    "abandoned": "User opted out"
}
```

---

## Scaling Considerations

### Database Scaling

**Current**: Single PostgreSQL instance
**Near-term** (1-10K users):
- Read replicas for GET endpoints
- Connection pooling via PgBouncer
- Query optimization with proper indexes

**Medium-term** (10K-100K users):
- Vertical scaling (larger instances)
- Cache layer (Redis) for hot data
- Async job queue (Celery + Redis) for heavy operations

**Long-term** (100K+ users):
- Horizontal sharding by user_id
- CQRS pattern for read/write separation
- Event sourcing for game state history

### API Scaling

**Rate Limiting**:
- Anonymous: 30 req/min
- Authenticated: 100 req/min
- Companion care: 10 req/min (prevent automation)

**Caching Strategy**:
- Archetype definitions: Cache 1 hour
- Leaderboards: Cache 5 minutes
- User progress: Real-time (no cache)
- Companion state: Short TTL (30s) for consistency

---

## Security & Compliance

### Data Protection

1. **PII Encryption**: Encrypt sensitive fields at rest
2. **JWT Best Practices**: Short expiry (15min), refresh tokens (7 days)
3. **Rate Limiting**: Prevent brute force and automation
4. **Input Validation**: Pydantic schemas for all inputs
5. **SQL Injection Prevention**: SQLAlchemy ORM only, no raw queries

### Production Checklist

Before deploying to production:
- [ ] `ENV=production` set
- [ ] `DATABASE_URL` points to PostgreSQL (not SQLite)
- [ ] JWT secrets changed from defaults
- [ ] Stripe keys are live (not test)
- [ ] Encryption key is 32-byte secure random
- [ ] CORS origins limited to actual domains
- [ ] Database migrations run
- [ ] Health check endpoint responding

---

## Future AI Handoff Guidelines

When continuing this codebase, future AI agents must:

### Preserve
- Async database patterns with connection pooling
- Domain-bounded module structure
- Event-driven state change architecture
- Configuration validation at boot
- Production safety checks (no SQLite in prod)

### Extend
- Implement missing domain services (routes, execution, marketplace)
- Add Redis caching layer
- Build async job queue for heavy operations
- Create webhook system for real-time frontend updates
- Implement comprehensive test coverage

### Avoid
- Adding logic directly to API route handlers
- Creating new stores that duplicate existing domain models
- Using synchronous database operations
- Hardcoding configuration values
- Skipping transaction boundaries for multi-table mutations

---

## Implementation Priority

### Phase 1: Foundation (Complete)
✅ Configuration management
✅ Database connection pooling
✅ Runtime validation
✅ Health checks
✅ Error handling with real timestamps

### Phase 2: Core Gamification (Next)
🔄 Service layer abstraction for companions
🔄 Event emission system
🔄 Achievement unlock engine
🔄 Quest generation and tracking
🔄 Streak calculation

### Phase 3: Social Features (Pending)
⏳ Guild CRUD and membership
⏳ Battle system (async queue)
⏳ Leaderboards with caching
⏳ Real-time messaging (WebSockets)

### Phase 4: Marketplace (Pending)
⏳ Provider profiles and verification
⏳ Service listings
⏳ Booking workflow
⏳ Stripe Connect integration

### Phase 5: AI Features (Pending)
⏳ AI gateway abstraction
⏳ Rate limiting and cost tracking
⏳ Narrative Forge endpoints
⏳ Interview simulator pipeline

---

**Version**: 2.5.0-architecture-v1
**Last Updated**: March 28, 2026
**Status**: Foundation hardened, ready for gamification implementation
