import { create } from 'zustand';

export interface NarrativeVersion {
  id: string;
  narrative_id: string;
  content: string;
  version_number: number;
  created_at: string;
}

export interface NarrativeAnalysis {
  id: string;
  narrative_id: string;
  version_id: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  score?: number;
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
  setContent: (content: string) => void;
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
