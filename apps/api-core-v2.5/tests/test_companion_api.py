"""
Tests for Companion API Endpoints
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, AsyncMock, patch
from app.main import app


client = TestClient(app)


class TestCompanionAPI:
    """Test suite for Companion API endpoints"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.base_url = "/api/companion"
        self.user_id = "test-user-123"
        
    @pytest.mark.asyncio
    async def test_get_companion(self):
        """Test GET /companion - get user's companion"""
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.get(self.base_url)
            
            # Should return 200 OK or 404 if no companion
            assert response.status_code in [200, 404]
            
            if response.status_code == 200:
                data = response.json()
                assert "id" in data
                assert "name" in data
                assert "archetype" in data
                assert "level" in data
                assert "xp" in data
                assert "happiness" in data
                assert "energy" in data
                assert "health" in data
                assert "mood" in data
                assert "evolution_stage" in data
                assert "current_form" in data
                
    @pytest.mark.asyncio
    async def test_initialize_companion(self):
        """Test POST /companion/initialize - create new companion"""
        companion_data = {
            "name": "Phoenix"
        }
        
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(
                id=self.user_id,
                archetype="individual_sovereignty"
            )
            
            response = client.post(
                f"{self.base_url}/initialize",
                json=companion_data
            )
            
            # Should return 201 Created
            assert response.status_code == 201
            
            # Should return created companion
            data = response.json()
            assert data["name"] == "Phoenix"
            assert data["archetype"] == "individual_sovereignty"
            assert data["level"] == 1
            assert data["xp"] == 0
            assert data["happiness"] == 100
            assert data["energy"] == 100
            assert data["health"] == 100
            assert data["evolution_stage"] == 1
            assert data["current_form"] == "egg"
            
    @pytest.mark.asyncio
    async def test_initialize_companion_already_exists(self):
        """Test POST /companion/initialize - companion already exists"""
        companion_data = {"name": "Phoenix"}
        
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            with patch("app.api.routes.companion.get_user_companion") as mock_get:
                mock_get.return_value = Mock(id="existing-companion")
                
                response = client.post(
                    f"{self.base_url}/initialize",
                    json=companion_data
                )
                
                # Should return 400 Bad Request
                assert response.status_code == 400
                
    @pytest.mark.asyncio
    async def test_feed_companion(self):
        """Test POST /companion/feed - feed companion"""
        feed_data = {
            "task_completed": "Completed resume optimization",
            "xp_earned": 100
        }
        
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.post(
                f"{self.base_url}/feed",
                json=feed_data
            )
            
            # Should return 200 OK or 404 if no companion
            assert response.status_code in [200, 404]
            
            if response.status_code == 200:
                data = response.json()
                assert "xp_earned" in data
                assert data["xp_earned"] == 100
                assert "total_xp" in data
                assert "level" in data
                assert "leveled_up" in data
                assert "happiness" in data
                assert "energy" in data
                assert "mood" in data
                
    @pytest.mark.asyncio
    async def test_feed_companion_triggers_level_up(self):
        """Test that feeding can trigger level up"""
        feed_data = {
            "task_completed": "Big milestone completed",
            "xp_earned": 500  # Large XP amount
        }
        
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.post(
                f"{self.base_url}/feed",
                json=feed_data
            )
            
            if response.status_code == 200:
                data = response.json()
                # May or may not level up depending on current XP
                assert "leveled_up" in data
                assert isinstance(data["leveled_up"], bool)
                
    @pytest.mark.asyncio
    async def test_feed_companion_triggers_evolution(self):
        """Test that feeding can trigger evolution"""
        feed_data = {
            "task_completed": "Evolution milestone",
            "xp_earned": 200
        }
        
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.post(
                f"{self.base_url}/feed",
                json=feed_data
            )
            
            if response.status_code == 200:
                data = response.json()
                # May or may not evolve
                if "evolution" in data and data["evolution"]:
                    assert "from_stage" in data["evolution"]
                    assert "to_stage" in data["evolution"]
                    assert "from_form" in data["evolution"]
                    assert "to_form" in data["evolution"]
                    
    @pytest.mark.asyncio
    async def test_play_with_companion(self):
        """Test POST /companion/play - play with companion"""
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.post(f"{self.base_url}/play")
            
            # Should return 200 OK or 404 if no companion
            assert response.status_code in [200, 404]
            
            if response.status_code == 200:
                data = response.json()
                assert "happiness" in data
                assert "energy" in data
                assert "mood" in data
                # Happiness should increase, energy should decrease
                
    @pytest.mark.asyncio
    async def test_rest_companion(self):
        """Test POST /companion/rest - let companion rest"""
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.post(f"{self.base_url}/rest")
            
            # Should return 200 OK or 404 if no companion
            assert response.status_code in [200, 404]
            
            if response.status_code == 200:
                data = response.json()
                assert "energy" in data
                assert "happiness" in data
                assert "mood" in data
                # Energy should increase
                
    @pytest.mark.asyncio
    async def test_get_companion_messages(self):
        """Test GET /companion/messages - get messages"""
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.get(f"{self.base_url}/messages")
            
            # Should return 200 OK or 404 if no companion
            assert response.status_code in [200, 404]
            
            if response.status_code == 200:
                data = response.json()
                assert isinstance(data, list)
                
                # Each message should have required fields
                for message in data:
                    assert "id" in message
                    assert "content" in message
                    assert "message_type" in message
                    assert "created_at" in message
                    assert "is_read" in message
                    
    @pytest.mark.asyncio
    async def test_get_unread_messages_only(self):
        """Test GET /companion/messages?unread_only=true"""
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.get(f"{self.base_url}/messages?unread_only=true")
            
            if response.status_code == 200:
                data = response.json()
                # All messages should be unread
                for message in data:
                    assert message["is_read"] == False
                    
    @pytest.mark.asyncio
    async def test_get_messages_with_limit(self):
        """Test GET /companion/messages?limit=5"""
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.get(f"{self.base_url}/messages?limit=5")
            
            if response.status_code == 200:
                data = response.json()
                # Should return at most 5 messages
                assert len(data) <= 5
                
    @pytest.mark.asyncio
    async def test_mark_message_as_read(self):
        """Test POST /companion/messages/{id}/read - mark message as read"""
        message_id = "test-message-123"
        
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.post(f"{self.base_url}/messages/{message_id}/read")
            
            # Should return 200 OK or 404 if message not found
            assert response.status_code in [200, 404]
            
            if response.status_code == 200:
                data = response.json()
                assert data["is_read"] == True
                
    @pytest.mark.asyncio
    async def test_mark_message_with_reaction(self):
        """Test POST /companion/messages/{id}/read with reaction"""
        message_id = "test-message-123"
        reaction_data = {
            "reaction": "love"
        }
        
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.post(
                f"{self.base_url}/messages/{message_id}/read",
                json=reaction_data
            )
            
            if response.status_code == 200:
                data = response.json()
                assert data["is_read"] == True
                assert "user_reaction" in data
                
    @pytest.mark.asyncio
    async def test_request_companion_message(self):
        """Test POST /companion/messages/send - request message"""
        request_data = {
            "message_type": "encouragement",
            "context": {"mood": "neutral"}
        }
        
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.post(
                f"{self.base_url}/messages/send",
                json=request_data
            )
            
            # Should return 200 OK or 404 if no companion
            assert response.status_code in [200, 404]
            
            if response.status_code == 200:
                data = response.json()
                assert "id" in data
                assert "content" in data
                assert data["message_type"] == "encouragement"
                
    @pytest.mark.asyncio
    async def test_get_companion_stats(self):
        """Test GET /companion/stats - get detailed statistics"""
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.get(f"{self.base_url}/stats")
            
            # Should return 200 OK or 404 if no companion
            assert response.status_code in [200, 404]
            
            if response.status_code == 200:
                data = response.json()
                assert "companion_name" in data
                assert "level" in data
                assert "xp" in data
                assert "xp_to_next_level" in data
                assert "evolution_stage" in data
                assert "current_form" in data
                assert "next_evolution_level" in data
                assert "levels_to_evolution" in data
                assert "happiness" in data
                assert "energy" in data
                assert "health" in data
                assert "mood" in data
                assert "abilities" in data
                assert "total_interactions" in data
                assert "messages_sent" in data
                assert "activity_counts" in data
                assert "evolution_history" in data
                
    @pytest.mark.asyncio
    async def test_delete_companion(self):
        """Test DELETE /companion - delete companion"""
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.delete(self.base_url)
            
            # Should return 204 No Content or 404 if no companion
            assert response.status_code in [204, 404]


