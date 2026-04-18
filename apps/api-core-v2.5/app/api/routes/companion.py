"""Companion API Endpoints

Provides endpoints for companion interaction, tamagotchi mechanics, and messaging.
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Body, Request
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models.companion import Companion, CompanionMessage, CompanionActivity
from app.db.models.psychology import PsychProfile, ProfessionalArchetype
from app.core.auth import get_current_user
from app.core.rate_limit import limiter
from app.db.models.user import User
from app.services.companion_service import CompanionService
from app.services.companion_message_generator import CompanionMessageGenerator


router = APIRouter(prefix="/companion", tags=["companion"])


# Pydantic models for request/response
class InitializeCompanionRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)


class FeedCompanionRequest(BaseModel):
    task_completed: str = Field(..., min_length=5, max_length=300)
    xp_earned: int = Field(50, ge=10, le=500)


class SendMessageRequest(BaseModel):
    message_type: str = Field(..., pattern="^(encouragement|tip|reminder)$")
    context: Optional[dict] = None


@router.get("/", response_model=dict)
async def get_companion(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's companion
    
    Returns:
        Companion details with stats and progress
    """
    result = await session.execute(
        select(Companion).where(Companion.user_id == current_user.id)
    )
    companion = result.scalar_one_or_none()
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found. Initialize a companion first."
        )
    
    # Get recent activities
    activities_result = await session.execute(
        select(CompanionActivity)
        .where(CompanionActivity.companion_id == companion.id)
        .order_by(CompanionActivity.completed_at.desc())
        .limit(10)
    )
    recent_activities = activities_result.scalars().all()
    
    # Get unread messages count
    messages_result = await session.execute(
        select(CompanionMessage)
        .where(
            CompanionMessage.companion_id == companion.id,
            CompanionMessage.is_read == False
        )
    )
    unread_messages = len(messages_result.scalars().all())
    
    return {
        "id": str(companion.id),
        "name": companion.name,
        "archetype": companion.archetype,
        "personality_type": companion.personality_type,
        "communication_style": companion.communication_style,
        "evolution_stage": companion.evolution_stage,
        "evolution_path": companion.evolution_path,
        "current_form": companion.current_form,
        "level": companion.level,
        "xp": companion.xp,
        "xp_to_next_level": companion.xp_to_next_level,
        "xp_progress_percentage": int((companion.xp / companion.xp_to_next_level) * 100),
        "happiness": companion.happiness,
        "energy": companion.energy,
        "health": companion.health,
        "mood": companion.mood.value,
        "abilities": companion.abilities,
        "visual_theme": companion.visual_theme,
        "accessories": companion.accessories,
        "stats": companion.stats,
        "route_progress_percentage": companion.route_progress_percentage,
        "interaction_count": companion.interaction_count,
        "messages_sent": companion.messages_sent,
        "last_interaction": companion.last_interaction.isoformat(),
        "last_fed": companion.last_fed.isoformat(),
        "last_played": companion.last_played.isoformat(),
        "unread_messages": unread_messages,
        "recent_activities": [
            {
                "activity_type": act.activity_type.value,
                "description": act.description,
                "xp_reward": act.xp_reward,
                "completed_at": act.completed_at.isoformat()
            }
            for act in recent_activities
        ],
        "created_at": companion.created_at.isoformat()
    }


@router.post("/initialize", response_model=dict, status_code=status.HTTP_201_CREATED)
async def initialize_companion(
    request: InitializeCompanionRequest,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Initialize a new companion for the user
    
    Creates a companion based on user's archetype from psychological profile.
    
    Args:
        request: Optional custom name for companion
        
    Returns:
        Newly created companion
    """
    # Check if companion already exists
    existing_result = await session.execute(
        select(Companion).where(Companion.user_id == current_user.id)
    )
    existing_companion = existing_result.scalar_one_or_none()
    
    if existing_companion:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Companion already exists for this user"
        )
    
    # Get user's archetype from psych profile
    psych_result = await session.execute(
        select(PsychProfile).where(PsychProfile.user_id == current_user.id)
    )
    psych_profile = psych_result.scalar_one_or_none()
    
    if not psych_profile or not psych_profile.dominant_archetype:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must complete psychological assessment first"
        )
    
    # Initialize companion
    service = CompanionService(session)
    companion = await service.initialize_companion(
        user_id=current_user.id,
        archetype=psych_profile.dominant_archetype,
        name=request.name
    )
    
    return {
        "id": str(companion.id),
        "name": companion.name,
        "archetype": companion.archetype,
        "personality_type": companion.personality_type,
        "current_form": companion.current_form,
        "level": companion.level,
        "message": f"Welcome! {companion.name} is ready to join your journey! 🎉"
    }


@router.post("/feed", response_model=dict)
@limiter.limit("20/minute")
async def feed_companion(
    request: Request,
    feed_request: FeedCompanionRequest,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Feed companion by completing a task
    
    Feeding increases happiness, energy, and grants XP.
    May trigger level up or evolution.
    
    Args:
        request: Task completed and XP earned
        
    Returns:
        Updated companion stats and any evolution info
    """
    # Get companion
    result = await session.execute(
        select(Companion).where(Companion.user_id == current_user.id)
    )
    companion = result.scalar_one_or_none()
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found. Initialize a companion first."
        )
    
    # Feed companion
    service = CompanionService(session)
    result = await service.feed_companion(
        companion,
        task_completed=feed_request.task_completed,
        xp_earned=feed_request.xp_earned
    )

    # Build response message
    message = f"Yum! {companion.name} gained {feed_request.xp_earned} XP! 🍽️"
    if result.get("leveled_up"):
        message = f"🎉 Level Up! {companion.name} is now level {result['level']}!"
    if result.get("evolution"):
        evolution = result["evolution"]
        if evolution.get("evolved"):
            message = f"✨ EVOLUTION! {companion.name} evolved to {evolution['new_form']}!"
    
    return {
        **result,
        "companion_name": companion.name,
        "message": message
    }


