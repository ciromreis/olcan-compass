"""
Companion endpoints for Olcan Compass v2.5
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.companion import Companion, CompanionActivity

router = APIRouter(tags=["companions"])


@router.get("/", response_model=List[dict])
async def get_user_companions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all companions for the current user"""
    result = await db.execute(
        select(Companion).where(Companion.user_id == current_user.id)
    )
    companions = result.scalars().all()
    
    return [
        {
            "id": c.id,
            "name": c.name,
            "type": c.type,
            "level": c.level,
            "xp": c.xp,
            "xp_to_next": c.xp_to_next,
            "evolution_stage": c.evolution_stage,
            "abilities": c.abilities,
            "stats": c.stats,
            "current_health": c.current_health,
            "max_health": c.max_health,
            "energy": c.energy,
            "max_energy": c.max_energy,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in companions
    ]


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_companion(
    name: str,
    companion_type: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new companion for the current user"""
    # Create companion with default values
    companion = Companion(
        user_id=current_user.id,
        name=name,
        type=companion_type,
        level=1,
        xp=0,
        xp_to_next=500,
        evolution_stage="egg",
        abilities=[],
        stats={"power": 70, "wisdom": 70, "charisma": 70, "agility": 70},
        current_health=100.0,
        max_health=100.0,
        energy=100.0,
        max_energy=100.0
    )
    
    db.add(companion)
    await db.commit()
    await db.refresh(companion)
    
    return {
        "id": companion.id,
        "name": companion.name,
        "type": companion.type,
        "level": companion.level,
        "xp": companion.xp,
        "xp_to_next": companion.xp_to_next,
        "evolution_stage": companion.evolution_stage,
        "abilities": companion.abilities,
        "stats": companion.stats,
        "current_health": companion.current_health,
        "max_health": companion.max_health,
        "energy": companion.energy,
        "max_energy": companion.max_energy,
        "created_at": companion.created_at.isoformat() if companion.created_at else None,
    }


@router.get("/{companion_id}", response_model=dict)
async def get_companion(
    companion_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific companion"""
    result = await db.execute(
        select(Companion).where(
            Companion.id == companion_id,
            Companion.user_id == current_user.id
        )
    )
    companion = result.scalar_one_or_none()
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found"
        )
    
    return {
        "id": companion.id,
        "name": companion.name,
        "type": companion.type,
        "level": companion.level,
        "xp": companion.xp,
        "xp_to_next": companion.xp_to_next,
        "evolution_stage": companion.evolution_stage,
        "abilities": companion.abilities,
        "stats": companion.stats,
        "current_health": companion.current_health,
        "max_health": companion.max_health,
        "energy": companion.energy,
        "max_energy": companion.max_energy,
        "created_at": companion.created_at.isoformat() if companion.created_at else None,
        "updated_at": companion.updated_at.isoformat() if companion.updated_at else None,
    }


@router.post("/{companion_id}/feed", response_model=dict)
async def feed_companion(
    companion_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Feed a companion to restore energy"""
    result = await db.execute(
        select(Companion).where(
            Companion.id == companion_id,
            Companion.user_id == current_user.id
        )
    )
    companion = result.scalar_one_or_none()
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found"
        )
    
    # Restore energy
    companion.energy = min(companion.energy + 20, companion.max_energy)
    companion.xp += 10
    
    # Create activity record
    activity = CompanionActivity(
        companion_id=companion.id,
        activity_type="feed",
        xp_reward=10,
        energy_cost=0,
        description="Fed companion"
    )
    db.add(activity)
    
    await db.commit()
    await db.refresh(companion)
    
    return {
        "message": "Companion fed successfully",
        "energy": companion.energy,
        "xp": companion.xp
    }


@router.post("/{companion_id}/train", response_model=dict)
async def train_companion(
    companion_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Train a companion to gain XP"""
    result = await db.execute(
        select(Companion).where(
            Companion.id == companion_id,
            Companion.user_id == current_user.id
        )
    )
    companion = result.scalar_one_or_none()
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found"
        )
    
    if companion.energy < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough energy to train"
        )
    
    # Train companion
    companion.energy -= 10
    companion.xp += 50
    
    # Check for level up
    if companion.xp >= companion.xp_to_next:
        companion.level += 1
        companion.xp = companion.xp - companion.xp_to_next
        companion.xp_to_next = int(companion.xp_to_next * 1.5)
    
    # Create activity record
    activity = CompanionActivity(
        companion_id=companion.id,
        activity_type="train",
        xp_reward=50,
        energy_cost=10,
        description="Trained companion"
    )
    db.add(activity)
    
    await db.commit()
    await db.refresh(companion)
    
    return {
        "message": "Companion trained successfully",
        "level": companion.level,
        "xp": companion.xp,
        "energy": companion.energy
    }


