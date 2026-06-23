'use client';
import { createContext, useContext, useState, useTransition, ReactNode } from 'react';
import GlobalActionLoading from './GlobalActionLoading';

interface LoadingContextType {
  startAction: (action: () => Promise<void>, loadingText?: string) => Promise<void>;
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();
  const [manualLoading, setManualLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Memproses...');

  const startAction = async (action: () => Promise<void>, text = 'Memproses...') => {
    setLoadingText(text);
    setManualLoading(true);
    try {
      await action();
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <LoadingContext.Provider value={{ startAction, isLoading: manualLoading || isPending }}>
      {children}
      <GlobalActionLoading isVisible={manualLoading || isPending} text={loadingText} />
    </LoadingContext.Provider>
  );
}

export const useGlobalLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) throw new Error('useGlobalLoading must be used within GlobalLoadingProvider');
  return context;
};