@router.post("/play", response_model=dict)
async def play_with_companion(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Play with companion to increase happiness
    
    Playing increases happiness significantly but decreases energy slightly.
    Grants small XP reward for interaction.
    
    Returns:
        Updated companion stats
    """
    # Get companion
    result = await session.execute(
        select(Companion).where(Companion.user_id == current_user.id)
    )
    companion = result.scalar_one_or_none()
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found. Initialize a companion first."
        )
    
    # Play with companion
    service = CompanionService(session)
    result = await service.play_with_companion(companion)
    
    # Generate fun message based on mood
    mood_messages = {
        "excited": f"{companion.name} is super excited! 🎉",
        "happy": f"{companion.name} had a great time! 😊",
        "neutral": f"{companion.name} enjoyed that! 🙂",
        "tired": f"{companion.name} is getting tired... 😴",
        "sad": f"{companion.name} feels a bit better now. 💙"
    }
    
    message = mood_messages.get(result["mood"], f"Played with {companion.name}! 🎮")
    
    return {
        **result,
        "companion_name": companion.name,
        "message": message
    }


@router.get("/messages", response_model=List[dict])
async def get_companion_messages(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    unread_only: bool = False,
    limit: int = 50
):
    """Get companion messages
    
    Args:
        unread_only: Only return unread messages
        limit: Maximum number of messages to return
        
    Returns:
        List of companion messages
    """
    # Get companion
    companion_result = await session.execute(
        select(Companion).where(Companion.user_id == current_user.id)
    )
    companion = companion_result.scalar_one_or_none()
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found. Initialize a companion first."
        )
    
    # Build query
    query = select(CompanionMessage).where(
        CompanionMessage.companion_id == companion.id
    )
    
    if unread_only:
        query = query.where(CompanionMessage.is_read == False)
    
    query = query.order_by(CompanionMessage.created_at.desc()).limit(limit)
    
    # Get messages
    result = await session.execute(query)
    messages = result.scalars().all()
    
    return [
        {
            "id": str(msg.id),
            "message_type": msg.message_type,
            "message_text": msg.message_text,
            "archetype_tone": msg.archetype_tone,
            "is_read": msg.is_read,
            "read_at": msg.read_at.isoformat() if msg.read_at else None,
            "user_reaction": msg.user_reaction,
            "created_at": msg.created_at.isoformat()
        }
        for msg in messages
    ]


@router.post("/messages/{message_id}/read", response_model=dict)
async def mark_message_as_read(
    message_id: UUID,
    reaction: Optional[str] = Body(None, embed=True),
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a companion message as read
    
    Args:
        message_id: Message UUID
        reaction: Optional user reaction (like, love, helpful, dismiss)
        
    Returns:
        Updated message
    """
    # Get companion
    companion_result = await session.execute(
        select(Companion).where(Companion.user_id == current_user.id)
    )
    companion = companion_result.scalar_one_or_none()
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found"
        )
    
    # Get message
    message_result = await session.execute(
        select(CompanionMessage).where(
            CompanionMessage.id == message_id,
            CompanionMessage.companion_id == companion.id
        )
    )
    message = message_result.scalar_one_or_none()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Mark as read
    from datetime import datetime, timezone
    message.is_read = True
    message.read_at = datetime.now(timezone.utc)
    
    if reaction:
        message.user_reaction = reaction
    
    await session.commit()
    
    return {
        "id": str(message.id),
        "is_read": message.is_read,
        "read_at": message.read_at.isoformat(),
        "user_reaction": message.user_reaction,
        "message": "Message marked as read"
    }


