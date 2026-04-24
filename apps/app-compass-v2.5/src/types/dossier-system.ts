/**
 * Dossier System - Complete Type Definitions
 * 
 * Olcan Compass is a DOSSIER BUILDER, not just a document editor.
 * This file defines the complete data model for opportunity-bound application packages.
 */

// ============================================================================
// CORE DOSSIER ENTITY
// ============================================================================

export interface Dossier {
  id: string;
  userId: string;
  opportunityId: string; // Primary binding to application
  
  // Metadata
  title: string; // e.g., "MIT PhD Application 2027"
  status: DossierStatus;
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Profile snapshot (at time of application)
  profileSnapshot: ProfileSnapshot;
  
  // Opportunity details
  opportunity: OpportunityContext;
  
  // Documents collection
  documents: DossierDocument[];
  
  // Dossier-level tasks (not bound to a specific document)
  tasks?: Task[];
  
  // Preparation activities
  preparation: PreparationActivities;
  
  // Readiness evaluation
  readiness: ReadinessEvaluation;
  
  // Export history
  exports: DossierExport[];
  
  // Collaboration
  sharedWith?: string[];
  comments?: Comment[];
}

export type DossierStatus = 
  | "draft"           // Just created, minimal content
  | "in_progress"     // Actively working on documents
  | "review"          // Ready for review/feedback
  | "final"           // Finalized, ready to submit
  | "submitted"       // Actually submitted
  | "archived";       // No longer active

// ============================================================================
// PROFILE SNAPSHOT
// ============================================================================

export interface ProfileSnapshot {
  // Identity
  fullName: string;
  email: string;
  phone?: string;
  location: string;
  
  // Professional
  currentRole?: string;
  currentOrganization?: string;
  yearsOfExperience?: number;
  
  // Academic
  highestDegree?: string;
  institution?: string;
  fieldOfStudy?: string;
  
  // Psychometric
  archetype?: string;
  archetypeDescription?: string;
  
  // Readiness scores (at snapshot time)
  readinessScores: {
    logistic: number;      // Documents, admin, logistics
    narrative: number;     // Story, pitch, communication
    performance: number;   // Skills, experience, achievements
    psychological: number; // Confidence, resilience, fit
  };
  
  // Background
  background?: string;
  aspirations?: string;
  strengths?: string[];
  developmentAreas?: string[];
}

// ============================================================================
// OPPORTUNITY CONTEXT
// ============================================================================

export interface OpportunityContext {
  // Basic info
  program: string;
  institution: string;
  location: string;
  country: string;
  type: "education" | "employment" | "entrepreneurship" | "other";
  
  // Requirements
  requirements: Requirement[];
  criteria: Record<string, any>;
  
  // For ATS matching
  jobDescription?: string;
  keywords?: string[];
  
  // Timeline
  applicationDeadline: Date;
  startDate?: Date;
  duration?: string;
  
  // Links
  url?: string;
  applicationPortal?: string;
  
  // Analysis
  fitScore?: number;
  competitiveness?: "low" | "medium" | "high" | "very_high";
  estimatedAcceptanceRate?: number;
}

export interface Requirement {
  id: string;
  category: "document" | "qualification" | "experience" | "skill" | "other";
  title: string;
  description: string;
  required: boolean;
  met: boolean;
  evidence?: string; // Reference to document or section
}

// ============================================================================
// DOSSIER DOCUMENTS
// ============================================================================

export interface DossierDocument {
  id: string;
  dossierId: string;
  
  // Type and metadata
  type: DocumentType;
  title: string;
  description?: string;
  
  // Content
  content: string;
  wordCount: number;
  
  // Status tracking
  status: DocumentStatus;
  completionPercentage: number;
  
  // Quality metrics
  metrics: DocumentMetrics;
  
  // Dependencies
  requiredFor: string[]; // Milestone IDs
  blockedBy: string[];   // Task IDs
  
  // Versions
  versions: DocumentVersion[];
  currentVersionId: string;
  
  // Tasks
  tasks: Task[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastEditedAt: Date;
}

export type DocumentType =
  | "cv"
  | "resume"
  | "motivation_letter"
  | "cover_letter"
  | "research_proposal"
  | "personal_statement"
  | "statement_of_purpose"
  | "recommendation_letter"
  | "transcript"
  | "portfolio"
  | "writing_sample"
  | "other";

export type DocumentStatus =
  | "not_started"
  | "draft"
  | "in_review"
  | "final"
  | "submitted";

export interface DocumentMetrics {
  // ATS Analysis
  atsScore?: number;
  keywordsMatched?: string[];
  keywordsMissing?: string[];
  
