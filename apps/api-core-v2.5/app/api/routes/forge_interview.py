"""
API Routes for Forge-Interview Integration
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, UUID4

from app.db.session import get_db
from app.core.auth import get_current_user
from app.db.models.user import User
from app.services.forge_interview_service import ForgeInterviewIntegrationService


router = APIRouter(prefix="/forge-interview", tags=["Forge-Interview Integration"])


# Schemas
class GenerateQuestionsRequest(BaseModel):
    document_id: UUID4
    num_questions: int = 5


class GenerateQuestionsResponse(BaseModel):
    questions: List[dict]
    document_title: str


class CreateInterviewFromDocRequest(BaseModel):
    document_id: UUID4
    session_type: str
    target_institution: str | None = None


class InterviewSessionResponse(BaseModel):
    id: UUID4
    source_narrative_title: str
    session_type: str
    status: str
    total_questions: int
    estimated_duration_minutes: int


class DocumentFeedbackResponse(BaseModel):
    has_feedback: bool
    sessions_count: int
    average_scores: dict | None = None
    suggestions: List[dict]
    latest_session_id: str | None = None


@router.post("/generate-questions", response_model=GenerateQuestionsResponse)
async def generate_questions_from_document(
    request: GenerateQuestionsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate contextual interview questions based on a document
    """
    service = ForgeInterviewIntegrationService(db)
    
    try:
        questions = service.generate_questions_from_document(
            document_id=request.document_id,
            user_id=current_user.id,
            num_questions=request.num_questions
        )
        
        # Get document title
        from app.db.models.document import Document
        doc = db.query(Document).filter(
            Document.id == request.document_id,
            Document.user_id == current_user.id
        ).first()
        
        return GenerateQuestionsResponse(
            questions=questions,
            document_title=doc.title if doc else "Unknown"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post("/create-interview", response_model=InterviewSessionResponse)
async def create_interview_from_document(
    request: CreateInterviewFromDocRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create an interview session linked to a document
    """
    service = ForgeInterviewIntegrationService(db)
    
    try:
        session = service.create_interview_from_document(
            document_id=request.document_id,
            user_id=current_user.id,
            session_type=request.session_type,
            target_institution=request.target_institution
        )
        
        return InterviewSessionResponse(
            id=session.id,
            source_narrative_title=session.source_narrative_title or "",
            session_type=session.session_type,
            status=session.status.value,
            total_questions=session.total_questions,
            estimated_duration_minutes=session.estimated_duration_minutes
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/document/{document_id}/feedback", response_model=DocumentFeedbackResponse)
async def get_document_interview_feedback(
    document_id: UUID4,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get aggregated interview feedback for a document
    """
    service = ForgeInterviewIntegrationService(db)
    
    try:
        feedback = service.get_interview_feedback_for_document(
            document_id=document_id,
            user_id=current_user.id
        )
        
        return DocumentFeedbackResponse(**feedback)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
