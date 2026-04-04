"""Seed user constraint profiles for testing deterministic pruning"""

import uuid
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.db.models.constraints import UserConstraintProfile
from app.db.models.user import User


async def seed_constraint_profiles():
    """Seed constraint profiles for test users"""
    async with AsyncSessionLocal() as db:
        # Get test user
        result = await db.execute(
            select(User).where(User.email == "compass.tester@example.com")
        )
        user = result.scalar_one_or_none()
        
        if not user:
            print("Test user not found")
            return
        
        # Check if profile already exists
        result = await db.execute(
            select(UserConstraintProfile).where(
                UserConstraintProfile.user_id == user.id
            )
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            print("Constraint profile already exists for test user")
            return
        
        # Create constraint profile
        profile = UserConstraintProfile(
            user_id=user.id,
            budget_max=50000.00,  # $50k max budget
            time_available_months=24,  # 2 years
            weekly_bandwidth_hours=20,  # 20 hours/week
            languages=[
                {"code": "en", "level": "C1", "name": "Inglês"},
                {"code": "pt", "level": "B2", "name": "Português"},
                {"code": "es", "level": "A2", "name": "Espanhol"}
            ],
            target_countries=["US", "UK", "CA", "PT"],  # USA, UK, Canada, Portugal
            excluded_countries=["RU", "FR"],  # Exclude Russia, France
            education_level="bachelor",  # Bachelor's degree
            years_experience=5,  # 5 years experience
            visa_status="F1",  # Student visa
            citizenship_countries=["BR"],  # Brazilian citizenship
            commitment_level="flexible",
            risk_tolerance="moderate"
        )
        
        db.add(profile)
        await db.commit()
        
        print(f"✅ Created constraint profile for user {user.email}")
        print(f"   Budget: ${profile.budget_max}")
        print(f"   Timeline: {profile.time_available_months} months")
        print(f"   Target countries: {', '.join(profile.target_countries)}")


if __name__ == "__main__":
    asyncio.run(seed_constraint_profiles())
