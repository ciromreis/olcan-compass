// Olcan Compass V2 — Shared Type Definitions
// These types are shared between the Next.js frontend and FastAPI backend schemas.

// ============================================================
// User & Auth
// ============================================================

export type UserRole =
  | "USER"
  | "PROVIDER"
  | "ORG_MEMBER"
  | "ORG_COORDINATOR"
  | "ORG_ADMIN"
  | "SUPER_ADMIN";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  financial_baseline_brl?: number;
  target_salary_usd?: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Psychological Profile
// ============================================================

export type FearCluster =
  | "COMPETENCE"
  | "REJECTION"
  | "LOSS"
  | "IRREVERSIBILITY";

export type PsychState =
  | "UNCERTAIN"
  | "STRUCTURING"
  | "BUILDING_CONFIDENCE"
  | "EXECUTING"
  | "RESILIENT";

export interface PsychProfile {
  id: string;
  user_id: string;
  confidence_index: number;
  anxiety_score: number;
  discipline_score: number;
  fear_cluster?: FearCluster;
  psych_state: PsychState;
  archetype_label?: string;
  created_at: string;
}

// ============================================================
// Route & DAG
// ============================================================

export type RouteType =
  | "SCHOLARSHIP"
  | "JOB_RELOCATION"
  | "RESEARCH_PHD"
  | "STARTUP_VISA"
  | "EXCHANGE";

export type MobilityState =
  | "EXPLORING"
  | "PREPARING"
  | "APPLYING"
  | "AWAITING"
  | "ITERATING"
  | "RELOCATING";

export type NodeType =
  | "UPLOAD"
  | "AI_GENERATION"
  | "PAYMENT"
  | "MANUAL_CHECK";

export type MilestoneStatus =
  | "LOCKED"
  | "ACTIVE"
  | "STALLED"
  | "COMPLETED";

export interface RouteMilestone {
  id: string;
  route_id: string;
  template_milestone_id?: string;
  title: string;
  description: string;
  category?: string;
  node_type?: NodeType;
  status: MilestoneStatus;
  display_order: number;
  estimated_days?: number;
  target_date?: string;
  completed_at?: string;
  dependencies?: string[];
  stalled_since?: string;
}

export interface Route {
  id: string;
  user_id: string;
  template_id: string;
  route_type: RouteType;
  name: string;
  mobility_state: MobilityState;
  certainty_score?: number;
  progress_percentage: number;
  milestones: RouteMilestone[];
  created_at: string;
}

// ============================================================
// Economics Engine
// ============================================================

export interface CertaintyScore {
  score: number;
  visa_probability: number;
  financial_gap: number;
  total_target_capital: number;
  readiness_index: number;
  calculated_at: string;
}

export interface OpportunityCost {
  daily_cost_brl: number;
  daily_cost_usd: number;
  target_salary_usd: number;
  current_salary_brl: number;
  fx_rate: number;
  days_delayed: number;
  total_lost_brl: number;
}

export interface ReadinessScore {
  overall: number;
  dimensions: ReadinessDimension[];
  penalty_applied: boolean;
  deadline_proximity_days?: number;
}

export interface ReadinessDimension {
  name: string;
  weight: number;
  completion: number;
  score: number;
}

// ============================================================
// Narrative / Artifact Forge
// ============================================================

export type NarrativeType =
  | "PERSONAL_STATEMENT"
  | "MOTIVATION_LETTER"
  | "COVER_LETTER"
  | "RESEARCH_PROPOSAL"
  | "CV_RESUME"
  | "RECOMMENDATION_REQUEST";

export interface Narrative {
  id: string;
  user_id: string;
  title: string;
  narrative_type: NarrativeType;
  target_context?: string;
  olcan_score?: number;
  status: "DRAFT" | "IN_REVIEW" | "FINAL";
  created_at: string;
  updated_at: string;
}

export interface NarrativeAnalysis {
  clarity_score: number;
  specificity_score: number;
  emotional_resonance: number;
  olcan_score: number;
  improvement_actions: string[];
  highlights: string[];
  semantic_issues: SemanticIssue[];
}

export interface SemanticIssue {
  type: "FLUFF" | "CLICHE" | "VAGUE" | "STRONG";
  text: string;
  start_offset: number;
  end_offset: number;
  suggestion?: string;
}

// ============================================================
// Interview / Performance Simulator
// ============================================================

export interface InterviewSession {
  id: string;
  user_id: string;
  question_count: number;
  difficulty_level: number;
  confidence_projection?: number;
  delivery_score?: number;
  hesitation_index?: number;
  resilience_index?: number;
  status: "IN_PROGRESS" | "COMPLETED";
  created_at: string;
}

// ============================================================
// Marketplace
// ============================================================

export type ServiceType =
  | "TRANSLATION"
  | "LEGAL"
  | "MOCK_INTERVIEW"
  | "CAREER_COACHING"
  | "ACADEMIC_REVIEW"
  | "PSYCH_SUPPORT"
  | "RELOCATION";

export interface Provider {
  id: string;
  user_id: string;
  headline: string;
  bio: string;
  specializations: string[];
  rating_average: number;
  review_count: number;
  effectiveness_index?: number;
  services: ServiceListing[];
}

export interface ServiceListing {
  id: string;
  provider_id: string;
  service_type: ServiceType;
  title: string;
  description: string;
  price_usd: number;
  duration_minutes?: number;
}

export type EscrowStatus = "PENDING" | "HELD" | "RELEASED" | "REFUNDED" | "DISPUTED";

export interface EscrowTransaction {
  id: string;
  buyer_id: string;
  provider_id: string;
  service_id: string;
  amount_usd: number;
  status: EscrowStatus;
  stripe_pi_id?: string;
  created_at: string;
}

// ============================================================
// Subscription
// ============================================================

export type SubscriptionTier = "LITE" | "CORE" | "PRO" | "PREMIUM";

export type KineticBandwidth = "CONSTRAINED" | "MODERATE" | "ABUNDANT";

export type TargetResolution = "NEBULOUS" | "DIRECTIONAL" | "LOCKED";

// ============================================================
// PsychInteractionConfig (5,400 state permutations)
// ============================================================

export interface PsychInteractionConfig {
  route_type: RouteType;
  mobility_state: MobilityState;
  psych_state: PsychState;
  subscription_tier: SubscriptionTier;
  bandwidth: KineticBandwidth;
  target_resolution: TargetResolution;
  ui_tone: "encouraging" | "directive" | "clinical" | "urgent";
  next_domino_label: string;
  next_domino_path: string;
}
