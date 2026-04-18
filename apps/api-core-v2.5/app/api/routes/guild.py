"""Guild API Routes

Endpoints for guild management, membership, and events.
"""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models import User
from app.db.models.guild import Guild, GuildMember, GuildEvent, GuildRole

router = APIRouter(prefix="/guilds", tags=["Guilds"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class CreateGuildRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    is_public: bool = True
    max_members: int = Field(default=50, ge=5, le=500)
    tags: Optional[List[str]] = None


class UpdateGuildRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = None
    is_public: Optional[bool] = None
    max_members: Optional[int] = Field(None, ge=5, le=500)
    tags: Optional[List[str]] = None


class GuildResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    is_public: bool
    max_members: int
    total_members: int
    tags: List[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class GuildMemberResponse(BaseModel):
    id: UUID
    user_id: UUID
    guild_id: UUID
    role: str
    joined_at: datetime
    contribution_score: int
    
    class Config:
        from_attributes = True


class CreateEventRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    event_type: str = Field(..., max_length=50)
    scheduled_at: Optional[datetime] = None
    event_metadata: Optional[dict] = None


class GuildEventResponse(BaseModel):
    id: UUID
    guild_id: UUID
    title: str
    description: Optional[str]
    event_type: str
    scheduled_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/", response_model=GuildResponse, status_code=status.HTTP_201_CREATED)
async def create_guild(
    request: CreateGuildRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new guild"""
    # Check if name is taken
    result = await db.execute(
        select(Guild).where(Guild.name == request.name)
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Guild name already taken"
        )
    
    # Create guild
    guild = Guild(
        name=request.name,
        description=request.description,
        is_public=request.is_public,
        max_members=request.max_members,
        tags=request.tags or [],
        total_members=1
    )
    db.add(guild)
    await db.flush()
    
    # Add creator as leader
    member = GuildMember(
        user_id=current_user.id,
        guild_id=guild.id,
        role=GuildRole.LEADER,
        contribution_score=0
    )
    db.add(member)
    
    await db.commit()
    await db.refresh(guild)
    
    return guild


@router.get("/", response_model=List[GuildResponse])
async def list_guilds(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    public_only: bool = Query(True),
    search: Optional[str] = Query(None),
    tags: Optional[List[str]] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """List guilds with filters"""
    query = select(Guild)
    
    if public_only:
        query = query.where(Guild.is_public == True)
    
    if search:
        query = query.where(
            or_(
                Guild.name.ilike(f"%{search}%"),
                Guild.description.ilike(f"%{search}%")
            )
        )
    
    if tags:
        # PostgreSQL array overlap operator
        query = query.where(Guild.tags.overlap(tags))
    
    query = query.order_by(Guild.total_members.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    guilds = result.scalars().all()
    
    return guilds


@router.get("/{guild_id}", response_model=GuildResponse)
async def get_guild(
    guild_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get guild by ID"""
    result = await db.execute(
        select(Guild).where(Guild.id == guild_id)
    )
    guild = result.scalar_one_or_none()
    
    if not guild:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guild not found"
        )
    
    return guild


@router.put("/{guild_id}", response_model=GuildResponse)
async def update_guild(
    guild_id: UUID,
    request: UpdateGuildRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update guild (leader only)"""
    # Get guild
    result = await db.execute(
        select(Guild).where(Guild.id == guild_id)
    )
    guild = result.scalar_one_or_none()
    
    if not guild:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guild not found"
        )
    
    # Check if user is leader
    result = await db.execute(
        select(GuildMember).where(
            and_(
                GuildMember.guild_id == guild_id,
                GuildMember.user_id == current_user.id,
                GuildMember.role == GuildRole.LEADER
            )
        )
    )
    member = result.scalar_one_or_none()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only guild leaders can update guild settings"
        )
    
    # Update fields
    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(guild, field, value)
    
    await db.commit()
    await db.refresh(guild)
    
    return guild


@router.post("/{guild_id}/join", status_code=status.HTTP_201_CREATED)
async def join_guild(
    guild_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Join a guild"""
    # Get guild
    result = await db.execute(
        select(Guild).where(Guild.id == guild_id)
    )
    guild = result.scalar_one_or_none()
    
    if not guild:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guild not found"
        )
    
    # Check if already a member
    result = await db.execute(
        select(GuildMember).where(
            and_(
                GuildMember.guild_id == guild_id,
                GuildMember.user_id == current_user.id
            )
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Already a member of this guild"
        )
    
    # Check if guild is full
    if guild.total_members >= guild.max_members:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Guild is full"
        )
    
    # Add member
    member = GuildMember(
        user_id=current_user.id,
        guild_id=guild_id,
        role=GuildRole.MEMBER,
        contribution_score=0
    )
    db.add(member)
    
    # Update guild member count
    guild.total_members += 1
    
    await db.commit()
    
    return {"message": "Successfully joined guild", "guild_id": str(guild_id)}


@router.post("/{guild_id}/leave")
async def leave_guild(
    guild_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Leave a guild"""
    # Get membership
    result = await db.execute(
        select(GuildMember).where(
            and_(
                GuildMember.guild_id == guild_id,
                GuildMember.user_id == current_user.id
            )
        )
    )
    member = result.scalar_one_or_none()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not a member of this guild"
        )
    
    # Can't leave if you're the leader and there are other members
    if member.role == GuildRole.LEADER:
        result = await db.execute(
            select(func.count(GuildMember.id)).where(GuildMember.guild_id == guild_id)
        )
        member_count = result.scalar()
        
        if member_count > 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transfer leadership before leaving the guild"
            )
    
    # Remove member
    await db.delete(member)
    
    # Update guild member count
    result = await db.execute(
        select(Guild).where(Guild.id == guild_id)
    )
    guild = result.scalar_one_or_none()
    if guild:
        guild.total_members -= 1
    
    await db.commit()
    
    return {"message": "Successfully left guild"}


@router.get("/{guild_id}/members", response_model=List[GuildMemberResponse])
async def get_guild_members(
    guild_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get guild members"""
    result = await db.execute(
        select(GuildMember)
        .where(GuildMember.guild_id == guild_id)
        .order_by(GuildMember.contribution_score.desc())
    )
    members = result.scalars().all()
    
    return members


@router.post("/{guild_id}/events", response_model=GuildEventResponse, status_code=status.HTTP_201_CREATED)
async def create_guild_event(
    guild_id: UUID,
    request: CreateEventRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a guild event (officers and leaders only)"""
    # Check if user is officer or leader
    result = await db.execute(
        select(GuildMember).where(
            and_(
                GuildMember.guild_id == guild_id,
                GuildMember.user_id == current_user.id,
                or_(
                    GuildMember.role == GuildRole.LEADER,
                    GuildMember.role == GuildRole.OFFICER
                )
            )
        )
    )
    member = result.scalar_one_or_none()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only officers and leaders can create events"
        )
    
    # Create event
    event = GuildEvent(
        guild_id=guild_id,
        title=request.title,
        description=request.description,
        event_type=request.event_type,
        scheduled_at=request.scheduled_at,
        event_metadata=request.event_metadata or {}
    )
    db.add(event)
    
    await db.commit()
    await db.refresh(event)
    
    return event


@router.get("/{guild_id}/events", response_model=List[GuildEventResponse])
async def get_guild_events(
    guild_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get guild events"""
    result = await db.execute(
        select(GuildEvent)
        .where(GuildEvent.guild_id == guild_id)
        .order_by(GuildEvent.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    events = result.scalars().all()
    
    return events


@router.get("/my/memberships", response_model=List[GuildResponse])
async def get_my_guilds(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get guilds the current user is a member of"""
    result = await db.execute(
        select(Guild)
        .join(GuildMember, GuildMember.guild_id == Guild.id)
        .where(GuildMember.user_id == current_user.id)
        .order_by(Guild.name)
    )
    guilds = result.scalars().all()
    
    return guilds
