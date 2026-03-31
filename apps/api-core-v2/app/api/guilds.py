"""
Guilds API

REST endpoints for guild management, members, and events.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from ..core.database import get_db
from ..core.auth import get_current_user
from ..models.user import User
from ..services.guild_service import GuildService

router = APIRouter(prefix="/guilds", tags=["guilds"])


# ============================================================================
# SCHEMAS
# ============================================================================

class GuildCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    description: Optional[str] = Field(None, max_length=500)
    is_public: bool = True
    max_members: int = Field(default=50, ge=10, le=200)
    tags: Optional[List[str]] = None


class GuildUpdate(BaseModel):
    description: Optional[str] = Field(None, max_length=500)
    icon: Optional[str] = None
    banner: Optional[str] = None
    is_public: Optional[bool] = None
    max_members: Optional[int] = Field(None, ge=10, le=200)
    tags: Optional[List[str]] = None
    requirements: Optional[dict] = None


class GuildResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    icon: Optional[str]
    banner: Optional[str]
    is_public: bool
    max_members: int
    level: int
    xp: int
    total_members: int
    total_battles_won: int
    total_quests_completed: int
    tags: List[str]
    requirements: dict
    created_at: str
    updated_at: Optional[str]

    class Config:
        from_attributes = True


class MemberResponse(BaseModel):
    id: str
    guild_id: str
    user_id: str
    role: str
    status: str
    contribution_points: int
    battles_participated: int
    quests_completed: int
    custom_title: Optional[str]
    joined_at: str
    last_active_at: Optional[str]

    class Config:
        from_attributes = True


class EventCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    event_type: str = Field(..., regex="^(battle|quest|social|tournament)$")
    start_time: datetime
    end_time: Optional[datetime] = None
    max_participants: Optional[int] = Field(None, ge=2)


class EventResponse(BaseModel):
    id: str
    guild_id: str
    creator_id: str
    name: str
    description: Optional[str]
    event_type: str
    start_time: str
    end_time: Optional[str]
    is_recurring: bool
    max_participants: Optional[int]
    current_participants: int
    participants: List[str]
    rewards: dict
    status: str
    created_at: str

    class Config:
        from_attributes = True


class RoleUpdate(BaseModel):
    new_role: str = Field(..., regex="^(leader|officer|member)$")


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/", response_model=GuildResponse, status_code=status.HTTP_201_CREATED)
async def create_guild(
    guild_data: GuildCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new guild"""
    
    service = GuildService(db)
    
    try:
        guild = service.create_guild(
            creator_id=current_user.id,
            **guild_data.model_dump()
        )
        
        return GuildResponse(
            id=guild.id,
            name=guild.name,
            description=guild.description,
            icon=guild.icon,
            banner=guild.banner,
            is_public=guild.is_public,
            max_members=guild.max_members,
            level=guild.level,
            xp=guild.xp,
            total_members=guild.total_members,
            total_battles_won=guild.total_battles_won,
            total_quests_completed=guild.total_quests_completed,
            tags=guild.tags or [],
            requirements=guild.requirements or {},
            created_at=guild.created_at.isoformat(),
            updated_at=guild.updated_at.isoformat() if guild.updated_at else None
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/", response_model=List[GuildResponse])
async def get_guilds(
    search: Optional[str] = None,
    tags: Optional[List[str]] = Query(None),
    is_public: Optional[bool] = None,
    sort_by: str = Query(default="created_at", regex="^(created_at|members|level|xp)$"),
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    """Get guilds with filtering"""
    
    service = GuildService(db)
    
    guilds = service.get_guilds(
        search_query=search,
        tags=tags,
        is_public=is_public,
        sort_by=sort_by,
        limit=limit,
        offset=offset
    )
    
    return [
        GuildResponse(
            id=g.id,
            name=g.name,
            description=g.description,
            icon=g.icon,
            banner=g.banner,
            is_public=g.is_public,
            max_members=g.max_members,
            level=g.level,
            xp=g.xp,
            total_members=g.total_members,
            total_battles_won=g.total_battles_won,
            total_quests_completed=g.total_quests_completed,
            tags=g.tags or [],
            requirements=g.requirements or {},
            created_at=g.created_at.isoformat(),
            updated_at=g.updated_at.isoformat() if g.updated_at else None
        )
        for g in guilds
    ]


@router.get("/my-guilds", response_model=List[GuildResponse])
async def get_my_guilds(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get guilds the current user is a member of"""
    
    service = GuildService(db)
    guilds = service.get_user_guilds(current_user.id)
    
    return [
        GuildResponse(
            id=g.id,
            name=g.name,
            description=g.description,
            icon=g.icon,
            banner=g.banner,
            is_public=g.is_public,
            max_members=g.max_members,
            level=g.level,
            xp=g.xp,
            total_members=g.total_members,
            total_battles_won=g.total_battles_won,
            total_quests_completed=g.total_quests_completed,
            tags=g.tags or [],
            requirements=g.requirements or {},
            created_at=g.created_at.isoformat(),
            updated_at=g.updated_at.isoformat() if g.updated_at else None
        )
        for g in guilds
    ]


@router.get("/{guild_id}", response_model=GuildResponse)
async def get_guild(
    guild_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific guild"""
    
    service = GuildService(db)
    guild = service.get_guild(guild_id)
    
    if not guild:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guild not found"
        )
    
    return GuildResponse(
        id=guild.id,
        name=guild.name,
        description=guild.description,
        icon=guild.icon,
        banner=guild.banner,
        is_public=guild.is_public,
        max_members=guild.max_members,
        level=guild.level,
        xp=guild.xp,
        total_members=guild.total_members,
        total_battles_won=guild.total_battles_won,
        total_quests_completed=guild.total_quests_completed,
        tags=guild.tags or [],
        requirements=guild.requirements or {},
        created_at=guild.created_at.isoformat(),
        updated_at=guild.updated_at.isoformat() if guild.updated_at else None
    )


@router.patch("/{guild_id}", response_model=GuildResponse)
async def update_guild(
    guild_id: str,
    updates: GuildUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update guild settings (leader/officer only)"""
    
    service = GuildService(db)
    
    try:
        guild = service.update_guild(
            guild_id=guild_id,
            user_id=current_user.id,
            updates=updates.model_dump(exclude_unset=True)
        )
        
        return GuildResponse(
            id=guild.id,
            name=guild.name,
            description=guild.description,
            icon=guild.icon,
            banner=guild.banner,
            is_public=guild.is_public,
            max_members=guild.max_members,
            level=guild.level,
            xp=guild.xp,
            total_members=guild.total_members,
            total_battles_won=guild.total_battles_won,
            total_quests_completed=guild.total_quests_completed,
            tags=guild.tags or [],
            requirements=guild.requirements or {},
            created_at=guild.created_at.isoformat(),
            updated_at=guild.updated_at.isoformat() if guild.updated_at else None
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )


@router.post("/{guild_id}/join", response_model=MemberResponse)
async def join_guild(
    guild_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Join a guild"""
    
    service = GuildService(db)
    
    try:
        member = service.join_guild(guild_id, current_user.id)
        
        return MemberResponse(
            id=member.id,
            guild_id=member.guild_id,
            user_id=member.user_id,
            role=member.role,
            status=member.status,
            contribution_points=member.contribution_points,
            battles_participated=member.battles_participated,
            quests_completed=member.quests_completed,
            custom_title=member.custom_title,
            joined_at=member.joined_at.isoformat(),
            last_active_at=member.last_active_at.isoformat() if member.last_active_at else None
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/{guild_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
async def leave_guild(
    guild_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Leave a guild"""
    
    service = GuildService(db)
    
    try:
        service.leave_guild(guild_id, current_user.id)
        return None
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{guild_id}/members", response_model=List[MemberResponse])
async def get_guild_members(
    guild_id: str,
    status_filter: Optional[str] = Query(default="active", alias="status"),
    limit: int = Query(default=100, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    """Get guild members"""
    
    service = GuildService(db)
    
    members = service.get_guild_members(
        guild_id=guild_id,
        status=status_filter,
        limit=limit,
        offset=offset
    )
    
    return [
        MemberResponse(
            id=m.id,
            guild_id=m.guild_id,
            user_id=m.user_id,
            role=m.role,
            status=m.status,
            contribution_points=m.contribution_points,
            battles_participated=m.battles_participated,
            quests_completed=m.quests_completed,
            custom_title=m.custom_title,
            joined_at=m.joined_at.isoformat(),
            last_active_at=m.last_active_at.isoformat() if m.last_active_at else None
        )
        for m in members
    ]


@router.patch("/{guild_id}/members/{user_id}/role", response_model=MemberResponse)
async def update_member_role(
    guild_id: str,
    user_id: str,
    role_data: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update member role (leader only)"""
    
    service = GuildService(db)
    
    try:
        member = service.update_member_role(
            guild_id=guild_id,
            user_id=current_user.id,
            target_user_id=user_id,
            new_role=role_data.new_role
        )
        
        return MemberResponse(
            id=member.id,
            guild_id=member.guild_id,
            user_id=member.user_id,
            role=member.role,
            status=member.status,
            contribution_points=member.contribution_points,
            battles_participated=member.battles_participated,
            quests_completed=member.quests_completed,
            custom_title=member.custom_title,
            joined_at=member.joined_at.isoformat(),
            last_active_at=member.last_active_at.isoformat() if member.last_active_at else None
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )


@router.delete("/{guild_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def kick_member(
    guild_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kick a member from guild (leader/officer only)"""
    
    service = GuildService(db)
    
    try:
        service.kick_member(guild_id, current_user.id, user_id)
        return None
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )


@router.post("/{guild_id}/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    guild_id: str,
    event_data: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a guild event"""
    
    service = GuildService(db)
    
    try:
        event = service.create_event(
            guild_id=guild_id,
            creator_id=current_user.id,
            **event_data.model_dump()
        )
        
        return EventResponse(
            id=event.id,
            guild_id=event.guild_id,
            creator_id=event.creator_id,
            name=event.name,
            description=event.description,
            event_type=event.event_type,
            start_time=event.start_time.isoformat(),
            end_time=event.end_time.isoformat() if event.end_time else None,
            is_recurring=event.is_recurring,
            max_participants=event.max_participants,
            current_participants=event.current_participants,
            participants=event.participants or [],
            rewards=event.rewards or {},
            status=event.status,
            created_at=event.created_at.isoformat()
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{guild_id}/events", response_model=List[EventResponse])
async def get_guild_events(
    guild_id: str,
    status_filter: Optional[str] = Query(default=None, alias="status"),
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    """Get guild events"""
    
    service = GuildService(db)
    
    events = service.get_guild_events(
        guild_id=guild_id,
        status=status_filter,
        limit=limit,
        offset=offset
    )
    
    return [
        EventResponse(
            id=e.id,
            guild_id=e.guild_id,
            creator_id=e.creator_id,
            name=e.name,
            description=e.description,
            event_type=e.event_type,
            start_time=e.start_time.isoformat(),
            end_time=e.end_time.isoformat() if e.end_time else None,
            is_recurring=e.is_recurring,
            max_participants=e.max_participants,
            current_participants=e.current_participants,
            participants=e.participants or [],
            rewards=e.rewards or {},
            status=e.status,
            created_at=e.created_at.isoformat()
        )
        for e in events
    ]


@router.post("/events/{event_id}/join", response_model=EventResponse)
async def join_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Join a guild event"""
    
    service = GuildService(db)
    
    try:
        event = service.join_event(event_id, current_user.id)
        
        return EventResponse(
            id=event.id,
            guild_id=event.guild_id,
            creator_id=event.creator_id,
            name=event.name,
            description=event.description,
            event_type=event.event_type,
            start_time=event.start_time.isoformat(),
            end_time=event.end_time.isoformat() if event.end_time else None,
            is_recurring=event.is_recurring,
            max_participants=event.max_participants,
            current_participants=event.current_participants,
            participants=event.participants or [],
            rewards=event.rewards or {},
            status=event.status,
            created_at=event.created_at.isoformat()
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
