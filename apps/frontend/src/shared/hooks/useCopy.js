import { useCallback } from 'react';
import { copyToClipboard } from '../lib/clipboard';
import { useToast } from '../ui/feedback/ToastProvider';

export function useCopy() {
  const toast = useToast();
  return useCallback(async (text, message = 'Copiado!') => {
    await copyToClipboard(text);
    toast(message);
  }, [toast]);
}
