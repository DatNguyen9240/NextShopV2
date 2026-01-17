import React, { useState } from 'react';
import Button from '@/app/components/Button';
import { updateInventory } from '@/app/services/inventoryService';
import { toast } from 'react-hot-toast';

const InventoryAdjustModal: React.FC<{
  variantId: string;
  label?: string;
  currentStock?: number;
  onClose: () => void;
  onSuccess?: () => void;
}> = ({ variantId, label, currentStock, onClose, onSuccess }) => {
  // store as string so user can type '-' or partial numbers
  const [changeQty, setChangeQty] = useState<string>('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!variantId) return;
    const qty = Number(changeQty);
    if (isNaN(qty) || qty === 0) {
      toast.error('Vui lòng nhập số lượng khác 0');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { variantId, changeQty: qty, reason: reason ?? '' };
      console.debug('[updateInventory] payload', payload);
      const resp = await updateInventory(payload);
      console.debug('[updateInventory] response', resp);
      toast.success('Cập nhật kho thành công');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('[updateInventory] error', err);
      const serverData = err?.response?.data;
      console.error('[updateInventory] response data', serverData);
      const serverMsg = serverData?.message ?? serverData?.Message ?? serverData?.error ?? serverData?.Error ?? err?.message;
      toast.error(serverMsg ?? 'Cập nhật kho thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 z-60 w-[420px] max-w-full">
        <h3 className="text-lg font-semibold mb-2">Điều chỉnh kho</h3>
        <div className="text-sm text-gray-600 mb-4">{label ?? variantId}</div>
        <div className="mb-3">
          <label className="block text-xs text-gray-600 mb-1">Số lượng thay đổi (dương = cộng, âm = trừ)</label>
          <input value={changeQty} onChange={(e) => setChangeQty(e.target.value)} type="number" inputMode="numeric" className="w-full border rounded px-3 py-2" placeholder="Nhập số (ví dụ: 5 hoặc -3)" />
        </div>
        <div className="mb-3">
          <label className="block text-xs text-gray-600 mb-1">Lý do</label>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Nhập lý do (ví dụ: kiểm kho, hoàn trả)" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button shape="roundedSquare" size="md" onClick={onClose} className="bg-gray-100 rounded-none px-4 py-2 text-sm">Hủy</Button>
          <Button shape="roundedSquare" size="md" onClick={submit} className="bg-blue-600 text-white rounded-none px-4 py-2 text-sm" disabled={submitting}>{submitting ? 'Đang...' : 'Cập nhật'}</Button>
        </div>
      </div>
    </div>
  );
};

export default InventoryAdjustModal;
