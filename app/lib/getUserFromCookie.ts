import { cookies } from "next/headers";
import axios, { isAxiosError } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || '';

export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) {
    console.debug('[getUserFromCookie] no accessToken cookie found');
    return null;
  }

  try {
    const res = await axios.get(`${baseURL}/api/auth/me`, { headers: { Authorization: `Bearer ${accessToken}` } });
    console.debug('[getUserFromCookie] /me success');
    return res.data;
  } catch (err: unknown) {
    // If token expired/invalid (401), attempt server-side refresh using refresh token cookie
    if (isAxiosError(err) && err.response?.status === 401) {
      console.info('[getUserFromCookie] access token invalid; attempting server-side refresh');
      const refreshToken = cookieStore.get('refreshToken')?.value;
      if (!refreshToken) {
        console.debug('[getUserFromCookie] no refreshToken cookie present; returning null');
        // remove access cookie to avoid repeated 401s
        try { cookieStore.delete('accessToken'); } catch {}
        return null;
      }

      try {
        const ref = await axios.post(`${baseURL}/api/auth/refresh`, { refreshToken });
        const { accessToken: newAccess, refreshToken: newRefresh } = ref.data ?? {};
        if (!newAccess) {
          console.warn('[getUserFromCookie] refresh endpoint did not return access token');
          cookieStore.delete('accessToken');
          cookieStore.delete('refreshToken');
          return null;
        }

        // set cookies server-side (short-lived access token)
        try {
          cookieStore.set('accessToken', newAccess, { httpOnly: true, path: '/' });
          if (newRefresh) cookieStore.set('refreshToken', newRefresh, { httpOnly: true, path: '/' });
        } catch (e) {
          console.warn('[getUserFromCookie] failed to set refreshed cookies', e);
        }

        // retry /me with new token
        const retry = await axios.get(`${baseURL}/api/auth/me`, { headers: { Authorization: `Bearer ${newAccess}` } });
        console.debug('[getUserFromCookie] /me success after refresh');
        return retry.data;
      } catch (refreshErr) {
        console.warn('[getUserFromCookie] refresh failed, clearing cookies', refreshErr);
        try { cookieStore.delete('accessToken'); cookieStore.delete('refreshToken'); } catch {}
        return null;
      }
    }

    console.warn('[getUserFromCookie] /me failed', err);
    return null;
  }
}
