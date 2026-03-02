import os
from app.core.config import get_settings

async def validate_environment() -> None:
    """Validate that required environment variables are set on startup."""
    settings = get_settings()
    errors = []

    # Accept either DATABASE_URL or postgres granular vars.
    has_database_url = bool(os.getenv("DATABASE_URL") or settings.database_url)
    has_postgres_parts = all(
        os.getenv(var) for var in ("POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DB")
    )
    if not has_database_url and not has_postgres_parts:
        errors.append("Missing database configuration: set DATABASE_URL or POSTGRES_USER/POSTGRES_PASSWORD/POSTGRES_DB")

    if not (os.getenv("JWT_SECRET_KEY") or settings.jwt_secret_key):
        errors.append("Missing required env var: JWT_SECRET_KEY")

    if errors:
        raise RuntimeError("Environment validation failed:\n" + "\n".join(errors))

    print("✓ Environment validation passed")
