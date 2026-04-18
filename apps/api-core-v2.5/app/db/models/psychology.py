import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, String, Boolean, Integer, Float, Text, ForeignKey, JSON, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class PsychQuestionType(str, enum.Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    SCALE = "scale"
    TEXT = "text"
    BINARY = "binary"


class PsychCategory(str, enum.Enum):
    CONFIDENCE = "confidence"
    ANXIETY = "anxiety"
    DISCIPLINE = "discipline"
    RISK_TOLERANCE = "risk_tolerance"
    NARRATIVE_CLARITY = "narrative_clarity"
    INTERVIEW_ANXIETY = "interview_anxiety"
    DECISION_STYLE = "decision_style"
    CULTURAL_ADAPTABILITY = "cultural_adaptability"
    FINANCIAL_RESILIENCE = "financial_resilience"
    COMMUNICATION_STYLE = "communication_style"


class ProfessionalArchetype(str, enum.Enum):
    """12 Professional Archetypes - Olcan Matrix (public-facing names)
    
    Internal OIOS framework mapping (for reference only):
    - individual_sovereignty: Soberania Individual (was: institutional_escapee)
    - academic_elite: Elite Acadêmica (was: scholarship_cartographer)
    - career_mastery: Maestria de Carreira (was: career_pivot)
    - global_presence: Presença Global (was: global_nomad)
    - frontier_architect: Arquiteto de Fronteira (was: technical_bridge_builder)
    - verified_talent: Talento Validado (was: insecure_corporate_dev)
    - future_guardian: Guardiã do Futuro (was: exhausted_solo_mother)
    - change_agent: Agente de Mudança (was: trapped_public_servant)
    - knowledge_node: Nó de Conhecimento (was: academic_hermit)
    - conscious_leader: Liderança Consciente (was: executive_refugee)
    - cultural_protagonist: Protagonista Cultural (was: creative_visionary)
    - destiny_arbitrator: Arbitrador de Destino (was: lifestyle_optimizer)
    """
    INDIVIDUAL_SOVEREIGNTY = "individual_sovereignty"
    ACADEMIC_ELITE = "academic_elite"
    CAREER_MASTERY = "career_mastery"
    GLOBAL_PRESENCE = "global_presence"
    FRONTIER_ARCHITECT = "frontier_architect"
    VERIFIED_TALENT = "verified_talent"
    FUTURE_GUARDIAN = "future_guardian"
    CHANGE_AGENT = "change_agent"
    KNOWLEDGE_NODE = "knowledge_node"
    CONSCIOUS_LEADER = "conscious_leader"
    CULTURAL_PROTAGONIST = "cultural_protagonist"
    DESTINY_ARBITRATOR = "destiny_arbitrator"


class FearCluster(str, enum.Enum):
    """4 motivational fear axes — values must match Alembic migration 91e881fee226."""
    FREEDOM = "freedom"
    SUCCESS = "success"
    STABILITY = "stability"
    VALIDATION = "validation"


class PsychProfile(Base):
    __tablename__ = "user_psych_profiles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Composite scores (0-100)
    confidence_index: Mapped[float] = mapped_column(Float, default=0.0)
    anxiety_score: Mapped[float] = mapped_column(Float, default=0.0)
    discipline_score: Mapped[float] = mapped_column(Float, default=0.0)
    narrative_maturity_score: Mapped[float] = mapped_column(Float, default=0.0)
    interview_anxiety_score: Mapped[float] = mapped_column(Float, default=0.0)
    cultural_adaptability_score: Mapped[float] = mapped_column(Float, default=0.0)
    financial_resilience_score: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Enums
    risk_profile: Mapped[str] = mapped_column(String(20), default="medium")
    decision_style: Mapped[str] = mapped_column(String(50), default="analytical")
    
    # Computed states
    mobility_state: Mapped[str] = mapped_column(String(20), default="exploring")
    psychological_state: Mapped[str] = mapped_column(String(20), default="uncertain")
    
    # Professional Archetype System
    dominant_archetype: Mapped[ProfessionalArchetype | None] = mapped_column(Enum(ProfessionalArchetype, values_callable=lambda x: [e.value for e in x]), nullable=True)
    primary_fear_cluster: Mapped[FearCluster | None] = mapped_column(Enum(FearCluster, values_callable=lambda x: [e.value for e in x]), nullable=True)
    evolution_stage: Mapped[int] = mapped_column(Integer, default=1)
    kinetic_energy_level: Mapped[float] = mapped_column(Float, default=0.0)
    
    # JSON data
    fear_clusters: Mapped[list] = mapped_column(JSON, default=list)
    strengths: Mapped[list] = mapped_column(JSON, default=list)
    growth_areas: Mapped[list] = mapped_column(JSON, default=list)
    
    # Metadata
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_assessment_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="psych_profile")


