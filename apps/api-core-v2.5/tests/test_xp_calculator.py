"""Tests for XP Calculator — level thresholds, XP rewards, streak logic."""

import pytest
from datetime import datetime, timezone, timedelta

from app.services.xp_calculator import (
    XPCalculator,
    StreakManager,
    LEVEL_THRESHOLDS,
    LEVEL_TITLES,
    XP_REWARDS,
    STREAK_COOLDOWN_HOURS,
)


# ============================================================
# Level from XP
# ============================================================

class TestCalculateLevelFromXP:
    def test_zero_xp_is_level_1(self):
        assert XPCalculator.calculate_level_from_xp(0) == 1

    def test_exact_threshold_boundaries(self):
        for level, xp in LEVEL_THRESHOLDS.items():
            assert XPCalculator.calculate_level_from_xp(xp) == level

    def test_one_below_threshold(self):
        assert XPCalculator.calculate_level_from_xp(99) == 1
        assert XPCalculator.calculate_level_from_xp(249) == 2
        assert XPCalculator.calculate_level_from_xp(499) == 3

    def test_max_level_cap(self):
        assert XPCalculator.calculate_level_from_xp(999_999) == 10

    def test_negative_xp_is_level_1(self):
        assert XPCalculator.calculate_level_from_xp(-100) == 1


# ============================================================
# XP for Next Level
# ============================================================

class TestXPForNextLevel:
    def test_level_1_needs_100(self):
        xp_needed, threshold = XPCalculator.get_xp_for_next_level(0)
        assert xp_needed == 100
        assert threshold == 100

    def test_mid_level_progress(self):
        xp_needed, threshold = XPCalculator.get_xp_for_next_level(150)
        assert threshold == 250
        assert xp_needed == 100

    def test_max_level_returns_zero(self):
        xp_needed, _ = XPCalculator.get_xp_for_next_level(32000)
        assert xp_needed == 0

    def test_beyond_max_returns_zero(self):
        xp_needed, _ = XPCalculator.get_xp_for_next_level(100_000)
        assert xp_needed == 0


# ============================================================
# Level Progress
# ============================================================

class TestLevelProgress:
    def test_start_of_level_is_zero(self):
        assert XPCalculator.get_level_progress(0) == 0.0

    def test_halfway_through_level(self):
        # Level 1: 0-99, Level 2: 100. Midpoint = 50 XP => 50%
        progress = XPCalculator.get_level_progress(50)
        assert progress == pytest.approx(50.0)

    def test_max_level_is_100(self):
        assert XPCalculator.get_level_progress(32000) == 100.0

    def test_beyond_max_is_100(self):
        assert XPCalculator.get_level_progress(99999) == 100.0


# ============================================================
# Task XP Calculation
# ============================================================

class TestTaskXP:
    def test_critical_priority(self):
        xp = XPCalculator.calculate_task_xp("critical")
        assert xp == 50

    def test_high_priority(self):
        xp = XPCalculator.calculate_task_xp("high")
        assert xp == 25

    def test_medium_priority(self):
        xp = XPCalculator.calculate_task_xp("medium")
        assert xp == 10

    def test_low_priority(self):
        xp = XPCalculator.calculate_task_xp("low")
        assert xp == 10

    def test_unknown_priority_defaults_to_base(self):
        xp = XPCalculator.calculate_task_xp("unknown")
        assert xp == XP_REWARDS["task_complete_base"]

    def test_first_task_bonus(self):
        xp = XPCalculator.calculate_task_xp("medium", is_first_task_today=True)
        assert xp == 10 + 15  # base + first_task_of_day

    def test_streak_bonus(self):
        xp = XPCalculator.calculate_task_xp("medium", streak_days=5)
        assert xp == 10 + (5 * 5)  # base + streak_bonus

    def test_combined_bonuses(self):
        xp = XPCalculator.calculate_task_xp("critical", is_first_task_today=True, streak_days=3)
        assert xp == 50 + 15 + (3 * 5)  # critical + first_task + streak


# ============================================================
# Level Titles
# ============================================================

class TestLevelTitles:
    def test_all_levels_have_titles(self):
        for level in range(1, 11):
            assert level in LEVEL_TITLES

    def test_level_1_title(self):
        assert LEVEL_TITLES[1] == "Explorador"

    def test_level_10_title(self):
        assert LEVEL_TITLES[10] == "Lenda"


# ============================================================
# Streak Manager
# ============================================================

class TestStreakManager:
    def test_first_activity_returns_true(self):
        assert StreakManager.should_update_streak(None) is True

    def test_same_day_no_update(self):
        now = datetime(2026, 4, 15, 12, 0, tzinfo=timezone.utc)
        last = datetime(2026, 4, 15, 8, 0, tzinfo=timezone.utc)
        assert StreakManager.should_update_streak(last, now) is False

    def test_after_cooldown_updates(self):
        now = datetime(2026, 4, 17, 0, 0, tzinfo=timezone.utc)
        last = datetime(2026, 4, 15, 0, 0, tzinfo=timezone.utc)
        assert StreakManager.should_update_streak(last, now) is True

    def test_first_activity_streak_is_1(self):
        streak, broken = StreakManager.calculate_new_streak(0, None)
        assert streak == 1
        assert broken is False

    def test_same_day_no_increment(self):
        now = datetime(2026, 4, 15, 20, 0, tzinfo=timezone.utc)
        last = datetime(2026, 4, 15, 8, 0, tzinfo=timezone.utc)
        streak, broken = StreakManager.calculate_new_streak(5, last, now)
        assert streak == 5
        assert broken is False

    def test_next_day_increments(self):
        now = datetime(2026, 4, 16, 10, 0, tzinfo=timezone.utc)
        last = datetime(2026, 4, 15, 10, 0, tzinfo=timezone.utc)
        streak, broken = StreakManager.calculate_new_streak(5, last, now)
        assert streak == 6
        assert broken is False

    def test_gap_resets_streak(self):
        now = datetime(2026, 4, 18, 10, 0, tzinfo=timezone.utc)
        last = datetime(2026, 4, 15, 10, 0, tzinfo=timezone.utc)  # 72h gap > 36h cooldown
        streak, broken = StreakManager.calculate_new_streak(10, last, now)
        assert streak == 1
        assert broken is True

    def test_within_cooldown_window(self):
        """Activity within 24-36h window should increment."""
        now = datetime(2026, 4, 16, 18, 0, tzinfo=timezone.utc)
        last = datetime(2026, 4, 15, 10, 0, tzinfo=timezone.utc)  # 32h gap
        streak, broken = StreakManager.calculate_new_streak(3, last, now)
        assert streak == 4
        assert broken is False

    def test_exactly_at_cooldown_resets(self):
        """Activity at exactly STREAK_COOLDOWN_HOURS should reset."""
        last = datetime(2026, 4, 15, 0, 0, tzinfo=timezone.utc)
        now = last + timedelta(hours=STREAK_COOLDOWN_HOURS)
        streak, broken = StreakManager.calculate_new_streak(5, last, now)
        assert streak == 1
        assert broken is True


# ============================================================
# Level threshold monotonicity
# ============================================================

class TestLevelThresholdIntegrity:
    def test_thresholds_are_monotonically_increasing(self):
        levels = sorted(LEVEL_THRESHOLDS.keys())
        for i in range(1, len(levels)):
            assert LEVEL_THRESHOLDS[levels[i]] > LEVEL_THRESHOLDS[levels[i - 1]]

    def test_level_1_starts_at_zero(self):
        assert LEVEL_THRESHOLDS[1] == 0

    def test_ten_levels_exist(self):
        assert len(LEVEL_THRESHOLDS) == 10
