"""Interview Intelligence Engine API Routes"""

import random
import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form, Request
from app.core.rate_limit import limiter
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_

logger = logging.getLogger(__name__)

from app.core.auth import get_current_user, require_admin_or_provider
from app.core.ai_engines import InterviewFeedbackEngine
from app.core.ai_service import AIProvider, get_ai_provider_enum
from app.db.session import get_db
from app.db.models import (
    User,
    InterviewQuestion,
    InterviewSession,
    InterviewAnswer,
    InterviewQuestionType,
    InterviewSessionStatus,
    InterviewAnswerStatus,
    Route,
    Narrative,
)
from app.schemas.interview import (
    InterviewQuestionCreate,
    InterviewQuestionUpdate,
    InterviewQuestionResponse,
    InterviewQuestionListResponse,
    InterviewSessionCreate,
    InterviewSessionStartRequest,
    InterviewSessionUpdate,
    InterviewSessionDetailResponse,
    InterviewSessionListResponse,
    InterviewSessionListItem,
    InterviewAnswerSubmitRequest,
    InterviewAnswerAnalyzeRequest,
    InterviewAnswerResponse,
    InterviewAnswerListResponse,
    InterviewQuestionSelectResponse,
    InterviewProgressStats,
)

router = APIRouter(prefix="/interviews", tags=["Interview Intelligence"])


# === INTERVIEW QUESTIONS (Question Bank) ===

