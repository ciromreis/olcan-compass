"""Narrative Intelligence Engine API Routes"""

from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models import (
    User,
    Narrative,
    NarrativeVersion,
    NarrativeAnalysis,
    NarrativeInterviewLoopInsight,
    NarrativeType,
    NarrativeStatus,
    InterviewSession,
    InterviewAnswer,
)
from app.schemas.narrative import (
    NarrativeCreate,
    NarrativeUpdate,
    NarrativeContentUpdate,
    NarrativeDetailResponse,
    NarrativeListResponse,
    NarrativeListItem,
    NarrativeVersionCreate,
    NarrativeVersionResponse,
    NarrativeAnalysisResponse,
    NarrativeInterviewLoopInsightResponse,
    NarrativeAnalysisListResponse,
    AnalyzeRequest,
)

router = APIRouter(prefix="/narratives", tags=["Narrative Intelligence"])


def _extract_terms(*values: Optional[str]) -> list[str]:
    stopwords = {
        "para", "como", "sobre", "entre", "program", "programa", "letter", "carta",
        "statement", "personal", "research", "proposal", "curriculo", "currículo",
        "documento", "the", "with", "that", "this", "your",
    }
    terms: list[str] = []
    for value in values:
        if not value:
            continue
        for raw in value.lower().replace("\n", " ").split():
            cleaned = "".join(ch for ch in raw if ch.isalnum() or ch in "-_")
            if len(cleaned) >= 5 and cleaned not in stopwords and cleaned not in terms:
                terms.append(cleaned)
    return terms[:6]


def _average(values: list[float]) -> Optional[float]:
    if not values:
        return None
    return round(sum(values) / len(values), 2)


async def _refresh_interview_loop_insight(
    narrative: Narrative,
    current_user: User,
    db: AsyncSession,
) -> Optional[NarrativeInterviewLoopInsight]:
    filters = [InterviewSession.source_narrative_id == narrative.id]
    if narrative.route_id is not None:
        filters.append(InterviewSession.route_id == narrative.route_id)

    session_result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.user_id == current_user.id,
            or_(*filters),
        ).order_by(desc(InterviewSession.completed_at), desc(InterviewSession.created_at))
    )
    sessions = session_result.scalars().all()

    title_terms = _extract_terms(narrative.title, narrative.target_program, narrative.target_institution)

    linked_sessions: list[InterviewSession] = []
    for session in sessions:
        if session.source_narrative_id == narrative.id:
            linked_sessions.append(session)
            continue
        searchable = " ".join(filter(None, [session.target_institution, session.source_narrative_title])).lower()
        if title_terms and any(term in searchable for term in title_terms):
            linked_sessions.append(session)

    existing_result = await db.execute(
        select(NarrativeInterviewLoopInsight).where(
            NarrativeInterviewLoopInsight.narrative_id == narrative.id
        )
    )
    insight = existing_result.scalar_one_or_none()

    if not linked_sessions:
        if insight:
            insight.linked_session_count = 0
            insight.completed_session_count = 0
            insight.average_overall_score = None
            insight.alignment_score = None
            insight.evidence_coverage_score = None
            insight.average_answer_duration_seconds = None
            insight.latest_session_id = None
            insight.strongest_signals = []
            insight.focus_areas = []
            insight.summary = {}
        else:
            insight = NarrativeInterviewLoopInsight(
                user_id=current_user.id,
                narrative_id=narrative.id,
                route_id=narrative.route_id,
                linked_session_count=0,
                completed_session_count=0,
                strongest_signals=[],
                focus_areas=[],
                summary={},
            )
            db.add(insight)
        await db.flush()
        return insight

    session_ids = [session.id for session in linked_sessions]
    answer_result = await db.execute(
        select(InterviewAnswer).where(InterviewAnswer.session_id.in_(session_ids))
    )
    answers = answer_result.scalars().all()

    terms = _extract_terms(narrative.title, narrative.target_program, narrative.target_institution)
    alignment_hits = 0
    evidence_hits = 0
    durations: list[float] = []

    for answer in answers:
        transcript = (answer.transcript or "").lower()
        if terms and any(term in transcript for term in terms):
            alignment_hits += 1
        if transcript and (any(char.isdigit() for char in transcript) or "resultado" in transcript or "impacto" in transcript or "projeto" in transcript):
            evidence_hits += 1
        if answer.duration_seconds:
            durations.append(float(answer.duration_seconds))

    completed_sessions = [session for session in linked_sessions if str(session.status) == "completed"]
    overall_scores = [float(session.overall_score) for session in completed_sessions if session.overall_score is not None]
    latest_session = linked_sessions[0]

    strongest_signals: list[str] = []
    if _average(overall_scores) and _average(overall_scores) >= 75:
        strongest_signals.append("A fala recente sustenta bem o núcleo da narrativa.")
    if answers and evidence_hits / max(len(answers), 1) >= 0.6:
        strongest_signals.append("O usuário já mobiliza exemplos concretos com frequência.")

    focus_areas: list[str] = []
    alignment_score = round((alignment_hits / len(answers)) * 100, 2) if answers and terms else None
    evidence_score = round((evidence_hits / len(answers)) * 100, 2) if answers else None
    average_duration = _average(durations)

    if alignment_score is not None and alignment_score < 65:
        focus_areas.append("Reforçar os mesmos sinais centrais do dossiê nas respostas orais.")
    if evidence_score is not None and evidence_score < 60:
        focus_areas.append("Adicionar provas e resultados mais reutilizáveis no documento.")
    if average_duration is not None and average_duration > 135:
        focus_areas.append("Enxugar blocos narrativos longos para respostas mais diretas.")

    summary = {
        "latest_session_at": latest_session.completed_at.isoformat() if latest_session.completed_at else latest_session.created_at.isoformat(),
        "latest_target": latest_session.target_institution,
        "terms_used_for_alignment": terms,
    }

    if insight is None:
        insight = NarrativeInterviewLoopInsight(
            user_id=current_user.id,
            narrative_id=narrative.id,
            route_id=narrative.route_id,
        )
        db.add(insight)

    insight.route_id = narrative.route_id
    insight.latest_session_id = latest_session.id
    insight.linked_session_count = len(linked_sessions)
    insight.completed_session_count = len(completed_sessions)
    insight.average_overall_score = _average(overall_scores)
    insight.alignment_score = alignment_score
    insight.evidence_coverage_score = evidence_score
    insight.average_answer_duration_seconds = average_duration
    insight.strongest_signals = strongest_signals
    insight.focus_areas = focus_areas
    insight.summary = summary
    insight.updated_at = datetime.now(timezone.utc)
    await db.flush()

    return insight


