import React from 'react';
import Button from '@/app/components/Button';
import MoneyVND from '@/app/components/MoneyVND';
import { OrderDto } from '@/app/services/orderService';

function fmt(v: any, empty = '—') {
  if (v === null || v === undefined) return empty;
  if (typeof v === 'string' && v.trim() === '') return empty;
  return v;
}

function fmtDate(v: any) {
  if (!v) return '—';
  try {
    return new Date(v).toLocaleString('vi-VN');
  } catch { return '—'; }
}

const OrderDetailsModal: React.FC<{ order: OrderDto; onClose: () => void }> = ({ order, onClose }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-[min(820px,95%)] p-6 z-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Chi tiết đơn</h3>
          <Button shape="roundedSquare" size="md" onClick={onClose} className="bg-gray-100 text-gray-800">Đóng</Button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
          <div>
            <div className="text-xs text-gray-500">Mã đơn</div>
            <div className="font-medium">{fmt(order.orderId)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Ngày</div>
            <div className="font-medium">{fmtDate(order.orderDate)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Người mua</div>
            <div className="font-medium">{fmt(order.buyerName)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Email</div>
            <div className="font-medium">{fmt(order.buyerEmail)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Điện thoại</div>
            <div className="font-medium">{fmt(order.buyerPhone)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Giới tính</div>
            <div className="font-medium">{fmt(order.buyerGender)}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-gray-500">Địa chỉ giao</div>
            <div className="font-medium">{fmt(order.shippingAddress)}</div>
          </div>
        </div>

        {/* Coupons summary */}
        {order.coupons && order.coupons.length > 0 && (
          <div className="mb-3 text-sm">
            <div className="text-xs text-gray-500">Coupons</div>
            <div className="flex gap-2 mt-2">
              {order.coupons.map((c, i) => (
                <div key={i} className="px-3 py-2 bg-green-50 rounded text-sm flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-green-800">{fmt(c.code)}</div>
                    <div className="text-xs text-green-600">{c.appliedAt ? fmtDate(c.appliedAt) : 'Chưa áp dụng'}</div>
                  </div>
                  <div className="text-green-800 font-semibold">-<MoneyVND value={c.discountAmount} /></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shipment small */}
        {order.shipment && (
          <div className="mb-3 text-sm">
            <div className="text-xs text-gray-500">Giao hàng</div>
            <div className="flex items-center gap-6 mt-2">
              <div className="font-medium">{fmt(order.shipment.carrier)}</div>
              <div className="text-xs text-gray-500">{fmt(order.shipment.trackingNumber, '—')}</div>
              <div className="text-xs text-blue-600">{fmt(order.shipment.status)}</div>
            </div>
          </div>
        )}

        <div className="text-sm mb-3">
          <div className="text-xs text-gray-500 mb-2">Sản phẩm</div>
          <div className="space-y-2">
            {order.items?.map(item => {
              const v = item.variant ?? null;
              let opts: Record<string, unknown> | null = null;
              try { if (item.variantOptionsJson) opts = JSON.parse(item.variantOptionsJson as string) as Record<string, unknown>; } catch {}
              const attrsFromOpts = opts && opts['attributes'] ? (opts['attributes'] as Record<string, unknown>) : {};
              let attrsFromVariant: Record<string, unknown> = {};
              if (v && typeof v === 'object') {
                const maybeAttrs = (v as { attributes?: unknown }).attributes;
                if (maybeAttrs && typeof maybeAttrs === 'object' && !Array.isArray(maybeAttrs)) attrsFromVariant = maybeAttrs as Record<string, unknown>;
              }
              const attrs = { ...attrsFromVariant, ...attrsFromOpts };
              const imageUrl = v?.imageUrl ?? (opts ? (opts['imageUrl'] as string | undefined) : undefined) ?? (v?.imgHover ?? null) ?? null;
              const sku = item.variantSku ?? item.productSku ?? v?.sku ?? null;
              const attrPairs: string[] = [];
              if (attrs) for (const k in attrs) { const val = attrs[k]; if (val !== undefined && val !== null && String(val).trim() !== '') attrPairs.push(`${k}: ${String(val)}`); }

              return (
                <div key={item.orderItemId} className="flex items-center gap-3 border-b pb-3">
                  <div className="w-14 h-14 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                    {imageUrl ? <img src={imageUrl} alt={item.productName ?? ''} className="w-full h-full object-cover" /> : <div className="text-xs text-gray-400">No image</div>}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-xs text-gray-500">{sku ?? '—'} • {attrPairs.join(' • ')}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.quantity} x <MoneyVND value={item.unitPrice} /> = <strong><MoneyVND value={item.totalAmount ?? item.quantity * item.unitPrice} /></strong></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 border-t pt-3">
          <div className="max-w-xs ml-auto space-y-2 text-right text-sm">
            <div className="flex justify-between text-gray-500"><div>Tạm tính</div><div><MoneyVND value={order.subTotal ?? 0} /></div></div>
            <div className="flex justify-between text-red-600"><div>Giảm</div><div>-<MoneyVND value={order.discountAmount ?? 0} /></div></div>
            <div className="flex justify-between text-blue-600"><div>Thuế</div><div><MoneyVND value={order.taxAmount ?? 0} /></div></div>
            <div className="flex justify-between text-lg font-semibold border-t pt-2"><div>Tổng</div><div><MoneyVND value={order.totalAmount} /></div></div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-3">
            <Button shape="roundedSquare" size="md" onClick={onClose} className="bg-blue-600 text-white">Đóng</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;