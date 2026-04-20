"""
User schemas for request/response validation
"""

import uuid
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    username: Optional[str] = None  # auto-derived from email if not provided
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

    def get_username(self) -> str:
        """Return provided username or derive one from the email prefix."""
        if self.username:
            return self.username
        return self.email.split("@")[0]


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    preferences: Optional[dict] = None


class UserInDB(UserBase):
    id: uuid.UUID
    level: int
    xp: int
    is_active: bool
    is_verified: bool
    is_premium: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserResponse(UserInDB):
    pass


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None


class TokenData(BaseModel):
    user_id: Optional[uuid.UUID] = None
    username: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str
