"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);

  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const backendBase = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

  useEffect(() => {
    try {
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams('');
      const token = params.get('token');

      // If the email link includes a token, prefer redirecting to configured backend URL
      if (token) {
        const backendBase = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
        if (backendBase) {
          window.location.href = `${backendBase}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
          return;
        }

        // No backend configured: surface a helpful UI so developer/user can retry manually
        setPendingToken(token);
        setStatus('no-backend');
        return;
      }

      setStatus(params.get('status'));
    } catch {
      setStatus(null);
    }
  }, []);

  return (
    <main className="max-w-md mx-auto mt-12 p-6 bg-white rounded-md shadow">
      <h1 className="text-2xl font-semibold mb-4">Xác thực email</h1>
      {status === 'no-backend' && pendingToken ? (
        <div className="text-sm text-gray-700">
          Không tìm thấy cấu hình backend (`NEXT_PUBLIC_API_URL`). Vui lòng đặt biến môi trường này tới URL backend và khởi động lại frontend. Bạn có thể thử gửi yêu cầu xác thực trực tiếp:
          <div className="mt-2 flex gap-2">
            <a href={`/api/auth/verify-email?token=${encodeURIComponent(pendingToken)}`} className="bg-blue-600 text-white px-3 py-2 rounded">Thử xác thực (relative /api)</a>
            {backendBase ? (
              <button
                onClick={() => { navigator.clipboard?.writeText(`${backendBase}/api/auth/verify-email?token=${pendingToken}`); }}
                className="bg-white border px-3 py-2 rounded"
              >Sao chép URL backend</button>
            ) : (
              <button disabled className="bg-gray-100 text-gray-400 border px-3 py-2 rounded" title="Chưa cấu hình NEXT_PUBLIC_API_URL">Sao chép URL backend</button>
            )}
          </div>
        </div>
      ) : status === 'failed' ? (
        <div className="text-sm text-red-600">Xác thực không thành công hoặc liên kết đã hết hạn. Vui lòng đăng nhập và yêu cầu gửi lại email xác thực hoặc liên hệ hỗ trợ.</div>
      ) : status === null ? (
        <div className="text-sm text-gray-700">Vui lòng nhấn nút xác thực trong email mà bạn đã nhận. Nếu bạn đã nhấp vào liên kết, hãy đợi một vài giây để quá trình hoàn tất và bạn sẽ được chuyển hướng.</div>
      ) : (
        <div className="text-sm text-gray-700">Đã có lỗi khi xác thực. Vui lòng kiểm tra email hoặc thử lại.</div>
      )}
      <div className="mt-4 flex gap-2">
        <button onClick={() => router.push('/login')} className="bg-blue-600 text-white px-3 py-2 rounded">Đăng nhập</button>
        <button onClick={() => router.push('/register')} className="bg-white border px-3 py-2 rounded">Đăng ký</button>
      </div>
    </main>
  );
}
