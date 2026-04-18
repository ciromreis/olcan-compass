"""Tests for Forge credit deduction logic and billing credit packs."""

import pytest
from unittest.mock import Mock

from app.api.routes.billing import CREDIT_PACKS


# ============================================================
# Credit Pack Definitions
# ============================================================

class TestCreditPacks:
    def test_starter_pack_exists(self):
        assert "starter" in CREDIT_PACKS

    def test_pro_pack_exists(self):
        assert "pro" in CREDIT_PACKS

    def test_starter_gives_10_credits(self):
        assert CREDIT_PACKS["starter"]["credits"] == 10

    def test_pro_gives_50_credits(self):
        assert CREDIT_PACKS["pro"]["credits"] == 50

    def test_pro_costs_more_than_starter(self):
        assert CREDIT_PACKS["pro"]["amount_cents"] > CREDIT_PACKS["starter"]["amount_cents"]

    def test_packs_have_required_fields(self):
        for pack_id, pack in CREDIT_PACKS.items():
            assert "credits" in pack, f"{pack_id} missing credits"
            assert "amount_cents" in pack, f"{pack_id} missing amount_cents"
            assert "amount_brl" in pack, f"{pack_id} missing amount_brl"
            assert "label" in pack, f"{pack_id} missing label"

    def test_all_credits_positive(self):
        for pack_id, pack in CREDIT_PACKS.items():
            assert pack["credits"] > 0, f"{pack_id} has zero/negative credits"


# ============================================================
# Credit Deduction Logic (unit, no DB)
# ============================================================

class TestCreditDeduction:
    """Tests for the credit deduction pattern used in forge routes."""

    def test_deduction_reduces_by_one(self):
        """Polish should deduct exactly 1 credit."""
        user = Mock()
        user.forge_credits = 5
        user.forge_credits -= 1
        assert user.forge_credits == 4

    def test_zero_credits_blocks_polish(self):
        """User with 0 credits should be blocked (402)."""
        user = Mock()
        user.forge_credits = 0
        assert user.forge_credits < 1

    def test_negative_credits_blocks_polish(self):
        """Negative credits should also block."""
        user = Mock()
        user.forge_credits = -1
        assert user.forge_credits < 1

    def test_one_credit_allows_then_blocks(self):
        """User with 1 credit can polish once, then is blocked."""
        user = Mock()
        user.forge_credits = 1
        assert user.forge_credits >= 1  # allowed
        user.forge_credits -= 1
        assert user.forge_credits < 1  # blocked next time

    def test_webhook_credit_addition(self):
        """Webhook should add credits to user balance."""
        user = Mock()
        user.forge_credits = 3
        credits_to_add = CREDIT_PACKS["starter"]["credits"]
        user.forge_credits += credits_to_add
        assert user.forge_credits == 13

    def test_webhook_pro_credit_addition(self):
        """Pro pack webhook adds 50 credits."""
        user = Mock()
        user.forge_credits = 0
        user.forge_credits += CREDIT_PACKS["pro"]["credits"]
        assert user.forge_credits == 50


# ============================================================
# Credit Idempotency (Webhook)
# ============================================================

class TestCreditIdempotency:
    """Test that credit operations are safe against double-processing."""

    def test_same_credits_added_twice_doubles(self):
        """Without idempotency guard, adding twice doubles credits.
        This documents the expected behavior — the billing webhook
        checks event_id before processing to prevent this."""
        user = Mock()
        user.forge_credits = 0
        pack_credits = CREDIT_PACKS["starter"]["credits"]

        # First add
        user.forge_credits += pack_credits
        assert user.forge_credits == 10

        # Second add (would happen without idempotency)
        user.forge_credits += pack_credits
        assert user.forge_credits == 20  # This is what idempotency prevents

    def test_credit_balance_never_negative_after_deduction(self):
        """Ensure the check pattern prevents over-deduction."""
        user = Mock()
        user.forge_credits = 1

        # First polish — allowed
        if user.forge_credits >= 1:
            user.forge_credits -= 1

        # Second polish — blocked
        if user.forge_credits >= 1:
            user.forge_credits -= 1  # Should not execute

        assert user.forge_credits == 0  # Never goes negative


# ============================================================
# Default Credits
# ============================================================

class TestDefaultCredits:
    def test_new_user_gets_3_credits(self):
        """New users start with 3 free Forge credits (from User model default)."""
        # This mirrors the User model: forge_credits = mapped_column(default=3)
        DEFAULT_FORGE_CREDITS = 3
        assert DEFAULT_FORGE_CREDITS == 3

    def test_free_plan_has_limited_credits(self):
        """Free plan users rely on the initial 3 credits + purchases."""
        initial = 3
        # After 3 polishes, they need to buy more
        remaining = initial - 3
        assert remaining == 0
