import asyncio
import os
import sys

# Add the parent directory to sys.path so we can import the app module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import AsyncSessionLocal
from app.db.models.user import User
from app.core.security.password import hash_password

async def seed_database():
    print("Starting database seed...")
    async with AsyncSessionLocal() as db:
        # Create test users if they do not exist
        # Assuming the User model has a method or we can execute a simple query
        
        # Check if test user exists
        from sqlalchemy import select
        result = await db.execute(select(User).where(User.email == "test@olcan.com"))
        existing_user = result.scalar_one_or_none()
        
        if existing_user is None:
            print("Creating test@olcan.com user")
            test_user = User(
                email="test@olcan.com",
                full_name="Test User",
                hashed_password=hash_password("password123"),
                is_verified=True
            )
            db.add(test_user)
            await db.commit()
            print("✓ Database seeded successfully with test user")
        else:
            print("Test user already exists. Skipping seed.")

if __name__ == "__main__":
    asyncio.run(seed_database())
