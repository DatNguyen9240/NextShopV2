"use client";

import React from "react";

interface ConfirmModalProps {
  show: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  children?: React.ReactNode;
  confirmLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ show, title = "Xác nhận", message = "Bạn có chắc chắn không?", confirmText = "Xác nhận", cancelText = "Hủy", onConfirm, onCancel, children, confirmLoading = false }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99]">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-sm text-gray-700 mb-4">{message}</p>
        {children}
        <div className="flex justify-end mt-4">
          <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600">{cancelText}</button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmLoading}
            className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ${confirmLoading ? 'opacity-60 pointer-events-none' : ''}`}
          >{confirmLoading ? 'Đang xử lý...' : confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
