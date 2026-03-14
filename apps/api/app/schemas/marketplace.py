from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field

from app.db.models.marketplace import ProviderStatus, ServiceType, BookingStatus, PaymentStatus


class ProviderProfileBase(BaseModel):
    headline: Optional[str] = None
    bio: Optional[str] = None
    current_title: Optional[str] = None
    current_organization: Optional[str] = None
    years_experience: Optional[int] = None
    education: List[Dict[str, Any]] = []
    specializations: List[str] = []
    target_regions: List[str] = []
    target_institutions: List[str] = []
    languages_spoken: List[str] = []
    timezone: Optional[str] = None


class ProviderProfileUpdate(BaseModel):
    headline: Optional[str] = None
    bio: Optional[str] = None
    current_title: Optional[str] = None
    current_organization: Optional[str] = None
    years_experience: Optional[int] = None
    education: Optional[List[Dict[str, Any]]] = None
    specializations: Optional[List[str]] = None
    target_regions: Optional[List[str]] = None
    target_institutions: Optional[List[str]] = None
    languages_spoken: Optional[List[str]] = None
    timezone: Optional[str] = None
    profile_settings: Optional[Dict[str, Any]] = None


class ProviderProfileResponse(ProviderProfileBase):
    id: UUID
    user_id: UUID
    status: ProviderStatus
    rating_average: float
    review_count: int
    completed_bookings: int
    total_bookings: int
    profile_settings: Dict[str, Any]
    is_featured: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ServiceListingBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: str
    service_type: ServiceType
    price: Decimal = Field(..., ge=0)
    duration_minutes: int = Field(..., ge=1)
    is_active: bool = True


class ServiceListingCreate(ServiceListingBase):
    pass


class ServiceListingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=200)
    description: Optional[str] = None
    service_type: Optional[ServiceType] = None
    price: Optional[Decimal] = Field(None, ge=0)
    duration_minutes: Optional[int] = Field(None, ge=1)
    is_active: Optional[bool] = None


class ServiceListingResponse(ServiceListingBase):
    id: UUID
    provider_id: UUID
    rating_average: float
    review_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BookingBase(BaseModel):
    service_id: UUID
    scheduled_date: date
    scheduled_time: str # HH:MM format
    notes: Optional[str] = None


class BookingCreate(BookingBase):
    pass


class BookingResponse(BaseModel):
    id: UUID
    user_id: UUID
    provider_id: UUID
    service_id: UUID
    status: BookingStatus
    payment_status: PaymentStatus
    price_agreed: Decimal
    scheduled_date: date
    scheduled_time: str
    created_at: datetime
    
    # Optional enriched fields
    service_title: Optional[str] = None
    provider_name: Optional[str] = None
    user_name: Optional[str] = None

    model_config = {"from_attributes": True}


class ReviewBase(BaseModel):
    booking_id: UUID
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    pass


class ReviewResponse(ReviewBase):
    id: UUID
    user_id: UUID
    provider_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}
