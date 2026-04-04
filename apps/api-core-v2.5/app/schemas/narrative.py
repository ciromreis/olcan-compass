"""Narrative Intelligence Engine Schemas"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict


class NarrativeType(str, Enum):
    MOTIVATION_LETTER = "motivation_letter"
    PERSONAL_STATEMENT = "personal_statement"
    COVER_LETTER = "cover_letter"
    RESEARCH_PROPOSAL = "research_proposal"
    CV_SUMMARY = "cv_summary"
    SCHOLARSHIP_ESSAY = "scholarship_essay"
    OTHER = "other"


class NarrativeStatus(str, Enum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    READY = "ready"
    SUBMITTED = "submitted"
    ARCHIVED = "archived"


# === BASE SCHEMAS ===

class NarrativeBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    narrative_type: NarrativeType = NarrativeType.MOTIVATION_LETTER
    target_country: Optional[str] = Field(None, max_length=100)
    target_institution: Optional[str] = Field(None, max_length=200)
    target_program: Optional[str] = Field(None, max_length=200)


class NarrativeVersionBase(BaseModel):
    content: str = Field(..., min_length=1)
    change_summary: Optional[str] = Field(None, max_length=500)


class NarrativeAnalysisBase(BaseModel):
    clarity_score: float = Field(..., ge=0, le=100)
    coherence_score: float = Field(..., ge=0, le=100)
    alignment_score: float = Field(..., ge=0, le=100)
    authenticity_score: float = Field(..., ge=0, le=100)
    overall_score: float = Field(..., ge=0, le=100)


# === CREATE REQUESTS ===

class NarrativeCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    narrative_type: NarrativeType
    content: str = Field(..., min_length=1)
    route_id: Optional[UUID] = None
    target_country: Optional[str] = None
    target_institution: Optional[str] = None
    target_program: Optional[str] = None


class NarrativeVersionCreate(BaseModel):
    content: str = Field(..., min_length=1)
    change_summary: Optional[str] = Field(None, max_length=500)


class NarrativeContentUpdate(BaseModel):
    content: str = Field(..., min_length=0)


class AnalyzeRequest(BaseModel):
    """Request AI analysis of a narrative version"""
    ai_model: Optional[str] = "gpt-4"  # Model to use for analysis


# === UPDATE REQUESTS ===

class NarrativeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    narrative_type: Optional[NarrativeType] = None
    target_country: Optional[str] = None
    target_institution: Optional[str] = None
    target_program: Optional[str] = None
    status: Optional[NarrativeStatus] = None


# === RESPONSE SCHEMAS ===

class NarrativeAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    narrative_id: UUID
    version_id: Optional[UUID]
    
    # Scores
    clarity_score: float
    coherence_score: float
    alignment_score: float
    authenticity_score: float
    cultural_fit_score: Optional[float]
    overall_score: float
    
    # Risk assessment
    cliche_density_score: float
    authenticity_risk: str
    
    # Structured feedback
    key_strengths: List[str]
    improvement_actions: List[str]
    suggested_edits: List[dict]
    
    # AI metadata
    ai_model: Optional[str]
    prompt_version: Optional[str]
    token_usage: Optional[int]
    
    created_at: datetime


class NarrativeInterviewLoopInsightResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    narrative_id: UUID
    route_id: Optional[UUID]
    latest_session_id: Optional[UUID]
    linked_session_count: int
    completed_session_count: int
    average_overall_score: Optional[float]
    alignment_score: Optional[float]
    evidence_coverage_score: Optional[float]
    average_answer_duration_seconds: Optional[float]
    strongest_signals: List[str]
    focus_areas: List[str]
    summary: dict
    created_at: datetime
    updated_at: datetime


class NarrativeVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    narrative_id: UUID
    version_number: int
    content: str
    content_plain: Optional[str]
    word_count: int
    change_summary: Optional[str]
    
    # Analysis scores (if analyzed)
    clarity_score: Optional[float]
    coherence_score: Optional[float]
    authenticity_score: Optional[float]
    overall_score: Optional[float]
    
    created_at: datetime


class NarrativeListItem(BaseModel):
    """Lightweight narrative for list views"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    title: str
    narrative_type: NarrativeType
    status: NarrativeStatus
    target_country: Optional[str]
    target_institution: Optional[str]
    
    # Summary scores
    latest_overall_score: Optional[float]
    version_count: int
    
    created_at: datetime
    updated_at: datetime
    last_analyzed_at: Optional[datetime]


class NarrativeDetailResponse(BaseModel):
    """Full narrative with current version and analyses"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    route_id: Optional[UUID]
    title: str
    narrative_type: NarrativeType
    status: NarrativeStatus
    
    target_country: Optional[str]
    target_institution: Optional[str]
    target_program: Optional[str]
    
    # Version info
    version_count: int
    current_version_id: Optional[UUID]
    
    # Latest analysis summary
    latest_clarity_score: Optional[float]
    latest_coherence_score: Optional[float]
    latest_authenticity_score: Optional[float]
    latest_overall_score: Optional[float]
    ai_summary: Optional[str]
    key_strengths: List[str]
    improvement_areas: List[str]
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    last_analyzed_at: Optional[datetime]
    
    # Related data (populated separately)
    current_version: Optional[NarrativeVersionResponse] = None
    analyses: List[NarrativeAnalysisResponse] = []
    versions: List[NarrativeVersionResponse] = []
    interview_loop: Optional[NarrativeInterviewLoopInsightResponse] = None


class NarrativeComparison(BaseModel):
    """Compare two versions of a narrative"""
    version_1: NarrativeVersionResponse
    version_2: NarrativeVersionResponse
    
    score_changes: dict  # e.g., {"clarity": {"v1": 65, "v2": 72, "change": +7}}
    word_count_change: int
    key_differences: List[str]


# === LIST RESPONSES ===

class NarrativeListResponse(BaseModel):
    items: List[NarrativeListItem]
    total: int
    page: int
    page_size: int


class NarrativeAnalysisListResponse(BaseModel):
    items: List[NarrativeAnalysisResponse]
    total: int


# === EXPORT/SHARE ===

class ExportFormat(str, Enum):
    PDF = "pdf"
    DOCX = "docx"
    TXT = "txt"
    MARKDOWN = "markdown"


class ExportRequest(BaseModel):
    format: ExportFormat = ExportFormat.PDF
    include_analysis: bool = True
    version_id: Optional[UUID] = None  # None = current version


class ShareRequest(BaseModel):
    expires_days: int = Field(7, ge=1, le=30)
    version_id: Optional[UUID] = None
