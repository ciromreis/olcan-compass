import { create } from 'zustand';

export interface NarrativeVersion {
  id: string;
  narrative_id: string;
  version_number: number;
  content: string;
  content_plain?: string | null;
  word_count: number;
  change_summary?: string | null;
  clarity_score?: number | null;
  coherence_score?: number | null;
  authenticity_score?: number | null;
  overall_score?: number | null;
  created_at: string;
}

export interface NarrativeAnalysis {
  id: string;
  narrative_id: string;
  version_id?: string | null;
  clarity_score: number;
  coherence_score: number;
  alignment_score: number;
  authenticity_score: number;
  overall_score: number;
  cliche_density_score: number;
  authenticity_risk: string;
  key_strengths: string[];
  improvement_actions: string[];
  suggested_edits: Array<Record<string, unknown>>;
  ai_model?: string | null;
  prompt_version?: string | null;
  token_usage?: number | null;
  created_at: string;
}

interface EditorState {
  narrativeId: string | null;
  content: string;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  currentVersion: NarrativeVersion | null;
  versions: NarrativeVersion[];
  analysis: NarrativeAnalysis | null;
  wordCount: number;
  characterCount: number;
  setNarrativeId: (id: string | null) => void;
  hydrateFromServer: (payload: {
    narrativeId: string;
    content: string;
    currentVersion?: NarrativeVersion | null;
    versions?: NarrativeVersion[];
    analysis?: NarrativeAnalysis | null;
  }) => void;
  setContent: (content: string) => void; // user edit
  setDirty: (value: boolean) => void;
  setSaving: (value: boolean) => void;
  setLastSaved: (date: Date | null) => void;
  setCurrentVersion: (version: NarrativeVersion | null) => void;
  setVersions: (versions: NarrativeVersion[]) => void;
  setAnalysis: (analysis: NarrativeAnalysis | null) => void;
  updateCounts: (content: string) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  narrativeId: null,
  content: '',
  isDirty: false,
  isSaving: false,
  lastSaved: null,
  currentVersion: null,
  versions: [],
  analysis: null,
  wordCount: 0,
  characterCount: 0,
  setNarrativeId: (id) => set({ narrativeId: id }),
  hydrateFromServer: ({ narrativeId, content, currentVersion, versions, analysis }) =>
    set(() => {
      const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
      const characterCount = content.length;
      return {
        narrativeId,
        content,
        isDirty: false,
        isSaving: false,
        currentVersion: currentVersion ?? null,
        versions: versions ?? [],
        analysis: analysis ?? null,
        lastSaved: currentVersion?.created_at ? new Date(currentVersion.created_at) : null,
        wordCount,
        characterCount,
      };
    }),
  setContent: (content) =>
    set(() => {
      const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
      const characterCount = content.length;
      return {
        content,
        isDirty: true,
        wordCount,
        characterCount,
      };
    }),
  setDirty: (value) => set({ isDirty: value }),
  setSaving: (value) => set({ isSaving: value }),
  setLastSaved: (date) => set({ lastSaved: date }),
  setCurrentVersion: (version) => set({ currentVersion: version }),
  setVersions: (versions) => set({ versions }),
  setAnalysis: (analysis) => set({ analysis }),
  updateCounts: (content) => {
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const characterCount = content.length;
    set({ wordCount, characterCount });
  },
  reset: () =>
    set({
      narrativeId: null,
      content: '',
      isDirty: false,
      isSaving: false,
      lastSaved: null,
      currentVersion: null,
      versions: [],
      analysis: null,
      wordCount: 0,
      characterCount: 0,
    }),
}));
