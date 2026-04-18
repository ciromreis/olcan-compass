import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

interface AuthUser {
  id: string;
  email: string;
  full_name?: string | null;
  role?: string;
}

export const useLogin = () => {
  const { setUser, setAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      // api.login() already stores tokens and fetches profile
      return api.login(credentials.email, credentials.password);
    },
    onSuccess: (data: AuthUser) => {
      // Must be synchronous so setAuthenticated fires before navigate()
      setUser({
        id: data.id,
        email: data.email,
        full_name: data.full_name || '',
        role: data.role,
      });
      setAuthenticated(true);
    },
  });
};

export const useRegister = () => {
  const { setUser, setAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      // api.register() already stores tokens and fetches profile
      return api.register(data.email, data.password, data.full_name);
    },
    onSuccess: (data: AuthUser) => {
      // Must be synchronous so setAuthenticated fires before navigate()
      setUser({
        id: data.id,
        email: data.email,
        full_name: data.full_name || '',
        role: data.role,
      });
      setAuthenticated(true);
    },
  });
};

export const useProfile = () => {
  const { setUser } = useAuthStore();

  const query = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    },
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  return query;
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      // Optional: call backend logout endpoint if it exists
      // await api.post('/auth/logout');
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
};

export const usePasswordReset = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    },
  });
};

export const usePasswordResetConfirm = () => {
  return useMutation({
    mutationFn: async (data: { token: string; new_password: string }) => {
      const response = await api.post('/auth/reset-password', data);
      return response.data;
    },
  });
};
