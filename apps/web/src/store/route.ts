import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RouteMilestone {
  id: string;
  route_id: string;
  title: string;
  description?: string;
  target_date?: string;
  completed: boolean;
  completed_at?: string;
  order_index: number;
  dependencies?: string[];
}

export interface Route {
  id: string;
  user_id: string;
  template_id?: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'paused';
  progress_percentage: number;
  milestones: RouteMilestone[];
  created_at: string;
  updated_at: string;
}

interface RouteState {
  currentRoute: Route | null;
  activeMilestone: RouteMilestone | null;
  routes: Route[];
  isLoading: boolean;
  setCurrentRoute: (route: Route | null) => void;
  setActiveMilestone: (milestone: RouteMilestone | null) => void;
  setRoutes: (routes: Route[]) => void;
  updateMilestone: (milestoneId: string, updates: Partial<RouteMilestone>) => void;
  setLoading: (value: boolean) => void;
  clear: () => void;
}

export const useRouteStore = create<RouteState>()(
  persist(
    (set) => ({
      currentRoute: null,
      activeMilestone: null,
      routes: [],
      isLoading: false,
      setCurrentRoute: (route) => set({ currentRoute: route }),
      setActiveMilestone: (milestone) => set({ activeMilestone: milestone }),
      setRoutes: (routes) => set({ routes }),
      updateMilestone: (milestoneId, updates) =>
        set((state) => {
          if (!state.currentRoute) return state;

          const updatedMilestones = state.currentRoute.milestones.map((m) =>
            m.id === milestoneId ? { ...m, ...updates } : m
          );

          return {
            currentRoute: {
              ...state.currentRoute,
              milestones: updatedMilestones,
            },
          };
        }),
      setLoading: (value) => set({ isLoading: value }),
      clear: () =>
        set({
          currentRoute: null,
          activeMilestone: null,
          routes: [],
          isLoading: false,
        }),
    }),
    {
      name: 'route-storage',
    }
  )
);
