"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from 'next/link';
import Button from "@/app/components/Button";
import MoneyVND from "@/app/components/MoneyVND";
import axiosClient from "@/app/lib/axiosClient";
import axios from 'axios';

interface PaymentStatus {
  status: string;
  orderId: string;
  providerData: string;
}

interface OrderItem {
  orderItemId: string;
  variantId: string;
  productId?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName?: string | null;
  variant?: {
    sku?: string | null;
    color?: string | null;
    size?: string | null;
    imageUrl?: string | null;
    attributesDisplay?: string;
    attributes?: Record<string, string> | null;
  } | null;
}

interface Order {
  orderId: string;
  status: string;
  totalAmount: number;
  buyerName?: string | null;
  buyerPhone?: string | null;
  shippingAddress?: string | null;
  items: OrderItem[];
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [confettiPlayed, setConfettiPlayed] = useState(false);

  const fetchPaymentStatus = async (id: string) => {
    try {
      const res = await axiosClient.get(`/api/payments/status/${id}`);
      const payload = res.data?.data ?? res.data ?? null;
      if (payload) {
        const data: PaymentStatus = payload;
        setPaymentStatus(data);
        return (data.status ?? '').toLowerCase();
      }
    } catch (error) {
      console.error("Failed to fetch payment status:", error);
    } finally {
      setLoading(false);
    }
    return null;
  };

  const fetchOrderDetails = async (id: string) => {
    try {
      const res = await axiosClient.get(`/api/orders/${id}`);
      // ResponseHelper wraps data in `data` property sometimes
      const payload = res.data?.data ?? res.data?.Data ?? res.data;
      if (payload) {
        setOrder({
          orderId: payload.orderId ?? payload.OrderId,
          status: payload.status ?? payload.Status,
          totalAmount: payload.totalAmount ?? payload.TotalAmount ?? 0,
          buyerName: payload.buyerName ?? payload.BuyerName ?? null,
          buyerPhone: payload.buyerPhone ?? payload.BuyerPhone ?? null,
          shippingAddress: payload.shippingAddress ?? payload.ShippingAddress ?? null,
          items: (payload.items ?? payload.Items ?? []).map((it: Record<string, unknown>) => ({
            orderItemId: (it.orderItemId ?? it.OrderItemId) as string,
            variantId: (it.variantId ?? it.VariantId) as string,
            productId: (it.productId ?? it.ProductId ?? null) as string | null,
            quantity: (it.quantity ?? it.Quantity) as number,
            unitPrice: (it.unitPrice ?? it.UnitPrice) as number,
            totalPrice: ((it.quantity ?? it.Quantity) as number) * ((it.unitPrice ?? it.UnitPrice) as number),
            productName: (it.productName ?? it.ProductName ?? (((it.variant as Record<string, unknown>)?.product as Record<string, unknown>)?.name) ?? null) as string | null,
            variant: (() => {
              const nested = (it.variant ?? it.Variant) as Record<string, unknown> | null;

              // sku from nested variant (live variant SKU)
              const sku = nested && typeof nested['sku'] === 'string' && String(nested['sku']).trim() !== '' ? String(nested['sku']) : null;

              // attributes may come from nested.attributes (preferred) or fallback to variantOptionsJson (old snapshot)
              let rawAttrs: Record<string, unknown> | null = null;
              if (nested && nested['attributes'] && typeof nested['attributes'] === 'object') rawAttrs = nested['attributes'] as Record<string, unknown>;

              if (!rawAttrs) {
                try {
                  const vo = it.variantOptionsJson ?? ((it.variant as Record<string, unknown>)?.variantOptionsJson ?? null);
                  if (typeof vo === 'string') {
                    const parsed = JSON.parse(vo as string) as Record<string, unknown>;
                    if (parsed && parsed['attributes'] && typeof parsed['attributes'] === 'object') rawAttrs = parsed['attributes'] as Record<string, unknown>;
                  }
                } catch {
                  rawAttrs = null;
                }
              }

              // sanitize attributes: remove image/url keys
              let attrs: Record<string, string> | null = null;
              if (rawAttrs) {
                attrs = {};
                for (const k of Object.keys(rawAttrs)) {
                  const lk = k.toLowerCase();
                  if (lk === 'imageurl' || lk === 'image' || lk === 'url') continue;
                  const v = rawAttrs[k];
                  if (v !== undefined && v !== null && String(v).trim() !== '') attrs[k] = String(v);
                }
                if (Object.keys(attrs).length === 0) attrs = null;
              }

              // build display string
              const attributesDisplay = attrs ? Object.keys(attrs).map(k => `${k}: ${attrs![k]}`).join(' • ') : '';

              const color = attrs ? ((attrs['Color'] as string | undefined) ?? (attrs['color'] as string | undefined) ?? null) : null;
              const size = attrs ? ((attrs['Size'] as string | undefined) ?? (attrs['size'] as string | undefined) ?? null) : null;

              const imageUrl = (nested && typeof nested['imageUrl'] === 'string' && String(nested['imageUrl']).trim() !== '') ? String(nested['imageUrl']) : null;

              return { sku, color, size, imageUrl, attributesDisplay, attributes: attrs };
            })()
          }))
        });
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setAuthRequired(true);
      } else {
        console.error("Failed to fetch order details:", err);
      }
    } finally {
      setOrderLoading(false);
    }
  };

