"""Milestone Generator Service

Generates dynamic, context-specific milestones for routes based on:
- Route category (employment, education, entrepreneurship, etc.)
- User archetype
- Target outcome
- Current situation
- Timeline and budget

This service replaces hardcoded milestone templates with intelligent,
personalized milestone generation.
"""

import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.route import RouteBuilder, DynamicMilestone, RouteCategory
from app.db.models.psychology import ArchetypeConfig, ProfessionalArchetype


class MilestoneGenerator:
    """Generate dynamic milestones for routes"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def generate_milestones(
        self,
        route_builder: RouteBuilder,
        archetype_config: Optional[ArchetypeConfig] = None
    ) -> List[DynamicMilestone]:
        """Generate milestones based on route category and context
        
        Args:
            route_builder: The route to generate milestones for
            archetype_config: Optional archetype config for personalization
            
        Returns:
            List of DynamicMilestone objects (not yet persisted)
        """
        # Get archetype config if not provided
        if not archetype_config and route_builder.archetype:
            result = await self.session.execute(
                select(ArchetypeConfig).where(
                    ArchetypeConfig.archetype == route_builder.archetype
                )
            )
            archetype_config = result.scalar_one_or_none()
        
        # Generate milestones based on category
        if route_builder.category == RouteCategory.EMPLOYMENT.value:
            milestones = await self._generate_employment_milestones(
                route_builder, archetype_config
            )
        elif route_builder.category == RouteCategory.EDUCATION.value:
            milestones = await self._generate_education_milestones(
                route_builder, archetype_config
            )
        elif route_builder.category == RouteCategory.ENTREPRENEURSHIP.value:
            milestones = await self._generate_entrepreneurship_milestones(
                route_builder, archetype_config
            )
        elif route_builder.category == RouteCategory.INVESTMENT.value:
            milestones = await self._generate_investment_milestones(
                route_builder, archetype_config
            )
        elif route_builder.category == RouteCategory.FAMILY.value:
            milestones = await self._generate_family_milestones(
                route_builder, archetype_config
            )
        else:
            # Fallback to generic milestones
            milestones = await self._generate_generic_milestones(
                route_builder, archetype_config
            )
        
        # Add archetype-specific personalization
        if archetype_config:
            milestones = self._personalize_milestones(
                milestones, archetype_config
            )
        
        return milestones
    
    async def _generate_employment_milestones(
        self,
        route_builder: RouteBuilder,
        archetype_config: Optional[ArchetypeConfig]
    ) -> List[DynamicMilestone]:
        """Generate milestones for employment routes"""
        milestones = []
        base_date = datetime.now(timezone.utc)
        
        # Milestone 1: Profile Optimization
        milestones.append(DynamicMilestone(
            id=uuid.uuid4(),
            route_builder_id=route_builder.id,
            name="Optimize Professional Profile",
            description=f"Prepare your profile for {route_builder.target_outcome} opportunities in {route_builder.target_location}",
            display_order=1,
            category="preparation",
            tasks=[
                {"name": "Update resume with target role keywords", "completed": False},
                {"name": "Optimize LinkedIn profile", "completed": False},
                {"name": "Prepare portfolio/work samples", "completed": False},
                {"name": "Research target companies", "completed": False}
            ],
            status="unlocked",
            ats_integration=True,
            ats_target_score=75,
            xp_reward=100,
            estimated_days=7,
            due_date=base_date + timedelta(days=7)
        ))
        
        # Milestone 2: Application Strategy
        milestones.append(DynamicMilestone(
            id=uuid.uuid4(),
            route_builder_id=route_builder.id,
            name="Develop Application Strategy",
            description="Create a targeted application strategy for your job search",
            display_order=2,
            category="strategy",
            tasks=[
                {"name": "Identify 20 target companies", "completed": False},
                {"name": "Map decision makers on LinkedIn", "completed": False},
                {"name": "Prepare customized cover letter templates", "completed": False},
                {"name": "Set up job alerts", "completed": False}
            ],
            status="locked",
            xp_reward=150,
            estimated_days=5,
            due_date=base_date + timedelta(days=12)
        ))
        
        # Milestone 3: Active Applications
        milestones.append(DynamicMilestone(
            id=uuid.uuid4(),
            route_builder_id=route_builder.id,
            name="Submit Applications",
            description="Apply to target positions with optimized materials",
            display_order=3,
            category="execution",
            tasks=[
                {"name": "Submit 10 applications", "completed": False},
                {"name": "Follow up with hiring managers", "completed": False},
                {"name": "Track application status", "completed": False},
                {"name": "Refine approach based on feedback", "completed": False}
            ],
            status="locked",
            ats_integration=True,
            ats_target_score=80,
            xp_reward=200,
            estimated_days=14,
            due_date=base_date + timedelta(days=26)
        ))
        
        # Milestone 4: Interview Preparation
        milestones.append(DynamicMilestone(
            id=uuid.uuid4(),
            route_builder_id=route_builder.id,
            name="Master Interview Process",
            description="Prepare for and excel in interviews",
            display_order=4,
            category="interview",
            tasks=[
                {"name": "Research common interview questions", "completed": False},
                {"name": "Prepare STAR stories", "completed": False},
                {"name": "Practice with mock interviews", "completed": False},
                {"name": "Prepare questions for interviewers", "completed": False}
            ],
            status="locked",
            xp_reward=250,
            companion_evolution_trigger={"type": "interview_ready", "threshold": 3},
            estimated_days=7,
            due_date=base_date + timedelta(days=33)
        ))
        
        # Milestone 5: Offer Negotiation
        milestones.append(DynamicMilestone(
            id=uuid.uuid4(),
            route_builder_id=route_builder.id,
            name="Negotiate and Accept Offer",
            description="Evaluate offers and negotiate terms",
            display_order=5,
            category="negotiation",
            tasks=[
                {"name": "Research salary benchmarks", "completed": False},
                {"name": "Evaluate total compensation package", "completed": False},
                {"name": "Negotiate salary and benefits", "completed": False},
                {"name": "Accept offer and plan transition", "completed": False}
            ],
            status="locked",
            xp_reward=300,
            companion_evolution_trigger={"type": "offer_accepted", "threshold": 1},
            estimated_days=7,
            due_date=base_date + timedelta(days=40)
        ))
        
        # Milestone 6: Visa & Relocation (if international)
        if route_builder.target_location and "visa" in str(route_builder.visa_requirements).lower():
            milestones.append(DynamicMilestone(
                id=uuid.uuid4(),
                route_builder_id=route_builder.id,
                name="Secure Visa and Plan Relocation",
                description=f"Obtain work visa for {route_builder.target_location} and plan move",
                display_order=6,
                category="relocation",
                tasks=[
                    {"name": "Gather visa documentation", "completed": False},
                    {"name": "Submit visa application", "completed": False},
                    {"name": "Plan relocation logistics", "completed": False},
                    {"name": "Arrange housing and essentials", "completed": False}
                ],
                status="locked",
                xp_reward=400,
                companion_evolution_trigger={"type": "visa_obtained", "threshold": 1},
                estimated_days=30,
                due_date=base_date + timedelta(days=70)
            ))
        
        return milestones
    
    async def _generate_education_milestones(
        self,
        route_builder: RouteBuilder,
        archetype_config: Optional[ArchetypeConfig]
    ) -> List[DynamicMilestone]:
        """Generate milestones for education routes"""
        milestones = []
        base_date = datetime.now(timezone.utc)
        
        # Milestone 1: Program Research
        milestones.append(DynamicMilestone(
            id=uuid.uuid4(),
            route_builder_id=route_builder.id,
            name="Research Programs",
            description=f"Identify and research programs for {route_builder.target_outcome}",
            display_order=1,
            category="research",
            tasks=[
                {"name": "Identify 10 target programs", "completed": False},
                {"name": "Research admission requirements", "completed": False},
                {"name": "Compare program rankings and outcomes", "completed": False},
                {"name": "Connect with current students/alumni", "completed": False}
            ],
            status="unlocked",
            xp_reward=100,
            estimated_days=10,
            due_date=base_date + timedelta(days=10)
        ))
        
        # Milestone 2: Application Preparation
        milestones.append(DynamicMilestone(
            id=uuid.uuid4(),
            route_builder_id=route_builder.id,
            name="Prepare Application Materials",
            description="Create compelling application materials",
            display_order=2,
            category="preparation",
            tasks=[
                {"name": "Write statement of purpose", "completed": False},
                {"name": "Secure recommendation letters", "completed": False},
                {"name": "Prepare academic transcripts", "completed": False},
                {"name": "Take required tests (GRE/GMAT/TOEFL)", "completed": False}
            ],
            status="locked",
            xp_reward=200,
            estimated_days=30,
            due_date=base_date + timedelta(days=40)
        ))
        
        # Milestone 3: Submit Applications
        milestones.append(DynamicMilestone(
            id=uuid.uuid4(),
            route_builder_id=route_builder.id,
            name="Submit Applications",
            description="Apply to target programs",
            display_order=3,
            category="execution",
            tasks=[
                {"name": "Submit applications to 5-8 programs", "completed": False},
                {"name": "Pay application fees", "completed": False},
                {"name": "Track application status", "completed": False},
                {"name": "Prepare for interviews", "completed": False}
            ],
            status="locked",
            xp_reward=250,
            estimated_days=14,
            due_date=base_date + timedelta(days=54)
        ))
        
        # Milestone 4: Funding & Scholarships
        milestones.append(DynamicMilestone(
            id=uuid.uuid4(),
            route_builder_id=route_builder.id,
            name="Secure Funding",
            description="Apply for scholarships and financial aid",
            display_order=4,
            category="funding",
            tasks=[
                {"name": "Research scholarship opportunities", "completed": False},
                {"name": "Apply for scholarships", "completed": False},
                {"name": "Complete financial aid applications", "completed": False},
                {"name": "Explore assistantship opportunities", "completed": False}
            ],
            status="locked",
            xp_reward=300,
            companion_evolution_trigger={"type": "scholarship_awarded", "threshold": 1},
            estimated_days=20,
            due_date=base_date + timedelta(days=74)
        ))
        
        # Milestone 5: Enrollment & Visa
        milestones.append(DynamicMilestone(
            id=uuid.uuid4(),
            route_builder_id=route_builder.id,
            name="Enroll and Secure Visa",
            description="Accept admission and obtain student visa",
            display_order=5,
            category="enrollment",
            tasks=[
                {"name": "Accept admission offer", "completed": False},
                {"name": "Pay enrollment deposit", "completed": False},
                {"name": "Apply for student visa", "completed": False},
                {"name": "Arrange housing and orientation", "completed": False}
            ],
            status="locked",
            xp_reward=400,
            companion_evolution_trigger={"type": "enrollment_confirmed", "threshold": 1},
            estimated_days=30,
            due_date=base_date + timedelta(days=104)
        ))
        
        return milestones
    
    async def _generate_entrepreneurship_milestones(
        self,
        route_builder: RouteBuilder,
        archetype_config: Optional[ArchetypeConfig]
    ) -> List[DynamicMilestone]:
        """Generate milestones for entrepreneurship routes"""
        milestones = []
        base_date = datetime.now(timezone.utc)
        
        # Basic entrepreneurship milestones
        milestones.append(DynamicMilestone(
            id=uuid.uuid4(),
            route_builder_id=route_builder.id,
            name="Validate Business Idea",
            description="Research and validate your business concept",
            display_order=1,
            category="validation",
            tasks=[
                {"name": "Conduct market research", "completed": False},
                {"name": "Identify target customers", "completed": False},
                {"name": "Analyze competition", "completed": False},
                {"name": "Validate problem-solution fit", "completed": False}
            ],
            status="unlocked",
            xp_reward=150,
            estimated_days=14,
            due_date=base_date + timedelta(days=14)
        ))
        
        return milestones
    
    async def _generate_investment_milestones(
        self,
        route_builder: RouteBuilder,
        archetype_config: Optional[ArchetypeConfig]
    ) -> List[DynamicMilestone]:
        """Generate milestones for investment routes"""
        milestones = []
        base_date = datetime.now(timezone.utc)
        
        # Basic investment milestones
        milestones.append(DynamicMilestone(
            id=uuid.uuid4(),
            route_builder_id=route_builder.id,
            name="Research Investment Options",
            description="Explore investment visa and residency programs",
            display_order=1,
            category="research",
            tasks=[
                {"name": "Research investment visa programs", "completed": False},
                {"name": "Understand investment requirements", "completed": False},
                {"name": "Consult with immigration lawyer", "completed": False},
                {"name": "Evaluate ROI and risks", "completed": False}
            ],
            status="unlocked",
            xp_reward=150,
            estimated_days=14,
            due_date=base_date + timedelta(days=14)
        ))
        
        return milestones
    
    async def _generate_family_milestones(
        self,
        route_builder: RouteBuilder,
        archetype_config: Optional[ArchetypeConfig]
    ) -> List[DynamicMilestone]:
        """Generate milestones for family migration routes"""
        milestones = []
        base_date = datetime.now(timezone.utc)
        
        # Basic family migration milestones
        milestones.append(DynamicMilestone(
            id=uuid.uuid4(),
            route_builder_id=route_builder.id,
            name="Research Family Migration Options",
            description="Explore family reunification and migration pathways",
            display_order=1,
            category="research",
            tasks=[
                {"name": "Research family visa options", "completed": False},
                {"name": "Understand eligibility requirements", "completed": False},
                {"name": "Gather family documentation", "completed": False},
                {"name": "Consult with immigration specialist", "completed": False}
            ],
            status="unlocked",
            xp_reward=150,
            estimated_days=14,
            due_date=base_date + timedelta(days=14)
        ))
        
        return milestones
    
    async def _generate_generic_milestones(
        self,
        route_builder: RouteBuilder,
        archetype_config: Optional[ArchetypeConfig]
    ) -> List[DynamicMilestone]:
        """Generate generic milestones for unknown categories"""
        milestones = []
        base_date = datetime.now(timezone.utc)
        
        milestones.append(DynamicMilestone(
            id=uuid.uuid4(),
            route_builder_id=route_builder.id,
            name="Define Your Path",
            description="Clarify your goals and create an action plan",
            display_order=1,
            category="planning",
            tasks=[
                {"name": "Define specific goals", "completed": False},
                {"name": "Research requirements", "completed": False},
                {"name": "Create action plan", "completed": False},
                {"name": "Identify resources needed", "completed": False}
            ],
            status="unlocked",
            xp_reward=100,
            estimated_days=7,
            due_date=base_date + timedelta(days=7)
        ))
        
        return milestones
    
    def _personalize_milestones(
        self,
        milestones: List[DynamicMilestone],
        archetype_config: ArchetypeConfig
    ) -> List[DynamicMilestone]:
        """Add archetype-specific personalization to milestones"""
        
        # Get archetype-specific messaging
        narrative_voice = archetype_config.narrative_voice or {}
        companion_traits = archetype_config.companion_traits or {}
        
        tone = narrative_voice.get("tone", "supportive")
        encouragement_type = companion_traits.get("encouragement_type", "general")
        
        for milestone in milestones:
            # Add archetype-specific message
            milestone.archetype_message = self._generate_archetype_message(
                milestone, archetype_config, tone
            )
            
            # Add companion encouragement
            milestone.companion_encouragement = self._generate_companion_encouragement(
                milestone, archetype_config, encouragement_type
            )
        
        return milestones
    
    def _generate_archetype_message(
        self,
        milestone: DynamicMilestone,
        archetype_config: ArchetypeConfig,
        tone: str
    ) -> str:
        """Generate archetype-specific message for milestone"""
        
        # Simple tone-based messaging (can be enhanced with LLM)
        if tone == "assertive":
            return f"Take control of your journey. {milestone.name} is your next step to freedom."
        elif tone == "scholarly":
            return f"Excellence requires preparation. {milestone.name} builds your academic foundation."
        elif tone == "professional":
            return f"Strategic execution is key. {milestone.name} advances your career mastery."
        elif tone == "adventurous":
            return f"The world awaits! {milestone.name} opens new possibilities."
        elif tone == "technical":
            return f"Systematic progress matters. {milestone.name} strengthens your technical position."
        elif tone == "confident":
            return f"You've got this. {milestone.name} validates your expertise."
        elif tone == "responsible":
            return f"Building a secure future. {milestone.name} protects what matters most."
        elif tone == "purposeful":
            return f"Impact starts here. {milestone.name} creates meaningful change."
        elif tone == "intellectual":
            return f"Knowledge is power. {milestone.name} deepens your understanding."
        elif tone == "wise":
            return f"Strategic patience wins. {milestone.name} builds lasting value."
        elif tone == "creative":
            return f"Express yourself boldly. {milestone.name} showcases your unique vision."
        elif tone == "analytical":
            return f"Optimize your path. {milestone.name} maximizes your outcomes."
        else:
            return f"You're making progress! {milestone.name} moves you forward."
    
    def _generate_companion_encouragement(
        self,
        milestone: DynamicMilestone,
        archetype_config: ArchetypeConfig,
        encouragement_type: str
    ) -> str:
        """Generate companion encouragement for milestone"""
        
        # Simple encouragement based on type (can be enhanced with LLM)
        if encouragement_type == "freedom_focused":
            return "Every step brings you closer to the freedom you deserve!"
        elif encouragement_type == "intellectual_growth":
            return "Your intellectual journey is inspiring. Keep pushing boundaries!"
        elif encouragement_type == "growth_focused":
            return "You're leveling up! This milestone showcases your growth."
        elif encouragement_type == "experience_focused":
            return "New experiences await! Let's make this milestone count."
        elif encouragement_type == "skill_focused":
            return "Your technical skills are your superpower. Let's sharpen them!"
        elif encouragement_type == "validation_focused":
            return "You're proving your worth with every step. I believe in you!"
        elif encouragement_type == "stability_focused":
            return "Building a secure foundation, one milestone at a time."
        elif encouragement_type == "purpose_focused":
            return "Your impact matters. This milestone creates real change!"
        elif encouragement_type == "discovery_focused":
            return "Discovery awaits! Let's uncover new insights together."
        elif encouragement_type == "balance_focused":
            return "Strategic progress without burnout. You're doing great!"
        elif encouragement_type == "expression_focused":
            return "Your creativity shines! Let's bring your vision to life."
        elif encouragement_type == "efficiency_focused":
            return "Optimizing your path like a pro. Smart moves!"
        else:
            return "I'm here to support you every step of the way!"
