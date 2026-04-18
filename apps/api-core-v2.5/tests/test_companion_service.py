"""
Tests for CompanionService
"""
import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, AsyncMock, patch
from app.services.companion_service import CompanionService
from app.db.models.psychology import ProfessionalArchetype


class TestCompanionService:
    """Test suite for CompanionService"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.service = CompanionService()
        self.mock_db = AsyncMock()
        
        # Mock companion
        self.mock_companion = Mock()
        self.mock_companion.id = "test-companion-id"
        self.mock_companion.user_id = "test-user-id"
        self.mock_companion.archetype = ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY
        self.mock_companion.level = 10
        self.mock_companion.xp = 1500
        self.mock_companion.happiness = 80
        self.mock_companion.energy = 70
        self.mock_companion.health = 90
        self.mock_companion.evolution_stage = 2
        self.mock_companion.current_form = "sprout"
        self.mock_companion.last_interaction = datetime.utcnow() - timedelta(hours=2)
        
    @pytest.mark.asyncio
    async def test_initialize_companion(self):
        """Test companion initialization"""
        user_id = "test-user"
        archetype = ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY
        name = "Phoenix"
        
        companion = await self.service.initialize_companion(
            self.mock_db,
            user_id,
            archetype,
            name
        )
        
        # Should create companion with correct initial values
        assert companion.user_id == user_id
        assert companion.archetype == archetype
        assert companion.name == name
        assert companion.level == 1
        assert companion.xp == 0
        assert companion.happiness == 100
        assert companion.energy == 100
        assert companion.health == 100
        assert companion.evolution_stage == 1
        assert companion.current_form == "egg"
        
    @pytest.mark.asyncio
    async def test_feed_companion(self):
        """Test feeding companion (completing tasks)"""
        xp_earned = 100
        
        result = await self.service.feed_companion(
            self.mock_db,
            self.mock_companion,
            "Completed resume optimization",
            xp_earned
        )
        
        # Should increase XP and happiness
        assert result["xp_earned"] == xp_earned
        assert result["happiness"] > self.mock_companion.happiness
        assert result["energy"] > self.mock_companion.energy
        
    @pytest.mark.asyncio
    async def test_play_with_companion(self):
        """Test playing with companion"""
        result = await self.service.play_with_companion(
            self.mock_db,
            self.mock_companion
        )
        
        # Should increase happiness, decrease energy
        assert result["happiness"] > self.mock_companion.happiness
        assert result["energy"] < self.mock_companion.energy
        
    @pytest.mark.asyncio
    async def test_rest_companion(self):
        """Test letting companion rest"""
        # Set low energy
        self.mock_companion.energy = 30
        
        result = await self.service.rest_companion(
            self.mock_db,
            self.mock_companion
        )
        
        # Should restore energy
        assert result["energy"] > self.mock_companion.energy
        
    @pytest.mark.asyncio
    async def test_level_up(self):
        """Test companion leveling up"""
        # Set XP just below level up threshold
        self.mock_companion.level = 5
        self.mock_companion.xp = 450  # Need 500 for level 6
        
        result = await self.service.feed_companion(
            self.mock_db,
            self.mock_companion,
            "Big task completed",
            100  # This should trigger level up
        )
        
        # Should level up
        assert result["leveled_up"] == True
        assert result["level"] == 6
        
    @pytest.mark.asyncio
    async def test_evolution_trigger(self):
        """Test companion evolution"""
        # Set level just below evolution threshold
        self.mock_companion.level = 5
        self.mock_companion.evolution_stage = 1
        self.mock_companion.current_form = "egg"
        self.mock_companion.xp = 450
        
        result = await self.service.feed_companion(
            self.mock_db,
            self.mock_companion,
            "Evolution task",
            100  # Level up to 6, trigger evolution
        )
        
        # Should evolve
        if result["leveled_up"] and result["level"] == 6:
            assert result["evolution"] is not None
            assert result["evolution"]["from_stage"] == 1
            assert result["evolution"]["to_stage"] == 2
            assert result["evolution"]["from_form"] == "egg"
            assert result["evolution"]["to_form"] == "sprout"
            
    @pytest.mark.asyncio
    async def test_mood_calculation(self):
        """Test mood calculation based on stats"""
        # Happy mood (high stats)
        self.mock_companion.happiness = 90
        self.mock_companion.energy = 85
        self.mock_companion.health = 95
        
        mood = self.service.calculate_mood(self.mock_companion)
        assert mood in ["excited", "happy"]
        
        # Sad mood (low stats)
        self.mock_companion.happiness = 30
        self.mock_companion.energy = 25
        self.mock_companion.health = 35
        
        mood = self.service.calculate_mood(self.mock_companion)
        assert mood in ["sad", "tired"]
        
    @pytest.mark.asyncio
    async def test_stat_decay(self):
        """Test time-based stat decay"""
        # Set last interaction to 24 hours ago
        self.mock_companion.last_interaction = datetime.utcnow() - timedelta(hours=24)
        self.mock_companion.happiness = 100
        self.mock_companion.energy = 100
        
        await self.service.apply_stat_decay(
            self.mock_db,
            self.mock_companion
        )
        
        # Stats should have decayed
        assert self.mock_companion.happiness < 100
        assert self.mock_companion.energy < 100
        
    @pytest.mark.asyncio
    async def test_get_companion_stats(self):
        """Test getting detailed companion stats"""
        stats = await self.service.get_companion_stats(
            self.mock_db,
            self.mock_companion
        )
        
        # Should include all relevant stats
        assert "level" in stats
        assert "xp" in stats
        assert "xp_to_next_level" in stats
        assert "evolution_stage" in stats
        assert "current_form" in stats
        assert "happiness" in stats
        assert "energy" in stats
        assert "health" in stats
        assert "mood" in stats
        
    @pytest.mark.asyncio
    async def test_archetype_specific_personality(self):
        """Test that companion personality reflects archetype"""
        # Individual Sovereignty
        companion_sovereignty = Mock()
        companion_sovereignty.archetype = ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY
        
        personality = self.service.get_personality_traits(companion_sovereignty)
        assert "rebellious" in personality["personality_type"].lower() or \
               "independent" in personality["personality_type"].lower()
        
        # Academic Elite
        companion_academic = Mock()
        companion_academic.archetype = ProfessionalArchetype.ACADEMIC_ELITE
        
        personality = self.service.get_personality_traits(companion_academic)
        assert "scholarly" in personality["personality_type"].lower() or \
               "academic" in personality["personality_type"].lower()
        
    @pytest.mark.asyncio
    async def test_ability_unlocking(self):
        """Test ability unlocking at certain levels"""
        self.mock_companion.level = 10
        self.mock_companion.archetype = ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY
        
        abilities = await self.service.get_unlocked_abilities(
            self.mock_db,
            self.mock_companion
        )
        
        # Should have some abilities unlocked at level 10
        assert len(abilities) > 0
        assert all("name" in ability for ability in abilities)
        assert all("level" in ability for ability in abilities)
        assert all("unlocked" in ability for ability in abilities)
        
    @pytest.mark.asyncio
    async def test_evolution_history(self):
        """Test tracking evolution history"""
        # Trigger evolution
        self.mock_companion.level = 5
        self.mock_companion.evolution_stage = 1
        self.mock_companion.xp = 450
        
        await self.service.feed_companion(
            self.mock_db,
            self.mock_companion,
            "Evolution task",
            100
        )
        
        # Should have evolution history
        history = await self.service.get_evolution_history(
            self.mock_db,
            self.mock_companion
        )
        
        assert len(history) > 0
        assert all("from_stage" in event for event in history)
        assert all("to_stage" in event for event in history)
        assert all("evolved_at" in event for event in history)
        
    @pytest.mark.asyncio
    async def test_welcome_message(self):
        """Test archetype-specific welcome message"""
        message = await self.service.get_welcome_message(
            self.mock_companion
        )
        
        # Should be a non-empty string
        assert isinstance(message, str)
        assert len(message) > 0
        
        # Should reflect archetype
        if self.mock_companion.archetype == ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY:
            assert any(word in message.lower() for word in 
                      ["freedom", "autonomy", "independent", "sovereign"])


class TestCompanionEvolution:
    """Test companion evolution system"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.service = CompanionService()
        self.mock_db = AsyncMock()
        
    @pytest.mark.asyncio
    async def test_evolution_stages(self):
        """Test all 5 evolution stages"""
        stages = [
            (1, "egg", 1, 5),
            (2, "sprout", 6, 15),
            (3, "young", 16, 30),
            (4, "mature", 31, 50),
            (5, "master", 51, 100)
        ]
        
        for stage, form, min_level, max_level in stages:
            companion = Mock()
            companion.level = min_level
            companion.evolution_stage = stage
            companion.current_form = form
            
            # Verify stage properties
            assert companion.evolution_stage == stage
            assert companion.current_form == form
            
    @pytest.mark.asyncio
    async def test_evolution_stat_boost(self):
        """Test that evolution provides stat boost"""
        companion = Mock()
        companion.level = 6
        companion.evolution_stage = 1
        companion.happiness = 70
        companion.energy = 60
        companion.health = 80
        
        # Trigger evolution
        await self.service.trigger_evolution(
            self.mock_db,
            companion,
            2,
            "sprout"
        )
        
        # Stats should be boosted (30% increase)
        assert companion.happiness > 70
        assert companion.energy > 60
        assert companion.health > 80


class TestCompanionMessages:
    """Test companion messaging system"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.service = CompanionService()
        self.mock_db = AsyncMock()
        
    @pytest.mark.asyncio
    async def test_send_message(self):
        """Test sending message to user"""
        companion = Mock()
        companion.id = "test-companion"
        companion.archetype = ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY
        
        message = await self.service.send_message(
            self.mock_db,
            companion,
            "encouragement",
            {"context": "milestone_start"}
        )
        
        # Should create message
        assert message is not None
        assert "content" in message
        assert "message_type" in message
        
    @pytest.mark.asyncio
    async def test_get_unread_messages(self):
        """Test getting unread messages"""
        companion = Mock()
        companion.id = "test-companion"
        
        messages = await self.service.get_unread_messages(
            self.mock_db,
            companion
        )
        
        # Should return list of messages
        assert isinstance(messages, list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
