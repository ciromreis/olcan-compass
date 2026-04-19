# Design Document: Enhanced Document Forge System

## Overview

The Enhanced Document Forge System transforms the Olcan Compass v2.5 from a single-process document creation tool into a comprehensive international mobility management platform. This design builds upon the existing Narrative Forge, Dossier System, Task Engine, OIOS psychological profiling, and gamification infrastructure to enable users to manage multiple parallel application processes while maintaining document variations, enhanced editing capabilities, and comprehensive technical reporting.

### Core Design Principles

1. **Event-Driven Architecture**: All user actions emit events that feed into gamification and Aura companion systems
2. **Clinical Grade Quality**: Maintain the "Liquid Glass" aesthetic and McKinsey/Bain consultancy-grade standards
3. **Metamodern Recombination**: High-fidelity content optimization without AI slop
4. **Psychological Integration**: OIOS Narrative_DNA drives document tone and style recommendations
5. **Arbitrage Optimization**: Career mobility treated as arbitrage operations with economic intelligence

### System Context

The Enhanced Document Forge integrates with:
- **PostgreSQL Database**: 19 existing Alembic migrations + new schema extensions
- **FastAPI Core**: Versioned API endpoints (`/api/v1/*`)
- **OIOS System**: 12 psychological archetypes driving personalization
- **Gamification Engine**: XP, levels, achievements, streaks
- **Aura Companion**: Biomechanical evolution stages responding to user progress
- **Existing Stores**: `forge.ts` (600+ lines), `dossier.ts`, `auraStore.ts`, `eventDrivenGamificationStore.ts`

---

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Enhanced Document Forge                      │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Process    │  │   Document   │  │     Task     │          │
│  │  Management  │  │   Variation  │  │     Hub      │          │
│  │              │  │   Manager    │  │              │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┴──────────────────┘                   │
│                            │                                      │
│         ┌──────────────────┴──────────────────┐                  │
│         │                                      │                  │
│  ┌──────▼───────┐                    ┌────────▼────────┐         │
│  │   Export     │                    │   Technical     │         │
│  │   Engine     │                    │     Report      │         │
│  │              │                    │   Generator     │         │
│  └──────────────┘                    └─────────────────┘         │
└───────────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼──────┐
│  Gamification  │  │      Aura      │  │    OIOS     │
│     Engine     │  │   Companion    │  │  Narrative  │
│                │  │                │  │     DNA     │
└────────────────┘  └────────────────┘  └─────────────┘
        │                   │                   │
        └───────────────────┴───────────────────┘
                            │
                    ┌───────▼────────┐
                    │   Event Bus    │
                    │                │
                    └────────────────┘
```

### Component Responsibilities

#### 1. Process Management Layer
- **Responsibility**: Orchestrate multiple parallel application processes
- **Key Functions**:
  - Process CRUD operations
  - Deadline tracking and urgency indicators
  - Readiness score calculation
  - Process dashboard aggregation
  - Process archival and lifecycle management

#### 2. Document Variation Manager
- **Responsibility**: Manage document relationships and content propagation
- **Key Functions**:
  - Classify documents (shared vs. process-specific)
  - Track variation trees and relationships
  - Propagate base content updates to variations
  - Preserve process-specific customizations
  - Bulk operations on document variations

#### 3. Task Hub
- **Responsibility**: Centralized task visualization and management
- **Key Functions**:
  - Multi-view rendering (list, kanban, calendar, timeline)
  - Task filtering and sorting
  - Dependency tracking
  - Template-based task generation
  - XP integration and streak tracking

#### 4. Export Engine
- **Responsibility**: Generate professional documents in multiple formats
- **Key Functions**:
  - Multi-format export (PDF, DOCX, Markdown)
  - Branding application (Olcan logo, QR codes)
  - Full dossier packaging
  - Metadata generation
  - Compression and optimization

#### 5. Technical Report Generator
- **Responsibility**: Dynamic progress reporting
- **Key Functions**:
  - Aggregate process metrics
  - Timeline visualization
  - Document inventory
  - Meeting and event logs
  - AI-powered recommendations

---

## Components and Interfaces

### 1. Process Store (`stores/process.ts`)

```typescript
export interface Process {
  id: string;
  userId: string;
  title: string;
  type: ProcessType;
  status: ProcessStatus;
  
