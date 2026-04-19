import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type UpdateProfilePayload, type UserProfile } from "@/lib/api";
import { normalizeUserRole } from "@/lib/roles";
import { apiClient, type AuthMeResponse } from "@/lib/api-client";
import { eventBus } from "@/lib/event-bus";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

function normalizeProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    role: normalizeUserRole(profile.role) || profile.role,
  };
}

function makeDemoProfile(email: string, fullName?: string): UserProfile {
  return {
    id: "demo-user-1",
    email,
    full_name: fullName || email.split("@")[0],
    role: "user",
    avatar_url: undefined,
    created_at: new Date().toISOString(),
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    is_verified: true,
  };
}

function profileFromAuthMe(data: AuthMeResponse, previous?: UserProfile | null): UserProfile {
  return normalizeProfile({
    id: String(data.id),
    email: data.email,
    full_name: data.full_name || data.email.split("@")[0] || "Usuário",
    role: data.role,
    avatar_url: data.avatar_url ?? undefined,
    created_at: data.created_at,
    language: data.language,
    timezone: data.timezone,
    is_verified: data.is_verified,
    is_premium: data.is_premium ?? previous?.is_premium,
    economics: data.economics,
    momentum: data.momentum,
    psychology: data.psychology,
  });
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<boolean>;
  clearError: () => void;
  updateLocalUser: (
    updates: Partial<Pick<UserProfile, "full_name" | "language" | "timezone" | "avatar_url">>,
  ) => void;
  updateProfile: (updates: UpdateProfilePayload) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          if (DEMO_MODE) {
            await new Promise((r) => setTimeout(r, 400));
            set({ user: normalizeProfile(makeDemoProfile(email)), isAuthenticated: true, isLoading: false });
            return;
          }

          await apiClient.login({ username: email, password });
          const userData = await apiClient.getCurrentUser();
          set({
            user: profileFromAuthMe(userData),
            isAuthenticated: true,
            isLoading: false,
          });
          // Emit daily active event for gamification/streaks
          eventBus.emit("user.daily_active", { userId: userData.id });
        } catch (err: unknown) {
          const message =
            (err as Error)?.message ||
            "Erro ao fazer login. Verifique suas credenciais.";
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      register: async (email, password, fullName) => {
        set({ isLoading: true, error: null });
        try {
          if (DEMO_MODE) {
            await new Promise((r) => setTimeout(r, 500));
            set({ user: normalizeProfile(makeDemoProfile(email, fullName)), isAuthenticated: true, isLoading: false });
            return;
          }

          await apiClient.register({
            email,
            username: email.split('@')[0],
            password,
            full_name: fullName,
          });
          await apiClient.login({ username: email, password });
          const userData = await apiClient.getCurrentUser();
          set({
            user: profileFromAuthMe(userData),
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: unknown) {
          const message =
            (err as Error)?.message ||
            "Erro ao criar conta. Tente novamente.";
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      logout: () => {
        apiClient.clearToken();
        set({ user: null, isAuthenticated: false, error: null });
      },

      fetchProfile: async () => {
        try {
          if (DEMO_MODE) return true;
          const userData = await apiClient.getCurrentUser();
          set((state) => ({
            user: profileFromAuthMe(userData, state.user),
            isAuthenticated: true,
          }));
          return true;
        } catch {
          set({ user: null, isAuthenticated: false });
          apiClient.clearToken();
          return false;
        }
      },

      clearError: () => set({ error: null }),

      updateLocalUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : state.user,
        })),

      updateProfile: async (updates) => {
        if (DEMO_MODE) {
          set((state) => ({
            user: state.user
              ? normalizeProfile({
                  ...state.user,
                  ...(updates.full_name !== undefined ? { full_name: updates.full_name } : {}),
                  ...(updates.language !== undefined ? { language: updates.language } : {}),
                  ...(updates.timezone !== undefined ? { timezone: updates.timezone } : {}),
                  ...(updates.avatar_url !== undefined ? { avatar_url: updates.avatar_url } : {}),
                })
              : state.user,
          }));
          return;
        }
        const data = await apiClient.updateMyProfile(updates);
        set((state) => ({
          user: profileFromAuthMe(data, state.user),
        }));
      },
    }),
    {
      name: "olcan-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
