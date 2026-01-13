"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { setCookie } from "@/app/lib/axiosClient";
import { preformatGetAssertReq, publicKeyCredentialToJSON } from "@/utils/webauthn";

export default function LoginPage() {
  const router = useRouter();
  const { login, refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const updatedUser = await login({ email, password });
      setMessage("Đăng nhập thành công!");
      const isAdmin = updatedUser?.role?.toLowerCase() === 'admin';
      setTimeout(() => router.push(isAdmin ? '/admin' : '/'), 500);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } } )?.response?.data?.message || (err instanceof Error ? err.message : undefined) || "Đăng nhập thất bại";
      setMessage(msg);
    } finally {
      setLoading(false);
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
        router.push('/');
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


  return (
    <main className="max-w-md mx-auto mt-12 p-6 bg-white rounded-md shadow">
      <h1 className="text-2xl font-semibold mb-4">Đăng nhập</h1>
      {message && <div className="mb-4 text-sm text-red-600">{message}</div>}
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
    </main>
  );
}
