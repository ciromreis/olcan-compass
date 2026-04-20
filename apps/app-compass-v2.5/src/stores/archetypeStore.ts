/**
 * Archetype Store
 * Manages archetype selection, comparison, and recommendations
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { api } from '@/lib/api';

export interface Archetype {
  archetype: string;
  name: string;
  description: string;
  primary_motivator: string;
  primary_fear: string;
  evolution_path: string;
  route_preferences: string[];
  route_weights: Record<string, number>;
  narrative_voice: {
    tone: string;
    focus: string;
    keywords: string[];
    avoid: string[];
  };
  companion_traits: {
    personality: string;
    communication_style: string;
    visual_theme: string;
    encouragement_type: string;
  };
  interview_focus_areas: string[];
  service_preferences: Record<string, number>;
  typical_risk_tolerance: string;
  decision_speed: string;
  content_themes: string[];
  success_metrics: string[];
}

export interface ArchetypeRecommendation {
  recommended_archetype: string;
  confidence_score: number;
  reasoning: string;
  alternative_archetypes?: string[];
}

export interface ArchetypeComparison {
  archetype1: Archetype;
  archetype2: Archetype;
  similarities: string[];
  differences: string[];
}

interface ArchetypeState {
  // Data
  archetypes: Archetype[];
  selectedArchetype: Archetype | null;
  comparisonArchetypes: [Archetype | null, Archetype | null];
  recommendation: ArchetypeRecommendation | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  currentLanguage: 'en' | 'pt' | 'es';
  
  // Actions
  fetchArchetypes: () => Promise<void>;
  fetchArchetypeDetails: (archetype: string, language?: string) => Promise<void>;
  selectArchetype: (archetype: Archetype) => void;
  clearSelection: () => void;
  
  // Comparison
  setComparisonArchetype: (index: 0 | 1, archetype: Archetype | null) => void;
  compareArchetypes: (archetype1: string, archetype2: string) => Promise<ArchetypeComparison | null>;
  clearComparison: () => void;
  
  // Recommendation
  getRecommendation: () => Promise<void>;

  // Language
  setLanguage: (language: 'en' | 'pt' | 'es') => void;

  // Session reset
  reset: () => void;
}

export const useArchetypeStore = create<ArchetypeState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        archetypes: [],
        selectedArchetype: null,
        comparisonArchetypes: [null, null],
        recommendation: null,
        isLoading: false,
        error: null,
        currentLanguage: 'en',

        // Fetch all archetypes
        fetchArchetypes: async () => {
          set({ isLoading: true, error: null });
          
          try {
            const { data } = await api.get<Archetype[]>('/psych/archetypes');
            set({ archetypes: data, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Unknown error',
              isLoading: false 
            });
          }
        },

        // Fetch detailed archetype information
        fetchArchetypeDetails: async (archetype: string, language?: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const lang = language || get().currentLanguage;
            const { data } = await api.get<Archetype>(`/psych/archetypes/${archetype}`, { params: { language: lang } });
            set({ selectedArchetype: data, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Unknown error',
              isLoading: false 
            });
          }
        },

        // Select an archetype
        selectArchetype: (archetype: Archetype) => {
          set({ selectedArchetype: archetype });
        },

        // Clear selection
        clearSelection: () => {
          set({ selectedArchetype: null });
        },

        // Set archetype for comparison
        setComparisonArchetype: (index: 0 | 1, archetype: Archetype | null) => {
          set((state) => {
            const newComparison: [Archetype | null, Archetype | null] = [...state.comparisonArchetypes];
            newComparison[index] = archetype;
            return { comparisonArchetypes: newComparison };
          });
        },

        // Compare two archetypes
        compareArchetypes: async (archetype1: string, archetype2: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const { data } = await api.get<ArchetypeComparison>(`/psych/archetypes/compare/${archetype1}/${archetype2}`);
            set({ isLoading: false });
            return data;
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Unknown error',
              isLoading: false 
            });
            return null;
          }
        },

        // Clear comparison
        clearComparison: () => {
          set({ comparisonArchetypes: [null, null] });
        },

        // Get archetype recommendation
        getRecommendation: async () => {
          set({ isLoading: true, error: null });
          
          try {
            const { data } = await api.get<ArchetypeRecommendation>('/psych/archetypes/recommend/for-user');
            set({ recommendation: data, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Unknown error',
              isLoading: false 
            });
          }
        },

        // Set language
        setLanguage: (language: 'en' | 'pt' | 'es') => {
          set({ currentLanguage: language });
        },

        reset: () => {
          set({ selectedArchetype: null, recommendation: null, currentLanguage: 'en' });
        },
      }),
      {
        name: 'archetype-store',
        partialize: (state) => ({
          selectedArchetype: state.selectedArchetype,
          currentLanguage: state.currentLanguage,
        }),
      }
    ),
    { name: 'ArchetypeStore' }
  )
);

// Selectors
export const selectArchetypes = (state: ArchetypeState) => state.archetypes;
export const selectSelectedArchetype = (state: ArchetypeState) => state.selectedArchetype;
export const selectIsLoading = (state: ArchetypeState) => state.isLoading;
export const selectError = (state: ArchetypeState) => state.error;
export const selectRecommendation = (state: ArchetypeState) => state.recommendation;
export const selectComparisonArchetypes = (state: ArchetypeState) => state.comparisonArchetypes;
