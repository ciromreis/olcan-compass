"""
Integration Tests - End-to-End User Flows
Tests complete user journeys through the system
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.models.psychology import ProfessionalArchetype as Archetype, ArchetypeConfig
from app.db.models.companion import Companion, CompanionMessage
from app.db.models.route import Route


class TestOnboardingFlow:
    """Test complete onboarding flow"""
    
    def test_complete_onboarding_flow(self, client: TestClient, db: Session, test_user):
        """Test: User selects archetype and initializes companion"""
        
        # Step 1: Get available archetypes
        response = client.get("/api/archetypes")
        assert response.status_code == 200
        archetypes = response.json()
        assert len(archetypes) > 0
        
        # Step 2: Get archetype details
        archetype = archetypes[0]
        response = client.get(f"/api/archetypes/{archetype['archetype']}")
        assert response.status_code == 200
        details = response.json()
        assert details['archetype'] == archetype['archetype']
        
        # Step 3: Get recommendation
        response = client.get("/api/archetypes/recommend/for-user")
        assert response.status_code == 200
        recommendation = response.json()
        assert 'recommended_archetype' in recommendation
        assert 'confidence_score' in recommendation
        
        # Step 4: Initialize companion with selected archetype
        companion_data = {
            "archetype": archetype['archetype'],
            "name": "TestCompanion"
        }
        response = client.post("/api/companion/initialize", json=companion_data)
        assert response.status_code == 200
        companion = response.json()
        assert companion['name'] == "TestCompanion"
        assert companion['archetype'] == archetype['archetype']
        assert companion['stage'] == 0  # Egg stage
        
        # Step 5: Verify companion was created
        response = client.get("/api/companion")
        assert response.status_code == 200
        fetched_companion = response.json()
        assert fetched_companion['id'] == companion['id']


class TestRouteCreationFlow:
    """Test complete route creation flow"""
    
    def test_complete_route_creation_flow(self, client: TestClient, db: Session, test_user, test_companion):
        """Test: User creates a route and views milestones"""
        
        # Step 1: Create route
        route_data = {
            "category": "employment",
            "target_outcome": "Senior Software Engineer",
            "target_location": "San Francisco, CA",
            "timeline_months": 12,
            "risk_tolerance": "medium"
        }
        response = client.post("/api/routes/builder", json=route_data)
        assert response.status_code == 200
        route = response.json()
        assert route['category'] == "employment"
        assert route['status'] == "draft"
        
        # Step 2: Get route details
        response = client.get(f"/api/routes/builder/{route['id']}")
        assert response.status_code == 200
        route_details = response.json()
        assert route_details['id'] == route['id']
        
        # Step 3: Activate route
        response = client.post(f"/api/routes/builder/{route['id']}/activate")
        assert response.status_code == 200
        activated_route = response.json()
        assert activated_route['status'] == "active"
        
        # Step 4: Get milestones
        response = client.get(f"/api/routes/builder/{route['id']}/milestones")
        assert response.status_code == 200
        milestones = response.json()
        assert len(milestones) > 0
        
        # Step 5: Verify milestone structure
        milestone = milestones[0]
        assert 'title' in milestone
        assert 'description' in milestone
        assert 'tasks' in milestone
        assert len(milestone['tasks']) > 0


class TestCompanionInteractionFlow:
    """Test complete companion interaction flow"""
    
    def test_complete_companion_interaction_flow(self, client: TestClient, db: Session, test_user, test_companion):
        """Test: User interacts with companion and receives messages"""
        
        companion_id = test_companion.id
        
        # Step 1: Get companion status
        response = client.get("/api/companion")
        assert response.status_code == 200
        companion = response.json()
        initial_health = companion['stats']['health']
        initial_xp = companion['stats']['experience']
        
        # Step 2: Feed companion
        response = client.post(f"/api/companion/{companion_id}/feed")
        assert response.status_code == 200
        result = response.json()
        assert result['success'] is True
        assert result['stats']['health'] >= initial_health
        
        # Step 3: Play with companion
        response = client.post(f"/api/companion/{companion_id}/play")
        assert response.status_code == 200
        result = response.json()
        assert result['success'] is True
        assert result['stats']['happiness'] > 0
        
        # Step 4: Rest companion
        response = client.post(f"/api/companion/{companion_id}/rest")
        assert response.status_code == 200
        result = response.json()
        assert result['success'] is True
        assert result['stats']['energy'] > 0
        
        # Step 5: Get messages
        response = client.get(f"/api/companion/{companion_id}/messages")
        assert response.status_code == 200
        messages = response.json()
        assert isinstance(messages, list)
        
        # Step 6: Mark message as read (if messages exist)
        if len(messages) > 0:
            message_id = messages[0]['id']
            response = client.post(f"/api/companion/messages/{message_id}/read")
            assert response.status_code == 200


class TestProgressTrackingFlow:
    """Test complete progress tracking flow"""
    
    def test_complete_progress_tracking_flow(self, client: TestClient, db: Session, test_user, test_route_with_milestones):
        """Test: User completes tasks and milestones"""
        
        route = test_route_with_milestones
        
        # Step 1: Get route with milestones
        response = client.get(f"/api/routes/builder/{route.id}")
        assert response.status_code == 200
        route_data = response.json()
        milestones = route_data['milestones']
        assert len(milestones) > 0
        
        milestone = milestones[0]
        tasks = milestone['tasks']
        assert len(tasks) > 0
        
        # Step 2: Complete first task
        task_id = tasks[0]['id']
        response = client.post(f"/api/routes/builder/tasks/{task_id}/complete")
        assert response.status_code == 200
        completed_task = response.json()
        assert completed_task['is_completed'] is True
        
        # Step 3: Complete remaining tasks
        for task in tasks[1:]:
            response = client.post(f"/api/routes/builder/tasks/{task['id']}/complete")
            assert response.status_code == 200
        
        # Step 4: Complete milestone
        milestone_id = milestone['id']
        response = client.post(f"/api/routes/builder/milestones/{milestone_id}/complete")
        assert response.status_code == 200
        completed_milestone = response.json()
        assert completed_milestone['is_completed'] is True
        
        # Step 5: Verify route progress updated
        response = client.get(f"/api/routes/builder/{route.id}")
        assert response.status_code == 200
        updated_route = response.json()
        assert updated_route['progress_percentage'] > 0


class TestArchetypeComparisonFlow:
    """Test archetype comparison flow"""
    
    def test_archetype_comparison_flow(self, client: TestClient, db: Session, test_user):
        """Test: User compares two archetypes"""
        
        # Step 1: Get available archetypes
        response = client.get("/api/archetypes")
        assert response.status_code == 200
        archetypes = response.json()
        assert len(archetypes) >= 2
        
        # Step 2: Compare two archetypes
        archetype1 = archetypes[0]['archetype']
        archetype2 = archetypes[1]['archetype']
        response = client.get(f"/api/archetypes/compare/{archetype1}/{archetype2}")
        assert response.status_code == 200
        comparison = response.json()
        
        # Step 3: Verify comparison structure
        assert 'archetype1' in comparison
        assert 'archetype2' in comparison
        assert 'similarities' in comparison
        assert 'differences' in comparison
        assert comparison['archetype1']['archetype'] == archetype1
        assert comparison['archetype2']['archetype'] == archetype2


class TestMultipleRoutesFlow:
    """Test managing multiple routes"""
    
    def test_multiple_routes_flow(self, client: TestClient, db: Session, test_user, test_companion):
        """Test: User creates and manages multiple routes"""
        
        # Step 1: Create first route (employment)
        route1_data = {
            "category": "employment",
            "target_outcome": "Senior Engineer",
            "timeline_months": 12
        }
        response = client.post("/api/routes/builder", json=route1_data)
        assert response.status_code == 200
        route1 = response.json()
        
        # Step 2: Create second route (education)
        route2_data = {
            "category": "education",
            "target_outcome": "Master's Degree",
            "timeline_months": 24
        }
        response = client.post("/api/routes/builder", json=route2_data)
        assert response.status_code == 200
        route2 = response.json()
        
        # Step 3: Get all routes
        response = client.get("/api/routes/builder")
        assert response.status_code == 200
        routes = response.json()
        assert len(routes) >= 2
        
        # Step 4: Activate first route
        response = client.post(f"/api/routes/builder/{route1['id']}/activate")
        assert response.status_code == 200
        
        # Step 5: Verify only one active route
        response = client.get("/api/routes/builder")
        assert response.status_code == 200
        routes = response.json()
        active_routes = [r for r in routes if r['status'] == 'active']
        assert len(active_routes) == 1


class TestCompanionEvolutionFlow:
    """Test companion evolution through interactions"""
    
    def test_companion_evolution_flow(self, client: TestClient, db: Session, test_user, test_companion):
        """Test: Companion evolves through repeated interactions"""
        
        companion_id = test_companion.id
        
        # Step 1: Get initial stage
        response = client.get("/api/companion")
        assert response.status_code == 200
        companion = response.json()
        initial_stage = companion['stage']
        initial_xp = companion['stats']['experience']
        
        # Step 2: Perform multiple interactions to gain XP
        for _ in range(10):
            # Feed
            response = client.post(f"/api/companion/{companion_id}/feed")
            assert response.status_code == 200
            
            # Play
            response = client.post(f"/api/companion/{companion_id}/play")
            assert response.status_code == 200
            
            # Rest
            response = client.post(f"/api/companion/{companion_id}/rest")
            assert response.status_code == 200
        
        # Step 3: Check if XP increased
        response = client.get("/api/companion")
        assert response.status_code == 200
        companion = response.json()
        assert companion['stats']['experience'] > initial_xp
        
        # Step 4: Verify evolution message if stage changed
        if companion['stage'] > initial_stage:
            response = client.get(f"/api/companion/{companion_id}/messages")
            assert response.status_code == 200
            messages = response.json()
            evolution_messages = [m for m in messages if m['message_type'] == 'evolution']
            assert len(evolution_messages) > 0


class TestErrorHandlingFlow:
    """Test error handling in various scenarios"""
    
    def test_invalid_archetype_selection(self, client: TestClient, db: Session, test_user):
        """Test: System handles invalid archetype gracefully"""
        
        companion_data = {
            "archetype": "invalid_archetype",
            "name": "TestCompanion"
        }
        response = client.post("/api/companion/initialize", json=companion_data)
        assert response.status_code in [400, 404]
    
    def test_duplicate_companion_creation(self, client: TestClient, db: Session, test_user, test_companion):
        """Test: System prevents duplicate companion creation"""
        
        companion_data = {
            "archetype": "achiever",
            "name": "AnotherCompanion"
        }
        response = client.post("/api/companion/initialize", json=companion_data)
        assert response.status_code == 400
    
    def test_invalid_route_category(self, client: TestClient, db: Session, test_user):
        """Test: System handles invalid route category"""
        
        route_data = {
            "category": "invalid_category",
            "target_outcome": "Test",
            "timeline_months": 12
        }
        response = client.post("/api/routes/builder", json=route_data)
        assert response.status_code == 422
    
    def test_complete_nonexistent_task(self, client: TestClient, db: Session, test_user):
        """Test: System handles completing non-existent task"""
        
        response = client.post("/api/routes/builder/tasks/nonexistent-id/complete")
        assert response.status_code == 404


# Fixtures for integration tests
@pytest.fixture
def test_route_with_milestones(db: Session, test_user, test_companion):
    """Create a test route with milestones and tasks"""
    from app.db.models.route import Route
    
    # Create route
    route = Route(
        user_id=test_user.id,
        category="employment",
        target_outcome="Test Engineer",
        timeline_months=12,
        status="active"
    )
    db.add(route)
    db.commit()
    db.refresh(route)
    
    # Create milestone
    milestone = Milestone(
        route_id=route.id,
        title="Test Milestone",
        description="Test milestone description",
        order_index=0,
        estimated_duration_days=30
    )
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    
    # Create tasks
    for i in range(3):
        task = Task(
            milestone_id=milestone.id,
            title=f"Test Task {i+1}",
            description=f"Test task {i+1} description",
            order_index=i
        )
        db.add(task)
    
    db.commit()
    return route
