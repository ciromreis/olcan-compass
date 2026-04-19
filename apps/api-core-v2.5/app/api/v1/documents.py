"""
Document API endpoints for Narrative Forge
"""

from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models import User
from app.db.models.document import Document, PolishRequest, DocumentTemplate, DocumentStatus, PolishStatus
from app.db.models.narrative import Narrative
from app.core.ai_engines import NarrativeAnalysisEngine
from app.schemas.document import (
    DocumentCreate, DocumentUpdate, DocumentResponse, DocumentListResponse,
    DocumentSummary, PolishRequest as PolishRequestSchema, PolishResponse,
    PolishFeedback, ATSAnalysisRequest, ATSAnalysisResponse,
    VersionHistoryResponse, DocumentVersion, DocumentTemplateResponse,
    TemplateListResponse, CreateFromTemplate, DocumentStats,
    CharacterCountUpdate, CharacterCountResponse, FocusModeSession, FocusModeStats,
    AnalysisResponse, DossierDataResponse, DossierDocumentSummary
)
from app.db.models.psychology import PsychProfile

router = APIRouter(prefix="/documents", tags=["documents"])


# --- Document CRUD ---

@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    request: DocumentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new document"""
    # Calculate initial counts
    char_count = len(request.content)
    word_count = len(request.content.split())
    
    document = Document(
        user_id=current_user.id,
        title=request.title,
        document_type=request.document_type,
        content=request.content,
        target_character_count=request.target_character_count,
        min_character_count=request.min_character_count,
        max_character_count=request.max_character_count,
        target_word_count=request.target_word_count,
        current_character_count=char_count,
        current_word_count=word_count,
        tags=request.tags,
        notes=request.notes,
        route_id=request.route_id,
        scope=request.scope or "universal",
        last_edited_at=datetime.now(timezone.utc)
    )
    
    db.add(document)
    await db.commit()
    await db.refresh(document)
    
    return document


@router.get("", response_model=DocumentListResponse)
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    document_type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None
):
    """List user documents"""
    query = select(Document).where(
        Document.user_id == current_user.id,
        Document.is_latest_version == True
    )
    
    if document_type:
        query = query.where(Document.document_type == document_type)
    
    if status:
        query = query.where(Document.status == status)
    
    if search:
        query = query.where(Document.title.ilike(f"%{search}%"))
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Get documents
    query = query.order_by(desc(Document.updated_at)).offset(skip).limit(limit)
    result = await db.execute(query)
    documents = result.scalars().all()
    
    return DocumentListResponse(documents=documents, total=total)


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get document by ID"""
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == current_user.id
        )
    )
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return document


@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: UUID,
    request: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update document"""
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == current_user.id
        )
    )
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Update fields
    if request.title is not None:
        document.title = request.title
    
    if request.content is not None:
        document.content = request.content
        document.current_character_count = len(request.content)
        document.current_word_count = len(request.content.split())
        document.last_edited_at = datetime.now(timezone.utc)
    
    if request.status is not None:
        document.status = request.status
    
    if request.target_character_count is not None:
        document.target_character_count = request.target_character_count
    
    if request.min_character_count is not None:
        document.min_character_count = request.min_character_count
    
    if request.max_character_count is not None:
        document.max_character_count = request.max_character_count
    
    if request.target_word_count is not None:
        document.target_word_count = request.target_word_count
    
    if request.tags is not None:
        document.tags = request.tags
    
    if request.notes is not None:
        document.notes = request.notes

    if request.route_id is not None:
        document.route_id = request.route_id

    if request.scope is not None:
        document.scope = request.scope

    document.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(document)
    
    return document


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete document"""
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == current_user.id
        )
    )
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    await db.delete(document)
    await db.commit()


# --- AI Polish ---

@router.post("/{document_id}/analyze", response_model=AnalysisResponse, status_code=status.HTTP_200_OK)
async def analyze_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Request AI analysis for document"""
    # Get document
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == current_user.id
        )
    )
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Initialize engine
    engine = NarrativeAnalysisEngine(db)
    
    # We pass the document.content via a mock Narrative wrapper, since analyze_narrative expects a Narrative object
    narrative_mock = Narrative(
        id=document.id,
        content=document.content,
        narrative_type=document.document_type
    )
    
    analysis_result = await engine.analyze_narrative(narrative_mock, current_user, document.document_type)
    
    return analysis_result


@router.post("/{document_id}/polish", response_model=PolishResponse, status_code=status.HTTP_201_CREATED)
async def polish_document(
    document_id: UUID,
    request: PolishRequestSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Request AI polish for document"""
    # Get document
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == current_user.id
        )
    )
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Create polish request
    polish_request = PolishRequest(
        document_id=document_id,
        user_id=current_user.id,
        original_content=document.content,
        instructions=request.instructions,
        status=PolishStatus.PENDING
    )
    
    db.add(polish_request)
    await db.commit()
    await db.refresh(polish_request)
    
    # TODO: Trigger async AI processing
    # For now, return pending status
    # In production, this would queue a background job
    
    return polish_request


