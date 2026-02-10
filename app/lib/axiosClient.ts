import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const baseURL = process.env.NEXT_PUBLIC_API_URL || '';

const instance = axios.create({ baseURL, withCredentials: true });

let isRefreshing = false;

type FailedQueueItem = {
  resolve: (value?: string | null) => void;
  reject: (err: unknown) => void;
};
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (!match) return null;
  const val = decodeURIComponent(match[2]);
  // treat literal strings 'null' or 'undefined' as no value
  if (val === 'null' || val === 'undefined') return null;
  return val;
};

// Decode JWT payload without verifying signature — safe for extracting non-sensitive fields like userId
const decodeJwt = (token: string | null): Record<string, unknown> | null => {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (err) {
    console.warn('[axiosClient] decodeJwt failed', err);
    return null;
  }
};

const setCookie = (name: string, value: string | null, days = 7) => {
  if (typeof document === 'undefined') return;
  // do not set cookie when value is null or literal 'null' (backend sometimes returns 'null' string)
  if (value === null || value === 'null' || value === 'undefined') {
    console.debug(`[axiosClient] setCookie skipped for ${name} because value is nullish`);
    return;
  }
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(String(value))}${expires}; path=/${secure}; SameSite=Lax`;
  console.debug(`[axiosClient] setCookie ${name} (days=${days}). document.cookie=`, document.cookie);
};

const eraseCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  console.warn(`[axiosClient] eraseCookie ${name}. Before:`, document.cookie);
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
  console.warn(`[axiosClient] eraseCookie ${name}. After:`, document.cookie);
};

instance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const accessToken = getCookie('accessToken');
    if (accessToken && config.headers) config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    type ReqWithRetry = InternalAxiosRequestConfig & { _retry?: boolean };
    const originalRequest = (error.config as ReqWithRetry) || {};

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/api/auth/refresh') || originalRequest.url?.includes('/api/auth/login')) {
        eraseCookie('accessToken');
        eraseCookie('refreshToken');
        eraseCookie('userId');
        if (typeof window !== 'undefined' && !originalRequest.url?.includes('/api/auth/login')) {
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!', { id: 'auth-401' });
          setTimeout(() => window.location.href = '/login', 1500);
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = typeof window !== 'undefined' ? getCookie('refreshToken') : null;

      return new Promise(async (resolve, reject) => {
        try {
          // If there's no refresh token (or it's the literal string 'null'), avoid calling the refresh endpoint
          // which will 400/401 when unauthenticated
          if (!refreshToken || refreshToken === 'null') {
            if (typeof window !== 'undefined') {
              console.warn('[axiosClient] No valid refresh token present before refresh attempt. document.cookie=', document.cookie);
              eraseCookie('accessToken');
              eraseCookie('refreshToken');
              eraseCookie('userId');
              toast.error('Vui lòng đăng nhập để thực hiện thao tác này!', { id: 'auth-401' });
              setTimeout(() => window.location.href = '/login', 1500);
            }
            isRefreshing = false;
            return reject(error);
          }

          console.debug('[axiosClient] Attempting token refresh; refreshToken present? ', typeof window !== 'undefined' ? Boolean(getCookie('refreshToken')) : 'server');
          // Include userId with refresh request — backend expects { userId, refreshToken }
          const accessTokenForDecode = typeof window !== 'undefined' ? getCookie('accessToken') : null;
          const parsed = decodeJwt(accessTokenForDecode);
          const userIdForRefresh = parsed && (parsed['userId'] || parsed['nameid'] || parsed['sub']) ? String(parsed['userId'] ?? parsed['nameid'] ?? parsed['sub']) : null;
          const refreshPayload: Record<string, unknown> = { refreshToken };
          if (userIdForRefresh) refreshPayload['userId'] = userIdForRefresh;

          console.debug('[axiosClient] Refresh payload', refreshPayload);
          const resp = await axios.post(`${baseURL}/api/auth/refresh`, refreshPayload);
          const { accessToken, refreshToken: newRefresh } = resp.data;
          console.debug('[axiosClient] Refresh response', { status: resp.status, accessToken: Boolean(accessToken), hasRefreshToken: Boolean(newRefresh) });
          if (!accessToken) throw new Error('Refresh did not return an access token');
          if (typeof window !== 'undefined') {
            // always update access token
            setCookie('accessToken', accessToken, 1); // short lived
            // If server returned a new refresh token, replace it. If not, keep the existing one and extend its expiry to avoid accidental deletion.
            if (newRefresh) {
              setCookie('refreshToken', newRefresh, 7);
            } else {
              const existingRefresh = getCookie('refreshToken');
              if (existingRefresh) {
                // re-apply same token to extend expiry
                setCookie('refreshToken', existingRefresh, 7);
                console.debug('[axiosClient] refresh returned no new refresh token; extended existing refresh token expiry');
              } else {
                // no existing refresh token to keep
                console.debug('[axiosClient] refresh returned no new refresh token and no existing refresh token present');
              }
            }
            console.debug('[axiosClient] Cookies after refresh set. document.cookie=', document.cookie);
          }
          instance.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
          processQueue(null, accessToken);
          resolve(instance(originalRequest));
        } catch (err: unknown) {
          processQueue(err, null);
          if (typeof window !== 'undefined') {
            eraseCookie('accessToken');
            eraseCookie('refreshToken');
            eraseCookie('userId');
            toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!', { id: 'auth-401' });
            setTimeout(() => window.location.href = '/login', 1500);
          }
          reject(err);
        } finally {
          isRefreshing = false;
        }
      });
    }

    return Promise.reject(error);
  }
);

export { getCookie, setCookie, eraseCookie };
export default instance;
