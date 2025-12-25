import axiosClient, { getCookie, setCookie, eraseCookie } from './axiosClient';

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
    if (data.refreshToken) setCookie('refreshToken', data.refreshToken, 7);
  }
  return data;
};

export const refresh = async () => {
  const refreshToken = typeof window !== 'undefined' ? getCookie('refreshToken') : null;
  const res = await axiosClient.post('/api/auth/refresh', { refreshToken });
  const data = res.data;
  if (typeof window !== 'undefined' && data) {
    if (data.accessToken) setCookie('accessToken', data.accessToken, 1);
    if (data.refreshToken) setCookie('refreshToken', data.refreshToken, 7);
  }
  return data;
};

export const logout = async () => {
  try {
    const accessToken = typeof window !== 'undefined' ? getCookie('accessToken') : null;
    const refreshToken = typeof window !== 'undefined' ? getCookie('refreshToken') : null;
    await axiosClient.post('/api/auth/logout', { accessToken, refreshToken });
  } catch (err) {
    // ignore
  } finally {
    if (typeof window !== 'undefined') {
      eraseCookie('accessToken');
      eraseCookie('refreshToken');
    }
  }
};

export const me = async () => {
  const res = await axiosClient.get('/api/auth/me');
  return res.data;
};
