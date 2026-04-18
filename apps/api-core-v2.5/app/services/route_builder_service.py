"""RouteBuilder Service

Creates and manages dynamic routes based on user input and archetype.
Handles:
- Dynamic route creation
- Route configuration generation
- Archetype-based personalization
- Milestone generation integration
- ATS analysis integration (for employment routes)
- Route validation and updates
"""

import uuid
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.route import RouteBuilder, DynamicMilestone, RouteCategory
from app.db.models.psychology import ArchetypeConfig, ProfessionalArchetype
from app.services.milestone_generator import MilestoneGenerator


class RouteBuilderService:
    """Service for creating and managing dynamic routes"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.milestone_generator = MilestoneGenerator(session)
    
    async def create_route(
        self,
        user_id: uuid.UUID,
        category: RouteCategory,
        target_outcome: str,
        target_location: str,
        archetype: Optional[ProfessionalArchetype] = None,
        target_organization: Optional[str] = None,
        current_situation: Optional[Dict[str, Any]] = None,
        timeline_months: int = 12,
        budget_usd: int = 0,
        visa_requirements: Optional[List[str]] = None,
        language_requirements: Optional[List[str]] = None,
        job_description: Optional[str] = None,
        **kwargs
    ) -> RouteBuilder:
        """Create a new dynamic route
        
        Args:
            user_id: User's UUID
            category: Route category (employment, education, etc.)
            target_outcome: Desired outcome (e.g., "Senior Software Engineer at Google")
            target_location: Target location (e.g., "San Francisco, USA")
            archetype: User's professional archetype (optional)
            target_organization: Target company/institution (optional)
            current_situation: User's current situation (optional)
            timeline_months: Timeline in months (default: 12)
            budget_usd: Budget in USD (default: 0)
            visa_requirements: Visa requirements (optional)
            language_requirements: Language requirements (optional)
            job_description: Job description for ATS analysis (optional)
            **kwargs: Additional route-specific parameters
            
        Returns:
            Created RouteBuilder with generated milestones
        """
        # Get archetype config if archetype provided
        archetype_config = None
        if archetype:
            result = await self.session.execute(
                select(ArchetypeConfig).where(ArchetypeConfig.archetype == archetype)
            )
            archetype_config = result.scalar_one_or_none()
        
        # Generate route configuration
        route_config = self._generate_route_config(
            category, target_outcome, target_location, archetype_config
        )
        
        # Generate personalization based on archetype
        personalization = self._generate_personalization(archetype_config)
        
        # Generate route name
        route_name = self._generate_route_name(
            category, target_outcome, target_location
        )
        
        # Create route builder
        route_builder = RouteBuilder(
            id=uuid.uuid4(),
            user_id=user_id,
            category=category.value,
            archetype=archetype.value if archetype else None,
            target_outcome=target_outcome,
            target_location=target_location,
            target_organization=target_organization,
            current_situation=current_situation or {},
            timeline_months=timeline_months,
            budget_usd=budget_usd,
            visa_requirements=visa_requirements or [],
            language_requirements=language_requirements or [],
            route_config=route_config,
            job_description=job_description,
            ats_analysis=None,  # Will be populated if job_description provided
            personalization=personalization,
            status="draft",
            name=route_name,
            description=f"Journey to {target_outcome} in {target_location}"
        )
        
        self.session.add(route_builder)
        await self.session.flush()
        
        # Generate milestones
        milestones = await self.milestone_generator.generate_milestones(
            route_builder, archetype_config
        )
        
        # Add milestones to session
        for milestone in milestones:
            self.session.add(milestone)
        
        # Perform ATS analysis if job description provided
        if job_description and category == RouteCategory.EMPLOYMENT:
            ats_analysis = await self._analyze_job_description(
                job_description, current_situation
            )
            route_builder.ats_analysis = ats_analysis
        
        await self.session.commit()
        
        return route_builder
    
    async def update_route(
        self,
        route_id: uuid.UUID,
        **updates
    ) -> RouteBuilder:
        """Update an existing route
        
        Args:
            route_id: Route UUID
            **updates: Fields to update
            
        Returns:
            Updated RouteBuilder
        """
        result = await self.session.execute(
            select(RouteBuilder).where(RouteBuilder.id == route_id)
        )
        route = result.scalar_one_or_none()
        
        if not route:
            raise ValueError(f"Route {route_id} not found")
        
        # Update fields
        for key, value in updates.items():
            if hasattr(route, key):
                setattr(route, key, value)
        
        route.updated_at = datetime.now(timezone.utc)
        
        await self.session.commit()
        return route
    
    async def start_route(self, route_id: uuid.UUID) -> RouteBuilder:
        """Start a route (change status from draft to active)
        
        Args:
            route_id: Route UUID
            
        Returns:
            Updated RouteBuilder
        """
        result = await self.session.execute(
            select(RouteBuilder).where(RouteBuilder.id == route_id)
        )
        route = result.scalar_one_or_none()
        
        if not route:
            raise ValueError(f"Route {route_id} not found")
        
        route.status = "active"
        route.started_at = datetime.now(timezone.utc)
        
        # Unlock first milestone
        result = await self.session.execute(
            select(DynamicMilestone)
            .where(DynamicMilestone.route_builder_id == route_id)
            .where(DynamicMilestone.display_order == 1)
        )
        first_milestone = result.scalar_one_or_none()
        
        if first_milestone:
            first_milestone.status = "unlocked"
        
        await self.session.commit()
        return route
    
    async def complete_milestone(
        self,
        milestone_id: uuid.UUID
    ) -> Dict[str, Any]:
        """Complete a milestone and unlock next one
        
        Args:
            milestone_id: Milestone UUID
            
        Returns:
            Dict with completion info and next milestone
        """
        result = await self.session.execute(
            select(DynamicMilestone).where(DynamicMilestone.id == milestone_id)
        )
        milestone = result.scalar_one_or_none()
        
        if not milestone:
            raise ValueError(f"Milestone {milestone_id} not found")
        
        # Mark as completed
        milestone.status = "completed"
        milestone.completion_percentage = 100
        milestone.completed_at = datetime.now(timezone.utc)
        
        # Update route progress
        route_result = await self.session.execute(
            select(RouteBuilder).where(RouteBuilder.id == milestone.route_builder_id)
        )
        route = route_result.scalar_one_or_none()
        
        if route:
            # Calculate overall progress
            all_milestones_result = await self.session.execute(
                select(DynamicMilestone)
                .where(DynamicMilestone.route_builder_id == route.id)
            )
            all_milestones = all_milestones_result.scalars().all()
            
            completed_count = sum(1 for m in all_milestones if m.status == "completed")
            total_count = len(all_milestones)
            
            route.completion_percentage = int((completed_count / total_count) * 100) if total_count > 0 else 0
            route.current_milestone_index = milestone.display_order
            
            # Check if route is complete
            if route.completion_percentage == 100:
                route.status = "completed"
                route.completed_at = datetime.now(timezone.utc)
        
        # Unlock next milestone
        next_milestone_result = await self.session.execute(
            select(DynamicMilestone)
            .where(DynamicMilestone.route_builder_id == milestone.route_builder_id)
            .where(DynamicMilestone.display_order == milestone.display_order + 1)
        )
        next_milestone = next_milestone_result.scalar_one_or_none()
        
        if next_milestone and next_milestone.status == "locked":
            next_milestone.status = "unlocked"
            next_milestone.started_at = datetime.now(timezone.utc)
        
        await self.session.commit()
        
        return {
            "milestone_completed": {
                "id": str(milestone.id),
                "name": milestone.name,
                "xp_reward": milestone.xp_reward
            },
            "route_progress": route.completion_percentage if route else 0,
            "next_milestone": {
                "id": str(next_milestone.id),
                "name": next_milestone.name,
                "description": next_milestone.description
            } if next_milestone else None,
            "route_completed": route.status == "completed" if route else False
        }
    
    async def get_route_with_milestones(
        self,
        route_id: uuid.UUID
    ) -> Dict[str, Any]:
        """Get route with all its milestones
        
        Args:
            route_id: Route UUID
            
        Returns:
            Dict with route and milestones
        """
        # Get route
        route_result = await self.session.execute(
            select(RouteBuilder).where(RouteBuilder.id == route_id)
        )
        route = route_result.scalar_one_or_none()
        
        if not route:
            raise ValueError(f"Route {route_id} not found")
        
        # Get milestones
        milestones_result = await self.session.execute(
            select(DynamicMilestone)
            .where(DynamicMilestone.route_builder_id == route_id)
            .order_by(DynamicMilestone.display_order)
        )
        milestones = milestones_result.scalars().all()
        
        return {
            "route": route,
            "milestones": milestones,
            "total_milestones": len(milestones),
            "completed_milestones": sum(1 for m in milestones if m.status == "completed"),
            "current_milestone": next((m for m in milestones if m.status == "unlocked"), None)
        }
    
    def validate_route_config(self, config: Dict[str, Any]) -> bool:
        """Validate that a route config dict has all required fields and valid values."""
        required = {"category", "target_outcome", "target_location", "timeline_months"}
        if not required.issubset(config.keys()):
            return False
        timeline = config.get("timeline_months")
        if not isinstance(timeline, int) or timeline < 1 or timeline > 60:
            return False
        if not config.get("target_outcome", "").strip():
            return False
        return True

    # Private helper methods

    def _generate_route_config(
        self,
        category: RouteCategory,
        target_outcome: str,
        target_location: str,
        archetype_config: Optional[ArchetypeConfig]
    ) -> Dict[str, Any]:
        """Generate route configuration based on category and archetype"""
        
        config = {
            "category": category.value,
            "target_outcome": target_outcome,
            "target_location": target_location,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Add archetype-specific configuration
        if archetype_config:
            config["archetype_preferences"] = {
                "route_weights": archetype_config.route_weights,
                "preferred_route_types": archetype_config.preferred_route_types,
                "risk_tolerance": archetype_config.typical_risk_tolerance,
                "decision_speed": archetype_config.decision_speed
            }
        
        # Add category-specific configuration
        if category == RouteCategory.EMPLOYMENT:
            config["employment_specific"] = {
                "ats_optimization": True,
                "interview_prep": True,
                "salary_negotiation": True,
                "visa_support": True
            }
        elif category == RouteCategory.EDUCATION:
            config["education_specific"] = {
                "scholarship_search": True,
                "application_support": True,
                "test_prep": True,
                "visa_support": True
            }
        elif category == RouteCategory.ENTREPRENEURSHIP:
            config["entrepreneurship_specific"] = {
                "business_validation": True,
                "funding_support": True,
                "legal_setup": True,
                "market_research": True
            }
        
        return config
    
    def _generate_personalization(
        self,
        archetype_config: Optional[ArchetypeConfig]
    ) -> Dict[str, Any]:
        """Generate personalization settings based on archetype"""
        
        if not archetype_config:
            return {}
        
        return {
            "narrative_voice": archetype_config.narrative_voice,
            "communication_style": archetype_config.companion_traits.get("communication_style") if archetype_config.companion_traits else "supportive",
            "content_themes": archetype_config.content_themes,
            "success_metrics": archetype_config.success_metrics,
            "interview_focus_areas": archetype_config.interview_focus_areas,
            "service_preferences": archetype_config.service_preferences
        }
    
    def _generate_route_name(
        self,
        category: RouteCategory,
        target_outcome: str,
        target_location: str
    ) -> str:
        """Generate a descriptive route name"""
        
        category_names = {
            RouteCategory.EMPLOYMENT: "Career Path",
            RouteCategory.EDUCATION: "Academic Journey",
            RouteCategory.ENTREPRENEURSHIP: "Venture Path",
            RouteCategory.INVESTMENT: "Investment Journey",
            RouteCategory.FAMILY: "Family Migration"
        }
        
        category_name = category_names.get(category, "Journey")
        
        # Truncate target_outcome if too long
        outcome = target_outcome[:50] + "..." if len(target_outcome) > 50 else target_outcome
        
        return f"{category_name}: {outcome} in {target_location}"
    
    async def _analyze_job_description(
        self,
        job_description: str,
        current_situation: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze job description for ATS optimization
        
        This is a placeholder for future ATS integration.
        In Phase 6, this will integrate with Resume-Matcher library.
        
        Args:
            job_description: The job description text
            current_situation: User's current skills/experience
            
        Returns:
            Dict with ATS analysis results
        """
        # Placeholder implementation
        # TODO: Integrate Resume-Matcher in Phase 6
        
        return {
            "analyzed": True,
            "analysis_date": datetime.now(timezone.utc).isoformat(),
            "keywords_extracted": [],  # Will be populated by Resume-Matcher
            "required_skills": [],  # Will be populated by Resume-Matcher
            "recommended_improvements": [],  # Will be populated by Resume-Matcher
            "match_score": 0,  # Will be calculated by Resume-Matcher
            "note": "Full ATS analysis will be available in Phase 6"
        }
    
    async def regenerate_milestones(
        self,
        route_id: uuid.UUID
    ) -> List[DynamicMilestone]:
        """Regenerate milestones for a route
        
        Useful if route parameters change significantly.
        
        Args:
            route_id: Route UUID
            
        Returns:
            List of new milestones
        """
        # Get route
        route_result = await self.session.execute(
            select(RouteBuilder).where(RouteBuilder.id == route_id)
        )
        route = route_result.scalar_one_or_none()
        
        if not route:
            raise ValueError(f"Route {route_id} not found")
        
        # Delete existing milestones
        await self.session.execute(
            select(DynamicMilestone)
            .where(DynamicMilestone.route_builder_id == route_id)
        )
        # Note: In production, you'd want to handle this more carefully
        
        # Get archetype config
        archetype_config = None
        if route.archetype:
            result = await self.session.execute(
                select(ArchetypeConfig).where(ArchetypeConfig.archetype == route.archetype)
            )
            archetype_config = result.scalar_one_or_none()
        
        # Generate new milestones
        milestones = await self.milestone_generator.generate_milestones(
            route, archetype_config
        )
        
        # Add to session
        for milestone in milestones:
            self.session.add(milestone)
        
        await self.session.commit()
        
        return milestones