  // Add handler to re-add order items to cart (Mua lại)
  const handleBuyAgain = async () => {
    if (!order || !order.items || order.items.length === 0) return;
    setReordering(true);
    try {
      const { addToCart } = await import('@/app/services/cartService');
      // Add items in parallel, skipping invalid entries
      await Promise.all(order.items.map(it => {
        if (!it.variantId || !it.quantity) return Promise.resolve(null);
        return addToCart({ variantId: it.variantId, quantity: it.quantity });
      }));
      // Navigate user to cart page where they can review and checkout
      router.push('/cart');
    } catch (err: unknown) {
      // If unauthenticated, send user to login
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        router.push('/login');
      } else {
        console.error('Failed to add items to cart for reorder', err);
        // show a simple fallback alert for now
        alert('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
      }
    } finally {
      setReordering(false);
    }
  };

  // Move this before any early returns to keep hook order stable
  const isPaid = paymentStatus?.status === "Paid" || (paymentStatus?.status ?? "").toLowerCase() === "paid";

  // Lightweight confetti animation (launches from bottom center)
  const triggerConfetti = () => {
    if (typeof window === 'undefined') return;
    const colors = ['#EF476F','#FFD166','#06D6A0','#118AB2','#073B4C','#FF9F1C'];
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'visible';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    document.body.appendChild(container);

    const count = 60;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      const size = Math.random() * 8 + 6;
      const startX = window.innerWidth * (0.5 + (Math.random() - 0.5) * 0.6);
      const startY = window.innerHeight * 0.995;
      el.style.position = 'absolute';
      el.style.left = `${startX}px`;
      el.style.top = `${startY}px`;
      el.style.width = `${size}px`;
      el.style.height = `${Math.round(size * 0.6)}px`;
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.opacity = '1';
      el.style.transform = `translateY(0) rotate(${Math.random() * 360}deg)`;
      el.style.borderRadius = '2px';
      el.style.transition = `transform 1200ms cubic-bezier(.2,.8,.2,1), opacity 1200ms ease`;
      container.appendChild(el);

      setTimeout(() => {
        const distance = window.innerHeight * (0.6 + Math.random() * 0.35);
        const endX = (Math.random() - 0.5) * 600;
        const rot = Math.random() * 720 - 360;
        el.style.transform = `translate(${endX}px, -${distance}px) rotate(${rot}deg)`;
        el.style.opacity = '0';
      }, Math.random() * 200 + 50);
    }

