"""
Document schemas for Narrative Forge API
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


# --- Document Schemas ---

class DocumentCreate(BaseModel):
    """Create new document"""
    title: str = Field(..., max_length=500)
    document_type: str
    content: str = ""
    target_character_count: Optional[int] = None
    min_character_count: Optional[int] = None
    max_character_count: Optional[int] = None
    target_word_count: Optional[int] = None
    tags: List[str] = []
    notes: Optional[str] = None
    route_id: Optional[UUID] = None
    scope: str = "universal"


class DocumentUpdate(BaseModel):
    """Update document"""
    title: Optional[str] = Field(None, max_length=500)
    content: Optional[str] = None
    status: Optional[str] = None
    target_character_count: Optional[int] = None
    min_character_count: Optional[int] = None
    max_character_count: Optional[int] = None
    target_word_count: Optional[int] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    route_id: Optional[UUID] = None
    scope: Optional[str] = None


class DocumentResponse(BaseModel):
    """Document response"""
    id: UUID
    user_id: UUID
    title: str
    document_type: str
    status: str
    content: str
    content_html: Optional[str]
    target_character_count: Optional[int]
    min_character_count: Optional[int]
    max_character_count: Optional[int]
    current_character_count: int
    target_word_count: Optional[int]
    current_word_count: int
    ats_score: Optional[float]
    ats_keywords: List[str]
    ats_suggestions: List[str]
    polish_count: int
    last_polished_at: Optional[datetime]
    version: int
    is_latest_version: bool
    parent_version_id: Optional[UUID]
    tags: List[str]
    notes: Optional[str]
    focus_mode_time_seconds: int
    route_id: Optional[UUID] = None
    scope: str = "universal"
    created_at: datetime
    updated_at: datetime
    last_edited_at: Optional[datetime]

    model_config = {"from_attributes": True}


class DocumentListResponse(BaseModel):
    """List of documents"""
    documents: List[DocumentResponse]
    total: int


class DocumentSummary(BaseModel):
    """Document summary for lists"""
    id: UUID
    title: str
    document_type: str
    status: str
    current_character_count: int
    current_word_count: int
    ats_score: Optional[float]
    polish_count: int
    version: int
    updated_at: datetime


# --- Polish Request Schemas ---

class PolishRequest(BaseModel):
    """Request AI polish"""
    instructions: Optional[str] = None
    focus_areas: List[str] = []  # e.g., ["grammar", "clarity", "star_method"]
    preserve_voice: bool = True
    target_tone: Optional[str] = None  # e.g., "professional", "academic", "conversational"


class PolishResponse(BaseModel):
    """Polish response"""
    id: UUID
    document_id: UUID
    status: str
    original_content: str
    polished_content: Optional[str]
    suggestions: List[dict]
    changes_made: List[dict]
    model_used: Optional[str]
    tokens_used: Optional[int]
    processing_time_ms: Optional[int]
    created_at: datetime
    completed_at: Optional[datetime]

    model_config = {"from_attributes": True}


class PolishFeedback(BaseModel):
    """User feedback on polish"""
    accepted: bool
    rating: Optional[int] = Field(None, ge=1, le=5)
    feedback: Optional[str] = None


# --- ATS Analysis Schemas ---

class ATSAnalysisRequest(BaseModel):
    """Request ATS analysis"""
    job_description: Optional[str] = None
    target_keywords: List[str] = []


class ATSAnalysisResponse(BaseModel):
    """ATS analysis result"""
    score: float
    keywords_found: List[str]
    keywords_missing: List[str]
    suggestions: List[dict]
    readability_score: Optional[float]
    structure_score: Optional[float]
    keyword_density: dict


# --- Narrative Analysis Schemas ---

class AnalysisResponse(BaseModel):
    """Result of Narrative AI analysis"""
    clarity_score: int
    coherence_score: int
    authenticity_score: int
    narrative_arc: str
    key_strengths: List[str]
    areas_for_improvement: List[str]
    suggested_edits: List[dict]
    overall_feedback: str
    confidence: float


# --- Version History Schemas ---

class DocumentVersion(BaseModel):
    """Document version info"""
    id: UUID
    version: int
    title: str
    content: str
    character_count: int
    word_count: int
    created_at: datetime
    is_current: bool


class VersionHistoryResponse(BaseModel):
    """Version history"""
    versions: List[DocumentVersion]
    total: int


# --- Template Schemas ---

class DocumentTemplateResponse(BaseModel):
    """Document template"""
    id: UUID
    name: str
    description: str
    document_type: str
    content_template: str
    placeholder_instructions: dict
    recommended_character_count: Optional[int]
    recommended_word_count: Optional[int]
    category: str
    tags: List[str]
    usage_count: int

    model_config = {"from_attributes": True}


class TemplateListResponse(BaseModel):
    """List of templates"""
    templates: List[DocumentTemplateResponse]
    total: int


class CreateFromTemplate(BaseModel):
    """Create document from template"""
    template_id: UUID
    title: str
    replacements: dict = {}  # Placeholder replacements


# --- Statistics Schemas ---

class DocumentStats(BaseModel):
    """Document statistics"""
    total_documents: int
    by_status: dict
    by_type: dict
    total_characters: int
    total_words: int
    total_polish_requests: int
    avg_ats_score: Optional[float]
    total_focus_time_hours: float


# --- Character Counter Schemas ---

class CharacterCountUpdate(BaseModel):
    """Update character count"""
    content: str


class CharacterCountResponse(BaseModel):
    """Character count response"""
    character_count: int
    word_count: int
    target_character_count: Optional[int]
    min_character_count: Optional[int]
    max_character_count: Optional[int]
    is_within_limits: bool
    characters_over: Optional[int]
    characters_under: Optional[int]
    percentage_complete: Optional[float]


# --- Dossier Schemas ---

class DossierDocumentSummary(BaseModel):
    id: str
    title: str
    document_type: str
    ats_score: Optional[float]
    word_count: int
    status: str


class DossierDataResponse(BaseModel):
    documents: List[DossierDocumentSummary]
    archetype: Optional[str]
    fear_cluster: Optional[str]
    mobility_state: Optional[str]
    avg_competitiveness_score: float
    document_count: int


# --- Focus Mode Schemas ---

class FocusModeSession(BaseModel):
    """Focus mode session tracking"""
    document_id: UUID
    duration_seconds: int


class FocusModeStats(BaseModel):
    """Focus mode statistics"""
    total_sessions: int
    total_time_seconds: int
    avg_session_duration: float
    longest_session: int
    documents_with_focus_time: int
