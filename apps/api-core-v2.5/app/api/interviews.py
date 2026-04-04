"""
Interviews API

REST endpoints for interview practice sessions with AI feedback.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field

from ..core.database import get_db
from ..core.auth import get_current_user
from ..models.user import User
from ..models.interview import InterviewType, InterviewDifficulty, InterviewStatus
from ..services.interview_service import InterviewService

router = APIRouter(prefix="/interviews", tags=["interviews"])


# ============================================================================
# SCHEMAS
# ============================================================================

class InterviewCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    interview_type: InterviewType
    difficulty: InterviewDifficulty = InterviewDifficulty.INTERMEDIATE
    template_id: Optional[str] = None
    companion_id: Optional[str] = None
    target_company: Optional[str] = None
    target_role: Optional[str] = None


class ResponseSubmit(BaseModel):
    question_id: str
    response_text: str = Field(..., min_length=1)
    response_metadata: Optional[dict] = None


class InterviewResponse(BaseModel):
    id: str
    user_id: str
    companion_id: Optional[str]
    title: str
    interview_type: InterviewType
    difficulty: InterviewDifficulty
    status: InterviewStatus
    target_company: Optional[str]
    target_role: Optional[str]
    questions: List[dict]
    responses: Optional[List[dict]]
    overall_score: Optional[int]
    feedback_summary: Optional[str]
    strengths: Optional[List[str]]
    areas_for_improvement: Optional[List[str]]
    duration_minutes: Optional[int]
    questions_answered: int
    confidence_score: Optional[float]
    communication_score: Optional[float]
    technical_accuracy_score: Optional[float]
    created_at: str
    started_at: Optional[str]
    completed_at: Optional[str]

    class Config:
        from_attributes = True


class TemplateResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    interview_type: InterviewType
    difficulty: InterviewDifficulty
    question_ids: List[str]
    estimated_duration_minutes: int
    is_premium: int
    industry_tags: Optional[List[str]]
    usage_count: int

    class Config:
        from_attributes = True


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
async def create_interview(
    interview_data: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new interview practice session"""
    
    service = InterviewService(db)
    
    try:
        interview = service.create_interview(
            user_id=current_user.id,
            title=interview_data.title,
            interview_type=interview_data.interview_type,
            difficulty=interview_data.difficulty,
            template_id=interview_data.template_id,
            companion_id=interview_data.companion_id,
            target_company=interview_data.target_company,
            target_role=interview_data.target_role
        )
        
        return InterviewResponse(
            id=interview.id,
            user_id=interview.user_id,
            companion_id=interview.companion_id,
            title=interview.title,
            interview_type=interview.interview_type,
            difficulty=interview.difficulty,
            status=interview.status,
            target_company=interview.target_company,
            target_role=interview.target_role,
            questions=interview.questions,
            responses=interview.responses,
            overall_score=interview.overall_score,
            feedback_summary=interview.feedback_summary,
            strengths=interview.strengths,
            areas_for_improvement=interview.areas_for_improvement,
            duration_minutes=interview.duration_minutes,
            questions_answered=interview.questions_answered,
            confidence_score=interview.confidence_score,
            communication_score=interview.communication_score,
            technical_accuracy_score=interview.technical_accuracy_score,
            created_at=interview.created_at.isoformat(),
            started_at=interview.started_at.isoformat() if interview.started_at else None,
            completed_at=interview.completed_at.isoformat() if interview.completed_at else None
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/", response_model=List[InterviewResponse])
async def get_interviews(
    interview_type: Optional[InterviewType] = None,
    status_filter: Optional[InterviewStatus] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's interview sessions"""
    
    service = InterviewService(db)
    
    interviews = service.get_user_interviews(
        user_id=current_user.id,
        interview_type=interview_type,
        status=status_filter,
        limit=limit,
        offset=offset
    )
    
    return [
        InterviewResponse(
            id=interview.id,
            user_id=interview.user_id,
            companion_id=interview.companion_id,
            title=interview.title,
            interview_type=interview.interview_type,
            difficulty=interview.difficulty,
            status=interview.status,
            target_company=interview.target_company,
            target_role=interview.target_role,
            questions=interview.questions,
            responses=interview.responses,
            overall_score=interview.overall_score,
            feedback_summary=interview.feedback_summary,
            strengths=interview.strengths,
            areas_for_improvement=interview.areas_for_improvement,
            duration_minutes=interview.duration_minutes,
            questions_answered=interview.questions_answered,
            confidence_score=interview.confidence_score,
            communication_score=interview.communication_score,
            technical_accuracy_score=interview.technical_accuracy_score,
            created_at=interview.created_at.isoformat(),
            started_at=interview.started_at.isoformat() if interview.started_at else None,
            completed_at=interview.completed_at.isoformat() if interview.completed_at else None
        )
        for interview in interviews
    ]


@router.get("/{interview_id}", response_model=InterviewResponse)
async def get_interview(
    interview_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific interview"""
    
    service = InterviewService(db)
    interview = service.get_interview(interview_id, current_user.id)
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    return InterviewResponse(
        id=interview.id,
        user_id=interview.user_id,
        companion_id=interview.companion_id,
        title=interview.title,
        interview_type=interview.interview_type,
        difficulty=interview.difficulty,
        status=interview.status,
        target_company=interview.target_company,
        target_role=interview.target_role,
        questions=interview.questions,
        responses=interview.responses,
        overall_score=interview.overall_score,
        feedback_summary=interview.feedback_summary,
        strengths=interview.strengths,
        areas_for_improvement=interview.areas_for_improvement,
        duration_minutes=interview.duration_minutes,
        questions_answered=interview.questions_answered,
        confidence_score=interview.confidence_score,
        communication_score=interview.communication_score,
        technical_accuracy_score=interview.technical_accuracy_score,
        created_at=interview.created_at.isoformat(),
        started_at=interview.started_at.isoformat() if interview.started_at else None,
        completed_at=interview.completed_at.isoformat() if interview.completed_at else None
    )


@router.post("/{interview_id}/start", response_model=InterviewResponse)
async def start_interview(
    interview_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start an interview session"""
    
    service = InterviewService(db)
    
    try:
        interview = service.start_interview(interview_id, current_user.id)
        
        return InterviewResponse(
            id=interview.id,
            user_id=interview.user_id,
            companion_id=interview.companion_id,
            title=interview.title,
            interview_type=interview.interview_type,
            difficulty=interview.difficulty,
            status=interview.status,
            target_company=interview.target_company,
            target_role=interview.target_role,
            questions=interview.questions,
            responses=interview.responses,
            overall_score=interview.overall_score,
            feedback_summary=interview.feedback_summary,
            strengths=interview.strengths,
            areas_for_improvement=interview.areas_for_improvement,
            duration_minutes=interview.duration_minutes,
            questions_answered=interview.questions_answered,
            confidence_score=interview.confidence_score,
            communication_score=interview.communication_score,
            technical_accuracy_score=interview.technical_accuracy_score,
            created_at=interview.created_at.isoformat(),
            started_at=interview.started_at.isoformat() if interview.started_at else None,
            completed_at=interview.completed_at.isoformat() if interview.completed_at else None
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/{interview_id}/respond", response_model=InterviewResponse)
async def submit_response(
    interview_id: str,
    response_data: ResponseSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a response to an interview question"""
    
    service = InterviewService(db)
    
    try:
        interview = service.submit_response(
            interview_id=interview_id,
            user_id=current_user.id,
            question_id=response_data.question_id,
            response_text=response_data.response_text,
            response_metadata=response_data.response_metadata
        )
        
        return InterviewResponse(
            id=interview.id,
            user_id=interview.user_id,
            companion_id=interview.companion_id,
            title=interview.title,
            interview_type=interview.interview_type,
            difficulty=interview.difficulty,
            status=interview.status,
            target_company=interview.target_company,
            target_role=interview.target_role,
            questions=interview.questions,
            responses=interview.responses,
            overall_score=interview.overall_score,
            feedback_summary=interview.feedback_summary,
            strengths=interview.strengths,
            areas_for_improvement=interview.areas_for_improvement,
            duration_minutes=interview.duration_minutes,
            questions_answered=interview.questions_answered,
            confidence_score=interview.confidence_score,
            communication_score=interview.communication_score,
            technical_accuracy_score=interview.technical_accuracy_score,
            created_at=interview.created_at.isoformat(),
            started_at=interview.started_at.isoformat() if interview.started_at else None,
            completed_at=interview.completed_at.isoformat() if interview.completed_at else None
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/{interview_id}/complete", response_model=InterviewResponse)
async def complete_interview(
    interview_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Complete interview and get AI feedback"""
    
    service = InterviewService(db)
    
    try:
        interview = service.complete_interview(interview_id, current_user.id)
        
        return InterviewResponse(
            id=interview.id,
            user_id=interview.user_id,
            companion_id=interview.companion_id,
            title=interview.title,
            interview_type=interview.interview_type,
            difficulty=interview.difficulty,
            status=interview.status,
            target_company=interview.target_company,
            target_role=interview.target_role,
            questions=interview.questions,
            responses=interview.responses,
            overall_score=interview.overall_score,
            feedback_summary=interview.feedback_summary,
            strengths=interview.strengths,
            areas_for_improvement=interview.areas_for_improvement,
            duration_minutes=interview.duration_minutes,
            questions_answered=interview.questions_answered,
            confidence_score=interview.confidence_score,
            communication_score=interview.communication_score,
            technical_accuracy_score=interview.technical_accuracy_score,
            created_at=interview.created_at.isoformat(),
            started_at=interview.started_at.isoformat() if interview.started_at else None,
            completed_at=interview.completed_at.isoformat() if interview.completed_at else None
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/templates/", response_model=List[TemplateResponse])
async def get_templates(
    interview_type: Optional[InterviewType] = None,
    difficulty: Optional[InterviewDifficulty] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get available interview templates"""
    
    service = InterviewService(db)
    
    templates = service.get_templates(
        interview_type=interview_type,
        difficulty=difficulty
    )
    
    return [
        TemplateResponse(
            id=template.id,
            name=template.name,
            description=template.description,
            interview_type=template.interview_type,
            difficulty=template.difficulty,
            question_ids=template.question_ids,
            estimated_duration_minutes=template.estimated_duration_minutes,
            is_premium=template.is_premium,
            industry_tags=template.industry_tags,
            usage_count=template.usage_count
        )
        for template in templates
    ]