  // Target Information
  targetInstitution?: string;
  targetOrganization?: string;
  targetCountry?: string;
  targetProgram?: string;
  
  // Timeline
  deadline: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  
  // Priority and Urgency
  priority: 'low' | 'medium' | 'high' | 'critical';
  urgencyLevel: number; // 0-100, calculated based on deadline proximity
  
  // Progress Tracking
  readinessScore: number; // 0-100
  taskCompletionPercentage: number;
  documentCompletionPercentage: number;
  
  // Relationships
  dossierId: string;
  routeId?: string | null;
  
  // Metadata
  tags: string[];
  notes?: string;
}

export type ProcessType =
  | 'university_admission_undergrad'
  | 'university_admission_graduate'
  | 'university_admission_phd'
  | 'scholarship_chevening'
  | 'scholarship_fulbright'
  | 'scholarship_daad'
  | 'scholarship_other'
  | 'visa_work'
  | 'visa_study'
  | 'visa_skilled_migration'
  | 'job_application_tech'
  | 'job_application_academic'
  | 'job_application_corporate'
  | 'professional_certification'
  | 'custom';

export type ProcessStatus =
  | 'planning'
  | 'in_progress'
  | 'ready_to_submit'
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'archived';

interface ProcessStore {
  processes: Process[];
  selectedProcessId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // CRUD Operations
  createProcess: (data: CreateProcessInput) => Promise<string>;
  updateProcess: (id: string, updates: Partial<Process>) => Promise<void>;
  deleteProcess: (id: string) => Promise<void>;
  archiveProcess: (id: string) => Promise<void>;
  
  // Queries
  getProcessById: (id: string) => Process | undefined;
  getActiveProcesses: () => Process[];
  getProcessesByStatus: (status: ProcessStatus) => Process[];
  getProcessesByType: (type: ProcessType) => Process[];
  
  // Calculations
  calculateReadinessScore: (processId: string) => number;
  calculateUrgencyLevel: (processId: string) => number;
  getProcessStats: () => ProcessStats;
  
  // Sync
  syncFromApi: () => Promise<void>;
}

interface ProcessStats {
  totalActive: number;
  totalArchived: number;
  averageReadiness: number;
  upcomingDeadlines: Array<{ processId: string; deadline: string; daysRemaining: number }>;
  criticalProcesses: Process[];
}
```

### 2. Document Variation Store (`stores/documentVariation.ts`)

```typescript
export interface DocumentVariation {
  id: string;
  baseDocumentId: string | null; // null if this is a base document
  processId: string;
  
  // Document Data
  title: string;
  type: DocType;
  content: string;
  
  // Variation Tracking
  isBaseDocument: boolean;
  variationLevel: number; // 0 for base, 1+ for variations
  parentVariationId: string | null;
  childVariationIds: string[];
  
  // Content Sections
  sections: DocumentSection[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string | null;
}

export interface DocumentSection {
  id: string;
  name: string;
  content: string;
  isShared: boolean; // true if inherited from base document
  isCustomized: boolean; // true if user modified shared content
  order: number;
}

interface DocumentVariationStore {
  variations: DocumentVariation[];
  variationTrees: VariationTree[];
  
  // CRUD Operations
  createVariation: (baseDocId: string, processId: string) => Promise<string>;
  updateVariationContent: (varId: string, content: string) => Promise<void>;
  updateSection: (varId: string, sectionId: string, content: string) => Promise<void>;
  deleteVariation: (varId: string) => Promise<void>;
  
  // Variation Management
  propagateBaseChanges: (baseDocId: string) => Promise<void>;
  markSectionAsCustomized: (varId: string, sectionId: string) => Promise<void>;
  resetSectionToBase: (varId: string, sectionId: string) => Promise<void>;
  
  // Queries
  getVariationTree: (baseDocId: string) => VariationTree;
  getVariationsByProcess: (processId: string) => DocumentVariation[];
  getBaseDocuments: () => DocumentVariation[];
  
