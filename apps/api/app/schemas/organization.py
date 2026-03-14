from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr

from app.db.models.organization import OrganizationType, OrganizationMemberRole


class OrganizationBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    slug: str = Field(..., min_length=2, max_length=200)
    type: OrganizationType = OrganizationType.UNIVERSITY
    description: Optional[str] = None
    website_url: Optional[str] = None
    logo_url: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    type: Optional[OrganizationType] = None
    description: Optional[str] = None
    website_url: Optional[str] = None
    logo_url: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class OrganizationResponse(OrganizationBase):
    id: UUID
    is_active: bool
    is_verified: bool
    settings: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrganizationMemberBase(BaseModel):
    role: OrganizationMemberRole = OrganizationMemberRole.MEMBER
    status: str = "active"


class OrganizationMemberUpdate(BaseModel):
    role: Optional[OrganizationMemberRole] = None
    status: Optional[str] = None


class OrganizationMemberResponse(OrganizationMemberBase):
    id: UUID
    organization_id: UUID
    user_id: UUID
    joined_at: datetime
    
    # Optional fields to be populated by joined user data
    user_name: Optional[str] = None
    user_email: Optional[EmailStr] = None

    model_config = {"from_attributes": True}


class OrganizationInviteRequest(BaseModel):
    email: EmailStr
    role: OrganizationMemberRole = OrganizationMemberRole.MEMBER


class OrganizationDashboardStats(BaseModel):
    total_members: int
    active_members: int
    pending_invites: int
    total_applications: int
    total_routes: int
    average_score: float
