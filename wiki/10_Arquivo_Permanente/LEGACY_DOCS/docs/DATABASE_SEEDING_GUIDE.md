# Database Seeding Guide

## Overview

This guide covers how to seed the Olcan Compass database with initial data for development and testing.

---

## Available Seed Scripts

### 1. OIOS Psychology Questions

**Script:** `scripts/seed_psychology_questions.py`  
**Purpose:** Seeds 12 psychology questions covering 4 fear clusters (confidence, uncertainty, belonging, purpose)  
**Status:** ✅ Ready to run

**What it seeds:**
- 12 assessment questions (3 per category)
- 5-point Likert scale options for each question
- Categories: Confidence, Uncertainty, Belonging, Purpose
- Multilingual support (PT, EN, ES)

**How to run:**

```bash
# Navigate to API directory
cd apps/api-core-v2.5

# Ensure database is running
docker ps | grep postgres

# Run seed script
python scripts/seed_psychology_questions.py
```

**Expected output:**
```
✅ Connected to database
📝 Seeding 12 psychology questions...
  ✅ Question 1: Confidence (1/12)
  ✅ Question 2: Confidence (2/12)
  ...
  ✅ Question 12: Purpose (3/12)
✅ Seeding complete! 12 questions added to database.
```

**Verify:**
```bash
# Connect to database
psql -h 127.0.0.1 -U olcan_app -d olcan_production

# Count questions
SELECT COUNT(*) FROM psych_questions;
-- Expected: 12

# View categories
SELECT category, COUNT(*) FROM psych_questions GROUP BY category;
-- Expected: 3 questions per category (4 categories)
```

---

### 2. Archetype Data

**Script:** `seed_archetypes_simple.py`  
**Purpose:** Seeds 12 OIOS archetypes  
**Status:** ✅ Already run (archetypes exist)

**What it seeds:**
- 12 archetypes (Strategist, Innovator, Guardian, etc.)
- Archetype descriptions and traits
- Evolution stages and requirements

---

### 3. Test Users (Development Only)

**Script:** Create manually or use registration endpoint

**For development testing:**

```bash
# Register test user via API
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "full_name": "Test User"
  }'
```

---

## Complete Seeding Workflow (Fresh Database)

### Step 1: Start Database

```bash
# Using Docker Compose
docker compose up -d db

# Wait for database to be ready
sleep 5

# Verify connection
docker ps | grep postgres
```

### Step 2: Run Migrations

```bash
cd apps/api-core-v2.5

# Run all migrations
alembic upgrade head

# Verify tables created
psql -h 127.0.0.1 -U olcan_app -d olcan_production -c "\dt"
```

### Step 3: Seed Psychology Questions

```bash
python scripts/seed_psychology_questions.py
```

### Step 4: Seed Archetypes (if not already done)

```bash
python seed_archetypes_simple.py
```

### Step 5: Verify Database

```bash
# Check question count
psql -h 127.0.0.1 -U olcan_app -d olcan_production -c \
  "SELECT COUNT(*) as question_count FROM psych_questions;"

# Check archetype count
psql -h 127.0.0.1 -U olcan_app -d olcan_production -c \
  "SELECT COUNT(*) as archetype_count FROM archetypes;"

# Check migrations
psql -h 127.0.0.1 -U olcan_app -d olcan_production -c \
  "SELECT version_num FROM alembic_version;"
```

---

## Environment-Specific Seeding

### Development

```bash
# Use local database
export DATABASE_URL=postgresql+asyncpg://olcan_app:olcan_app_password@127.0.0.1:5432/olcan_dev

# Run seeds
python scripts/seed_psychology_questions.py
```

### Staging

```bash
# Connect to staging database
export DATABASE_URL=postgresql+asyncpg://olcan_app:PASSWORD@staging-db-host:5432/olcan_staging

# Run seeds
python scripts/seed_psychology_questions.py
```

### Production

⚠️ **WARNING:** Only run seed scripts in production if explicitly needed (e.g., initial setup).

```bash
# Backup first!
./scripts/backup_database.sh

# Connect to production database
export DATABASE_URL=postgresql+asyncpg://olcan_app:PASSWORD@prod-db-host:5432/olcan_production

# Run seeds (idempotent - won't duplicate)
python scripts/seed_psychology_questions.py
```

---

## Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check if database is running
docker ps | grep postgres

# Start if not running
docker compose up -d db

# Check connection string
echo $DATABASE_URL
```

### Issue: "Table already exists"

**Solution:**
The seed scripts are idempotent - they check for existing data before inserting. This is normal and safe.

### Issue: "Questions already seeded"

**Solution:**
This is expected if you've run the script before. The script will skip existing questions.

To force re-seed (development only):
```bash
# Drop and recreate tables (DEVELOPMENT ONLY!)
psql -h 127.0.0.1 -U olcan_app -d olcan_dev -c \
  "DROP TABLE psych_questions CASCADE;"

# Re-run migrations
alembic upgrade head

# Re-seed
python scripts/seed_psychology_questions.py
```

### Issue: "Import errors"

**Solution:**
```bash
# Ensure you're in the right directory
cd apps/api-core-v2.5

# Check Python path
python -c "import sys; print(sys.path)"

# Install dependencies if missing
pip install -r requirements.txt
```

---

## Verification Checklist

After seeding, verify:

- [ ] 12 psychology questions in database
- [ ] 4 categories represented (3 questions each)
- [ ] All questions have 5 Likert scale options
- [ ] Multilingual text present (pt, en, es)
- [ ] Archetypes seeded (12 total)
- [ ] Migrations up to date
- [ ] Can access quiz endpoint: `GET /api/psych/assessment/start`

---

## Next Steps After Seeding

1. **Test OIOS Quiz:**
   ```bash
   # Start quiz
   curl -X POST http://localhost:8000/api/psych/assessment/start
   
   # Get questions
   curl http://localhost:8000/api/psych/assessment/questions
   
   # Submit answers
   curl -X POST http://localhost:8000/api/psych/assessment/submit \
     -H "Content-Type: application/json" \
     -d '{"answers": [{"question_id": 1, "value": 4}, ...]}'
   ```

2. **Test Frontend Quiz:**
   - Navigate to: `http://localhost:3000/onboarding/quiz`
   - Complete the quiz
   - Verify archetype assignment

3. **Verify Archetype Assignment:**
   ```bash
   # Check user profile
   curl http://localhost:8000/api/auth/me \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

---

## Automated Seeding (CI/CD)

For automated testing environments:

```yaml
# .github/workflows/test.yml
jobs:
  test:
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: olcan_app
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: olcan_test
        ports:
          - 5432:5432
    
    steps:
      - name: Run migrations
        run: alembic upgrade head
      
      - name: Seed database
        run: python scripts/seed_psychology_questions.py
      
      - name: Run tests
        run: pytest
```

---

## Additional Seed Scripts (Future)

Consider creating seed scripts for:

- [ ] Test marketplace providers
- [ ] Sample documents
- [ ] Interview questions
- [ ] Route templates
- [ ] Subscription plans
- [ ] CRM test data

---

**Last Updated:** April 13, 2026  
**Maintainer:** Development Team
