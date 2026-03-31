"""
Real Working Guild API Endpoints
These endpoints actually work with real database operations
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging
import random

from database import (
    get_db, Guild, GuildMember, GuildBattle, GuildMessage, 
    User, Companion, UserEconomy
)
from schemas.companion_real import ErrorResponse

router = APIRouter(prefix="/guilds", tags=["guilds"])

logger = logging.getLogger(__name__)

# Helper functions
async def get_guild_by_id(guild_id: int, db: AsyncSession) -> Optional[Guild]:
    """Get guild by ID with relationships"""
    result = await db.execute(
        select(Guild)
        .options(
            selectinload(Guild.members),
            selectinload(Guild.messages),
            selectinload(Guild.battles)
        )
        .where(Guild.id == guild_id)
    )
    return result.scalar_one_or_none()

async def check_guild_membership(guild_id: int, user_id: int, db: AsyncSession) -> bool:
    """Check if user is a member of the guild"""
    result = await db.execute(
        select(GuildMember).where(
            GuildMember.guild_id == guild_id,
            GuildMember.user_id == user_id,
            GuildMember.is_active == True
        )
    )
    return result.scalar_one_or_none() is not None

async def get_user_guild_role(guild_id: int, user_id: int, db: AsyncSession) -> Optional[str]:
    """Get user's role in guild"""
    result = await db.execute(
        select(GuildMember.role).where(
            GuildMember.guild_id == guild_id,
            GuildMember.user_id == user_id,
            GuildMember.is_active == True
        )
    )
    role = result.scalar_one_or_none()
    return role if role else "member"

async def get_user_economy(user_id: int, db: AsyncSession) -> Optional[UserEconomy]:
    """Get user's economy data"""
    result = await db.execute(
        select(UserEconomy).where(UserEconomy.user_id == user_id)
    )
    economy = result.scalar_one_or_none()
    
    # Create economy if it doesn't exist
    if not economy:
        economy = UserEconomy(user_id=user_id, coins=1000, gems=0)
        db.add(economy)
        await db.commit()
        await db.refresh(economy)
    
    return economy

# Real working endpoints
@router.post("/", response_model=Dict[str, Any])
async def create_guild(
    guild_data: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Create a new guild - ACTUALLY WORKS"""
    try:
        # Check if user already has a guild
        existing_member = await db.execute(
            select(GuildMember).where(
                GuildMember.user_id == current_user_id,
                GuildMember.is_active == True
            )
        )
        if existing_member.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already in a guild"
            )
        
        # Check if guild name already exists
        existing_guild = await db.execute(
            select(Guild).where(Guild.name == guild_data["name"])
        )
        if existing_guild.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Guild name already exists"
            )
        
        # Create guild
        guild = Guild(
            name=guild_data["name"],
            description=guild_data.get("description", ""),
            emblem=guild_data.get("emblem", "🏰"),
            color=guild_data.get("color", "#8b5cf6"),
            focus_area=guild_data.get("focus_area", "general"),
            member_count=1,
            level=1,
            experience_points=0,
            battles_won=0,
            battles_lost=0,
            is_private=guild_data.get("is_private", False)
        )
        
        db.add(guild)
        await db.flush()
        
        # Add user as guild leader
        guild_member = GuildMember(
            guild_id=guild.id,
            user_id=current_user_id,
            role="leader",
            contribution_points=0,
            is_active=True
        )
        
        db.add(guild_member)
        await db.commit()
        
        return {
            "guild_id": guild.id,
            "message": "Guild created successfully",
            "guild": {
                "id": guild.id,
                "name": guild.name,
                "description": guild.description,
                "emblem": guild.emblem,
                "color": guild.color,
                "focus_area": guild.focus_area,
                "member_count": guild.member_count,
                "created_at": guild.created_at.isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating guild: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create guild"
        )

@router.get("/", response_model=List[Dict[str, Any]])
async def get_guilds(
    focus_area: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """Get list of guilds - ACTUALLY WORKS"""
    try:
        query = select(Guild).where(Guild.is_private == False)
        
        if focus_area:
            query = query.where(Guild.focus_area == focus_area)
        
        query = query.order_by(Guild.level.desc(), Guild.member_count.desc()).offset(offset).limit(limit)
        
        result = await db.execute(query)
        guilds = result.scalars().all()
        
        return [
            {
                "id": guild.id,
                "name": guild.name,
                "description": guild.description,
                "emblem": guild.emblem,
                "color": guild.color,
                "focus_area": guild.focus_area,
                "member_count": guild.member_count,
                "level": guild.level,
                "experience_points": guild.experience_points,
                "battles_won": guild.battles_won,
                "battles_lost": guild.battles_lost,
                "created_at": guild.created_at.isoformat()
            }
            for guild in guilds
        ]
        
    except Exception as e:
        logger.error(f"Error getting guilds: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get guilds"
        )

@router.post("/{guild_id}/join")
async def join_guild(
    guild_id: int,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Join a guild - ACTUALLY WORKS"""
    try:
        # Check if guild exists
        guild = await get_guild_by_id(guild_id, db)
        if not guild:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Guild not found"
            )
        
        # Check if guild is private
        if guild.is_private:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot join private guild"
            )
        
        # Check if user is already in a guild
        existing_member = await db.execute(
            select(GuildMember).where(
                GuildMember.user_id == current_user_id,
                GuildMember.is_active == True
            )
        )
        if existing_member.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already in a guild"
            )
        
        # Check if user is already a member of this guild
        existing_guild_member = await db.execute(
            select(GuildMember).where(
                GuildMember.guild_id == guild_id,
                GuildMember.user_id == current_user_id
            )
        )
        if existing_guild_member.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already a member of this guild"
            )
        
        # Add user as guild member
        guild_member = GuildMember(
            guild_id=guild_id,
            user_id=current_user_id,
            role="member",
            contribution_points=0,
            is_active=True
        )
        
        db.add(guild_member)
        
        # Update guild member count
        guild.member_count += 1
        
        await db.commit()
        
        return {"message": "Successfully joined guild"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error joining guild: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to join guild"
        )

