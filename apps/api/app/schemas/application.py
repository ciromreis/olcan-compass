"""Application Management Engine Schemas"""

from datetime import datetime, date
from typing import Optional, List
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict


class OpportunityType(str, Enum):
    SCHOLARSHIP = "scholarship"
    JOB = "job"
    RESEARCH_POSITION = "research_position"
    EXCHANGE_PROGRAM = "exchange_program"
    GRANT = "grant"
    FELLOWSHIP = "fellowship"
    INTERNSHIP = "internship"
    CONFERENCE = "conference"


class OpportunityStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CLOSED = "closed"
    ARCHIVED = "archived"


class ApplicationStatus(str, Enum):
    WATCHING = "watching"
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class ApplicationDocumentType(str, Enum):
    MOTIVATION_LETTER = "motivation_letter"
    CV = "cv"
    TRANSCRIPT = "transcript"
    RECOMMENDATION_LETTER = "recommendation_letter"
    LANGUAGE_CERTIFICATE = "language_certificate"
    PORTFOLIO = "portfolio"
    RESEARCH_PROPOSAL = "research_proposal"
    OTHER = "other"


# === OPPORTUNITY SCHEMAS ===

class OpportunityBase(BaseModel):
    title: str = Field(..., max_length=300)
    description: Optional[str] = None
    opportunity_type: OpportunityType
    organization_name: Optional[str] = Field(None, max_length=200)
    organization_country: Optional[str] = Field(None, max_length=100)
    organization_website: Optional[str] = Field(None, max_length=500)
    location_type: str = Field("onsite", max_length=20)
    location_country: Optional[str] = Field(None, max_length=100)
    location_city: Optional[str] = Field(None, max_length=100)
    application_deadline: Optional[datetime] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration_months: Optional[int] = None
    funding_amount: Optional[float] = None
    funding_currency: Optional[str] = Field(None, max_length=3)
    funding_details: Optional[str] = None
    required_documents: List[str] = []
    eligibility_criteria: Optional[str] = None
    required_languages: List[str] = []
    application_url: Optional[str] = Field(None, max_length=500)
    application_instructions: Optional[str] = None
    relevant_fields: List[str] = []
    required_experience_years: Optional[int] = None
    education_level: Optional[str] = Field(None, max_length=50)


class OpportunityCreate(OpportunityBase):
    pass


class OpportunityUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=300)
    description: Optional[str] = None
    opportunity_type: Optional[OpportunityType] = None
    status: Optional[OpportunityStatus] = None
    organization_name: Optional[str] = None
    organization_country: Optional[str] = None
    location_country: Optional[str] = None
    location_city: Optional[str] = None
    application_deadline: Optional[datetime] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration_months: Optional[int] = None
    funding_amount: Optional[float] = None
    funding_currency: Optional[str] = None
    funding_details: Optional[str] = None
    required_documents: Optional[List[str]] = None
    eligibility_criteria: Optional[str] = None
    required_languages: Optional[List[str]] = None
    application_url: Optional[str] = None
    application_instructions: Optional[str] = None
    relevant_fields: Optional[List[str]] = None
    required_experience_years: Optional[int] = None
    education_level: Optional[str] = None
    is_featured: Optional[bool] = None


class OpportunityListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    title: str
    opportunity_type: OpportunityType
    status: OpportunityStatus
    organization_name: Optional[str]
    organization_country: Optional[str]
    location_country: Optional[str]
    application_deadline: Optional[datetime]
    start_date: Optional[date]
    funding_amount: Optional[float]
    funding_currency: Optional[str]
    is_featured: bool
    created_at: datetime


class OpportunityDetailResponse(OpportunityBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    status: OpportunityStatus
    is_featured: bool
    view_count: int
    source: Optional[str]
    external_id: Optional[str]
    created_by_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]


class OpportunityListResponse(BaseModel):
    items: List[OpportunityListItem]
    total: int
    page: int
    page_size: int


