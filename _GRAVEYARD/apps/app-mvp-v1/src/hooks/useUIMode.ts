import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UIMode = 'map' | 'forge';

interface UIModeState {
  mode: UIMode;
  setMode: (mode: UIMode) => void;
  toggleMode: () => void;
}

export const useUIMode = create<UIModeState>()(
  persist(
    (set) => ({
      mode: 'map',
      setMode: (mode) => set({ mode }),
      toggleMode: () => set((state) => ({ mode: state.mode === 'map' ? 'forge' : 'map' })),
    }),
    {
      name: 'olcan-ui-mode',
    }
  )
);
