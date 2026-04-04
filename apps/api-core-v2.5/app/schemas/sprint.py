"""Readiness Engine and Sprint Management Schemas"""

from datetime import datetime, date
from typing import Optional, List
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict


class SprintStatus(str, Enum):
    PLANNED = "planned"
    ACTIVE = "active"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class SprintTaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class SprintTaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# === SPRINT TEMPLATE SCHEMAS ===

class SprintTemplateBase(BaseModel):
    name: str = Field(..., max_length=200)
    description: Optional[str] = None
    target_gap_category: str = Field(..., max_length=50)
    target_readiness_threshold: float = Field(0.0, ge=0, le=100)
    duration_days: int = Field(14, ge=1, le=90)
    estimated_effort_hours: int = Field(20, ge=1, le=200)
    default_tasks: List[dict] = []
    suggested_resources: List[dict] = []


class SprintTemplateCreate(SprintTemplateBase):
    pass


class SprintTemplateResponse(SprintTemplateBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime


class SprintTemplateListResponse(BaseModel):
    items: List[SprintTemplateResponse]
    total: int


# === USER SPRINT SCHEMAS ===

class UserSprintCreate(BaseModel):
    name: str = Field(..., max_length=200)
    description: Optional[str] = None
    route_id: Optional[UUID] = None
    template_id: Optional[UUID] = None
    gap_category: str = Field(..., max_length=50)
    gap_description: Optional[str] = None
    start_date: Optional[date] = None
    target_end_date: Optional[date] = None


class UserSprintUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    status: Optional[SprintStatus] = None
    start_date: Optional[date] = None
    target_end_date: Optional[date] = None


class UserSprintStartRequest(BaseModel):
    """Start a planned sprint"""
    start_date: Optional[date] = None  # Defaults to today


class UserSprintListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    route_id: Optional[UUID]
    gap_category: str
    status: SprintStatus
    
    # Progress
    total_tasks: int
    completed_tasks: int
    completion_percentage: int
    
    # Timing
    start_date: Optional[date]
    target_end_date: Optional[date]
    completed_at: Optional[datetime]
    
    created_at: datetime
    updated_at: datetime


class UserSprintDetailResponse(UserSprintListItem):
    model_config = ConfigDict(from_attributes=True)
    
    description: Optional[str]
    gap_description: Optional[str]
    
    # Effort
    estimated_effort_hours: int
    actual_effort_hours: int
    
    # AI guidance
    ai_guidance: Optional[str]
    personalized_tips: List[str]
    linked_milestone_ids: List[UUID]
    
    # Tasks
    tasks: List["SprintTaskResponse"] = []


class UserSprintListResponse(BaseModel):
    items: List[UserSprintListItem]
    total: int
    page: int
    page_size: int


# === SPRINT TASK SCHEMAS ===

class SprintTaskCreate(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    task_type: str = Field("action", max_length=50)
    category: str = Field(..., max_length=50)
    priority: SprintTaskPriority = SprintTaskPriority.MEDIUM
    estimated_minutes: Optional[int] = Field(None, ge=1, le=480)
    due_date: Optional[date] = None
    prerequisite_task_ids: List[UUID] = []
    linked_milestone_id: Optional[UUID] = None
    linked_narrative_id: Optional[UUID] = None
    linked_application_id: Optional[UUID] = None
    external_url: Optional[str] = Field(None, max_length=500)
    resource_links: List[dict] = []
    display_order: int = 0


class SprintTaskBulkCreate(BaseModel):
    """Bulk create sprint tasks in a single request to avoid Neon connection exhaustion."""
    tasks: List[SprintTaskCreate] = Field(..., min_length=1, max_length=50)


class SprintTaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    status: Optional[SprintTaskStatus] = None
    priority: Optional[SprintTaskPriority] = None
    estimated_minutes: Optional[int] = None
    due_date: Optional[date] = None
    user_notes: Optional[str] = None
    completion_notes: Optional[str] = None


class SprintTaskCompleteRequest(BaseModel):
    completion_notes: Optional[str] = None


class SprintTaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    sprint_id: UUID
    title: str
    description: Optional[str]
    
    # Categorization
    task_type: str
    category: str
    
    # Status
    status: SprintTaskStatus
    priority: SprintTaskPriority
    
    # Timing
    estimated_minutes: Optional[int]
    due_date: Optional[date]
    completed_at: Optional[datetime]
    
    # Dependencies and links
    prerequisite_task_ids: List[UUID]
    linked_milestone_id: Optional[UUID]
    linked_narrative_id: Optional[UUID]
    linked_application_id: Optional[UUID]
    
    # Resources
    external_url: Optional[str]
    resource_links: List[dict]
    
    # Notes
    user_notes: Optional[str]
    completion_notes: Optional[str]
    
    # Order
    display_order: int
    
    created_at: datetime
    updated_at: datetime


class SprintTaskListResponse(BaseModel):
    items: List[SprintTaskResponse]
    total: int


# === READINESS ASSESSMENT SCHEMAS ===

class ReadinessAssessmentCreate(BaseModel):
    route_id: Optional[UUID] = None
    assessment_type: str = "self_assessment"
    
    # Self-reported scores (0-100)
    confidence_score: float = Field(..., ge=0, le=100)
    documentation_score: float = Field(..., ge=0, le=100)
    financial_score: float = Field(..., ge=0, le=100)
    language_score: float = Field(..., ge=0, le=100)
    experience_score: float = Field(..., ge=0, le=100)


class ReadinessAssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    route_id: Optional[UUID]
    
    # Scores
    overall_readiness: float
    confidence_score: float
    documentation_score: float
    financial_score: float
    language_score: float
    experience_score: float
    
    # Analysis
    gaps_identified: List[dict]
    strengths: List[str]
    
    # Metadata
    assessment_type: str
    ai_model_version: Optional[str]
    recommended_sprint_template_ids: List[UUID]
    
    created_at: datetime


class ReadinessAssessmentListResponse(BaseModel):
    items: List[ReadinessAssessmentResponse]
    total: int


# === GAP ANALYSIS SCHEMAS ===

class GapSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class GapAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    route_id: UUID
    
    # Gap details
    category: str
    severity: str
    
    # What's missing
    missing_items: List[str]
    missing_document_types: List[str]
    
    # Level comparison
    required_level: Optional[str]
    current_level: Optional[str]
    
    # Resolution
    blocking: bool
    estimated_resolution_days: Optional[int]
    suggested_sprint_template_id: Optional[UUID]
    
    # Status
    is_resolved: bool
    resolved_at: Optional[datetime]
    resolved_by_sprint_id: Optional[UUID]
    
    created_at: datetime
    updated_at: datetime


class GapAnalysisListResponse(BaseModel):
    items: List[GapAnalysisResponse]
    total: int


# === SPRINT GENERATION ===

class GenerateSprintsRequest(BaseModel):
    route_id: Optional[UUID] = None
    focus_areas: Optional[List[str]] = None  # e.g., ["language", "documentation"]
    max_sprints: int = Field(3, ge=1, le=5)


class GeneratedSprintRecommendation(BaseModel):
    template_id: Optional[UUID]
    name: str
    description: str
    gap_category: str
    duration_days: int
    estimated_effort_hours: int
    priority: str  # high, medium, low
    reason: str  # Why this sprint is recommended
    suggested_tasks: List[dict]


class GenerateSprintsResponse(BaseModel):
    recommendations: List[GeneratedSprintRecommendation]
    based_on_assessment_id: Optional[UUID]
    total_estimated_days: int
    total_estimated_hours: int


# === DASHBOARD/STATS ===

class SprintStats(BaseModel):
    total_sprints: int
    active_sprints: int
    completed_sprints: int
    completion_rate: float  # Percentage
    
    # Task stats
    total_tasks: int
    completed_tasks: int
    
    # By category
    sprints_by_category: dict  # { "language": 3, "documentation": 2, ... }
    
    # Current active sprints
    active_sprints_list: List[UserSprintListItem]


class ReadinessOverview(BaseModel):
    """Complete readiness overview for a user"""
    latest_assessment: Optional[ReadinessAssessmentResponse]
    
    # Gap summary
    open_gaps: int
    critical_gaps: int
    resolved_gaps: int
    
    # Sprint summary
    active_sprints: int
    sprints_completed_this_month: int
    
    # Quick actions
    recommended_next_sprints: List[GeneratedSprintRecommendation]
    urgent_tasks: List[SprintTaskResponse]


# === ACTIVITY LOG ===

class SprintActivityLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    sprint_id: UUID
    task_id: Optional[UUID]
    activity_type: str
    previous_status: Optional[str]
    new_status: Optional[str]
    notes: Optional[str]
    created_at: datetime


class SprintActivityLogListResponse(BaseModel):
    items: List[SprintActivityLogResponse]
    total: int
