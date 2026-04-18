"""Questions & Answers API Routes

Endpoints for Q&A community feature.
"""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models import User

router = APIRouter(prefix="/questions", tags=["Q&A"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class CreateQuestionRequest(BaseModel):
    title: str = Field(..., min_length=10, max_length=300)
    body: str = Field(..., min_length=20)
    tags: Optional[List[str]] = None
    related_archetype: Optional[str] = Field(None, max_length=50)
    journey_stage: Optional[str] = Field(None, max_length=50)


class UpdateQuestionRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=10, max_length=300)
    body: Optional[str] = Field(None, min_length=20)
    tags: Optional[List[str]] = None


class QuestionResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    body: str
    tags: Optional[List[str]]
    related_archetype: Optional[str]
    journey_stage: Optional[str]
    view_count: int
    answer_count: int
    upvote_count: int
    has_accepted_answer: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CreateAnswerRequest(BaseModel):
    body: str = Field(..., min_length=20)


class UpdateAnswerRequest(BaseModel):
    body: str = Field(..., min_length=20)


class AnswerResponse(BaseModel):
    id: UUID
    question_id: UUID
    user_id: UUID
    body: str
    upvote_count: int
    downvote_count: int
    is_accepted: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Question Endpoints
# ---------------------------------------------------------------------------

@router.post("/", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question(
    request: CreateQuestionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new question"""
    from app.db.models.social import Question
    
    question = Question(
        user_id=current_user.id,
        title=request.title,
        body=request.body,
        tags=request.tags or [],
        related_archetype=request.related_archetype,
        journey_stage=request.journey_stage,
        view_count=0,
        answer_count=0,
        upvote_count=0,
        has_accepted_answer=False
    )
    
    db.add(question)
    await db.commit()
    await db.refresh(question)
    
    return question


@router.get("/", response_model=List[QuestionResponse])
async def list_questions(
    tags: Optional[List[str]] = Query(None),
    archetype: Optional[str] = Query(None),
    journey_stage: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    unanswered_only: bool = Query(False),
    sort_by: str = Query("recent", regex="^(recent|popular|unanswered)$"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """List questions with filters"""
    from app.db.models.social import Question
    
    query = select(Question)
    
    if tags:
        query = query.where(Question.tags.overlap(tags))
    
    if archetype:
        query = query.where(Question.related_archetype == archetype)
    
    if journey_stage:
        query = query.where(Question.journey_stage == journey_stage)
    
    if unanswered_only:
        query = query.where(Question.answer_count == 0)
    
    if search:
        query = query.where(
            or_(
                Question.title.ilike(f"%{search}%"),
                Question.body.ilike(f"%{search}%")
            )
        )
    
    # Sort
    if sort_by == "popular":
        query = query.order_by(desc(Question.upvote_count), desc(Question.view_count))
    elif sort_by == "unanswered":
        query = query.where(Question.answer_count == 0).order_by(desc(Question.created_at))
    else:  # recent
        query = query.order_by(desc(Question.created_at))
    
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    questions = result.scalars().all()
    
    return questions


@router.get("/{question_id}", response_model=QuestionResponse)
async def get_question(
    question_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get question by ID and increment view count"""
    from app.db.models.social import Question
    
    result = await db.execute(
        select(Question).where(Question.id == question_id)
    )
    question = result.scalar_one_or_none()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Increment view count
    question.view_count += 1
    await db.commit()
    await db.refresh(question)
    
    return question


@router.put("/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: UUID,
    request: UpdateQuestionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a question (author only)"""
    from app.db.models.social import Question
    
    result = await db.execute(
        select(Question).where(
            and_(
                Question.id == question_id,
                Question.user_id == current_user.id
            )
        )
    )
    question = result.scalar_one_or_none()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found or not authorized"
        )
    
    # Update fields
    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(question, field, value)
    
    question.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(question)
    
    return question


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a question (author only)"""
    from app.db.models.social import Question
    
    result = await db.execute(
        select(Question).where(
            and_(
                Question.id == question_id,
                Question.user_id == current_user.id
            )
        )
    )
    question = result.scalar_one_or_none()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found or not authorized"
        )
    
    await db.delete(question)
    await db.commit()


@router.post("/{question_id}/upvote", status_code=status.HTTP_201_CREATED)
async def upvote_question(
    question_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upvote a question"""
    from app.db.models.social import Question, QuestionUpvote
    
    # Check if question exists
    result = await db.execute(
        select(Question).where(Question.id == question_id)
    )
    question = result.scalar_one_or_none()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Check if already upvoted
    result = await db.execute(
        select(QuestionUpvote).where(
            and_(
                QuestionUpvote.question_id == question_id,
                QuestionUpvote.user_id == current_user.id
            )
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Question already upvoted"
        )
    
    # Create upvote
    upvote = QuestionUpvote(
        question_id=question_id,
        user_id=current_user.id
    )
    db.add(upvote)
    
    # Increment upvote count
    question.upvote_count += 1
    
    await db.commit()
    
    return {"message": "Question upvoted successfully"}


@router.delete("/{question_id}/upvote", status_code=status.HTTP_204_NO_CONTENT)
async def remove_question_upvote(
    question_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove upvote from a question"""
    from app.db.models.social import Question, QuestionUpvote
    
    # Get upvote
    result = await db.execute(
        select(QuestionUpvote).where(
            and_(
                QuestionUpvote.question_id == question_id,
                QuestionUpvote.user_id == current_user.id
            )
        )
    )
    upvote = result.scalar_one_or_none()
    
    if not upvote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upvote not found"
        )
    
    # Delete upvote
    await db.delete(upvote)
    
    # Decrement upvote count
    result = await db.execute(
        select(Question).where(Question.id == question_id)
    )
    question = result.scalar_one_or_none()
    if question and question.upvote_count > 0:
        question.upvote_count -= 1
    
    await db.commit()


# ---------------------------------------------------------------------------
# Answer Endpoints
# ---------------------------------------------------------------------------

@router.post("/{question_id}/answers", response_model=AnswerResponse, status_code=status.HTTP_201_CREATED)
async def create_answer(
    question_id: UUID,
    request: CreateAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create an answer to a question"""
    from app.db.models.social import Question, Answer
    
    # Check if question exists
    result = await db.execute(
        select(Question).where(Question.id == question_id)
    )
    question = result.scalar_one_or_none()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Create answer
    answer = Answer(
        question_id=question_id,
        user_id=current_user.id,
        body=request.body,
        upvote_count=0,
        downvote_count=0,
        is_accepted=False
    )
    
    db.add(answer)
    
    # Increment answer count
    question.answer_count += 1
    
    await db.commit()
    await db.refresh(answer)
    
    return answer


@router.get("/{question_id}/answers", response_model=List[AnswerResponse])
async def get_question_answers(
    question_id: UUID,
    sort_by: str = Query("votes", regex="^(votes|recent)$"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db)
):
    """Get answers for a question"""
    from app.db.models.social import Answer
    
    query = select(Answer).where(Answer.question_id == question_id)
    
    # Sort accepted answer first, then by votes or recency
    if sort_by == "votes":
        query = query.order_by(desc(Answer.is_accepted), desc(Answer.upvote_count))
    else:  # recent
        query = query.order_by(desc(Answer.is_accepted), desc(Answer.created_at))
    
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    answers = result.scalars().all()
    
    return answers


@router.put("/answers/{answer_id}", response_model=AnswerResponse)
async def update_answer(
    answer_id: UUID,
    request: UpdateAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an answer (author only)"""
    from app.db.models.social import Answer
    
    result = await db.execute(
        select(Answer).where(
            and_(
                Answer.id == answer_id,
                Answer.user_id == current_user.id
            )
        )
    )
    answer = result.scalar_one_or_none()
    
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found or not authorized"
        )
    
    answer.body = request.body
    answer.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(answer)
    
    return answer


@router.delete("/answers/{answer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_answer(
    answer_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete an answer (author only)"""
    from app.db.models.social import Answer, Question
    
    result = await db.execute(
        select(Answer).where(
            and_(
                Answer.id == answer_id,
                Answer.user_id == current_user.id
            )
        )
    )
    answer = result.scalar_one_or_none()
    
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found or not authorized"
        )
    
    question_id = answer.question_id
    
    # Delete answer
    await db.delete(answer)
    
    # Decrement answer count
    result = await db.execute(
        select(Question).where(Question.id == question_id)
    )
    question = result.scalar_one_or_none()
    if question and question.answer_count > 0:
        question.answer_count -= 1
    
    await db.commit()


@router.post("/answers/{answer_id}/accept", response_model=AnswerResponse)
async def accept_answer(
    answer_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Accept an answer (question author only)"""
    from app.db.models.social import Answer, Question
    
    # Get answer
    result = await db.execute(
        select(Answer).where(Answer.id == answer_id)
    )
    answer = result.scalar_one_or_none()
    
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found"
        )
    
    # Check if current user is question author
    result = await db.execute(
        select(Question).where(
            and_(
                Question.id == answer.question_id,
                Question.user_id == current_user.id
            )
        )
    )
    question = result.scalar_one_or_none()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only question author can accept answers"
        )
    
    # Unaccept any previously accepted answer
    result = await db.execute(
        select(Answer).where(
            and_(
                Answer.question_id == answer.question_id,
                Answer.is_accepted == True
            )
        )
    )
    previous_accepted = result.scalar_one_or_none()
    if previous_accepted:
        previous_accepted.is_accepted = False
    
    # Accept this answer
    answer.is_accepted = True
    question.has_accepted_answer = True
    
    await db.commit()
    await db.refresh(answer)
    
    return answer


@router.post("/answers/{answer_id}/upvote", status_code=status.HTTP_201_CREATED)
async def upvote_answer(
    answer_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upvote an answer"""
    from app.db.models.social import Answer, AnswerUpvote
    
    # Check if answer exists
    result = await db.execute(
        select(Answer).where(Answer.id == answer_id)
    )
    answer = result.scalar_one_or_none()
    
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found"
        )
    
    # Check if already upvoted
    result = await db.execute(
        select(AnswerUpvote).where(
            and_(
                AnswerUpvote.answer_id == answer_id,
                AnswerUpvote.user_id == current_user.id
            )
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Answer already upvoted"
        )
    
    # Create upvote
    upvote = AnswerUpvote(
        answer_id=answer_id,
        user_id=current_user.id
    )
    db.add(upvote)
    
    # Increment upvote count
    answer.upvote_count += 1
    
    await db.commit()
    
    return {"message": "Answer upvoted successfully"}


@router.delete("/answers/{answer_id}/upvote", status_code=status.HTTP_204_NO_CONTENT)
async def remove_answer_upvote(
    answer_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove upvote from an answer"""
    from app.db.models.social import Answer, AnswerUpvote
    
    # Get upvote
    result = await db.execute(
        select(AnswerUpvote).where(
            and_(
                AnswerUpvote.answer_id == answer_id,
                AnswerUpvote.user_id == current_user.id
            )
        )
    )
    upvote = result.scalar_one_or_none()
    
    if not upvote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upvote not found"
        )
    
    # Delete upvote
    await db.delete(upvote)
    
    # Decrement upvote count
    result = await db.execute(
        select(Answer).where(Answer.id == answer_id)
    )
    answer = result.scalar_one_or_none()
    if answer and answer.upvote_count > 0:
        answer.upvote_count -= 1
    
    await db.commit()


@router.get("/my/questions", response_model=List[QuestionResponse])
async def get_my_questions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's questions"""
    from app.db.models.social import Question
    
    result = await db.execute(
        select(Question)
        .where(Question.user_id == current_user.id)
        .order_by(desc(Question.created_at))
    )
    questions = result.scalars().all()
    
    return questions


@router.get("/my/answers", response_model=List[AnswerResponse])
async def get_my_answers(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's answers"""
    from app.db.models.social import Answer
    
    result = await db.execute(
        select(Answer)
        .where(Answer.user_id == current_user.id)
        .order_by(desc(Answer.created_at))
    )
    answers = result.scalars().all()
    
    return answers