  // Content quality
  competitivenessScore?: number;
  alignmentScore?: number;
  clarityScore?: number;
  impactScore?: number;
  
  // Readability
  readabilityScore?: number;
  avgSentenceLength?: number;
  complexWords?: number;
  
  // Structure
  structureScore?: number;
  sectionsFound?: string[];
  sectionsExpected?: string[];
}

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  label?: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  changes?: string;
  metrics?: DocumentMetrics;
}

// ============================================================================
// TASKS & MILESTONES
// ============================================================================

export interface Task {
  id: string;
  dossierId: string;
  
  // Content
  title: string;
  description?: string;
  
  // Classification
  type: TaskType;
  category: TaskCategory;
  
  // Status
  status: TaskStatus;
  priority: TaskPriority;
  
  // Timeline
  createdAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  
  // Relationships
  relatedDocumentId?: string;
  relatedMilestoneId?: string;
  dependsOn?: string[];
  
  // MECE readiness domain (§3 spec)
  readinessDomain?: ReadinessDomain;
  
  // Assignment
  assignedTo?: string;
  
  // Progress
  estimatedHours?: number;
  actualHours?: number;
  notes?: string;
}

export type TaskType =
  | "document"     // Create/edit document
  | "research"     // Research topic/requirement
  | "contact"      // Reach out to someone
  | "admin"        // Administrative task
  | "review"       // Review/feedback
  | "other";

export type TaskCategory =
  | "content_creation"
  | "editing"
  | "formatting"
  | "research"
  | "networking"
  | "administrative"
  | "review"
  | "other";

export type TaskStatus =
  | "todo"
  | "in_progress"
  | "blocked"
  | "done"
  | "cancelled";

export type TaskPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type ReadinessDomain =
  | "academic"
  | "financial"
  | "logistical"
  | "risk";

export interface Milestone {
  id: string;
  dossierId: string;
  
  // Content
  title: string;
  description: string;
  
  // Timeline
  dueDate: Date;
  completedAt?: Date;
  
  // Status
  status: MilestoneStatus;
  
  // Requirements
  requiredDocuments: string[];
  requiredTasks: string[];
  completionCriteria: string[];
  
  // Progress
  progress: number; // 0-100
}

export type MilestoneStatus =
  | "upcoming"
  | "in_progress"
  | "completed"
  | "missed";

// ============================================================================
// PREPARATION ACTIVITIES
// ============================================================================

export interface PreparationActivities {
  // Interview practice
  interviews: InterviewActivity[];
  
  // Events attended
  events: EventActivity[];
  
  // Skills developed
  skills: SkillDevelopment[];
  
  // Network connections
  connections: NetworkConnection[];
  
  // Research conducted
  research: ResearchActivity[];
}

export interface InterviewActivity {
  sessionId: string;
  date: Date;
  type: string;
  overallScore: number;
  dimensionScores: Record<string, number>;
  feedback: string[];
  improvements: string[];
}

export interface EventActivity {
  id: string;
  title: string;
  type: "webinar" | "workshop" | "conference" | "networking" | "other";
  date: Date;
  organizer?: string;
  relevance: "high" | "medium" | "low";
  learnings?: string[];
  connections?: string[];
}

export interface SkillDevelopment {
  skill: string;
  category: string;
  startDate: Date;
  currentLevel: "beginner" | "intermediate" | "advanced" | "expert";
  evidence: string[];
  certifications?: string[];
}

export interface NetworkConnection {
  name: string;
  role?: string;
  organization?: string;
  relationship: "mentor" | "peer" | "recommender" | "contact";
  connectedAt: Date;
  relevance: "high" | "medium" | "low";
  notes?: string;
}

export interface ResearchActivity {
  topic: string;
  date: Date;
  sources: string[];
  findings: string;
  appliedTo?: string[]; // Document IDs
}

// ============================================================================
// READINESS EVALUATION
// ============================================================================

export interface ReadinessEvaluation {
  // Overall
  overall: number; // 0-100
  lastEvaluated: Date;

  // Weighted breakdown (v1.0.0 unified algorithm: 40/30/20/10)
  // See src/lib/dossier-readiness.ts for the single source of truth.
  breakdown?: ReadinessBreakdown;

  // Per document
  perDocument: Record<string, DocumentReadiness>;

  // Gap analysis
  gaps: Gap[];

  // Recommendations
  recommendations: Recommendation[];

