"""Pydantic schemas for economics-driven intelligence features"""

from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator


# ============================================================================
# CREDENTIALS SCHEMAS
# ============================================================================

class GenerateCredentialRequest(BaseModel):
    """Request to generate a verification credential"""
    credential_type: str = Field(..., description="Type: 'readiness', 'expertise', 'achievement'")
    score_value: int = Field(..., ge=80, le=100, description="Score value (80-100)")
    credential_name: Optional[str] = Field(None, description="Optional custom name")


class CredentialResponse(BaseModel):
    """Verification credential response"""
    id: str
    credential_type: str
    credential_name: str
    score_value: int
    issued_at: datetime
    expires_at: Optional[datetime]
    verification_url: str
    verification_hash: str
    is_active: bool
    verification_clicks: int = 0
    
    model_config = {"from_attributes": True}


class CredentialListResponse(BaseModel):
    """List of user credentials"""
    credentials: List[CredentialResponse]
    total: int
    active_count: int


class CredentialPublicView(BaseModel):
    """Public verification view (no PII)"""
    credential_type: str
    credential_name: str
    score_value: int
    issued_at: datetime
    expires_at: Optional[datetime]
    is_valid: bool
    user_identifier_hash: str


class TrackCredentialUsageRequest(BaseModel):
    """Request to track credential usage"""
    application_id: str
    usage_type: str = Field(default="application_link")
    shared_with: Optional[str] = None


class TrackCredentialUsageResponse(BaseModel):
    """Response after tracking credential usage"""
    id: str
    tracked_at: datetime


# ============================================================================
# TEMPORAL MATCHING SCHEMAS
# ============================================================================

class TemporalPreferenceResponse(BaseModel):
    """User's temporal preference score"""
    temporal_preference: int = Field(..., ge=0, le=100)
    category: str
    description: str
    updated_at: datetime


class MatchedRouteResponse(BaseModel):
    """Route matched to temporal preference"""
    route_template_id: str
    route_type: str
    name_pt: str
    description_pt: str
    estimated_duration_months: int
    match_score: int
    match_reason: str
    recommended_temporal_range: List[int]


class MatchedRoutesListResponse(BaseModel):
    """List of matched routes"""
    matched_routes: List[MatchedRouteResponse]
    user_temporal_preference: int
    total_routes: int


class AdjustMilestonesRequest(BaseModel):
    """Request to adjust milestone density"""
    route_id: str


class AdjustMilestonesResponse(BaseModel):
    """Response after adjusting milestones"""
    route_id: str
    original_milestone_count: int
    adjusted_milestone_count: int
    adjustment_reason: str
    temporal_preference: int


class ChurnPredictionResponse(BaseModel):
    """Churn risk prediction"""
    user_id: str
    route_id: str
    churn_risk_score: float
    risk_level: str
    temporal_mismatch: int
    user_temporal_preference: int
    route_recommended_range: List[int]
    recommendation: str
    predicted_at: datetime


# ============================================================================
# OPPORTUNITY COST SCHEMAS
# ============================================================================

class OpportunityCostResponse(BaseModel):
    """Opportunity cost calculation"""
    opportunity_id: str
    opportunity_cost_daily: Decimal
    currency: str = "BRL"
    target_salary: Optional[Decimal] = None
    current_salary: Optional[Decimal] = None
    calculation_date: datetime


class MomentumResponse(BaseModel):
    """User momentum score"""
    momentum_score: int
    category: str
    milestones_completed_30d: int
    should_show_widget: bool
    last_check: datetime


class TrackWidgetImpressionRequest(BaseModel):
    """Track widget impression"""
    opportunity_id: Optional[str] = None
    opportunity_cost_shown: Decimal
    session_id: Optional[str] = None


class TrackWidgetClickRequest(BaseModel):
    """Track widget click"""
    opportunity_id: Optional[str] = None
    session_id: Optional[str] = None


class TrackWidgetConversionRequest(BaseModel):
    """Track widget conversion"""
    upgrade_tier: str = Field(..., description="'pro' or 'premium'")
    conversion_value: Decimal
    session_id: Optional[str] = None


class WidgetEventResponse(BaseModel):
    """Widget event tracking response"""
    event_id: str
    tracked_at: datetime
    conversion_attributed: Optional[bool] = None


# ============================================================================
# ESCROW SCHEMAS
# ============================================================================

class CreateEscrowRequest(BaseModel):
    """Request to create escrow transaction"""
    booking_id: str
    amount_held: Decimal = Field(..., gt=0)
    currency: str = Field(default="USD", max_length=3)
    release_condition: Dict[str, Any] = Field(
        ...,
        description="e.g., {'type': 'readiness_improvement', 'min_improvement': 10}"
    )


class EscrowResponse(BaseModel):
    """Escrow transaction response"""
    id: str
    booking_id: str
    amount_held: Decimal
    currency: str
    status: str
    release_condition: Dict[str, Any]
    readiness_before: Optional[int] = None
    readiness_after: Optional[int] = None
    improvement_achieved: Optional[int] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None


