"""
Tests for authentication endpoints
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.main import app
from app.core.database import get_db, engine, Base


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


class TestAuthentication:
    """Test authentication endpoints"""
    
    @pytest.mark.asyncio
    async def test_register_user(self, client):
        """Test user registration"""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "Test123!",
                "full_name": "Test User"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["username"] == "testuser"
        assert "id" in data
    
    @pytest.mark.asyncio
    async def test_register_duplicate_user(self, client):
        """Test registering duplicate user fails"""
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "Test123!",
            "full_name": "Test User"
        }
        
        # First registration
        await client.post("/api/v1/auth/register", json=user_data)
        
        # Second registration should fail
        response = await client.post("/api/v1/auth/register", json=user_data)
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_login_success(self, client):
        """Test successful login"""
        # Register user first
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
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
    
    @pytest.mark.asyncio
    async def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials"""
        response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": "nonexistent",
                "password": "WrongPass123!"
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_get_current_user(self, client):
        """Test getting current user info"""
        # Register and login
        await client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "Test123!",
                "full_name": "Test User"
            }
        )
        
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": "testuser",
                "password": "Test123!"
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        token = login_response.json()["access_token"]
        
        # Get current user
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["username"] == "testuser"
    
    @pytest.mark.asyncio
    async def test_get_current_user_unauthorized(self, client):
        """Test getting current user without token fails"""
        response = await client.get("/api/v1/auth/me")
        assert response.status_code == 401
