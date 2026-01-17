import React from 'react';
import Button from '@/app/components/Button';
import { InventoryTransactionDto } from '@/app/services/inventoryService';

const InventoryHistoryModal: React.FC<{ transactions: InventoryTransactionDto[]; onClose: () => void; }> = ({ transactions, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 z-60 w-[640px] max-w-full">
        <h3 className="text-lg font-semibold mb-4">Lịch sử kho</h3>
        <div className="space-y-3 max-h-[420px] overflow-auto">
          {transactions.length ? transactions.map(t => (
            <div key={t.transactionId} className="flex items-start justify-between border-b pb-2">
              <div>
                <div className="text-sm font-medium">{t.changeQty > 0 ? `+${t.changeQty}` : t.changeQty}</div>
                <div className="text-xs text-gray-500">{t.reason ?? '—'} • {t.createdBy ?? '—'}</div>
              </div>
              <div className="text-sm text-gray-500">{new Date(t.createdAt).toLocaleString('vi-VN')}</div>
            </div>
          )) : (
            <div className="text-sm text-gray-500">Chưa có giao dịch kho nào.</div>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <Button shape="roundedSquare" size="md" onClick={onClose} className="bg-gray-100 rounded-none px-4 py-2 text-sm">Đóng</Button>
        </div>
      </div>
    </div>
  );
};

export default InventoryHistoryModal;