class EscrowResolutionResponse(BaseModel):
    """Escrow resolution response"""
    id: str
    status: str
    readiness_before: Optional[int]
    readiness_after: Optional[int]
    improvement_achieved: Optional[int]
    resolution: str
    resolved_at: datetime


class BookingEscrowStatusResponse(BaseModel):
    """Escrow status for a booking"""
    booking_id: str
    has_escrow: bool
    escrow: Optional[EscrowResponse] = None


# ============================================================================
# SCENARIO OPTIMIZATION SCHEMAS
# ============================================================================

class ScenarioConstraints(BaseModel):
    """Constraints for scenario simulation"""
    budget_max: Decimal = Field(..., gt=0)
    time_available_months: int = Field(..., ge=1, le=60)
    skill_level: int = Field(..., ge=0, le=100)
    target_locations: List[str] = Field(default_factory=list)
    preferred_industries: List[str] = Field(default_factory=list)


class OpportunityScore(BaseModel):
    """Opportunity with competitiveness and resource scores"""
    opportunity_id: str
    title: str
    competitiveness_score: int
    resource_requirements_score: int
    is_pareto_optimal: bool


class CalculateFrontierRequest(BaseModel):
    """Request to calculate feasible frontier"""
    constraints: ScenarioConstraints


class FeasibleFrontierResponse(BaseModel):
    """Feasible frontier calculation result"""
    simulation_id: str
    pareto_optimal_opportunities: List[OpportunityScore]
    total_opportunities_analyzed: int
    pareto_count: int
    calculated_at: datetime


class SimulationSummary(BaseModel):
    """Summary of a saved simulation"""
    id: str
    simulation_name: Optional[str]
    constraints: ScenarioConstraints
    pareto_count: int
    created_at: datetime


class SimulationsListResponse(BaseModel):
    """List of user simulations"""
    simulations: List[SimulationSummary]
    total: int


class SimulationDetailResponse(BaseModel):
    """Detailed simulation results"""
    id: str
    simulation_name: Optional[str]
    constraints: ScenarioConstraints
    pareto_opportunities: List[str]
    opportunities_detail: List[OpportunityScore]
    total_opportunities_analyzed: int
    created_at: datetime


class TrackDecisionRequest(BaseModel):
    """Track decision quality"""
    application_id: str
    opportunity_id: str
    was_pareto_optimal: bool


class TrackDecisionResponse(BaseModel):
    """Decision tracking response"""
    tracked: bool
    decision_quality_score: float


# ============================================================================
# ADMIN ANALYTICS SCHEMAS
# ============================================================================

class CredentialsDashboardResponse(BaseModel):
    """Credentials analytics dashboard"""
    total_issued: int
    active_count: int
    expired_count: int
    revoked_count: int
    verification_clicks: int
    click_through_rate: float
    conversion_attribution: Dict[str, Any]
    by_credential_type: Dict[str, int]


class TemporalDashboardResponse(BaseModel):
    """Temporal matching analytics dashboard"""
    user_distribution: Dict[str, int]
    churn_by_cohort: Dict[str, float]
    ltv_by_cohort: Dict[str, float]
    temporal_mismatch_alerts: int
    retention_interventions: Dict[str, Any]


class OpportunityCostDashboardResponse(BaseModel):
    """Opportunity cost widget analytics dashboard"""
    widget_impressions: int
    widget_clicks: int
    click_through_rate: float
    conversions: int
    conversion_rate: float
    attributed_revenue: Decimal
    development_cost: Decimal
    roi: float
    average_opportunity_cost_shown: Decimal
    by_tier: Dict[str, Dict[str, Any]]


class MarketplaceDashboardResponse(BaseModel):
    """Performance-bound marketplace analytics dashboard"""
    performance_bound_bookings: int
    total_bookings: int
    performance_bound_percentage: float
    escrow_release_rate: float
    refund_rate: float
    average_readiness_improvement: float
    total_escrow_value: Decimal
    provider_performance: List[Dict[str, Any]]
    revenue_impact: Dict[str, Any]


class ScenariosDashboardResponse(BaseModel):
    """Scenario simulator analytics dashboard"""
    total_sessions: int
    average_session_duration_seconds: int
    slider_interactions: int
    interactions_per_session: float
    decision_quality_distribution: Dict[str, int]
    average_decision_quality: float
    time_to_first_application: Dict[str, float]
    pareto_optimal_application_rate: float


class SuccessMetric(BaseModel):
    """Individual success metric"""
    current: float
    baseline: Optional[float] = None
    improvement: Optional[float] = None
    target: float
    target_met: bool


class SuccessMetricsResponse(BaseModel):
    """Five key success metrics"""
    credential_conversion_rate: SuccessMetric
    temporal_churn_reduction: SuccessMetric
    opportunity_cost_conversion: SuccessMetric
    marketplace_booking_value: SuccessMetric
    decision_paralysis_reduction: SuccessMetric
    overall_status: str