# === APPLICATION SCHEMAS ===

class UserApplicationCreate(BaseModel):
    opportunity_id: UUID
    status: ApplicationStatus = ApplicationStatus.WATCHING
    priority: str = "medium"
    notes: Optional[str] = None


class UserApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None
    priority: Optional[str] = None
    notes: Optional[str] = None
    checklist_progress: Optional[dict] = None


class UserApplicationListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    opportunity_id: UUID
    status: ApplicationStatus
    priority: str
    completion_percentage: int
    started_at: Optional[datetime]
    submitted_at: Optional[datetime]
    outcome: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    # Nested opportunity data
    opportunity: Optional[OpportunityListItem] = None


class UserApplicationDetailResponse(UserApplicationListItem):
    model_config = ConfigDict(from_attributes=True)
    
    notes: Optional[str]
    checklist_progress: dict
    response_received_at: Optional[datetime]
    feedback_received: Optional[str]
    
    documents: List["ApplicationDocumentResponse"] = []


class UserApplicationListResponse(BaseModel):
    items: List[UserApplicationListItem]
    total: int
    page: int
    page_size: int


# === APPLICATION DOCUMENT SCHEMAS ===

class ApplicationDocumentCreate(BaseModel):
    document_type: ApplicationDocumentType
    narrative_id: Optional[UUID] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    notes: Optional[str] = None


class ApplicationDocumentUpdate(BaseModel):
    narrative_id: Optional[UUID] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    is_submitted: Optional[bool] = None
    submitted_version_id: Optional[UUID] = None
    notes: Optional[str] = None


class ApplicationDocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    application_id: UUID
    document_type: ApplicationDocumentType
    narrative_id: Optional[UUID]
    file_url: Optional[str]
    file_name: Optional[str]
    is_submitted: bool
    submitted_version_id: Optional[UUID]
    validation_status: str
    validation_notes: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime


# === WATCHLIST SCHEMAS ===

class WatchlistAddRequest(BaseModel):
    opportunity_id: UUID
    reminder_date: Optional[datetime] = None
    notes: Optional[str] = None


class WatchlistItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    opportunity_id: UUID
    reminder_date: Optional[datetime]
    reminder_sent: bool
    notes: Optional[str]
    created_at: datetime
    
    opportunity: Optional[OpportunityListItem] = None


class WatchlistListResponse(BaseModel):
    items: List[WatchlistItem]
    total: int


# === MATCHING SCHEMAS ===

class OpportunityMatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    opportunity_id: UUID
    match_score: float
    fit_score: Optional[float]
    interest_score: Optional[float]
    match_reasons: List[str]
    missing_requirements: List[str]
    user_feedback: Optional[str]
    feedback_at: Optional[datetime]
    is_dismissed: bool
    created_at: datetime
    
    opportunity: Optional[OpportunityListItem] = None


class OpportunityMatchListResponse(BaseModel):
    items: List[OpportunityMatchResponse]
    total: int


class MatchFeedbackRequest(BaseModel):
    user_feedback: str  # interested, not_interested, applied


# === DASHBOARD/STATS SCHEMAS ===

class ApplicationStats(BaseModel):
    total_applications: int
    by_status: dict  # { "watching": 5, "in_progress": 2, ... }
    upcoming_deadlines: List[UserApplicationListItem]
    recent_activity: List[UserApplicationListItem]
    completion_average: float


class OpportunitySearchFilters(BaseModel):
    opportunity_type: Optional[OpportunityType] = None
    country: Optional[str] = None
    field: Optional[str] = None
    deadline_after: Optional[date] = None
    deadline_before: Optional[date] = None
    funding_available: Optional[bool] = None


class SubmitApplicationRequest(BaseModel):
    """Mark application as submitted"""
    submitted_at: Optional[datetime] = None  # Defaults to now


class ApplicationOutcomeRequest(BaseModel):
    outcome: str  # accepted, rejected, waitlisted, etc.
    feedback_received: Optional[str] = None
