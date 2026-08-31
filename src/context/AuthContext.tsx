import React, { createContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { AuthContextType, AuthUser, LoginRequest } from '../types/auth';
import { authService } from '../services/authService';
import { AUTH_TOKEN_STORAGE_KEY } from '../api/client';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) : null;
  });
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    // If token exists in storage, stay in loading state until session verification finishes
    return typeof window !== 'undefined' && !!localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  });

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
    setIsLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      logout();
    }
  }, [logout]);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.token);
      }
      setToken(response.token);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Restore session from token on initial app load
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) : null;
      if (!storedToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
          setToken(storedToken);
        }
      } catch {
        if (isMounted) {
          authService.logout();
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for centralized 401 unauthorized events from Axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('caresync:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('caresync:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  // Role checking helpers (case-insensitive)
  const hasRole = useCallback((role: string): boolean => {
    if (!user || !user.roles || user.roles.length === 0) return false;
    const target = role.trim().toLowerCase();
    return user.roles.some((r) => r.trim().toLowerCase() === target);
  }, [user]);

  const hasAnyRole = useCallback((roles: string[]): boolean => {
    if (!roles || roles.length === 0) return true;
    return roles.some((role) => hasRole(role));
  }, [hasRole]);

  const contextValue = useMemo<AuthContextType>(() => ({
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    refreshUser,
    hasRole,
    hasAnyRole,
  }), [user, token, isLoading, login, logout, refreshUser, hasRole, hasAnyRole]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
