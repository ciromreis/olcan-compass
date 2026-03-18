from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models import (
    User,
    PsychProfile,
    PsychQuestion,
    PsychAssessmentSession,
    PsychAnswer,
    PsychScoreHistory,
)
from app.schemas.psychology import (
    PsychProfileResponse,
    PsychProfileUpdate,
    PsychQuestionResponse,
    PsychSessionStartResponse,
    PsychScoreHistoryResponse,
    PsychScoreHistoryListResponse,
    StartAssessmentRequest,
    SubmitAnswerRequest,
    PsychQuestionOption,
)

router = APIRouter(prefix="/psych", tags=["Psychological Engine"])


# --- Profile Endpoints ---

@router.get("/profile", response_model=PsychProfileResponse)
async def get_psych_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Obter perfil psicológico do usuário atual"""
    result = await db.execute(
        select(PsychProfile).where(PsychProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil psicológico não encontrado. Inicie uma avaliação primeiro."
        )
    
    return profile


@router.put("/profile", response_model=PsychProfileResponse)
async def update_psych_profile(
    request: PsychProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Atualizar perfil psicológico (campos limitados)"""
    result = await db.execute(
        select(PsychProfile).where(PsychProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil psicológico não encontrado"
        )
    
    if request.risk_profile is not None:
        profile.risk_profile = request.risk_profile
    if request.decision_style is not None:
        profile.decision_style = request.decision_style
    
    await db.commit()
    await db.refresh(profile)
    
    return profile


# --- Assessment Endpoints ---

@router.post("/assessment/start", response_model=PsychSessionStartResponse)
async def start_assessment(
    request: StartAssessmentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Iniciar uma nova sessão de avaliação psicológica"""
    # Count active questions
    result = await db.execute(
        select(func.count(PsychQuestion.id)).where(PsychQuestion.is_active)
    )
    total_questions = result.scalar() or 0
    
    if total_questions == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhuma questão ativa disponível"
        )
    
    # Create session
    session = PsychAssessmentSession(
        user_id=current_user.id,
        status="in_progress",
        total_questions=total_questions,
        current_question_index=0,
    )
    
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    return PsychSessionStartResponse(
        session_id=session.id,
        total_questions=session.total_questions,
        current_question_index=session.current_question_index,
        started_at=session.started_at,
    )


@router.get("/assessment/{session_id}/question", response_model=PsychQuestionResponse)
async def get_next_question(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Obter a próxima questão na avaliação"""
    # Verify session exists and belongs to user
    result = await db.execute(
        select(PsychAssessmentSession).where(
            PsychAssessmentSession.id == session_id,
            PsychAssessmentSession.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sessão de avaliação não encontrada"
        )
    
    if session.status != "in_progress":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sessão de avaliação não está em andamento"
        )
    
    # Get next question
    result = await db.execute(
        select(PsychQuestion)
        .where(PsychQuestion.is_active)
        .order_by(PsychQuestion.display_order)
        .offset(session.current_question_index)
        .limit(1)
    )
    question = result.scalar_one_or_none()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Não há mais questões disponíveis"
        )
    
    # Parse options
    options = []
    if question.options:
        for opt in question.options:
            options.append(PsychQuestionOption(**opt))
    
    return PsychQuestionResponse(
        id=question.id,
        text_en=question.text_en,
        text_pt=question.text_pt,
        text_es=question.text_es,
        question_type=question.question_type.value,
        category=question.category.value,
        options=options,
        weight=question.weight,
        reverse_scored=question.reverse_scored,
        display_order=question.display_order,
        is_active=question.is_active,
    )


@router.post("/assessment/answer")
async def submit_answer(
    request: SubmitAnswerRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Enviar uma resposta para uma questão"""
    # Verify session
    result = await db.execute(
        select(PsychAssessmentSession).where(
            PsychAssessmentSession.id == request.session_id,
            PsychAssessmentSession.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    
    if not session or session.status != "in_progress":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sessão inválida"
        )
    
    # Verify question exists
    result = await db.execute(
        select(PsychQuestion).where(PsychQuestion.id == request.question_id)
    )
    question = result.scalar_one_or_none()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Questão não encontrada"
        )
    
    # Compute score: normalize from 1-5 Likert scale to 0-100 range
    computed_score = None
    if request.answer_value and question.options:
        for opt in question.options:
            if opt.get("value") == request.answer_value:
                raw_score = opt.get("score", 3.0)
                if question.reverse_scored:
                    raw_score = 6.0 - raw_score  # Flip on 1-5 scale
                # Normalize to 0-100: (raw - 1) / 4 * 100
                computed_score = ((raw_score - 1.0) / 4.0) * 100.0 * question.weight
                break
    
    # Save answer
    answer = PsychAnswer(
        session_id=request.session_id,
        question_id=request.question_id,
        answer_value=request.answer_value,
        answer_text=request.answer_text,
        computed_score=computed_score,
    )
    
    db.add(answer)
    
    # Update session progress
    session.current_question_index += 1
    
    # Check if complete
    if session.current_question_index >= session.total_questions:
        session.status = "completed"
        session.completed_at = datetime.now(timezone.utc)
        await _compute_and_save_profile(session, current_user.id, db, background_tasks)
    
    await db.commit()
    
    return {
        "message": "Resposta enviada",
        "next_index": session.current_question_index,
        "is_complete": session.status == "completed"
    }


async def _compute_and_save_profile(session: PsychAssessmentSession, user_id: UUID, db: AsyncSession, background_tasks: BackgroundTasks):
    """Compute scores and save profile after completion"""
    # Get all answers for this session
    result = await db.execute(
        select(PsychAnswer).where(PsychAnswer.session_id == session.id)
    )
    answers = result.scalars().all()
    
    # Batch-load all questions referenced by answers (avoid N+1)
    question_ids = [a.question_id for a in answers]
    result = await db.execute(
        select(PsychQuestion).where(PsychQuestion.id.in_(question_ids))
    )
    questions_by_id = {q.id: q for q in result.scalars().all()}
    
    # Group by category and compute scores
    scores = {
        "confidence": [],
        "anxiety": [],
        "discipline": [],
        "risk_tolerance": [],
        "narrative_clarity": [],
        "interview_anxiety": [],
        "decision_style": [],
        "cultural_adaptability": [],
        "financial_resilience": [],
        "communication_style": [],
    }
    
    for answer in answers:
        question = questions_by_id.get(answer.question_id)
        if question and answer.computed_score is not None:
            scores[question.category.value].append(answer.computed_score)
    
    # Compute averages
    avg_scores = {}
    for category, values in scores.items():
        avg_scores[category] = sum(values) / len(values) if values else 50.0
    
    # Get or create profile
    result = await db.execute(
        select(PsychProfile).where(PsychProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        profile = PsychProfile(user_id=user_id)
        db.add(profile)
    
    # Calculate readiness score before updating profile
    previous_readiness = (
        (profile.confidence_index + profile.discipline_score) / 2
        if profile.confidence_index and profile.discipline_score
        else 0
    )
    
    # Update profile scores
    profile.confidence_index = avg_scores.get("confidence", 50.0)
    profile.anxiety_score = avg_scores.get("anxiety", 50.0)
    profile.discipline_score = avg_scores.get("discipline", 50.0)
    profile.narrative_maturity_score = avg_scores.get("narrative_clarity", 50.0)
    profile.interview_anxiety_score = avg_scores.get("interview_anxiety", 50.0)
    profile.cultural_adaptability_score = avg_scores.get("cultural_adaptability", 50.0)
    profile.financial_resilience_score = avg_scores.get("financial_resilience", 50.0)
    
    # Determine states
    profile.mobility_state = _determine_mobility_state(avg_scores)
    profile.psychological_state = _determine_psychological_state(avg_scores)
    
    # Determine risk profile
    if avg_scores.get("risk_tolerance", 50) < 33:
        profile.risk_profile = "low"
    elif avg_scores.get("risk_tolerance", 50) > 66:
        profile.risk_profile = "high"
    else:
        profile.risk_profile = "medium"
    
    profile.last_assessment_at = datetime.now(timezone.utc)
    
    # Save score history
    history = PsychScoreHistory(
        user_id=user_id,
        confidence_index=profile.confidence_index,
        anxiety_score=profile.anxiety_score,
        discipline_score=profile.discipline_score,
        risk_profile=profile.risk_profile,
        assessment_type="onboarding",
    )
    db.add(history)
    
    # Store snapshot in session
    session.scores_snapshot = avg_scores
    
    # === ECONOMICS INTEGRATION (graceful — skipped when Redis/Celery unavailable) ===
    new_readiness = (profile.confidence_index + profile.discipline_score) / 2
    
    def dispatch_economics_tasks(user_id_str: str, p_readiness: float, n_readiness: float):
        try:
            from app.tasks.temporal_matching import recalculate_temporal_matches_task
            recalculate_temporal_matches_task.delay(user_id_str)
        except Exception as e:
            print(f"Failed to dispatch temporal_matching: {e}")
            pass  # Celery/Redis not available
        
        try:
            if p_readiness < 80 and n_readiness >= 80:
                from app.tasks.credentials import generate_credential_task
                generate_credential_task.delay(user_id_str, "readiness", int(n_readiness))
        except Exception as e:
            print(f"Failed to dispatch credentials task: {e}")
            pass  # Celery/Redis not available
            
    # Dispatch non-blocking BackgroundTask to communicate with Celery broker
    background_tasks.add_task(dispatch_economics_tasks, str(user_id), previous_readiness, new_readiness)


def _determine_mobility_state(scores: dict) -> str:
    """Determine mobility state based on scores"""
    readiness = scores.get("confidence", 50) + scores.get("discipline", 50)
    readiness = readiness / 2
    
    if readiness < 30:
        return "exploring"
    elif readiness < 50:
        return "preparing"
    elif readiness < 70:
        return "applying"
    else:
        return "executing"


def _determine_psychological_state(scores: dict) -> str:
    """Determine psychological state based on scores"""
    anxiety = scores.get("anxiety", 50)
    confidence = scores.get("confidence", 50)
    
    if anxiety > 66:
        return "uncertain"
    elif confidence < 40:
        return "structuring"
    elif confidence < 60:
        return "building_confidence"
    elif confidence < 80:
        return "executing"
    else:
        return "resilient"


# --- History Endpoints ---

@router.get("/history", response_model=PsychScoreHistoryListResponse)
async def get_score_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Obter histórico de pontuação psicológica"""
    result = await db.execute(
        select(PsychScoreHistory)
        .where(PsychScoreHistory.user_id == current_user.id)
        .order_by(PsychScoreHistory.created_at.desc())
    )
    history = result.scalars().all()
    
    return PsychScoreHistoryListResponse(
        history=[PsychScoreHistoryResponse.model_validate(h) for h in history],
        total=len(history)
    )
