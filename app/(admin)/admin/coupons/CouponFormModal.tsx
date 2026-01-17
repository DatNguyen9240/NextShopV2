"use client";

import React, { useEffect, useState } from 'react';
import Button from '@/app/components/Button';
import { toast } from 'react-hot-toast';
import type { CouponDto } from '@/app/services/couponService';
import { createCoupon, updateCoupon } from '@/app/services/couponService';

type Props = {
  coupon?: CouponDto | null;
  onClose: () => void;
  onSaved?: (c: CouponDto) => void;
};

export default function CouponFormModal({ coupon, onClose, onSaved }: Props) {
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number | ''>('');
  const [minOrderAmount, setMinOrderAmount] = useState<number | ''>('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [usageLimit, setUsageLimit] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!coupon) return;
    setCode(coupon.code ?? '');
    setDiscountPercent(coupon.discountPercent ?? '');
    setMinOrderAmount(coupon.minOrderAmount ?? '');
    setMaxDiscountAmount(coupon.maxDiscountAmount ?? '');
    setStartDate(coupon.startDate ? coupon.startDate.split('T')[0] : '');
    setEndDate(coupon.endDate ? coupon.endDate.split('T')[0] : '');
    setUsageLimit(coupon.usageLimit ?? '');
    setIsActive(coupon.isValid ?? true);
  }, [coupon]);

  const submit = async () => {
    if (!code || !discountPercent || !startDate || !endDate) {
      toast.error('Vui lòng điền mã, % giảm và ngày bắt đầu/kết thúc');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error('EndDate phải lớn hơn StartDate');
      return;
    }
    setSaving(true);
    try {
      if (coupon) {
        const updated = await updateCoupon(coupon.couponId, {
          code,
          discountPercent: Number(discountPercent),
          minOrderAmount: minOrderAmount === '' ? undefined : Number(minOrderAmount),
          maxDiscountAmount: maxDiscountAmount === '' ? undefined : Number(maxDiscountAmount),
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          usageLimit: usageLimit === '' ? undefined : Number(usageLimit),
          isActive,
        });
        toast.success('Cập nhật coupon thành công');
        if (onSaved) onSaved(updated);
      } else {
        const created = await createCoupon({
          code,
          discountPercent: Number(discountPercent),
          minOrderAmount: minOrderAmount === '' ? undefined : Number(minOrderAmount),
          maxDiscountAmount: maxDiscountAmount === '' ? undefined : Number(maxDiscountAmount),
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          usageLimit: usageLimit === '' ? undefined : Number(usageLimit),
          isActive,
        });
        toast.success('Tạo coupon thành công');
        if (onSaved) onSaved(created);
      }
      onClose();
    } catch (err: unknown) {
      type ErrWithResp = { response?: { data?: { message?: string } }; message?: string };
      const e = err as ErrWithResp;
      console.error('[CouponForm] error', e);
      const msg = e?.response?.data?.message ?? e?.message ?? 'Lỗi khi lưu coupon';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 z-60 w-[560px] max-w-full">
        <h3 className="text-lg font-semibold mb-4">{coupon ? 'Cập nhật coupon' : 'Tạo coupon'}</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Mã</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">% Giảm</label>
            <input value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value === '' ? '' : Number(e.target.value))} type="number" className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Min Order</label>
            <input value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value === '' ? '' : Number(e.target.value))} type="number" className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Max Discount</label>
            <input value={maxDiscountAmount} onChange={(e) => setMaxDiscountAmount(e.target.value === '' ? '' : Number(e.target.value))} type="number" className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Start Date</label>
            <input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">End Date</label>
            <input value={endDate} onChange={(e) => setEndDate(e.target.value)} type="date" className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Usage Limit</label>
            <input value={usageLimit} onChange={(e) => setUsageLimit(e.target.value === '' ? '' : Number(e.target.value))} type="number" className="w-full border rounded px-3 py-2" />
          </div>

          <div className="flex items-center gap-2 mt-5">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} id="active" />
            <label htmlFor="active" className="text-sm">Active</label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button shape="roundedSquare" size="md" onClick={onClose} className="bg-gray-100 rounded-none px-4 py-2 text-sm">Hủy</Button>
          <Button shape="roundedSquare" size="md" onClick={submit} className="bg-blue-600 text-white rounded-none px-4 py-2 text-sm" disabled={saving}>{saving ? 'Đang...' : coupon ? 'Cập nhật' : 'Tạo'}</Button>
        </div>
      </div>
    </div>
  );
}
