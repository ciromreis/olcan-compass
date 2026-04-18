"""
Pytest configuration and fixtures for Olcan Compass API tests
"""
import pytest
import asyncio
from typing import AsyncGenerator, Generator
from uuid import uuid4
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.db.base import Base
from app.db.session import get_db
from app.core.auth import get_current_user
from app.main import app


# Test database URL (in-memory SQLite)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def test_engine():
    """Create a test database engine"""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False
    )
    
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    # Drop all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest.fixture(scope="function")
async def db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session"""
    async_session = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    
    async with async_session() as session:
        yield session
        await session.rollback()


@pytest.fixture(scope="function")
def override_get_db(db_session):
    """Override the get_db dependency for testing"""
    async def _override_get_db():
        yield db_session
    
    return _override_get_db


@pytest.fixture(scope="function")
def db(db_session):
    """Backward-compatible alias used by older tests."""
    return db_session


# Mock user fixtures
@pytest.fixture
def mock_user():
    """Create a mock user for testing"""
    from unittest.mock import Mock
    
    user = Mock()
    user.id = "test-user-123"
    user.email = "test@example.com"
    user.archetype = "individual_sovereignty"
    user.psychological_profile = {
        "autonomy_score": 0.8,
        "prestige_score": 0.5,
        "stability_score": 0.6
    }
    
    return user


@pytest.fixture
def test_user(mock_user):
    mock_user.id = uuid4()
    return mock_user


@pytest.fixture
def mock_companion():
    """Create a mock companion for testing"""
    from unittest.mock import Mock
    from datetime import datetime
    
    companion = Mock()
    companion.id = "test-companion-123"
    companion.user_id = "test-user-123"
    companion.name = "Phoenix"
    companion.archetype = "individual_sovereignty"
    companion.level = 10
    companion.xp = 1500
    companion.happiness = 80
    companion.energy = 70
    companion.health = 90
    companion.mood = "happy"
    companion.evolution_stage = 2
    companion.current_form = "sprout"
    companion.last_interaction = datetime.utcnow()
    
    return companion


@pytest.fixture
def test_companion(mock_companion):
    return mock_companion


@pytest.fixture
def mock_route():
    """Create a mock route for testing"""
    from unittest.mock import Mock
    from datetime import datetime
    
    route = Mock()
    route.id = "test-route-123"
    route.user_id = "test-user-123"
    route.category = "employment"
    route.archetype = "individual_sovereignty"
    route.target_outcome = "Senior Software Engineer at Google"
    route.target_location = "San Francisco, USA"
    route.timeline_months = 12
    route.budget_usd = 5000
    route.status = "draft"
    route.created_at = datetime.utcnow()
    
    return route


@pytest.fixture
def test_route_with_milestones(mock_route):
    return mock_route


@pytest.fixture
def mock_milestone():
    """Create a mock milestone for testing"""
    from unittest.mock import Mock
    
    milestone = Mock()
    milestone.id = "test-milestone-123"
    milestone.route_id = "test-route-123"
    milestone.name = "Optimize Resume"
    milestone.description = "Build ATS-optimized resume"
    milestone.order = 1
    milestone.status = "unlocked"
    milestone.xp_reward = 200
    milestone.estimated_days = 7
    milestone.tasks = [
        {"name": "Upload resume", "completed": False},
        {"name": "AI analysis", "completed": False},
        {"name": "Optimize content", "completed": False}
    ]
    
    return milestone


@pytest.fixture
def sample_archetype_config():
    """Create sample archetype configuration"""
    return {
        "archetype": "individual_sovereignty",
        "name_en": "Individual Sovereignty",
        "name_pt": "Soberania Individual",
        "name_es": "Soberanía Individual",
        "description_en": "Professionals seeking jurisdictions that respect individual and financial sovereignty",
        "description_pt": "Profissionais que buscam jurisdições que respeitam a soberania individual e financeira",
        "description_es": "Profesionales que buscan jurisdicciones que respetan la soberanía individual y financiera",
        "primary_motivator": "Autonomy and Geopolitical Freedom",
        "primary_fear": "Loss of freedom and autonomy",
        "evolution_path": "Local Operator → International Strategist",
        "route_preferences": ["employment", "entrepreneurship", "investment"],
        "route_weights": {
            "employment": 0.8,
            "education": 0.4,
            "entrepreneurship": 0.9,
            "investment": 0.7,
            "family": 0.3
        },
        "narrative_voice": {
            "tone": "assertive",
            "focus": "autonomy_and_freedom",
            "keywords": ["independent", "sovereign", "self-directed"],
            "avoid": ["team player", "corporate ladder"]
        },
        "companion_traits": {
            "personality": "rebellious_mentor",
            "communication_style": "direct_and_challenging",
            "visual_theme": "phoenix",
            "encouragement_type": "freedom_focused"
        },
        "interview_focus_areas": [
            "autonomy_questions",
            "remote_work_setup",
            "timezone_flexibility"
        ],
        "service_preferences": {
            "career_coaching": 0.6,
            "visa_consulting": 0.9,
            "tax_optimization": 0.8
        },
        "typical_risk_tolerance": "high",
        "decision_speed": "fast",
        "content_themes": ["freedom", "sovereignty", "location_independence"],
        "success_metrics": ["visa_obtained", "remote_income", "tax_optimization"]
    }


# Pytest hooks
def pytest_configure(config):
    """Configure pytest"""
    config.addinivalue_line(
        "markers", "asyncio: mark test as async"
    )
    config.addinivalue_line(
        "markers", "unit: mark test as unit test"
    )
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )


def pytest_collection_modifyitems(config, items):
    """Modify test collection"""
    for item in items:
        # Add asyncio marker to all async tests
        if asyncio.iscoroutinefunction(item.function):
            item.add_marker(pytest.mark.asyncio)


@pytest.fixture(scope="function")
def client(override_get_db, test_user):
    """Synchronous TestClient fixture for legacy API tests."""
    with TestClient(app) as test_client:
        yield test_client
