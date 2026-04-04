from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

# Base schemas
class CompanionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    archetype_id: str = Field(..., description="ID of the archetype")
    type: str = Field(..., description="Companion type: strategist, innovator, creator, etc.")
    level: int = Field(default=1, ge=1, le=100)
    xp: int = Field(default=0, ge=0)
    xp_to_next: int = Field(default=500, ge=0)
    evolution_stage: str = Field(default="egg", description="egg, sprout, young, mature, master, legendary")
    abilities: List[Dict[str, Any]] = Field(default_factory=list)
    stats: Dict[str, int] = Field(default_factory=lambda: {
        "power": 70,
        "wisdom": 70,
        "charisma": 70,
        "agility": 70
    })
    current_health: float = Field(default=100.0, ge=0, le=100)
    max_health: float = Field(default=100.0, ge=0, le=100)
    energy: float = Field(default=100.0, ge=0, le=100)
    max_energy: float = Field(default=100.0, ge=0, le=100)

class CompanionCreate(CompanionBase):
    pass

class CompanionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    level: Optional[int] = Field(None, ge=1, le=100)
    xp: Optional[int] = Field(None, ge=0)
    xp_to_next: Optional[int] = Field(None, ge=0)
    evolution_stage: Optional[str] = Field(None, description="egg, sprout, young, mature, master, legendary")
    abilities: Optional[List[Dict[str, Any]]] = None
    stats: Optional[Dict[str, int]] = None
    current_health: Optional[float] = Field(None, ge=0, le=100)
    max_health: Optional[float] = Field(None, ge=0, le=100)
    energy: Optional[float] = Field(None, ge=0, le=100)
    max_energy: Optional[float] = Field(None, ge=0, le=100)

class Companion(CompanionBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    last_cared_at: datetime

    class Config:
        from_attributes = True

# Activity schemas
class CareActivityBase(BaseModel):
    type: str = Field(..., description="feed, train, play, rest")
    xp_reward: int = Field(..., ge=0)
    energy_cost: int = Field(..., ge=0)
    description: str = Field(..., min_length=1, max_length=255)

class CareActivity(CareActivityBase):
    pass

class CompanionActivityBase(BaseModel):
    activity_type: str = Field(..., description="feed, train, play, rest")
    xp_reward: int = Field(..., ge=0)
    energy_cost: int = Field(..., ge=0)
    description: Optional[str] = None
    completed_at: datetime

class CompanionActivity(CompanionActivityBase):
    id: UUID
    companion_id: UUID

    class Config:
        from_attributes = True

# Battle schemas
class CompanionBattleBase(BaseModel):
    battle_type: str = Field(..., description="duel, tournament, guild_war")
    result: str = Field(..., description="win, lose, draw")
    experience_gained: int = Field(default=0, ge=0)
    items_gained: List[Dict[str, Any]] = Field(default_factory=list)
    achievements_gained: List[Dict[str, Any]] = Field(default_factory=list)
    battle_data: Optional[Dict[str, Any]] = None

class CompanionBattleCreate(CompanionBattleBase):
    opponent_id: Optional[UUID] = None

class CompanionBattle(CompanionBattleBase):
    id: UUID
    companion_id: UUID
    opponent_id: Optional[UUID]
    battle_date: datetime

    class Config:
        from_attributes = True

# Evolution schemas
class CompanionEvolutionBase(BaseModel):
    from_stage: str = Field(..., description="Previous evolution stage")
    to_stage: str = Field(..., description="New evolution stage")
    evolution_reason: Optional[str] = None
    level_at_evolution: int = Field(..., ge=1)
    xp_at_evolution: int = Field(..., ge=0)
    stats_before: Optional[Dict[str, int]] = None
    stats_after: Optional[Dict[str, int]] = None

class CompanionEvolution(CompanionEvolutionBase):
    id: UUID
    companion_id: UUID
    evolved_at: datetime

    class Config:
        from_attributes = True

# Customization schemas
class CompanionCustomizationBase(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    accessories: List[str] = Field(default_factory=list)
    color_variant: Optional[str] = None
    special_effects: List[str] = Field(default_factory=list)
    is_premium: bool = Field(default=False)
    purchase_date: Optional[datetime] = None

class CompanionCustomizationCreate(CompanionCustomizationBase):
    pass

class CompanionCustomization(CompanionCustomizationBase):
    id: UUID
    companion_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Response schemas
class CompanionStats(BaseModel):
    companion: Companion
    stats: Dict[str, Any] = Field(..., description="Detailed companion statistics")

class CompanionProgress(BaseModel):
    companion: Companion
    xp_gained: int
    energy_used: int
    leveled_up: bool
    evolved: bool

class CompanionList(BaseModel):
    companions: List[Companion]
    total: int
    page: int
    size: int

# Achievement schemas
class AchievementBase(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    rarity: str = Field(..., description="common, rare, epic, legendary")
    unlocked: bool = Field(default=False)
    progress: Optional[int] = None
    max_progress: Optional[int] = None
    unlocked_at: Optional[datetime] = None

class Achievement(AchievementBase):
    class Config:
        from_attributes = True

class AchievementCreate(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    rarity: str = Field(..., description="common, rare, epic, legendary")

# Guild schemas
class GuildMemberBase(BaseModel):
    role: str = Field(..., description="leader, officer, member")
    joined_at: datetime

class GuildMember(GuildMemberBase):
    id: UUID
    guild_id: UUID
    user_id: UUID
    companion_id: Optional[UUID]

    class Config:
        from_attributes = True

class GuildBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    leader_id: UUID
    member_count: int = Field(default=1)
    archetype_focus: Optional[str] = None

class GuildCreate(GuildBase):
    pass

class Guild(GuildBase):
    id: UUID
    created_at: datetime
    members: List[GuildMember] = []

    class Config:
        from_attributes = True

# Leaderboard schemas
class LeaderboardEntry(BaseModel):
    companion_id: UUID
    companion_name: str
    user_id: UUID
    username: str
    level: int
    xp: int
    rank: int
    archetype: str
    avatar_url: Optional[str] = None

class Leaderboard(BaseModel):
    entries: List[LeaderboardEntry]
    total: int
    page: int
    size: int
    updated_at: datetime

# Marketplace schemas
class MarketplaceItemBase(BaseModel):
    name: str
    description: str
    item_type: str = Field(..., description="accessory, effect, consumable")
    rarity: str = Field(..., description="common, rare, epic, legendary")
    price: int = Field(..., ge=0)
    currency: str = Field(default="coins")
    available: bool = Field(default=True)
    requirements: Optional[Dict[str, Any]] = None

class MarketplaceItem(MarketplaceItemBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PurchaseBase(BaseModel):
    item_id: UUID
    quantity: int = Field(default=1, ge=1)
    currency: str = Field(default="coins")

class Purchase(PurchaseBase):
    id: UUID
    user_id: UUID
    companion_id: Optional[UUID]
    total_price: int
    purchased_at: datetime

    class Config:
        from_attributes = True
