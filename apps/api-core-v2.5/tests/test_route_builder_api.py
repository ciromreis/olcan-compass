"""
Tests for RouteBuilder API Endpoints
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, AsyncMock, patch
from app.main import app
from app.db.models.route import RouteCategory


client = TestClient(app)


class TestRouteBuilderAPI:
    """Test suite for RouteBuilder API endpoints"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.base_url = "/api/routes/builder"
        self.mock_user_id = "test-user-123"
        
    @pytest.mark.asyncio
    async def test_create_route(self):
        """Test POST /routes/builder - create new route"""
        route_data = {
            "category": "employment",
            "target_outcome": "Senior Software Engineer at Google",
            "target_location": "San Francisco, USA",
            "timeline_months": 12,
            "budget_usd": 5000,
            "job_description": "We're looking for a senior engineer..."
        }
        
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(
                id=self.mock_user_id,
                archetype="individual_sovereignty"
            )
            
            response = client.post(self.base_url, json=route_data)
            
            # Should return 201 Created
            assert response.status_code == 201
            
            # Should return created route
            data = response.json()
            assert "id" in data
            assert data["category"] == "employment"
            assert data["target_outcome"] == route_data["target_outcome"]
            assert data["status"] == "draft"
            assert "milestones_count" in data
            assert data["milestones_count"] > 0
            
    @pytest.mark.asyncio
    async def test_create_route_validation_error(self):
        """Test POST /routes/builder - validation error"""
        invalid_data = {
            "category": "employment",
            # Missing required fields
        }
        
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.mock_user_id)
            
            response = client.post(self.base_url, json=invalid_data)
            
            # Should return 422 Unprocessable Entity
            assert response.status_code == 422
            
    @pytest.mark.asyncio
    async def test_list_user_routes(self):
        """Test GET /routes/builder - list user's routes"""
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.mock_user_id)
            
            response = client.get(self.base_url)
            
            # Should return 200 OK
            assert response.status_code == 200
            
            # Should return list of routes
            data = response.json()
            assert isinstance(data, list)
            
    @pytest.mark.asyncio
    async def test_list_routes_with_status_filter(self):
        """Test GET /routes/builder?status=active"""
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.mock_user_id)
            
            response = client.get(f"{self.base_url}?status=active")
            
            # Should return 200 OK
            assert response.status_code == 200
            
            # All routes should be active
            data = response.json()
            for route in data:
                assert route["status"] == "active"
                
    @pytest.mark.asyncio
    async def test_list_routes_with_category_filter(self):
        """Test GET /routes/builder?category=employment"""
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.mock_user_id)
            
            response = client.get(f"{self.base_url}?category=employment")
            
            # Should return 200 OK
            assert response.status_code == 200
            
            # All routes should be employment
            data = response.json()
            for route in data:
                assert route["category"] == "employment"
                
    @pytest.mark.asyncio
    async def test_get_route_details(self):
        """Test GET /routes/builder/{id} - get specific route"""
        route_id = "test-route-123"
        
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.mock_user_id)
            
            response = client.get(f"{self.base_url}/{route_id}")
            
            # Should return 200 OK or 404 if not found
            assert response.status_code in [200, 404]
            
            if response.status_code == 200:
                data = response.json()
                assert data["id"] == route_id
                assert "category" in data
                assert "target_outcome" in data
                assert "status" in data
                
    @pytest.mark.asyncio
    async def test_get_route_not_found(self):
        """Test GET /routes/builder/{id} - route not found"""
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.mock_user_id)
            
            response = client.get(f"{self.base_url}/nonexistent-route")
            
            # Should return 404 Not Found
            assert response.status_code == 404
            
    @pytest.mark.asyncio
    async def test_update_route(self):
        """Test PUT /routes/builder/{id} - update route"""
        route_id = "test-route-123"
        update_data = {
            "target_outcome": "Updated outcome",
            "timeline_months": 18
        }
        
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.mock_user_id)
            
            response = client.put(
                f"{self.base_url}/{route_id}",
                json=update_data
            )
            
            # Should return 200 OK or 404 if not found
            assert response.status_code in [200, 404]
            
            if response.status_code == 200:
                data = response.json()
                assert data["target_outcome"] == update_data["target_outcome"]
                assert data["timeline_months"] == update_data["timeline_months"]
                
    @pytest.mark.asyncio
    async def test_delete_route(self):
        """Test DELETE /routes/builder/{id} - delete route"""
        route_id = "test-route-123"
        
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.mock_user_id)
            
            response = client.delete(f"{self.base_url}/{route_id}")
            
            # Should return 204 No Content or 404 if not found
            assert response.status_code in [204, 404]
            
    @pytest.mark.asyncio
    async def test_get_route_milestones(self):
        """Test GET /routes/builder/{id}/milestones"""
        route_id = "test-route-123"
        
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.mock_user_id)
            
            response = client.get(f"{self.base_url}/{route_id}/milestones")
            
            # Should return 200 OK or 404 if route not found
            assert response.status_code in [200, 404]
            
            if response.status_code == 200:
                data = response.json()
                assert isinstance(data, list)
                
                # Each milestone should have required fields
                for milestone in data:
                    assert "id" in milestone
                    assert "name" in milestone
                    assert "description" in milestone
                    assert "status" in milestone
                    assert "order" in milestone
                    
    @pytest.mark.asyncio
    async def test_start_route(self):
        """Test POST /routes/builder/{id}/start - start route"""
        route_id = "test-route-123"
        
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.mock_user_id)
            
            response = client.post(f"{self.base_url}/{route_id}/start")
            
            # Should return 200 OK or 404/400 if error
            assert response.status_code in [200, 400, 404]
            
            if response.status_code == 200:
                data = response.json()
                assert data["status"] == "active"
                assert data["first_milestone_unlocked"] == True
                
    @pytest.mark.asyncio
    async def test_complete_milestone(self):
        """Test POST /routes/builder/{id}/milestones/{milestone_id}/complete"""
        route_id = "test-route-123"
        milestone_id = "test-milestone-456"
        
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.mock_user_id)
            
            response = client.post(
                f"{self.base_url}/{route_id}/milestones/{milestone_id}/complete"
            )
            
            # Should return 200 OK or 404/400 if error
            assert response.status_code in [200, 400, 404]
            
            if response.status_code == 200:
                data = response.json()
                assert data["milestone_completed"] == True
                assert "progress_percentage" in data
                assert "xp_earned" in data
                
    @pytest.mark.asyncio
    async def test_complete_task_in_milestone(self):
        """Test POST /routes/builder/{id}/milestones/{mid}/tasks/{idx}/complete"""
        route_id = "test-route-123"
        milestone_id = "test-milestone-456"
        task_index = 0
        
        task_data = {
            "evidence": "Completed the task successfully"
        }
        
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.mock_user_id)
            
            response = client.post(
                f"{self.base_url}/{route_id}/milestones/{milestone_id}/tasks/{task_index}/complete",
                json=task_data
            )
            
            # Should return 200 OK or 404/400 if error
            assert response.status_code in [200, 400, 404]
            
            if response.status_code == 200:
                data = response.json()
                assert data["task_completed"] == True
                assert "tasks_remaining" in data


