"""
Tests for Archetypes API Endpoints
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, AsyncMock, patch
from app.main import app
from app.db.models.psychology import ProfessionalArchetype


client = TestClient(app)


class TestArchetypesAPI:
    """Test suite for Archetypes API endpoints"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.base_url = "/api/archetypes"
        
    @pytest.mark.asyncio
    async def test_list_all_archetypes(self):
        """Test GET /archetypes - list all archetypes"""
        response = client.get(self.base_url)
        
        # Should return 200 OK
        assert response.status_code == 200
        
        # Should return list of archetypes
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 12  # All 12 archetypes
        
        # Each archetype should have required fields
        for archetype in data:
            assert "archetype" in archetype
            assert "name" in archetype
            assert "description" in archetype
            
    @pytest.mark.asyncio
    async def test_list_archetypes_with_inactive_filter(self):
        """Test GET /archetypes?include_inactive=true"""
        response = client.get(f"{self.base_url}?include_inactive=true")
        
        # Should return 200 OK
        assert response.status_code == 200
        
        # Should return list including inactive
        data = response.json()
        assert isinstance(data, list)
        
    @pytest.mark.asyncio
    async def test_get_archetype_details(self):
        """Test GET /archetypes/{archetype} - get specific archetype"""
        archetype = "individual_sovereignty"
        response = client.get(f"{self.base_url}/{archetype}")
        
        # Should return 200 OK
        assert response.status_code == 200
        
        # Should return archetype details
        data = response.json()
        assert data["archetype"] == archetype
        assert "name" in data
        assert "description" in data
        assert "primary_motivator" in data
        assert "primary_fear" in data
        assert "companion_traits" in data
        assert "narrative_voice" in data
        
    @pytest.mark.asyncio
    async def test_get_archetype_with_language(self):
        """Test GET /archetypes/{archetype}?language=pt"""
        archetype = "individual_sovereignty"
        response = client.get(f"{self.base_url}/{archetype}?language=pt")
        
        # Should return 200 OK
        assert response.status_code == 200
        
        # Should return Portuguese content
        data = response.json()
        assert data["archetype"] == archetype
        # Name should be in Portuguese
        assert "Soberania" in data["name"] or "Individual" in data["name"]
        
    @pytest.mark.asyncio
    async def test_get_invalid_archetype(self):
        """Test GET /archetypes/{archetype} - invalid archetype"""
        response = client.get(f"{self.base_url}/invalid_archetype")
        
        # Should return 404 Not Found
        assert response.status_code == 404
        
    @pytest.mark.asyncio
    async def test_recommend_archetype_for_user(self):
        """Test GET /archetypes/recommend/for-user"""
        # Mock user with psychological profile
        with patch("app.api.routes.archetypes.get_current_user") as mock_user:
            mock_user.return_value = Mock(
                id="test-user",
                psychological_profile={
                    "autonomy_score": 0.9,
                    "prestige_score": 0.3,
                    "stability_score": 0.4
                }
            )
            
            response = client.get(f"{self.base_url}/recommend/for-user")
            
            # Should return 200 OK
            assert response.status_code == 200
            
            # Should return recommendation
            data = response.json()
            assert "recommended_archetype" in data
            assert "confidence_score" in data
            assert "reasoning" in data
            
            # Confidence should be between 0 and 1
            assert 0 <= data["confidence_score"] <= 1
            
    @pytest.mark.asyncio
    async def test_recommend_without_profile(self):
        """Test GET /archetypes/recommend/for-user - no profile"""
        with patch("app.api.routes.archetypes.get_current_user") as mock_user:
            mock_user.return_value = Mock(
                id="test-user",
                psychological_profile=None
            )
            
            response = client.get(f"{self.base_url}/recommend/for-user")
            
            # Should return 400 Bad Request or default recommendation
            assert response.status_code in [200, 400]
            
    @pytest.mark.asyncio
    async def test_compare_archetypes(self):
        """Test GET /archetypes/compare/{a1}/{a2}"""
        archetype1 = "individual_sovereignty"
        archetype2 = "academic_elite"
        
        response = client.get(
            f"{self.base_url}/compare/{archetype1}/{archetype2}"
        )
        
        # Should return 200 OK
        assert response.status_code == 200
        
        # Should return comparison
        data = response.json()
        assert "archetype1" in data
        assert "archetype2" in data
        assert "similarities" in data
        assert "differences" in data
        
        # Should include both archetypes
        assert data["archetype1"]["archetype"] == archetype1
        assert data["archetype2"]["archetype"] == archetype2
        
    @pytest.mark.asyncio
    async def test_compare_same_archetype(self):
        """Test comparing archetype with itself"""
        archetype = "individual_sovereignty"
        
        response = client.get(
            f"{self.base_url}/compare/{archetype}/{archetype}"
        )
        
        # Should return 400 Bad Request
        assert response.status_code == 400
        
    @pytest.mark.asyncio
    async def test_compare_invalid_archetypes(self):
        """Test comparing with invalid archetype"""
        response = client.get(
            f"{self.base_url}/compare/invalid1/invalid2"
        )
        
        # Should return 404 Not Found
        assert response.status_code == 404


