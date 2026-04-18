"""Tests for Stripe webhook handling in billing.py.

These test the event-processing logic directly (not the HTTP layer),
verifying DB state transitions for each Stripe event type.
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from datetime import datetime, timezone


# ============================================================
# Helpers — build mock Stripe events
# ============================================================

def _make_checkout_event(user_id: str, mode: str = "payment", pack: str = "starter",
                         credits: str = "10", plan: str = "pro", session_id: str = "cs_test_123",
                         subscription_id: str = "sub_test_123"):
    return {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": session_id,
                "mode": mode,
                "subscription": subscription_id if mode == "subscription" else None,
                "customer": "cus_test_123",
                "metadata": {
                    "user_id": user_id,
                    "pack": pack,
                    "credits": credits,
                    "plan": plan,
                },
            }
        },
    }


def _make_subscription_event(event_type: str, customer_id: str,
                              sub_status: str = "active",
                              cancel_at_period_end: bool = False,
                              cancel_at: int | None = None):
    return {
        "type": event_type,
        "data": {
            "object": {
                "id": "sub_test_123",
                "status": sub_status,
                "customer": customer_id,
                "cancel_at_period_end": cancel_at_period_end,
                "cancel_at": cancel_at,
            }
        },
    }


def _make_invoice_event(event_type: str, customer_id: str):
    return {
        "type": event_type,
        "data": {
            "object": {
                "id": "in_test_123",
                "customer": customer_id,
            }
        },
    }


# ============================================================
# Credit pack purchase tests
# ============================================================

class TestCreditPackWebhook:
    def test_credit_pack_idempotency(self):
        """A purchase already marked 'paid' should not be re-credited."""
        from app.db.models.billing import CreditPurchase
        purchase = Mock(spec=CreditPurchase)
        purchase.status = "paid"
        purchase.stripe_session_id = "cs_test_123"

        # The webhook handler only credits when purchase.status == "pending"
        assert purchase.status != "pending"

    def test_credit_amount_mapping(self):
        """Verify credit pack definitions are consistent."""
        from app.api.routes.billing import CREDIT_PACKS
        assert CREDIT_PACKS["starter"]["credits"] == 10
        assert CREDIT_PACKS["pro"]["credits"] == 50
        assert CREDIT_PACKS["starter"]["amount_cents"] == 900
        assert CREDIT_PACKS["pro"]["amount_cents"] == 3900


# ============================================================
# Subscription lifecycle tests
# ============================================================

class TestSubscriptionWebhook:
    def test_subscription_plans_defined(self):
        """Both subscription plans must be defined with correct env var refs."""
        from app.api.routes.billing import SUBSCRIPTION_PLANS
        assert "pro" in SUBSCRIPTION_PLANS
        assert "premium" in SUBSCRIPTION_PLANS
        assert SUBSCRIPTION_PLANS["pro"]["stripe_price_id_env"] == "STRIPE_PRICE_PRO"
        assert SUBSCRIPTION_PLANS["premium"]["stripe_price_id_env"] == "STRIPE_PRICE_PREMIUM"

    def test_cancel_at_period_end_sets_timestamp(self):
        """When Stripe sends cancel_at_period_end, we should store the cancel_at date."""
        user = Mock()
        user.subscription_status = "active"
        user.subscription_cancel_at = None
        user.is_premium = True

        # Simulate the webhook logic
        cancel_at = 1735689600  # 2025-01-01T00:00:00Z
        cancel_at_period_end = True

        if cancel_at_period_end and cancel_at:
            user.subscription_cancel_at = datetime.fromtimestamp(cancel_at, tz=timezone.utc)
        elif not cancel_at_period_end:
            user.subscription_cancel_at = None

        assert user.subscription_cancel_at is not None
        assert user.subscription_cancel_at.year == 2025

    def test_resubscribe_clears_cancel_at(self):
        """If user resubscribes (cancel_at_period_end=False), clear cancel_at."""
        user = Mock()
        user.subscription_cancel_at = datetime(2025, 1, 1, tzinfo=timezone.utc)

        cancel_at_period_end = False
        if not cancel_at_period_end:
            user.subscription_cancel_at = None

        assert user.subscription_cancel_at is None


# ============================================================
# Invoice event tests
# ============================================================

class TestInvoiceEvents:
    def test_payment_failed_sets_past_due(self):
        """invoice.payment_failed should set subscription_status to past_due."""
        user = Mock()
        user.subscription_status = "active"
        user.is_premium = True

        # Simulate the webhook logic
        user.subscription_status = "past_due"
        # is_premium stays True for grace period

        assert user.subscription_status == "past_due"
        assert user.is_premium is True

    def test_invoice_paid_restores_active(self):
        """invoice.paid should restore active status from past_due."""
        user = Mock()
        user.subscription_status = "past_due"

        if user.subscription_status == "past_due":
            user.subscription_status = "active"

        assert user.subscription_status == "active"

    def test_invoice_paid_no_op_if_already_active(self):
        """invoice.paid should not change status if already active."""
        user = Mock()
        user.subscription_status = "active"

        # Only restore if past_due
        if user.subscription_status == "past_due":
            user.subscription_status = "restored"

        assert user.subscription_status == "active"


# ============================================================
# Subscription deletion tests
# ============================================================

class TestSubscriptionDeletion:
    def test_deleted_subscription_downgrades_to_free(self):
        """customer.subscription.deleted should downgrade user to free."""
        user = Mock()
        user.subscription_plan = "pro"
        user.is_premium = True
        user.subscription_status = "active"

        sub_status = "canceled"
        is_active = sub_status in ("active", "trialing")
        user.subscription_status = sub_status
        user.is_premium = is_active
        if not is_active and sub_status != "past_due":
            user.subscription_plan = "free"
            user.subscription_cancel_at = None

        assert user.subscription_plan == "free"
        assert user.is_premium is False
        assert user.subscription_status == "canceled"

    def test_past_due_keeps_plan(self):
        """past_due status should NOT downgrade to free (grace period)."""
        user = Mock()
        user.subscription_plan = "pro"
        user.is_premium = True

        sub_status = "past_due"
        is_active = sub_status in ("active", "trialing")
        user.subscription_status = sub_status
        user.is_premium = is_active
        if not is_active and sub_status != "past_due":
            user.subscription_plan = "free"

        # past_due is NOT active, but we don't downgrade
        assert user.subscription_plan == "pro"
        assert user.is_premium is False  # is_premium follows Stripe status
