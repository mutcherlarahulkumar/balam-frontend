import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AgentPublic } from '@/types/agent.types';

interface AuthContextValue {
  agent: AgentPublic | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, agent: AgentPublic) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [agent, setAgent] = useState<AgentPublic | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('balam_token');
    const storedAgent = localStorage.getItem('balam_agent');
    if (storedToken && storedAgent) {
      setToken(storedToken);
      setAgent(JSON.parse(storedAgent) as AgentPublic);
    }
  }, []);

  function login(newToken: string, newAgent: AgentPublic) {
    localStorage.setItem('balam_token', newToken);
    localStorage.setItem('balam_agent', JSON.stringify(newAgent));
    setToken(newToken);
    setAgent(newAgent);
  }

  function logout() {
    localStorage.removeItem('balam_token');
    localStorage.removeItem('balam_agent');
    setToken(null);
    setAgent(null);
  }

  return (
    <AuthContext.Provider
      value={{ agent, token, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