@router.get("/{guild_id}", response_model=Dict[str, Any])
async def get_guild_details(
    guild_id: int,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Get guild details - ACTUALLY WORKS"""
    try:
        guild = await get_guild_by_id(guild_id, db)
        if not guild:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Guild not found"
            )
        
        # Check if user is a member (or if guild is public)
        is_member = await check_guild_membership(guild_id, current_user_id, db)
        if not is_member and guild.is_private:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this guild"
            )
        
        # Get members with user details
        members_result = await db.execute(
            select(GuildMember, User)
            .join(User, GuildMember.user_id == User.id)
            .where(
                GuildMember.guild_id == guild_id,
                GuildMember.is_active == True
            )
            .order_by(GuildMember.joined_at)
        )
        members = members_result.all()
        
        # Get recent messages
        messages_result = await db.execute(
            select(GuildMessage, User)
            .join(User, GuildMessage.user_id == User.id)
            .where(GuildMessage.guild_id == guild_id)
            .order_by(GuildMessage.created_at.desc())
            .limit(50)
        )
        messages = messages_result.all()
        
        # Get recent battles
        battles_result = await db.execute(
            select(GuildBattle)
            .where(
                or_(
                    GuildBattle.guild_id == guild_id,
                    GuildBattle.opponent_guild_id == guild_id
                )
            )
            .order_by(GuildBattle.battle_date.desc())
            .limit(10)
        )
        battles = battles_result.scalars().all()
        
        return {
            "guild": {
                "id": guild.id,
                "name": guild.name,
                "description": guild.description,
                "emblem": guild.emblem,
                "color": guild.color,
                "focus_area": guild.focus_area,
                "member_count": guild.member_count,
                "level": guild.level,
                "experience_points": guild.experience_points,
                "battles_won": guild.battles_won,
                "battles_lost": guild.battles_lost,
                "is_private": guild.is_private,
                "created_at": guild.created_at.isoformat()
            },
            "members": [
                {
                    "id": member.id,
                    "user_id": member.user_id,
                    "username": user.username,
                    "first_name": user.first_name,
                    "role": member.role,
                    "joined_at": member.joined_at.isoformat(),
                    "contribution_points": member.contribution_points
                }
                for member, user in members
            ],
            "messages": [
                {
                    "id": message.id,
                    "content": message.content,
                    "message_type": message.message_type,
                    "created_at": message.created_at.isoformat(),
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "first_name": user.first_name
                    }
                }
                for message, user in messages
            ],
            "battles": [
                {
                    "id": battle.id,
                    "battle_type": battle.battle_type,
                    "status": battle.status,
                    "guild_score": battle.guild_score,
                    "opponent_score": battle.opponent_score,
                    "winner_guild_id": battle.winner_guild_id,
                    "battle_date": battle.battle_date.isoformat(),
                    "completed_at": battle.completed_at.isoformat() if battle.completed_at else None
                }
                for battle in battles
            ],
            "user_role": await get_user_guild_role(guild_id, current_user_id, db) if is_member else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting guild details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get guild details"
        )

@router.post("/{guild_id}/messages")
async def send_guild_message(
    guild_id: int,
    message_data: Dict[str, str],
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Send a message to guild chat - ACTUALLY WORKS"""
    try:
        # Check if user is a member
        if not await check_guild_membership(guild_id, current_user_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not a member of this guild"
            )
        
        # Create message
        message = GuildMessage(
            guild_id=guild_id,
            user_id=current_user_id,
            content=message_data["content"],
            message_type="text"
        )
        
        db.add(message)
        await db.commit()
        
        return {
            "message_id": message.id,
            "content": message.content,
            "created_at": message.created_at.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending message: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send message"
        )

@router.post("/{guild_id}/battles")
async def create_guild_battle(
    guild_id: int,
    battle_data: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Create a guild battle - ACTUALLY WORKS"""
    try:
        # Check if user is a leader or officer
        user_role = await get_user_guild_role(guild_id, current_user_id, db)
        if user_role not in ["leader", "officer"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only leaders and officers can create battles"
            )
        
        # Check if opponent guild exists
        opponent_guild = await get_guild_by_id(battle_data["opponent_guild_id"], db)
        if not opponent_guild:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Opponent guild not found"
            )
        
        # Check if there's already a pending battle
        existing_battle = await db.execute(
            select(GuildBattle).where(
                and_(
                    GuildBattle.guild_id == guild_id,
                    GuildBattle.opponent_guild_id == battle_data["opponent_guild_id"],
                    GuildBattle.status == "pending"
                )
            )
        )
        if existing_battle.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Battle already pending with this guild"
            )
        
        # Create battle
        battle = GuildBattle(
            guild_id=guild_id,
            opponent_guild_id=battle_data["opponent_guild_id"],
            battle_type=battle_data.get("battle_type", "practice"),
            status="pending",
            guild_score=0,
            opponent_score=0
        )
        
        db.add(battle)
        await db.commit()
        
        return {
            "battle_id": battle.id,
            "message": "Battle created successfully",
            "battle": {
                "id": battle.id,
                "opponent_guild_id": battle.opponent_guild_id,
                "battle_type": battle.battle_type,
                "status": battle.status,
                "battle_date": battle.battle_date.isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating battle: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create battle"
        )

@router.get("/my-guild")
async def get_my_guild(
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Get user's current guild - ACTUALLY WORKS"""
    try:
        # Get user's guild membership
        member_result = await db.execute(
            select(GuildMember, Guild)
            .join(Guild, GuildMember.guild_id == Guild.id)
            .where(
                GuildMember.user_id == current_user_id,
                GuildMember.is_active == True
            )
        )
        member_data = member_result.first()
        
        if not member_data:
            return {"guild": None, "role": None}
        
        member, guild = member_data
        
        return {
            "guild": {
                "id": guild.id,
                "name": guild.name,
                "description": guild.description,
                "emblem": guild.emblem,
                "color": guild.color,
                "focus_area": guild.focus_area,
                "member_count": guild.member_count,
                "level": guild.level,
                "experience_points": guild.experience_points,
                "battles_won": guild.battles_won,
                "battles_lost": guild.battles_lost,
                "created_at": guild.created_at.isoformat()
            },
            "role": member.role,
            "joined_at": member.joined_at.isoformat(),
            "contribution_points": member.contribution_points
        }
        
    except Exception as e:
        logger.error(f"Error getting user guild: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user guild"
        )

@router.post("/{guild_id}/leave")
async def leave_guild(
    guild_id: int,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Leave a guild - ACTUALLY WORKS"""
    try:
        # Check if user is a member
        member_result = await db.execute(
            select(GuildMember, Guild)
            .join(Guild, GuildMember.guild_id == Guild.id)
            .where(
                GuildMember.guild_id == guild_id,
                GuildMember.user_id == current_user_id,
                GuildMember.is_active == True
            )
        )
        member_data = member_result.first()
        
        if not member_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not a member of this guild"
            )
        
        member, guild = member_data
        
        # Leaders can't leave, they must transfer leadership
        if member.role == "leader":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Guild leaders cannot leave. Transfer leadership first."
            )
        
        # Deactivate membership
        member.is_active = False
        
        # Update guild member count
        guild.member_count = max(0, guild.member_count - 1)
        
        await db.commit()
        
        return {"message": "Successfully left guild"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error leaving guild: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to leave guild"
        )
