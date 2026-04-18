# SQLAlchemy 2.0 Troubleshooting Guide

## Overview

This guide documents common SQLAlchemy 2.0 issues encountered in the Olcan Compass project and their solutions. SQLAlchemy 2.0 introduced stricter type checking and new patterns that can cause subtle bugs if not followed correctly.

## Critical Issue: Boolean Field Type Resolution

### Symptom

```
TypeError: Boolean value of this clause is not defined
```

Stack trace shows error during module import:
```
from app.db.models.marketplace import ...
  File "properties.py", line X, in _extract_mappable_attributes
  File "typing.py", line Y, in includes_none
TypeError: Boolean value of this clause is not defined
```

### Root Cause

In SQLAlchemy 2.0, when using `Mapped[bool]` type hints with `mapped_column(Boolean, default=False)`, the ORM's declarative scanner attempts to infer nullability from the type hint. If `nullable=False` is not explicitly specified, SQLAlchemy creates an intermediate SQL expression during type resolution, which triggers a `__bool__` check that raises this exception.

**The Problem:**
```python
# WRONG - Missing nullable parameter
client_followup_needed: Mapped[bool] = mapped_column(Boolean, default=False)
```

The type hint `Mapped[bool]` (not `Mapped[bool | None]`) implies the field is non-nullable, but SQLAlchemy 2.0's type resolver needs the explicit `nullable=False` parameter to avoid creating intermediate SQL expressions.

### Solution

Always explicitly specify `nullable=False` for non-nullable boolean fields:

```python
# CORRECT - Explicit nullable parameter
client_followup_needed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
```

### When This Occurs

This issue appears when:
1. Using `Mapped[bool]` (not `Mapped[bool | None]`)
2. Using `mapped_column(Boolean, default=X)` without `nullable=False`
3. SQLAlchemy attempts to import the model during startup

### Prevention Rules

**For all boolean fields:**

1. **Non-nullable booleans** (type hint `Mapped[bool]`):
   ```python
   is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
   ```

2. **Nullable booleans** (type hint `Mapped[bool | None]`):
   ```python
   would_recommend: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
   ```

3. **Never omit the nullable parameter** when using `Mapped[bool]` (non-optional)

## Other Common SQLAlchemy 2.0 Issues

### Issue: server_default vs default

**Symptom:** Datetime fields not getting default values, or errors about lambda functions.

**Problem:**
```python
# WRONG - server_default expects SQL expression, not Python callable
created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True), 
    server_default=lambda: datetime.now(timezone.utc)
)
```

**Solution:**
```python
# CORRECT - Use default for Python callables
created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True), 
    default=lambda: datetime.now(timezone.utc)
)

# OR use server_default with SQL function
from sqlalchemy import func
created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True), 
    server_default=func.now()
)
```

**Rule:** 
- `default=` → Python callable (executed in Python)
- `server_default=` → SQL expression (executed by database)

### Issue: Type Hint Mismatch

**Symptom:** Type checker errors or runtime type resolution failures.

**Problem:**
```python
# WRONG - Type hint says optional, but nullable=False
user_id: Mapped[uuid.UUID | None] = mapped_column(
    ForeignKey("users.id"), 
    nullable=False
)
```

**Solution:**
```python
# CORRECT - Type hint matches nullable parameter
user_id: Mapped[uuid.UUID] = mapped_column(
    ForeignKey("users.id"), 
    nullable=False
)
```

**Rule:** Type hint and `nullable` parameter must be consistent:
- `Mapped[T]` → `nullable=False` (or omit for non-nullable)
- `Mapped[T | None]` → `nullable=True`

### Issue: JSON Field Defaults

**Symptom:** Mutable default argument warnings or shared state between instances.

**Problem:**
```python
# WRONG - Mutable default shared between instances
tags: Mapped[list] = mapped_column(JSON, default=[])
```

