import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, type UserProfile } from "@/lib/api";
import { normalizeUserRole } from "@/lib/roles";

function normalizeProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    role: normalizeUserRole(profile.role) || profile.role,
  };
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
  updateLocalUser: (updates: Partial<Pick<UserProfile, "full_name">>) => void;
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
          const { data } = await authApi.login({ email, password });
          const accessToken = data.token?.access_token || (data as unknown as Record<string, string>).access_token;
          const refreshToken = data.token?.refresh_token || (data as unknown as Record<string, string>).refresh_token;
          if (!accessToken) {
            throw new Error("Token de acesso não recebido do servidor.");
          }
          localStorage.setItem("access_token", accessToken);
          if (refreshToken) {
            localStorage.setItem("refresh_token", refreshToken);
          }

          // Fetch full profile
          const { data: profile } = await authApi.me();
          set({ user: normalizeProfile(profile), isAuthenticated: true, isLoading: false });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
            "Erro ao fazer login. Verifique suas credenciais.";
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      register: async (email, password, fullName) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authApi.register({
            email,
            password,
            full_name: fullName,
          });
          const accessToken = data.token?.access_token || (data as unknown as Record<string, string>).access_token;
          const refreshToken = data.token?.refresh_token || (data as unknown as Record<string, string>).refresh_token;
          if (!accessToken) {
            throw new Error("Token de acesso não recebido do servidor.");
          }
          localStorage.setItem("access_token", accessToken);
          if (refreshToken) {
            localStorage.setItem("refresh_token", refreshToken);
          }

          const { data: profile } = await authApi.me();
          set({ user: normalizeProfile(profile), isAuthenticated: true, isLoading: false });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
            "Erro ao criar conta. Tente novamente.";
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        set({ user: null, isAuthenticated: false, error: null });
      },

      fetchProfile: async () => {
        try {
          const { data: profile } = await authApi.me();
          set({ user: normalizeProfile(profile), isAuthenticated: true });
          return true;
        } catch {
          set({ user: null, isAuthenticated: false });
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          return false;
        }
      },

      clearError: () => set({ error: null }),

      updateLocalUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : state.user,
        })),
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
