"""Interview Intelligence Engine API Routes"""

import random
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_

from app.core.auth import get_current_user
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new interview question (admin/provider only in production)"""
    # TODO: Add role check for admin/provider
    
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
    session = InterviewSession(
        user_id=current_user.id,
        session_type=request.session_type,
        route_id=request.route_id,
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
async def analyze_answer(
    answer_id: UUID,
    request: InterviewAnswerAnalyzeRequest,
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
    
    # TODO: In production, call AI service
    # For now, placeholder analysis
    answer.clarity_score = 75.0
    answer.confidence_score = 80.0
    answer.relevance_score = 70.0
    answer.structure_score = 72.0
    answer.overall_score = 74.25
    
    answer.content_feedback = "The answer demonstrates good understanding of the topic. Consider providing more specific examples to strengthen your points."
    answer.delivery_feedback = "Clear and confident delivery. Pace was appropriate."
    answer.key_strengths = ["Clear structure", "Confident tone", "Relevant content"]
    answer.improvement_suggestions = [
        "Add a concrete example",
        "Expand on the 'why' behind your motivation",
        "Connect back to the specific opportunity"
    ]
    
    answer.ai_model = request.ai_model or "placeholder"
    answer.token_usage = 1200
    answer.processing_time_ms = 1800
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
