"""Deterministic Opportunity Pruning Service

Implements bounded rationality reduction by filtering opportunities based on user constraints.
This is the core economic closure slice that reduces opportunity overload.
"""

import time
from datetime import datetime, timezone
from typing import List, Dict, Tuple, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.constraints import (
    UserConstraintProfile, 
    OpportunityPruningLog, 
    PruningReason
)
from app.db.models.application import Opportunity, UserApplication


class ConstraintViolation:
    """Represents a constraint violation with details"""
    def __init__(
        self, 
        constraint_type: str, 
        reason: PruningReason, 
        details: Dict, 
        severity: str = "hard"
    ):
        self.constraint_type = constraint_type
        self.reason = reason
        self.details = details
        self.severity = severity  # hard, soft, preference


class PruningResult:
    """Result of opportunity pruning with detailed explanation"""
    def __init__(
        self,
        opportunity_id: str,
        is_pruned: bool,
        overall_score: float,
        constraint_score: float,
        violations: List[ConstraintViolation] = None,
        explanation_title: str = None,
        explanation_detail: str = None
    ):
        self.opportunity_id = opportunity_id
        self.is_pruned = is_pruned
        self.overall_score = overall_score
        self.constraint_score = constraint_score
        self.violations = violations or []
        self.explanation_title = explanation_title
        self.explanation_detail = explanation_detail


