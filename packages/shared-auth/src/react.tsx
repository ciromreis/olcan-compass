/**
 * React Hooks for Unified Authentication
 * Usage: import { useAuth, useUser } from '@olcan/shared-auth/react'
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { UnifiedAuthService, OlcanUser } from './index';

interface AuthContextValue {
  user: OlcanUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  apiUrl?: string;
}

export function AuthProvider({ children, apiUrl }: AuthProviderProps) {
  const [user, setUser] = useState<OlcanUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authService = UnifiedAuthService.getInstance();

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
      authService.clearToken();
    }
  }, [authService]);

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        await refreshUser();
      }
      setIsLoading(false);
    };

    initAuth();
  }, [authService, refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser);
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const newUser = await authService.register(email, password, fullName);
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, [authService]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication state and methods
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to access current user
 * @returns Current user or null if not authenticated
 */
export function useUser(): OlcanUser | null {
  const { user } = useAuth();
  return user;
}

/**
 * Hook to check if user is authenticated
 * @returns True if user is logged in
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook to access authentication session
 * Includes user, loading state, and helper methods
 */
export function useSession() {
  const { user, isLoading, isAuthenticated, refreshUser } = useAuth();
  
  return {
    user,
    isLoading,
    isAuthenticated,
    refresh: refreshUser,
  };
}

/**
 * Hook to check if user has specific role
 * @param requiredRole - Role to check for
 * @returns True if user has the required role
 */
export function useHasRole(requiredRole: OlcanUser['role']): boolean {
  const { user } = useAuth();
  return user?.role === requiredRole;
}

/**
 * Hook to check if user has any of the specified roles
 * @param roles - Array of roles to check
 * @returns True if user has any of the roles
 */
export function useHasAnyRole(roles: OlcanUser['role'][]): boolean {
  const { user } = useAuth();
  return user ? roles.includes(user.role) : false;
}
