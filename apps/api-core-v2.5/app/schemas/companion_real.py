"""
Real Working Companion Schemas
Pydantic models for the companion API that actually work
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Base models
class CompanionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    archetype: str = Field(..., pattern=r"^(strategist|innovator|creator|diplomat|pioneer|scholar)$")

class CompanionCreate(CompanionBase):
    pass

class CompanionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    evolution_stage: Optional[str] = Field(None, pattern=r"^(egg|sprout|young|mature|master|legendary)$")
    level: Optional[int] = Field(None, ge=1, le=50)
    experience_points: Optional[int] = Field(None, ge=0)
    health: Optional[int] = Field(None, ge=0, le=100)
    happiness: Optional[int] = Field(None, ge=0, le=100)
    energy: Optional[int] = Field(None, ge=0, le=100)

# Companion stats
class CompanionStatsBase(BaseModel):
    power: int = Field(..., ge=0, le=100)
    wisdom: int = Field(..., ge=0, le=100)
    charisma: int = Field(..., ge=0, le=100)
    agility: int = Field(..., ge=0, le=100)
    battles_won: int = Field(..., ge=0)
    battles_lost: int = Field(..., ge=0)

class CompanionStatsResponse(CompanionStatsBase):
    id: int
    companion_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Companion abilities
class CompanionAbilityBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    ability_type: str = Field(..., pattern=r"^(active|passive|ultimate)$")
    power_level: int = Field(..., ge=1, le=10)
    cooldown: Optional[int] = Field(None, ge=0)

class CompanionAbilityResponse(CompanionAbilityBase):
    id: int
    companion_id: int
    unlocked_at: datetime

    class Config:
        from_attributes = True

# Companion activities
class CompanionActivityCreate(BaseModel):
    activity_type: str = Field(..., pattern=r"^(feed|train|play|rest)$")

class CompanionActivityResponse(BaseModel):
    id: int
    companion_id: int
    activity_type: str
    xp_gained: int
    happiness_change: int
    energy_change: int
    health_change: int
    performed_at: datetime

    class Config:
        from_attributes = True

# Main companion response
class CompanionResponse(CompanionBase):
    id: int
    user_id: int
    evolution_stage: str
    level: int
    experience_points: int
    health: int
    happiness: int
    energy: int
    created_at: datetime
    last_cared_at: datetime
    stats: Optional[CompanionStatsResponse] = None
    abilities: Optional[List[CompanionAbilityResponse]] = []

    class Config:
        from_attributes = True

# User response
class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    first_name: str
    last_name: str
    is_active: bool
    is_premium: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Document schemas
class DocumentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    document_type: str = Field(..., pattern=r"^(resume|cover_letter|portfolio|other)$")

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    id: int
    user_id: int
    word_count: int
    readability_score: Optional[float]
    seo_score: Optional[float]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Interview schemas
class InterviewSessionBase(BaseModel):
    session_type: str = Field(..., pattern=r"^(practice|mock|real)$")
    industry: Optional[str] = Field(None, max_length=100)
    difficulty: Optional[str] = Field(None, pattern=r"^(easy|medium|hard)$")

class InterviewSessionCreate(InterviewSessionBase):
    pass

class InterviewSessionResponse(InterviewSessionBase):
    id: int
    user_id: int
    questions_asked: int
    overall_score: Optional[float]
    feedback: Optional[dict]
    started_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

# User schemas
class UserBase(BaseModel):
    email: str = Field(..., min_length=1, max_length=255)
    username: str = Field(..., min_length=1, max_length=100)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=255)

class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    username: Optional[str] = Field(None, min_length=1, max_length=100)

# Error response
class ErrorResponse(BaseModel):
    detail: str = Field(..., description="Error message")
    code: Optional[str] = Field(None, description="Error code")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