@router.post("/{companion_id}/play", response_model=dict)
async def play_with_companion(
    companion_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Play with companion to increase happiness and gain XP"""
    result = await db.execute(
        select(Companion).where(
            Companion.id == companion_id,
            Companion.user_id == current_user.id
        )
    )
    companion = result.scalar_one_or_none()
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found"
        )
    
    if companion.energy < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough energy to play"
        )
    
    # Play with companion
    companion.energy -= 5
    companion.xp += 15
    
    # Check for level up
    if companion.xp >= companion.xp_to_next:
        companion.level += 1
        companion.xp = companion.xp - companion.xp_to_next
        companion.xp_to_next = int(companion.xp_to_next * 1.5)
    
    # Create activity record
    activity = CompanionActivity(
        companion_id=companion.id,
        activity_type="play",
        xp_reward=15,
        energy_cost=5,
        description="Played with companion"
    )
    db.add(activity)
    
    await db.commit()
    await db.refresh(companion)
    
    return {
        "message": "Had fun playing with companion!",
        "level": companion.level,
        "xp": companion.xp,
        "energy": companion.energy
    }


@router.post("/{companion_id}/rest", response_model=dict)
async def rest_companion(
    companion_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Let companion rest to restore energy"""
    result = await db.execute(
        select(Companion).where(
            Companion.id == companion_id,
            Companion.user_id == current_user.id
        )
    )
    companion = result.scalar_one_or_none()
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found"
        )
    
    # Rest companion - restore significant energy
    energy_restored = min(30, companion.max_energy - companion.energy)
    companion.energy = min(companion.energy + 30, companion.max_energy)
    
    # Create activity record
    activity = CompanionActivity(
        companion_id=companion.id,
        activity_type="rest",
        xp_reward=0,
        energy_cost=0,
        description="Companion rested"
    )
    db.add(activity)
    
    await db.commit()
    await db.refresh(companion)
    
    return {
        "message": "Companion is well rested!",
        "energy": companion.energy,
        "energy_restored": energy_restored
    }


@router.get("/{companion_id}/activities", response_model=list)
async def get_companion_activities(
    companion_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 10
):
    """Get recent activities for a companion"""
    # Verify companion belongs to user
    result = await db.execute(
        select(Companion).where(
            Companion.id == companion_id,
            Companion.user_id == current_user.id
        )
    )
    companion = result.scalar_one_or_none()
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found"
        )
    
    # Get activities
    result = await db.execute(
        select(CompanionActivity)
        .where(CompanionActivity.companion_id == companion_id)
        .order_by(CompanionActivity.completed_at.desc())
        .limit(limit)
    )
    activities = result.scalars().all()
    
    return [
        {
            "id": a.id,
            "activity_type": a.activity_type,
            "xp_reward": a.xp_reward,
            "energy_cost": a.energy_cost,
            "description": a.description,
            "completed_at": a.completed_at.isoformat() if a.completed_at else None
        }
        for a in activities
    ]
