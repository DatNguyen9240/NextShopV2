"use client";
import React, { useState } from 'react';
import { startEnableEmailMfa, verifyEnableEmailMfa, disableEmailMfa } from '../../services/authService';

type MinimalUser = { mfaEnabled?: boolean } | null;

export default function MfaEmailSection({ user, refreshUser, setMessage }: { user: MinimalUser; refreshUser: () => Promise<unknown>; setMessage: (m: string | null) => void }) {
  const [requestId, setRequestId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const start = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await startEnableEmailMfa();
      if (res && res.success && res.data?.requestId) {
        setRequestId(res.data.requestId);
        setMessage('Mã xác nhận đã được gửi tới email của bạn');
      } else {
        setMessage(res?.message || 'Không thể gửi email xác nhận');
      }
    } catch (err: unknown) {
      console.error(err);
      setMessage('Lỗi gửi email xác nhận');
    } finally { setLoading(false); }
  };

  const verify = async () => {
    if (!requestId || code.trim().length === 0) { setMessage('Vui lòng nhập mã'); return; }
    setVerifying(true);
    setMessage(null);
    try {
      const res = await verifyEnableEmailMfa({ requestId, code });
      if (res && res.success) {
        setMessage('Đã bật xác thực 2 lớp');
        setRequestId(null);
        setCode('');
        await refreshUser();
      } else {
        setMessage(res?.message || 'Xác thực thất bại');
      }
    } catch (err: unknown) { console.error(err); setMessage('Xác thực thất bại'); }
    finally { setVerifying(false); }
  };

  const disable = async () => {
    if (!confirm('Bạn có chắc muốn tắt xác thực 2 lớp?')) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await disableEmailMfa();
      if (res && res.success) {
        setMessage('Đã tắt xác thực 2 lớp');
        await refreshUser();
      } else {
        setMessage(res?.message || 'Tắt thất bại');
      }
    } catch { setMessage('Tắt thất bại'); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-4 bg-gray-50 rounded">
      <div className="mb-2 text-sm">Trạng thái: <strong>{user?.mfaEnabled ? 'Đã bật' : 'Chưa bật'}</strong></div>
      {!user?.mfaEnabled ? (
        <div>
          {!requestId ? (
            <button onClick={start} className="bg-green-600 text-white px-3 py-1 rounded" disabled={loading}>{loading ? 'Đang gửi...' : 'Bật xác thực 2 lớp (Email)'} </button>
          ) : (
            <div className="space-y-2">
              <div className="text-sm">Mã đã được gửi đến email của bạn.</div>
              <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="Nhập mã" />
              <div className="flex gap-2">
                <button onClick={verify} className="bg-green-600 text-white px-3 py-1 rounded" disabled={verifying}>{verifying ? 'Đang xác thực...' : 'Xác thực'}</button>
                <button onClick={() => { setRequestId(null); setCode(''); }} className="px-3 py-1 border rounded">Hủy</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <button onClick={disable} className="bg-red-600 text-white px-3 py-1 rounded" disabled={loading}>{loading ? 'Đang xử lý...' : 'Tắt xác thực 2 lớp'}</button>
        </div>
      )}
    </div>
  );
}