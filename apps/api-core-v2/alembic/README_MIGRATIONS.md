# Database Migrations Guide

This guide explains how to create and run database migrations for the new models added in v2.5.

## Prerequisites

- PostgreSQL database running
- Alembic installed (`pip install alembic`)
- Database connection configured in `.env`

## New Models Added in v2.5

### Document System
- `Document` - Career documents (resumes, cover letters, etc.)
- `DocumentTemplate` - Reusable templates
- `DocumentReview` - AI feedback on documents

### Interview System
- `Interview` - Practice interview sessions
- `InterviewQuestion` - Question bank
- `InterviewTemplate` - Pre-configured interview sets

### Marketplace System
- `Resource` - Digital resources (templates, guides, courses)
- `Purchase` - User purchases
- `ResourceReview` - Resource ratings and reviews
- `Collection` - Resource bundles

### Guild System (Enhanced)
- `Guild` - Team/community entities
- `GuildMember` - Membership with roles
- `GuildEvent` - Scheduled guild activities

### Social Features
- `Activity` - User activity feed
- `Follow` - User follow relationships
- `ActivityLike` - Likes on activities
- `ActivityComment` - Comments with threading
- `Notification` - User notifications
- `UserProfile` - Extended user profiles
- `Badge` - Achievement badges
- `UserBadge` - Badges awarded to users

## Creating Migrations

### Step 1: Review Models

Ensure all new models are imported in `app/models/__init__.py`:

```python
from .document import Document, DocumentTemplate, DocumentReview
from .interview import Interview, InterviewQuestion, InterviewTemplate
from .resource import Resource, Purchase, ResourceReview, Collection
from .guild import Guild, GuildMember, GuildEvent
from .social import (
    Activity, Follow, ActivityLike, ActivityComment,
    Notification, UserProfile, Badge, UserBadge
)
```

### Step 2: Generate Migration

```bash
cd apps/api-core-v2

# Auto-generate migration from model changes
alembic revision --autogenerate -m "Add v2.5 models: documents, interviews, marketplace, social"
```

This will create a new migration file in `alembic/versions/`.

### Step 3: Review Migration

Open the generated migration file and verify:

1. **Tables are created correctly**
2. **Foreign keys are properly defined**
3. **Indexes are added for performance**
4. **Enums are created**

Example migration structure:

```python
def upgrade():
    # Create enums
    op.execute("CREATE TYPE documenttype AS ENUM ('resume', 'cover_letter', 'portfolio', ...)")
    
    # Create tables
    op.create_table('documents',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        # ... other columns
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('ix_documents_user_id', 'documents', ['user_id'])
    op.create_index('ix_documents_status', 'documents', ['status'])

def downgrade():
    # Drop in reverse order
    op.drop_table('documents')
    op.execute("DROP TYPE documenttype")
```

### Step 4: Run Migration

```bash
# Apply migration to database
alembic upgrade head

# Verify migration
alembic current
alembic history
```

## Recommended Indexes

Add these indexes for optimal performance:

```sql
-- Documents
CREATE INDEX ix_documents_user_id ON documents(user_id);
CREATE INDEX ix_documents_status ON documents(status);
CREATE INDEX ix_documents_type ON documents(document_type);
CREATE INDEX ix_documents_slug ON documents(slug);

-- Interviews
CREATE INDEX ix_interviews_user_id ON interviews(user_id);
CREATE INDEX ix_interviews_status ON interviews(status);
CREATE INDEX ix_interviews_type ON interviews(interview_type);

-- Resources
CREATE INDEX ix_resources_creator_id ON resources(creator_id);
CREATE INDEX ix_resources_status ON resources(status);
CREATE INDEX ix_resources_type ON resources(resource_type);
CREATE INDEX ix_resources_category ON resources(category);
CREATE INDEX ix_resources_slug ON resources(slug);

-- Purchases
CREATE INDEX ix_purchases_user_id ON purchases(user_id);
CREATE INDEX ix_purchases_resource_id ON purchases(resource_id);

-- Guilds
CREATE INDEX ix_guilds_name ON guilds(name);
CREATE INDEX ix_guild_members_guild_id ON guild_members(guild_id);
CREATE INDEX ix_guild_members_user_id ON guild_members(user_id);

-- Social
CREATE INDEX ix_activities_user_id ON activities(user_id);
CREATE INDEX ix_activities_type ON activities(activity_type);
CREATE INDEX ix_follows_follower_id ON follows(follower_id);
CREATE INDEX ix_follows_following_id ON follows(following_id);
CREATE INDEX ix_notifications_user_id ON notifications(user_id);
CREATE INDEX ix_notifications_is_read ON notifications(is_read);
```

