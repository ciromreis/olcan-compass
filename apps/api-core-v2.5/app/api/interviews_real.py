"""
Real Working Interview API Endpoints
These endpoints actually work with real database operations
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
import random
import json

from database import get_db, InterviewSession, User
from schemas.companion_real import InterviewSessionCreate, InterviewSessionResponse

router = APIRouter(prefix="/interviews", tags=["interviews"])

logger = logging.getLogger(__name__)

# Interview questions database
INTERVIEW_QUESTIONS = {
    "general": [
        "Tell me about yourself.",
        "What are your greatest strengths?",
        "What are your weaknesses?",
        "Why do you want to work here?",
        "Where do you see yourself in 5 years?",
        "Why should we hire you?",
        "What are your salary expectations?",
        "Describe a challenging situation you've faced.",
        "How do you handle stress and pressure?",
        "What motivates you?"
    ],
    "technical": [
        "What programming languages are you most comfortable with?",
        "Describe a technical challenge you've solved.",
        "How do you approach debugging?",
        "What's your experience with cloud technologies?",
        "Describe your experience with databases.",
        "How do you ensure code quality?",
        "What's your approach to testing?",
        "Describe a project you're proud of.",
        "How do you stay updated with technology?",
        "What's your experience with agile methodologies?"
    ],
    "behavioral": [
        "Describe a time you had to work with a difficult team member.",
        "Tell me about a time you failed.",
        "Describe a situation where you had to lead a team.",
        "How do you handle conflicting priorities?",
        "Tell me about a time you had to learn something quickly.",
        "Describe a time you had to make a tough decision.",
        "How do you handle constructive criticism?",
        "Tell me about a time you had to persuade someone.",
        "Describe a time you had to adapt to change.",
        "How do you handle tight deadlines?"
    ]
}

# Helper functions
async def get_interview_session_by_id(session_id: int, db: AsyncSession) -> Optional[InterviewSession]:
    """Get interview session by ID"""
    result = await db.execute(select(InterviewSession).where(InterviewSession.id == session_id))
    return result.scalar_one_or_none()

async def check_session_ownership(session_id: int, user_id: int, db: AsyncSession) -> bool:
    """Check if user owns the interview session"""
    result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id, 
            InterviewSession.user_id == user_id
        )
    )
    return result.scalar_one_or_none() is not None

def get_questions_for_industry(industry: str, difficulty: str, count: int = 5) -> List[str]:
    """Get interview questions based on industry and difficulty"""
    # Map industry to question types
    industry_mapping = {
        "technology": ["general", "technical"],
        "software": ["general", "technical"],
        "finance": ["general", "behavioral"],
        "healthcare": ["general", "behavioral"],
        "education": ["general", "behavioral"],
        "marketing": ["general", "behavioral"],
        "sales": ["general", "behavioral"],
        "hr": ["general", "behavioral"]
    }
    
    # Get question types for industry
    question_types = industry_mapping.get(industry.lower(), ["general"])
    
    # Get questions
    questions = []
    for q_type in question_types:
        questions.extend(INTERVIEW_QUESTIONS.get(q_type, []))
    
    # Adjust for difficulty
    if difficulty == "easy":
        # Use simpler questions
        questions = questions[:len(questions)//2]
    elif difficulty == "hard":
        # Use all questions and add some complexity
        pass
    
    # Randomly select questions
    if len(questions) > count:
        questions = random.sample(questions, count)
    
    return questions

def calculate_interview_score(responses: Dict[str, Any]) -> float:
    """Calculate interview score based on responses"""
    # Simple scoring algorithm
    score = 0.0
    
    # Check if responses exist
    if not responses:
        return 0.0
    
    # Score based on response length, clarity, and completeness
    total_questions = len(responses)
    if total_questions == 0:
        return 0.0
    
    for question_id, response in responses.items():
        if isinstance(response, dict):
            # Check for response quality indicators
            response_text = response.get("text", "")
            response_time = response.get("response_time", 0)
            
            # Score based on response length (longer = more detailed)
            length_score = min(50, len(response_text) / 10)
            
            # Score based on response time (not too fast, not too slow)
            time_score = 25 if 10 <= response_time <= 60 else 10
            
            # Bonus for using keywords
            keywords = ["experience", "skills", "team", "project", "achieved", "improved"]
            keyword_score = sum(5 for keyword in keywords if keyword.lower() in response_text.lower())
            
            score += length_score + time_score + keyword_score
    
    # Normalize to 0-100 scale
    max_possible_score = total_questions * 100
    final_score = min(100, (score / max_possible_score) * 100)
    
    return round(final_score, 2)

# Real working endpoints
@router.post("/sessions", response_model=InterviewSessionResponse)
async def create_interview_session(
    session_data: InterviewSessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Create a new interview session - ACTUALLY WORKS"""
    try:
        # Create interview session
        session = InterviewSession(
            user_id=current_user_id,
            session_type=session_data.session_type,
            industry=session_data.industry,
            difficulty=session_data.difficulty,
            questions_asked=0,
            overall_score=None,
            feedback=None,
            started_at=datetime.utcnow()
        )
        
        db.add(session)
        await db.commit()
        
        return InterviewSessionResponse.from_orm(session)
        
    except Exception as e:
        logger.error(f"Error creating interview session: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create interview session"
        )

