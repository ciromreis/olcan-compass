"""Recruitment Models - Job Routes, Documents, ATS Optimization

Integrated with Resume-Matcher for ATS optimization and document generation.
"""

import uuid
import enum
from datetime import datetime, timezone, date
from typing import Optional

from sqlalchemy import DateTime, String, Text, ForeignKey, JSON, Enum, Integer, Boolean, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class JobRouteStatus(str, enum.Enum):
    """Job application route status"""
    DRAFT = "draft"  # Being prepared
    ACTIVE = "active"  # Actively working on
    READY = "ready"  # Ready to submit
    APPLIED = "applied"  # Application submitted
    INTERVIEWING = "interviewing"  # In interview process
    OFFER = "offer"  # Offer received
    ACCEPTED = "accepted"  # Offer accepted
    REJECTED = "rejected"  # Application rejected
    WITHDRAWN = "withdrawn"  # User withdrew


class JobType(str, enum.Enum):
    """Job type"""
    REMOTE = "remote"
    HYBRID = "hybrid"
    ONSITE = "onsite"


class DocumentType(str, enum.Enum):
    """Application document type"""
    MASTER_RESUME = "master_resume"
    TAILORED_RESUME = "tailored_resume"
    COVER_LETTER = "cover_letter"
    SOP = "sop"  # Statement of Purpose
    PORTFOLIO = "portfolio"
    REFERENCES = "references"
    TRANSCRIPT = "transcript"
    CERTIFICATIONS = "certifications"


class InterviewType(str, enum.Enum):
    """Interview type"""
    PHONE_SCREEN = "phone_screen"
    VIDEO = "video"
    ONSITE = "onsite"
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    CASE_STUDY = "case_study"
    PANEL = "panel"
    FINAL = "final"


class ApplicationMethod(str, enum.Enum):
    """How application was submitted"""
    ONLINE_PORTAL = "online_portal"
    EMAIL = "email"
    REFERRAL = "referral"
    RECRUITER = "recruiter"
    LINKEDIN = "linkedin"
    OTHER = "other"


class JobRoute(Base):
    """Job application route with integrated ATS optimization"""
    __tablename__ = "job_routes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Job Details
    job_title: Mapped[str] = mapped_column(String(300), nullable=False)
    company_name: Mapped[str] = mapped_column(String(200), nullable=False)
    company_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    job_description: Mapped[str] = mapped_column(Text, nullable=False)  # Full JD text
    job_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    location: Mapped[str] = mapped_column(String(200), nullable=False)
    job_type: Mapped[JobType] = mapped_column(
        Enum(JobType, values_callable=lambda x: [e.value for e in x]),
        default=JobType.REMOTE,
        nullable=False
    )
    salary_range: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    # ATS Analysis (JSON)
    ats_analysis: Mapped[dict] = mapped_column(JSON, default=dict)
    # Structure:
    # {
    #     "keywords": ["python", "fastapi", "react"],
    #     "required_skills": ["Python", "FastAPI", "PostgreSQL"],
    #     "preferred_skills": ["Docker", "AWS", "CI/CD"],
    #     "experience_level": "mid-senior",
    #     "education_requirements": ["Bachelor's in CS"],
    #     "certifications": ["AWS Certified"],
    #     "match_score": 85,
    #     "missing_keywords": ["kubernetes"],
    #     "suggestions": ["Add kubernetes experience"],
    #     "industry": "technology",
    #     "role_type": "backend_engineer"
    # }
    
    # Route Configuration
    route_type: Mapped[str] = mapped_column(String(50), default="job_application", nullable=False)
    status: Mapped[JobRouteStatus] = mapped_column(
        Enum(JobRouteStatus, values_callable=lambda x: [e.value for e in x]),
        default=JobRouteStatus.DRAFT,
        nullable=False,
        index=True
    )
    priority: Mapped[str] = mapped_column(String(20), default="medium", nullable=False)  # high, medium, low
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)  # Application deadline
    
    # Documents (References to RecruitmentDocument)
    master_resume_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("recruitment_documents.id", ondelete="SET NULL"), nullable=True)
    tailored_resume_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("recruitment_documents.id", ondelete="SET NULL"), nullable=True)
    cover_letter_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("recruitment_documents.id", ondelete="SET NULL"), nullable=True)
    sop_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("recruitment_documents.id", ondelete="SET NULL"), nullable=True)
    
    # Progress Tracking
    milestones: Mapped[list] = mapped_column(JSON, default=list)
    # Structure: [{"order": 1, "title": "...", "description": "...", "completed": false, "tasks": [...]}]
    current_milestone: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completion_percentage: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Application Tracking
    applied_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    application_method: Mapped[ApplicationMethod | None] = mapped_column(
        Enum(ApplicationMethod, values_callable=lambda x: [e.value for e in x]),
        nullable=True
    )
    confirmation_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    # Contact Information
    contact_person: Mapped[str | None] = mapped_column(String(200), nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(200), nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    recruiter_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    recruiter_email: Mapped[str | None] = mapped_column(String(200), nullable=True)
    
    # Interview Tracking
    interviews: Mapped[list] = mapped_column(JSON, default=list)
    # Structure: [{
    #     "type": "phone_screen",
    #     "date": "2026-04-20T10:00:00Z",
    #     "interviewer": "John Doe",
    #     "interviewer_title": "Engineering Manager",
    #     "location": "Zoom",
    #     "notes": "...",
    #     "outcome": "passed",
    #     "feedback": "..."
    # }]
    
    # Outcome
    outcome: Mapped[str | None] = mapped_column(String(50), nullable=True)  # offer, rejected, withdrawn
    outcome_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    outcome_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    offer_details: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    # Structure: {"salary": "...", "benefits": [...], "start_date": "...", "equity": "..."}
    
    # Follow-up
    follow_up_tasks: Mapped[list] = mapped_column(JSON, default=list)
    # Structure: [{"task": "Send thank you email", "due_date": "...", "completed": false}]
    
    # Metadata
    tags: Mapped[list] = mapped_column(JSON, default=list)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="job_routes")


