import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Snackbar, Text } from 'react-native-paper';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast { message: string; type: ToastType }
interface ToastContextValue { show: (message: string, type: ToastType) => void }

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TYPE_COLORS: Record<ToastType, string> = {
  success: '#1b5e20',
  error: '#b71c1c',
  warning: '#e65100',
  info: '#0d47a1',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  const show = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <Snackbar
          visible={!!toast}
          onDismiss={() => setToast(null)}
          duration={3000}
          style={{ backgroundColor: TYPE_COLORS[toast.type] }}
        >
          <Text style={{ color: '#fff' }}>{toast.message}</Text>
        </Snackbar>
      )}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider');
  return ctx;
}