class PsychQuestion(Base):
    __tablename__ = "psych_questions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    
    # Question data
    text_en: Mapped[str] = mapped_column(Text, nullable=False)
    text_pt: Mapped[str] = mapped_column(Text, nullable=False)
    text_es: Mapped[str] = mapped_column(Text, nullable=False)
    
    question_type: Mapped[PsychQuestionType] = mapped_column(Enum(PsychQuestionType, values_callable=lambda x: [e.value for e in x]), nullable=False)
    category: Mapped[PsychCategory] = mapped_column(Enum(PsychCategory, values_callable=lambda x: [e.value for e in x]), nullable=False)
    
    # Options for multiple choice
    options: Mapped[list] = mapped_column(JSON, default=list)
    
    # Scoring
    weight: Mapped[float] = mapped_column(Float, default=1.0)
    reverse_scored: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Metadata
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class PsychAnswer(Base):
    __tablename__ = "psych_answers"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("psych_assessment_sessions.id", ondelete="CASCADE"), nullable=False)
    question_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("psych_questions.id", ondelete="CASCADE"), nullable=False)
    
    # Answer data
    answer_value: Mapped[str] = mapped_column(Text, nullable=False)
    answer_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Score computed for this answer
    computed_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class PsychAssessmentSession(Base):
    __tablename__ = "psych_assessment_sessions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Session status
    status: Mapped[str] = mapped_column(String(20), default="in_progress")
    
    # Progress
    current_question_index: Mapped[int] = mapped_column(Integer, default=0)
    total_questions: Mapped[int] = mapped_column(Integer, default=0)
    
    # Timing
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Results snapshot (computed after completion)
    scores_snapshot: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class PsychScoreHistory(Base):
    __tablename__ = "psych_score_history"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Score components at this point in time
    confidence_index: Mapped[float] = mapped_column(Float, nullable=False)
    anxiety_score: Mapped[float] = mapped_column(Float, nullable=False)
    discipline_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_profile: Mapped[str] = mapped_column(String(20), nullable=False)
    
    # Context
    assessment_type: Mapped[str] = mapped_column(String(50), default="onboarding")
    trigger_event: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ArchetypeConfig(Base):
    """Deep archetype configuration - internal metadata for personalization
    
    This table contains the internal OIOS framework mappings and deep metadata
    that drives personalization across the system. Never exposed to public UI.
    """
    __tablename__ = "archetype_configs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    archetype: Mapped[ProfessionalArchetype] = mapped_column(
        Enum(ProfessionalArchetype, values_callable=lambda x: [e.value for e in x]),
        unique=True,
        nullable=False
    )
    
    # Display Names (multilingual)
    name_en: Mapped[str] = mapped_column(String(100), nullable=False)
    name_pt: Mapped[str] = mapped_column(String(100), nullable=False)
    name_es: Mapped[str] = mapped_column(String(100), nullable=False)
    
    description_en: Mapped[str] = mapped_column(Text, nullable=False)
    description_pt: Mapped[str] = mapped_column(Text, nullable=False)
    description_es: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Motivational Engine (internal OIOS framework)
    primary_motivator: Mapped[str] = mapped_column(String(100), nullable=False)
    # Examples: "Autonomia", "Prestígio", "Expertise", "Liberdade", "Estrutura"
    
    primary_fear: Mapped[str] = mapped_column(String(100), nullable=False)
    # Examples: "Perda de liberdade", "Fracasso acadêmico", "Estagnação"
    
    evolution_path: Mapped[str] = mapped_column(String(200), nullable=False)
    # Examples: "Operador Local → Estrategista Internacional Soberano"
    
    # Route Preferences (JSON)
    preferred_route_types: Mapped[list] = mapped_column(JSON, default=list)
    # Example: ["job_relocation", "digital_nomad", "investor_visa"]
    
    route_weights: Mapped[dict] = mapped_column(JSON, default=dict)
    # Example: {"job_relocation": 0.8, "digital_nomad": 0.9, "scholarship": 0.3}
    
    # Document Style (JSON) - drives narrative voice in resumes, cover letters
    narrative_voice: Mapped[dict] = mapped_column(JSON, default=dict)
    # Example: {
    #     "tone": "assertive",
    #     "focus": "autonomy_and_freedom",
    #     "keywords": ["independent", "sovereign", "self-directed"],
    #     "avoid": ["team player", "corporate ladder"],
    #     "sentence_style": "direct_and_confident",
    #     "achievement_framing": "impact_and_autonomy"
    # }
    
    # Companion Personality (JSON) - drives companion behavior
    companion_traits: Mapped[dict] = mapped_column(JSON, default=dict)
    # Example: {
    #     "personality": "rebellious_mentor",
    #     "communication_style": "direct_and_challenging",
    #     "encouragement_type": "freedom_focused",
    #     "evolution_triggers": ["visa_obtained", "remote_job_secured"],
    #     "visual_theme": "phoenix",
    #     "abilities": ["visa_navigator", "remote_work_optimizer"]
    # }
    
    # Interview Prep Focus (JSON)
    interview_focus_areas: Mapped[list] = mapped_column(JSON, default=list)
    # Example: ["autonomy_questions", "remote_work_setup", "timezone_flexibility"]
    
    # Marketplace Preferences (JSON)
    service_preferences: Mapped[dict] = mapped_column(JSON, default=dict)
    # Example: {
    #     "career_coaching": 0.6,
    #     "visa_consulting": 0.9,
    #     "tax_optimization": 0.8,
    #     "language_training": 0.4
    # }
    
    # Risk Profile
    typical_risk_tolerance: Mapped[str] = mapped_column(String(20), default="medium")
    # Values: "high", "medium", "low"
    
    decision_speed: Mapped[str] = mapped_column(String(20), default="moderate")
    # Values: "fast", "moderate", "deliberate"
    
    # Content Personalization
    content_themes: Mapped[list] = mapped_column(JSON, default=list)
    # Example: ["freedom", "sovereignty", "location_independence"]
    
    success_metrics: Mapped[list] = mapped_column(JSON, default=list)
    # Example: ["visa_obtained", "remote_income", "tax_optimization"]
    
    # Quest & Achievement Preferences
    preferred_quest_types: Mapped[list] = mapped_column(JSON, default=list)
    # Example: ["visa_preparation", "remote_job_search", "tax_optimization"]
    
    achievement_priorities: Mapped[list] = mapped_column(JSON, default=list)
    # Example: ["visa_milestones", "location_independence", "financial_sovereignty"]
    
    # Metadata
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
