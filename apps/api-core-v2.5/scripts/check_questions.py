"""Check all psychology questions in the database.

Run from the api-core-v2.5 directory:
    python scripts/check_questions.py

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


async def check_questions(database_url: str) -> None:
    engine = create_async_engine(database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        result = await db.execute(select(PsychQuestion))
        questions = result.scalars().all()
        print(f'Found {len(questions)} questions')
        for i, q in enumerate(questions[:5]):  # Check first 5
            print(f'\nQuestion {i+1}:')
            print(f'  ID: {q.id}')
            print(f'  text_en: {q.text_en[:50]}...')
            print(f'  question_type: {q.question_type}')
            print(f'  category: {q.category}')
            print(f'  options count: {len(q.options) if q.options else 0}')
            if q.options:
                print(f'  First option: {q.options[0]}')
                if len(q.options) > 1:
                    print(f'  Second option: {q.options[1]}')
        if len(questions) > 5:
            print(f'\n... and {len(questions) - 5} more questions')

    await engine.dispose()


if __name__ == "__main__":
    db_url = os.environ.get("DATABASE_URL", settings.database_url)
    if not db_url:
        print("[ERROR] DATABASE_URL not set.", file=sys.stderr)
        sys.exit(1)
    asyncio.run(check_questions(db_url))