@router.post("/messages/send", response_model=dict)
@limiter.limit("10/minute")
async def send_companion_message(
    http_request: Request,
    request: SendMessageRequest,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Request a message from companion
    
    Generates and sends a new message from companion based on type.
    
    Args:
        request: Message type and optional context
        
    Returns:
        Generated message
    """
    # Get companion
    companion_result = await session.execute(
        select(Companion).where(Companion.user_id == current_user.id)
    )
    companion = companion_result.scalar_one_or_none()
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found. Initialize a companion first."
        )
    
    # Generate message
    message_generator = CompanionMessageGenerator(session)
    
    if request.message_type == "encouragement":
        message = await message_generator.generate_encouragement_message(
            companion, request.context
        )
    elif request.message_type == "tip":
        tip_category = request.context.get("category", "general") if request.context else "general"
        message = await message_generator.generate_tip_message(
            companion, tip_category
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Message type '{request.message_type}' not supported for manual generation"
        )
    
    # Save message
    session.add(message)
    companion.messages_sent += 1
    await session.commit()
    
    return {
        "id": str(message.id),
        "message_type": message.message_type,
        "message_text": message.message_text,
        "archetype_tone": message.archetype_tone,
        "created_at": message.created_at.isoformat()
    }


@router.get("/stats", response_model=dict)
async def get_companion_stats(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed companion statistics
    
    Returns:
        Comprehensive companion stats and history
    """
    # Get companion
    companion_result = await session.execute(
        select(Companion).where(Companion.user_id == current_user.id)
    )
    companion = companion_result.scalar_one_or_none()
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found"
        )
    
    # Get activity count by type
    from sqlalchemy import func
    activities_result = await session.execute(
        select(
            CompanionActivity.activity_type,
            func.count(CompanionActivity.id).label('count')
        )
        .where(CompanionActivity.companion_id == companion.id)
        .group_by(CompanionActivity.activity_type)
    )
    activity_counts = {row[0].value: row[1] for row in activities_result.all()}
    
    # Get evolution history
    from app.db.models.companion import CompanionEvolution
    evolutions_result = await session.execute(
        select(CompanionEvolution)
        .where(CompanionEvolution.companion_id == companion.id)
        .order_by(CompanionEvolution.evolved_at.desc())
    )
    evolutions = evolutions_result.scalars().all()
    
    # Calculate time to next evolution
    level_thresholds = {2: 6, 3: 16, 4: 31, 5: 51}
    next_evolution_level = None
    for stage, level in level_thresholds.items():
        if companion.evolution_stage < stage and companion.level < level:
            next_evolution_level = level
            break
    
    return {
        "companion_name": companion.name,
        "level": companion.level,
        "xp": companion.xp,
        "xp_to_next_level": companion.xp_to_next_level,
        "evolution_stage": companion.evolution_stage,
        "current_form": companion.current_form,
        "next_evolution_level": next_evolution_level,
        "levels_to_evolution": next_evolution_level - companion.level if next_evolution_level else None,
        "happiness": companion.happiness,
        "energy": companion.energy,
        "health": companion.health,
        "mood": companion.mood.value,
        "stats": companion.stats,
        "abilities": companion.abilities,
        "total_interactions": companion.interaction_count,
        "messages_sent": companion.messages_sent,
        "activity_counts": activity_counts,
        "evolution_history": [
            {
                "from_stage": evo.from_stage,
                "to_stage": evo.to_stage,
                "from_form": evo.from_form,
                "to_form": evo.to_form,
                "level_at_evolution": evo.level_at_evolution,
                "evolved_at": evo.evolved_at.isoformat()
            }
            for evo in evolutions
        ],
        "days_together": (companion.created_at - companion.created_at).days,
        "created_at": companion.created_at.isoformat()
    }


@router.post("/rest", response_model=dict)
async def rest_companion(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Let companion rest to restore energy
    
    Restores energy but slightly decreases happiness.
    
    Returns:
        Updated companion stats
    """
    # Get companion
    result = await session.execute(
        select(Companion).where(Companion.user_id == current_user.id)
    )
    companion = result.scalar_one_or_none()
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found"
        )
    
    # Rest companion
    companion.energy = min(100, companion.energy + 30)
    companion.happiness = max(0, companion.happiness - 5)
    
    # Update mood
    service = CompanionService(session)
    companion.mood = service._calculate_mood(companion)
    
    # Record activity
    from datetime import datetime, timezone
    activity = CompanionActivity(
        id=UUID(int=0),  # Will be auto-generated
        companion_id=companion.id,
        activity_type="rest",
        description="Companion rested",
        xp_reward=0,
        happiness_change=-5,
        energy_change=30
    )
    session.add(activity)
    
    await session.commit()
    
    return {
        "companion_name": companion.name,
        "energy": companion.energy,
        "happiness": companion.happiness,
        "mood": companion.mood.value,
        "message": f"{companion.name} feels refreshed! 😌"
    }


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_companion(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete companion
    
    Warning: This action cannot be undone!
    """
    # Get companion
    result = await session.execute(
        select(Companion).where(Companion.user_id == current_user.id)
    )
    companion = result.scalar_one_or_none()
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found"
        )
    
    await session.delete(companion)
    await session.commit()
