"""
Documents API

REST endpoints for document creation, editing, and AI-assisted improvements.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field

from ..core.database import get_db
from ..core.auth import get_current_user
from ..models.user import User
from ..models.document import DocumentType, DocumentStatus
from ..services.document_service import DocumentService

router = APIRouter(prefix="/documents", tags=["documents"])


# ============================================================================
# SCHEMAS
# ============================================================================

class DocumentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    document_type: DocumentType
    template_id: Optional[str] = None
    companion_id: Optional[str] = None


class DocumentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[dict] = None
    raw_text: Optional[str] = None
    style_config: Optional[dict] = None
    status: Optional[DocumentStatus] = None


class DocumentResponse(BaseModel):
    id: str
    user_id: str
    companion_id: Optional[str]
    title: str
    document_type: DocumentType
    status: DocumentStatus
    content: dict
    raw_text: Optional[str]
    template_id: Optional[str]
    style_config: Optional[dict]
    version: int
    parent_document_id: Optional[str]
    ai_suggestions_count: int
    companion_contribution_score: int
    created_at: str
    updated_at: str
    completed_at: Optional[str]

    class Config:
        from_attributes = True


class DocumentReviewResponse(BaseModel):
    id: str
    document_id: str
    companion_id: Optional[str]
    overall_score: int
    strengths: Optional[List[str]]
    improvements: Optional[List[str]]
    detailed_feedback: Optional[str]
    section_scores: Optional[dict]
    review_type: str
    is_automated: int
    created_at: str

    class Config:
        from_attributes = True


class TemplateResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    document_type: DocumentType
    structure: dict
    default_style: Optional[dict]
    is_premium: int
    difficulty_level: Optional[str]
    industry_tags: Optional[List[str]]
    usage_count: int
    rating: int

    class Config:
        from_attributes = True


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    document_data: DocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new document"""
    
    service = DocumentService(db)
    
    try:
        document = service.create_document(
            user_id=current_user.id,
            title=document_data.title,
            document_type=document_data.document_type,
            template_id=document_data.template_id,
            companion_id=document_data.companion_id
        )
        
        return DocumentResponse(
            id=document.id,
            user_id=document.user_id,
            companion_id=document.companion_id,
            title=document.title,
            document_type=document.document_type,
            status=document.status,
            content=document.content,
            raw_text=document.raw_text,
            template_id=document.template_id,
            style_config=document.style_config,
            version=document.version,
            parent_document_id=document.parent_document_id,
            ai_suggestions_count=document.ai_suggestions_count,
            companion_contribution_score=document.companion_contribution_score,
            created_at=document.created_at.isoformat(),
            updated_at=document.updated_at.isoformat(),
            completed_at=document.completed_at.isoformat() if document.completed_at else None
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/", response_model=List[DocumentResponse])
async def get_documents(
    document_type: Optional[DocumentType] = None,
    status_filter: Optional[DocumentStatus] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's documents with optional filtering"""
    
    service = DocumentService(db)
    
    documents = service.get_user_documents(
        user_id=current_user.id,
        document_type=document_type,
        status=status_filter,
        limit=limit,
        offset=offset
    )
    
    return [
        DocumentResponse(
            id=doc.id,
            user_id=doc.user_id,
            companion_id=doc.companion_id,
            title=doc.title,
            document_type=doc.document_type,
            status=doc.status,
            content=doc.content,
            raw_text=doc.raw_text,
            template_id=doc.template_id,
            style_config=doc.style_config,
            version=doc.version,
            parent_document_id=doc.parent_document_id,
            ai_suggestions_count=doc.ai_suggestions_count,
            companion_contribution_score=doc.companion_contribution_score,
            created_at=doc.created_at.isoformat(),
            updated_at=doc.updated_at.isoformat(),
            completed_at=doc.completed_at.isoformat() if doc.completed_at else None
        )
        for doc in documents
    ]


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific document"""
    
    service = DocumentService(db)
    document = service.get_document(document_id, current_user.id)
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return DocumentResponse(
        id=document.id,
        user_id=document.user_id,
        companion_id=document.companion_id,
        title=document.title,
        document_type=document.document_type,
        status=document.status,
        content=document.content,
        raw_text=document.raw_text,
        template_id=document.template_id,
        style_config=document.style_config,
        version=document.version,
        parent_document_id=document.parent_document_id,
        ai_suggestions_count=document.ai_suggestions_count,
        companion_contribution_score=document.companion_contribution_score,
        created_at=document.created_at.isoformat(),
        updated_at=document.updated_at.isoformat(),
        completed_at=document.completed_at.isoformat() if document.completed_at else None
    )


@router.patch("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: str,
    updates: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a document"""
    
    service = DocumentService(db)
    
    try:
        document = service.update_document(
            document_id=document_id,
            user_id=current_user.id,
            updates=updates.model_dump(exclude_unset=True)
        )
        
        return DocumentResponse(
            id=document.id,
            user_id=document.user_id,
            companion_id=document.companion_id,
            title=document.title,
            document_type=document.document_type,
            status=document.status,
            content=document.content,
            raw_text=document.raw_text,
            template_id=document.template_id,
            style_config=document.style_config,
            version=document.version,
            parent_document_id=document.parent_document_id,
            ai_suggestions_count=document.ai_suggestions_count,
            companion_contribution_score=document.companion_contribution_score,
            created_at=document.created_at.isoformat(),
            updated_at=document.updated_at.isoformat(),
            completed_at=document.completed_at.isoformat() if document.completed_at else None
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post("/{document_id}/version", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document_version(
    document_id: str,
    title: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new version of a document"""
    
    service = DocumentService(db)
    
    try:
        document = service.create_version(
            document_id=document_id,
            user_id=current_user.id,
            title=title
        )
        
        return DocumentResponse(
            id=document.id,
            user_id=document.user_id,
            companion_id=document.companion_id,
            title=document.title,
            document_type=document.document_type,
            status=document.status,
            content=document.content,
            raw_text=document.raw_text,
            template_id=document.template_id,
            style_config=document.style_config,
            version=document.version,
            parent_document_id=document.parent_document_id,
            ai_suggestions_count=document.ai_suggestions_count,
            companion_contribution_score=document.companion_contribution_score,
            created_at=document.created_at.isoformat(),
            updated_at=document.updated_at.isoformat(),
            completed_at=document.completed_at.isoformat() if document.completed_at else None
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a document"""
    
    service = DocumentService(db)
    
    success = service.delete_document(document_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return None


@router.post("/{document_id}/review", response_model=DocumentReviewResponse)
async def request_review(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Request AI review from companion"""
    
    service = DocumentService(db)
    
    try:
        review = service.request_companion_review(
            document_id=document_id,
            user_id=current_user.id
        )
        
        return DocumentReviewResponse(
            id=review.id,
            document_id=review.document_id,
            companion_id=review.companion_id,
            overall_score=review.overall_score,
            strengths=review.strengths,
            improvements=review.improvements,
            detailed_feedback=review.detailed_feedback,
            section_scores=review.section_scores,
            review_type=review.review_type,
            is_automated=review.is_automated,
            created_at=review.created_at.isoformat()
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/templates/", response_model=List[TemplateResponse])
async def get_templates(
    document_type: Optional[DocumentType] = None,
    is_premium: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get available document templates"""
    
    service = DocumentService(db)
    
    templates = service.get_templates(
        document_type=document_type,
        is_premium=is_premium
    )
    
    return [
        TemplateResponse(
            id=template.id,
            name=template.name,
            description=template.description,
            document_type=template.document_type,
            structure=template.structure,
            default_style=template.default_style,
            is_premium=template.is_premium,
            difficulty_level=template.difficulty_level,
            industry_tags=template.industry_tags,
            usage_count=template.usage_count,
            rating=template.rating
        )
        for template in templates
    ]
