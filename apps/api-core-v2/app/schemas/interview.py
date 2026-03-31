"""Interview Intelligence Engine Schemas"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict


class InterviewQuestionType(str, Enum):
    MOTIVATION = "motivation"
    BACKGROUND = "background"
    CHALLENGE = "challenge"
    GOALS = "goals"
    CULTURAL_FIT = "cultural_fit"
    TECHNICAL = "technical"
    SCENARIO = "scenario"
    QUESTION_FOR_PANEL = "question_for_panel"


class InterviewSessionStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class InterviewAnswerStatus(str, Enum):
    PENDING = "pending"
    RECORDED = "recorded"
    ANALYZED = "analyzed"


# === INTERVIEW QUESTION SCHEMAS ===

class InterviewQuestionBase(BaseModel):
    question_text_en: str
    question_text_pt: str
    question_text_es: str
    question_type: InterviewQuestionType
    route_types: List[str] = []
    difficulty: str = "medium"
    what_assessors_look_for: dict = {}
    common_mistakes: List[str] = []


class InterviewQuestionCreate(InterviewQuestionBase):
    pass


class InterviewQuestionUpdate(BaseModel):
    question_text_en: Optional[str] = None
    question_text_pt: Optional[str] = None
    question_text_es: Optional[str] = None
    question_type: Optional[InterviewQuestionType] = None
    route_types: Optional[List[str]] = None
    difficulty: Optional[str] = None
    is_active: Optional[bool] = None


class InterviewQuestionResponse(InterviewQuestionBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    is_active: bool
    display_order: int
    version: int
    created_at: datetime
    updated_at: datetime


class InterviewQuestionListResponse(BaseModel):
    items: List[InterviewQuestionResponse]
    total: int


# === INTERVIEW SESSION SCHEMAS ===

class InterviewSessionCreate(BaseModel):
    session_type: str = Field(..., max_length=50)
    route_id: Optional[UUID] = None
    source_narrative_id: Optional[UUID] = None
    source_narrative_title: Optional[str] = Field(None, max_length=200)
    target_institution: Optional[str] = Field(None, max_length=200)
    estimated_duration_minutes: int = Field(30, ge=5, le=120)


class InterviewSessionStartRequest(BaseModel):
    """Select questions and start the session"""
    question_count: int = Field(5, ge=1, le=20)
    focus_types: Optional[List[InterviewQuestionType]] = None


class InterviewSessionUpdate(BaseModel):
    status: Optional[InterviewSessionStatus] = None
    target_institution: Optional[str] = None


class InterviewSessionListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    session_type: str
    route_id: Optional[UUID]
    source_narrative_id: Optional[UUID]
    source_narrative_title: Optional[str]
    target_institution: Optional[str]
    status: InterviewSessionStatus
    total_questions: int
    current_question_index: int
    
    # Summary scores
    overall_score: Optional[float]
    clarity_score: Optional[float]
    confidence_score: Optional[float]
    
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]


class InterviewSessionDetailResponse(InterviewSessionListItem):
    model_config = ConfigDict(from_attributes=True)
    
    estimated_duration_minutes: int
    relevance_score: Optional[float]
    ai_summary: Optional[str]
    top_strengths: List[str]
    improvement_areas: List[str]
    
    # Related data
    current_question: Optional[InterviewQuestionResponse] = None
    answers: List["InterviewAnswerResponse"] = []


class InterviewSessionListResponse(BaseModel):
    items: List[InterviewSessionListItem]
    total: int
    page: int
    page_size: int


# === INTERVIEW ANSWER SCHEMAS ===

class InterviewAnswerSubmitRequest(BaseModel):
    transcript: Optional[str] = None
    audio_url: Optional[str] = None
    video_url: Optional[str] = None
    duration_seconds: Optional[int] = None


class InterviewAnswerAnalyzeRequest(BaseModel):
    """Request AI analysis of a recorded answer"""
    ai_model: Optional[str] = "gpt-4"


class InterviewAnswerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    session_id: UUID
    question_id: UUID
    
    # Content
    transcript: Optional[str]
    audio_url: Optional[str]
    video_url: Optional[str]
    duration_seconds: Optional[int]
    word_count: Optional[int]
    
    # Status
    status: InterviewAnswerStatus
    
    # Scores (populated after analysis)
    clarity_score: Optional[float]
    confidence_score: Optional[float]
    relevance_score: Optional[float]
    structure_score: Optional[float]
    overall_score: Optional[float]
    
    # Feedback
    content_feedback: Optional[str]
    delivery_feedback: Optional[str]
    improvement_suggestions: List[str]
    key_strengths: List[str]
    
    created_at: datetime
    analyzed_at: Optional[datetime]
    
    # Related question data
    question: Optional[InterviewQuestionResponse] = None


class InterviewAnswerListResponse(BaseModel):
    items: List[InterviewAnswerResponse]
    total: int


# === FEEDBACK TEMPLATE SCHEMAS ===

class InterviewFeedbackTemplateBase(BaseModel):
    feedback_type: str
    question_types: List[str] = []
    title_en: str
    title_pt: str
    title_es: str
    description_en: str
    description_pt: str
    description_es: str
    suggestions_en: List[str] = []
    suggestions_pt: List[str] = []
    suggestions_es: List[str] = []
    trigger_score_range: dict = {}
    trigger_keywords: List[str] = []
    priority: int = 0


class InterviewFeedbackTemplateCreate(InterviewFeedbackTemplateBase):
    pass


class InterviewFeedbackTemplateResponse(InterviewFeedbackTemplateBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    is_active: bool
    created_at: datetime


class InterviewFeedbackTemplateListResponse(BaseModel):
    items: List[InterviewFeedbackTemplateResponse]
    total: int


# === PROGRESS & STATS ===

class InterviewProgressStats(BaseModel):
    total_sessions: int
    completed_sessions: int
    average_overall_score: Optional[float]
    average_clarity_score: Optional[float]
    average_confidence_score: Optional[float]
    
    # By question type
    scores_by_type: dict = {}  # { "motivation": 75.5, "background": 82.0, ... }
    
    # Trends
    recent_sessions: List[InterviewSessionListItem] = []


class InterviewQuestionSelectResponse(BaseModel):
    """Selected questions for a session"""
    id: UUID  # same as session_id, needed by frontend
    session_id: UUID
    questions: List[InterviewQuestionResponse]
    total_questions: int
    estimated_duration_minutes: int
