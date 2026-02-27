"""
Seed script: insert a test user for local development.

Usage (inside Docker):
    docker compose run --rm api python seed_data.py

Credentials:
    email: test@olcan.com
    password: Test1234
"""

import asyncio
import sys

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.base import Base
from app.db.models.user import User, UserRole


settings = get_settings()

engine = create_async_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

TEST_EMAIL = "test@olcan.com"
TEST_PASSWORD = "Test1234"
TEST_NAME = "Usuário Teste"


async def seed() -> None:
    async with SessionLocal() as session:
        result = await session.execute(
            select(User).where(func.lower(User.email) == TEST_EMAIL)
        )
        existing = result.scalar_one_or_none()

        if existing:
            print(f"[seed] User '{TEST_EMAIL}' already exists — skipping.")
            return

        user = User(
            email=TEST_EMAIL,
            hashed_password=hash_password(TEST_PASSWORD),
            full_name=TEST_NAME,
            is_active=True,
            is_verified=True,
            role=UserRole.USER,
            language="pt",
            timezone="America/Sao_Paulo",
        )
        session.add(user)
        await session.commit()
        print(f"[seed] Created test user: {TEST_EMAIL} / {TEST_PASSWORD}")


if __name__ == "__main__":
    asyncio.run(seed())
