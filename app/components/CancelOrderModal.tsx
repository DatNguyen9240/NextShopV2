"use client";

import React, { useState } from 'react';
import ConfirmModal from './ConfirmModal';
import { CANCEL_REASONS } from '../config/cancelReasons';
import { ADMIN_CANCEL_REASONS } from '@/app/config/adminCancelReasons';

interface CancelOrderModalProps {
  show: boolean;
  onConfirm: (reason?: string, adminReason?: string) => void | Promise<void>;
  onCancel: () => void;
  isAdmin?: boolean;
  confirmLoading?: boolean;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({ show, onConfirm, onCancel, isAdmin = false, confirmLoading = false }) => {
  const [cancelReason, setCancelReason] = useState<string>('');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [adminReasonInput, setAdminReasonInput] = useState<string>('');
  const [selectedAdminReason, setSelectedAdminReason] = useState<string>('');
  
  const predefinedReasons = CANCEL_REASONS;
  const predefinedAdminReasons = ADMIN_CANCEL_REASONS;

  const handleConfirm = async () => {
    // If admin is cancelling, we only send adminReason and keep user reason unchanged
    const reason = isAdmin ? undefined : (selectedReason === 'Lý do khác' ? cancelReason : selectedReason);
    const adminReason = selectedAdminReason === 'Lý do khác' ? adminReasonInput : (selectedAdminReason || undefined);
    await onConfirm(reason, adminReason);
    // Reset state
    setCancelReason('');
    setSelectedReason('');
    setSelectedAdminReason('');
    setAdminReasonInput('');
  };

  const handleCancel = () => {
    onCancel();
    // Reset state
    setCancelReason('');
    setSelectedReason('');
    setAdminReasonInput('');
  };

  return (
    <ConfirmModal
      show={show}
      title="Xác nhận hủy đơn"
      message="Bạn có chắc chắn muốn hủy đơn hàng này?"
      confirmText="Hủy đơn"
      cancelText="Không"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}
    >
      <div className="mb-4">
        {!isAdmin && (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lý do hủy</label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            >
              <option value="">Chọn lý do</option>
              {predefinedReasons.map(reason => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
            {selectedReason === 'Lý do khác' && (
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Nhập lý do khác..."
              />
            )}
          </>
        )}

        {isAdmin && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lý do hủy (Admin)</label>
            <select
              value={selectedAdminReason}
              onChange={(e) => setSelectedAdminReason(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            >
              <option value="">Chọn lý do (Admin)</option>
              {predefinedAdminReasons.map(reason => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
            {selectedAdminReason === 'Lý do khác' && (
              <textarea
                value={adminReasonInput}
                onChange={(e) => setAdminReasonInput(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Nhập lý do khác từ admin..."
              />
            )}
          </div>
        )}

      </div>
    </ConfirmModal>
  );
};

export default CancelOrderModal;