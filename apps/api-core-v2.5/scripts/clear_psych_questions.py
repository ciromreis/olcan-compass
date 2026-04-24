"""Clear existing psychology questions to allow re-seeding.

Run from the api-core-v2.5 directory:
    python scripts/clear_psych_questions.py

Requires DATABASE_URL in the environment (PostgreSQL).
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import delete

from app.core.config import settings
from app.db.models.psychology import PsychQuestion


async def clear_questions(database_url: str) -> None:
    engine = create_async_engine(database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        # Delete all questions
        await db.execute(delete(PsychQuestion))
        await db.commit()
        print('[OK] Cleared all psychology questions')

    await engine.dispose()


if __name__ == "__main__":
    db_url = os.environ.get("DATABASE_URL", settings.database_url)
    if not db_url:
        print("[ERROR] DATABASE_URL not set.", file=sys.stderr)
        sys.exit(1)
    asyncio.run(clear_questions(db_url))