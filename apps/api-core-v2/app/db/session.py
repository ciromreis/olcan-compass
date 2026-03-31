import re
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings

# Engine singleton — created once to allow connection pool reuse across all requests.
_engine: AsyncEngine | None = None
_sessionmaker: async_sessionmaker[AsyncSession] | None = None

# asyncpg rejects psycopg/libpq-only URL params — strip and convert them.
_UNSUPPORTED_ASYNCPG_PARAMS = re.compile(
    r"[?&](sslmode|channel_binding|connect_timeout|application_name)=[^&]*"
)
_SSL_REQUIRE_MODES = {"require", "verify-ca", "verify-full"}


def _sanitize_asyncpg_url(url: str) -> tuple[str, dict]:
    """
    Strip asyncpg-incompatible query params from *url* and return the
    cleaned URL plus a ``connect_args`` dict to pass to ``create_async_engine``.

    asyncpg uses ``ssl=True`` (via connect_args) instead of ``sslmode=require``
    in the connection string.
    """
    connect_args: dict = {}

    # Extract sslmode value before stripping
    sslmode_match = re.search(r"[?&]sslmode=([^&]+)", url)
    if sslmode_match and sslmode_match.group(1).lower() in _SSL_REQUIRE_MODES:
        connect_args["ssl"] = True

    # Strip all params that asyncpg's connect() doesn't understand
    clean_url = _UNSUPPORTED_ASYNCPG_PARAMS.sub("", url)
    # Ensure query string starts with ? not &
    clean_url = re.sub(r"&([^?])", r"?\1", clean_url, count=1)
    # Remove trailing ? if nothing follows
    clean_url = clean_url.rstrip("?")

    return clean_url, connect_args


def get_engine() -> AsyncEngine:
    """Return (or lazily create) the shared AsyncEngine singleton."""
    global _engine
    if _engine is None:
        settings = get_settings()
        url, connect_args = _sanitize_asyncpg_url(settings.database_url)
        _engine = create_async_engine(
            url,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            connect_args=connect_args,
        )
    return _engine


def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    """Return (or lazily create) the shared async sessionmaker singleton."""
    global _sessionmaker
    if _sessionmaker is None:
        _sessionmaker = async_sessionmaker(get_engine(), expire_on_commit=False)
    return _sessionmaker


# Convenience alias kept for backward compatibility
AsyncSessionLocal = get_sessionmaker()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that provides an async database session per request."""
    session_factory = get_sessionmaker()
    async with session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise

