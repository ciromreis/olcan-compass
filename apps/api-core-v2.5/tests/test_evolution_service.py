"""Tests for Evolution Service — eligibility, stage transitions, stat bonuses."""

import pytest

from app.services.evolution_service import (
    EVOLUTION_REQUIREMENTS,
    STAGE_ORDER,
    STAGE_STAT_BONUSES,
    EligibilityResult,
    EvolutionRequirements,
)


# ============================================================
# Stage Configuration
# ============================================================

class TestStageConfiguration:
    def test_all_stages_have_requirements(self):
        for stage in STAGE_ORDER:
            assert stage in EVOLUTION_REQUIREMENTS

    def test_stage_order(self):
        assert STAGE_ORDER == ["egg", "sprout", "young", "mature", "master", "legendary"]

    def test_six_stages_exist(self):
        assert len(STAGE_ORDER) == 6

    def test_egg_has_zero_requirements(self):
        egg = EVOLUTION_REQUIREMENTS["egg"]
        assert egg.min_level == 1
        assert egg.min_care_streak == 0
        assert egg.required_achievements == []
        assert egg.min_days_at_stage == 0

    def test_legendary_has_highest_requirements(self):
        legendary = EVOLUTION_REQUIREMENTS["legendary"]
        assert legendary.min_level == 50
        assert legendary.min_care_streak == 60
        assert legendary.min_days_at_stage == 30


# ============================================================
# Requirement Progression
# ============================================================

class TestRequirementProgression:
    def test_level_requirements_increase(self):
        """Each stage should require a higher level than the previous."""
        prev_level = 0
        for stage in STAGE_ORDER:
            req = EVOLUTION_REQUIREMENTS[stage]
            assert req.min_level >= prev_level, f"{stage} has lower level than previous"
            prev_level = req.min_level

    def test_care_streak_requirements_increase(self):
        """Each stage should require a higher care streak."""
        prev_streak = -1
        for stage in STAGE_ORDER:
            req = EVOLUTION_REQUIREMENTS[stage]
            assert req.min_care_streak >= prev_streak, f"{stage} has lower streak than previous"
            prev_streak = req.min_care_streak

    def test_days_at_stage_increases(self):
        """Each stage should require more days."""
        prev_days = -1
        for stage in STAGE_ORDER:
            req = EVOLUTION_REQUIREMENTS[stage]
            assert req.min_days_at_stage >= prev_days, f"{stage} has fewer days than previous"
            prev_days = req.min_days_at_stage


# ============================================================
# Stat Bonuses
# ============================================================

class TestStatBonuses:
    def test_no_bonuses_for_egg(self):
        assert "egg" not in STAGE_STAT_BONUSES

    def test_all_evolved_stages_have_bonuses(self):
        for stage in STAGE_ORDER[1:]:  # skip egg
            assert stage in STAGE_STAT_BONUSES

    def test_bonuses_increase_with_stage(self):
        """Each stage should grant higher stat bonuses than the previous."""
        prev_power = 0
        for stage in STAGE_ORDER[1:]:
            bonuses = STAGE_STAT_BONUSES[stage]
            assert bonuses["power"] > prev_power, f"{stage} power not higher than previous"
            prev_power = bonuses["power"]

    def test_legendary_has_highest_bonuses(self):
        legendary = STAGE_STAT_BONUSES["legendary"]
        assert legendary["power"] == 25
        assert legendary["wisdom"] == 25
        assert legendary["charisma"] == 25
        assert legendary["agility"] == 25

    def test_all_four_stats_present(self):
        expected_stats = {"power", "wisdom", "charisma", "agility"}
        for stage in STAGE_ORDER[1:]:
            assert set(STAGE_STAT_BONUSES[stage].keys()) == expected_stats


# ============================================================
# EligibilityResult Dataclass
# ============================================================

class TestEligibilityResult:
    def test_eligible_result(self):
        result = EligibilityResult(
            eligible=True,
            current_stage="sprout",
            next_stage="young",
            requirements=EVOLUTION_REQUIREMENTS["young"],
            level_progress=1.0,
            streak_progress=1.0,
            days_progress=1.0,
            achievements_progress=1.0,
            current_level=15,
            current_streak=10,
            current_days=8,
            unlocked_required_achievements=1,
            total_required_achievements=1,
            reasons=[],
        )
        assert result.eligible is True
        assert result.next_stage == "young"

    def test_ineligible_result(self):
        result = EligibilityResult(
            eligible=False,
            current_stage="egg",
            next_stage="sprout",
            requirements=EVOLUTION_REQUIREMENTS["sprout"],
            level_progress=0.4,
            streak_progress=0.0,
            days_progress=0.5,
            achievements_progress=0.0,
            current_level=2,
            current_streak=0,
            current_days=1,
            unlocked_required_achievements=0,
            total_required_achievements=1,
            reasons=["Level too low", "No care streak"],
        )
        assert result.eligible is False
        assert len(result.reasons) == 2


# ============================================================
# Stage Transition Logic
# ============================================================

class TestStageTransitions:
    def test_next_stage_after_each(self):
        for i, stage in enumerate(STAGE_ORDER[:-1]):
            next_stage = STAGE_ORDER[i + 1]
            assert next_stage in EVOLUTION_REQUIREMENTS

    def test_legendary_is_final(self):
        idx = STAGE_ORDER.index("legendary")
        assert idx == len(STAGE_ORDER) - 1

    def test_evolution_requirements_are_dataclass(self):
        req = EVOLUTION_REQUIREMENTS["sprout"]
        assert isinstance(req, EvolutionRequirements)
        assert hasattr(req, "min_level")
        assert hasattr(req, "min_care_streak")
        assert hasattr(req, "required_achievements")
        assert hasattr(req, "min_days_at_stage")
        assert hasattr(req, "xp_cost")


# ============================================================
# Specific Stage Requirements
# ============================================================

class TestSpecificStageRequirements:
    def test_sprout_requirements(self):
        req = EVOLUTION_REQUIREMENTS["sprout"]
        assert req.min_level == 5
        assert req.min_care_streak == 3
        assert "first_care" in req.required_achievements

    def test_young_requirements(self):
        req = EVOLUTION_REQUIREMENTS["young"]
        assert req.min_level == 10
        assert req.min_care_streak == 7

    def test_mature_requirements(self):
        req = EVOLUTION_REQUIREMENTS["mature"]
        assert req.min_level == 20
        assert req.min_care_streak == 14

    def test_master_requirements(self):
        req = EVOLUTION_REQUIREMENTS["master"]
        assert req.min_level == 35
        assert req.min_care_streak == 30

    def test_legendary_achievements(self):
        req = EVOLUTION_REQUIREMENTS["legendary"]
        assert "care_streak_60" in req.required_achievements
        assert "all_abilities" in req.required_achievements
