"""Organization Models

Support for institutions, schools, and professional organizations.
"""

import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import DateTime, String, Text, ForeignKey, JSON, Enum, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class OrganizationType(str, enum.Enum):
    UNIVERSITY = "university"
    COLLEGE = "college"
    SCHOOL = "school"
    AGENCY = "agency"
    CORPORATION = "corporation"
    NON_PROFIT = "non_profit"


class OrganizationMemberRole(str, enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    COORDINATOR = "coordinator"
    MEMBER = "member"


class Organization(Base):
    """Organization entity for institutional onboarding"""
    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    type: Mapped[OrganizationType] = mapped_column(
        Enum(OrganizationType, values_callable=lambda x: [e.value for e in x]),
        default=OrganizationType.UNIVERSITY,
        nullable=False
    )
    
    # Metadata
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    website_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    # Location
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Settings
    settings: Mapped[dict] = mapped_column(JSON, default=dict)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class OrganizationMember(Base):
    """Membership of users in organizations"""
    __tablename__ = "organization_members"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    role: Mapped[OrganizationMemberRole] = mapped_column(
        Enum(OrganizationMemberRole, values_callable=lambda x: [e.value for e in x]),
        default=OrganizationMemberRole.MEMBER,
        nullable=False
    )
    
    # Member status
    status: Mapped[str] = mapped_column(String(20), default="active")  # active, invited, suspended
    
    # Date joined
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
