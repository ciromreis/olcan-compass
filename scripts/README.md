# Scripts Directory

Repository-level scripts used for diagnostics and maintenance.

## Current Structure

- `scripts/check_sqlalchemy_models.py` - model integrity checks
- `scripts/test_model_imports.py` - import validation checks
- `scripts/archive/` - historical one-off scripts kept for traceability

## Guidelines

- Keep one-off or unsafe scripts inside `scripts/archive/`.
- Prefer deterministic, documented scripts in `scripts/` root.
- Add usage notes at the top of each new script.
