"""Update existing psych question options to have label_en, label_pt, label_es fields.

Run from the api-core-v2.5 directory:
    python scripts/update_psych_options.py

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


async def update_options(database_url: str) -> None:
    engine = create_async_engine(database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        # Get all questions
        result = await db.execute(select(PsychQuestion))
        questions = result.scalars().all()

        if not questions:
            print("[INFO] No questions found.")
            await engine.dispose()
            return

        updated = 0
        for q in questions:
            if not q.options:
                continue
            # Check if already updated (has label_en in first option)
            first_opt = q.options[0] if q.options else None
            if first_opt and isinstance(first_opt, dict) and "label_en" in first_opt:
                continue  # already updated

            new_options = []
            for opt in q.options:
                # opt is expected to be: {"value": str, "label": str, "score": float}
                # We assume the label is in Portuguese (as per the seed) and use it for all languages
                label = opt.get("label", "")
                new_options.append({
                    "value": opt["value"],
                    "label_en": label,
                    "label_pt": label,
                    "label_es": label,
                    "score": opt["score"]
                })
            q.options = new_options
            updated += 1

        if updated:
            await db.commit()
            print(f"[OK] Updated {updated} questions.")
        else:
            print("[INFO] All questions already updated.")

    await engine.dispose()


if __name__ == "__main__":
    db_url = os.environ.get("DATABASE_URL", settings.database_url)
    if not db_url:
        print("[ERROR] DATABASE_URL not set.", file=sys.stderr)
        sys.exit(1)
    asyncio.run(update_options(db_url))