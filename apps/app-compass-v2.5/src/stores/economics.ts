import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';

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
  credentials: [],
  isLoading: false,
  error: null,

  hasActiveCredential: () => {
    return get().credentials.some(c => c.is_active);
  },

  fetchCredentials: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.getEconomicsCredentials();
      const remoteCredentials: Credential[] = (
        (data as { credentials?: Credential[] }).credentials ?? []
      ).map((c) => ({
        id: c.id,
        credential_type: c.credential_type as Credential['credential_type'],
        score_value: c.score_value,
        is_active: c.is_active,
        issued_at: typeof c.issued_at === 'string' ? c.issued_at : new Date(c.issued_at as unknown as string).toISOString(),
        expires_at: c.expires_at ? (typeof c.expires_at === 'string' ? c.expires_at : new Date(c.expires_at as unknown as string).toISOString()) : undefined,
        verification_url: c.verification_url,
        verification_clicks: c.verification_clicks ?? 0,
      }));
      set({ credentials: remoteCredentials, isLoading: false });
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
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
