"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '@/app/services/authService';
import { getCookie, eraseCookie } from '@/app/lib/axiosClient';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

type Address = { addressId: string; fullAddress: string; latitude?: number | null; longitude?: number | null; isDefault?: boolean };

interface User {
  id: string;
  email: string;
  fullName?: string;
  avatar?: string;
  role?: string;
  phone?: string | null;
  gender?: string | null;
  addresses?: Address[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  // convenience to get addresses directly from context
  getAddresses: () => Address[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: User | null;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, initialUser }) => {
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [isLoading, setIsLoading] = useState(initialUser === undefined);
  const [queryClient] = useState(() => new QueryClient());

  const refreshUser = useCallback(async () => {
    try {
      // If no tokens are present, skip calling /me which would otherwise trigger an unnecessary 401/refresh attempt
      const accessToken = getCookie('accessToken');
      const refreshToken = getCookie('refreshToken');
      console.debug('[AuthProvider.refreshUser] cookies on refresh attempt', { accessToken: !!accessToken, refreshToken: !!refreshToken });
      if (!accessToken && !refreshToken) {
        setUser(null);
        return null;
      }

      const userData = await authService.me();
      setUser(userData);
      return userData as User | null;
    } catch (err: unknown) {
      // If /me returned NotFound or Unauthorized, clear auth cookies to avoid repeated failing calls
      const status = (err as { response?: { status?: number } })?.response?.status;
      const message = (err as { message?: string })?.message;
      const response = (err as { response?: { data?: unknown } })?.response?.data;
      console.warn('[AuthProvider.refreshUser] /me failed', { status, message, response });
      if (status === 401 || status === 404 || status === 400) {
        console.warn('[AuthProvider.refreshUser] clearing cookies due to failed /me');
        eraseCookie('accessToken');
        eraseCookie('refreshToken');
        eraseCookie('userId');
      }
      setUser(null);
      return null;
    }
  }, []);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      await authService.login(credentials);
      const userData = await refreshUser();
      return userData;
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);
  useEffect(() => {
    // Kiểm tra user khi mount
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);



  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAddresses = () => {
    return (user?.addresses ?? []) as Address[];
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    getAddresses,
  };

  return (
    <AuthContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AuthContext.Provider>
  );
};
