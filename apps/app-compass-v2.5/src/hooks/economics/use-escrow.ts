import { useState, useCallback } from 'react';

// Simplified hook for Escrow interactions
export function useEscrow() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [escrowStatus, setEscrowStatus] = useState<string>('idle');

  const initiateEscrow = useCallback(async (amount: number, serviceId: string) => {
    setIsProcessing(true);
    try {
      // Mock initiate escrow
      await new Promise(r => setTimeout(r, 800));
      setEscrowStatus('funded');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { isProcessing, escrowStatus, initiateEscrow };
}
