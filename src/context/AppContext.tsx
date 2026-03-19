'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useAppState } from '@/hooks/useAppState';

type AppStateType = ReturnType<typeof useAppState>;

const AppContext = createContext<AppStateType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const state = useAppState();
  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}

export function useApp(): AppStateType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
