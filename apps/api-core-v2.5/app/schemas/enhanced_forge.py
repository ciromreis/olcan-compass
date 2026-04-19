"""
Pydantic schemas for Enhanced Document Forge System
"""

import uuid
from datetime import datetime
from typing import Optional, List, Any, Dict, Union
from pydantic import BaseModel, ConfigDict, Field

from app.models.enhanced_forge import (
    ProcessStatus, DocumentVariationType, DocumentVariationStatus,
    ProcessTaskStatus, TaskPriority, ExportType, ExportFormat, ExportStatus
)


# ============================================================
# Process Schemas
# ============================================================

class ProcessBase(BaseModel):
    title: str = Field(..., max_length=255)
    process_type: str = Field(..., max_length=100)
    target_institution: Optional[str] = Field(None, max_length=255)
    target_organization: Optional[str] = Field(None, max_length=255)
    deadline: Optional[datetime] = None
    priority_level: str = Field("medium", max_length=20)
    status: ProcessStatus = ProcessStatus.DRAFT
    target_readiness: float = Field(90.0, ge=0, le=100)
    process_metadata: Dict[str, Any] = Field(default_factory=dict)
    requirements_context: Dict[str, Any] = Field(default_factory=dict)
    timeline_data: Dict[str, Any] = Field(default_factory=dict)
    is_favorite: bool = False


class ProcessCreate(ProcessBase):
    pass


class ProcessUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    process_type: Optional[str] = Field(None, max_length=100)
    target_institution: Optional[str] = Field(None, max_length=255)
    target_organization: Optional[str] = Field(None, max_length=255)
    deadline: Optional[datetime] = None
    priority_level: Optional[str] = Field(None, max_length=20)
    status: Optional[ProcessStatus] = None
    readiness_score: Optional[float] = Field(None, ge=0, le=100)
    target_readiness: Optional[float] = Field(None, ge=0, le=100)
    momentum_score: Optional[float] = Field(None, ge=0, le=100)
    process_metadata: Optional[Dict[str, Any]] = None
    requirements_context: Optional[Dict[str, Any]] = None
    timeline_data: Optional[Dict[str, Any]] = None
    is_favorite: Optional[bool] = None


class ProcessResponse(ProcessBase):
    id: uuid.UUID
    user_id: uuid.UUID
    readiness_score: float
    momentum_score: float
    created_at: datetime
    updated_at: datetime
    
    # Computed fields
    task_count: int = 0
    completed_task_count: int = 0
    document_count: int = 0
    days_until_deadline: Optional[int] = None
    urgency_level: str = "normal"
    
    model_config = ConfigDict(from_attributes=True)


class ProcessListResponse(BaseModel):
    processes: List[ProcessResponse]
    total: int
    aggregate_stats: Dict[str, Any] = Field(default_factory=dict)


# ============================================================
# Document Variation Schemas
# ============================================================

class DocumentVariationBase(BaseModel):
    title: str = Field(..., max_length=255)
    variation_type: DocumentVariationType
    content: str = ""
    content_sections: Dict[str, Any] = Field(default_factory=dict)
    shared_sections: List[str] = Field(default_factory=list)
    customized_sections: List[str] = Field(default_factory=list)
    status: DocumentVariationStatus = DocumentVariationStatus.DRAFT
    variation_metadata: Dict[str, Any] = Field(default_factory=dict)


class DocumentVariationCreate(DocumentVariationBase):
    base_document_id: uuid.UUID
    process_id: uuid.UUID


class DocumentVariationUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None
    content_sections: Optional[Dict[str, Any]] = None
    shared_sections: Optional[List[str]] = None
    customized_sections: Optional[List[str]] = None
    status: Optional[DocumentVariationStatus] = None
    ats_score: Optional[float] = Field(None, ge=0, le=100)
    authenticity_score: Optional[float] = Field(None, ge=0, le=100)
    cultural_fit_score: Optional[float] = Field(None, ge=0, le=100)
    variation_metadata: Optional[Dict[str, Any]] = None


