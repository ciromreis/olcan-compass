import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, type UserProfile } from "@/lib/api";
import { normalizeUserRole } from "@/lib/roles";
import { apiClient } from "@/lib/api-client";

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
          // Use real API client - login expects username, not email
          // For now, use email as username (backend accepts both)
          const tokens = await apiClient.login({ 
            username: email, 
            password 
          });

          // Fetch full profile
          const userData = await apiClient.getCurrentUser();
          
          // Map backend user data to frontend UserProfile format
          const profile: UserProfile = {
            id: userData.id.toString(),
            email: userData.email,
            full_name: userData.full_name || userData.username,
            role: 'user', // Default role for now
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
          // Use real API client - generate username from email
          const username = email.split('@')[0];
          const userData = await apiClient.register({
            email,
            username,
            password,
            full_name: fullName,
          });

          // Auto-login after registration
          await apiClient.login({ username, password });
          
          // Map backend user data to frontend UserProfile format
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
