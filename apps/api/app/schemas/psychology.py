from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel


# --- Psych Profile Schemas ---

class PsychProfileBase(BaseModel):
    risk_profile: str = "medium"
    decision_style: str = "analytical"


class PsychProfileResponse(PsychProfileBase):
    id: UUID
    user_id: UUID
    confidence_index: float
    anxiety_score: float
    discipline_score: float
    narrative_maturity_score: float
    interview_anxiety_score: float
    cultural_adaptability_score: float
    financial_resilience_score: float
    mobility_state: str
    psychological_state: str
    fear_clusters: List[str]
    strengths: List[str]
    growth_areas: List[str]
    is_active: bool
    last_assessment_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class PsychProfileUpdate(BaseModel):
    risk_profile: Optional[str] = None
    decision_style: Optional[str] = None


# --- Psych Question Schemas ---

class PsychQuestionOption(BaseModel):
    value: str
    label_en: str
    label_pt: str
    label_es: str
    score: float


class PsychQuestionResponse(BaseModel):
    id: UUID
    text_en: str
    text_pt: str
    text_es: str
    question_type: str
    category: str
    options: List[PsychQuestionOption]
    weight: float
    reverse_scored: bool
    display_order: int
    is_active: bool
    
    model_config = {"from_attributes": True}


class PsychQuestionListResponse(BaseModel):
    questions: List[PsychQuestionResponse]
    total: int


# --- Psych Answer Schemas ---

class PsychAnswerRequest(BaseModel):
    question_id: UUID
    answer_value: str
    answer_text: Optional[str] = None


class PsychAnswerResponse(BaseModel):
    id: UUID
    session_id: UUID
    question_id: UUID
    answer_value: str
    answer_text: Optional[str]
    computed_score: Optional[float]
    created_at: datetime
    
    model_config = {"from_attributes": True}


# --- Psych Assessment Session Schemas ---

class PsychSessionStartResponse(BaseModel):
    session_id: UUID
    total_questions: int
    current_question_index: int
    started_at: datetime


class PsychSessionProgressResponse(BaseModel):
    session_id: UUID
    status: str
    current_question_index: int
    total_questions: int
    started_at: datetime
    completed_at: Optional[datetime]


class PsychSessionCompleteResponse(BaseModel):
    session_id: UUID
    status: str
    completed_at: datetime
    scores: dict


# --- Psych Score History Schemas ---

class PsychScoreHistoryResponse(BaseModel):
    id: UUID
    user_id: UUID
    confidence_index: float
    anxiety_score: float
    discipline_score: float
    risk_profile: str
    assessment_type: str
    trigger_event: Optional[str]
    created_at: datetime
    
    model_config = {"from_attributes": True}


class PsychScoreHistoryListResponse(BaseModel):
    history: List[PsychScoreHistoryResponse]
    total: int


# --- Assessment Schemas ---

class StartAssessmentRequest(BaseModel):
    assessment_type: str = "onboarding"


class SubmitAnswerRequest(BaseModel):
    session_id: UUID
    question_id: UUID
    answer_value: str
    answer_text: Optional[str] = None


class AssessmentSummaryResponse(BaseModel):
    confidence_index: float
    anxiety_score: float
    discipline_score: float
    risk_profile: str
    mobility_state: str
    psychological_state: str
    fear_clusters: List[str]
    strengths: List[str]
    growth_areas: List[str]
