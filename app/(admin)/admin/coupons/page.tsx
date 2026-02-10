"use client";

import React, { useEffect, useState } from 'react';
import Button from '@/app/components/Button';
import { toast } from 'react-hot-toast';
import { getAllCoupons, deleteCoupon, getWelcomeSettings, saveWelcomeSettings, type WelcomeSettingsDto } from '@/app/services/couponService';
import type { CouponDto } from '@/app/services/couponService';
import CouponFormModal from './CouponFormModal';
import WelcomeSettingsModal from './WelcomeSettingsModal';
import ConfirmModal from '@/app/components/ConfirmModal';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<CouponDto | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [confirm, setConfirm] = useState<{ id: string; code?: string } | null>(null);
  const [welcomeSettings, setWelcomeSettings] = useState<WelcomeSettingsDto | null>(null);
  const [showWelcomeSettings, setShowWelcomeSettings] = useState(false);

  useEffect(() => { void load(); void loadWelcomeSettings(); }, []);

  async function load() {
    setLoading(true);
    try {
      const list = await getAllCoupons();
      setCoupons(list ?? []);
    } catch (err: unknown) {
      console.error('[loadCoupons] error', err);
      toast.error('Không thể tải coupons');
    } finally {
      setLoading(false);
    }
  }

  async function loadWelcomeSettings() {
    try {
      const settings = await getWelcomeSettings();
      setWelcomeSettings(settings);
    } catch (err: unknown) {
      console.error('[loadWelcomeSettings] error', err);
    }
  }

  async function handleSaveWelcomeSettings(settings: WelcomeSettingsDto) {
    try {
      const success = await saveWelcomeSettings(settings);
      if (success) {
        setWelcomeSettings(settings);
        toast.success('Cập nhật welcome settings thành công');
        setShowWelcomeSettings(false);
      } else {
        toast.error('Cập nhật thất bại');
      }
    } catch (err: unknown) {
      console.error('[saveWelcomeSettings] error', err);
      toast.error('Cập nhật thất bại');
    }
  }

  async function onDelete(id: string) {
    try {
      await deleteCoupon(id);
      toast.success('Xóa coupon thành công');
      setConfirm(null);
      await load();
    } catch (err: unknown) {
      type ErrWithResp = { response?: { data?: { message?: string } }; message?: string };
      const e = err as ErrWithResp;
      console.error('[deleteCoupon] error', e);
      toast.error(e?.response?.data?.message ?? 'Xóa thất bại');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Coupons</h2>
        <div className="flex items-center gap-3">
          <Button shape="rounded" size="md" onClick={() => setShowWelcomeSettings(true)} className="bg-blue-600 text-white">Welcome Settings</Button>
          <Button shape="rounded" size="md" onClick={() => setShowCreate(true)} className="bg-pink-600 text-white">Tạo coupon</Button>
        </div>
      </div>

      {/* Welcome Settings Section */}
      {welcomeSettings && (
        <div className="bg-white shadow rounded p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Welcome Coupon Settings</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Giảm giá:</span> {welcomeSettings.discountPercent}%
            </div>
            <div>
              <span className="font-medium">Đơn tối thiểu:</span> {welcomeSettings.minOrderAmount?.toLocaleString()}đ
            </div>
            <div>
              <span className="font-medium">Giảm tối đa:</span> {welcomeSettings.maxDiscountAmount?.toLocaleString()}đ
            </div>
            <div>
              <span className="font-medium">Số lần dùng:</span> {welcomeSettings.usageLimit}
            </div>
            <div>
              <span className="font-medium">Thời hạn:</span> {welcomeSettings.validityMonths} tháng
            </div>
            <div>
              <span className="font-medium">Trạng thái:</span> {welcomeSettings.isEnabled ? 'Bật' : 'Tắt'}
            </div>
          </div>
        </div>
      )}

      {loading ? <p>Đang tải...</p> : (
        <div className="bg-white shadow rounded overflow-hidden">
          <table className="w-full table-auto">
            <thead className="text-left text-sm text-gray-500 border-b">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">% Giảm</th>
                <th className="px-4 py-3">Điều kiện</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Usage</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.couponId} className="border-b last:border-b-0">
                  <td className="px-4 py-3 text-sm">{c.code}</td>
                  <td className="px-4 py-3 text-sm">{c.couponType || 'Manual'}</td>
                  <td className="px-4 py-3 text-sm">{c.discountPercent}%</td>
                  <td className="px-4 py-3 text-sm">Min: {c.minOrderAmount ?? '—'} • Max: {c.maxDiscountAmount ?? '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="text-sm">
                      <div>{new Date(c.startDate).toLocaleDateString()}</div>
                      <div className="text-gray-500 text-xs">→ {new Date(c.endDate).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="text-sm">
                      <div>Used: <strong>{c.usedCount ?? 0}</strong></div>
                      <div>Reserved: <strong>{c.reservedCount ?? 0}</strong></div>
                      <div>Limit: <strong>{c.usageLimit ?? '—'}</strong></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{c.isValid ? <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Active</span> : <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">Inactive</span>}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Button shape="roundedSquare" size="md" onClick={() => setEditing(c)} className="bg-gray-100 rounded-none px-4 py-2 text-sm">Sửa</Button>
                      <Button shape="roundedSquare" size="md" onClick={() => setConfirm({ id: c.couponId, code: c.code })} className="bg-red-600 text-white rounded-none px-4 py-2 text-sm">Xóa</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Welcome Settings Modal */}
      {showWelcomeSettings && (
        <WelcomeSettingsModal 
          settings={welcomeSettings} 
          onSave={handleSaveWelcomeSettings} 
          onClose={() => setShowWelcomeSettings(false)} 
        />
      )}

      {showCreate && (
        <CouponFormModal onClose={() => { setShowCreate(false); void load(); }} onSaved={() => { setShowCreate(false); void load(); }} />
      )}

      {editing && (
        <CouponFormModal coupon={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); void load(); }} />
      )}

      {confirm && (
        <ConfirmModal show={true} title={`Xóa coupon ${confirm.code}?`} onConfirm={async () => await onDelete(confirm.id)} onCancel={() => setConfirm(null)} />
      )}
    </div>
  );
}