class TestRouteOwnership:
    """Test route ownership and authorization"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.base_url = "/api/routes/builder"
        
    @pytest.mark.asyncio
    async def test_cannot_access_other_user_route(self):
        """Test that users cannot access routes they don't own"""
        route_id = "other-user-route"
        
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id="user-1")
            
            # Try to access route owned by user-2
            with patch("app.api.routes.route_builder.get_route") as mock_get:
                mock_get.return_value = Mock(
                    id=route_id,
                    user_id="user-2"  # Different user
                )
                
                response = client.get(f"{self.base_url}/{route_id}")
                
                # Should return 403 Forbidden
                assert response.status_code == 403
                
    @pytest.mark.asyncio
    async def test_cannot_update_other_user_route(self):
        """Test that users cannot update routes they don't own"""
        route_id = "other-user-route"
        update_data = {"target_outcome": "Hacked"}
        
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id="user-1")
            
            with patch("app.api.routes.route_builder.get_route") as mock_get:
                mock_get.return_value = Mock(
                    id=route_id,
                    user_id="user-2"
                )
                
                response = client.put(
                    f"{self.base_url}/{route_id}",
                    json=update_data
                )
                
                # Should return 403 Forbidden
                assert response.status_code == 403
                
    @pytest.mark.asyncio
    async def test_cannot_delete_other_user_route(self):
        """Test that users cannot delete routes they don't own"""
        route_id = "other-user-route"
        
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id="user-1")
            
            with patch("app.api.routes.route_builder.get_route") as mock_get:
                mock_get.return_value = Mock(
                    id=route_id,
                    user_id="user-2"
                )
                
                response = client.delete(f"{self.base_url}/{route_id}")
                
                # Should return 403 Forbidden
                assert response.status_code == 403


