import { useCallback } from 'react';
import { useToastContext } from '@/context/ToastContext';

export function useToast() {
  const { show } = useToastContext();
  return {
    success: useCallback((msg: string) => show(msg, 'success'), [show]),
    error: useCallback((msg: string) => show(msg, 'error'), [show]),
    warning: useCallback((msg: string) => show(msg, 'warning'), [show]),
    info: useCallback((msg: string) => show(msg, 'info'), [show]),
  };
}