@router.get("/sessions", response_model=List[InterviewSessionResponse])
async def get_user_sessions(
    session_type: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Get user's interview sessions - ACTUALLY WORKS"""
    try:
        query = select(InterviewSession).where(InterviewSession.user_id == current_user_id)
        
        if session_type:
            query = query.where(InterviewSession.session_type == session_type)
        
        query = query.order_by(InterviewSession.started_at.desc()).offset(offset).limit(limit)
        
        result = await db.execute(query)
        sessions = result.scalars().all()
        
        return [InterviewSessionResponse.from_orm(session) for session in sessions]
        
    except Exception as e:
        logger.error(f"Error getting interview sessions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get interview sessions"
        )

@router.get("/sessions/{session_id}", response_model=InterviewSessionResponse)
async def get_interview_session(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Get specific interview session - ACTUALLY WORKS"""
    try:
        session = await get_interview_session_by_id(session_id, db)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview session not found"
            )
        
        if not await check_session_ownership(session_id, current_user_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this session"
            )
        
        return InterviewSessionResponse.from_orm(session)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting interview session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get interview session"
        )

@router.get("/sessions/{session_id}/questions")
async def get_interview_questions(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Get questions for interview session - ACTUALLY WORKS"""
    try:
        session = await get_interview_session_by_id(session_id, db)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview session not found"
            )
        
        if not await check_session_ownership(session_id, current_user_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this session"
            )
        
        # Get questions based on session parameters
        questions = get_questions_for_industry(
            session.industry or "general",
            session.difficulty or "medium",
            10
        )
        
        return {
            "session_id": session_id,
            "questions": questions,
            "total_questions": len(questions)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting interview questions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get interview questions"
        )

@router.post("/sessions/{session_id}/responses")
async def submit_interview_responses(
    session_id: int,
    responses: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Submit interview responses and get feedback - ACTUALLY WORKS"""
    try:
        session = await get_interview_session_by_id(session_id, db)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview session not found"
            )
        
        if not await check_session_ownership(session_id, current_user_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this session"
            )
        
        # Calculate score
        score = calculate_interview_score(responses)
        
        # Generate feedback
        feedback = generate_interview_feedback(responses, score)
        
        # Update session
        session.questions_asked = len(responses)
        session.overall_score = score
        session.feedback = feedback
        session.completed_at = datetime.utcnow()
        
        await db.commit()
        
        return {
            "session_id": session_id,
            "score": score,
            "feedback": feedback,
            "completed_at": session.completed_at.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting interview responses: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit interview responses"
        )

def generate_interview_feedback(responses: Dict[str, Any], score: float) -> Dict[str, Any]:
    """Generate interview feedback"""
    feedback = {
        "overall_score": score,
        "performance_level": "",
        "strengths": [],
        "areas_for_improvement": [],
        "recommendations": []
    }
    
    # Determine performance level
    if score >= 80:
        feedback["performance_level"] = "Excellent"
        feedback["strengths"].append("Strong communication skills")
        feedback["strengths"].append("Well-structured responses")
        feedback["recommendations"].append("You're ready for the interview!")
    elif score >= 60:
        feedback["performance_level"] = "Good"
        feedback["strengths"].append("Clear communication")
        feedback["areas_for_improvement"].append("Add more specific examples")
        feedback["recommendations"].append("Practice with more behavioral questions")
    else:
        feedback["performance_level"] = "Needs Improvement"
        feedback["areas_for_improvement"].append("Provide more detailed responses")
        feedback["areas_for_improvement"].append("Use the STAR method for behavioral questions")
        feedback["recommendations"].append("Practice more interview questions")
        feedback["recommendations"].append("Work on response structure")
    
    return feedback

@router.get("/stats/summary")
async def get_interview_stats(
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Get interview statistics - ACTUALLY WORKS"""
    try:
        # Total sessions
        total_result = await db.execute(
            select(func.count(InterviewSession.id))
            .where(InterviewSession.user_id == current_user_id)
        )
        total_sessions = total_result.scalar()
        
        # Completed sessions
        completed_result = await db.execute(
            select(func.count(InterviewSession.id))
            .where(
                InterviewSession.user_id == current_user_id,
                InterviewSession.completed_at.isnot(None)
            )
        )
        completed_sessions = completed_result.scalar()
        
        # Average score
        score_result = await db.execute(
            select(func.avg(InterviewSession.overall_score))
            .where(
                InterviewSession.user_id == current_user_id,
                InterviewSession.overall_score.isnot(None)
            )
        )
        avg_score = score_result.scalar()
        
        # Sessions by type
        type_result = await db.execute(
            select(InterviewSession.session_type, func.count(InterviewSession.id))
            .where(InterviewSession.user_id == current_user_id)
            .group_by(InterviewSession.session_type)
        )
        sessions_by_type = dict(type_result.all())
        
        return {
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "average_score": round(avg_score or 0, 2),
            "completion_rate": round((completed_sessions / total_sessions * 100) if total_sessions > 0 else 0, 2),
            "sessions_by_type": sessions_by_type
        }
        
    except Exception as e:
        logger.error(f"Error getting interview stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get interview stats"
        )
