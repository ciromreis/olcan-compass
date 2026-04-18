/**
 * Route Builder Store
 * Manages route creation, configuration, and progress
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type RouteCategory = 'employment' | 'entrepreneurship' | 'education' | 'immigration' | 'investment';

export interface RouteConfig {
  category: RouteCategory;
  target_outcome: string;
  target_location?: string;
  timeline_months: number;
  budget_range?: string;
  risk_tolerance?: 'low' | 'medium' | 'high';
  preferences?: Record<string, unknown>;
}

export interface Milestone {
  id: string;
  route_id: string;
  title: string;
  description: string;
  order_index: number;
  estimated_duration_days: number;
  is_completed: boolean;
  completed_at?: string;
  tasks: Task[];
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  milestone_id: string;
  title: string;
  description: string;
  order_index: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: string;
  user_id: string;
  category: string;
  target_outcome: string;
  target_location?: string;
  timeline_months: number;
  budget_range?: string;
  risk_tolerance?: string;
  preferences?: Record<string, unknown>;
  status: 'draft' | 'active' | 'completed' | 'archived';
  progress_percentage: number;
  milestones: Milestone[];
  created_at: string;
  updated_at: string;
}

interface RouteBuilderState {
  // Data
  routes: Route[];
  currentRoute: Route | null;
  draftConfig: RouteConfig | null;
  
  // UI State
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  
  // Actions - Routes
  fetchRoutes: () => Promise<void>;
  fetchRoute: (routeId: string) => Promise<void>;
  createRoute: (config: RouteConfig) => Promise<Route | null>;
  updateRoute: (routeId: string, updates: Partial<RouteConfig>) => Promise<void>;
  deleteRoute: (routeId: string) => Promise<void>;
  activateRoute: (routeId: string) => Promise<void>;
  
  // Actions - Milestones
  fetchMilestones: (routeId: string) => Promise<void>;
  completeMilestone: (milestoneId: string) => Promise<void>;
  
  // Actions - Tasks
  completeTask: (taskId: string) => Promise<void>;
  
  // Draft Management
  setDraftConfig: (config: Partial<RouteConfig>) => void;
  clearDraftConfig: () => void;
}

export const useRouteBuilderStore = create<RouteBuilderState>()(
  devtools(
    persist(
      (set, _get) => ({
        // Initial State
        routes: [],
        currentRoute: null,
        draftConfig: null,
        isLoading: false,
        isCreating: false,
        error: null,

        // Fetch all routes
        fetchRoutes: async () => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await fetch('/api/routes/builder', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });
            
            if (!response.ok) {
              throw new Error('Failed to fetch routes');
            }
            
            const data = await response.json();
            set({ routes: data, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Unknown error',
              isLoading: false 
            });
          }
        },

        // Fetch single route
        fetchRoute: async (routeId: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await fetch(`/api/routes/builder/${routeId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });
            
            if (!response.ok) {
              throw new Error('Failed to fetch route');
            }
            
            const data = await response.json();
            set({ currentRoute: data, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Unknown error',
              isLoading: false 
            });
          }
        },

        // Create new route
        createRoute: async (config: RouteConfig) => {
          set({ isCreating: true, error: null });
          
          try {
            const response = await fetch('/api/routes/builder', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify(config),
            });
            
            if (!response.ok) {
              throw new Error('Failed to create route');
            }
            
            const route = await response.json();
            
            set((state) => ({
              routes: [...state.routes, route],
              currentRoute: route,
              draftConfig: null,
              isCreating: false,
            }));
            
            return route;
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Unknown error',
              isCreating: false 
            });
            return null;
          }
        },

        // Update route
        updateRoute: async (routeId: string, updates: Partial<RouteConfig>) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await fetch(`/api/routes/builder/${routeId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify(updates),
            });
            
            if (!response.ok) {
              throw new Error('Failed to update route');
            }
            
            const updatedRoute = await response.json();
            
            set((state) => ({
              routes: state.routes.map((r) => r.id === routeId ? updatedRoute : r),
              currentRoute: state.currentRoute?.id === routeId ? updatedRoute : state.currentRoute,
              isLoading: false,
            }));
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Unknown error',
              isLoading: false 
            });
          }
        },

        // Delete route
        deleteRoute: async (routeId: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await fetch(`/api/routes/builder/${routeId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });
            
            if (!response.ok) {
              throw new Error('Failed to delete route');
            }
            
            set((state) => ({
              routes: state.routes.filter((r) => r.id !== routeId),
              currentRoute: state.currentRoute?.id === routeId ? null : state.currentRoute,
              isLoading: false,
            }));
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Unknown error',
              isLoading: false 
            });
          }
        },

        // Activate route
        activateRoute: async (routeId: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await fetch(`/api/routes/builder/${routeId}/activate`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });
            
            if (!response.ok) {
              throw new Error('Failed to activate route');
            }
            
            const updatedRoute = await response.json();
            
            set((state) => ({
              routes: state.routes.map((r) => r.id === routeId ? updatedRoute : r),
              currentRoute: state.currentRoute?.id === routeId ? updatedRoute : state.currentRoute,
              isLoading: false,
            }));
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Unknown error',
              isLoading: false 
            });
          }
        },

        // Fetch milestones
        fetchMilestones: async (routeId: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await fetch(`/api/routes/builder/${routeId}/milestones`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });
            
            if (!response.ok) {
              throw new Error('Failed to fetch milestones');
            }
            
            const milestones = await response.json();
            
            set((state) => ({
              currentRoute: state.currentRoute ? {
                ...state.currentRoute,
                milestones,
              } : null,
              isLoading: false,
            }));
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Unknown error',
              isLoading: false 
            });
          }
        },

        // Complete milestone
        completeMilestone: async (milestoneId: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await fetch(`/api/routes/builder/milestones/${milestoneId}/complete`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });
            
            if (!response.ok) {
              throw new Error('Failed to complete milestone');
            }
            
            const updatedMilestone = await response.json();
            
            set((state) => ({
              currentRoute: state.currentRoute ? {
                ...state.currentRoute,
                milestones: state.currentRoute.milestones.map((m) =>
                  m.id === milestoneId ? updatedMilestone : m
                ),
              } : null,
              isLoading: false,
            }));
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Unknown error',
              isLoading: false 
            });
          }
        },

        // Complete task
        completeTask: async (taskId: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await fetch(`/api/routes/builder/tasks/${taskId}/complete`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });
            
            if (!response.ok) {
              throw new Error('Failed to complete task');
            }
            
            const updatedTask = await response.json();
            
            set((state) => ({
              currentRoute: state.currentRoute ? {
                ...state.currentRoute,
                milestones: state.currentRoute.milestones.map((m) => ({
                  ...m,
                  tasks: m.tasks.map((t) => t.id === taskId ? updatedTask : t),
                })),
              } : null,
              isLoading: false,
            }));
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Unknown error',
              isLoading: false 
            });
          }
        },

        // Set draft config
        setDraftConfig: (config: Partial<RouteConfig>) => {
          set((state) => ({
            draftConfig: { ...state.draftConfig, ...config } as RouteConfig,
          }));
        },

        // Clear draft config
        clearDraftConfig: () => {
          set({ draftConfig: null });
        },
      }),
      {
        name: 'route-builder-store',
        partialize: (state) => ({
          draftConfig: state.draftConfig,
        }),
      }
    ),
    { name: 'RouteBuilderStore' }
  )
);

// Selectors
export const selectRoutes = (state: RouteBuilderState) => state.routes;
export const selectCurrentRoute = (state: RouteBuilderState) => state.currentRoute;
export const selectDraftConfig = (state: RouteBuilderState) => state.draftConfig;
export const selectIsLoading = (state: RouteBuilderState) => state.isLoading;
export const selectIsCreating = (state: RouteBuilderState) => state.isCreating;
export const selectError = (state: RouteBuilderState) => state.error;