class DeterministicPruner:
    """Deterministic opportunity pruner for bounded rationality reduction"""
    
    def __init__(self):
        self.version = "v1.0"
    
    async def prune_opportunities_for_user(
        self, 
        db: AsyncSession, 
        user_id: str,
        opportunities: List[Opportunity]
    ) -> List[PruningResult]:
        """Prune opportunities based on user constraints"""
        start_time = time.time()
        
        # Get user constraint profile
        constraint_profile = await self._get_constraint_profile(db, user_id)
        if not constraint_profile or not constraint_profile.is_active:
            # No constraints = show everything
            return [
                PruningResult(
                    opportunity_id=str(opp.id),
                    is_pruned=False,
                    overall_score=50.0,
                    constraint_score=100.0,
                    explanation_title="Sem restrições definidas",
                    explanation_detail="Configure seu perfil para recomendações personalizadas"
                )
                for opp in opportunities
            ]
        
        # Get user's existing applications
        user_applications = await self._get_user_applications(db, user_id)
        applied_opportunity_ids = {str(app.opportunity_id) for app in user_applications}
        
        results = []
        for opportunity in opportunities:
            result = await self._evaluate_opportunity(
                opportunity, 
                constraint_profile, 
                applied_opportunity_ids
            )
            results.append(result)
            
            # Log the pruning decision
            await self._log_pruning_decision(db, user_id, opportunity.id, result)
        
        processing_time = int((time.time() - start_time) * 1000)
        print(f"Pruned {len(opportunities)} opportunities for user {user_id} in {processing_time}ms")
        
        return results
    
    async def _get_constraint_profile(
        self, 
        db: AsyncSession, 
        user_id: str
    ) -> Optional[UserConstraintProfile]:
        """Get user's constraint profile"""
        result = await db.execute(
            select(UserConstraintProfile).where(
                UserConstraintProfile.user_id == user_id
            )
        )
        return result.scalar_one_or_none()
    
    async def _get_user_applications(
        self, 
        db: AsyncSession, 
        user_id: str
    ) -> List[UserApplication]:
        """Get user's existing applications"""
        result = await db.execute(
            select(UserApplication).where(
                UserApplication.user_id == user_id
            )
        )
        return result.scalars().all()
    
    async def _evaluate_opportunity(
        self,
        opportunity: Opportunity,
        constraints: UserConstraintProfile,
        applied_opportunity_ids: set
    ) -> PruningResult:
        """Evaluate opportunity against constraints"""
        violations = []
        constraint_score = 100.0
        
        # 1. Check if already applied
        if str(opportunity.id) in applied_opportunity_ids:
            violations.append(ConstraintViolation(
                constraint_type="application_status",
                reason=PruningReason.ALREADY_APPLIED,
                details={"status": "already_applied"},
                severity="hard"
            ))
            constraint_score -= 100.0
        
        # 2. Check deadline
        if opportunity.application_deadline and opportunity.application_deadline < datetime.now(timezone.utc):
            violations.append(ConstraintViolation(
                constraint_type="deadline",
                reason=PruningReason.DEADLINE_PASSED,
                details={"deadline": opportunity.application_deadline.isoformat()},
                severity="hard"
            ))
            constraint_score -= 100.0
        
        # 3. Budget constraint
        if constraints.budget_max and opportunity.funding_amount:
            if opportunity.funding_amount > constraints.budget_max:
                violations.append(ConstraintViolation(
                    constraint_type="budget",
                    reason=PruningReason.BUDGET_EXCEEDED,
                    details={
                        "required": float(opportunity.funding_amount),
                        "available": float(constraints.budget_max)
                    },
                    severity="hard"
                ))
                constraint_score -= 30.0
        
        # 4. Timeline constraint
        if constraints.time_available_months and opportunity.duration_months:
            if opportunity.duration_months > constraints.time_available_months:
                violations.append(ConstraintViolation(
                    constraint_type="timeline",
                    reason=PruningReason.TIMELINE_TOO_LONG,
                    details={
                        "required": opportunity.duration_months,
                        "available": constraints.time_available_months
                    },
                    severity="hard"
                ))
                constraint_score -= 25.0
        
        # 5. Location constraint
        if constraints.target_countries and opportunity.location_country:
            if opportunity.location_country not in constraints.target_countries:
                # Check if it's in excluded countries
                if constraints.excluded_countries and opportunity.location_country in constraints.excluded_countries:
                    violations.append(ConstraintViolation(
                        constraint_type="location",
                        reason=PruningReason.LOCATION_MISMATCH,
                        details={
                            "location": opportunity.location_country,
                            "preferred": constraints.target_countries,
                            "excluded": constraints.excluded_countries
                        },
                        severity="hard"
                    ))
                    constraint_score -= 40.0
                else:
                    # Not in preferred but not excluded - soft violation
                    violations.append(ConstraintViolation(
                        constraint_type="location",
                        reason=PruningReason.LOCATION_MISMATCH,
                        details={
                            "location": opportunity.location_country,
                            "preferred": constraints.target_countries
                        },
                        severity="soft"
                    ))
                    constraint_score -= 10.0
        
        # 6. Language constraint
        if constraints.languages and opportunity.required_languages:
            missing_languages = []
            for lang in opportunity.required_languages:
                if not any(user_lang.get("code") == lang and user_lang.get("level", "A1") >= "B1" 
                          for user_lang in constraints.languages):
                    missing_languages.append(lang)
            
            if missing_languages:
                violations.append(ConstraintViolation(
                    constraint_type="language",
                    reason=PruningReason.LANGUAGE_REQUIREMENT,
                    details={
                        "required": opportunity.required_languages,
                        "missing": missing_languages,
                        "user_languages": constraints.languages
                    },
                    severity="hard"
                ))
                constraint_score -= 35.0
        
        # 7. Education constraint
        if constraints.education_level and opportunity.education_level:
            education_hierarchy = ["high_school", "bachelor", "master", "phd"]
            user_level_idx = education_hierarchy.index(constraints.education_level) if constraints.education_level in education_hierarchy else -1
            required_level_idx = education_hierarchy.index(opportunity.education_level) if opportunity.education_level in education_hierarchy else -1
            
            if user_level_idx < required_level_idx:
                violations.append(ConstraintViolation(
                    constraint_type="education",
                    reason=PruningReason.EDUCATION_INSUFFICIENT,
                    details={
                        "required": opportunity.education_level,
                        "current": constraints.education_level
                    },
                    severity="hard"
                ))
                constraint_score -= 20.0
        
        # 8. Experience constraint
        if constraints.years_experience is not None and opportunity.required_experience_years:
            if constraints.years_experience < opportunity.required_experience_years:
                violations.append(ConstraintViolation(
                    constraint_type="experience",
                    reason=PruningReason.EXPERIENCE_INSUFFICIENT,
                    details={
                        "required": opportunity.required_experience_years,
                        "current": constraints.years_experience
                    },
                    severity="hard"
                ))
                constraint_score -= 15.0
        
        # Calculate overall score
        overall_score = max(0.0, constraint_score)
        
        # Determine if pruned (hard violations = prune)
        hard_violations = [v for v in violations if v.severity == "hard"]
        is_pruned = len(hard_violations) > 0
        
        # Generate explanation
        explanation_title, explanation_detail = self._generate_explanation(
            violations, is_pruned, opportunity
        )
        
        return PruningResult(
            opportunity_id=str(opportunity.id),
            is_pruned=is_pruned,
            overall_score=overall_score,
            constraint_score=constraint_score,
            violations=violations,
            explanation_title=explanation_title,
            explanation_detail=explanation_detail
        )
    
    def _generate_explanation(
        self, 
        violations: List[ConstraintViolation], 
        is_pruned: bool, 
        opportunity: Opportunity
    ) -> Tuple[str, str]:
        """Generate user-friendly explanation for pruning decision"""
        
        if not violations:
            return "Compatível", "Esta oportunidade corresponde ao seu perfil."
        
        if is_pruned:
            # Hard violation - explain why it's hidden
            hard_violations = [v for v in violations if v.severity == "hard"]
            primary_violation = hard_violations[0]
            
            explanations = {
                PruningReason.BUDGET_EXCEEDED: (
                    "Excede o orçamento",
                    f"Esta oportunidade requer {primary_violation.details.get('required', 0):.2f} mas seu orçamento é de {primary_violation.details.get('available', 0):.2f}."
                ),
                PruningReason.TIMELINE_TOO_LONG: (
                    "Timeline incompatível",
                    f"Duração de {primary_violation.details.get('required', 0)} meses excede seu disponível de {primary_violation.details.get('available', 0)} meses."
                ),
                PruningReason.LOCATION_MISMATCH: (
                    "Fora da área preferida",
                    f"Localização em {primary_violation.details.get('location', '')} não está entre seus países preferidos."
                ),
                PruningReason.LANGUAGE_REQUIREMENT: (
                    "Requisito de idioma",
                    f"Requer proficiência em {', '.join(primary_violation.details.get('missing', []))}."
                ),
                PruningReason.DEADLINE_PASSED: (
                    "Prazo encerrado",
                    "O prazo para inscrição nesta oportunidade já passou."
                ),
                PruningReason.ALREADY_APPLIED: (
                    "Já inscrito",
                    "Você já se inscreveu nesta oportunidade."
                )
            }
            
            return explanations.get(
                primary_violation.reason, 
                ("Incompatível", "Esta oportunidade não corresponde às suas restrições.")
            )
        else:
            # Soft violations - show with warnings
            soft_violations = [v for v in violations if v.severity == "soft"]
            if soft_violations:
                return (
                    "Compatível com ressalvas", 
                    f"Atende seus critérios principais, mas considere: {', '.join([v.details.get('location', '') for v in soft_violations])}."
                )
            else:
                return ("Compatível", "Esta oportunidade corresponde ao seu perfil.")
    
    async def _log_pruning_decision(
        self,
        db: AsyncSession,
        user_id: str,
        opportunity_id: str,
        result: PruningResult
    ):
        """Log pruning decision for transparency and learning"""
        log_entry = OpportunityPruningLog(
            user_id=user_id,
            opportunity_id=opportunity_id,
            is_pruned=result.is_pruned,
            pruning_reason=result.violations[0].reason if result.violations else None,
            violated_constraints=[v.constraint_type for v in result.violations],
            constraint_details=[v.details for v in result.violations],
            overall_score=result.overall_score,
            constraint_score=result.constraint_score,
            explanation_title=result.explanation_title,
            explanation_detail=result.explanation_detail,
            pruning_algorithm_version=self.version
        )
        
        db.add(log_entry)
        await db.flush()


# Global instance
pruner = DeterministicPruner()
