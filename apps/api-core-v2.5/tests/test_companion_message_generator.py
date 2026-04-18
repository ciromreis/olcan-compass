"""
Tests for CompanionMessageGenerator Service
"""
import pytest
from app.services.companion_message_generator import CompanionMessageGenerator
from app.db.models.psychology import ProfessionalArchetype


class TestCompanionMessageGenerator:
    """Test suite for CompanionMessageGenerator"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.generator = CompanionMessageGenerator()
        
    def test_milestone_start_message(self):
        """Test milestone start message generation"""
        message = self.generator.generate_message(
            message_type="milestone_start",
            archetype=ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY,
            context={
                "milestone_name": "Optimize Resume",
                "milestone_description": "Build ATS-optimized resume"
            }
        )
        
        # Should return non-empty message
        assert isinstance(message, str)
        assert len(message) > 0
        
        # Should reflect archetype personality
        assert any(word in message.lower() for word in 
                  ["freedom", "autonomy", "independent", "control"])
        
    def test_milestone_complete_message(self):
        """Test milestone completion message generation"""
        message = self.generator.generate_message(
            message_type="milestone_complete",
            archetype=ProfessionalArchetype.ACADEMIC_ELITE,
            context={
                "milestone_name": "Submit Application",
                "xp_earned": 200
            }
        )
        
        # Should return celebration message
        assert isinstance(message, str)
        assert len(message) > 0
        
        # Should reflect academic archetype
        assert any(word in message.lower() for word in 
                  ["excellence", "scholarly", "prestige", "achievement"])
        
    def test_encouragement_message(self):
        """Test encouragement message generation"""
        message = self.generator.generate_message(
            message_type="encouragement",
            archetype=ProfessionalArchetype.CAREER_MASTERY,
            context={"mood": "neutral"}
        )
        
        # Should return encouraging message
        assert isinstance(message, str)
        assert len(message) > 0
        
        # Should reflect career mastery archetype
        assert any(word in message.lower() for word in 
                  ["strategic", "expertise", "mastery", "value"])
        
    def test_reminder_message(self):
        """Test reminder message generation"""
        message = self.generator.generate_message(
            message_type="reminder",
            archetype=ProfessionalArchetype.GLOBAL_PRESENCE,
            context={
                "milestone_name": "Complete Interview Prep",
                "days_pending": 3
            }
        )
        
        # Should return reminder message
        assert isinstance(message, str)
        assert len(message) > 0
        assert "3" in message or "three" in message.lower()
        
    def test_tip_message(self):
        """Test tip message generation"""
        message = self.generator.generate_message(
            message_type="tip",
            archetype=ProfessionalArchetype.FRONTIER_ARCHITECT,
            context={"tip_category": "resume"}
        )
        
        # Should return helpful tip
        assert isinstance(message, str)
        assert len(message) > 0
        
    def test_celebration_message(self):
        """Test celebration message generation"""
        message = self.generator.generate_message(
            message_type="celebration",
            archetype=ProfessionalArchetype.VERIFIED_TALENT,
            context={
                "achievement": "First Job Application",
                "milestone": "major"
            }
        )
        
        # Should return celebration message
        assert isinstance(message, str)
        assert len(message) > 0
        
    def test_evolution_message(self):
        """Test evolution announcement message"""
        message = self.generator.generate_message(
            message_type="evolution",
            archetype=ProfessionalArchetype.FUTURE_GUARDIAN,
            context={
                "from_form": "egg",
                "to_form": "sprout",
                "from_stage": 1,
                "to_stage": 2
            }
        )
        
        # Should return evolution message
        assert isinstance(message, str)
        assert len(message) > 0
        assert "sprout" in message.lower()
        
    def test_all_archetypes_have_messages(self):
        """Test that all 12 archetypes have message templates"""
        archetypes = [
            ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY,
            ProfessionalArchetype.ACADEMIC_ELITE,
            ProfessionalArchetype.CAREER_MASTERY,
            ProfessionalArchetype.GLOBAL_PRESENCE,
            ProfessionalArchetype.FRONTIER_ARCHITECT,
            ProfessionalArchetype.VERIFIED_TALENT,
            ProfessionalArchetype.FUTURE_GUARDIAN,
            ProfessionalArchetype.CHANGE_AGENT,
            ProfessionalArchetype.KNOWLEDGE_NODE,
            ProfessionalArchetype.CONSCIOUS_LEADER,
            ProfessionalArchetype.CULTURAL_PROTAGONIST,
            ProfessionalArchetype.DESTINY_ARBITRATOR
        ]
        
        for archetype in archetypes:
            message = self.generator.generate_message(
                message_type="encouragement",
                archetype=archetype,
                context={}
            )
            
            # Each archetype should have messages
            assert isinstance(message, str)
            assert len(message) > 0
            
    def test_mood_based_messaging(self):
        """Test that messages adapt to companion mood"""
        moods = ["excited", "happy", "neutral", "sad", "tired", "motivated"]
        
        for mood in moods:
            message = self.generator.generate_message(
                message_type="encouragement",
                archetype=ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY,
                context={"mood": mood}
            )
            
            # Should generate message for each mood
            assert isinstance(message, str)
            assert len(message) > 0
            
    def test_archetype_personality_consistency(self):
        """Test that archetype personality is consistent across message types"""
        archetype = ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY
        message_types = ["milestone_start", "milestone_complete", "encouragement"]
        
        messages = []
        for msg_type in message_types:
            message = self.generator.generate_message(
                message_type=msg_type,
                archetype=archetype,
                context={}
            )
            messages.append(message.lower())
        
        # All messages should reflect the same archetype personality
        # Individual Sovereignty emphasizes freedom/autonomy
        freedom_words = ["freedom", "autonomy", "independent", "control", "sovereign"]
        
        # At least some messages should contain archetype keywords
        assert any(any(word in msg for word in freedom_words) for msg in messages)
        
    def test_context_integration(self):
        """Test that context is properly integrated into messages"""
        context = {
            "milestone_name": "Resume Optimization",
            "xp_earned": 150,
            "user_name": "Alex"
        }
        
        message = self.generator.generate_message(
            message_type="milestone_complete",
            archetype=ProfessionalArchetype.CAREER_MASTERY,
            context=context
        )
        
        # Message should reference context
        assert isinstance(message, str)
        assert len(message) > 0
        # XP should be mentioned
        assert "150" in message or "xp" in message.lower()
        
    def test_message_length_appropriate(self):
        """Test that messages are appropriate length"""
        message = self.generator.generate_message(
            message_type="encouragement",
            archetype=ProfessionalArchetype.ACADEMIC_ELITE,
            context={}
        )
        
        # Messages should be concise but meaningful
        assert len(message) > 20  # Not too short
        assert len(message) < 500  # Not too long
        
    def test_message_has_personality(self):
        """Test that messages have personality (emojis, tone)"""
        message = self.generator.generate_message(
            message_type="celebration",
            archetype=ProfessionalArchetype.GLOBAL_PRESENCE,
            context={"achievement": "First Application"}
        )
        
        # Should have some personality indicators
        # (emojis, exclamation marks, etc.)
        assert any(char in message for char in ["!", "🎉", "🌟", "✨", "🚀", "💪"])
        
    def test_different_archetypes_different_tones(self):
        """Test that different archetypes have distinctly different tones"""
        context = {"milestone_name": "Submit Application"}
        
        # Individual Sovereignty - rebellious, freedom-focused
        msg_sovereignty = self.generator.generate_message(
            message_type="milestone_start",
            archetype=ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY,
            context=context
        )
        
        # Academic Elite - scholarly, prestige-focused
        msg_academic = self.generator.generate_message(
            message_type="milestone_start",
            archetype=ProfessionalArchetype.ACADEMIC_ELITE,
            context=context
        )
        
        # Future Guardian - stability, family-focused
        msg_guardian = self.generator.generate_message(
            message_type="milestone_start",
            archetype=ProfessionalArchetype.FUTURE_GUARDIAN,
            context=context
        )
        
        # Messages should be different
        assert msg_sovereignty != msg_academic
        assert msg_academic != msg_guardian
        assert msg_sovereignty != msg_guardian
        
    def test_tip_categories(self):
        """Test different tip categories"""
        categories = ["resume", "interview", "networking", "application"]
        
        for category in categories:
            message = self.generator.generate_message(
                message_type="tip",
                archetype=ProfessionalArchetype.CAREER_MASTERY,
                context={"tip_category": category}
            )
            
            # Should generate tips for each category
            assert isinstance(message, str)
            assert len(message) > 0


class TestArchetypeSpecificMessages:
    """Test archetype-specific message characteristics"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.generator = CompanionMessageGenerator()
        
    def test_individual_sovereignty_messages(self):
        """Test Individual Sovereignty archetype messages"""
        message = self.generator.generate_message(
            message_type="encouragement",
            archetype=ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY,
            context={}
        )
        
        # Should emphasize freedom and autonomy
        keywords = ["freedom", "autonomy", "independent", "control", "sovereign", "chains"]
        assert any(keyword in message.lower() for keyword in keywords)
        
    def test_academic_elite_messages(self):
        """Test Academic Elite archetype messages"""
        message = self.generator.generate_message(
            message_type="encouragement",
            archetype=ProfessionalArchetype.ACADEMIC_ELITE,
            context={}
        )
        
        # Should emphasize excellence and scholarship
        keywords = ["excellence", "scholarly", "prestige", "rigorous", "intellectual"]
        assert any(keyword in message.lower() for keyword in keywords)
        
    def test_change_agent_messages(self):
        """Test Change Agent archetype messages"""
        message = self.generator.generate_message(
            message_type="encouragement",
            archetype=ProfessionalArchetype.CHANGE_AGENT,
            context={}
        )
        
        # Should emphasize impact and purpose
        keywords = ["impact", "change", "purpose", "transform", "difference"]
        assert any(keyword in message.lower() for keyword in keywords)
        
    def test_destiny_arbitrator_messages(self):
        """Test Destiny Arbitrator archetype messages"""
        message = self.generator.generate_message(
            message_type="encouragement",
            archetype=ProfessionalArchetype.DESTINY_ARBITRATOR,
            context={}
        )
        
        # Should emphasize efficiency and optimization
        keywords = ["efficient", "optimize", "strategic", "calculate", "arbitrage"]
        assert any(keyword in message.lower() for keyword in keywords)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
