from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


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
    """Response body after successful auth"""
    user_id: str
    email: EmailStr
    role: str
    token: Token


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
    created_at: datetime
    
    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    """Request to update user profile"""
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    language: Optional[str] = Field(None, min_length=2, max_length=10)
    timezone: Optional[str] = None


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
