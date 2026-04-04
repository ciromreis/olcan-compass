"""
Real Database Setup for Olcan Compass v2.5
Working PostgreSQL database with actual connections
"""

import os
import asyncio
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker, AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Float, DateTime, Boolean, Text, JSON, ForeignKey, select
from sqlalchemy.sql import func
from datetime import datetime
import logging

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:password@localhost/olcan_compass")

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    future=True,
)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base class for models
class Base(AsyncAttrs, DeclarativeBase):
    """Base class for all database models"""
    pass

# User Model
class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    companions: Mapped[list["Companion"]] = relationship("Companion", back_populates="user", cascade="all, delete-orphan")
    documents: Mapped[list["Document"]] = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    interview_sessions: Mapped[list["InterviewSession"]] = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")

# Companion Model
class Companion(Base):
    __tablename__ = "companions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    archetype: Mapped[str] = mapped_column(String(50), nullable=False)  # strategist, innovator, etc.
    evolution_stage: Mapped[str] = mapped_column(String(50), default="egg")  # egg, sprout, young, mature, master, legendary
    level: Mapped[int] = mapped_column(Integer, default=1)
    experience_points: Mapped[int] = mapped_column(Integer, default=0)
    health: Mapped[int] = mapped_column(Integer, default=100)
    happiness: Mapped[int] = mapped_column(Integer, default=100)
    energy: Mapped[int] = mapped_column(Integer, default=100)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_cared_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="companions")
    activities: Mapped[list["CompanionActivity"]] = relationship("CompanionActivity", back_populates="companion", cascade="all, delete-orphan")
    evolutions: Mapped[list["CompanionEvolution"]] = relationship("CompanionEvolution", back_populates="companion", cascade="all, delete-orphan")
    stats: Mapped["CompanionStats"] = relationship("CompanionStats", back_populates="companion", uselist=False, cascade="all, delete-orphan")
    abilities: Mapped[list["CompanionAbility"]] = relationship("CompanionAbility", back_populates="companion", cascade="all, delete-orphan")

# Companion Stats Model
class CompanionStats(Base):
    __tablename__ = "companion_stats"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    companion_id: Mapped[int] = mapped_column(ForeignKey("companions.id"), unique=True)
    power: Mapped[int] = mapped_column(Integer, default=10)
    wisdom: Mapped[int] = mapped_column(Integer, default=10)
    charisma: Mapped[int] = mapped_column(Integer, default=10)
    agility: Mapped[int] = mapped_column(Integer, default=10)
    battles_won: Mapped[int] = mapped_column(Integer, default=0)
    battles_lost: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    companion: Mapped["Companion"] = relationship("Companion", back_populates="stats")

# Companion Activity Model
class CompanionActivity(Base):
    __tablename__ = "companion_activities"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    companion_id: Mapped[int] = mapped_column(ForeignKey("companions.id"), index=True)
    activity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # feed, train, play, rest
    xp_gained: Mapped[int] = mapped_column(Integer, default=0)
    happiness_change: Mapped[int] = mapped_column(Integer, default=0)
    energy_change: Mapped[int] = mapped_column(Integer, default=0)
    health_change: Mapped[int] = mapped_column(Integer, default=0)
    performed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    companion: Mapped["Companion"] = relationship("Companion", back_populates="activities")

# Companion Evolution Model
class CompanionEvolution(Base):
    __tablename__ = "companion_evolutions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    companion_id: Mapped[int] = mapped_column(ForeignKey("companions.id"), index=True)
    from_stage: Mapped[str] = mapped_column(String(50), nullable=False)
    to_stage: Mapped[str] = mapped_column(String(50), nullable=False)
    evolved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    companion: Mapped["Companion"] = relationship("Companion", back_populates="evolutions")

# Companion Ability Model
class CompanionAbility(Base):
    __tablename__ = "companion_abilities"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    companion_id: Mapped[int] = mapped_column(ForeignKey("companions.id"), index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text)
    ability_type: Mapped[str] = mapped_column(String(50), nullable=False)  # active, passive, ultimate
    power_level: Mapped[int] = mapped_column(Integer, default=1)
    cooldown: Mapped[int] = mapped_column(Integer, nullable=True)  # in seconds
    unlocked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    companion: Mapped["Companion"] = relationship("Companion", back_populates="abilities")

