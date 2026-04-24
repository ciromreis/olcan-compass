"""Check what's actually stored in the database for psychology question options.

Run from the api-core-v2.5 directory:
    python scripts/check_psych_options.py

Requires DATABASE_URL in the environment (PostgreSQL).
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.core.config import settings
from app.db.models.psychology import PsychQuestion


async def check_options(database_url: str) -> None:
    engine = create_async_engine(database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        result = await db.execute(select(PsychQuestion).limit(1))
        question = result.scalar_one_or_none()
        if question:
            print('Question options:', question.options)
            if question.options:
                print('First option:', question.options[0])
                print('First option type:', type(question.options[0]))
                if isinstance(question.options[0], dict):
                    print('First option keys:', list(question.options[0].keys()))
        else:
            print('No questions found')

    await engine.dispose()


if __name__ == "__main__":
    db_url = os.environ.get("DATABASE_URL", settings.database_url)
    if not db_url:
        print("[ERROR] DATABASE_URL not set.", file=sys.stderr)
        sys.exit(1)
    asyncio.run(check_options(db_url))