import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type UserProfile } from "@/lib/api";
import { normalizeUserRole } from "@/lib/roles";
import { apiClient } from "@/lib/api-client";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// Unified auth token key - shared across app, website, and marketplace
const UNIFIED_TOKEN_KEY = 'olcan_access_token';

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
          if (DEMO_MODE) {
            await new Promise((r) => setTimeout(r, 400));
            set({ user: normalizeProfile(makeDemoProfile(email)), isAuthenticated: true, isLoading: false });
            return;
          }

          await apiClient.login({ username: email, password });
          const userData = await apiClient.getCurrentUser();
          const profile: UserProfile = {
            id: userData.id.toString(),
            email: userData.email,
            full_name: userData.full_name || userData.username,
            role: 'user',
            avatar_url: userData.avatar_url || undefined,
            created_at: userData.created_at,
          };
          set({ user: normalizeProfile(profile), isAuthenticated: true, isLoading: false });
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

          const username = email.split('@')[0];
          const userData = await apiClient.register({
            email,
            username,
            password,
            full_name: fullName,
          });
          await apiClient.login({ username, password });
          const profile: UserProfile = {
            id: userData.id.toString(),
            email: userData.email,
            full_name: userData.full_name || userData.username,
            role: 'user',
            avatar_url: userData.avatar_url || undefined,
            created_at: userData.created_at,
          };
          set({ user: normalizeProfile(profile), isAuthenticated: true, isLoading: false });
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
          const profile: UserProfile = {
            id: userData.id.toString(),
            email: userData.email,
            full_name: userData.full_name || userData.username,
            role: 'user',
            avatar_url: userData.avatar_url || undefined,
            created_at: userData.created_at,
          };
          set({ user: normalizeProfile(profile), isAuthenticated: true });
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
