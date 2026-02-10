"use client";

import React, { useState } from 'react';
import Button from '@/app/components/Button';
import type { WelcomeSettingsDto } from '@/app/services/couponService';

interface WelcomeSettingsModalProps {
  settings: WelcomeSettingsDto | null;
  onSave: (settings: WelcomeSettingsDto) => void;
  onClose: () => void;
}

export default function WelcomeSettingsModal({ settings, onSave, onClose }: WelcomeSettingsModalProps) {
  const [formData, setFormData] = useState<WelcomeSettingsDto>({
    discountPercent: settings?.discountPercent || 10,
    minOrderAmount: settings?.minOrderAmount || 100000,
    maxDiscountAmount: settings?.maxDiscountAmount || 50000,
    usageLimit: settings?.usageLimit || 1,
    validityMonths: settings?.validityMonths || 1,
    isEnabled: settings?.isEnabled ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof WelcomeSettingsDto, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Cài đặt Welcome Coupon</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phần trăm giảm (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.discountPercent}
                onChange={(e) => handleChange('discountPercent', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đơn hàng tối thiểu (VNĐ)</label>
            <input
              type="number"
              min="0"
              value={formData.minOrderAmount}
              onChange={(e) => handleChange('minOrderAmount', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giảm tối đa (VNĐ)</label>
            <input
              type="number"
              min="0"
              value={formData.maxDiscountAmount}
              onChange={(e) => handleChange('maxDiscountAmount', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số lần sử dụng</label>
            <input
              type="number"
              min="1"
              value={formData.usageLimit}
              onChange={(e) => handleChange('usageLimit', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thời hạn (tháng)</label>
            <input
              type="number"
              min="1"
              max="12"
              value={formData.validityMonths}
              onChange={(e) => handleChange('validityMonths', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isEnabled}
                onChange={(e) => handleChange('isEnabled', e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Bật welcome coupon</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-center">
              Hủy
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-center">
              Lưu
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}