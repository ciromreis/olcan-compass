/**
 * Dossier Store - Complete Application Package Management
 *
 * Manages opportunity-bound dossiers containing:
 * - Profile snapshot
 * - Opportunity context
 * - Multiple documents
 * - Tasks and milestones
 * - Preparation activities
 * - Readiness evaluation
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dossiersApi } from "@/lib/api";
import { computeReadiness } from "@/lib/dossier-readiness";
import { generateDefaultTasks } from "@/lib/dossier-task-generator";
import type {
  Dossier,
  DossierDocument,
  Task,
  Milestone,
  DossierStatus,
  DocumentStatus,
  TaskStatus,
  ProfileSnapshot,
  OpportunityContext,
  ReadinessEvaluation,
  ReadinessDomain,
} from "@/types/dossier-system";

// ─── Backend ↔ Frontend mappers ───────────────────────────────────────────────

// Backend uses different status strings than the frontend type system
const BACKEND_TO_FRONTEND_STATUS: Record<string, DossierStatus> = {
  draft: "draft",
  active: "in_progress",
  finalizing: "review",
  completed: "final",
  archived: "archived",
};

const FRONTEND_TO_BACKEND_STATUS: Record<DossierStatus, string> = {
  draft: "draft",
  in_progress: "active",
  review: "finalizing",
  final: "completed",
  submitted: "completed",
  archived: "archived",
};

function mapBackendDossier(raw: Record<string, unknown>): Dossier {
  const ctx = (raw.opportunity_context as Record<string, unknown>) || {};
  const readinessEval =
    (raw.readiness_evaluation as Record<string, unknown>) || {};
  const rawDocuments = Array.isArray(raw.documents)
    ? (raw.documents as Array<Record<string, unknown>>)
    : [];
  const rawTasks = Array.isArray(raw.tasks)
    ? (raw.tasks as Array<Record<string, unknown>>)
    : [];

  const mappedTasks: Task[] = rawTasks.map((task) => ({
    id: String(task.id),
    dossierId: String(task.dossier_id || raw.id || ""),
    title: String(task.title || "Task"),
    description:
      typeof task.description === "string" ? task.description : undefined,
    type: "other",
    category: "other",
    status:
      task.status === "done"
        ? "done"
        : task.status === "in_progress"
          ? "in_progress"
          : task.status === "blocked"
            ? "blocked"
            : "todo",
    priority:
      task.priority === "critical"
        ? "critical"
        : task.priority === "high"
          ? "high"
          : task.priority === "low"
            ? "low"
            : "medium",
    createdAt: task.created_at ? new Date(String(task.created_at)) : new Date(),
    dueDate: task.due_date ? new Date(String(task.due_date)) : undefined,
    completedAt: task.completed_at
      ? new Date(String(task.completed_at))
      : undefined,
    relatedDocumentId: task.document_id ? String(task.document_id) : undefined,
    readinessDomain: (task.readiness_domain as ReadinessDomain) || undefined,
  }));

  const mappedDocuments: DossierDocument[] = rawDocuments.map((doc) => {
    const documentTasks = mappedTasks.filter(
      (task) => task.relatedDocumentId === String(doc.id),
    );

    return {
      id: String(doc.id),
      dossierId: String(doc.dossier_id || raw.id || ""),
      type: ((doc.type as string) || "other") as DossierDocument["type"],
      title: String(doc.title || "Untitled Document"),
      description: undefined,
      content: String(doc.content || ""),
      wordCount: Number(doc.word_count || 0),
      status:
        doc.status === "final" || doc.status === "polished"
          ? "final"
          : doc.status === "review"
            ? "in_review"
            : doc.status === "draft"
              ? "draft"
              : "not_started",
      completionPercentage: Number(doc.completion_percentage || 0),
      metrics: (doc.metrics as DossierDocument["metrics"]) || {},
      requiredFor: [],
      blockedBy: [],
      versions: [],
      currentVersionId: "",
      tasks: documentTasks,
      createdAt: doc.created_at ? new Date(String(doc.created_at)) : new Date(),
      updatedAt: doc.updated_at ? new Date(String(doc.updated_at)) : new Date(),
      lastEditedAt: doc.updated_at
        ? new Date(String(doc.updated_at))
        : new Date(),
    };
  });

  return {
    id: raw.id as string,
    userId: raw.user_id as string,
    opportunityId: (raw.opportunity_id as string) || "",
    title: (raw.title as string) || "Dossier",
    status: BACKEND_TO_FRONTEND_STATUS[raw.status as string] ?? "draft",
    deadline: raw.deadline
      ? new Date(raw.deadline as string)
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    createdAt: new Date(raw.created_at as string),
    updatedAt: new Date(raw.updated_at as string),
    profileSnapshot:
      (raw.profile_snapshot as ProfileSnapshot) || ({} as ProfileSnapshot),
    opportunity: {
      program: (ctx.program as string) || "",
      institution: (ctx.institution as string) || "",
      location: (ctx.location as string) || "",
      country: (ctx.country as string) || "",
      type: ((ctx.type as string) || "other") as OpportunityContext["type"],
      requirements:
        (ctx.requirements as OpportunityContext["requirements"]) || [],
      criteria: (ctx.criteria as Record<string, unknown>) || {},
      applicationDeadline: raw.deadline
        ? new Date(raw.deadline as string)
        : new Date(),
    } as unknown as OpportunityContext,
    documents: mappedDocuments,
    tasks: mappedTasks.filter((t) => !t.relatedDocumentId),
    preparation: {
      interviews: [],
      events: [],
      skills: [],
      connections: [],
      research: [],
    },
    readiness: {
      overall: (raw.current_readiness as number) || 0,
      lastEvaluated: readinessEval.last_evaluation
        ? new Date(readinessEval.last_evaluation as string)
        : new Date(),
      perDocument: mappedDocuments.reduce(
        (acc, doc) => {
          acc[doc.id] = {
            documentId: doc.id,
            score:
              doc.status === "final" || doc.status === "submitted"
                ? 100
                : doc.completionPercentage || 0,
            status: doc.status,
            completeness: doc.completionPercentage || 0,
            quality: doc.metrics?.competitivenessScore || 0,
            alignment: doc.metrics?.alignmentScore || 0,
            blockers: doc.blockedBy || [],
            nextSteps: [],
          };
          return acc;
        },
        {} as ReadinessEvaluation["perDocument"],
      ),
      gaps: Array.isArray(readinessEval.gaps)
        ? (readinessEval.gaps as Array<Record<string, unknown>>).map(
            (gap, index) => ({
              id: String(gap.id || `gap-${index}`),
              category:
                gap.category === "skill" ||
                gap.category === "experience" ||
                gap.category === "qualification"
                  ? gap.category
                  : "document",
              severity:
                gap.severity === "critical" ||
                gap.severity === "important" ||
                gap.severity === "minor"
                  ? gap.severity
                  : "important",
              description: String(gap.description || ""),
              impact: String(gap.impact || ""),
              suggestedActions: Array.isArray(gap.suggestedActions)
                ? (gap.suggestedActions as string[])
                : [],
              estimatedEffort:
                gap.estimatedEffort === "low" ||
                gap.estimatedEffort === "medium" ||
                gap.estimatedEffort === "high"
                  ? gap.estimatedEffort
                  : "medium",
            }),
          )
        : [],
      recommendations: Array.isArray(readinessEval.recommendations)
        ? (readinessEval.recommendations as Array<Record<string, unknown>>).map(
            (recommendation, index) => ({
              id: String(recommendation.id || `rec-${index}`),
              priority:
                recommendation.priority === "high" ||
                recommendation.priority === "medium" ||
                recommendation.priority === "low"
                  ? recommendation.priority
                  : "medium",
              category: String(recommendation.category || "general"),
              title: String(recommendation.title || ""),
              description: String(recommendation.description || ""),
              expectedImpact: Number(recommendation.expectedImpact || 0),
              effort:
                recommendation.effort === "low" ||
                recommendation.effort === "medium" ||
                recommendation.effort === "high"
                  ? recommendation.effort
                  : "medium",
              actionSteps: Array.isArray(recommendation.actionSteps)
                ? (recommendation.actionSteps as string[])
                : [],
              deadline: recommendation.deadline
                ? new Date(String(recommendation.deadline))
                : undefined,
            }),
          )
        : [],
      strengths: Array.isArray(readinessEval.strengths)
        ? (readinessEval.strengths as string[])
        : [],
      risks: Array.isArray(readinessEval.risks)
        ? (readinessEval.risks as Array<Record<string, unknown>>).map(
            (risk, index) => ({
              id: String(risk.id || `risk-${index}`),
              category:
                risk.category === "deadline" ||
                risk.category === "quality" ||
                risk.category === "requirement"
                  ? risk.category
                  : "other",
              likelihood:
                risk.likelihood === "low" ||
                risk.likelihood === "medium" ||
                risk.likelihood === "high"
                  ? risk.likelihood
                  : risk.probability === "low" ||
                      risk.probability === "medium" ||
                      risk.probability === "high"
                    ? risk.probability
                    : "medium",
              severity:
                risk.severity === "low" ||
                risk.severity === "medium" ||
                risk.severity === "high"
                  ? risk.severity
                  : "medium",
              description: String(risk.description || ""),
              mitigation: Array.isArray(risk.mitigation)
                ? (risk.mitigation as string[])
                : Array.isArray(risk.mitigationStrategies)
                  ? (risk.mitigationStrategies as string[])
                  : [],
            }),
          )
        : [],
    },
    exports: [],
  };
}

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface DossierState {
  // Data
  dossiers: Dossier[];
  currentDossierId: string | null;

  // Loading states
  loading: boolean;
  syncing: boolean;

  // Error handling
  error: string | null;

  // Getters
  getDossierById: (id: string) => Dossier | undefined;
  getCurrentDossier: () => Dossier | undefined;
  getDossiersByStatus: (status: DossierStatus) => Dossier[];
  getActiveDossiers: () => Dossier[];
  getUpcomingDeadlines: () => Array<{ dossier: Dossier; daysUntil: number }>;

  // Document getters
  getDocumentById: (
    dossierId: string,
    documentId: string,
  ) => DossierDocument | undefined;
  getDocumentsByType: (dossierId: string, type: string) => DossierDocument[];
  getDocumentsByStatus: (
    dossierId: string,
    status: DocumentStatus,
  ) => DossierDocument[];

  // Task getters
  getTasksByStatus: (dossierId: string, status: TaskStatus) => Task[];
  getOverdueTasks: (dossierId: string) => Task[];
  getTasksByDocument: (dossierId: string, documentId: string) => Task[];

  // Milestone getters
  getUpcomingMilestones: (dossierId: string) => Milestone[];
  getCompletedMilestones: (dossierId: string) => Milestone[];

  // Dossier actions
  createDossier: (data: Partial<Dossier>) => Promise<Dossier>;
  updateDossier: (id: string, data: Partial<Dossier>) => Promise<void>;
  deleteDossier: (id: string) => Promise<void>;
  setCurrentDossier: (id: string | null) => void;
  updateDossierStatus: (id: string, status: DossierStatus) => Promise<void>;

  // Document actions
  addDocument: (
    dossierId: string,
    document: Partial<DossierDocument>,
  ) => Promise<DossierDocument>;
  updateDocument: (
    dossierId: string,
    documentId: string,
    data: Partial<DossierDocument>,
  ) => Promise<void>;
  deleteDocument: (dossierId: string, documentId: string) => Promise<void>;
  updateDocumentStatus: (
    dossierId: string,
    documentId: string,
    status: DocumentStatus,
  ) => Promise<void>;
  updateDocumentContent: (
    dossierId: string,
    documentId: string,
    content: string,
  ) => Promise<void>;

  // Task actions
  addTask: (dossierId: string, task: Partial<Task>) => Promise<Task>;
  updateTask: (
    dossierId: string,
    taskId: string,
    data: Partial<Task>,
  ) => Promise<void>;
  deleteTask: (dossierId: string, taskId: string) => Promise<void>;
  completeTask: (dossierId: string, taskId: string) => Promise<void>;

  // Milestone actions
  addMilestone: (
    dossierId: string,
    milestone: Partial<Milestone>,
  ) => Promise<Milestone>;
  updateMilestone: (
    dossierId: string,
    milestoneId: string,
    data: Partial<Milestone>,
  ) => Promise<void>;
  completeMilestone: (dossierId: string, milestoneId: string) => Promise<void>;

  // Profile actions
  updateProfileSnapshot: (
    dossierId: string,
    profile: Partial<ProfileSnapshot>,
  ) => Promise<void>;

  // Opportunity actions
  updateOpportunityContext: (
    dossierId: string,
    opportunity: Partial<OpportunityContext>,
  ) => Promise<void>;

  // Readiness actions
  evaluateReadiness: (dossierId: string) => Promise<ReadinessEvaluation>;
  updateReadiness: (
    dossierId: string,
    readiness: Partial<ReadinessEvaluation>,
  ) => Promise<void>;

  // Sync actions
  syncFromApi: () => Promise<void>;
  syncDossier: (id: string) => Promise<void>;

  // Utility actions
  clearError: () => void;
  reset: () => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  dossiers: [],
  currentDossierId: null,
  loading: false,
  syncing: false,
  error: null,
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useDossierStore = create<DossierState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========================================================================
      // GETTERS
      // ========================================================================

      getDossierById: (id: string) => {
        return get().dossiers.find((d) => d.id === id);
      },

      getCurrentDossier: () => {
        const { currentDossierId, dossiers } = get();
        if (!currentDossierId) return undefined;
        return dossiers.find((d) => d.id === currentDossierId);
      },

      getDossiersByStatus: (status: DossierStatus) => {
        return get().dossiers.filter((d) => d.status === status);
      },

      getActiveDossiers: () => {
        return get().dossiers.filter(
          (d) => d.status !== "archived" && d.status !== "submitted",
        );
      },

      getUpcomingDeadlines: () => {
        const now = new Date();
        return get()
          .dossiers.filter(
            (d) => d.status !== "archived" && d.status !== "submitted",
          )
          .map((dossier) => ({
            dossier,
            daysUntil: Math.ceil(
              (new Date(dossier.deadline).getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          }))
          .filter((item) => item.daysUntil >= 0)
          .sort((a, b) => a.daysUntil - b.daysUntil);
      },

      getDocumentById: (dossierId: string, documentId: string) => {
        const dossier = get().getDossierById(dossierId);
        return dossier?.documents.find((d) => d.id === documentId);
      },

      getDocumentsByType: (dossierId: string, type: string) => {
        const dossier = get().getDossierById(dossierId);
        return dossier?.documents.filter((d) => d.type === type) || [];
      },

      getDocumentsByStatus: (dossierId: string, status: DocumentStatus) => {
        const dossier = get().getDossierById(dossierId);
        return dossier?.documents.filter((d) => d.status === status) || [];
      },

      getTasksByStatus: (dossierId: string, status: TaskStatus) => {
        const dossier = get().getDossierById(dossierId);
        if (!dossier) return [];

        // Collect tasks from dossier and all documents
        const dossierTasks = dossier.documents.flatMap(
          (doc) => doc.tasks || [],
        );
        return dossierTasks.filter((t) => t.status === status);
      },

      getOverdueTasks: (dossierId: string) => {
        const dossier = get().getDossierById(dossierId);
        if (!dossier) return [];

        const now = new Date();
        const allTasks = dossier.documents.flatMap((doc) => doc.tasks || []);

        return allTasks.filter(
          (t) =>
            t.status !== "done" &&
            t.status !== "cancelled" &&
            t.dueDate &&
            new Date(t.dueDate) < now,
        );
      },

      getTasksByDocument: (dossierId: string, documentId: string) => {
        const document = get().getDocumentById(dossierId, documentId);
        return document?.tasks || [];
      },

      getUpcomingMilestones: (dossierId: string) => {
        const dossier = get().getDossierById(dossierId);
        if (!dossier || !dossier.preparation) return [];

        // Note: Milestones would be in preparation.milestones when we add that field
        return [];
      },

      getCompletedMilestones: (dossierId: string) => {
        const dossier = get().getDossierById(dossierId);
        if (!dossier || !dossier.preparation) return [];

        return [];
      },

      // ========================================================================
      // DOSSIER ACTIONS
      // ========================================================================

      createDossier: async (data: Partial<Dossier>) => {
        set({ loading: true, error: null });

        try {
          const payload: Record<string, unknown> = {
            title: data.title || "New Dossier",
            status: FRONTEND_TO_BACKEND_STATUS[data.status || "draft"],
            deadline: data.deadline
              ? new Date(data.deadline).toISOString()
              : null,
            opportunity_id: data.opportunityId || null,
            opportunity_context: data.opportunity || {},
            profile_snapshot: data.profileSnapshot || {},
          };

          let newDossier: Dossier;
          try {
            const { data: raw } = await dossiersApi.create(payload);
            newDossier = mapBackendDossier(raw as Record<string, unknown>);
          } catch {
            // Offline fallback — generate local ID
            const id = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            newDossier = {
              id,
              userId: "",
              opportunityId: data.opportunityId || "",
              title: data.title || "New Dossier",
              status: data.status || "draft",
              deadline:
                data.deadline ||
                new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
              createdAt: new Date(),
              updatedAt: new Date(),
              profileSnapshot: data.profileSnapshot || ({} as ProfileSnapshot),
              opportunity: data.opportunity || ({} as OpportunityContext),
              documents: [],
              tasks: data.opportunity
                ? generateDefaultTasks({
                    opportunity: data.opportunity,
                    profileSnapshot: data.profileSnapshot || null,
                    dossierId: id,
                    deadline: data.deadline || null,
                  })
                : [],
              preparation: {
                interviews: [],
                events: [],
                skills: [],
                connections: [],
                research: [],
              },
              readiness: {
                overall: 0,
                lastEvaluated: new Date(),
                perDocument: {},
                gaps: [],
                recommendations: [],
                strengths: [],
                risks: [],
              },
              exports: [],
            };
          }

          set((state) => ({
            dossiers: [...state.dossiers, newDossier],
            currentDossierId: newDossier.id,
            loading: false,
          }));

          return newDossier;
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      updateDossier: async (id: string, data: Partial<Dossier>) => {
        set({ loading: true, error: null });

        try {
          // Optimistic local update
          set((state) => ({
            dossiers: state.dossiers.map((d) =>
              d.id === id ? { ...d, ...data, updatedAt: new Date() } : d,
            ),
            loading: false,
          }));

          // Skip backend for local-only IDs
          if (!id.startsWith("local-")) {
            const payload: Record<string, unknown> = {};
            if (data.title !== undefined) payload.title = data.title;
            if (data.status !== undefined)
              payload.status = FRONTEND_TO_BACKEND_STATUS[data.status];
            if (data.deadline !== undefined)
              payload.deadline = data.deadline
                ? new Date(data.deadline).toISOString()
                : null;
            if (data.opportunity !== undefined)
              payload.opportunity_context = data.opportunity;
            if (data.profileSnapshot !== undefined)
              payload.profile_snapshot = data.profileSnapshot;
            await dossiersApi.update(id, payload).catch(() => {
              /* silent — optimistic already applied */
            });
          }
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      deleteDossier: async (id: string) => {
        set({ loading: true, error: null });

        try {
          set((state) => ({
            dossiers: state.dossiers.filter((d) => d.id !== id),
            currentDossierId:
              state.currentDossierId === id ? null : state.currentDossierId,
            loading: false,
          }));

          if (!id.startsWith("local-")) {
            await dossiersApi.delete(id).catch(() => {
              /* silent */
            });
          }
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      setCurrentDossier: (id: string | null) => {
        set({ currentDossierId: id });
      },

      updateDossierStatus: async (id: string, status: DossierStatus) => {
        await get().updateDossier(id, { status });
      },

      // ========================================================================
      // DOCUMENT ACTIONS
      // ========================================================================

      addDocument: async (
        dossierId: string,
        documentData: Partial<DossierDocument>,
      ) => {
        set({ loading: true, error: null });

        try {
          const documentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          const newDocument: DossierDocument = {
            id: documentId,
            dossierId,
            type: documentData.type || "other",
            title: documentData.title || "Untitled Document",
            content: documentData.content || "",
            wordCount: 0,
            status: documentData.status || "not_started",
            completionPercentage: 0,
            metrics: documentData.metrics || {},
            requiredFor: documentData.requiredFor || [],
            blockedBy: documentData.blockedBy || [],
            versions: [],
            currentVersionId: "",
            tasks: documentData.tasks || [],
            createdAt: new Date(),
            updatedAt: new Date(),
            lastEditedAt: new Date(),
          };

          set((state) => ({
            dossiers: state.dossiers.map((d) =>
              d.id === dossierId
                ? {
                    ...d,
                    documents: [...d.documents, newDocument],
                    updatedAt: new Date(),
                  }
                : d,
            ),
            loading: false,
          }));

          return newDocument;
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      updateDocument: async (
        dossierId: string,
        documentId: string,
        data: Partial<DossierDocument>,
      ) => {
        set((state) => ({
          dossiers: state.dossiers.map((d) =>
            d.id === dossierId
              ? {
                  ...d,
                  documents: d.documents.map((doc) =>
                    doc.id === documentId
                      ? { ...doc, ...data, updatedAt: new Date() }
                      : doc,
                  ),
                  updatedAt: new Date(),
                }
              : d,
          ),
        }));
      },

      deleteDocument: async (dossierId: string, documentId: string) => {
        set((state) => ({
          dossiers: state.dossiers.map((d) =>
            d.id === dossierId
              ? {
                  ...d,
                  documents: d.documents.filter((doc) => doc.id !== documentId),
                  updatedAt: new Date(),
                }
              : d,
          ),
        }));
      },

      updateDocumentStatus: async (
        dossierId: string,
        documentId: string,
        status: DocumentStatus,
      ) => {
        await get().updateDocument(dossierId, documentId, { status });
      },

      updateDocumentContent: async (
        dossierId: string,
        documentId: string,
        content: string,
      ) => {
        const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
        await get().updateDocument(dossierId, documentId, {
          content,
          wordCount,
          lastEditedAt: new Date(),
        });
      },

      // ========================================================================
      // TASK ACTIONS
      // ========================================================================

      addTask: async (dossierId: string, taskData: Partial<Task>) => {
        const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const newTask: Task = {
          id: taskId,
          dossierId,
          title: taskData.title || "New Task",
          description: taskData.description,
          type: taskData.type || "other",
          category: taskData.category || "other",
          status: taskData.status || "todo",
          priority: taskData.priority || "medium",
          createdAt: new Date(),
          dueDate: taskData.dueDate,
          relatedDocumentId: taskData.relatedDocumentId,
          relatedMilestoneId: taskData.relatedMilestoneId,
        };

        // Add task to document if relatedDocumentId is provided
        if (taskData.relatedDocumentId) {
          set((state) => ({
            dossiers: state.dossiers.map((d) =>
              d.id === dossierId
                ? {
                    ...d,
                    documents: d.documents.map((doc) =>
                      doc.id === taskData.relatedDocumentId
                        ? { ...doc, tasks: [...(doc.tasks || []), newTask] }
                        : doc,
                    ),
                  }
                : d,
            ),
          }));
        }

        return newTask;
      },

      updateTask: async (
        dossierId: string,
        taskId: string,
        data: Partial<Task>,
      ) => {
        set((state) => ({
          dossiers: state.dossiers.map((d) =>
            d.id === dossierId
              ? {
                  ...d,
                  documents: d.documents.map((doc) => ({
                    ...doc,
                    tasks: (doc.tasks || []).map((task) =>
                      task.id === taskId ? { ...task, ...data } : task,
                    ),
                  })),
                }
              : d,
          ),
        }));
      },

      deleteTask: async (dossierId: string, taskId: string) => {
        set((state) => ({
          dossiers: state.dossiers.map((d) =>
            d.id === dossierId
              ? {
                  ...d,
                  documents: d.documents.map((doc) => ({
                    ...doc,
                    tasks: (doc.tasks || []).filter(
                      (task) => task.id !== taskId,
                    ),
                  })),
                }
              : d,
          ),
        }));
      },

      completeTask: async (dossierId: string, taskId: string) => {
        await get().updateTask(dossierId, taskId, {
          status: "done",
          completedAt: new Date(),
        });
      },

      // ========================================================================
      // MILESTONE ACTIONS
      // ========================================================================

      addMilestone: async (
        dossierId: string,
        milestoneData: Partial<Milestone>,
      ) => {
        // TODO: Implement when we add milestones to dossier structure
        return {} as Milestone;
      },

      updateMilestone: async (
        dossierId: string,
        milestoneId: string,
        data: Partial<Milestone>,
      ) => {
        // TODO: Implement
      },

      completeMilestone: async (dossierId: string, milestoneId: string) => {
        // TODO: Implement
      },

      // ========================================================================
      // PROFILE & OPPORTUNITY ACTIONS
      // ========================================================================

      updateProfileSnapshot: async (
        dossierId: string,
        profile: Partial<ProfileSnapshot>,
      ) => {
        await get().updateDossier(dossierId, {
          profileSnapshot: {
            ...get().getDossierById(dossierId)?.profileSnapshot,
            ...profile,
          } as ProfileSnapshot,
        });
      },

      updateOpportunityContext: async (
        dossierId: string,
        opportunity: Partial<OpportunityContext>,
      ) => {
        await get().updateDossier(dossierId, {
          opportunity: {
            ...get().getDossierById(dossierId)?.opportunity,
            ...opportunity,
          } as OpportunityContext,
        });
      },

      // ========================================================================
      // READINESS ACTIONS
      // ========================================================================

      evaluateReadiness: async (dossierId: string) => {
        const dossier = get().getDossierById(dossierId);
        if (!dossier) throw new Error("Dossier not found");

        const docs = dossier.documents || [];
        const allTasks: Task[] = [
          ...(docs.flatMap((d) => d.tasks || []) as Task[]),
          ...(dossier.tasks || []),
        ];

        // Single source of truth: unified 40/30/20/10 algorithm.
        const breakdown = computeReadiness({
          documents: docs.map((d) => ({
            status: d.status,
            completionPercentage: d.completionPercentage,
            metrics: {
              atsScore: d.metrics?.atsScore,
              competitivenessScore: d.metrics?.competitivenessScore,
              alignmentScore: d.metrics?.alignmentScore,
            },
          })),
          tasks: allTasks.map((t) => ({ status: t.status })),
          profileScores: dossier.profileSnapshot?.readinessScores ?? null,
          deadline: dossier.deadline ?? null,
          dossierStatus: dossier.status,
        });

        const readiness: ReadinessEvaluation = {
          overall: breakdown.overall,
          lastEvaluated: new Date(breakdown.computedAt),
          breakdown,
          perDocument: {},
          gaps: [],
          recommendations: [],
          strengths: [],
          risks: [],
        };

        docs.forEach((doc) => {
          readiness.perDocument[doc.id] = {
            documentId: doc.id,
            score:
              doc.status === "final" || doc.status === "submitted"
                ? 100
                : doc.completionPercentage || 0,
            status: doc.status,
            completeness: doc.completionPercentage || 0,
            quality: doc.metrics?.competitivenessScore || 0,
            alignment: doc.metrics?.alignmentScore || 0,
            blockers: doc.blockedBy || [],
            nextSteps: [],
          };
        });

        await get().updateReadiness(dossierId, readiness);
        return readiness;
      },

      updateReadiness: async (
        dossierId: string,
        readiness: Partial<ReadinessEvaluation>,
      ) => {
        await get().updateDossier(dossierId, {
          readiness: {
            ...get().getDossierById(dossierId)?.readiness,
            ...readiness,
          } as ReadinessEvaluation,
        });
      },

      // ========================================================================
      // SYNC ACTIONS
      // ========================================================================

      syncFromApi: async () => {
        set({ syncing: true, error: null });

        try {
          const { data } = await dossiersApi.list({ limit: 50 });
          const items = Array.isArray(data) ? data : [];
          const mapped = items.map((raw) =>
            mapBackendDossier(raw as Record<string, unknown>),
          );

          // Merge: keep local-only drafts, replace the rest from server
          set((state) => {
            const localOnly = state.dossiers.filter((d) =>
              d.id.startsWith("local-"),
            );
            return { dossiers: [...mapped, ...localOnly], syncing: false };
          });
        } catch {
          // Offline — keep existing local state, don't throw
          set({ syncing: false });
        }
      },

      syncDossier: async (id: string) => {
        if (id.startsWith("local-")) return;
        try {
          const { data } = await dossiersApi.get(id);
          const updated = mapBackendDossier(data as Record<string, unknown>);
          set((state) => {
            const existingIndex = state.dossiers.findIndex((d) => d.id === id);

            if (existingIndex === -1) {
              return { dossiers: [...state.dossiers, updated] };
            }

            return {
              dossiers: state.dossiers.map((d) => (d.id === id ? updated : d)),
            };
          });
        } catch {
          // silent
        }
      },

      // ========================================================================
      // UTILITY ACTIONS
      // ========================================================================

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "dossier-storage",
      partialize: (state) => ({
        dossiers: state.dossiers,
        currentDossierId: state.currentDossierId,
      }),
    },
  ),
);
