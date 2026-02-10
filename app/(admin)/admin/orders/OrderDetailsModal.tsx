import React from 'react';
import Button from '@/app/components/Button';
import MoneyVND from '@/app/components/MoneyVND';
import { OrderDto } from '@/app/services/orderService';

const OrderDetailsModal: React.FC<{ order: OrderDto; onClose: () => void }> = ({ order, onClose }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-[min(900px,95%)] p-6 z-50">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">Chi tiết đơn hàng</h3>
          <Button shape="roundedSquare" size="md" onClick={onClose} className="bg-gray-100 text-gray-800">Đóng</Button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-500">Order ID</div>
            <div className="font-medium">{order.orderId}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Người mua</div>
            <div className="font-medium">{order.buyerName ?? '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Email</div>
            <div className="font-medium">{order.buyerEmail ?? '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Giới tính</div>
            <div className="font-medium">{order.buyerGender ?? '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Đã hủy bởi</div>
            <div className="font-medium">{order.cancelledBy ?? '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Lý do hủy (Người dùng)</div>
            <div className="font-medium">{order.cancelReason ?? '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Lý do hủy (Admin)</div>
            <div className="font-medium">{order.adminCancelReason ?? '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Ngày đặt</div>
            <div className="font-medium">{new Date(order.orderDate).toLocaleString('vi-VN')}</div>
          </div>
          <div className="col-span-2">
            <div className="text-sm text-gray-500">Địa chỉ giao hàng</div>
            <div className="font-medium">{order.shippingAddress ?? '—'}</div>
          </div>
        </div>

        {/* Coupons Section */}
        {order.coupons && order.coupons.length > 0 && (
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-2">Coupons áp dụng</div>
            <div className="space-y-2">
              {order.coupons.map((coupon, index) => (
                <div key={index} className="flex items-center justify-between bg-green-50 p-3 rounded">
                  <div>
                    <div className="font-medium text-green-800">{coupon.code}</div>
                    <div className="text-sm text-green-600">Áp dụng lúc: {coupon.appliedAt ? new Date(coupon.appliedAt).toLocaleString('vi-VN') : 'N/A'}</div>
                  </div>
                  <div className="text-green-800 font-semibold">
                    -<MoneyVND value={coupon.discountAmount} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shipment Section */}
        {order.shipment && (
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-2">Thông tin giao hàng</div>
            <div className="bg-blue-50 p-3 rounded">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-blue-600">Mã shipment</div>
                  <div className="font-medium">{order.shipment.shipmentId}</div>
                </div>
                <div>
                  <div className="text-sm text-blue-600">Nhà vận chuyển</div>
                  <div className="font-medium">{order.shipment.carrier}</div>
                </div>
                <div>
                  <div className="text-sm text-blue-600">Mã tracking</div>
                  <div className="font-medium">{order.shipment.trackingNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-blue-600">Trạng thái</div>
                  <div className="font-medium">{order.shipment.status}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-blue-600">Ngày tạo</div>
                  <div className="font-medium">{new Date(order.shipment.createdAt).toLocaleString('vi-VN')}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="text-sm text-gray-500 mb-2">Sản phẩm</div>
          <div className="space-y-3">
            {order.items?.map(item => {
              const v = item.variant ?? null;
              // try parse variantOptionsJson if present (supports attributes map)
              let opts: Record<string, unknown> | null = null;
              try {
                if (item.variantOptionsJson) opts = JSON.parse(item.variantOptionsJson as string) as Record<string, unknown>;
              } catch {
                opts = null;
              }
              // Merge attributes from variant and variantOptionsJson (opts). opts attributes take precedence.
              const attrsFromOpts = opts && opts['attributes'] ? (opts['attributes'] as Record<string, unknown>) : {};
              let attrsFromVariant: Record<string, unknown> = {};
              if (v && typeof v === 'object') {
                const maybeAttrs = (v as { attributes?: unknown }).attributes;
                if (maybeAttrs && typeof maybeAttrs === 'object' && !Array.isArray(maybeAttrs)) {
                  attrsFromVariant = maybeAttrs as Record<string, unknown>;
                }
              }
              const attrs = { ...attrsFromVariant, ...attrsFromOpts };
              const imageUrl = v?.imageUrl ?? (opts ? (opts['imageUrl'] as string | undefined) : undefined) ?? (v?.imgHover ?? null) ?? null;
              const sku = item.variantSku ?? item.productSku ?? v?.sku ?? null;

              // Build attribute pairs to display (preserve keys as-is)
              const attrPairs: string[] = [];
              if (attrs) {
                for (const k in attrs) {
                  const val = attrs[k];
                  if (val !== undefined && val !== null && String(val).trim() !== '') {
                    attrPairs.push(`${k}: ${String(val)}`);
                  }
                }
              }

              return (
                <div key={item.orderItemId} className="grid grid-cols-1 sm:grid-cols-[64px_1fr_160px] gap-4 items-start border-b pb-3">
                  <div className="w-16 h-16 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt={item.productName ?? ''} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-sm text-gray-400">No image</div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div>
                      <div className="font-medium text-sm">{item.productName}</div>
                      <div className="text-xs text-gray-500 mt-1">SKU: <span className="text-gray-700">{sku ?? '—'}</span></div>
                      <div className="text-xs text-gray-500">Variant ID: <span className="text-gray-700">{v?.productVariantId ?? item.variantId ?? '—'}</span></div>
                      {attrPairs.length > 0 && <div className="text-xs text-gray-500 mt-1">{attrPairs.join(' • ')}</div>}

                    <div className="flex items-center gap-6 mt-2">
                        <div className="text-sm text-gray-500">Số lượng: {item.quantity}</div>
                        <div className="text-sm text-gray-500">Đơn giá: <MoneyVND value={item.unitPrice} /></div>
                        {item.discountAmount && item.discountAmount > 0 && (
                          <div className="text-sm text-red-600">Giảm: <MoneyVND value={item.discountAmount} /></div>
                        )}
                        {item.taxRate && item.taxRate > 0 && (
                          <div className="text-sm text-blue-600">Thuế ({(item.taxRate * 100).toFixed(1)}%): <MoneyVND value={item.taxAmount || 0} /></div>
                        )}
                      </div>
                    </div>

                    <div className="mt-2">
                      <a href={`/product/${item.productId}`} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline">Xem sản phẩm</a>
                    </div>
                  </div>

                  <div className="text-sm font-medium text-right">
                    <div className="text-xs text-gray-500">{item.quantity} x <MoneyVND value={item.unitPrice} /></div>
                    <div className="mt-1 text-xs text-gray-500">Thành tiền</div>
                    <div className="text-lg font-semibold"><MoneyVND value={item.quantity * item.unitPrice} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 border-t pt-4">
          <div className="max-w-xs ml-auto space-y-2 text-right">
            <div className="flex justify-between text-sm text-gray-500">
              <div>Tạm tính (trước thuế)</div>
              <div><MoneyVND value={order.subTotal ?? 0} /></div>
            </div>
            <div className="flex justify-between text-sm text-red-600">
              <div>Giảm giá từ coupons</div>
              <div>-<MoneyVND value={order.discountAmount ?? 0} /></div>
            </div>
            <div className="flex justify-between text-sm text-blue-600">
              <div>Thuế VAT</div>
              <div><MoneyVND value={order.taxAmount ?? 0} /></div>
            </div>
            <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <div>Tổng cộng</div>
              <div><MoneyVND value={order.totalAmount} /></div>
            </div>
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