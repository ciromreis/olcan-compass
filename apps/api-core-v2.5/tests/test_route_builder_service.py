"""
Tests for RouteBuilderService
"""
import pytest
from datetime import datetime
from unittest.mock import Mock, AsyncMock, patch
from app.services.route_builder_service import RouteBuilderService
from app.db.models.psychology import ProfessionalArchetype
from app.db.models.route import RouteCategory


class TestRouteBuilderService:
    """Test suite for RouteBuilderService"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.mock_db = AsyncMock()
        self.service = RouteBuilderService(self.mock_db)
        
    @pytest.mark.asyncio
    async def test_create_route(self):
        """Test route creation"""
        user_id = "test-user"
        route_data = {
            "category": RouteCategory.EMPLOYMENT,
            "target_outcome": "Senior Software Engineer at Google",
            "target_location": "San Francisco, USA",
            "timeline_months": 12,
            "budget_usd": 5000,
            "job_description": "We're looking for a senior engineer..."
        }
        archetype = ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY
        
        route = await self.service.create_route(
            self.mock_db,
            user_id,
            route_data,
            archetype
        )
        
        # Should create route with correct data
        assert route.user_id == user_id
        assert route.category == RouteCategory.EMPLOYMENT
        assert route.archetype == archetype
        assert route.target_outcome == route_data["target_outcome"]
        assert route.target_location == route_data["target_location"]
        assert route.timeline_months == route_data["timeline_months"]
        
    @pytest.mark.asyncio
    async def test_generate_milestones_on_create(self):
        """Test that milestones are generated when route is created"""
        user_id = "test-user"
        route_data = {
            "category": RouteCategory.EMPLOYMENT,
            "target_outcome": "Engineer",
            "target_location": "USA",
            "timeline_months": 12
        }
        archetype = ProfessionalArchetype.CAREER_MASTERY
        
        route = await self.service.create_route(
            self.mock_db,
            user_id,
            route_data,
            archetype
        )
        
        # Should have generated milestones
        milestones = await self.service.get_route_milestones(
            self.mock_db,
            route.id
        )
        
        assert len(milestones) > 0
        
    @pytest.mark.asyncio
    async def test_start_route(self):
        """Test starting a route"""
        mock_route = Mock()
        mock_route.id = "test-route"
        mock_route.status = "draft"
        
        result = await self.service.start_route(
            self.mock_db,
            mock_route
        )
        
        # Should change status to active
        assert result["status"] == "active"
        # Should unlock first milestone
        assert result["first_milestone_unlocked"] == True
        
    @pytest.mark.asyncio
    async def test_complete_milestone(self):
        """Test completing a milestone"""
        mock_route = Mock()
        mock_route.id = "test-route"
        mock_route.status = "active"
        
        mock_milestone = Mock()
        mock_milestone.id = "test-milestone"
        mock_milestone.status = "unlocked"
        mock_milestone.order = 1
        
        result = await self.service.complete_milestone(
            self.mock_db,
            mock_route,
            mock_milestone
        )
        
        # Should mark milestone as complete
        assert result["milestone_completed"] == True
        # Should unlock next milestone
        assert result["next_milestone_unlocked"] == True
        # Should update route progress
        assert "progress_percentage" in result
        
    @pytest.mark.asyncio
    async def test_calculate_progress(self):
        """Test route progress calculation"""
        mock_route = Mock()
        mock_route.id = "test-route"
        
        # Mock milestones: 3 total, 1 completed
        mock_milestones = [
            Mock(status="completed"),
            Mock(status="unlocked"),
            Mock(status="locked")
        ]
        
        with patch.object(self.service, 'get_route_milestones', return_value=mock_milestones):
            progress = await self.service.calculate_progress(
                self.mock_db,
                mock_route
            )
        
        # Should be 33% (1 of 3 completed)
        assert progress == pytest.approx(33.33, rel=0.1)
        
    @pytest.mark.asyncio
    async def test_update_route(self):
        """Test updating route details"""
        mock_route = Mock()
        mock_route.id = "test-route"
        mock_route.target_outcome = "Old outcome"
        
        update_data = {
            "target_outcome": "New outcome",
            "timeline_months": 18
        }
        
        result = await self.service.update_route(
            self.mock_db,
            mock_route,
            update_data
        )
        
        # Should update fields
        assert result["updated"] == True
        
    @pytest.mark.asyncio
    async def test_regenerate_milestones(self):
        """Test regenerating milestones for a route"""
        mock_route = Mock()
        mock_route.id = "test-route"
        mock_route.category = RouteCategory.EMPLOYMENT
        mock_route.archetype = ProfessionalArchetype.ACADEMIC_ELITE
        
        result = await self.service.regenerate_milestones(
            self.mock_db,
            mock_route
        )
        
        # Should regenerate milestones
        assert result["milestones_regenerated"] == True
        assert result["milestone_count"] > 0
        
    @pytest.mark.asyncio
    async def test_get_route_with_milestones(self):
        """Test getting route with all milestones"""
        mock_route = Mock()
        mock_route.id = "test-route"
        mock_route.name = "Test Route"
        
        route_data = await self.service.get_route_with_milestones(
            self.mock_db,
            mock_route.id
        )
        
        # Should include route and milestones
        assert "route" in route_data
        assert "milestones" in route_data
        assert "progress_percentage" in route_data
        
    @pytest.mark.asyncio
    async def test_archetype_personalization(self):
        """Test that routes are personalized by archetype"""
        user_id = "test-user"
        route_data = {
            "category": RouteCategory.EMPLOYMENT,
            "target_outcome": "Engineer",
            "target_location": "USA",
            "timeline_months": 12
        }
        
        # Create route with Individual Sovereignty
        route_sovereignty = await self.service.create_route(
            self.mock_db,
            user_id,
            route_data,
            ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY
        )
        
        # Create route with Academic Elite
        route_academic = await self.service.create_route(
            self.mock_db,
            user_id,
            route_data,
            ProfessionalArchetype.ACADEMIC_ELITE
        )
        
        # Milestones should be personalized differently
        milestones_sovereignty = await self.service.get_route_milestones(
            self.mock_db,
            route_sovereignty.id
        )
        
        milestones_academic = await self.service.get_route_milestones(
            self.mock_db,
            route_academic.id
        )
        
        # Descriptions should differ based on archetype
        assert milestones_sovereignty[0].description != milestones_academic[0].description


class TestRouteCategories:
    """Test different route categories"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.mock_db = AsyncMock()
        self.service = RouteBuilderService(self.mock_db)
        self.user_id = "test-user"
        self.archetype = ProfessionalArchetype.CAREER_MASTERY
        
    @pytest.mark.asyncio
    async def test_employment_route(self):
        """Test employment route creation"""
        route_data = {
            "category": RouteCategory.EMPLOYMENT,
            "target_outcome": "Software Engineer",
            "target_location": "USA",
            "timeline_months": 12,
            "job_description": "Looking for engineer"
        }
        
        route = await self.service.create_route(
            self.mock_db,
            self.user_id,
            route_data,
            self.archetype
        )
        
        # Should have ATS integration
        assert route.job_description is not None
        
        # Milestones should include ATS-related tasks
        milestones = await self.service.get_route_milestones(
            self.mock_db,
            route.id
        )
        
        milestone_names = [m.name.lower() for m in milestones]
        assert any("resume" in name or "ats" in name for name in milestone_names)
        
    @pytest.mark.asyncio
    async def test_education_route(self):
        """Test education route creation"""
        route_data = {
            "category": RouteCategory.EDUCATION,
            "target_outcome": "PhD in CS",
            "target_location": "MIT",
            "timeline_months": 24
        }
        
        route = await self.service.create_route(
            self.mock_db,
            self.user_id,
            route_data,
            self.archetype
        )
        
        # Milestones should include education-specific tasks
        milestones = await self.service.get_route_milestones(
            self.mock_db,
            route.id
        )
        
        milestone_names = [m.name.lower() for m in milestones]
        assert any("research" in name or "application" in name for name in milestone_names)
        
    @pytest.mark.asyncio
    async def test_entrepreneurship_route(self):
        """Test entrepreneurship route creation"""
        route_data = {
            "category": RouteCategory.ENTREPRENEURSHIP,
            "target_outcome": "Start SaaS company",
            "target_location": "Remote",
            "timeline_months": 18
        }
        
        route = await self.service.create_route(
            self.mock_db,
            self.user_id,
            route_data,
            self.archetype
        )
        
        # Milestones should include business-specific tasks
        milestones = await self.service.get_route_milestones(
            self.mock_db,
            route.id
        )
        
        milestone_names = [m.name.lower() for m in milestones]
        assert any("business" in name or "startup" in name for name in milestone_names)


