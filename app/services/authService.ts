import axiosClient, { getCookie, setCookie, eraseCookie } from '../lib/axiosClient';

type LoginRequest = { email: string; password: string };
type RegisterRequest = { email: string; password: string; fullName?: string };

export const register = async (payload: RegisterRequest) => {
  const res = await axiosClient.post('/api/auth/register', payload);
  return res.data;
};

export const login = async (credentials: LoginRequest) => {
  const res = await axiosClient.post('/api/auth/login', credentials);
  const data = res.data;
  if (typeof window !== 'undefined' && data) {
    if (data.accessToken) setCookie('accessToken', data.accessToken, 1);
    // only persist refresh token if it's a real non-null string
    if (data.refreshToken && data.refreshToken !== 'null') setCookie('refreshToken', data.refreshToken, 7);
    // Attempt to extract and persist userId from accessToken for refresh endpoint compatibility
    try {
      const parts = (data.accessToken || '').split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        const uid = payload?.userId ?? payload?.nameid ?? payload?.sub;
        if (uid) {
          setCookie('userId', String(uid), 7);
        }
      }
    } catch {
      // ignore decode failures
    }

    console.debug('[authService.login] login response and cookies set. document.cookie=', document.cookie);
  }
  return data;
};


export const logout = async () => {
  try {
    const accessToken = typeof window !== 'undefined' ? getCookie('accessToken') : null;
    const refreshToken = typeof window !== 'undefined' ? getCookie('refreshToken') : null;
    await axiosClient.post('/api/auth/logout', { accessToken, refreshToken });
  } catch {
    // ignore
  } finally {
    if (typeof window !== 'undefined') {
      eraseCookie('accessToken');
      eraseCookie('refreshToken');
      // Also clear userId cookie on logout
      eraseCookie('userId');
    }
  }
};

export const me = async () => {
  const res = await axiosClient.get('/api/auth/me');
  // API returns { success, message, data } — unwrap `data` when present
  return res.data?.data ?? res.data;
};

export const updateProfile = async (payload: { fullName?: string; phone?: string; gender?: string; avatarUrl?: string | null }) => {
  const res = await axiosClient.put('/api/auth/me', payload);
  return res.data;
};

export const upsertAddress = async (payload: { addressId?: string; fullAddress: string; latitude?: number | null; longitude?: number | null; isDefault?: boolean }) => {
  const res = await axiosClient.put('/api/auth/me/address', payload);
  return res.data?.data ?? res.data;
};

export const deleteAddress = async (addressId: string) => {
  const res = await axiosClient.delete(`/api/auth/me/address/${addressId}`);
  return res.data;
};