class DocumentVariationResponse(DocumentVariationBase):
    id: uuid.UUID
    base_document_id: uuid.UUID
    process_id: uuid.UUID
    user_id: uuid.UUID
    version: int
    ats_score: Optional[float]
    authenticity_score: Optional[float]
    cultural_fit_score: Optional[float]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class VariationTreeResponse(BaseModel):
    base_document_id: uuid.UUID
    base_document_title: str
    variations: List[DocumentVariationResponse]
    shared_content_percentage: float
    total_variations: int


# ============================================================
# Process Task Schemas
# ============================================================

class ProcessTaskBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    task_type: str = Field("custom", max_length=50)
    category: str = Field("general", max_length=50)
    priority: TaskPriority = TaskPriority.MEDIUM
    xp_reward: int = Field(10, ge=0)
    estimated_hours: Optional[int] = Field(None, ge=0)
    due_date: Optional[datetime] = None
    template_task_id: Optional[str] = Field(None, max_length=100)
    task_metadata: Dict[str, Any] = Field(default_factory=dict)


class ProcessTaskCreate(ProcessTaskBase):
    process_id: uuid.UUID
    blocking_task_id: Optional[uuid.UUID] = None


class ProcessTaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    task_type: Optional[str] = Field(None, max_length=50)
    category: Optional[str] = Field(None, max_length=50)
    priority: Optional[TaskPriority] = None
    status: Optional[ProcessTaskStatus] = None
    xp_reward: Optional[int] = Field(None, ge=0)
    estimated_hours: Optional[int] = Field(None, ge=0)
    actual_hours: Optional[int] = Field(None, ge=0)
    due_date: Optional[datetime] = None
    blocking_task_id: Optional[uuid.UUID] = None
    task_metadata: Optional[Dict[str, Any]] = None
    completion_notes: Optional[str] = None


class ProcessTaskResponse(ProcessTaskBase):
    id: uuid.UUID
    process_id: uuid.UUID
    user_id: uuid.UUID
    status: ProcessTaskStatus
    actual_hours: Optional[int]
    blocking_task_id: Optional[uuid.UUID]
    completion_notes: Optional[str]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    # Computed fields
    is_overdue: bool = False
    is_blocked: bool = False
    dependency_count: int = 0
    
    model_config = ConfigDict(from_attributes=True)


class TaskHubResponse(BaseModel):
    tasks: List[ProcessTaskResponse]
    total: int
    filters_applied: Dict[str, Any] = Field(default_factory=dict)
    analytics: Dict[str, Any] = Field(default_factory=dict)


# ============================================================
# Process Template Schemas
# ============================================================

class ProcessTemplateResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    process_type: str
    category: str
    difficulty_level: str
    estimated_duration_days: Optional[int]
    template_data: Dict[str, Any]
    task_templates: List[Dict[str, Any]]
    document_requirements: List[Dict[str, Any]]
    milestones: List[Dict[str, Any]]
    success_metrics: Dict[str, Any]
    is_active: bool
    usage_count: int
    success_rate: float
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ProcessTemplateListResponse(BaseModel):
    templates: List[ProcessTemplateResponse]
    total: int
    categories: List[str]


# ============================================================
# Technical Report Schemas
# ============================================================

class TechnicalReportBase(BaseModel):
    report_type: str = Field("standard", max_length=50)
    title: str = Field(..., max_length=255)
    executive_summary: Optional[str] = None
    export_formats: List[str] = Field(default_factory=lambda: ["pdf", "html"])
    date_range_start: Optional[datetime] = None
    date_range_end: Optional[datetime] = None


class TechnicalReportCreate(TechnicalReportBase):
    process_id: uuid.UUID


class TechnicalReportResponse(TechnicalReportBase):
    id: uuid.UUID
    process_id: uuid.UUID
    user_id: uuid.UUID
    content_sections: Dict[str, Any]
    metrics_data: Dict[str, Any]
    timeline_data: Dict[str, Any]
    recommendations: List[Dict[str, Any]]
    generated_at: datetime
    expires_at: Optional[datetime]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============================================================
# Export Job Schemas
# ============================================================

class ExportJobBase(BaseModel):
    export_type: ExportType
    format: ExportFormat
    branding_enabled: bool = True
    export_options: Dict[str, Any] = Field(default_factory=dict)


