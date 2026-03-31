"""
Guild Service

Business logic for guild management, members, and events.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import datetime
import uuid

from ..models.guild import Guild, GuildMember, GuildEvent
from ..models.user import User


class GuildService:
    """Service for managing guilds and team collaboration"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_guild(
        self,
        creator_id: str,
        name: str,
        description: Optional[str] = None,
        is_public: bool = True,
        max_members: int = 50,
        tags: Optional[List[str]] = None
    ) -> Guild:
        """Create a new guild"""
        
        # Check if name is taken
        existing = self.db.query(Guild).filter(Guild.name == name).first()
        if existing:
            raise ValueError("Guild name already taken")
        
        guild = Guild(
            id=str(uuid.uuid4()),
            name=name,
            description=description,
            is_public=is_public,
            max_members=max_members,
            tags=tags or [],
            total_members=1  # Creator is first member
        )
        
        self.db.add(guild)
        self.db.flush()
        
        # Add creator as leader
        member = GuildMember(
            id=str(uuid.uuid4()),
            guild_id=guild.id,
            user_id=creator_id,
            role="leader",
            status="active"
        )
        
        self.db.add(member)
        self.db.commit()
        self.db.refresh(guild)
        
        return guild
    
    def get_guild(self, guild_id: str) -> Optional[Guild]:
        """Get a specific guild"""
        return self.db.query(Guild).filter(Guild.id == guild_id).first()
    
    def get_guilds(
        self,
        search_query: Optional[str] = None,
        tags: Optional[List[str]] = None,
        is_public: Optional[bool] = None,
        sort_by: str = "created_at",
        limit: int = 50,
        offset: int = 0
    ) -> List[Guild]:
        """Get guilds with filtering"""
        
        query = self.db.query(Guild)
        
        if is_public is not None:
            query = query.filter(Guild.is_public == is_public)
        
        if search_query:
            search_pattern = f"%{search_query}%"
            query = query.filter(
                (Guild.name.ilike(search_pattern)) |
                (Guild.description.ilike(search_pattern))
            )
        
        if tags:
            # Filter guilds that have any of the specified tags
            for tag in tags:
                query = query.filter(Guild.tags.contains([tag]))
        
        # Sorting
        if sort_by == "members":
            query = query.order_by(Guild.total_members.desc())
        elif sort_by == "level":
            query = query.order_by(Guild.level.desc())
        elif sort_by == "xp":
            query = query.order_by(Guild.xp.desc())
        else:
            query = query.order_by(Guild.created_at.desc())
        
        guilds = query.offset(offset).limit(limit).all()
        
        return guilds
    
    def update_guild(
        self,
        guild_id: str,
        user_id: str,
        updates: Dict[str, Any]
    ) -> Guild:
        """Update guild settings (leader/officer only)"""
        
        guild = self.get_guild(guild_id)
        if not guild:
            raise ValueError("Guild not found")
        
        # Check permissions
        member = self.db.query(GuildMember).filter(
            GuildMember.guild_id == guild_id,
            GuildMember.user_id == user_id,
            GuildMember.role.in_(["leader", "officer"])
        ).first()
        
        if not member:
            raise ValueError("Insufficient permissions")
        
        # Update allowed fields
        allowed_fields = [
            'description', 'icon', 'banner', 'is_public',
            'max_members', 'tags', 'requirements'
        ]
        
        for field in allowed_fields:
            if field in updates:
                setattr(guild, field, updates[field])
        
        guild.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(guild)
        
        return guild
    
    def join_guild(self, guild_id: str, user_id: str) -> GuildMember:
        """Join a guild"""
        
        guild = self.get_guild(guild_id)
        if not guild:
            raise ValueError("Guild not found")
        
        if not guild.is_public:
            raise ValueError("Guild is private")
        
        if guild.total_members >= guild.max_members:
            raise ValueError("Guild is full")
        
        # Check if already a member
        existing = self.db.query(GuildMember).filter(
            GuildMember.guild_id == guild_id,
            GuildMember.user_id == user_id
        ).first()
        
        if existing:
            if existing.status == "active":
                raise ValueError("Already a member")
            else:
                # Reactivate membership
                existing.status = "active"
                existing.joined_at = datetime.utcnow()
                self.db.commit()
                return existing
        
        # Create membership
        member = GuildMember(
            id=str(uuid.uuid4()),
            guild_id=guild_id,
            user_id=user_id,
            role="member",
            status="active"
        )
        
        self.db.add(member)
        
        # Update guild stats
        guild.total_members += 1
        
        self.db.commit()
        self.db.refresh(member)
        
        return member
    
    def leave_guild(self, guild_id: str, user_id: str) -> bool:
        """Leave a guild"""
        
        member = self.db.query(GuildMember).filter(
            GuildMember.guild_id == guild_id,
            GuildMember.user_id == user_id,
            GuildMember.status == "active"
        ).first()
        
        if not member:
            raise ValueError("Not a member of this guild")
        
        if member.role == "leader":
            # Check if there are other members
            other_members = self.db.query(GuildMember).filter(
                GuildMember.guild_id == guild_id,
                GuildMember.user_id != user_id,
                GuildMember.status == "active"
            ).count()
            
            if other_members > 0:
                raise ValueError("Leader must transfer leadership before leaving")
        
        # Remove membership
        self.db.delete(member)
        
        # Update guild stats
        guild = self.get_guild(guild_id)
        if guild:
            guild.total_members -= 1
            
            # Delete guild if no members left
            if guild.total_members == 0:
                self.db.delete(guild)
        
        self.db.commit()
        
        return True
    
    def get_guild_members(
        self,
        guild_id: str,
        status: Optional[str] = "active",
        limit: int = 100,
        offset: int = 0
    ) -> List[GuildMember]:
        """Get guild members"""
        
        query = self.db.query(GuildMember).filter(GuildMember.guild_id == guild_id)
        
        if status:
            query = query.filter(GuildMember.status == status)
        
        members = query.order_by(
            GuildMember.role.desc(),
            GuildMember.contribution_points.desc()
        ).offset(offset).limit(limit).all()
        
        return members
    
    def update_member_role(
        self,
        guild_id: str,
        user_id: str,
        target_user_id: str,
        new_role: str
    ) -> GuildMember:
        """Update member role (leader only)"""
        
        # Check permissions
        requester = self.db.query(GuildMember).filter(
            GuildMember.guild_id == guild_id,
            GuildMember.user_id == user_id,
            GuildMember.role == "leader"
        ).first()
        
        if not requester:
            raise ValueError("Only leaders can change roles")
        
        # Get target member
        member = self.db.query(GuildMember).filter(
            GuildMember.guild_id == guild_id,
            GuildMember.user_id == target_user_id
        ).first()
        
        if not member:
            raise ValueError("Member not found")
        
        if new_role not in ["leader", "officer", "member"]:
            raise ValueError("Invalid role")
        
        member.role = new_role
        member.last_active_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(member)
        
        return member
    
    def kick_member(
        self,
        guild_id: str,
        user_id: str,
        target_user_id: str
    ) -> bool:
        """Kick a member from guild (leader/officer only)"""
        
        # Check permissions
        requester = self.db.query(GuildMember).filter(
            GuildMember.guild_id == guild_id,
            GuildMember.user_id == user_id,
            GuildMember.role.in_(["leader", "officer"])
        ).first()
        
        if not requester:
            raise ValueError("Insufficient permissions")
        
        # Get target member
        member = self.db.query(GuildMember).filter(
            GuildMember.guild_id == guild_id,
            GuildMember.user_id == target_user_id
        ).first()
        
        if not member:
            raise ValueError("Member not found")
        
        if member.role == "leader":
            raise ValueError("Cannot kick the leader")
        
        if requester.role == "officer" and member.role == "officer":
            raise ValueError("Officers cannot kick other officers")
        
        # Remove member
        self.db.delete(member)
        
        # Update guild stats
        guild = self.get_guild(guild_id)
        if guild:
            guild.total_members -= 1
        
        self.db.commit()
        
        return True
    
    def create_event(
        self,
        guild_id: str,
        creator_id: str,
        name: str,
        event_type: str,
        start_time: datetime,
        description: Optional[str] = None,
        end_time: Optional[datetime] = None,
        max_participants: Optional[int] = None
    ) -> GuildEvent:
        """Create a guild event"""
        
        # Check if user is a member
        member = self.db.query(GuildMember).filter(
            GuildMember.guild_id == guild_id,
            GuildMember.user_id == creator_id,
            GuildMember.status == "active"
        ).first()
        
        if not member:
            raise ValueError("Must be a guild member to create events")
        
        event = GuildEvent(
            id=str(uuid.uuid4()),
            guild_id=guild_id,
            creator_id=creator_id,
            name=name,
            description=description,
            event_type=event_type,
            start_time=start_time,
            end_time=end_time,
            max_participants=max_participants,
            status="scheduled"
        )
        
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        
        return event
    
    def get_guild_events(
        self,
        guild_id: str,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[GuildEvent]:
        """Get guild events"""
        
        query = self.db.query(GuildEvent).filter(GuildEvent.guild_id == guild_id)
        
        if status:
            query = query.filter(GuildEvent.status == status)
        
        events = query.order_by(GuildEvent.start_time.desc()).offset(offset).limit(limit).all()
        
        return events
    
    def join_event(self, event_id: str, user_id: str) -> GuildEvent:
        """Join a guild event"""
        
        event = self.db.query(GuildEvent).filter(GuildEvent.id == event_id).first()
        
        if not event:
            raise ValueError("Event not found")
        
        # Check if user is a guild member
        member = self.db.query(GuildMember).filter(
            GuildMember.guild_id == event.guild_id,
            GuildMember.user_id == user_id,
            GuildMember.status == "active"
        ).first()
        
        if not member:
            raise ValueError("Must be a guild member to join events")
        
        # Check if already joined
        participants = event.participants or []
        if user_id in participants:
            raise ValueError("Already joined this event")
        
        # Check capacity
        if event.max_participants and len(participants) >= event.max_participants:
            raise ValueError("Event is full")
        
        # Add participant
        participants.append(user_id)
        event.participants = participants
        event.current_participants = len(participants)
        
        self.db.commit()
        self.db.refresh(event)
        
        return event
    
    def add_guild_xp(self, guild_id: str, xp_amount: int):
        """Add XP to guild and handle leveling"""
        
        guild = self.get_guild(guild_id)
        if not guild:
            return
        
        guild.xp += xp_amount
        
        # Simple leveling formula
        xp_for_next_level = guild.level * 1000
        
        while guild.xp >= xp_for_next_level:
            guild.xp -= xp_for_next_level
            guild.level += 1
            xp_for_next_level = guild.level * 1000
        
        self.db.commit()
    
    def get_user_guilds(self, user_id: str) -> List[Guild]:
        """Get all guilds a user is a member of"""
        
        memberships = self.db.query(GuildMember).filter(
            GuildMember.user_id == user_id,
            GuildMember.status == "active"
        ).all()
        
        guild_ids = [m.guild_id for m in memberships]
        
        guilds = self.db.query(Guild).filter(Guild.id.in_(guild_ids)).all()
        
        return guilds
