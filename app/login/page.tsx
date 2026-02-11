"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/providers/AuthProvider";
import { setCookie } from "@/app/lib/axiosClient";
import { preformatGetAssertReq, publicKeyCredentialToJSON } from "@/utils/webauthn";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');
  const [mfaRequestId, setMfaRequestId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);

  // Check for registration success message
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('registered') === 'true') {
      setMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập. Nếu không thấy trong hộp thư chính, vui lòng kiểm tra thư mục Spam hoặc liên hệ 0787358358 để được hỗ trợ.');
      setMessageType('success');
      // Clean up URL
      window.history.replaceState({}, '', '/login');
    }

    if (searchParams.get('deactivated') === 'true') {
      setMessage('Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ 0787358358 để được hỗ trợ.');
      setMessageType('error');
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setMessageType('error');
    try {
      // Call service directly so we can handle MFA response shape
      const res = await (await import('@/app/services/authService')).login({ email, password } as { email: string; password: string });

      // Case: API returned ApiResponse(shape) indicating MFA required
      if (res && res.success && res.data?.mfaRequired) {
        setMfaRequestId(res.data.requestId || null);
        setMessage('Mã OTP đã được gửi tới email của bạn. Vui lòng nhập mã.');
        return;
      }

      // Case: tokens returned directly
      // If backend returned tokens (AuthResponse style), persist them & refresh user context
      const access = res?.accessToken || res?.token || res?.access_token;
      const refresh = res?.refreshToken || res?.refresh_token;
      if (access) {
        setCookie('accessToken', access, 1);
        if (refresh && refresh !== 'null') setCookie('refreshToken', refresh, 7);
        try { await refreshUser?.(); } catch { /* ignore */ }
        setMessage('Đăng nhập thành công!');
        // Redirect based on refreshed user role if available
        const user = await refreshUser?.();
        const isAdmin = user?.role?.toLowerCase() === 'admin';
        const isShipper = user?.role?.toLowerCase() === 'shipper';
        let redirectPath = '/';
        if (isAdmin) redirectPath = '/admin';
        else if (isShipper) redirectPath = '/shipper';
        setTimeout(() => router.push(redirectPath), 500);
        return;
      }

      // Fallback: unknown response
      setMessage('Đăng nhập thất bại');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } } )?.response?.data?.message || (err instanceof Error ? err.message : undefined) || "Đăng nhập thất bại";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyMfa = async () => {
    if (!mfaRequestId || mfaCode.trim().length === 0) {
      setMessage('Vui lòng nhập mã OTP');
      return;
    }
    setMfaLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/login/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: mfaRequestId, code: mfaCode })
      });
      if (!res.ok) {
        const body = await res.json();
        setMessage(body?.message || 'Xác thực thất bại');
        return;
      }
      const data = await res.json();
      const access = data.token || data.accessToken || data.access_token;
      const refresh = data.refreshToken || data.refresh_token;
      if (access) {
        setCookie('accessToken', access, 1);
        try {
          const parts = (access || '').split('.');
          if (parts.length >= 2) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            const uid = payload?.userId ?? payload?.nameid ?? payload?.sub;
            if (uid) setCookie('userId', String(uid), 7);
          }
        } catch (e) { console.debug('decode access token failed', e); }
      }
      if (refresh && refresh !== 'null') setCookie('refreshToken', refresh, 7);
      try { await refreshUser?.(); } catch {}
      const user = await refreshUser?.();
      const isAdmin = user?.role?.toLowerCase() === 'admin';
      const isShipper = user?.role?.toLowerCase() === 'shipper';
      let redirectPath = '/';
      if (isAdmin) redirectPath = '/admin';
      else if (isShipper) redirectPath = '/shipper';
      router.push(redirectPath);
    } catch (err: unknown) {
      setMessage((err as Error)?.message || 'Xác thực thất bại');
    } finally {
      setMfaLoading(false);
    }
  };

  const loginWithPasskey = async () => {
    try {
      setLoading(true);
      setMessage(null);

      // 1. Ensure email provided and request options from server
      if (!email || email.trim().length === 0) {
        setMessage('Vui lòng nhập email để đăng nhập bằng Passkey');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/webauthn/login/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        let errText = 'Không lấy được options';
        try {
          const body = await res.json();
          errText = body?.message || body?.reason || JSON.stringify(body);
        } catch {
          /* ignore parse errors */
        }
        console.error('loginWithPasskey: failed to fetch options', res.status, res.statusText);
        setMessage(errText);
        return;
      }
      const options = await res.json();

      // 2. Preserve server challenge, then preformat and call WebAuthn
      const serverChallenge = options.challenge; // preserve base64url-string
      const publicKey = preformatGetAssertReq(options) as unknown as PublicKeyCredentialRequestOptions;
      const assertion = await navigator.credentials.get({ publicKey }) as unknown as PublicKeyCredential | null;
      const payload = publicKeyCredentialToJSON(assertion) as Record<string, unknown>;
      // Ensure id is present for server parsing (fallback to rawId which some browsers provide)
      if (!payload['id'] && payload['rawId']) payload['id'] = payload['rawId'];

      // 3. Send assertion to backend to verify (sanitize if needed)
      const bodyToSend: Record<string, unknown> = { assertion: payload, challenge: serverChallenge };

      // Debug: log payload shape (safely)
      try { console.debug('[loginWithPasskey] payload', JSON.parse(JSON.stringify(payload))); } catch { console.debug('[loginWithPasskey] payload (non-serializable)', payload); }

      try {
        JSON.stringify(bodyToSend);
      } catch (err: unknown) {
        console.warn('[loginWithPasskey] assertion not serializable, sanitizing', err);
        const deepSanitize = (obj: unknown): unknown => {
          if (obj == null) return obj;
          if (typeof obj !== 'object') return obj;
          if (Array.isArray(obj)) return (obj as unknown[]).map(deepSanitize);
          const res: Record<string, unknown> = {};
          for (const k of Object.keys(obj as object)) {
            const v = (obj as Record<string, unknown>)[k];
            if (typeof v === 'function' || typeof v === 'symbol') continue;
            try {
              res[k] = deepSanitize(v);
            } catch {
              res[k] = String(v);
            }
          }
          return res;
        };
        (bodyToSend as Record<string, unknown>).assertion = deepSanitize(payload);
      }

      try { console.debug('[loginWithPasskey] bodyToSend', JSON.parse(JSON.stringify(bodyToSend))); } catch { console.debug('[loginWithPasskey] bodyToSend (non-serializable)', bodyToSend); }

      const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/webauthn/login/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyToSend)
      });

      if (!verifyRes.ok) {
        try {
          const errBody = await verifyRes.json();
          console.warn('[loginWithPasskey] verify failed', verifyRes.status, errBody);
          setMessage('Đăng nhập bằng passkey thất bại: ' + (errBody?.reason || errBody?.message || verifyRes.statusText));
        } catch {
          console.warn('[loginWithPasskey] verify failed and response is not json', verifyRes.status, verifyRes.statusText);
          setMessage('Đăng nhập bằng passkey thất bại');
        }
        return;
      }

      const data = await verifyRes.json();
      if (verifyRes.ok && data.success) {
        // save token and refresh token as cookies so axiosClient and auth flows pick them up
        const access = data.token || data.accessToken || data.access_token;
        const refresh = data.refreshToken || data.refresh_token;
        if (access) {
          setCookie('accessToken', access, 1);
          // also persist userId for compatibility with refresh flow (same as password login)
          try {
            const parts = (access || '').split('.');
            if (parts.length >= 2) {
              const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
              const uid = payload?.userId ?? payload?.nameid ?? payload?.sub;
              if (uid) setCookie('userId', String(uid), 7);
            }
          } catch (e) { console.debug('[loginWithPasskey] decode access token failed', e); }
        }
        if (refresh && refresh !== 'null') {
          setCookie('refreshToken', refresh, 7);
        }
        // optional: refresh auth context so UI updates without a full page reload
        try { await refreshUser?.();
          // trigger header refresh of cart/notifications immediately
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('cart:updated'));
            window.dispatchEvent(new Event('notifications:updated'));
          }
        } catch { /* ignore */ }
        const user = await refreshUser?.();
        const isAdmin = user?.role?.toLowerCase() === 'admin';
        const isShipper = user?.role?.toLowerCase() === 'shipper';
        let redirectPath = '/';
        if (isAdmin) redirectPath = '/admin';
        else if (isShipper) redirectPath = '/shipper';
        router.push(redirectPath);
      } else {
        setMessage('Đăng nhập bằng passkey thất bại');
      }
    } catch (err: unknown) {
      console.error(err);
      const errMsg = (err as Error)?.message || String(err);
      setMessage('Lỗi đăng nhập bằng passkey: ' + (errMsg || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };


  // Google identity handling (typed)
  type GoogleWindow = {
    google?: {
      accounts?: {
        id?: {
          initialize: (opts: { client_id: string; callback: (resp: { credential: string }) => void }) => void;
          renderButton: (el: HTMLElement | null, opts?: { theme?: string; size?: string }) => void;
          prompt: () => void;
        }
      }
    }
  };

  const handleGoogleCredential = useCallback(async (resp: { credential: string }) => {
    try {
      setLoading(true);
      setMessage(null);
      const idToken = resp?.credential;

      // early defensive: ensure credential string
      if (!idToken || typeof idToken !== 'string') {
        setMessage('Google login failed');
        return;
      }
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const r = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      const data = await r.json();
      if (!r.ok) {
        const msg = data?.message || 'Google sign-in failed';
        // Provide friendly suggestion when Google returned user-not-found or unverified
        if (msg === 'User not found') setMessage('Tài khoản Google chưa được đăng ký. Vui lòng đăng ký trước.');
        else if (msg === 'Email not verified') setMessage('Email chưa được đăng ký. Vui lòng đăng ký trước.');
        else setMessage(msg);
        return;
      }

      // If tokens were returned
      const access = data.accessToken || data.token || data.access_token;
      const refresh = data.refreshToken || data.refresh_token;
      if (access) {
        setCookie('accessToken', access, 1);
        if (refresh && refresh !== 'null') setCookie('refreshToken', refresh, 7);
        try { await refreshUser?.(); } catch {}
        const user = await refreshUser?.();
        const isAdmin = user?.role?.toLowerCase() === 'admin';
        const isShipper = user?.role?.toLowerCase() === 'shipper';
        let redirectPath = '/';
        if (isAdmin) redirectPath = '/admin';
        else if (isShipper) redirectPath = '/shipper';
        router.push(redirectPath);
        return;
      }

      // If verification was sent
      if (data?.verificationSent || (data?.success && !data?.accessToken)) {
        setMessage('Đã gửi email xác thực. Vui lòng kiểm tra hộp thư và nhấn nút xác thực.');
        return;
      }

      setMessage('Google sign-in failed');
    } catch (err: unknown) {
      console.error(err);
      setMessage((err as Error)?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }, [refreshUser, router]);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const gw = typeof window !== 'undefined' ? (window as unknown as GoogleWindow) : undefined;

    // load script if needed
    if (gw && !gw.google) {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = () => {
        try {
          const g = (window as unknown as GoogleWindow).google;
          g?.accounts?.id?.initialize({ client_id: clientId, callback: handleGoogleCredential });
          g?.accounts?.id?.renderButton(document.getElementById('g_id_signin'), { theme: 'outline', size: 'large' });
        } catch (e: unknown) {
          console.debug('google initialize failed', e);
        }
      };
      document.head.appendChild(s);
    } else if (gw && gw.google) {
      try {
        const g = gw.google;
        g.accounts?.id?.initialize({ client_id: clientId, callback: handleGoogleCredential });
        g.accounts?.id?.renderButton(document.getElementById('g_id_signin'), { theme: 'outline', size: 'large' });
      } catch (e: unknown) { console.debug('google initialize failed', e); }
    }

  }, [handleGoogleCredential]);

  return (
    <main className="max-w-md mx-auto mt-12 p-6 bg-white rounded-md shadow">
      <h1 className="text-2xl font-semibold mb-4">Đăng nhập</h1>
      {message && (
        <div className={`mb-4 text-sm p-3 rounded ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'text-red-600'
        }`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <div className="text-right mt-1">
            <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={loginWithPasskey}
            disabled={loading}
            className="w-full mt-3 bg-gray-800 text-white py-2 rounded"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập bằng Passkey'}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div id="g_id_signin" />
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
          Đăng ký ngay
        </Link>
      </div>

      {mfaRequestId && (
        <div className="mt-4 p-4 bg-gray-50 border rounded">
          <h3 className="font-medium mb-2">Xác thực 2 bước</h3>
          {message && <div className="mb-2 text-sm text-red-600">{message}</div>}
          <div className="mb-2">
            <label className="block text-sm mb-1">Mã OTP</label>
            <input value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>
          <div className="flex gap-2">
            <button onClick={verifyMfa} disabled={mfaLoading} className="bg-green-600 text-white px-3 py-2 rounded">{mfaLoading ? 'Đang xác thực...' : 'Xác thực'}</button>
            <button onClick={() => { setMfaRequestId(null); setMessage(null); }} className="bg-white border px-3 py-2 rounded">Hủy</button>
          </div>
        </div>
      )}

    </main>
  );
}
