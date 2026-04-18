"""
Tests for MilestoneGenerator Service
"""
import pytest
from unittest.mock import AsyncMock
from datetime import datetime, timedelta
from app.services.milestone_generator import MilestoneGenerator
from app.db.models.psychology import ProfessionalArchetype
from app.db.models.route import RouteCategory


class TestMilestoneGenerator:
    """Test suite for MilestoneGenerator service"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.mock_db = AsyncMock()
        self.generator = MilestoneGenerator(self.mock_db)
        self.archetype = ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY
        
    @pytest.mark.asyncio

    async def test_generate_employment_milestones(self):
        """Test employment route milestone generation"""
        route_config = {
            "category": RouteCategory.EMPLOYMENT,
            "target_outcome": "Senior Software Engineer at Google",
            "target_location": "San Francisco, USA",
            "timeline_months": 12,
            "job_description": "We're looking for a senior engineer..."
        }
        
        milestones = await self.generator.generate_milestones(
            route_config,
            self.archetype
        )
        
        # Should generate 6 employment milestones
        assert len(milestones) == 6
        
        # Check milestone structure
        first_milestone = milestones[0]
        assert "name" in first_milestone
        assert "description" in first_milestone
        assert "tasks" in first_milestone
        assert "xp_reward" in first_milestone
        assert "estimated_days" in first_milestone
        
        # Check archetype personalization
        assert any("autonomy" in m["description"].lower() or 
                  "freedom" in m["description"].lower() 
                  for m in milestones)
        
    @pytest.mark.asyncio

    async def test_generate_education_milestones(self):
        """Test education route milestone generation"""
        route_config = {
            "category": RouteCategory.EDUCATION,
            "target_outcome": "PhD in Computer Science",
            "target_location": "MIT, USA",
            "timeline_months": 24
        }
        
        milestones = await self.generator.generate_milestones(
            route_config,
            self.archetype
        )
        
        # Should generate 5 education milestones
        assert len(milestones) == 5
        
        # Check for education-specific content
        milestone_names = [m["name"] for m in milestones]
        assert any("research" in name.lower() for name in milestone_names)
        assert any("application" in name.lower() for name in milestone_names)
        
    @pytest.mark.asyncio

    async def test_archetype_specific_tone(self):
        """Test that different archetypes get different tones"""
        route_config = {
            "category": RouteCategory.EMPLOYMENT,
            "target_outcome": "Software Engineer",
            "target_location": "Remote",
            "timeline_months": 6
        }
        
        # Individual Sovereignty archetype
        milestones_sovereignty = self.generator.generate_milestones(
            route_config,
            ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY
        )
        
        # Academic Elite archetype
        milestones_academic = self.generator.generate_milestones(
            route_config,
            ProfessionalArchetype.ACADEMIC_ELITE
        )
        
        # Descriptions should be different
        assert milestones_sovereignty[0]["description"] != milestones_academic[0]["description"]
        
    @pytest.mark.asyncio

    async def test_milestone_xp_rewards(self):
        """Test that milestones have appropriate XP rewards"""
        route_config = {
            "category": RouteCategory.EMPLOYMENT,
            "target_outcome": "Engineer",
            "target_location": "USA",
            "timeline_months": 12
        }
        
        milestones = await self.generator.generate_milestones(
            route_config,
            self.archetype
        )
        
        # All milestones should have XP rewards
        for milestone in milestones:
            assert milestone["xp_reward"] >= 100
            assert milestone["xp_reward"] <= 400
            
    @pytest.mark.asyncio

    async def test_milestone_tasks(self):
        """Test that milestones have actionable tasks"""
        route_config = {
            "category": RouteCategory.EMPLOYMENT,
            "target_outcome": "Engineer",
            "target_location": "USA",
            "timeline_months": 12
        }
        
        milestones = await self.generator.generate_milestones(
            route_config,
            self.archetype
        )
        
        # All milestones should have tasks
        for milestone in milestones:
            assert len(milestone["tasks"]) > 0
            assert all(isinstance(task, str) for task in milestone["tasks"])
            
    @pytest.mark.asyncio

    async def test_companion_encouragement(self):
        """Test that milestones include companion encouragement"""
        route_config = {
            "category": RouteCategory.EMPLOYMENT,
            "target_outcome": "Engineer",
            "target_location": "USA",
            "timeline_months": 12
        }
        
        milestones = await self.generator.generate_milestones(
            route_config,
            self.archetype
        )
        
        # All milestones should have companion encouragement
        for milestone in milestones:
            assert "companion_encouragement" in milestone
            assert len(milestone["companion_encouragement"]) > 0
            
    @pytest.mark.asyncio

    async def test_ats_integration_for_employment(self):
        """Test that employment routes include ATS integration"""
        route_config = {
            "category": RouteCategory.EMPLOYMENT,
            "target_outcome": "Engineer",
            "target_location": "USA",
            "timeline_months": 12,
            "job_description": "Looking for engineer with Python skills"
        }
        
        milestones = await self.generator.generate_milestones(
            route_config,
            self.archetype
        )
        
        # Should have ATS-related milestones
        milestone_names = [m["name"].lower() for m in milestones]
        assert any("resume" in name or "ats" in name for name in milestone_names)
        
    @pytest.mark.asyncio

    async def test_timeline_estimation(self):
        """Test that milestones have realistic timeline estimates"""
        route_config = {
            "category": RouteCategory.EMPLOYMENT,
            "target_outcome": "Engineer",
            "target_location": "USA",
            "timeline_months": 12
        }
        
        milestones = await self.generator.generate_milestones(
            route_config,
            self.archetype
        )
        
        # Total estimated days should be reasonable
        total_days = sum(m["estimated_days"] for m in milestones)
        assert total_days > 0
        assert total_days <= 365  # Within a year
        
    @pytest.mark.asyncio

    async def test_entrepreneurship_milestones(self):
        """Test entrepreneurship route milestone generation"""
        route_config = {
            "category": RouteCategory.ENTREPRENEURSHIP,
            "target_outcome": "Start SaaS company",
            "target_location": "Remote",
            "timeline_months": 18
        }
        
        milestones = await self.generator.generate_milestones(
            route_config,
            self.archetype
        )
        
        # Should generate entrepreneurship milestones
        assert len(milestones) > 0
        milestone_names = [m["name"].lower() for m in milestones]
        assert any("business" in name or "startup" in name for name in milestone_names)
        
    @pytest.mark.asyncio

    async def test_investment_milestones(self):
        """Test investment route milestone generation"""
        route_config = {
            "category": RouteCategory.INVESTMENT,
            "target_outcome": "Golden Visa Portugal",
            "target_location": "Portugal",
            "timeline_months": 24
        }
        
        milestones = await self.generator.generate_milestones(
            route_config,
            self.archetype
        )
        
        # Should generate investment milestones
        assert len(milestones) > 0
        milestone_names = [m["name"].lower() for m in milestones]
        assert any("invest" in name or "visa" in name for name in milestone_names)
        
    @pytest.mark.asyncio

    async def test_family_milestones(self):
        """Test family route milestone generation"""
        route_config = {
            "category": RouteCategory.FAMILY,
            "target_outcome": "Family reunification",
            "target_location": "Canada",
            "timeline_months": 18
        }
        
        milestones = await self.generator.generate_milestones(
            route_config,
            self.archetype
        )
        
        # Should generate family milestones
        assert len(milestones) > 0
        milestone_names = [m["name"].lower() for m in milestones]
        assert any("family" in name or "reunification" in name for name in milestone_names)


class TestArchetypePersonalization:
    """Test archetype-specific personalization"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.mock_db = AsyncMock()
        self.generator = MilestoneGenerator(self.mock_db)
        self.route_config = {
            "category": RouteCategory.EMPLOYMENT,
            "target_outcome": "Engineer",
            "target_location": "USA",
            "timeline_months": 12
        }
        
    @pytest.mark.asyncio

    async def test_individual_sovereignty_tone(self):
        """Test Individual Sovereignty archetype tone"""
        milestones = await self.generator.generate_milestones(
            self.route_config,
            ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY
        )
        
        # Should emphasize autonomy and freedom
        descriptions = " ".join([m["description"] for m in milestones])
        assert any(word in descriptions.lower() for word in 
                  ["autonomy", "freedom", "independent", "sovereign"])
        
    @pytest.mark.asyncio

    async def test_academic_elite_tone(self):
        """Test Academic Elite archetype tone"""
        milestones = await self.generator.generate_milestones(
            self.route_config,
            ProfessionalArchetype.ACADEMIC_ELITE
        )
        
        # Should emphasize excellence and prestige
        descriptions = " ".join([m["description"] for m in milestones])
        assert any(word in descriptions.lower() for word in 
                  ["excellence", "prestige", "scholarly", "rigorous"])
        
    @pytest.mark.asyncio

    async def test_career_mastery_tone(self):
        """Test Career Mastery archetype tone"""
        milestones = await self.generator.generate_milestones(
            self.route_config,
            ProfessionalArchetype.CAREER_MASTERY
        )
        
        # Should emphasize expertise and strategy
        descriptions = " ".join([m["description"] for m in milestones])
        assert any(word in descriptions.lower() for word in 
                  ["expertise", "strategic", "mastery", "value"])


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