@router.get("/{document_id}/polish", response_model=List[PolishResponse])
async def get_polish_history(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get polish history for document"""
    result = await db.execute(
        select(PolishRequest).where(
            PolishRequest.document_id == document_id,
            PolishRequest.user_id == current_user.id
        ).order_by(desc(PolishRequest.created_at))
    )
    polish_requests = result.scalars().all()
    
    return polish_requests


@router.put("/{document_id}/polish/{polish_id}/feedback")
async def submit_polish_feedback(
    document_id: UUID,
    polish_id: UUID,
    feedback: PolishFeedback,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Submit feedback on polish"""
    result = await db.execute(
        select(PolishRequest).where(
            PolishRequest.id == polish_id,
            PolishRequest.document_id == document_id,
            PolishRequest.user_id == current_user.id
        )
    )
    polish_request = result.scalar_one_or_none()
    
    if not polish_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Polish request not found"
        )
    
    polish_request.user_accepted = feedback.accepted
    polish_request.user_rating = feedback.rating
    polish_request.user_feedback = feedback.feedback
    
    await db.commit()
    
    return {"message": "Feedback submitted"}


# --- Character Counter ---

@router.post("/{document_id}/count", response_model=CharacterCountResponse)
async def update_character_count(
    document_id: UUID,
    request: CharacterCountUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update and get character count"""
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == current_user.id
        )
    )
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    char_count = len(request.content)
    word_count = len(request.content.split())
    
    # Calculate status
    is_within_limits = True
    characters_over = None
    characters_under = None
    percentage_complete = None
    
    if document.max_character_count:
        if char_count > document.max_character_count:
            is_within_limits = False
            characters_over = char_count - document.max_character_count
    
    if document.min_character_count:
        if char_count < document.min_character_count:
            is_within_limits = False
            characters_under = document.min_character_count - char_count
    
    if document.target_character_count:
        percentage_complete = (char_count / document.target_character_count) * 100
    
    return CharacterCountResponse(
        character_count=char_count,
        word_count=word_count,
        target_character_count=document.target_character_count,
        min_character_count=document.min_character_count,
        max_character_count=document.max_character_count,
        is_within_limits=is_within_limits,
        characters_over=characters_over,
        characters_under=characters_under,
        percentage_complete=percentage_complete
    )


# --- Version History ---

@router.get("/{document_id}/versions", response_model=VersionHistoryResponse)
async def get_version_history(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get version history for document"""
    # Get all versions
    result = await db.execute(
        select(Document).where(
            Document.user_id == current_user.id
        ).where(
            (Document.id == document_id) | (Document.parent_version_id == document_id)
        ).order_by(desc(Document.version))
    )
    versions = result.scalars().all()
    
    if not versions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    version_list = [
        DocumentVersion(
            id=v.id,
            version=v.version,
            title=v.title,
            content=v.content,
            character_count=v.current_character_count,
            word_count=v.current_word_count,
            created_at=v.created_at,
            is_current=v.is_latest_version
        )
        for v in versions
    ]
    
    return VersionHistoryResponse(versions=version_list, total=len(version_list))


# --- Focus Mode ---

@router.post("/{document_id}/focus", status_code=status.HTTP_200_OK)
async def track_focus_session(
    document_id: UUID,
    session: FocusModeSession,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Track focus mode session"""
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == current_user.id
        )
    )
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    document.focus_mode_time_seconds += session.duration_seconds
    await db.commit()
    
    return {"message": "Focus session tracked"}


@router.get("/stats/focus", response_model=FocusModeStats)
async def get_focus_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get focus mode statistics"""
    result = await db.execute(
        select(
            func.count(Document.id).label('total_docs'),
            func.sum(Document.focus_mode_time_seconds).label('total_time'),
            func.avg(Document.focus_mode_time_seconds).label('avg_time'),
            func.max(Document.focus_mode_time_seconds).label('max_time')
        ).where(
            Document.user_id == current_user.id,
            Document.focus_mode_time_seconds > 0
        )
    )
    stats = result.first()
    
    return FocusModeStats(
        total_sessions=stats.total_docs or 0,
        total_time_seconds=stats.total_time or 0,
        avg_session_duration=stats.avg_time or 0,
        longest_session=stats.max_time or 0,
        documents_with_focus_time=stats.total_docs or 0
    )


# --- Statistics ---

@router.get("/stats", response_model=DocumentStats)
async def get_document_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get document statistics"""
    # Total documents
    total_result = await db.execute(
        select(func.count(Document.id)).where(
            Document.user_id == current_user.id,
            Document.is_latest_version == True
        )
    )
    total_documents = total_result.scalar()
    
    # By status
    status_result = await db.execute(
        select(Document.status, func.count(Document.id)).where(
            Document.user_id == current_user.id,
            Document.is_latest_version == True
        ).group_by(Document.status)
    )
    by_status = {row[0]: row[1] for row in status_result}
    
    # By type
    type_result = await db.execute(
        select(Document.document_type, func.count(Document.id)).where(
            Document.user_id == current_user.id,
            Document.is_latest_version == True
        ).group_by(Document.document_type)
    )
    by_type = {row[0]: row[1] for row in type_result}
    
    # Totals
    totals_result = await db.execute(
        select(
            func.sum(Document.current_character_count),
            func.sum(Document.current_word_count),
            func.sum(Document.polish_count),
            func.avg(Document.ats_score),
            func.sum(Document.focus_mode_time_seconds)
        ).where(
            Document.user_id == current_user.id,
            Document.is_latest_version == True
        )
    )
    totals = totals_result.first()
    
    return DocumentStats(
        total_documents=total_documents,
        by_status=by_status,
        by_type=by_type,
        total_characters=totals[0] or 0,
        total_words=totals[1] or 0,
        total_polish_requests=totals[2] or 0,
        avg_ats_score=totals[3],
        total_focus_time_hours=(totals[4] or 0) / 3600
    )


# --- Templates ---

@router.get("/templates", response_model=TemplateListResponse)
async def list_templates(
    db: AsyncSession = Depends(get_db),
    category: Optional[str] = None
):
    """List document templates"""
    query = select(DocumentTemplate).where(DocumentTemplate.is_active == True)
    
    if category:
        query = query.where(DocumentTemplate.category == category)
    
    query = query.order_by(DocumentTemplate.usage_count.desc())
    
    result = await db.execute(query)
    templates = result.scalars().all()
    
    return TemplateListResponse(templates=templates, total=len(templates))


@router.post("/{document_id}/ats-analyze", response_model=ATSAnalysisResponse)
async def ats_analyze_document(
    document_id: UUID,
    request: ATSAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """ATS keyword analysis: match resume content against job description, persist score"""
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == current_user.id
        )
    )
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    content_lower = document.content.lower()
    job_desc_lower = (request.job_description or "").lower()

    # Build keyword set: user-provided + extracted from job description
    _STOPWORDS = {
        "with", "that", "this", "from", "have", "will", "been", "your", "they",
        "their", "about", "which", "when", "what", "where", "into", "also", "more",
        "some", "than", "then", "each", "both", "only", "over", "such", "like",
        "most", "very", "just", "also", "other", "would", "could", "should",
    }
    all_keywords: set[str] = set(kw.lower() for kw in request.target_keywords)
    if job_desc_lower:
        extracted = [
            w.strip(".,;:!?()[]\"'").lower()
            for w in job_desc_lower.split()
            if len(w) > 4
        ]
        all_keywords.update(w for w in extracted if w not in _STOPWORDS)

    # Match keywords against document content
    keywords_found = sorted(kw for kw in all_keywords if kw in content_lower)
    keywords_missing = sorted(kw for kw in all_keywords if kw not in content_lower)

    total = len(all_keywords) if all_keywords else 1
    score = round(len(keywords_found) / total * 100, 1)

    # Keyword density per found keyword
    word_list = content_lower.split()
    keyword_density: dict[str, float] = {
        kw: round(content_lower.count(kw) / max(1, len(word_list)) * 100, 2)
        for kw in keywords_found
    }

    # Readability: penalise long sentences
    sentences = [s.strip() for s in document.content.split(".") if s.strip()]
    avg_sent_len = sum(len(s.split()) for s in sentences) / max(1, len(sentences))
    readability_score = round(max(0.0, min(100.0, 100.0 - (avg_sent_len - 15) * 2)), 1)

    # Structure score: presence of standard resume sections
    _STRUCTURE_MARKERS = ["experience", "education", "skills", "summary", "objective", "profile"]
    structure_found = sum(1 for m in _STRUCTURE_MARKERS if m in content_lower)
    structure_score = round(structure_found / len(_STRUCTURE_MARKERS) * 100, 1)

    # Actionable suggestions
    suggestions: list[dict] = []
    if keywords_missing:
        sample = ", ".join(list(keywords_missing)[:6])
        suggestions.append({"type": "keywords", "message": f"Adicione estas palavras-chave ao documento: {sample}"})
    if readability_score < 60:
        suggestions.append({"type": "readability", "message": "Reduza o tamanho médio das frases para melhorar a legibilidade ATS."})
    if structure_score < 50:
        suggestions.append({"type": "structure", "message": "Adicione seções claras (Experiência, Formação, Habilidades) para melhor varredura ATS."})
    if score >= 80:
        suggestions.append({"type": "strength", "message": "Excelente cobertura de palavras-chave. Seu documento está bem otimizado."})

    # Persist ATS result back to document record
    document.ats_score = score
    document.ats_keywords = keywords_found[:50]  # cap stored list
    document.ats_suggestions = [s["message"] for s in suggestions]
    document.updated_at = datetime.now(timezone.utc)
    await db.commit()

    return ATSAnalysisResponse(
        score=score,
        keywords_found=keywords_found,
        keywords_missing=keywords_missing,
        suggestions=suggestions,
        readability_score=readability_score,
        structure_score=structure_score,
        keyword_density=keyword_density,
    )


@router.get("/dossier", response_model=DossierDataResponse)
async def get_dossier_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Assemble dossier data from real backend records (top docs + psych profile)"""
    # Top 6 documents ordered by ATS score then recency
    doc_result = await db.execute(
        select(Document).where(
            Document.user_id == current_user.id,
            Document.is_latest_version == True
        ).order_by(
            desc(Document.ats_score.is_(None)),  # nulls last
            desc(Document.ats_score),
            desc(Document.updated_at)
        ).limit(6)
    )
    documents = doc_result.scalars().all()

    # Psych profile (nullable — user may not have completed diagnostic)
    profile_result = await db.execute(
        select(PsychProfile).where(PsychProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()

    scored = [d.ats_score for d in documents if d.ats_score is not None]
    avg_score = round(sum(scored) / len(scored), 1) if scored else 0.0

    return DossierDataResponse(
        documents=[
            DossierDocumentSummary(
                id=str(d.id),
                title=d.title,
                document_type=str(d.document_type.value) if hasattr(d.document_type, "value") else str(d.document_type),
                ats_score=d.ats_score,
                word_count=d.current_word_count,
                status=str(d.status.value) if hasattr(d.status, "value") else str(d.status),
            )
            for d in documents
        ],
        archetype=str(profile.dominant_archetype.value) if profile and profile.dominant_archetype and hasattr(profile.dominant_archetype, "value") else (str(profile.dominant_archetype) if profile and profile.dominant_archetype else None),
        fear_cluster=str(profile.primary_fear_cluster.value) if profile and profile.primary_fear_cluster and hasattr(profile.primary_fear_cluster, "value") else (str(profile.primary_fear_cluster) if profile and profile.primary_fear_cluster else None),
        mobility_state=profile.mobility_state if profile else None,
        avg_competitiveness_score=avg_score,
        document_count=len(documents),
    )


@router.post("/from-template", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_from_template(
    request: CreateFromTemplate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create document from template"""
    # Get template
    result = await db.execute(
        select(DocumentTemplate).where(DocumentTemplate.id == request.template_id)
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Apply replacements
    content = template.content_template
    for key, value in request.replacements.items():
        content = content.replace(f"{{{key}}}", value)
    
    # Create document
    document = Document(
        user_id=current_user.id,
        title=request.title,
        document_type=template.document_type,
        content=content,
        current_character_count=len(content),
        current_word_count=len(content.split()),
        target_character_count=template.recommended_character_count,
        target_word_count=template.recommended_word_count,
        tags=template.tags,
        last_edited_at=datetime.now(timezone.utc)
    )
    
    db.add(document)
    
    # Update template usage
    template.usage_count += 1
    
    await db.commit()
    await db.refresh(document)
    
    return document
