"""
Database configuration and session management for Olcan Compass v2.5
Supports both PostgreSQL (production) and SQLite (development)
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
from typing import AsyncGenerator
import logging

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Database URL from settings with SQLite fallback only in non-production environments
DATABASE_URL = settings.database_url

if not DATABASE_URL:
    DATABASE_URL = "sqlite+aiosqlite:///./compass_v25.db"
    logger.warning("DATABASE_URL not configured. Falling back to SQLite development database.")

if settings.is_production and DATABASE_URL.startswith("sqlite"):
    raise RuntimeError("SQLite is not allowed in production. Configure a PostgreSQL DATABASE_URL.")

is_sqlite = DATABASE_URL.startswith("sqlite")

# Create async engine
engine_kwargs = {
    "echo": settings.database_echo,
    "pool_pre_ping": True,
    "connect_args": {"check_same_thread": False} if is_sqlite else {},
}

if is_sqlite:
    engine_kwargs["poolclass"] = NullPool
else:
    engine_kwargs.update(
        {
            "pool_size": settings.db_pool_size,
            "max_overflow": settings.db_max_overflow,
            "pool_timeout": settings.db_pool_timeout,
            "pool_recycle": settings.db_pool_recycle,
        }
    )

engine = create_async_engine(DATABASE_URL, **engine_kwargs)

# Create async session maker
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting async database sessions
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """
    Initialize database - create all tables
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def test_db_connection() -> bool:
    """
    Test database connection
    """
    try:
        from sqlalchemy import text
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.exception("Database connection failed")
        return False