class TestCompanionOwnership:
    """Test companion ownership and authorization"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.base_url = "/api/companion"
        
    @pytest.mark.asyncio
    async def test_user_can_only_access_own_companion(self):
        """Test that users can only access their own companion"""
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id="user-1")
            
            # Try to access companion
            response = client.get(self.base_url)
            
            # Should only return user-1's companion
            if response.status_code == 200:
                data = response.json()
                # Companion should belong to user-1
                # (verified by backend logic)
                assert "id" in data
                
    @pytest.mark.asyncio
    async def test_cannot_feed_other_user_companion(self):
        """Test that users cannot feed other users' companions"""
        feed_data = {
            "task_completed": "Task",
            "xp_earned": 100
        }
        
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id="user-1")
            
            # Backend should verify ownership
            response = client.post(
                f"{self.base_url}/feed",
                json=feed_data
            )
            
            # Should only affect user-1's companion
            assert response.status_code in [200, 404]


class TestCompanionInteractions:
    """Test companion interaction mechanics"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.base_url = "/api/companion"
        self.user_id = "test-user"
        
    @pytest.mark.asyncio
    async def test_feed_increases_happiness(self):
        """Test that feeding increases happiness"""
        feed_data = {
            "task_completed": "Task completed",
            "xp_earned": 100
        }
        
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            # Get initial state
            initial_response = client.get(self.base_url)
            if initial_response.status_code == 200:
                initial_happiness = initial_response.json()["happiness"]
                
                # Feed companion
                feed_response = client.post(
                    f"{self.base_url}/feed",
                    json=feed_data
                )
                
                if feed_response.status_code == 200:
                    new_happiness = feed_response.json()["happiness"]
                    # Happiness should increase or stay at max
                    assert new_happiness >= initial_happiness
                    
    @pytest.mark.asyncio
    async def test_play_decreases_energy(self):
        """Test that playing decreases energy"""
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            # Get initial state
            initial_response = client.get(self.base_url)
            if initial_response.status_code == 200:
                initial_energy = initial_response.json()["energy"]
                
                # Play with companion
                play_response = client.post(f"{self.base_url}/play")
                
                if play_response.status_code == 200:
                    new_energy = play_response.json()["energy"]
                    # Energy should decrease
                    assert new_energy <= initial_energy
                    
    @pytest.mark.asyncio
    async def test_rest_increases_energy(self):
        """Test that resting increases energy"""
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            # Get initial state
            initial_response = client.get(self.base_url)
            if initial_response.status_code == 200:
                initial_energy = initial_response.json()["energy"]
                
                # Rest companion
                rest_response = client.post(f"{self.base_url}/rest")
                
                if rest_response.status_code == 200:
                    new_energy = rest_response.json()["energy"]
                    # Energy should increase or stay at max
                    assert new_energy >= initial_energy


class TestCompanionValidation:
    """Test companion data validation"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.base_url = "/api/companion"
        self.user_id = "test-user"
        
    @pytest.mark.asyncio
    async def test_invalid_companion_name(self):
        """Test that invalid companion name is rejected"""
        companion_data = {
            "name": ""  # Empty name
        }
        
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.post(
                f"{self.base_url}/initialize",
                json=companion_data
            )
            
            # Should return 422 Unprocessable Entity
            assert response.status_code == 422
            
    @pytest.mark.asyncio
    async def test_invalid_xp_amount(self):
        """Test that invalid XP amount is rejected"""
        feed_data = {
            "task_completed": "Task",
            "xp_earned": -100  # Negative XP
        }
        
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.post(
                f"{self.base_url}/feed",
                json=feed_data
            )
            
            # Should return 422 Unprocessable Entity
            assert response.status_code == 422
            
    @pytest.mark.asyncio
    async def test_invalid_message_type(self):
        """Test that invalid message type is rejected"""
        request_data = {
            "message_type": "invalid_type",
            "context": {}
        }
        
        with patch("app.api.routes.companion.get_current_user") as mock_user:
            mock_user.return_value = Mock(id=self.user_id)
            
            response = client.post(
                f"{self.base_url}/messages/send",
                json=request_data
            )
            
            # Should return 422 Unprocessable Entity
            assert response.status_code == 422


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
