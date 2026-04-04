import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import get_settings
from app.core.security import hash_password

async def update_admin():
    engine = create_async_engine(get_settings().database_url.replace("postgresql://", "postgresql+asyncpg://") if not "asyncpg" in get_settings().database_url else get_settings().database_url)
    async with engine.begin() as conn:
        pwd = hash_password("Password123")
        await conn.execute(text("UPDATE users SET hashed_password = :pwd WHERE email = 'admin@olcan.compass'"), {"pwd": pwd})
        print("Admin password updated successfully directly via SQL.")

asyncio.run(update_admin())
