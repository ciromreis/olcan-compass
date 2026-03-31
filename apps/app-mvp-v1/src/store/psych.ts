import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PsychProfile {
  id: string;
  user_id: string;
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  anxiety_score?: number;
  agency_score?: number;
  last_assessment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface PsychScoreHistory {
  date: string;
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface PsychState {
  profile: PsychProfile | null;
  scoreHistory: PsychScoreHistory[];
  recommendedMode: 'map' | 'forge' | null;
  isLoading: boolean;
  setProfile: (profile: PsychProfile | null) => void;
  setScoreHistory: (history: PsychScoreHistory[]) => void;
  setRecommendedMode: (mode: 'map' | 'forge' | null) => void;
  setLoading: (value: boolean) => void;
  clear: () => void;
}

export const usePsychStore = create<PsychState>()(
  persist(
    (set) => ({
      profile: null,
      scoreHistory: [],
      recommendedMode: null,
      isLoading: false,
      setProfile: (profile) => set({ profile }),
      setScoreHistory: (history) => set({ scoreHistory: history }),
      setRecommendedMode: (mode) => set({ recommendedMode: mode }),
      setLoading: (value) => set({ isLoading: value }),
      clear: () =>
        set({
          profile: null,
          scoreHistory: [],
          recommendedMode: null,
          isLoading: false,
        }),
    }),
    {
      name: 'psych-storage',
    }
  )
);