  // Bulk Operations
  bulkUpdateVariations: (varIds: string[], updates: Partial<DocumentVariation>) => Promise<void>;
}

export interface VariationTree {
  baseDocument: DocumentVariation;
  variations: Array<{
    variation: DocumentVariation;
    processTitle: string;
    customizedSections: number;
    lastModified: string;
  }>;
}
```

### 3. Task Hub Store (`stores/taskHub.ts`)

```typescript
export interface Task {
  id: string;
  userId: string;
  processId: string | null; // null for global tasks
  
  // Task Data
  title: string;
  description: string;
  type: TaskType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: TaskStatus;
  
  // Timeline
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  
  // Dependencies
  dependsOn: string[]; // Task IDs
  blockedBy: string[]; // Task IDs
  blocks: string[]; // Task IDs this task blocks
  
  // Gamification
  xpValue: number;
  isSystemGenerated: boolean;
  templateId: string | null;
  
  // Metadata
  tags: string[];
  notes: string;
  attachments: TaskAttachment[];
  checklist: ChecklistItem[];
}

export type TaskType =
  | 'document_creation'
  | 'document_review'
  | 'research'
  | 'application_submission'
  | 'interview_preparation'
  | 'test_preparation'
  | 'administrative'
  | 'financial'
  | 'custom';

export type TaskStatus =
  | 'not_started'
  | 'in_progress'
  | 'blocked'
  | 'completed'
  | 'cancelled';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

interface TaskHubStore {
  tasks: Task[];
  viewMode: 'list' | 'kanban' | 'calendar' | 'timeline';
  filters: TaskFilters;
  
  // CRUD Operations
  createTask: (data: CreateTaskInput) => Promise<string>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  
  // Task Management
  addDependency: (taskId: string, dependsOnId: string) => Promise<void>;
  removeDependency: (taskId: string, dependsOnId: string) => Promise<void>;
  rescheduleTask: (taskId: string, newDueDate: string) => Promise<void>;
  
  // Bulk Operations
  bulkComplete: (taskIds: string[]) => Promise<void>;
  bulkReschedule: (taskIds: string[], newDueDate: string) => Promise<void>;
  
  // Queries
  getTasksByProcess: (processId: string) => Task[];
  getOverdueTasks: () => Task[];
  getUpcomingTasks: (days: number) => Task[];
  getBlockedTasks: () => Task[];
  
  // Analytics
  calculateTaskLoad: (period: 'day' | 'week' | 'month') => number;
  forecastCompletion: (processId: string) => Date | null;
  getVelocity: () => number; // tasks completed per week
  
  // Template System
  applyTemplate: (templateId: string, processId: string) => Promise<void>;
  createTemplate: (name: string, tasks: Partial<Task>[]) => Promise<string>;
}

export interface TaskFilters {
  processIds: string[];
  priorities: string[];
  statuses: string[];
  types: string[];
  dueDateRange: { start: string | null; end: string | null };
  searchQuery: string;
}
```

### 4. Export Engine (`lib/export-engine.ts`)

```typescript
export interface ExportOptions {
  format: 'pdf' | 'docx' | 'markdown';
  branding: 'olcan' | 'unbranded';
  includeMetadata: boolean;
  includeQRCode: boolean;
  compression: 'none' | 'standard' | 'maximum';
}

export interface DossierExportOptions extends ExportOptions {
  includeCoverPage: boolean;
  includeTableOfContents: boolean;
  documentTypes: DocType[]; // filter which documents to include
  includeVersionHistory: boolean;
}

export interface ExportResult {
  success: boolean;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  format: string;
  generatedAt: string;
  expiresAt: string; // temporary download link expiration
  metadata: ExportMetadata;
}

export interface ExportMetadata {
  processId: string;
  processTitle: string;
  exportedBy: string;
  documentCount: number;
  totalPages: number;
  readinessScore: number;
  generatedAt: string;
}

export class ExportEngine {
  // Single Document Export
  static async exportDocument(
    docId: string,
    options: ExportOptions
  ): Promise<ExportResult>;
  
  // Full Dossier Export
  static async exportDossier(
    processId: string,
    options: DossierExportOptions
  ): Promise<ExportResult>;
  
  // Batch Export
  static async batchExport(
    processIds: string[],
    options: DossierExportOptions
  ): Promise<ExportResult[]>;
  
  // Format Converters
  private static async convertToP