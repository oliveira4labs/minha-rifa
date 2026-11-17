import { useCallback } from 'react';
import { copyToClipboard } from '../lib/clipboard';
import { useToast } from '../ui/feedback/ToastProvider';

/** Copia um texto e avisa com um toast. */
export function useCopy() {
  const toast = useToast();
  return useCallback(async (text, message = 'Copiado!') => {
    await copyToClipboard(text);
    toast(message);
  }, [toast]);
}