## Rollback

If you need to rollback:

```bash
# Rollback one migration
alembic downgrade -1

# Rollback to specific revision
alembic downgrade <revision_id>

# Rollback all migrations
alembic downgrade base
```

## Data Seeding

After running migrations, seed initial data:

### 1. Document Templates

```python
from app.models.document import DocumentTemplate, DocumentType

templates = [
    DocumentTemplate(
        id="modern-resume",
        name="Modern Professional",
        description="Clean, modern design",
        document_type=DocumentType.RESUME,
        structure={...},
        is_premium=0
    ),
    # Add more templates
]

db.add_all(templates)
db.commit()
```

### 2. Interview Questions

```python
from app.models.interview import InterviewQuestion, InterviewType, InterviewDifficulty

questions = [
    InterviewQuestion(
        id="q1",
        interview_type=InterviewType.BEHAVIORAL,
        difficulty=InterviewDifficulty.INTERMEDIATE,
        question_text="Tell me about a time...",
        evaluation_criteria=[...]
    ),
    # Add more questions
]

db.add_all(questions)
db.commit()
```

### 3. Badges

```python
from app.models.social import Badge

badges = [
    Badge(
        id="first-document",
        name="Document Creator",
        description="Created your first document",
        category="achievement",
        rarity="common"
    ),
    # Add more badges
]

db.add_all(badges)
db.commit()
```

## Testing Migrations

### 1. Test in Development

```bash
# Create test database
createdb olcan_compass_test

# Run migrations
DATABASE_URL=postgresql://user:pass@localhost/olcan_compass_test alembic upgrade head

# Verify tables
psql olcan_compass_test -c "\dt"
```

### 2. Test Rollback

```bash
# Rollback
alembic downgrade -1

# Re-apply
alembic upgrade head
```

### 3. Test with Data

```python
# Create test records
from app.models.document import Document, DocumentType, DocumentStatus

doc = Document(
    id="test-doc",
    user_id="test-user",
    title="Test Resume",
    document_type=DocumentType.RESUME,
    status=DocumentStatus.DRAFT,
    content={"sections": []}
)

db.add(doc)
db.commit()
```

## Production Deployment

### 1. Backup Database

```bash
pg_dump -h localhost -U postgres olcan_compass > backup_$(date +%Y%m%d).sql
```

### 2. Run Migration

```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://user:pass@prod-host/olcan_compass"

# Run migration
alembic upgrade head
```

### 3. Verify

```bash
# Check current version
alembic current

# Verify tables exist
psql $DATABASE_URL -c "\dt"

# Check row counts
psql $DATABASE_URL -c "SELECT COUNT(*) FROM documents;"
```

## Troubleshooting

### Issue: Enum already exists

```bash
# Drop enum manually
psql $DATABASE_URL -c "DROP TYPE IF EXISTS documenttype CASCADE;"

# Re-run migration
alembic upgrade head
```

### Issue: Foreign key constraint fails

```bash
# Check referenced table exists
psql $DATABASE_URL -c "\d users"

# Ensure user table is created first
```

### Issue: Column already exists

```bash
# Mark migration as applied without running
alembic stamp head

# Or drop column manually
psql $DATABASE_URL -c "ALTER TABLE documents DROP COLUMN IF EXISTS column_name;"
```

## Best Practices

1. **Always backup before migrations**
2. **Test migrations in development first**
3. **Review auto-generated migrations**
4. **Add indexes for foreign keys**
5. **Use transactions for data migrations**
6. **Document breaking changes**
7. **Keep migrations small and focused**
8. **Never edit applied migrations**

## Migration Checklist

- [ ] Models defined in `app/models/`
- [ ] Models imported in `app/models/__init__.py`
- [ ] Migration generated with `alembic revision --autogenerate`
- [ ] Migration reviewed and edited if needed
- [ ] Indexes added for performance
- [ ] Migration tested in development
- [ ] Rollback tested
- [ ] Database backed up (production)
- [ ] Migration applied to production
- [ ] Verification completed
- [ ] Seed data added if needed

## Next Steps

After migrations are complete:

1. Update API routes to include new endpoints
2. Test all CRUD operations
3. Add integration tests
4. Update API documentation
5. Deploy to staging
6. Run smoke tests
7. Deploy to production

---

**Note**: This guide assumes PostgreSQL. Adjust SQL syntax for other databases.
