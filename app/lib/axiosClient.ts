import axios, { AxiosError } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || '';

const instance = axios.create({ baseURL });

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document === 'undefined') return;
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/${secure}; SameSite=Lax`;
};

const eraseCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
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
    const originalRequest = (error.config as any) || {};

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
        eraseCookie('accessToken');
        eraseCookie('refreshToken');
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = typeof window !== 'undefined' ? getCookie('refreshToken') : null;

      return new Promise(async (resolve, reject) => {
        try {
          const resp = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefresh } = resp.data;
          if (typeof window !== 'undefined') {
            setCookie('accessToken', accessToken, 1); // short lived
            setCookie('refreshToken', newRefresh, 7);
          }
          instance.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
          processQueue(null, accessToken);
          resolve(instance(originalRequest));
        } catch (err) {
          processQueue(err, null);
          if (typeof window !== 'undefined') {
            eraseCookie('accessToken');
            eraseCookie('refreshToken');
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
