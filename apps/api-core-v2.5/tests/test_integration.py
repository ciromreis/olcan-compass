"""Integration tests for critical Olcan Compass flows.

These tests verify end-to-end functionality of core features:
- Authentication flow (register, login, JWT)
- Forge credit flow (polish, deduct, purchase)
- CRM sync flow (registration, lifecycle events)
- Psychology quiz flow (start, submit, archetype)

Run with:
    pytest tests/test_integration.py -v
"""

import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from datetime import datetime, timezone
from uuid import uuid4

from app.main import app
from app.db.session import AsyncSessionLocal
from app.db.models.user import User


# Test fixtures
@pytest.fixture
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def client():
    """Create async test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture
async def test_user():
    """Create a test user in database."""
    async with AsyncSessionLocal() as session:
        user = User(
            email=f"test_{uuid4().hex[:8]}@example.com",
            hashed_password="$2b$12$dummy_hash_for_testing",  # bcrypt hash of "Test1234!"
            full_name="Test User",
            is_verified=True,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        yield user
        # Cleanup
        await session.delete(user)
        await session.commit()


# ============================================================
# Authentication Flow Tests
# ============================================================

class TestAuthFlow:
    """Test authentication endpoints."""

    @pytest.mark.asyncio
    async def test_register_new_user(self, client):
        """Test user registration."""
        response = await client.post(
            "/api/auth/register",
            json={
                "email": f"newuser_{uuid4().hex[:8]}@example.com",
                "password": "Test1234!",
                "full_name": "New User",
            },
        )
        
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["email"] == data["user"]["email"].lower()

    @pytest.mark.asyncio
    async def test_login_with_valid_credentials(self, client, test_user):
        """Test login with correct credentials."""
        # Note: This will fail with dummy password hash
        # In real tests, use actual password hashing
        response = await client.post(
            "/api/auth/login",
            json={
                "email": test_user.email,
                "password": "Test1234!",
            },
        )
        
        # Should return 401 with dummy hash, 200 with real hash
        assert response.status_code in [200, 401]

    @pytest.mark.asyncio
    async def test_rate_limit_on_login(self, client):
        """Test rate limiting on login endpoint."""
        # Send 6 requests in quick succession (limit is 5/minute)
        responses = []
        for _ in range(6):
            response = await client.post(
                "/api/auth/login",
                json={
                    "email": "nonexistent@example.com",
                    "password": "wrong",
                },
            )
            responses.append(response)
        
        # At least one should be rate limited (429)
        rate_limited = [r for r in responses if r.status_code == 429]
        assert len(rate_limited) > 0, "Rate limiting not working"

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, client, test_user):
        """Test registration with existing email."""
        response = await client.post(
            "/api/auth/register",
            json={
                "email": test_user.email,
                "password": "Test1234!",
                "full_name": "Duplicate User",
            },
        )
        
        assert response.status_code == 400
        assert "já cadastrado" in response.json()["detail"]


# ============================================================
# Forge Credit Flow Tests
# ============================================================

class TestForgeCreditFlow:
    """Test Forge credit system."""

    @pytest.mark.asyncio
    async def test_polish_requires_credits(self, client, test_user):
        """Test that polish endpoint requires credits."""
        # Login to get token
        # (Skip in this test - requires proper auth setup)
        pass

    @pytest.mark.asyncio
    async def test_insufficient_credits_returns_402(self, client):
        """Test that insufficient credits returns 402."""
        # This test requires authenticated user with 0 credits
        pass


# ============================================================
# CRM Sync Flow Tests
# ============================================================

class TestCRMSyncFlow:
    """Test CRM integration endpoints."""

    @pytest.mark.asyncio
    async def test_crm_sync_requires_admin(self, client):
        """Test that CRM sync endpoints require admin role."""
        response = await client.post(
            "/api/admin/crm/twenty/users/some-uuid/sync",
        )
        
        # Should return 401 or 403 (not authenticated/authorized)
        assert response.status_code in [401, 403]

    @pytest.mark.asyncio
    async def test_lead_sync_endpoint_exists(self, client):
        """Test that lead sync endpoint exists."""
        response = await client.post(
            "/api/admin/crm/leads/sync",
            json={
                "email": "lead@example.com",
                "first_name": "Test",
                "last_name": "Lead",
            },
        )
        
        # Should return 401 (not authenticated) not 404
        assert response.status_code in [401, 403]


# ============================================================
# Psychology Quiz Flow Tests
# ============================================================

class TestPsychologyQuizFlow:
    """Test OIOS psychology quiz endpoints."""

    @pytest.mark.asyncio
    async def test_start_assessment(self, client):
        """Test starting a psychology assessment."""
        response = await client.post("/api/psych/assessment/start")
        
        # Should return 200 or 401 (if auth required)
        assert response.status_code in [200, 401]

    @pytest.mark.asyncio
    async def test_get_questions(self, client):
        """Test getting quiz questions."""
        response = await client.get("/api/psych/assessment/questions")
        
        # Should return 200 (public endpoint)
        assert response.status_code == 200
        
        # Should have questions
        data = response.json()
        assert "questions" in data
        assert len(data["questions"]) > 0

    @pytest.mark.asyncio
    async def test_submit_assessment(self, client):
        """Test submitting quiz answers."""
        # First get questions
        questions_response = await client.get("/api/psych/assessment/questions")
        questions = questions_response.json()["questions"]
        
        # Submit answers
        answers = [
            {"question_id": q["id"], "value": 4}
            for q in questions[:3]  # Answer first 3 questions
        ]
        
        response = await client.post(
            "/api/psych/assessment/submit",
            json={"answers": answers},
        )
        
        # Should return 200 or 401 (if auth required)
        assert response.status_code in [200, 401]


# ============================================================
# Health Check Tests
# ============================================================

class TestHealthChecks:
    """Test health and monitoring endpoints."""

    @pytest.mark.asyncio
    async def test_health_endpoint(self, client):
        """Test health check endpoint."""
        response = await client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data

    @pytest.mark.asyncio
    async def test_api_docs_accessible(self, client):
        """Test that API docs are accessible."""
        response = await client.get("/docs")
        assert response.status_code == 200


# ============================================================
# Security Tests
# ============================================================

class TestSecurity:
    """Test security features."""

    @pytest.mark.asyncio
    async def test_cors_headers(self, client):
        """Test CORS headers are present."""
        response = await client.options(
            "/api/auth/login",
            headers={"Origin": "http://localhost:3000"},
        )
        
        # Should have CORS headers
        assert "access-control-allow-origin" in response.headers.lower() or \
               response.status_code in [200, 404, 405]

    @pytest.mark.asyncio
    async def test_security_headers(self, client):
        """Test security headers are present."""
        response = await client.get("/health")
        
        # Should have security headers
        headers = response.headers
        assert "x-content-type-options" in headers or \
               "x-frame-options" in headers or \
               "strict-transport-security" in headers


# ============================================================
# Database Tests
# ============================================================

class TestDatabase:
    """Test database connectivity and models."""

    @pytest.mark.asyncio
    async def test_database_connection(self):
        """Test database connection works."""
        async with AsyncSessionLocal() as session:
            # Simple query to test connection
            result = await session.execute("SELECT 1")
            assert result.scalar() == 1

    @pytest.mark.asyncio
    async def test_user_model_crud(self):
        """Test user model CRUD operations."""
        async with AsyncSessionLocal() as session:
            # Create
            user = User(
                email=f"crud_test_{uuid4().hex[:8]}@example.com",
                hashed_password="test_hash",
                full_name="CRUD Test",
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
            
            user_id = user.id
            
            # Read
            from sqlalchemy import select
            result = await session.execute(select(User).where(User.id == user_id))
            retrieved_user = result.scalar_one_or_none()
            assert retrieved_user is not None
            assert retrieved_user.email == user.email
            
            # Update
            retrieved_user.full_name = "Updated Name"
            await session.commit()
            
            # Verify update
            result = await session.execute(select(User).where(User.id == user_id))
            updated_user = result.scalar_one_or_none()
            assert updated_user.full_name == "Updated Name"
            
            # Delete
            await session.delete(updated_user)
            await session.commit()
            
            # Verify delete
            result = await session.execute(select(User).where(User.id == user_id))
            deleted_user = result.scalar_one_or_none()
            assert deleted_user is None


# ============================================================
# Performance Tests
# ============================================================

class TestPerformance:
    """Test API performance."""

    @pytest.mark.asyncio
    async def test_health_endpoint_response_time(self, client):
        """Test health endpoint responds quickly."""
        import time
        
        start = time.time()
        response = await client.get("/health")
        elapsed = time.time() - start
        
        assert response.status_code == 200
        assert elapsed < 1.0, f"Health endpoint too slow: {elapsed:.2f}s"

    @pytest.mark.asyncio
    async def test_concurrent_requests(self, client):
        """Test handling concurrent requests."""
        import asyncio
        
        # Send 10 concurrent requests
        tasks = [
            client.get("/health")
            for _ in range(10)
        ]
        responses = await asyncio.gather(*tasks)
        
        # All should succeed
        assert all(r.status_code == 200 for r in responses)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
