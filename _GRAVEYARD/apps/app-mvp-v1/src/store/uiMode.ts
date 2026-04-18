import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UIMode = 'map' | 'forge';

interface UIModeState {
  mode: UIMode;
  isTransitioning: boolean;
  userPreference: UIMode | null;
  scrollPosition: { [key: string]: number };
  setMode: (mode: UIMode) => void;
  setTransitioning: (value: boolean) => void;
  setUserPreference: (mode: UIMode | null) => void;
  saveScrollPosition: (key: string, position: number) => void;
  getScrollPosition: (key: string) => number;
  toggleMode: () => void;
}

export const useUIModeStore = create<UIModeState>()(
  persist(
    (set, get) => ({
      mode: 'map',
      isTransitioning: false,
      userPreference: null,
      scrollPosition: {},
      setMode: (mode) => set({ mode }),
      setTransitioning: (value) => set({ isTransitioning: value }),
      setUserPreference: (mode) => set({ userPreference: mode }),
      saveScrollPosition: (key, position) =>
        set((state) => ({
          scrollPosition: { ...state.scrollPosition, [key]: position },
        })),
      getScrollPosition: (key) => get().scrollPosition[key] || 0,
      toggleMode: () =>
        set((state) => ({
          mode: state.mode === 'map' ? 'forge' : 'map',
        })),
    }),
    {
      name: 'ui-mode-storage',
    }
  )
);
