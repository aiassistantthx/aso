import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi, UserWithPlan } from './api';

interface AuthState {
  user: UserWithPlan | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const refreshUser = useCallback(async () => {
    if (!authApi.hasToken()) {
      setState({ user: null, loading: false, error: null });
      return;
    }

    try {
      const user = await authApi.me();
      setState({ user, loading: false, error: null });
    } catch {
      authApi.logout();
      setState({ user: null, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, error: null }));
    try {
      const { user } = await authApi.login(email, password);
      // Fetch full user with plan info
      const fullUser = await authApi.me();
      setState({ user: fullUser || (user as unknown as UserWithPlan), loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setState((s) => ({ ...s, error: message }));
      throw err;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    setState((s) => ({ ...s, error: null }));
    try {
      const { user } = await authApi.register(email, password, name);
      const fullUser = await authApi.me();
      setState({ user: fullUser || (user as unknown as UserWithPlan), loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setState((s) => ({ ...s, error: message }));
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setState({ user: null, loading: false, error: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
