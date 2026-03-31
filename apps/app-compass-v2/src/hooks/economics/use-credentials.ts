import { useState, useCallback } from 'react';

// Simplified hook for Economic Credentials
export function useCredentials() {
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<any[]>([]);

  const fetchCredentials = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock fetch
      await new Promise(r => setTimeout(r, 500));
      setCredentials([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { credentials, isLoading, fetchCredentials };
}
