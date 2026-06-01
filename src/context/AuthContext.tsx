import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AgentPublic } from '@/types/agent.types';
import { loadStoredAuth, persistAuth, clearAuth, setMemoryToken } from '@/lib/tokenStore';

interface AuthContextValue {
  agent: AgentPublic | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, agent: AgentPublic) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [agent, setAgent] = useState<AgentPublic | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth().then(({ token: t, agent: a }) => {
      if (t && a) {
        setToken(t);
        setAgent(a as AgentPublic);
      }
    }).finally(() => setIsLoading(false));
  }, []);

  async function login(newToken: string, newAgent: AgentPublic) {
    await persistAuth(newToken, newAgent);
    setToken(newToken);
    setAgent(newAgent);
  }

  async function logout() {
    await clearAuth();
    setMemoryToken(null);
    setToken(null);
    setAgent(null);
  }

  return (
    <AuthContext.Provider value={{ agent, token, isAuthenticated: !!token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