    setTimeout(() => {
      container.remove();
    }, 2000);
  };

  // If paid, ensure the UI cart is cleared and notify header to refresh count
  useEffect(() => {
    if (!isPaid) return;
    // play confetti only once
    if (!confettiPlayed) {
      try {
        triggerConfetti();
      } catch {
        // non-fatal
      }
      setConfettiPlayed(true);
    }

    const clearAndNotify = async () => {
      try {
        const { clearCart } = await import('@/app/services/cartService');
        await clearCart();
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('cart:updated'));
      } catch (err) {
        console.error('Failed to clear cart after payment success', err);
      }
    };
    void clearAndNotify();
    return undefined; 
  }, [isPaid, confettiPlayed]);

  useEffect(() => {
    const id = searchParams.get("orderId");
    if (id) {
      setOrderId(id);
      fetchPaymentStatus(id);
      fetchOrderDetails(id);
    } else {
      setLoading(false);
      setOrderLoading(false);
    }
  }, [searchParams]);

  if (loading || orderLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra trạng thái thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] p-8 text-center">
        <div className="mb-6">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${isPaid ? 'bg-green-100' : 'bg-yellow-100'}`}>
            {isPaid ? (
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${isPaid ? 'text-gray-900' : 'text-yellow-900'}`}>
            {isPaid ? "Thanh toán thành công!" : "Thanh toán đang chờ"}
          </h1>
          <p className="text-gray-600">
            {isPaid ? "Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận." : "Thanh toán của bạn đang được xử lý. Vui lòng chờ hoặc kiểm tra lại sau."}
          </p>
        </div>

        {orderId && (
          <div className="mb-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div className="text-sm text-gray-500">Mã đơn hàng</div>
                  <div className="font-mono font-bold text-base text-gray-900 sm:ml-2">{orderId}</div>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
                  <div>Khách hàng: <span className="font-medium text-gray-800">{order?.buyerName ?? '—'}</span></div>
                  <div>Điện thoại: <span className="font-medium text-gray-800">{order?.buyerPhone ?? '—'}</span></div>
                  <div>Địa chỉ giao hàng: <span className="font-medium text-gray-800">{order?.shippingAddress ?? '—'}</span></div>
                </div>
              </div>

              {order && (
                <div className="border-t">
                  <div className="bg-gray-50 px-4 py-3 font-semibold">Sản phẩm</div>

                  <div className="divide-y">
                    {order.items.map(item => (
                      <div key={item.orderItemId} className="p-4 grid grid-cols-12 items-center gap-4">
                        <div className="col-span-2">
                          {item.variant?.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.variant.imageUrl} alt="" className="w-20 h-20 object-cover rounded-lg" />
                          ) : (
                            <div className="w-20 h-20 bg-gray-100 rounded-lg" />
                          )}
                        </div>

                        <div className="col-span-7">
                          <div className="font-medium text-gray-800">
                            {item.productId ? (
                              <Link href={`/product/${item.productId}`} className="hover:underline">{item.productName ?? 'Sản phẩm'}</Link>
                            ) : (
                              item.productName ?? 'Sản phẩm'
                            )}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{item.variant?.attributesDisplay ? item.variant.attributesDisplay : (item.variant?.color ? (`${item.variant.color}${item.variant.size ? ` · ${item.variant.size}` : ''}`) : (item.variant?.size ?? ''))}</div>
                          {item.variant?.sku && <div className="text-xs text-gray-400 mt-1">SKU: {item.variant.sku}</div>}
                        </div>

                        <div className="col-span-3 text-right">
                          <div className="text-sm text-gray-600">{item.quantity} x</div>
                          <div className="font-semibold text-gray-900"><MoneyVND value={item.unitPrice} /></div>
                          <div className="text-sm text-gray-600 mt-1">Thành tiền: <span className="font-medium text-gray-900"><MoneyVND value={item.totalPrice} /></span></div>
                        </div>
                      </div>
                    ))}

                    <div className="p-5 flex items-center justify-between border-t">
                      <div className="text-sm text-gray-700">Tổng</div>
                      <div className="text-2xl font-extrabold text-pink-600"><MoneyVND value={order.totalAmount} /></div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {authRequired && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-left">
                <p className="text-sm">Vui lòng <button onClick={() => router.push('/login')} className="text-blue-600 underline">đăng nhập</button> để xem chi tiết đơn hàng.</p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/")}
            className="w-full rounded-full px-7 py-3 text-base font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200"
          >
            🛒 Tiếp tục mua sắm
          </Button>

          {order && order.items && order.items.length > 0 && (
            <Button
              onClick={handleBuyAgain}
              disabled={reordering}
              className={`w-full rounded-full px-7 py-3 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-200 ${reordering ? 'opacity-75 cursor-wait' : ''}`}
            >
              {reordering ? 'Đang thêm vào giỏ…' : '🔁 Mua lại'}
            </Button>
          )}

          <Button
            onClick={() => router.push("/account/orders")}
            className="w-full rounded-full px-7 py-3 text-base font-semibold bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-pink-200"
          >
            📄 Xem đơn hàng
          </Button>
        </div>
      </div>
    </div>
  );
}