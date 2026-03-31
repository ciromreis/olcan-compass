"""
Interview Service

Business logic for interview practice sessions with AI feedback.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
import random

from ..models.interview import (
    Interview,
    InterviewQuestion,
    InterviewTemplate,
    InterviewType,
    InterviewDifficulty,
    InterviewStatus
)
from ..models.companion import Companion


class InterviewService:
    """Service for managing interview practice sessions"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_interview(
        self,
        user_id: str,
        title: str,
        interview_type: InterviewType,
        difficulty: InterviewDifficulty,
        template_id: Optional[str] = None,
        companion_id: Optional[str] = None,
        target_company: Optional[str] = None,
        target_role: Optional[str] = None
    ) -> Interview:
        """Create a new interview practice session"""
        
        # Get questions from template or generate custom set
        questions = []
        if template_id:
            template = self.db.query(InterviewTemplate).filter(
                InterviewTemplate.id == template_id
            ).first()
            
            if template:
                # Get questions from template
                question_records = self.db.query(InterviewQuestion).filter(
                    InterviewQuestion.id.in_(template.question_ids)
                ).all()
                
                questions = [
                    {
                        "id": q.id,
                        "text": q.question_text,
                        "context": q.context,
                        "evaluation_criteria": q.evaluation_criteria
                    }
                    for q in question_records
                ]
                
                template.usage_count += 1
        else:
            # Generate custom question set
            questions = self._generate_question_set(interview_type, difficulty)
        
        # Create interview
        interview = Interview(
            id=str(uuid.uuid4()),
            user_id=user_id,
            companion_id=companion_id,
            title=title,
            interview_type=interview_type,
            difficulty=difficulty,
            status=InterviewStatus.SCHEDULED,
            target_company=target_company,
            target_role=target_role,
            questions=questions,
            responses=[]
        )
        
        self.db.add(interview)
        self.db.commit()
        self.db.refresh(interview)
        
        return interview
    
    def start_interview(self, interview_id: str, user_id: str) -> Interview:
        """Start an interview session"""
        
        interview = self.db.query(Interview).filter(
            Interview.id == interview_id,
            Interview.user_id == user_id
        ).first()
        
        if not interview:
            raise ValueError("Interview not found")
        
        if interview.status != InterviewStatus.SCHEDULED:
            raise ValueError("Interview already started or completed")
        
        interview.status = InterviewStatus.IN_PROGRESS
        interview.started_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(interview)
        
        return interview
    
    def submit_response(
        self,
        interview_id: str,
        user_id: str,
        question_id: str,
        response_text: str,
        response_metadata: Optional[Dict[str, Any]] = None
    ) -> Interview:
        """Submit a response to an interview question"""
        
        interview = self.db.query(Interview).filter(
            Interview.id == interview_id,
            Interview.user_id == user_id
        ).first()
        
        if not interview:
            raise ValueError("Interview not found")
        
        if interview.status != InterviewStatus.IN_PROGRESS:
            raise ValueError("Interview not in progress")
        
        # Add response
        responses = interview.responses or []
        responses.append({
            "question_id": question_id,
            "response_text": response_text,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": response_metadata or {}
        })
        
        interview.responses = responses
        interview.questions_answered = len(responses)
        
        self.db.commit()
        self.db.refresh(interview)
        
        return interview
    
    def complete_interview(
        self,
        interview_id: str,
        user_id: str
    ) -> Interview:
        """Complete interview and generate AI feedback"""
        
        interview = self.db.query(Interview).filter(
            Interview.id == interview_id,
            Interview.user_id == user_id
        ).first()
        
        if not interview:
            raise ValueError("Interview not found")
        
        if interview.status != InterviewStatus.IN_PROGRESS:
            raise ValueError("Interview not in progress")
        
        # Calculate duration
        if interview.started_at:
            duration = (datetime.utcnow() - interview.started_at).total_seconds() / 60
            interview.duration_minutes = int(duration)
        
        # Generate AI feedback
        feedback = self._generate_ai_feedback(interview)
        
        interview.status = InterviewStatus.COMPLETED
        interview.completed_at = datetime.utcnow()
        interview.overall_score = feedback['overall_score']
        interview.feedback_summary = feedback['summary']
        interview.strengths = feedback['strengths']
        interview.areas_for_improvement = feedback['improvements']
        interview.confidence_score = feedback['confidence_score']
        interview.communication_score = feedback['communication_score']
        interview.technical_accuracy_score = feedback.get('technical_accuracy_score')
        
        self.db.commit()
        self.db.refresh(interview)
        
        return interview
    
    def get_user_interviews(
        self,
        user_id: str,
        interview_type: Optional[InterviewType] = None,
        status: Optional[InterviewStatus] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Interview]:
        """Get user's interview sessions"""
        
        query = self.db.query(Interview).filter(Interview.user_id == user_id)
        
        if interview_type:
            query = query.filter(Interview.interview_type == interview_type)
        
        if status:
            query = query.filter(Interview.status == status)
        
        interviews = query.order_by(Interview.created_at.desc()).offset(offset).limit(limit).all()
        
        return interviews
    
    def get_interview(self, interview_id: str, user_id: str) -> Optional[Interview]:
        """Get a specific interview"""
        
        return self.db.query(Interview).filter(
            Interview.id == interview_id,
            Interview.user_id == user_id
        ).first()
    
    def get_templates(
        self,
        interview_type: Optional[InterviewType] = None,
        difficulty: Optional[InterviewDifficulty] = None
    ) -> List[InterviewTemplate]:
        """Get available interview templates"""
        
        query = self.db.query(InterviewTemplate)
        
        if interview_type:
            query = query.filter(InterviewTemplate.interview_type == interview_type)
        
        if difficulty:
            query = query.filter(InterviewTemplate.difficulty == difficulty)
        
        templates = query.order_by(InterviewTemplate.usage_count.desc()).all()
        
        return templates
    
    def _generate_question_set(
        self,
        interview_type: InterviewType,
        difficulty: InterviewDifficulty,
        count: int = 5
    ) -> List[Dict[str, Any]]:
        """Generate a custom set of interview questions"""
        
        # Query available questions
        questions = self.db.query(InterviewQuestion).filter(
            InterviewQuestion.interview_type == interview_type,
            InterviewQuestion.difficulty == difficulty
        ).all()
        
        if not questions:
            # Return default questions if none in DB
            return self._get_default_questions(interview_type, difficulty, count)
        
        # Randomly select questions
        selected = random.sample(questions, min(count, len(questions)))
        
        return [
            {
                "id": q.id,
                "text": q.question_text,
                "context": q.context,
                "evaluation_criteria": q.evaluation_criteria
            }
            for q in selected
        ]
    
    def _get_default_questions(
        self,
        interview_type: InterviewType,
        difficulty: InterviewDifficulty,
        count: int
    ) -> List[Dict[str, Any]]:
        """Get default questions when DB is empty"""
        
        default_questions = {
            InterviewType.BEHAVIORAL: [
                {
                    "id": "default-behavioral-1",
                    "text": "Tell me about a time when you faced a significant challenge at work. How did you handle it?",
                    "context": "This question assesses problem-solving and resilience.",
                    "evaluation_criteria": ["Specific example", "Clear outcome", "Lessons learned"]
                },
                {
                    "id": "default-behavioral-2",
                    "text": "Describe a situation where you had to work with a difficult team member.",
                    "context": "This evaluates interpersonal skills and conflict resolution.",
                    "evaluation_criteria": ["Empathy", "Communication", "Resolution"]
                }
            ],
            InterviewType.TECHNICAL: [
                {
                    "id": "default-technical-1",
                    "text": "Explain the difference between synchronous and asynchronous programming.",
                    "context": "Fundamental programming concept.",
                    "evaluation_criteria": ["Clear explanation", "Examples", "Use cases"]
                },
                {
                    "id": "default-technical-2",
                    "text": "How would you optimize a slow database query?",
                    "context": "Database performance optimization.",
                    "evaluation_criteria": ["Multiple approaches", "Trade-offs", "Best practices"]
                }
            ]
        }
        
        questions = default_questions.get(interview_type, [])
        return questions[:count]
    
    def _generate_ai_feedback(self, interview: Interview) -> Dict[str, Any]:
        """Generate AI-powered feedback (placeholder)"""
        
        # This would integrate with actual AI service
        # For now, return structured placeholder data
        
        responses_count = len(interview.responses or [])
        questions_count = len(interview.questions or [])
        completion_rate = (responses_count / questions_count * 100) if questions_count > 0 else 0
        
        # Base score on completion and mock analysis
        base_score = int(completion_rate * 0.7)
        
        return {
            "overall_score": min(base_score + random.randint(10, 20), 100),
            "summary": f"You completed {responses_count} out of {questions_count} questions. Your responses showed good understanding of the concepts.",
            "strengths": [
                "Clear and structured responses",
                "Good use of specific examples",
                "Strong communication skills"
            ],
            "improvements": [
                "Provide more quantifiable results",
                "Expand on technical details",
                "Practice conciseness in longer answers"
            ],
            "confidence_score": 0.75,
            "communication_score": 0.80,
            "technical_accuracy_score": 0.70 if interview.interview_type in [InterviewType.TECHNICAL, InterviewType.CODING] else None
        }