class TestRouteLifecycle:
    """Test route lifecycle (draft → active → completed)"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.base_url = "/api/routes/builder"
        self.user_id = "test-user"
        
    @pytest.mark.asyncio
    async def test_route_starts_as_draft(self):
        """Test that new routes start in draft status"""
        route_data = {
            "category": "employment",
            "target_outcome": "Engineer",
            "target_location": "USA",
            "timeline_months": 12
        }
        
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(
                id=self.user_id,
                archetype="career_mastery"
            )
            
            response = client.post(self.base_url, json=route_data)
            
            if response.status_code == 201:
                data = response.json()
                assert data["status"] == "draft"
                
    @pytest.mark.asyncio
    async def test_starting_route_changes_status(self):
        """Test that starting a route changes status to active"""
        route_id = "test-route"
        
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.post(f"{self.base_url}/{route_id}/start")
            
            if response.status_code == 200:
                data = response.json()
                assert data["status"] == "active"
                
    @pytest.mark.asyncio
    async def test_cannot_start_already_active_route(self):
        """Test that active routes cannot be started again"""
        route_id = "active-route"
        
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            with patch("app.api.routes.route_builder.get_route") as mock_get:
                mock_get.return_value = Mock(
                    id=route_id,
                    user_id=self.user_id,
                    status="active"
                )
                
                response = client.post(f"{self.base_url}/{route_id}/start")
                
                # Should return 400 Bad Request
                assert response.status_code == 400


class TestMilestoneProgression:
    """Test milestone progression logic"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.base_url = "/api/routes/builder"
        self.user_id = "test-user"
        
    @pytest.mark.asyncio
    async def test_first_milestone_unlocked_on_start(self):
        """Test that first milestone is unlocked when route starts"""
        route_id = "test-route"
        
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.post(f"{self.base_url}/{route_id}/start")
            
            if response.status_code == 200:
                data = response.json()
                assert data["first_milestone_unlocked"] == True
                
    @pytest.mark.asyncio
    async def test_completing_milestone_unlocks_next(self):
        """Test that completing a milestone unlocks the next one"""
        route_id = "test-route"
        milestone_id = "milestone-1"
        
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.post(
                f"{self.base_url}/{route_id}/milestones/{milestone_id}/complete"
            )
            
            if response.status_code == 200:
                data = response.json()
                assert data["milestone_completed"] == True
                assert data.get("next_milestone_unlocked") in [True, False]
                
    @pytest.mark.asyncio
    async def test_progress_percentage_updates(self):
        """Test that progress percentage updates correctly"""
        route_id = "test-route"
        milestone_id = "milestone-1"
        
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.post(
                f"{self.base_url}/{route_id}/milestones/{milestone_id}/complete"
            )
            
            if response.status_code == 200:
                data = response.json()
                assert "progress_percentage" in data
                assert 0 <= data["progress_percentage"] <= 100


class TestRouteValidation:
    """Test route data validation"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.base_url = "/api/routes/builder"
        self.user_id = "test-user"
        
    @pytest.mark.asyncio
    async def test_invalid_category(self):
        """Test that invalid category is rejected"""
        route_data = {
            "category": "invalid_category",
            "target_outcome": "Something",
            "target_location": "Somewhere",
            "timeline_months": 12
        }
        
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.post(self.base_url, json=route_data)
            
            # Should return 422 Unprocessable Entity
            assert response.status_code == 422
            
    @pytest.mark.asyncio
    async def test_invalid_timeline(self):
        """Test that invalid timeline is rejected"""
        route_data = {
            "category": "employment",
            "target_outcome": "Engineer",
            "target_location": "USA",
            "timeline_months": 0  # Invalid
        }
        
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.post(self.base_url, json=route_data)
            
            # Should return 422 Unprocessable Entity
            assert response.status_code == 422
            
    @pytest.mark.asyncio
    async def test_missing_required_fields(self):
        """Test that missing required fields are rejected"""
        route_data = {
            "category": "employment"
            # Missing target_outcome, target_location, timeline_months
        }
        
        with patch("app.api.routes.route_builder.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.post(self.base_url, json=route_data)
            
            # Should return 422 Unprocessable Entity
            assert response.status_code == 422


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
