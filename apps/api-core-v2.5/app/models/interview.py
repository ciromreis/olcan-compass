"""
Interview Models

Represents interview practice sessions with AI-powered feedback.
"""

from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, Enum as SQLEnum, JSON, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

try:
    from app.core.database import Base
except ImportError:
    from sqlalchemy.ext.declarative import declarative_base
    Base = declarative_base()


class InterviewType(str, enum.Enum):
    """Types of interview practice"""
    BEHAVIORAL = "behavioral"
    TECHNICAL = "technical"
    CASE_STUDY = "case_study"
    SYSTEM_DESIGN = "system_design"
    CODING = "coding"
    CULTURAL_FIT = "cultural_fit"


class InterviewDifficulty(str, enum.Enum):
    """Interview difficulty levels"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class InterviewStatus(str, enum.Enum):
    """Interview session status"""
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class Interview(Base):
    """Interview practice session"""
    __tablename__ = "interviews"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    companion_id = Column(String, ForeignKey("companions.id"), nullable=True)
    
    # Interview metadata
    title = Column(String, nullable=False)
    interview_type = Column(SQLEnum(InterviewType), nullable=False)
    difficulty = Column(SQLEnum(InterviewDifficulty), default=InterviewDifficulty.INTERMEDIATE)
    status = Column(SQLEnum(InterviewStatus), default=InterviewStatus.SCHEDULED)
    
    # Target company/role (optional)
    target_company = Column(String, nullable=True)
    target_role = Column(String, nullable=True)
    
    # Session data
    questions = Column(JSON, nullable=False)  # List of question objects
    responses = Column(JSON, nullable=True)  # User responses
    
    # AI feedback
    overall_score = Column(Integer, nullable=True)  # 0-100
    feedback_summary = Column(Text, nullable=True)
    strengths = Column(JSON, nullable=True)
    areas_for_improvement = Column(JSON, nullable=True)
    
    # Performance metrics
    duration_minutes = Column(Integer, nullable=True)
    questions_answered = Column(Integer, default=0)
    confidence_score = Column(Float, nullable=True)  # 0.0-1.0
    communication_score = Column(Float, nullable=True)  # 0.0-1.0
    technical_accuracy_score = Column(Float, nullable=True)  # 0.0-1.0
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="interviews")
    companion = relationship("Companion", back_populates="interviews")


class InterviewQuestion(Base):
    """Pre-defined interview questions"""
    __tablename__ = "interview_questions"

    id = Column(String, primary_key=True)
    interview_type = Column(SQLEnum(InterviewType), nullable=False)
    difficulty = Column(SQLEnum(InterviewDifficulty), nullable=False)
    
    # Question content
    question_text = Column(Text, nullable=False)
    context = Column(Text, nullable=True)  # Additional context or scenario
    
    # Metadata
    industry_tags = Column(JSON, nullable=True)  # ["tech", "finance", etc.]
    skill_tags = Column(JSON, nullable=True)  # ["leadership", "problem-solving", etc.]
    
    # Evaluation criteria
    evaluation_criteria = Column(JSON, nullable=True)  # What to look for in answers
    sample_answer = Column(Text, nullable=True)  # Example of good answer
    
    # Usage stats
    usage_count = Column(Integer, default=0)
    average_score = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class InterviewTemplate(Base):
    """Pre-configured interview templates"""
    __tablename__ = "interview_templates"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    interview_type = Column(SQLEnum(InterviewType), nullable=False)
    difficulty = Column(SQLEnum(InterviewDifficulty), nullable=False)
    
    # Template configuration
    question_ids = Column(JSON, nullable=False)  # List of question IDs
    estimated_duration_minutes = Column(Integer, nullable=False)
    
    # Metadata
    is_premium = Column(Integer, default=0)
    industry_tags = Column(JSON, nullable=True)
    
    # Usage stats
    usage_count = Column(Integer, default=0)
    average_completion_rate = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