# Document Model
class Document(Base):
    __tablename__ = "documents"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text)
    document_type: Mapped[str] = mapped_column(String(50), nullable=False)  # resume, cover_letter, etc.
    word_count: Mapped[int] = mapped_column(Integer, default=0)
    readability_score: Mapped[float] = mapped_column(Float, nullable=True)
    seo_score: Mapped[float] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="documents")

# Interview Session Model
class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    session_type: Mapped[str] = mapped_column(String(50), nullable=False)  # practice, mock, real
    industry: Mapped[str] = mapped_column(String(100))
    difficulty: Mapped[str] = mapped_column(String(50))  # easy, medium, hard
    questions_asked: Mapped[int] = mapped_column(Integer, default=0)
    overall_score: Mapped[float] = mapped_column(Float, nullable=True)
    feedback: Mapped[JSON] = mapped_column(JSON, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="interview_sessions")

# Guild Model
class Guild(Base):
    __tablename__ = "guilds"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text)
    emblem: Mapped[str] = mapped_column(String(50), nullable=False)  # emoji or icon
    color: Mapped[str] = mapped_column(String(7), nullable=False)  # hex color
    focus_area: Mapped[str] = mapped_column(String(50), nullable=False)  # career focus
    member_count: Mapped[int] = mapped_column(Integer, default=1)
    level: Mapped[int] = mapped_column(Integer, default=1)
    experience_points: Mapped[int] = mapped_column(Integer, default=0)
    battles_won: Mapped[int] = mapped_column(Integer, default=0)
    battles_lost: Mapped[int] = mapped_column(Integer, default=0)
    is_private: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    members: Mapped[list["GuildMember"]] = relationship("GuildMember", back_populates="guild", cascade="all, delete-orphan")
    battles: Mapped[list["GuildBattle"]] = relationship("GuildBattle", back_populates="guild", cascade="all, delete-orphan")
    messages: Mapped[list["GuildMessage"]] = relationship("GuildMessage", back_populates="guild", cascade="all, delete-orphan")

