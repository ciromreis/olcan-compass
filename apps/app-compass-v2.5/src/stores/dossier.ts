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
} from "@/types/dossier-system";

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
  getDocumentById: (dossierId: string, documentId: string) => DossierDocument | undefined;
  getDocumentsByType: (dossierId: string, type: string) => DossierDocument[];
  getDocumentsByStatus: (dossierId: string, status: DocumentStatus) => DossierDocument[];
  
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
  addDocument: (dossierId: string, document: Partial<DossierDocument>) => Promise<DossierDocument>;
  updateDocument: (dossierId: string, documentId: string, data: Partial<DossierDocument>) => Promise<void>;
  deleteDocument: (dossierId: string, documentId: string) => Promise<void>;
  updateDocumentStatus: (dossierId: string, documentId: string, status: DocumentStatus) => Promise<void>;
  updateDocumentContent: (dossierId: string, documentId: string, content: string) => Promise<void>;
  
  // Task actions
  addTask: (dossierId: string, task: Partial<Task>) => Promise<Task>;
  updateTask: (dossierId: string, taskId: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (dossierId: string, taskId: string) => Promise<void>;
  completeTask: (dossierId: string, taskId: string) => Promise<void>;
  
  // Milestone actions
  addMilestone: (dossierId: string, milestone: Partial<Milestone>) => Promise<Milestone>;
  updateMilestone: (dossierId: string, milestoneId: string, data: Partial<Milestone>) => Promise<void>;
  completeMilestone: (dossierId: string, milestoneId: string) => Promise<void>;
  
  // Profile actions
  updateProfileSnapshot: (dossierId: string, profile: Partial<ProfileSnapshot>) => Promise<void>;
  
  // Opportunity actions
  updateOpportunityContext: (dossierId: string, opportunity: Partial<OpportunityContext>) => Promise<void>;
  
  // Readiness actions
  evaluateReadiness: (dossierId: string) => Promise<ReadinessEvaluation>;
  updateReadiness: (dossierId: string, readiness: Partial<ReadinessEvaluation>) => Promise<void>;
  
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
          (d) => d.status !== "archived" && d.status !== "submitted"
        );
      },

      getUpcomingDeadlines: () => {
        const now = new Date();
        return get()
          .dossiers.filter((d) => d.status !== "archived" && d.status !== "submitted")
          .map((dossier) => ({
            dossier,
            daysUntil: Math.ceil(
              (new Date(dossier.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
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
        const dossierTasks = dossier.documents.flatMap((doc) => doc.tasks || []);
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
            new Date(t.dueDate) < now
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
          // Generate ID
          const id = `dossier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          const newDossier: Dossier = {
            id,
            userId: data.userId || "",
            opportunityId: data.opportunityId || "",
            title: data.title || "New Dossier",
            status: data.status || "draft",
            deadline: data.deadline || new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            profileSnapshot: data.profileSnapshot || {} as ProfileSnapshot,
            opportunity: data.opportunity || {} as OpportunityContext,
            documents: data.documents || [],
            preparation: data.preparation || {
              interviews: [],
              events: [],
              skills: [],
              connections: [],
              research: [],
            },
            readiness: data.readiness || {
              overall: 0,
              lastEvaluated: new Date(),
              perDocument: {},
              gaps: [],
              recommendations: [],
              strengths: [],
              risks: [],
            },
            exports: data.exports || [],
          };

          set((state) => ({
            dossiers: [...state.dossiers, newDossier],
            currentDossierId: id,
            loading: false,
          }));

          // TODO: Sync to backend
          // await dossierApi.create(newDossier);

          return newDossier;
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      updateDossier: async (id: string, data: Partial<Dossier>) => {
        set({ loading: true, error: null });

        try {
          set((state) => ({
            dossiers: state.dossiers.map((d) =>
              d.id === id
                ? { ...d, ...data, updatedAt: new Date() }
                : d
            ),
            loading: false,
          }));

          // TODO: Sync to backend
          // await dossierApi.update(id, data);
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
            currentDossierId: state.currentDossierId === id ? null : state.currentDossierId,
            loading: false,
          }));

          // TODO: Sync to backend
          // await dossierApi.delete(id);
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

      addDocument: async (dossierId: string, documentData: Partial<DossierDocument>) => {
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
                : d
            ),
            loading: false,
          }));

          return newDocument;
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      updateDocument: async (dossierId: string, documentId: string, data: Partial<DossierDocument>) => {
        set((state) => ({
          dossiers: state.dossiers.map((d) =>
            d.id === dossierId
              ? {
                  ...d,
                  documents: d.documents.map((doc) =>
                    doc.id === documentId
                      ? { ...doc, ...data, updatedAt: new Date() }
                      : doc
                  ),
                  updatedAt: new Date(),
                }
              : d
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
              : d
          ),
        }));
      },

      updateDocumentStatus: async (dossierId: string, documentId: string, status: DocumentStatus) => {
        await get().updateDocument(dossierId, documentId, { status });
      },

      updateDocumentContent: async (dossierId: string, documentId: string, content: string) => {
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
                        : doc
                    ),
                  }
                : d
            ),
          }));
        }

        return newTask;
      },

      updateTask: async (dossierId: string, taskId: string, data: Partial<Task>) => {
        set((state) => ({
          dossiers: state.dossiers.map((d) =>
            d.id === dossierId
              ? {
                  ...d,
                  documents: d.documents.map((doc) => ({
                    ...doc,
                    tasks: (doc.tasks || []).map((task) =>
                      task.id === taskId ? { ...task, ...data } : task
                    ),
                  })),
                }
              : d
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
                    tasks: (doc.tasks || []).filter((task) => task.id !== taskId),
                  })),
                }
              : d
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

      addMilestone: async (dossierId: string, milestoneData: Partial<Milestone>) => {
        // TODO: Implement when we add milestones to dossier structure
        return {} as Milestone;
      },

      updateMilestone: async (dossierId: string, milestoneId: string, data: Partial<Milestone>) => {
        // TODO: Implement
      },

      completeMilestone: async (dossierId: string, milestoneId: string) => {
        // TODO: Implement
      },

      // ========================================================================
      // PROFILE & OPPORTUNITY ACTIONS
      // ========================================================================

      updateProfileSnapshot: async (dossierId: string, profile: Partial<ProfileSnapshot>) => {
        await get().updateDossier(dossierId, {
          profileSnapshot: {
            ...get().getDossierById(dossierId)?.profileSnapshot,
            ...profile,
          } as ProfileSnapshot,
        });
      },

      updateOpportunityContext: async (dossierId: string, opportunity: Partial<OpportunityContext>) => {
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
        // TODO: Implement comprehensive readiness evaluation
        const dossier = get().getDossierById(dossierId);
        if (!dossier) throw new Error("Dossier not found");

        const readiness: ReadinessEvaluation = {
          overall: 0,
          lastEvaluated: new Date(),
          perDocument: {},
          gaps: [],
          recommendations: [],
          strengths: [],
          risks: [],
        };

        await get().updateReadiness(dossierId, readiness);
        return readiness;
      },

      updateReadiness: async (dossierId: string, readiness: Partial<ReadinessEvaluation>) => {
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
          // TODO: Fetch from backend
          // const { data } = await dossierApi.getAll();
          // set({ dossiers: data, syncing: false });
          
          set({ syncing: false });
        } catch (error) {
          set({ error: (error as Error).message, syncing: false });
          throw error;
        }
      },

      syncDossier: async (id: string) => {
        // TODO: Sync specific dossier
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
    }
  )
);
