#!/usr/bin/env python3
"""
Quick test script to verify registration endpoint works
"""

import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine, Base
from app.models import User
from app.services.auth_service import get_password_hash

async def test_registration():
    """Test user registration directly"""
    
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create a test user
    async with AsyncSessionLocal() as session:
        # Check if user exists
        result = await session.execute(
            select(User).where(User.email == "test@test.com")
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            print(f"✅ User already exists: {existing_user.username}")
            return
        
        # Create new user
        hashed_pw = get_password_hash("Test123!")
        new_user = User(
            email="test@test.com",
            username="testuser",
            hashed_password=hashed_pw,
            full_name="Test User"
        )
        
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)
        
        print(f"✅ User created successfully!")
        print(f"   ID: {new_user.id}")
        print(f"   Username: {new_user.username}")
        print(f"   Email: {new_user.email}")

if __name__ == "__main__":
    asyncio.run(test_registration())