  // Strengths
  strengths: string[];

  // Risks
  risks: Risk[];
}

export type ReadinessDimensionKey =
  | "documents"
  | "tasks"
  | "profile"
  | "deadline";

export interface ReadinessComponent {
  score: number;         // 0-100 raw dimension score
  weight: number;        // 0-1 weight
  contribution: number;  // score × weight
  explanation: string;   // human-readable summary of this dimension
}

export interface ReadinessBreakdown {
  overall: number;
  components: Record<ReadinessDimensionKey, ReadinessComponent>;
  computedAt: string;    // ISO timestamp
  version: string;       // algorithm version
}

export interface DocumentReadiness {
  documentId: string;
  score: number;
  status: DocumentStatus;
  completeness: number;
  quality: number;
  alignment: number;
  blockers: string[];
  nextSteps: string[];
}

export interface Gap {
  id: string;
  category: "document" | "skill" | "experience" | "qualification";
  severity: "critical" | "important" | "minor";
  description: string;
  impact: string;
  suggestedActions: string[];
  estimatedEffort: "low" | "medium" | "high";
}

export interface Recommendation {
  id: string;
  priority: "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  expectedImpact: number;
  effort: "low" | "medium" | "high";
  actionSteps: string[];
  deadline?: Date;
}

export interface Risk {
  id: string;
  severity: "high" | "medium" | "low";
  category: "deadline" | "quality" | "requirement" | "other";
  description: string;
  likelihood: "high" | "medium" | "low";
  mitigation: string[];
}

// ============================================================================
// EXPORT SYSTEM
// ============================================================================

export interface DossierExport {
  id: string;
  dossierId: string;
  
  // Format
  format: ExportFormat;
  
  // Content
  includedSections: ExportSection[];
  
  // Options
  options: ExportOptions;
  
  // Output
  fileUrl?: string;
  fileSize?: number;
  
  // Metadata
  createdAt: Date;
  createdBy: string;
  version: string;
}

export type ExportFormat = "pdf" | "docx" | "zip" | "html";

export type ExportSection =
  | "cover_page"
  | "table_of_contents"
  | "profile_summary"
  | "opportunity_analysis"
  | "documents"
  | "preparation_evidence"
  | "task_tracker"
  | "readiness_report"
  | "timeline"
  | "appendices";

export interface ExportOptions {
  // Styling
  branding: {
    logo: boolean;
    colors: boolean;
    fonts: "professional" | "academic" | "creative";
  };
  
  // Content
  includeMetrics: boolean;
  includeCharts: boolean;
  includeFeedback: boolean;
  includeRecommendations: boolean;
  includeTaskDetails: boolean;
  
  // Privacy
  anonymize: boolean;
  redactSensitive: boolean;
  
  // Format-specific
  pdfOptions?: {
    pageSize: "A4" | "Letter";
    orientation: "portrait" | "landscape";
    margins: number;
  };
  
  docxOptions?: {
    template?: string;
    includeComments: boolean;
  };
}

// ============================================================================
// WIZARD SYSTEM
// ============================================================================

export interface DocumentWizard {
  documentType: DocumentType;
  dossierId: string;
  opportunityId: string;
  
  // Steps
  steps: WizardStep[];
  currentStepIndex: number;
  
  // Progress
  completedSteps: string[];
  skippedSteps: string[];
  
  // Data
  collectedData: Record<string, any>;
  
  // Validation
  validationErrors: Record<string, string[]>;
  
  // AI assistance
  suggestions: Record<string, string[]>;
  templates: DocumentTemplate[];
}

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  type: WizardStepType;
  
  // Requirements
  required: boolean;
  dependsOn: string[];
  
  // Content
  fields?: FormField[];
  editorConfig?: EditorConfig;
  
  // Features
  aiSuggestions?: boolean;
  atsOptimization?: boolean;
  templateSelection?: boolean;
  
  // Validation
  validate?: (data: any) => ValidationResult;
}

export type WizardStepType =
  | "form"
  | "editor"
  | "review"
  | "ai_assist"
  | "template_select"
  | "ats_optimize";

export interface FormField {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: any;
  helpText?: string;
}

export interface EditorConfig {
  minWords?: number;
  maxWords?: number;
  showWordCount: boolean;
  showAIAssist: boolean;
  showATSHints: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  documentType: DocumentType;
  content: string;
  sections: TemplateSection[];
  variables: string[];
}

export interface TemplateSection {
  id: string;
  title: string;
  content: string;
  required: boolean;
  order: number;
}
