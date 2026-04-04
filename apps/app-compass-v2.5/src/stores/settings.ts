import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  notifications: Record<string, boolean>;
  privacy: Record<string, boolean>;
  theme: "light" | "dark" | "system";
  density: "compact" | "normal" | "spacious";
  language: string;
  timezone: string;
  currency: string;
  updateNotifications: (key: string, value: boolean) => void;
  updatePrivacy: (key: string, value: boolean) => void;
  updateAppearance: (prefs: Partial<Pick<SettingsState, "theme" | "density">>) => void;
  updateLocale: (prefs: Partial<Pick<SettingsState, "language" | "timezone" | "currency">>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifications: {
        deadlines: true,
        scores: true,
        risks: true,
        marketplace: true,
        updates: false,
        newsletter: false,
      },
      privacy: {
        visible_providers: true,
        share_org: false,
        ai_analysis: true,
        anon_benchmarks: true,
      },
      theme: "light",
      density: "normal",
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      currency: "BRL",
      updateNotifications: (key, value) =>
        set((state) => ({ notifications: { ...state.notifications, [key]: value } })),
      updatePrivacy: (key, value) =>
        set((state) => ({ privacy: { ...state.privacy, [key]: value } })),
      updateAppearance: (prefs) => set((state) => ({ ...state, ...prefs })),
      updateLocale: (prefs) => set((state) => ({ ...state, ...prefs })),
    }),
    { name: "olcan-settings" }
  )
);
