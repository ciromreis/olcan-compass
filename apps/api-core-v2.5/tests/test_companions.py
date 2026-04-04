"""
Tests for companion endpoints
"""

import pytest
from httpx import AsyncClient
from app.main import app
from app.core.database import engine, Base


@pytest.fixture
async def client():
    """Create test client"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture(autouse=True)
async def setup_database():
    """Setup test database"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def auth_token(client):
    """Get authentication token"""
    # Register user
    await client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "Test123!",
            "full_name": "Test User"
        }
    )
    
    # Login
    response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": "testuser",
            "password": "Test123!"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    return response.json()["access_token"]


class TestCompanions:
    """Test companion endpoints"""
    
    @pytest.mark.asyncio
    async def test_create_companion(self, client, auth_token):
        """Test creating a companion"""
        response = await client.post(
            "/api/v1/companions/?name=Sparky&companion_type=fox",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Sparky"
        assert data["type"] == "fox"
        assert data["level"] == 1
        assert data["energy"] == 100
    
    @pytest.mark.asyncio
    async def test_list_companions(self, client, auth_token):
        """Test listing companions"""
        # Create a companion first
        await client.post(
            "/api/v1/companions/?name=Sparky&companion_type=fox",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        # List companions
        response = await client.get(
            "/api/v1/companions/",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Sparky"
    
    @pytest.mark.asyncio
    async def test_get_companion(self, client, auth_token):
        """Test getting a specific companion"""
        # Create companion
        create_response = await client.post(
            "/api/v1/companions/?name=Sparky&companion_type=fox",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        companion_id = create_response.json()["id"]
        
        # Get companion
        response = await client.get(
            f"/api/v1/companions/{companion_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Sparky"
        assert data["id"] == companion_id
    
    @pytest.mark.asyncio
    async def test_feed_companion(self, client, auth_token):
        """Test feeding a companion"""
        # Create companion
        create_response = await client.post(
            "/api/v1/companions/?name=Sparky&companion_type=fox",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        companion_id = create_response.json()["id"]
        
        # Feed companion
        response = await client.post(
            f"/api/v1/companions/{companion_id}/feed",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["energy"] == 100.0  # Should be at max
        assert data["xp"] == 10  # Should gain 10 XP
    
    @pytest.mark.asyncio
    async def test_train_companion(self, client, auth_token):
        """Test training a companion"""
        # Create companion
        create_response = await client.post(
            "/api/v1/companions/?name=Sparky&companion_type=fox",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        companion_id = create_response.json()["id"]
        
        # Train companion
        response = await client.post(
            f"/api/v1/companions/{companion_id}/train",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["energy"] == 90.0  # Should lose 10 energy
        assert data["xp"] == 50  # Should gain 50 XP
    
    @pytest.mark.asyncio
    async def test_play_with_companion(self, client, auth_token):
        """Test playing with a companion"""
        # Create companion
        create_response = await client.post(
            "/api/v1/companions/?name=Sparky&companion_type=fox",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        companion_id = create_response.json()["id"]
        
        # Play with companion
        response = await client.post(
            f"/api/v1/companions/{companion_id}/play",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["energy"] == 95.0  # Should lose 5 energy
        assert data["xp"] == 15  # Should gain 15 XP
    
    @pytest.mark.asyncio
    async def test_rest_companion(self, client, auth_token):
        """Test resting a companion"""
        # Create companion
        create_response = await client.post(
            "/api/v1/companions/?name=Sparky&companion_type=fox",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        companion_id = create_response.json()["id"]
        
        # Train to reduce energy
        await client.post(
            f"/api/v1/companions/{companion_id}/train",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        # Rest companion
        response = await client.post(
            f"/api/v1/companions/{companion_id}/rest",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["energy"] == 100.0  # Should restore to max
        assert data["energy_restored"] == 10.0  # Restored 10 energy
    
    @pytest.mark.asyncio
    async def test_get_companion_activities(self, client, auth_token):
        """Test getting companion activity history"""
        # Create companion
        create_response = await client.post(
            "/api/v1/companions/?name=Sparky&companion_type=fox",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        companion_id = create_response.json()["id"]
        
        # Perform some activities
        await client.post(
            f"/api/v1/companions/{companion_id}/feed",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        await client.post(
            f"/api/v1/companions/{companion_id}/train",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        # Get activities
        response = await client.get(
            f"/api/v1/companions/{companion_id}/activities?limit=10",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["activity_type"] == "train"  # Most recent first
        assert data[1]["activity_type"] == "feed"
    
    @pytest.mark.asyncio
    async def test_train_without_energy(self, client, auth_token):
        """Test training fails when companion has insufficient energy"""
        # Create companion
        create_response = await client.post(
            "/api/v1/companions/?name=Sparky&companion_type=fox",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        companion_id = create_response.json()["id"]
        
        # Train 10 times to deplete energy
        for _ in range(10):
            await client.post(
                f"/api/v1/companions/{companion_id}/train",
                headers={"Authorization": f"Bearer {auth_token}"}
            )
        
        # Try to train again (should fail)
        response = await client.post(
            f"/api/v1/companions/{companion_id}/train",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 400
        assert "not enough energy" in response.json()["detail"].lower()