class ExportJobCreate(ExportJobBase):
    process_id: Optional[uuid.UUID] = None


class ExportJobResponse(ExportJobBase):
    id: uuid.UUID
    user_id: uuid.UUID
    process_id: Optional[uuid.UUID]
    status: ExportStatus
    file_path: Optional[str]
    file_size_bytes: Optional[int]
    download_url: Optional[str]
    error_message: Optional[str]
    progress_percentage: int
    expires_at: Optional[datetime]
    downloaded_at: Optional[datetime]
    created_at: datetime
    completed_at: Optional[datetime]
    
    model_config = ConfigDict(from_attributes=True)


# ============================================================
# CMS Form Data Schemas
# ============================================================

class CMSFormDataBase(BaseModel):
    form_type: str = Field(..., max_length=100)
    form_version: str = Field("1.0", max_length=20)
    section_name: str = Field(..., max_length=100)
    field_data: Dict[str, Any] = Field(default_factory=dict)


class CMSFormDataCreate(CMSFormDataBase):
    pass


class CMSFormDataUpdate(BaseModel):
    field_data: Optional[Dict[str, Any]] = None
    completion_percentage: Optional[int] = Field(None, ge=0, le=100)
    is_validated: Optional[bool] = None
    validation_errors: Optional[List[Dict[str, Any]]] = None


class CMSFormDataResponse(CMSFormDataBase):
    id: uuid.UUID
    user_id: uuid.UUID
    completion_percentage: int
    is_validated: bool
    validation_errors: List[Dict[str, Any]]
    last_auto_save: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============================================================
# Analytics and Dashboard Schemas
# ============================================================

class ProcessAnalytics(BaseModel):
    total_processes: int
    active_processes: int
    completed_processes: int
    average_readiness_score: float
    average_momentum_score: float
    processes_by_type: Dict[str, int]
    processes_by_status: Dict[str, int]
    upcoming_deadlines: List[ProcessResponse]
    overdue_processes: List[ProcessResponse]


class DocumentForgeStats(BaseModel):
    total_documents: int
    total_variations: int
    documents_created_this_week: int
    variations_created_this_week: int
    average_ats_score: Optional[float]
    average_authenticity_score: Optional[float]
    documents_by_type: Dict[str, int]
    recent_documents: List[Dict[str, Any]]


class TaskAnalytics(BaseModel):
    total_tasks: int
    completed_tasks: int
    overdue_tasks: int
    blocked_tasks: int
    completion_rate: float
    average_completion_time_hours: Optional[float]
    tasks_by_priority: Dict[str, int]
    tasks_by_category: Dict[str, int]
    xp_earned_this_week: int


class EnhancedDashboardResponse(BaseModel):
    process_analytics: ProcessAnalytics
    document_stats: DocumentForgeStats
    task_analytics: TaskAnalytics
    gamification_data: Dict[str, Any]
    recent_activity: List[Dict[str, Any]]


# ============================================================
# Gamification Integration Schemas
# ============================================================

class XPEventData(BaseModel):
    event_type: str
    event_category: str
    xp_amount: int
    process_id: Optional[uuid.UUID] = None
    task_id: Optional[uuid.UUID] = None
    document_id: Optional[uuid.UUID] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AuraFeedbackData(BaseModel):
    user_id: uuid.UUID
    activity_type: str
    progress_data: Dict[str, Any]
    momentum_change: float
    readiness_improvement: float
    streak_impact: bool = False


class CompanionBarData(BaseModel):
    current_xp: int
    current_level: int
    level_title: str
    streak_days: int
    momentum_score: float
    active_processes: int
    pending_tasks: int
    recent_achievements: List[Dict[str, Any]]
    aura_evolution_stage: int
    motivational_message: Optional[str] = None


# ============================================================
# API Response Wrappers
# ============================================================

class MessageResponse(BaseModel):
    message: str
    success: bool = True
    data: Optional[Dict[str, Any]] = None


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    status_code: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int = 1
    per_page: int = 20
    pages: int
    has_next: bool
    has_prev: bool