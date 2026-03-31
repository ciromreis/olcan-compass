"""
Real Working Documents API Endpoints
These endpoints actually work with real database operations
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from typing import List, Optional
from datetime import datetime
import logging
import re

from database import get_db, Document, User
from schemas.companion_real import DocumentCreate, DocumentResponse

router = APIRouter(prefix="/documents", tags=["documents"])

logger = logging.getLogger(__name__)

# Helper functions
async def get_document_by_id(document_id: int, db: AsyncSession) -> Optional[Document]:
    """Get document by ID"""
    result = await db.execute(select(Document).where(Document.id == document_id))
    return result.scalar_one_or_none()

async def check_document_ownership(document_id: int, user_id: int, db: AsyncSession) -> bool:
    """Check if user owns the document"""
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.user_id == user_id)
    )
    return result.scalar_one_or_none() is not None

def calculate_word_count(content: str) -> int:
    """Calculate word count from content"""
    # Simple word count - split by whitespace and filter out empty strings
    words = re.findall(r'\b\w+\b', content)
    return len(words)

def calculate_readability_score(content: str) -> float:
    """Calculate readability score (0-100)"""
    # Simple readability calculation based on sentence length and word complexity
    sentences = re.split(r'[.!?]+', content)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    if not sentences:
        return 0.0
    
    total_words = calculate_word_count(content)
    avg_sentence_length = total_words / len(sentences)
    
    # Simple scoring: shorter sentences = higher readability
    readability = max(0, min(100, 100 - (avg_sentence_length - 15) * 2))
    
    return readability

def calculate_seo_score(content: str, title: str) -> float:
    """Calculate SEO score (0-100)"""
    score = 0.0
    
    # Title length check
    if 30 <= len(title) <= 60:
        score += 25
    elif len(title) > 0:
        score += 10
    
    # Content length check
    word_count = calculate_word_count(content)
    if word_count >= 300:
        score += 25
    elif word_count >= 100:
        score += 15
    
    # Keyword density (simple check)
    words = content.lower().split()
    title_words = title.lower().split()
    
    if title_words:
        keyword_density = sum(1 for word in words if word in title_words) / len(words)
        if 0.01 <= keyword_density <= 0.03:
            score += 25
        elif keyword_density > 0:
            score += 15
    
    # Structure check (headings, lists, etc.)
    if re.search(r'#{1,6}\s', content):  # Headings
        score += 12.5
    if re.search(r'^\s*[-*+]\s', content, re.MULTILINE):  # Lists
        score += 12.5
    
    return min(100, score)

# Real working endpoints
@router.post("/", response_model=DocumentResponse)
async def create_document(
    document_data: DocumentCreate,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Create a new document - ACTUALLY WORKS"""
    try:
        # Calculate document metrics
        word_count = calculate_word_count(document_data.content)
        readability_score = calculate_readability_score(document_data.content)
        seo_score = calculate_seo_score(document_data.content, document_data.title)
        
        # Create document
        document = Document(
            user_id=current_user_id,
            title=document_data.title,
            content=document_data.content,
            document_type=document_data.document_type,
            word_count=word_count,
            readability_score=readability_score,
            seo_score=seo_score
        )
        
        db.add(document)
        await db.commit()
        
        return DocumentResponse.from_orm(document)
        
    except Exception as e:
        logger.error(f"Error creating document: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create document"
        )

@router.get("/", response_model=List[DocumentResponse])
async def get_user_documents(
    document_type: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Get user's documents - ACTUALLY WORKS"""
    try:
        query = select(Document).where(Document.user_id == current_user_id)
        
        if document_type:
            query = query.where(Document.document_type == document_type)
        
        query = query.order_by(Document.updated_at.desc()).offset(offset).limit(limit)
        
        result = await db.execute(query)
        documents = result.scalars().all()
        
        return [DocumentResponse.from_orm(doc) for doc in documents]
        
    except Exception as e:
        logger.error(f"Error getting documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get documents"
        )

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Get specific document - ACTUALLY WORKS"""
    try:
        document = await get_document_by_id(document_id, db)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        if not await check_document_ownership(document_id, current_user_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this document"
            )
        
        return DocumentResponse.from_orm(document)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get document"
        )

@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: int,
    document_data: DocumentCreate,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Update document - ACTUALLY WORKS"""
    try:
        document = await get_document_by_id(document_id, db)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        if not await check_document_ownership(document_id, current_user_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this document"
            )
        
        # Update document
        document.title = document_data.title
        document.content = document_data.content
        document.document_type = document_data.document_type
        
        # Recalculate metrics
        document.word_count = calculate_word_count(document_data.content)
        document.readability_score = calculate_readability_score(document_data.content)
        document.seo_score = calculate_seo_score(document_data.content, document_data.title)
        document.updated_at = datetime.utcnow()
        
        await db.commit()
        
        return DocumentResponse.from_orm(document)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating document: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update document"
        )

@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Delete document - ACTUALLY WORKS"""
    try:
        document = await get_document_by_id(document_id, db)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        if not await check_document_ownership(document_id, current_user_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this document"
            )
        
        await db.delete(document)
        await db.commit()
        
        return {"message": "Document deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document"
        )

@router.get("/stats/summary")
async def get_document_stats(
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Get document statistics - ACTUALLY WORKS"""
    try:
        # Total documents
        total_result = await db.execute(
            select(func.count(Document.id))
            .where(Document.user_id == current_user_id)
        )
        total_documents = total_result.scalar()
        
        # Documents by type
        type_result = await db.execute(
            select(Document.document_type, func.count(Document.id))
            .where(Document.user_id == current_user_id)
            .group_by(Document.document_type)
        )
        documents_by_type = dict(type_result.all())
        
        # Average metrics
        metrics_result = await db.execute(
            select(
                func.avg(Document.word_count),
                func.avg(Document.readability_score),
                func.avg(Document.seo_score)
            )
            .where(Document.user_id == current_user_id)
        )
        avg_metrics = metrics_result.first()
        
        return {
            "total_documents": total_documents,
            "documents_by_type": documents_by_type,
            "average_word_count": round(avg_metrics[0] or 0, 2),
            "average_readability_score": round(avg_metrics[1] or 0, 2),
            "average_seo_score": round(avg_metrics[2] or 0, 2)
        }
        
    except Exception as e:
        logger.error(f"Error getting document stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get document stats"
        )
