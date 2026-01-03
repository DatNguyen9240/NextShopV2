'use client'

import { useCallback, useEffect, useState } from 'react';
import * as authService from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const data = await authService.me();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await authService.login(credentials);
    await fetchMe();
    return res;
  };

  const register = async (payload: { email: string; password: string; fullName?: string }) => {
    return authService.register(payload);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return { user, loading, login, register, logout, fetchMe } as const;
}
