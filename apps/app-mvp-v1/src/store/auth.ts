import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * User shape as returned by the Compass API.
 * Maps to AuthResponse / UserProfileResponse from the backend.
 */
export interface User {
  id?: string
  email: string
  full_name: string
  is_active?: boolean
  role?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isDemo: boolean
  setUser: (user: User | null) => void
  setAuthenticated: (value: boolean) => void
  setLoading: (value: boolean) => void
  loginDemo: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isDemo: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setLoading: (value) => set({ isLoading: value }),
      loginDemo: () => {
        localStorage.setItem('token', 'demo')
        localStorage.setItem('refresh_token', 'demo')
        set({
          user: {
            id: 'demo',
            email: 'demo@olcan.app',
            full_name: 'Modo Demo',
            role: 'USER',
            is_active: true,
          },
          isAuthenticated: true,
          isDemo: true,
        })
      },
      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
        set({ user: null, isAuthenticated: false, isDemo: false })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
