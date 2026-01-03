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
    if (data.refreshToken) setCookie('refreshToken', data.refreshToken, 7);
    console.debug('[authService.login] login response and cookies set. document.cookie=', document.cookie);
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
  // API returns { success, message, data } — unwrap `data` when present
  return res.data?.data ?? res.data;
};
