"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "@/app/lib/axiosClient";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.message || "Registration failed");
      } else {
        setMessage(data?.message || "Registered successfully");
        // redirect to login after short delay
        setTimeout(() => router.push("/login"), 1000);
      }
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Network error");
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

  type GoogleResponse = {
    accessToken?: string;
    token?: string;
    access_token?: string;
    refreshToken?: string;
    refresh_token?: string;
    verificationSent?: boolean;
    success?: boolean;
    message?: string;
  } | null;

  const handleGoogleCredential = React.useCallback(async (resp: { credential: string }) => {
    try {
      setLoading(true);
      setMessage(null);
      const idToken = resp?.credential;
      if (!idToken) { setMessage('Google sign-in failed'); return; }
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const r = await fetch(`${API_URL}/api/auth/google/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) });

      // Safely parse possible empty/non-JSON response
      const text = await r.text();
      let data: GoogleResponse = null;
      try { data = text ? (JSON.parse(text) as GoogleResponse) : null; } catch { data = null; }

      const getString = (o: GoogleResponse, k: keyof NonNullable<GoogleResponse>) => {
        if (!o) return undefined;
        const v = (o as Record<string, unknown>)[k as string];
        return typeof v === 'string' ? v : undefined;
      };

      if (!r.ok) { setMessage(getString(data, 'message') ?? `Google sign-in failed (status ${r.status})`); return; }
      const access = getString(data, 'accessToken') ?? getString(data, 'token') ?? getString(data, 'access_token');
      const refresh = getString(data, 'refreshToken') ?? getString(data, 'refresh_token');
      if (access) {
        setCookie('accessToken', access, 1);
        if (refresh && refresh !== 'null') setCookie('refreshToken', refresh, 7);
        setTimeout(() => { window.location.href = '/'; }, 100);
        return;
      }
      const verificationSent = Boolean(data && ((data as Record<string, unknown>)['verificationSent'] === true || (data as Record<string, unknown>)['success'] === true && !access));
      if (verificationSent) {
        setMessage('Đã gửi email xác thực. Vui lòng kiểm tra hộp thư và nhấn nút xác thực.');
        return;
      }
      setMessage('Google sign-in failed');
    } catch (err: unknown) {
      console.error(err);
      setMessage((err as Error)?.message || 'Google sign-in failed');
    } finally { setLoading(false); }
  }, []);

  React.useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    const gw = typeof window !== 'undefined' ? (window as unknown as GoogleWindow) : undefined;
    if (gw && !gw.google) {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = () => {
        try {
          const g = (window as unknown as GoogleWindow).google;
          g?.accounts?.id?.initialize({ client_id: clientId, callback: handleGoogleCredential });
          // Use signup button text for the register page
          type GsiRenderOptions = { theme?: string; size?: string; text?: string };
          g?.accounts?.id?.renderButton(document.getElementById('g_id_signin_register'), ({ theme: 'outline', size: 'large', text: 'signup_with' } as unknown as GsiRenderOptions));
        } catch (e: unknown) { console.debug('google init register failed', e); }
      };
      document.head.appendChild(s);
    } else if (gw && gw.google) {
      try { const g = gw.google; g.accounts?.id?.initialize({ client_id: clientId, callback: handleGoogleCredential }); type GsiRenderOptions = { theme?: string; size?: string; text?: string }; g.accounts?.id?.renderButton(document.getElementById('g_id_signin_register'), ({ theme: 'outline', size: 'large', text: 'signup_with' } as unknown as GsiRenderOptions)); } catch (e: unknown) { console.debug('google init register failed', e); }
    }
  }, [handleGoogleCredential]);

  return (
    <main className="max-w-md mx-auto mt-12 p-6 bg-white rounded-md shadow">
      <h1 className="text-2xl font-semibold mb-4">Đăng ký</h1>
      {message && <div className="mb-4 text-sm text-red-600">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Họ và tên</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
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
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div id="g_id_signin_register" />
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        Đã có tài khoản?{" "}
        <a href="/login" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
          Đăng nhập ngay
        </a>
      </div>

    </main>
  );
}