# === NARRATIVE CRUD ===

@router.post("", response_model=NarrativeDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_narrative(
    request: NarrativeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new narrative document with initial version"""
    # Create narrative
    narrative = Narrative(
        user_id=current_user.id,
        route_id=request.route_id,
        title=request.title,
        narrative_type=request.narrative_type,
        target_country=request.target_country,
        target_institution=request.target_institution,
        target_program=request.target_program,
    )
    db.add(narrative)
    await db.flush()
    
    # Create first version
    version = NarrativeVersion(
        narrative_id=narrative.id,
        version_number=1,
        content=request.content,
        word_count=len(request.content.split()),
        change_summary="Initial version",
    )
    db.add(version)
    await db.flush()
    
    # Update narrative with current version
    narrative.current_version_id = version.id
    narrative.version_count = 1
    
    await db.commit()
    await db.refresh(narrative)
    await db.refresh(version)
    
    # Build response manually to avoid lazy-loading relationships in async context
    response = NarrativeDetailResponse.model_validate(narrative)
    response.current_version = NarrativeVersionResponse.model_validate(version)
    response.versions = [NarrativeVersionResponse.model_validate(version)]
    response.analyses = []
    
    return response


@router.get("", response_model=NarrativeListResponse)
async def list_narratives(
    status: Optional[NarrativeStatus] = None,
    narrative_type: Optional[NarrativeType] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List user's narratives with optional filtering"""
    query = select(Narrative).where(Narrative.user_id == current_user.id)
    
    if status:
        query = query.where(Narrative.status == status)
    if narrative_type:
        query = query.where(Narrative.narrative_type == narrative_type)
    
    # Get total count
    count_result = await db.execute(
        select(func.count()).select_from(query.subquery())
    )
    total = count_result.scalar()
    
    # Get paginated results
    query = query.order_by(desc(Narrative.updated_at))
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    narratives = result.scalars().all()
    
    return NarrativeListResponse(
        items=[NarrativeListItem.model_validate(n) for n in narratives],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{narrative_id}", response_model=NarrativeDetailResponse)
async def get_narrative(
    narrative_id: UUID,
    include_versions: bool = Query(False),
    include_analyses: bool = Query(False),
    include_interview_loop: bool = Query(True),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a narrative by ID with optional related data"""
    result = await db.execute(
        select(Narrative).where(
            Narrative.id == narrative_id,
            Narrative.user_id == current_user.id
        )
    )
    narrative = result.scalar_one_or_none()
    
    if not narrative:
        raise HTTPException(status_code=404, detail="Narrative not found")
    
    response = NarrativeDetailResponse.model_validate(narrative)
    
    # Load current version
    if narrative.current_version_id:
        version_result = await db.execute(
            select(NarrativeVersion).where(NarrativeVersion.id == narrative.current_version_id)
        )
        current_version = version_result.scalar_one_or_none()
        if current_version:
            response.current_version = NarrativeVersionResponse.model_validate(current_version)
    
    # Load versions if requested
    if include_versions:
        versions_result = await db.execute(
            select(NarrativeVersion)
            .where(NarrativeVersion.narrative_id == narrative_id)
            .order_by(desc(NarrativeVersion.version_number))
        )
        versions = versions_result.scalars().all()
        response.versions = [NarrativeVersionResponse.model_validate(v) for v in versions]
    
    # Load analyses if requested
    if include_analyses:
        analyses_result = await db.execute(
            select(NarrativeAnalysis)
            .where(NarrativeAnalysis.narrative_id == narrative_id)
            .order_by(desc(NarrativeAnalysis.created_at))
        )
        analyses = analyses_result.scalars().all()
        response.analyses = [NarrativeAnalysisResponse.model_validate(a) for a in analyses]

    if include_interview_loop:
        insight = await _refresh_interview_loop_insight(narrative, current_user, db)
        await db.commit()
        if insight:
            await db.refresh(insight)
            response.interview_loop = NarrativeInterviewLoopInsightResponse.model_validate(insight)
    
    return response


@router.patch("/{narrative_id}", response_model=NarrativeDetailResponse)
async def update_narrative(
    narrative_id: UUID,
    request: NarrativeUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update narrative metadata (not content - use versioning)"""
    result = await db.execute(
        select(Narrative).where(
            Narrative.id == narrative_id,
            Narrative.user_id == current_user.id
        )
    )
    narrative = result.scalar_one_or_none()
    
    if not narrative:
        raise HTTPException(status_code=404, detail="Narrative not found")
    
    # Update fields
    if request.title:
        narrative.title = request.title
    if request.narrative_type:
        narrative.narrative_type = request.narrative_type
    if request.target_country:
        narrative.target_country = request.target_country
    if request.target_institution:
        narrative.target_institution = request.target_institution
    if request.target_program:
        narrative.target_program = request.target_program
    if request.status:
        narrative.status = request.status
    
    narrative.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(narrative)
    
    return narrative


@router.delete("/{narrative_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_narrative(
    narrative_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a narrative and all its versions/analyses"""
    result = await db.execute(
        select(Narrative).where(
            Narrative.id == narrative_id,
            Narrative.user_id == current_user.id
        )
    )
    narrative = result.scalar_one_or_none()
    
    if not narrative:
        raise HTTPException(status_code=404, detail="Narrative not found")
    
    await db.delete(narrative)
    await db.commit()
    
    return None


@router.patch("/{narrative_id}/content", response_model=NarrativeDetailResponse)
async def update_narrative_content(
    narrative_id: UUID,
    request: NarrativeContentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update the current draft content without creating a new version"""
    result = await db.execute(
        select(Narrative).where(
            Narrative.id == narrative_id,
            Narrative.user_id == current_user.id
        )
    )
    narrative = result.scalar_one_or_none()

    if not narrative:
        raise HTTPException(status_code=404, detail="Narrative not found")

    current_version = None
    if narrative.current_version_id:
        version_result = await db.execute(
            select(NarrativeVersion).where(
                NarrativeVersion.id == narrative.current_version_id,
                NarrativeVersion.narrative_id == narrative_id
            )
        )
        current_version = version_result.scalar_one_or_none()

    if current_version is None:
        current_version = NarrativeVersion(
            narrative_id=narrative_id,
            version_number=max(1, narrative.version_count or 0),
            content=request.content,
            content_plain=request.content,
            word_count=len(request.content.split()) if request.content.strip() else 0,
            change_summary="Draft updated",
        )
        db.add(current_version)
        await db.flush()
        narrative.current_version_id = current_version.id
        narrative.version_count = max(1, narrative.version_count or 0)
    else:
        current_version.content = request.content
        current_version.content_plain = request.content
        current_version.word_count = len(request.content.split()) if request.content.strip() else 0
        current_version.change_summary = "Draft updated"

    narrative.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(narrative)
    await db.refresh(current_version)

    response = NarrativeDetailResponse.model_validate(narrative)
    response.current_version = NarrativeVersionResponse.model_validate(current_version)
    response.versions = [NarrativeVersionResponse.model_validate(current_version)]
    response.analyses = []

    return response


# === VERSION MANAGEMENT ===

@router.post("/{narrative_id}/versions", response_model=NarrativeVersionResponse)
async def create_version(
    narrative_id: UUID,
    request: NarrativeVersionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new version of a narrative"""
    # Verify narrative ownership
    narrative_result = await db.execute(
        select(Narrative).where(
            Narrative.id == narrative_id,
            Narrative.user_id == current_user.id
        )
    )
    narrative = narrative_result.scalar_one_or_none()
    
    if not narrative:
        raise HTTPException(status_code=404, detail="Narrative not found")
    
    # Get next version number
    max_version_result = await db.execute(
        select(func.max(NarrativeVersion.version_number))
        .where(NarrativeVersion.narrative_id == narrative_id)
    )
    max_version = max_version_result.scalar() or 0
    
    # Create new version
    version = NarrativeVersion(
        narrative_id=narrative_id,
        version_number=max_version + 1,
        content=request.content,
        content_plain=request.content,  # Simplified - would strip formatting
        word_count=len(request.content.split()),
        change_summary=request.change_summary,
    )
    db.add(version)
    await db.flush()
    
    # Update narrative
    narrative.current_version_id = version.id
    narrative.version_count = max_version + 1
    narrative.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(version)
    
    return version


@router.get("/{narrative_id}/versions", response_model=List[NarrativeVersionResponse])
async def list_versions(
    narrative_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all versions of a narrative"""
    # Verify ownership
    narrative_result = await db.execute(
        select(Narrative).where(
            Narrative.id == narrative_id,
            Narrative.user_id == current_user.id
        )
    )
    if not narrative_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Narrative not found")
    
    versions_result = await db.execute(
        select(NarrativeVersion)
        .where(NarrativeVersion.narrative_id == narrative_id)
        .order_by(desc(NarrativeVersion.version_number))
    )
    versions = versions_result.scalars().all()
    
    return [NarrativeVersionResponse.model_validate(v) for v in versions]


@router.get("/{narrative_id}/versions/{version_id}", response_model=NarrativeVersionResponse)
async def get_version(
    narrative_id: UUID,
    version_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific version"""
    # Verify ownership
    narrative_result = await db.execute(
        select(Narrative).where(
            Narrative.id == narrative_id,
            Narrative.user_id == current_user.id
        )
    )
    if not narrative_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Narrative not found")
    
    version_result = await db.execute(
        select(NarrativeVersion).where(
            NarrativeVersion.id == version_id,
            NarrativeVersion.narrative_id == narrative_id
        )
    )
    version = version_result.scalar_one_or_none()
    
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    
    return version


# === AI ANALYSIS ===

@router.post("/{narrative_id}/analyze", response_model=NarrativeAnalysisResponse)
async def analyze_narrative(
    narrative_id: UUID,
    request: AnalyzeRequest,
    version_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Request AI analysis of a narrative.
    
    In production, this would queue a background job for AI processing.
    For now, returns placeholder analysis.
    """
    # Verify ownership
    narrative_result = await db.execute(
        select(Narrative).where(
            Narrative.id == narrative_id,
            Narrative.user_id == current_user.id
        )
    )
    narrative = narrative_result.scalar_one_or_none()
    
    if not narrative:
        raise HTTPException(status_code=404, detail="Narrative not found")
    
    # Get version to analyze
    if version_id:
        version_result = await db.execute(
            select(NarrativeVersion).where(
                NarrativeVersion.id == version_id,
                NarrativeVersion.narrative_id == narrative_id
            )
        )
        version = version_result.scalar_one_or_none()
        if not version:
            raise HTTPException(status_code=404, detail="Version not found")
    else:
        # Use current version
        if not narrative.current_version_id:
            raise HTTPException(status_code=400, detail="No content to analyze")
        version_result = await db.execute(
            select(NarrativeVersion).where(NarrativeVersion.id == narrative.current_version_id)
        )
        version = version_result.scalar_one_or_none()
    
    # TODO: In production, this would call the AI service
    # For now, create a placeholder analysis
    analysis = NarrativeAnalysis(
        narrative_id=narrative_id,
        version_id=version.id if version else None,
        clarity_score=75.0,
        coherence_score=80.0,
        alignment_score=70.0,
        authenticity_score=85.0,
        overall_score=77.5,
        cliche_density_score=20.0,
        authenticity_risk="low",
        key_strengths=["Clear motivation", "Strong opening", "Personal connection"],
        improvement_actions=[
            "Add more specific examples",
            "Strengthen conclusion",
            "Clarify career goals connection"
        ],
        suggested_edits=[],
        ai_model=request.ai_model or "placeholder",
        prompt_version="1.0",
        token_usage=1500,
        processing_time_ms=2500,
        raw_ai_output={},
    )
    
    db.add(analysis)
    await db.flush()
    
    # Update version with analysis reference
    version.analysis_id = analysis.id
    version.clarity_score = analysis.clarity_score
    version.coherence_score = analysis.coherence_score
    version.authenticity_score = analysis.authenticity_score
    version.overall_score = analysis.overall_score
    
    # Update narrative summary
    narrative.latest_clarity_score = analysis.clarity_score
    narrative.latest_coherence_score = analysis.coherence_score
    narrative.latest_authenticity_score = analysis.authenticity_score
    narrative.latest_overall_score = analysis.overall_score
    narrative.last_analyzed_at = datetime.now(timezone.utc)
    narrative.ai_summary = "Document shows good authenticity and coherence. Consider adding more specific examples to strengthen impact."
    narrative.key_strengths = analysis.key_strengths
    narrative.improvement_areas = analysis.improvement_actions
    
    await db.commit()
    await db.refresh(analysis)
    
    return analysis


@router.get("/{narrative_id}/analyses", response_model=NarrativeAnalysisListResponse)
async def list_analyses(
    narrative_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all analyses for a narrative"""
    # Verify ownership
    narrative_result = await db.execute(
        select(Narrative).where(
            Narrative.id == narrative_id,
            Narrative.user_id == current_user.id
        )
    )
    if not narrative_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Narrative not found")
    
    analyses_result = await db.execute(
        select(NarrativeAnalysis)
        .where(NarrativeAnalysis.narrative_id == narrative_id)
        .order_by(desc(NarrativeAnalysis.created_at))
    )
    analyses = analyses_result.scalars().all()
    
    return NarrativeAnalysisListResponse(
        items=[NarrativeAnalysisResponse.model_validate(a) for a in analyses],
        total=len(analyses)
    )


@router.get("/{narrative_id}/interview-loop", response_model=NarrativeInterviewLoopInsightResponse)
async def get_interview_loop(
    narrative_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Recompute and return the persisted interview-document calibration for a narrative."""
    narrative_result = await db.execute(
        select(Narrative).where(
            Narrative.id == narrative_id,
            Narrative.user_id == current_user.id
        )
    )
    narrative = narrative_result.scalar_one_or_none()

    if not narrative:
        raise HTTPException(status_code=404, detail="Narrative not found")

    insight = await _refresh_interview_loop_insight(narrative, current_user, db)
    await db.commit()
    await db.refresh(insight)
    return insight
