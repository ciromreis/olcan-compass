import { create } from 'zustand';

export interface Credential {
  id: string;
  credential_type: 'readiness' | 'milestone' | 'assessment';
  score_value: number;
  is_active: boolean;
  issued_at: string;
  expires_at?: string;
  verification_url: string;
  verification_clicks: number;
}

interface EconomicsState {
  credentials: Credential[];
  isLoading: boolean;
  error: string | null;
  hasActiveCredential: () => boolean;
  fetchCredentials: () => Promise<void>;
  copyVerificationLink: (url: string) => Promise<boolean>;
}

export const useEconomicsStore = create<EconomicsState>((set, get) => ({
  credentials: [
    {
      id: 'demo-cred-1',
      credential_type: 'readiness',
      score_value: 85,
      is_active: true,
      issued_at: new Date().toISOString(),
      verification_url: 'https://olcan.app/verify/demo-cred-1',
      verification_clicks: 12,
    }
  ],
  isLoading: false,
  error: null,
  
  hasActiveCredential: () => {
    return get().credentials.some(c => c.is_active);
  },

  fetchCredentials: async () => {
    set({ isLoading: true });
    try {
      // TODO: Connect to actual backend GET /api/economics/credentials
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  copyVerificationLink: async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (err) {
      console.error('Failed to copy link', err);
      return false;
    }
  }
}));
