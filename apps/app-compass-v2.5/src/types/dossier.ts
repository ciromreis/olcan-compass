/**
 * @file Dossier Asset Types
 * @layer Forge / Dossier Management
 * @purpose Enhanced type system for opportunity-bound document management
 * 
 * CONTEXT:
 * Forge is the center of the dossier, not just a document list.
 * Documents are assets that serve specific opportunities in the user's journey.
 * This file defines the enhanced data model for multi-asset, opportunity-bound documents.
 */

import type { DocType, DocVersion, ForgeDocAnalysisMetrics } from "@/stores/forge";

/**
 * Readiness levels for dossier assets
 * - draft: Initial creation, not ready for review
 * - review: Ready for self-review or peer feedback
 * - export_ready: Polished, ready to export and submit
 * - submitted: Already submitted to target opportunity
 */
export type AssetReadinessLevel = "draft" | "review" | "export_ready" | "submitted";

/**
 * Asset types beyond traditional documents
 * Includes form responses, references, and other submission materials
 */
export type DossierAssetType =
  | DocType // Existing types: cv, motivation_letter, etc.
  | "form_response" // Structured responses for application forms
  | "reference_letter" // Letters of recommendation
  | "transcript" // Academic transcripts
  | "portfolio_item" // Work samples, publications
  | "certification"; // Certificates, test scores

/**
 * Compatibility score for a specific opportunity
 * Tracks how well this asset aligns with opportunity requirements
 */
export interface OpportunityCompatibility {
  opportunityId: string;
  opportunityTitle: string;
  
  /** Overall compatibility score (0-100) */
  score: number;
  
  /** ATS/keyword matching score */
  atsScore?: number;
  
  /** Alignment with opportunity requirements */
  requirementAlignment?: number;
  
  /** Tone/style appropriateness */
  styleScore?: number;
  
  /** Last optimization timestamp */
  lastOptimizedAt?: Date;
  
  /** Specific issues or suggestions for this opportunity */
  suggestions?: string[];
}

/**
 * Enhanced dossier asset model
 * Extends ForgeDocument with opportunity binding and multi-asset capabilities
 */
export interface DossierAsset {
  id: string;
  title: string;
  assetType: DossierAssetType;
  content: string;
  
  /** Readiness level for submission */
  readinessLevel: AssetReadinessLevel;
  
  /** Primary opportunity this asset was created for */
  primaryOpportunityId?: string;
  
  /** All opportunities this asset can serve (reusable across applications) */
  opportunityIds: string[];
  
  /** Compatibility scores per opportunity */
  compatibilityScores: Record<string, OpportunityCompatibility>;
  
  /** Version control */
  versions: DocVersion[];
  activeVersionId: string;
  
  /** Metadata */
  createdAt: string;
  updatedAt: string;
  language: string;
  
  /** Route binding (for route-specific assets) */
  routeId?: string | null;
  scope?: "universal" | "route";
  
  /** Analysis metrics (from AI coach) */
  metrics?: ForgeDocAnalysisMetrics | null;
  
  /** Constraints (word count, etc.) */
  constraints?: {
    minWords?: number;
    maxWords?: number;
    targetScholarship?: string;
  };
  
  /** Interview loop integration */
  interviewLoop?: {
    linkedSessionCount: number;
    completedSessionCount: number;
    averageOverallScore?: number | null;
    alignmentScore?: number | null;
    evidenceCoverageScore?: number | null;
    averageAnswerDurationSeconds?: number | null;
    strongestSignals: string[];
    focusAreas: string[];
    latestSessionId?: string | null;
  };
  
  /** Tags for organization */
  tags?: string[];
  
  /** Collaboration metadata (for future provider review feature) */
  reviewStatus?: "pending" | "in_review" | "approved" | "needs_changes";
  reviewedBy?: string;
  reviewedAt?: Date;
}

/**
 * Grouped view of dossier assets by opportunity
 * Used in UI to show "Dossier for [Opportunity Name]"
 */
export interface OpportunityDossier {
  opportunityId: string;
  opportunityTitle: string;
  opportunityType: string;
  deadline?: string;
  
  /** Assets bound to this opportunity */
  assets: DossierAsset[];
  
  /** Completion metrics */
  totalAssets: number;
  readyAssets: number;
  draftAssets: number;
  completionPercentage: number;
  
  /** Overall dossier quality score */
  overallQualityScore?: number;
}

/**
 * Form response structure for structured application forms
 * Many opportunities require filling out forms, not just uploading documents
 */
export interface FormResponse {
  id: string;
  opportunityId: string;
  formName: string;
  
  /** Structured field responses */
  fields: Record<string, {
    question: string;
    answer: string;
    wordCount?: number;
    characterCount?: number;
    maxWords?: number;
    maxCharacters?: number;
  }>;
  
  /** Readiness level */
  readinessLevel: AssetReadinessLevel;
  
  /** Metadata */
  createdAt: string;
  updatedAt: string;
  lastReviewedAt?: Date;
}

/**
 * Helper type guards
 */
export function isFormResponse(asset: DossierAsset): asset is DossierAsset & { assetType: "form_response" } {
  return asset.assetType === "form_response";
}

export function isExportReady(asset: DossierAsset): boolean {
  return asset.readinessLevel === "export_ready" || asset.readinessLevel === "submitted";
}

export function hasOpportunityBinding(asset: DossierAsset, opportunityId: string): boolean {
  return asset.opportunityIds.includes(opportunityId) || asset.primaryOpportunityId === opportunityId;
}

/**
 * Asset creation helpers
 */
export function createDossierAssetFromOpportunity(
  opportunityId: string,
  opportunityTitle: string,
  assetType: DossierAssetType,
  title: string
): Partial<DossierAsset> {
  return {
    title,
    assetType,
    content: "",
    readinessLevel: "draft",
    primaryOpportunityId: opportunityId,
    opportunityIds: [opportunityId],
    compatibilityScores: {
      [opportunityId]: {
        opportunityId,
        opportunityTitle,
        score: 0,
      },
    },
    versions: [],
    activeVersionId: "",
    language: "pt-BR",
    scope: "route",
    tags: [],
  };
}

/**
 * Compatibility score calculation
 * Combines ATS, requirement alignment, and style scores
 */
export function calculateCompatibilityScore(
  atsScore: number = 0,
  requirementAlignment: number = 0,
  styleScore: number = 0
): number {
  // Weighted average: ATS 40%, Requirements 40%, Style 20%
  return Math.round(
    atsScore * 0.4 +
    requirementAlignment * 0.4 +
    styleScore * 0.2
  );
}
