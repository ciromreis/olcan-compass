import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ConstraintProfile {
  id: string;
  user_id: string;
  budget_max: number | null;
  time_available_months: number | null;
  weekly_bandwidth_hours: number | null;
  languages: string[];
  target_countries: string[];
  excluded_countries: string[];
  citizenship_countries: string[];
  commitment_level: 'low' | 'medium' | 'high';
  risk_tolerance: 'low' | 'medium' | 'high';
  is_active: boolean;
  last_updated_at: string;
  created_at: string;
  updated_at: string;
}

interface ConstraintsState {
  profile: ConstraintProfile | null;
  isLoading: boolean;
  error: Error | null;
  setProfile: (profile: ConstraintProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

export const useConstraintsStore = create<ConstraintsState>()(
  persist(
    (set) => ({
      profile: null,
      isLoading: false,
      error: null,
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      reset: () => set({ profile: null, isLoading: false, error: null }),
    }),
    {
      name: 'constraints-storage',
    }
  )
);