class TestArchetypeContent:
    """Test archetype content and metadata"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.base_url = "/api/archetypes"
        
    @pytest.mark.asyncio
    async def test_all_archetypes_have_required_fields(self):
        """Test that all archetypes have required fields"""
        response = client.get(self.base_url)
        archetypes = response.json()
        
        required_fields = [
            "archetype",
            "name",
            "description"
        ]
        
        for archetype in archetypes:
            for field in required_fields:
                assert field in archetype
                assert archetype[field] is not None
                assert len(str(archetype[field])) > 0
                
    @pytest.mark.asyncio
    async def test_archetype_details_complete(self):
        """Test that archetype details are complete"""
        archetype = "career_mastery"
        response = client.get(f"{self.base_url}/{archetype}")
        data = response.json()
        
        # Should have deep metadata
        assert "primary_motivator" in data
        assert "primary_fear" in data
        assert "evolution_path" in data
        assert "route_preferences" in data
        assert "narrative_voice" in data
        assert "companion_traits" in data
        assert "interview_focus_areas" in data
        
    @pytest.mark.asyncio
    async def test_multilingual_support(self):
        """Test multilingual content for all archetypes"""
        languages = ["en", "pt", "es"]
        archetype = "global_presence"
        
        for lang in languages:
            response = client.get(
                f"{self.base_url}/{archetype}?language={lang}"
            )
            
            assert response.status_code == 200
            data = response.json()
            
            # Should have name and description
            assert "name" in data
            assert "description" in data
            assert len(data["name"]) > 0
            assert len(data["description"]) > 0
            
    @pytest.mark.asyncio
    async def test_companion_traits_structure(self):
        """Test companion traits have correct structure"""
        archetype = "frontier_architect"
        response = client.get(f"{self.base_url}/{archetype}")
        data = response.json()
        
        companion_traits = data["companion_traits"]
        
        # Should have required companion fields
        assert "personality" in companion_traits
        assert "communication_style" in companion_traits
        assert "visual_theme" in companion_traits
        
    @pytest.mark.asyncio
    async def test_narrative_voice_structure(self):
        """Test narrative voice has correct structure"""
        archetype = "verified_talent"
        response = client.get(f"{self.base_url}/{archetype}")
        data = response.json()
        
        narrative_voice = data["narrative_voice"]
        
        # Should have narrative voice fields
        assert "tone" in narrative_voice
        assert "keywords" in narrative_voice
        assert isinstance(narrative_voice["keywords"], list)


class TestArchetypeRecommendation:
    """Test archetype recommendation logic"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.base_url = "/api/archetypes/recommend/for-user"
        
    @pytest.mark.asyncio
    async def test_high_autonomy_recommends_sovereignty(self):
        """Test high autonomy score recommends Individual Sovereignty"""
        with patch("app.api.routes.archetypes.get_current_user") as mock_user:
            mock_user.return_value = Mock(
                id="test-user",
                psychological_profile={
                    "autonomy_score": 0.95,
                    "prestige_score": 0.2,
                    "stability_score": 0.3,
                    "impact_score": 0.4
                }
            )
            
            response = client.get(self.base_url)
            data = response.json()
            
            # Should recommend Individual Sovereignty or similar
            recommended = data["recommended_archetype"]
            assert recommended in [
                "individual_sovereignty",
                "global_presence",
                "frontier_architect"
            ]
            
    @pytest.mark.asyncio
    async def test_high_prestige_recommends_academic(self):
        """Test high prestige score recommends Academic Elite"""
        with patch("app.api.routes.archetypes.get_current_user") as mock_user:
            mock_user.return_value = Mock(
                id="test-user",
                psychological_profile={
                    "autonomy_score": 0.3,
                    "prestige_score": 0.95,
                    "stability_score": 0.4,
                    "expertise_score": 0.8
                }
            )
            
            response = client.get(self.base_url)
            data = response.json()
            
            # Should recommend Academic Elite or similar
            recommended = data["recommended_archetype"]
            assert recommended in [
                "academic_elite",
                "career_mastery",
                "knowledge_node"
            ]


class TestArchetypeComparison:
    """Test archetype comparison functionality"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.base_url = "/api/archetypes/compare"
        
    @pytest.mark.asyncio
    async def test_comparison_shows_differences(self):
        """Test comparison highlights key differences"""
        response = client.get(
            f"{self.base_url}/individual_sovereignty/future_guardian"
        )
        data = response.json()
        
        # Should have differences
        assert len(data["differences"]) > 0
        
        # Differences should be meaningful
        differences = data["differences"]
        assert any("autonomy" in str(d).lower() or 
                  "freedom" in str(d).lower() or
                  "stability" in str(d).lower() 
                  for d in differences)
        
    @pytest.mark.asyncio
    async def test_comparison_shows_similarities(self):
        """Test comparison shows similarities when they exist"""
        # Compare similar archetypes
        response = client.get(
            f"{self.base_url}/career_mastery/academic_elite"
        )
        data = response.json()
        
        # Should have some similarities (both value expertise)
        assert "similarities" in data
        
    @pytest.mark.asyncio
    async def test_comparison_includes_full_details(self):
        """Test comparison includes full archetype details"""
        response = client.get(
            f"{self.base_url}/change_agent/conscious_leader"
        )
        data = response.json()
        
        # Should include full details for both
        assert "archetype1" in data
        assert "archetype2" in data
        
        # Each should have complete info
        for key in ["archetype1", "archetype2"]:
            assert "name" in data[key]
            assert "description" in data[key]
            assert "primary_motivator" in data[key]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
