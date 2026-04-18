"""Tests for server-side entitlement enforcement.

Covers: plan gating (require_plan), feature gating (require_feature),
document limits, route limits, and the User.plan property alias.
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch
from fastapi import HTTPException

from app.core.entitlements import (
    UserPlan,
    is_paid_plan,
    has_feature_access,
    get_max_documents,
    get_max_routes,
    assert_can_create_route,
    assert_can_create_forge_document,
    get_entitlement_context,
)


# ============================================================
# User.plan property alias
# ============================================================

def test_user_plan_property_exists():
    """User.plan must be a property that aliases subscription_plan."""
    from app.db.models.user import User
    assert isinstance(User.__dict__["plan"], property), "User.plan must be a @property"


def test_user_plan_property_aliases_subscription_plan():
    """The User.plan property must return subscription_plan so entitlements work."""
    user = Mock()
    user.subscription_plan = "pro"
    # Simulate what the property does
    from app.db.models.user import User
    result = User.plan.fget(user)
    assert result == "pro"


def test_user_plan_property_free_default():
    user = Mock()
    user.subscription_plan = "free"
    from app.db.models.user import User
    result = User.plan.fget(user)
    assert result == "free"


# ============================================================
# Pure function tests
# ============================================================

class TestIsPaidPlan:
    def test_free_is_not_paid(self):
        assert is_paid_plan(UserPlan.FREE) is False

    def test_pro_is_paid(self):
        assert is_paid_plan(UserPlan.PRO) is True

    def test_premium_is_paid(self):
        assert is_paid_plan(UserPlan.PREMIUM) is True


class TestHasFeatureAccess:
    def test_free_user_no_interview_access(self):
        assert has_feature_access(UserPlan.FREE, "interview_simulator") is False

    def test_pro_user_has_interview_access(self):
        assert has_feature_access(UserPlan.PRO, "interview_simulator") is True

    def test_free_user_no_analytics_advanced(self):
        assert has_feature_access(UserPlan.FREE, "analytics_advanced") is False

    def test_pro_user_no_analytics_advanced(self):
        assert has_feature_access(UserPlan.PRO, "analytics_advanced") is False

    def test_premium_user_has_analytics_advanced(self):
        assert has_feature_access(UserPlan.PREMIUM, "analytics_advanced") is True

    def test_unknown_feature_denied(self):
        assert has_feature_access(UserPlan.PREMIUM, "nonexistent_feature") is False


class TestGetMaxDocuments:
    def test_free_limit(self):
        assert get_max_documents("free") == 3

    def test_pro_unlimited(self):
        assert get_max_documents("pro") == -1

    def test_premium_unlimited(self):
        assert get_max_documents("premium") == -1

    def test_enum_input(self):
        assert get_max_documents(UserPlan.FREE) == 3


class TestGetMaxRoutes:
    def test_free_limit(self):
        assert get_max_routes("free") == 1

    def test_pro_limit(self):
        assert get_max_routes("pro") == 3

    def test_premium_unlimited(self):
        assert get_max_routes("premium") == -1


class TestAssertCanCreateRoute:
    def test_free_user_at_limit_raises(self):
        with pytest.raises(HTTPException) as exc_info:
            assert_can_create_route("free", 1)
        assert exc_info.value.status_code == 402

    def test_free_user_under_limit_passes(self):
        assert_can_create_route("free", 0)  # no exception

    def test_pro_user_at_limit_raises(self):
        with pytest.raises(HTTPException) as exc_info:
            assert_can_create_route("pro", 3)
        assert exc_info.value.status_code == 402

    def test_pro_user_under_limit_passes(self):
        assert_can_create_route("pro", 2)

    def test_premium_user_unlimited(self):
        assert_can_create_route("premium", 1000)  # no exception


class TestAssertCanCreateForgeDocument:
    def test_free_user_at_limit_raises(self):
        with pytest.raises(HTTPException) as exc_info:
            assert_can_create_forge_document("free", 3)
        assert exc_info.value.status_code == 402

    def test_free_user_under_limit_passes(self):
        assert_can_create_forge_document("free", 2)

    def test_pro_user_unlimited(self):
        assert_can_create_forge_document("pro", 100)  # no exception

    def test_premium_user_unlimited(self):
        assert_can_create_forge_document("premium", 100)  # no exception


class TestGetEntitlementContext:
    def _make_user(self, plan: str) -> Mock:
        user = Mock()
        user.plan = plan
        return user

    def test_free_context(self):
        ctx = get_entitlement_context(self._make_user("free"))
        assert ctx["plan"] == "free"
        assert ctx["is_paid"] is False
        assert ctx["limits"]["forge_documents"] == 3
        assert ctx["limits"]["routes"] == 1
        assert ctx["features"]["interview_simulator"] is False

    def test_pro_context(self):
        ctx = get_entitlement_context(self._make_user("pro"))
        assert ctx["plan"] == "pro"
        assert ctx["is_paid"] is True
        assert ctx["features"]["interview_simulator"] is True
        assert ctx["features"]["analytics_advanced"] is False

    def test_premium_context(self):
        ctx = get_entitlement_context(self._make_user("premium"))
        assert ctx["plan"] == "premium"
        assert ctx["is_paid"] is True
        assert ctx["features"]["analytics_advanced"] is True
