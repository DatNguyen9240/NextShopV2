"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "@/app/lib/axiosClient";
import { useAuth } from "@/app/providers/AuthProvider";

export default function VerifiedPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const doHandle = async () => {
      try {
        const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams('');
        const status = params.get('status');
        if (status === 'failed') {
          setMessage('Xác thực thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
          setProcessing(false);
          return;
        }

        const access = params.get('accessToken');
        const refresh = params.get('refreshToken');

        if (!access) {
          setMessage('Không tìm thấy token xác thực. Vui lòng đăng nhập.');
          setProcessing(false);
          return;
        }

        // Persist tokens
        setCookie('accessToken', access, 1);
        if (refresh && refresh !== 'null') setCookie('refreshToken', refresh, 7);

        // Try to decode userId from access token and store for compatibility
        try {
          const parts = (access || '').split('.');
          if (parts.length >= 2) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            const uid = payload?.userId ?? payload?.nameid ?? payload?.sub;
            if (uid) setCookie('userId', String(uid), 7);
          }
        } catch (e) {
          console.debug('decode access token failed', e);
        }

        // Refresh user context so UI updates immediately
        try { await refreshUser?.(); } catch (e) { console.debug('refreshUser failed', e); }

        // Redirect to store/home
        setTimeout(() => router.push('/'), 800);
      } catch (err) {
        console.error(err);
        setMessage('Có lỗi xảy ra. Vui lòng thử lại.');
        setProcessing(false);
      }
    };
    doHandle();
  }, [router, refreshUser]);

  return (
    <main className="max-w-md mx-auto mt-12 p-6 bg-white rounded-md shadow">
      <h1 className="text-2xl font-semibold mb-4">Xác thực email</h1>
      {processing ? (
        <div className="text-sm text-gray-700">Đang xử lý... Vui lòng chờ, bạn sẽ được chuyển hướng vào trang cửa hàng.</div>
      ) : (
        <div className="text-sm text-red-600">{message}</div>
      )}
    </main>
  );
}