@router.get("/questions", response_model=InterviewQuestionListResponse)
async def list_questions(
    question_type: Optional[InterviewQuestionType] = None,
    route_type: Optional[str] = None,
    difficulty: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List interview questions from the question bank"""
    query = select(InterviewQuestion).where(InterviewQuestion.is_active)
    
    if question_type:
        query = query.where(InterviewQuestion.question_type == question_type)
    if difficulty:
        query = query.where(InterviewQuestion.difficulty == difficulty)
    if route_type:
        # Filter by route type in the JSON array
        query = query.where(InterviewQuestion.route_types.contains([route_type]))
    
    query = query.order_by(InterviewQuestion.display_order, InterviewQuestion.created_at)
    
    result = await db.execute(query)
    questions = result.scalars().all()
    
    return InterviewQuestionListResponse(
        items=[InterviewQuestionResponse.model_validate(q) for q in questions],
        total=len(questions)
    )


@router.get("/questions/{question_id}", response_model=InterviewQuestionResponse)
async def get_question(
    question_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific interview question"""
    result = await db.execute(
        select(InterviewQuestion).where(InterviewQuestion.id == question_id)
    )
    question = result.scalar_one_or_none()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return question


@router.post("/questions", response_model=InterviewQuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question(
    request: InterviewQuestionCreate,
    current_user: User = Depends(require_admin_or_provider),
    db: AsyncSession = Depends(get_db)
):
    """Create a new interview question (admin/provider only)"""
    
    question = InterviewQuestion(**request.model_dump())
    db.add(question)
    await db.commit()
    await db.refresh(question)
    
    return question


@router.patch("/questions/{question_id}", response_model=InterviewQuestionResponse)
async def update_question(
    question_id: UUID,
    request: InterviewQuestionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an interview question"""
    result = await db.execute(
        select(InterviewQuestion).where(InterviewQuestion.id == question_id)
    )
    question = result.scalar_one_or_none()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Update fields
    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(question, field, value)
    
    question.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(question)
    
    return question


# === INTERVIEW SESSIONS ===

@router.post("/sessions", response_model=InterviewSessionDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    request: InterviewSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new interview session"""
    source_narrative_title = request.source_narrative_title
    if request.source_narrative_id:
        narrative_result = await db.execute(
            select(Narrative).where(
                Narrative.id == request.source_narrative_id,
                Narrative.user_id == current_user.id
            )
        )
        narrative = narrative_result.scalar_one_or_none()
        if not narrative:
            raise HTTPException(status_code=404, detail="Narrative not found")
        if not source_narrative_title:
            source_narrative_title = narrative.title

    session = InterviewSession(
        user_id=current_user.id,
        session_type=request.session_type,
        route_id=request.route_id,
        source_narrative_id=request.source_narrative_id,
        source_narrative_title=source_narrative_title,
        target_institution=request.target_institution,
        estimated_duration_minutes=request.estimated_duration_minutes,
        status=InterviewSessionStatus.SCHEDULED,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    return session


@router.post("/sessions/{session_id}/start", response_model=InterviewQuestionSelectResponse)
async def start_session(
    session_id: UUID,
    request: InterviewSessionStartRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Start an interview session by selecting questions.
    Returns the selected questions and session info.
    """
    # Verify session ownership
    session_result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == current_user.id
        )
    )
    session = session_result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.status not in [InterviewSessionStatus.SCHEDULED, InterviewSessionStatus.IN_PROGRESS]:
        raise HTTPException(status_code=400, detail="Session cannot be started")
    
    # Select questions
    query = select(InterviewQuestion).where(
        and_(
            InterviewQuestion.is_active,
            InterviewQuestion.question_type != InterviewQuestionType.QUESTION_FOR_PANEL
        )
    )
    
    if request.focus_types:
        query = query.where(InterviewQuestion.question_type.in_(request.focus_types))
    
    # Filter by route type if session has a route
    if session.route_id:
        route_result = await db.execute(
            select(Route).where(Route.id == session.route_id)
        )
        route = route_result.scalar_one_or_none()
        if route:
            route_type = route.route_type.value if hasattr(route.route_type, 'value') else str(route.route_type)
            query = query.where(InterviewQuestion.route_types.contains([route_type]))
    
    result = await db.execute(query)
    all_questions = result.scalars().all()
    
    # Randomly select questions up to the requested count
    selected_questions = random.sample(
        list(all_questions), 
        min(request.question_count, len(all_questions))
    ) if all_questions else []
    
    # Update session
    session.question_ids = [str(q.id) for q in selected_questions]
    session.total_questions = len(selected_questions)
    session.current_question_index = 0
    session.status = InterviewSessionStatus.IN_PROGRESS
    session.started_at = datetime.now(timezone.utc)
    
    await db.commit()
    
    return InterviewQuestionSelectResponse(
        id=session.id,
        session_id=session.id,
        questions=[InterviewQuestionResponse.model_validate(q) for q in selected_questions],
        total_questions=len(selected_questions),
        estimated_duration_minutes=session.estimated_duration_minutes
    )


@router.get("/sessions", response_model=InterviewSessionListResponse)
async def list_sessions(
    status: Optional[InterviewSessionStatus] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List user's interview sessions"""
    query = select(InterviewSession).where(InterviewSession.user_id == current_user.id)
    
    if status:
        query = query.where(InterviewSession.status == status)
    
    # Count total
    count_result = await db.execute(
        select(func.count()).select_from(query.subquery())
    )
    total = count_result.scalar()
    
    # Paginate
    query = query.order_by(desc(InterviewSession.created_at))
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    sessions = result.scalars().all()
    
    return InterviewSessionListResponse(
        items=[InterviewSessionListItem.model_validate(s) for s in sessions],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/sessions/{session_id}", response_model=InterviewSessionDetailResponse)
async def get_session(
    session_id: UUID,
    include_answers: bool = Query(True),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get session details with answers and current question"""
    result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    response = InterviewSessionDetailResponse.model_validate(session)
    
    # Load current question
    if session.question_ids and session.current_question_index < len(session.question_ids):
        current_question_id = UUID(session.question_ids[session.current_question_index])
        question_result = await db.execute(
            select(InterviewQuestion).where(InterviewQuestion.id == current_question_id)
        )
        current_question = question_result.scalar_one_or_none()
        if current_question:
            response.current_question = InterviewQuestionResponse.model_validate(current_question)
    
    # Load answers
    if include_answers:
        answers_result = await db.execute(
            select(InterviewAnswer)
            .where(InterviewAnswer.session_id == session_id)
            .order_by(InterviewAnswer.created_at)
        )
        answers = answers_result.scalars().all()
        response.answers = [InterviewAnswerResponse.model_validate(a) for a in answers]
    
    return response


@router.patch("/sessions/{session_id}", response_model=InterviewSessionDetailResponse)
async def update_session(
    session_id: UUID,
    request: InterviewSessionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update session metadata"""
    result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if request.status:
        session.status = request.status
        if request.status == InterviewSessionStatus.COMPLETED:
            session.completed_at = datetime.now(timezone.utc)
    if request.target_institution:
        session.target_institution = request.target_institution
    
    session.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(session)
    
    return session


@router.post("/sessions/{session_id}/complete", response_model=InterviewSessionDetailResponse)
async def complete_session(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark session as completed and compute summary scores"""
    result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get all analyzed answers to compute averages
    answers_result = await db.execute(
        select(InterviewAnswer).where(
            InterviewAnswer.session_id == session_id,
            InterviewAnswer.status == InterviewAnswerStatus.ANALYZED
        )
    )
    answers = answers_result.scalars().all()
    
    if answers:
        # Compute average scores
        session.clarity_score = sum(a.clarity_score or 0 for a in answers) / len(answers)
        session.confidence_score = sum(a.confidence_score or 0 for a in answers) / len(answers)
        session.relevance_score = sum(a.relevance_score or 0 for a in answers) / len(answers)
        session.overall_score = sum(a.overall_score or 0 for a in answers) / len(answers)
        
        # Collect strengths and improvement areas
        all_strengths = []
        all_improvements = []
        for a in answers:
            all_strengths.extend(a.key_strengths or [])
            all_improvements.extend(a.improvement_suggestions or [])
        
        session.top_strengths = list(set(all_strengths))[:5]  # Top 5 unique
        session.improvement_areas = list(set(all_improvements))[:5]
        session.ai_summary = f"Session completed with {len(answers)} analyzed answers. Average score: {session.overall_score:.1f}/100."
    
    session.status = InterviewSessionStatus.COMPLETED
    session.completed_at = datetime.now(timezone.utc)
    session.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(session)
    
    return session


# === INTERVIEW ANSWERS ===

@router.post("/sessions/{session_id}/answers", response_model=InterviewAnswerResponse)
async def submit_answer(
    session_id: UUID,
    request: InterviewAnswerSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Submit an answer for the current question"""
    # Verify session
    session_result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == current_user.id
        )
    )
    session = session_result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.status != InterviewSessionStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Session is not in progress")
    
    # Get current question
    if session.current_question_index >= len(session.question_ids):
        raise HTTPException(status_code=400, detail="No more questions in session")
    
    current_question_id = UUID(session.question_ids[session.current_question_index])
    
    # Create answer
    answer = InterviewAnswer(
        session_id=session_id,
        question_id=current_question_id,
        transcript=request.transcript,
        audio_url=request.audio_url,
        video_url=request.video_url,
        duration_seconds=request.duration_seconds,
        word_count=len(request.transcript.split()) if request.transcript else None,
        status=InterviewAnswerStatus.RECORDED,
    )
    db.add(answer)
    await db.flush()
    
    # Advance to next question
    session.current_question_index += 1
    
    # Auto-complete if all questions answered
    if session.current_question_index >= session.total_questions:
        session.status = InterviewSessionStatus.COMPLETED
        session.completed_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(answer)
    
    return answer


@router.post("/answers/{answer_id}/analyze", response_model=InterviewAnswerResponse)
@limiter.limit("15/minute")
async def analyze_answer(
    answer_id: UUID,
    request: Request,
    analyze_request: InterviewAnswerAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Request AI analysis of a recorded answer.
    In production, this would queue a background job.
    """
    # Verify ownership through session
    result = await db.execute(
        select(InterviewAnswer, InterviewSession).join(
            InterviewSession, InterviewAnswer.session_id == InterviewSession.id
        ).where(
            InterviewAnswer.id == answer_id,
            InterviewSession.user_id == current_user.id
        )
    )
    row = result.one_or_none()
    
    if not row:
        raise HTTPException(status_code=404, detail="Answer not found")
    
    answer, session = row
    
    if answer.status != InterviewAnswerStatus.RECORDED:
        raise HTTPException(status_code=400, detail="Answer must be recorded before analysis")

    # Run AI feedback engine — provider determined by AI_PROVIDER env var
    ai_provider = get_ai_provider_enum()
    engine = InterviewFeedbackEngine(db=db, provider=ai_provider)
    feedback = engine._simulate_interview_feedback(answer.transcript or "")

    answer.clarity_score = float(feedback.clarity_score)
    answer.confidence_score = float(feedback.confidence_score)
    answer.relevance_score = float(feedback.content_score)
    answer.structure_score = float(feedback.structure_score)
    answer.overall_score = float(feedback.overall_score)

    answer.content_feedback = (
        feedback.specific_feedback[0]["feedback"]
        if feedback.specific_feedback
        else "Resposta analisada com sucesso."
    )
    answer.delivery_feedback = (
        feedback.specific_feedback[1]["feedback"]
        if len(feedback.specific_feedback) > 1
        else None
    )
    answer.key_strengths = feedback.strengths
    answer.improvement_suggestions = feedback.improvements

    answer.ai_model = analyze_request.ai_model or "simulation"
    answer.status = InterviewAnswerStatus.ANALYZED
    answer.analyzed_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(answer)
    
    return answer


@router.get("/answers", response_model=InterviewAnswerListResponse)
async def list_answers(
    session_id: Optional[UUID] = Query(None),
    status: Optional[InterviewAnswerStatus] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List interview answers (optionally filtered by session)"""
    query = select(InterviewAnswer).join(
        InterviewSession, InterviewAnswer.session_id == InterviewSession.id
    ).where(InterviewSession.user_id == current_user.id)
    
    if session_id:
        query = query.where(InterviewAnswer.session_id == session_id)
    if status:
        query = query.where(InterviewAnswer.status == status)
    
    query = query.order_by(desc(InterviewAnswer.created_at))
    
    result = await db.execute(query)
    answers = result.scalars().all()
    
    return InterviewAnswerListResponse(
        items=[InterviewAnswerResponse.model_validate(a) for a in answers],
        total=len(answers)
    )


# === STATS & PROGRESS ===

@router.get("/stats", response_model=InterviewProgressStats)
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get interview practice statistics for the user"""
    # Total sessions
    total_result = await db.execute(
        select(func.count()).where(InterviewSession.user_id == current_user.id)
    )
    total_sessions = total_result.scalar()
    
    # Completed sessions
    completed_result = await db.execute(
        select(func.count()).where(
            InterviewSession.user_id == current_user.id,
            InterviewSession.status == InterviewSessionStatus.COMPLETED
        )
    )
    completed_sessions = completed_result.scalar()
    
    # Average scores from sessions
    avg_result = await db.execute(
        select(
            func.avg(InterviewSession.overall_score),
            func.avg(InterviewSession.clarity_score),
            func.avg(InterviewSession.confidence_score)
        ).where(
            InterviewSession.user_id == current_user.id,
            InterviewSession.status == InterviewSessionStatus.COMPLETED
        )
    )
    avg_overall, avg_clarity, avg_confidence = avg_result.one_or_none() or (None, None, None)
    
    # Recent sessions
    recent_result = await db.execute(
        select(InterviewSession)
        .where(InterviewSession.user_id == current_user.id)
        .order_by(desc(InterviewSession.created_at))
        .limit(5)
    )
    recent_sessions = recent_result.scalars().all()
    
    return InterviewProgressStats(
        total_sessions=total_sessions,
        completed_sessions=completed_sessions,
        average_overall_score=round(avg_overall, 2) if avg_overall else None,
        average_clarity_score=round(avg_clarity, 2) if avg_clarity else None,
        average_confidence_score=round(avg_confidence, 2) if avg_confidence else None,
        scores_by_type={},  # Would need to compute from answers joined with questions
        recent_sessions=[InterviewSessionListItem.model_validate(s) for s in recent_sessions]
    )


# === AUDIO ANSWER UPLOAD ===

MAX_AUDIO_SIZE = 25 * 1024 * 1024  # 25 MB

@router.post("/sessions/{session_id}/answers/{answer_index}/audio")
@limiter.limit("10/minute")
async def submit_audio_answer(
    request: Request,
    session_id: UUID,
    answer_index: int,
    audio: UploadFile = File(...),
    language: str = Form("pt"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload an audio recording for an answer, transcribe via Whisper, and analyze delivery.

    - Accepts multipart audio (webm, ogg, mp4, wav).
    - Transcribes via OpenAI Whisper (falls back to stub if key is absent).
    - Runs delivery + content analysis on the transcript.
    - Updates the InterviewAnswer record with transcript and scores.
    - Rate limit: 5/min per user (enforced via slowapi when configured).
    """
    # Validate session ownership
    session_result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == current_user.id,
        )
    )
    session = session_result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Read audio data with size guard
    audio_data = await audio.read()
    if len(audio_data) > MAX_AUDIO_SIZE:
        raise HTTPException(status_code=413, detail="Audio file too large (max 25 MB)")

    if len(audio_data) == 0:
        raise HTTPException(status_code=400, detail="Empty audio file")

    # Get or create the answer record
    answers_result = await db.execute(
        select(InterviewAnswer)
        .where(InterviewAnswer.session_id == session_id)
        .order_by(InterviewAnswer.created_at)
    )
    answers = answers_result.scalars().all()

    if answer_index < 0 or answer_index >= len(answers):
        raise HTTPException(status_code=400, detail=f"Invalid answer index {answer_index}")

    answer = answers[answer_index]

    # Transcribe
    from app.services.voice_analysis_service import VoiceAnalysisService
    voice_service = VoiceAnalysisService()
    transcription = await voice_service.transcribe_audio(audio_data, language=language)

    transcript = transcription.get("text", "")
    if not transcript:
        raise HTTPException(status_code=422, detail="Could not transcribe audio")

    # Get question context for content analysis
    question_context = ""
    if answer.question_id and session.question_ids:
        q_result = await db.execute(
            select(InterviewQuestion).where(InterviewQuestion.id == answer.question_id)
        )
        question = q_result.scalar_one_or_none()
        if question:
            question_context = question.question_text_pt or question.question_text_en or ""

    # Analyze delivery and content
    delivery = voice_service.analyze_delivery(audio_data, transcript)
    content = voice_service.analyze_content_quality(transcript, question_context)
    feedback = voice_service.generate_comprehensive_feedback(transcript, delivery, content)

    # Update answer record
    answer.transcript = transcript
    answer.word_count = transcription.get("word_count", len(transcript.split()))
    answer.duration_seconds = transcription.get("duration", 0)
    answer.clarity_score = delivery["clarity_score"]
    answer.confidence_score = delivery["confidence_score"]
    answer.overall_score = feedback["overall_score"]
    answer.content_feedback = "; ".join(feedback.get("improvements", []))
    answer.delivery_feedback = "; ".join(
        [item["message"] for item in delivery.get("feedback", [])]
    )
    answer.key_strengths = feedback.get("strengths", [])
    answer.improvement_suggestions = feedback.get("improvements", [])
    answer.status = InterviewAnswerStatus.ANALYZED
    answer.analyzed_at = datetime.now(timezone.utc)
    answer.processing_time_ms = transcription.get("processing_time_ms", 0)

    await db.commit()
    await db.refresh(answer)

    logger.info(
        "Audio answer processed: session=%s index=%d score=%.1f",
        session_id, answer_index, feedback["overall_score"],
    )

    return {
        "answer_id": str(answer.id),
        "transcript": transcript,
        "overall_score": feedback["overall_score"],
        "delivery": delivery,
        "content": content,
        "strengths": feedback["strengths"],
        "improvements": feedback["improvements"],
        "next_steps": feedback["next_steps"],
    }
