from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field


# --- Route Template Schemas ---

class RouteTemplateResponse(BaseModel):
    id: UUID
    route_type: str
    name_en: str
    name_pt: str
    name_es: str
    description_en: str
    description_pt: str
    description_es: str
    estimated_duration_months: int
    competitiveness_level: str
    typical_cost_usd: int
    is_active: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}


class RouteTemplateListResponse(BaseModel):
    templates: List[RouteTemplateResponse]
    total: int


# --- Route Milestone Template Schemas ---

class RouteMilestoneTemplateResponse(BaseModel):
    id: UUID
    route_template_id: UUID
    name_en: str
    name_pt: str
    name_es: str
    description_en: str
    description_pt: str
    description_es: str
    category: str
    display_order: int
    estimated_days: int
    prerequisites: List[str]
    required_evidence: List[str]
    is_required: bool
    
    model_config = {"from_attributes": True}


# --- Route Schemas ---

class RouteCreateRequest(BaseModel):
    template_id: UUID
    name: str = Field(..., max_length=200)
    target_country: Optional[str] = None
    target_organization: Optional[str] = None
    target_deadline: Optional[datetime] = None


class RouteUpdateRequest(BaseModel):
    name: Optional[str] = None
    target_country: Optional[str] = None
    target_organization: Optional[str] = None
    target_deadline: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class RouteResponse(BaseModel):
    id: UUID
    user_id: UUID
    template_id: UUID
    name: str
    target_country: Optional[str]
    target_organization: Optional[str]
    target_deadline: Optional[datetime]
    status: str
    completion_percentage: int
    milestones_completed: int
    total_milestones: int
    readiness_score: float
    risk_level: str
    notes: Optional[str]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class RouteListResponse(BaseModel):
    routes: List[RouteResponse]
    total: int


class RouteDetailResponse(BaseModel):
    route: RouteResponse
    milestones: List["RouteMilestoneResponse"]
    template: RouteTemplateResponse


# --- Route Milestone Schemas ---

class RouteMilestoneUpdateRequest(BaseModel):
    status: Optional[str] = None
    user_notes: Optional[str] = None
    completion_notes: Optional[str] = None
    due_date: Optional[datetime] = None


class RouteMilestoneResponse(BaseModel):
    id: UUID
    route_id: UUID
    template_id: UUID
    status: str
    completion_percentage: int
    evidence_submitted: List[str]
    evidence_approved: bool
    user_notes: Optional[str]
    completion_notes: Optional[str]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    # Enriched from milestone template
    name_pt: Optional[str] = None
    name_en: Optional[str] = None
    description_pt: Optional[str] = None
    description_en: Optional[str] = None
    category: Optional[str] = None
    display_order: Optional[int] = None
    estimated_days: Optional[int] = None
    required_evidence: Optional[List[str]] = None
    is_required: Optional[bool] = None
    
    model_config = {"from_attributes": True}


# Update forward reference
RouteDetailResponse.model_rebuild()


# --- Templates Endpoints Response ---

class AvailableTemplatesResponse(BaseModel):
    templates: List[RouteTemplateResponse]
    total: int