class TestMilestoneManagement:
    """Test milestone management functionality"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.mock_db = AsyncMock()
        self.service = RouteBuilderService(self.mock_db)
        
    @pytest.mark.asyncio
    async def test_unlock_first_milestone(self):
        """Test unlocking first milestone when route starts"""
        mock_route = Mock()
        mock_route.id = "test-route"
        
        mock_milestones = [
            Mock(id="m1", order=1, status="locked"),
            Mock(id="m2", order=2, status="locked"),
            Mock(id="m3", order=3, status="locked")
        ]
        
        with patch.object(self.service, 'get_route_milestones', return_value=mock_milestones):
            await self.service.unlock_first_milestone(
                self.mock_db,
                mock_route
            )
        
        # First milestone should be unlocked
        assert mock_milestones[0].status == "unlocked"
        # Others should remain locked
        assert mock_milestones[1].status == "locked"
        assert mock_milestones[2].status == "locked"
        
    @pytest.mark.asyncio
    async def test_unlock_next_milestone(self):
        """Test unlocking next milestone after completion"""
        mock_route = Mock()
        mock_route.id = "test-route"
        
        mock_milestones = [
            Mock(id="m1", order=1, status="completed"),
            Mock(id="m2", order=2, status="locked"),
            Mock(id="m3", order=3, status="locked")
        ]
        
        with patch.object(self.service, 'get_route_milestones', return_value=mock_milestones):
            await self.service.unlock_next_milestone(
                self.mock_db,
                mock_route,
                mock_milestones[0]
            )
        
        # Second milestone should be unlocked
        assert mock_milestones[1].status == "unlocked"
        # Third should remain locked
        assert mock_milestones[2].status == "locked"
        
    @pytest.mark.asyncio
    async def test_complete_task_in_milestone(self):
        """Test completing a task within a milestone"""
        mock_milestone = Mock()
        mock_milestone.id = "test-milestone"
        mock_milestone.tasks = [
            {"name": "Task 1", "completed": False},
            {"name": "Task 2", "completed": False},
            {"name": "Task 3", "completed": False}
        ]
        
        result = await self.service.complete_task(
            self.mock_db,
            mock_milestone,
            task_index=0,
            evidence="Completed task 1"
        )
        
        # Task should be marked complete
        assert result["task_completed"] == True
        assert mock_milestone.tasks[0]["completed"] == True
        
    @pytest.mark.asyncio
    async def test_all_tasks_complete_unlocks_milestone_completion(self):
        """Test that completing all tasks allows milestone completion"""
        mock_milestone = Mock()
        mock_milestone.id = "test-milestone"
        mock_milestone.tasks = [
            {"name": "Task 1", "completed": True},
            {"name": "Task 2", "completed": True},
            {"name": "Task 3", "completed": False}
        ]
        
        # Complete last task
        await self.service.complete_task(
            self.mock_db,
            mock_milestone,
            task_index=2,
            evidence="Completed task 3"
        )
        
        # Check if milestone can be completed
        can_complete = self.service.can_complete_milestone(mock_milestone)
        assert can_complete == True


class TestRouteConfiguration:
    """Test route configuration and validation"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.mock_db = AsyncMock()
        self.service = RouteBuilderService(self.mock_db)
        
    def test_validate_employment_route_config(self):
        """Test employment route configuration validation"""
        config = {
            "category": RouteCategory.EMPLOYMENT,
            "target_outcome": "Engineer",
            "target_location": "USA",
            "timeline_months": 12,
            "job_description": "Looking for engineer"
        }
        
        is_valid = self.service.validate_route_config(config)
        assert is_valid == True
        
    def test_validate_missing_required_fields(self):
        """Test validation fails with missing fields"""
        config = {
            "category": RouteCategory.EMPLOYMENT,
            # Missing target_outcome
            "target_location": "USA",
            "timeline_months": 12
        }
        
        is_valid = self.service.validate_route_config(config)
        assert is_valid == False
        
    def test_validate_timeline_range(self):
        """Test timeline validation"""
        # Too short
        config_short = {
            "category": RouteCategory.EMPLOYMENT,
            "target_outcome": "Engineer",
            "target_location": "USA",
            "timeline_months": 0
        }
        
        is_valid = self.service.validate_route_config(config_short)
        assert is_valid == False
        
        # Too long
        config_long = {
            "category": RouteCategory.EMPLOYMENT,
            "target_outcome": "Engineer",
            "target_location": "USA",
            "timeline_months": 100
        }
        
        is_valid = self.service.validate_route_config(config_long)
        assert is_valid == False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