**Solution:**
```python
# CORRECT - Use callable for mutable defaults
tags: Mapped[list] = mapped_column(JSON, default=list)

# OR use lambda
tags: Mapped[list] = mapped_column(JSON, default=lambda: [])
```

**Rule:** Always use callables for mutable defaults (list, dict, set).

## Diagnostic Workflow

When encountering SQLAlchemy errors:

### Step 1: Isolate the Model

```bash
# Test import of specific model file
docker compose run --rm api python -c "from app.db.models.marketplace import Booking"
```

If this fails, the error is in that specific model file.

### Step 2: Check Boolean Fields

Look for patterns like:
```python
field_name: Mapped[bool] = mapped_column(Boolean, default=X)
```

Add `nullable=False`:
```python
field_name: Mapped[bool] = mapped_column(Boolean, default=X, nullable=False)
```

### Step 3: Check Datetime Fields

Look for `server_default=lambda:` patterns and change to `default=lambda:`.

### Step 4: Run Automated Checker

```bash
python scripts/check_sqlalchemy_models.py
```

This script scans all model files for common issues.

### Step 5: Verify Fix

```bash
# Test model import
docker compose run --rm api python -c "from app.db.models import *"

# Start API
docker compose up --build
```

## Automated Tools

### Model Consistency Checker

Location: `scripts/check_sqlalchemy_models.py`

Checks for:
- Boolean fields missing `nullable` parameter
- `server_default` with lambda functions
- Type hint / nullable parameter mismatches
- Mutable defaults without callables

Usage:
```bash
python scripts/check_sqlalchemy_models.py
```

### Model Import Tester

Location: `scripts/test_model_imports.py`

Tests each model file individually to isolate import errors.

Usage:
```bash
python scripts/test_model_imports.py
```

## Best Practices

### 1. Always Be Explicit

Don't rely on SQLAlchemy's inference. Explicitly specify:
- `nullable=True` or `nullable=False`
- `default=` for Python callables
- `server_default=` for SQL expressions

### 2. Match Type Hints to Reality

```python
# Non-nullable
field: Mapped[T] = mapped_column(..., nullable=False)

# Nullable
field: Mapped[T | None] = mapped_column(..., nullable=True)
```

### 3. Use Callables for Mutable Defaults

```python
# Lists
tags: Mapped[list] = mapped_column(JSON, default=list)

# Dicts
metadata: Mapped[dict] = mapped_column(JSON, default=dict)

# Datetimes
created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True), 
    default=lambda: datetime.now(timezone.utc)
)
```

### 4. Test Model Imports Early

After creating or modifying models:
```bash
docker compose run --rm api python -c "from app.db.models import *"
```

### 5. Run Migrations Incrementally

Don't accumulate many model changes before creating migrations. Create migrations frequently:
```bash
docker compose run --rm api alembic revision -m "description" --autogenerate
```

## Reference: Fixed Issues

### 2026-02-24: Marketplace Boolean Field

**File:** `apps/api/app/db/models/marketplace.py`  
**Line:** 255  
**Field:** `client_followup_needed`

**Before:**
```python
client_followup_needed: Mapped[bool] = mapped_column(Boolean, default=False)
```

**After:**
```python
client_followup_needed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
```

**Impact:** API container failed to start with `TypeError: Boolean value of this clause is not defined`

**Resolution Time:** ~2 hours of debugging to identify root cause

**Lesson:** Always add `nullable=False` to non-nullable boolean fields in SQLAlchemy 2.0

## Additional Resources

- [SQLAlchemy 2.0 Migration Guide](https://docs.sqlalchemy.org/en/20/changelog/migration_20.html)
- [Mapped Column Documentation](https://docs.sqlalchemy.org/en/20/orm/mapping_api.html#sqlalchemy.orm.mapped_column)
- [Type Annotation Support](https://docs.sqlalchemy.org/en/20/orm/declarative_tables.html#using-annotated-declarative-table-type-annotated-forms-for-mapped-column)
