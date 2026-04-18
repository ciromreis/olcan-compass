from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator
from app.schemas.economics import OpportunityCostResponse, MomentumResponse
from app.schemas.psychology import PsychProfileResponse


class Token(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """JWT payload data"""
    sub: str  # user_id as string
    email: EmailStr
    role: str


class AuthRegisterRequest(BaseModel):
    """Request body for user registration"""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    full_name: Optional[str] = None


class AuthLoginRequest(BaseModel):
    """Request body for user login"""
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    """Response after successful auth — OAuth2-style top-level tokens (web + mobile clients)."""

    user_id: str
    email: EmailStr
    role: str
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserProfileResponse(BaseModel):
    """User profile response"""
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    language: str
    timezone: str
    role: str
    is_verified: bool
    is_premium: bool
    created_at: datetime
    
    # Omega Telemetry Snapshots
    economics: Optional[OpportunityCostResponse] = None
    momentum: Optional[MomentumResponse] = None
    psychology: Optional[PsychProfileResponse] = None
    
    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    """Request to update user profile"""
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    language: Optional[str] = Field(None, min_length=2, max_length=10)
    timezone: Optional[str] = Field(None, min_length=1, max_length=50)

    @field_validator("full_name", "avatar_url", mode="before")
    @classmethod
    def empty_as_none(cls, v):
        if v is None:
            return None
        if isinstance(v, str) and not v.strip():
            return None
        return v.strip() if isinstance(v, str) else v

    @field_validator("language", "timezone", mode="before")
    @classmethod
    def strip_locale(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            return v.strip()
        return v


class ChangePasswordRequest(BaseModel):
    """Request to change password"""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)


class ErrorResponse(BaseModel):
    """Standard error response"""
    detail: str
    code: Optional[str] = None
    field: Optional[str] = None


# --- Email Verification Schemas ---

class VerifyEmailRequest(BaseModel):
    """Request to verify email with token"""
    token: str


class ResendVerificationRequest(BaseModel):
    """Request to resend verification email"""
    email: EmailStr


class VerificationResponse(BaseModel):
    """Response after email verification"""
    message: str
    is_verified: bool


# --- Password Reset Schemas ---

class ForgotPasswordRequest(BaseModel):
    """Request to initiate password reset"""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Request to reset password with token"""
    token: str
    new_password: str = Field(..., min_length=8, max_length=100)


class PasswordResetResponse(BaseModel):
    """Response after password reset"""
    message: str


class OrganizationAccessRequest(BaseModel):
    """Request organization onboarding after account creation"""
    organization_name: str = Field(..., min_length=2, max_length=200)
    requested_role: str = Field(..., min_length=2, max_length=100)