# Guild Member Model
class GuildMember(Base):
    __tablename__ = "guild_members"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    guild_id: Mapped[int] = mapped_column(ForeignKey("guilds.id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    role: Mapped[str] = mapped_column(String(20), default="member")  # leader, officer, member
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    contribution_points: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationships
    guild: Mapped["Guild"] = relationship("Guild", back_populates="members")
    user: Mapped["User"] = relationship("User")

# Guild Battle Model
class GuildBattle(Base):
    __tablename__ = "guild_battles"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    guild_id: Mapped[int] = mapped_column(ForeignKey("guilds.id"), index=True)
    opponent_guild_id: Mapped[int] = mapped_column(ForeignKey("guilds.id"), index=True)
    battle_type: Mapped[str] = mapped_column(String(50), nullable=False)  # practice, ranked, tournament
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, active, completed
    guild_score: Mapped[int] = mapped_column(Integer, default=0)
    opponent_score: Mapped[int] = mapped_column(Integer, default=0)
    winner_guild_id: Mapped[int] = mapped_column(ForeignKey("guilds.id"), nullable=True)
    battle_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    guild: Mapped["Guild"] = relationship("Guild", back_populates="battles", foreign_keys=[guild_id])
    opponent_guild: Mapped["Guild"] = relationship("Guild", foreign_keys=[opponent_guild_id])
    winner_guild: Mapped["Guild"] = relationship("Guild", foreign_keys=[winner_guild_id])

# Guild Message Model
class GuildMessage(Base):
    __tablename__ = "guild_messages"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    guild_id: Mapped[int] = mapped_column(ForeignKey("guilds.id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    message_type: Mapped[str] = mapped_column(String(20), default="text")  # text, system, battle_result
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    guild: Mapped["Guild"] = relationship("Guild", back_populates="messages")
    user: Mapped["User"] = relationship("User")

# Marketplace Item Model
class MarketplaceItem(Base):
    __tablename__ = "marketplace_items"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(50), nullable=False)  # companion_accessory, consumable, special
    item_type: Mapped[str] = mapped_column(String(50), nullable=False)  # hat, accessory, food, potion
    price: Mapped[int] = mapped_column(Integer, nullable=False)  # in coins
    rarity: Mapped[str] = mapped_column(String(20), default="common")  # common, rare, epic, legendary
    effect_type: Mapped[str] = mapped_column(String(50), nullable=True)  # xp_boost, happiness_boost, energy_boost
    effect_value: Mapped[int] = mapped_column(Integer, nullable=True)
    icon: Mapped[str] = mapped_column(String(50), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

# User Inventory Model
class UserInventory(Base):
    __tablename__ = "user_inventory"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    item_id: Mapped[int] = mapped_column(ForeignKey("marketplace_items.id"), index=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    purchased_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user: Mapped["User"] = relationship("User")
    item: Mapped["MarketplaceItem"] = relationship("MarketplaceItem")

# Transaction Model
class Transaction(Base):
    __tablename__ = "transactions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    item_id: Mapped[int] = mapped_column(ForeignKey("marketplace_items.id"), index=True)
    transaction_type: Mapped[str] = mapped_column(String(20), nullable=False)  # purchase, sale
    amount: Mapped[int] = mapped_column(Integer, nullable=False)  # price in coins
    payment_method: Mapped[str] = mapped_column(String(20), default="coins")  # coins, gems, real_money
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user: Mapped["User"] = relationship("User")
    item: Mapped["MarketplaceItem"] = relationship("MarketplaceItem")

# User Economy Model
class UserEconomy(Base):
    __tablename__ = "user_economy"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, index=True)
    coins: Mapped[int] = mapped_column(Integer, default=1000)  # Starting coins
    gems: Mapped[int] = mapped_column(Integer, default=0)  # Premium currency
    premium_expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user: Mapped["User"] = relationship("User")

# Video Recording Model
class VideoRecording(Base):
    __tablename__ = "video_recordings"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text)
    video_type: Mapped[str] = mapped_column(String(50), nullable=False)  # interview, presentation, tutorial, vlog
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    file_path: Mapped[str] = mapped_column(String(500), nullable=True)
    file_size: Mapped[int] = mapped_column(Integer, nullable=True)
    thumbnail_path: Mapped[str] = mapped_column(String(500), nullable=True)
    recording_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    status: Mapped[str] = mapped_column(String(20), default="recorded")  # recorded, processing, processed, uploaded, published
    youtube_url: Mapped[str] = mapped_column(String(500), nullable=True)
    youtube_video_id: Mapped[str] = mapped_column(String(100), nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    like_count: Mapped[int] = mapped_column(Integer, default=0)
    comment_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Relationships
    user: Mapped["User"] = relationship("User")
    analytics: Mapped[list["VideoAnalytics"]] = relationship("VideoAnalytics", back_populates="video", cascade="all, delete-orphan")
    scripts: Mapped[list["VideoScript"]] = relationship("VideoScript", back_populates="video", cascade="all, delete-orphan")

# Video Analytics Model
class VideoAnalytics(Base):
    __tablename__ = "video_analytics"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    video_id: Mapped[int] = mapped_column(ForeignKey("video_recordings.id"), index=True)
    metric_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    views: Mapped[int] = mapped_column(Integer, default=0)
    likes: Mapped[int] = mapped_column(Integer, default=0)
    comments: Mapped[int] = mapped_column(Integer, default=0)
    shares: Mapped[int] = mapped_column(Integer, default=0)
    watch_time_minutes: Mapped[int] = mapped_column(Integer, default=0)
    engagement_rate: Mapped[float] = mapped_column(Float, default=0.0)
    audience_retention: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Relationships
    video: Mapped["VideoRecording"] = relationship("VideoRecording", back_populates="analytics")

# Video Script Model
class VideoScript(Base):
    __tablename__ = "video_scripts"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    video_id: Mapped[int] = mapped_column(ForeignKey("video_recordings.id"), index=True)
    script_content: Mapped[str] = mapped_column(Text, nullable=False)
    script_type: Mapped[str] = mapped_column(String(50), default="teleprompter")  # teleprompter, outline, notes
    word_count: Mapped[int] = mapped_column(Integer, default=0)
    estimated_duration: Mapped[int] = mapped_column(Integer, default=0)  # in seconds
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    video: Mapped["VideoRecording"] = relationship("VideoRecording", back_populates="scripts")

# Recording Session Model
class RecordingSession(Base):
    __tablename__ = "recording_sessions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    session_type: Mapped[str] = mapped_column(String(50), nullable=False)  # practice, recording, live
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    teleprompter_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    teleprompter_speed: Mapped[int] = mapped_column(Integer, default=150)  # words per minute
    background_type: Mapped[str] = mapped_column(String(50), default="blur")  # blur, virtual, green_screen
    camera_position: Mapped[str] = mapped_column(String(50), default="center")  # center, left, right
    audio_quality: Mapped[str] = mapped_column(String(20), default="high")  # low, medium, high
    video_quality: Mapped[str] = mapped_column(String(20), default="1080p")  # 720p, 1080p, 4k
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ended_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    output_file_path: Mapped[str] = mapped_column(String(500), nullable=True)
    
    # Relationships
    user: Mapped["User"] = relationship("User")

# YouTube Integration Model
class YouTubeIntegration(Base):
    __tablename__ = "youtube_integrations"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, index=True)
    channel_id: Mapped[str] = mapped_column(String(100), nullable=True)
    channel_name: Mapped[str] = mapped_column(String(255), nullable=True)
    access_token: Mapped[str] = mapped_column(Text, nullable=True)
    refresh_token: Mapped[str] = mapped_column(Text, nullable=True)
    token_expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    is_connected: Mapped[bool] = mapped_column(Boolean, default=False)
    auto_upload_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    default_privacy: Mapped[str] = mapped_column(String(20), default="private")  # private, unlisted, public
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user: Mapped["User"] = relationship("User")

# Database dependency
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Database initialization
async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Database tables created successfully")

# Test database connection
async def test_db_connection():
    """Test database connection"""
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(func.count()).select_from(User))
            count = result.scalar()
            print(f"✅ Database connection successful. Users in database: {count}")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

# Create sample data
async def create_sample_data():
    """Create sample data for testing"""
    async with AsyncSessionLocal() as session:
        # Check if data already exists
        result = await session.execute(select(func.count()).select_from(User))
        if result.scalar() > 0:
            print("✅ Sample data already exists")
            return
        
        # Create sample user
        user = User(
            email="demo@olcan-compass.com",
            username="demo_user",
            password_hash="hashed_password_here",  # In production, use proper hashing
            first_name="Demo",
            last_name="User"
        )
        session.add(user)
        await session.flush()
        
        # Create sample companion
        companion = Companion(
            user_id=user.id,
            name="Spark",
            archetype="strategist",
            evolution_stage="young",
            level=5,
            experience_points=250
        )
        session.add(companion)
        await session.flush()
        
        # Create companion stats
        stats = CompanionStats(
            companion_id=companion.id,
            power=15,
            wisdom=20,
            charisma=18,
            agility=12
        )
        session.add(stats)
        
        # Create sample abilities
        abilities = [
            CompanionAbility(
                companion_id=companion.id,
                name="Strategic Mind",
                description="Analyze situations with strategic precision",
                ability_type="passive",
                power_level=1
            ),
            CompanionAbility(
                companion_id=companion.id,
                name="Quick Thinking",
                description="React quickly to changing situations",
                ability_type="active",
                power_level=1,
                cooldown=30
            )
        ]
        for ability in abilities:
            session.add(ability)
        
        await session.commit()
        print("✅ Sample data created successfully")

# Main function for testing
if __name__ == "__main__":
    async def main():
        print("🔧 Initializing Olcan Compass Database...")
        
        # Test connection
        if not await test_db_connection():
            return
        
        # Initialize database
        await init_db()
        
        # Create sample data
        await create_sample_data()
        
        print("🎉 Database setup complete!")
    
    asyncio.run(main())