class RecruitmentDocument(Base):
    """Documents for job applications with ATS optimization"""
    __tablename__ = "recruitment_documents"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_route_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("job_routes.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # Document Details
    document_type: Mapped[DocumentType] = mapped_column(
        Enum(DocumentType, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        index=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    
    # Content (Structured JSON)
    content: Mapped[dict] = mapped_column(JSON, default=dict)
    # Structure varies by document_type:
    # Resume: {
    #     "personal_info": {...},
    #     "summary": "...",
    #     "experience": [...],
    #     "education": [...],
    #     "skills": [...],
    #     "certifications": [...],
    #     "projects": [...],
    #     "languages": [...]
    # }
    # Cover Letter: {
    #     "greeting": "...",
    #     "introduction": "...",
    #     "body_paragraphs": [...],
    #     "conclusion": "...",
    #     "signature": "..."
    # }
    
    # ATS Optimization
    ats_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)  # 0-100
    keyword_match: Mapped[dict] = mapped_column(JSON, default=dict)
    # Structure: {
    #     "matched_keywords": ["python", "fastapi"],
    #     "missing_keywords": ["kubernetes"],
    #     "keyword_density": {"python": 5, "fastapi": 3},
    #     "match_percentage": 85
    # }
    optimization_suggestions: Mapped[list] = mapped_column(JSON, default=list)
    # Structure: [
    #     {"type": "keyword", "suggestion": "Add 'kubernetes' to skills", "priority": "high"},
    #     {"type": "achievement", "suggestion": "Quantify impact with metrics", "priority": "medium"}
    # ]
    
    # Versions
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_master: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)  # For master resume
    parent_document_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("recruitment_documents.id", ondelete="SET NULL"), nullable=True)
    
    # Export
    pdf_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    docx_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    template_used: Mapped[str] = mapped_column(String(100), default="modern_single_column", nullable=False)
    # Templates: classic_single_column, modern_single_column, classic_two_column, modern_two_column
    
    # AI Generation Metadata
    ai_generated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    ai_model_used: Mapped[str | None] = mapped_column(String(100), nullable=True)
    generation_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Metadata
    file_size: Mapped[int | None] = mapped_column(Integer, nullable=True)  # In bytes
    word_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="recruitment_documents")


class RecruitmentActivity(Base):
    """Track recruitment-related activities for gamification"""
    __tablename__ = "recruitment_activities"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_route_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("job_routes.id", ondelete="CASCADE"), nullable=True)
    
    # Activity Details
    activity_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    # Types: master_resume_created, resume_tailored, cover_letter_generated,
    #        application_submitted, interview_scheduled, offer_received, etc.
    
    activity_data: Mapped[dict] = mapped_column(JSON, default=dict)
    # Additional context about the activity
    
    # Gamification
    xp_earned: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    achievements_unlocked: Mapped[list] = mapped_column(JSON, default=list)
    quests_updated: Mapped[list] = mapped_column(JSON, default=list)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="recruitment_activities")


class RecruitmentProgress(Base):
    """Track user's overall recruitment progress"""
    __tablename__ = "recruitment_progress"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Statistics
    master_resumes_created: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    resumes_tailored: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    cover_letters_generated: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    sops_generated: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    applications_submitted: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    interviews_scheduled: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    interviews_completed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    offers_received: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    offers_accepted: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # ATS Scores
    highest_ats_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    average_ats_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    ats_score_80_plus_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Success Metrics
    application_to_interview_rate: Mapped[float] = mapped_column(Integer, default=0.0, nullable=False)
    interview_to_offer_rate: Mapped[float] = mapped_column(Integer, default=0.0, nullable=False)
    
    # Streaks
    current_application_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    best_application_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_application_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
