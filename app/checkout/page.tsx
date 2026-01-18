"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/Button";
import { toast } from 'react-hot-toast';
import MoneyVND from "@/app/components/MoneyVND";
import { getCart } from "@/app/services/cartService";
import { createOrder, type CreateOrderRequest } from '@/app/services/orderService';
import { useAuth } from "@/app/providers/AuthProvider";
import type { CartDto } from "@/app/types/cart";

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    async function loadCart() {
      try {
        const c = await getCart();
        setCart(c);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCart();
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Pre-fill user info
    if (user) {
      const defaultAddress = user.addresses?.find(addr => addr.isDefault);
      if (defaultAddress) {
        setShippingAddress(defaultAddress.fullAddress);
      }
    }
  }, [user]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalOrderId, setModalOrderId] = useState<string | null>(null);

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<null | { couponId: string; code: string }>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [finalAmount, setFinalAmount] = useState<number | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (!cart || !shippingAddress) {
      toast.error("Vui lòng cập nhật địa chỉ giao hàng mặc định trong hồ sơ");
      return;
    }
    if (!user?.phone) {
      toast.error("Vui lòng cập nhật số điện thoại trong hồ sơ");
      return;
    }

    try {
      // Create order request from cart
      const orderRequest: CreateOrderRequest = {
        items: cart.items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity
        })),
        paymentMethod: paymentMethod,
        shippingAddress: undefined, // BE will use from profile
        buyerName: undefined, // BE will use from profile
        buyerPhone: undefined // BE will use from profile
      };

      // attach coupon if applied
      if (appliedCoupon) {
        orderRequest.couponIds = [appliedCoupon.couponId];
      }

      const order = await createOrder(orderRequest);
      console.log('Created order:', order);
      const createdId = order?.orderId || order?.OrderId;

      if (paymentMethod === "ONLINE") {
        // Open payment modal instead of redirect
        setModalOrderId(createdId);
        setShowPaymentModal(true);
      } else {
        // COD - backend clears the cart; notify UI to refresh header/cart and clear local cart state
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('cart:updated'));
        setCart(null);
        toast.success("Đặt hàng thành công! Thanh toán khi nhận hàng.");
        router.push('/');
      }
    } catch (e) {
      console.error(e);
      toast.error("Lỗi đặt hàng");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Vui lòng đăng nhập để tiếp tục</div>;
  }

  if (!cart || cart.items.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">Giỏ hàng trống</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.variantId} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {item.variantInfo?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.variantInfo.imageUrl} alt={item.variantInfo.productName ?? 'Sản phẩm'} className="w-20 h-20 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded" />
                    )}

                    <div>
                      <p className="font-medium">{item.variantInfo?.productName ?? 'Unknown Product'}</p>
                      <p className="text-sm text-gray-600">{item.variantInfo?.color ?? ''}{item.variantInfo?.color && item.variantInfo?.size ? ` · ${item.variantInfo.size}` : item.variantInfo?.size ? item.variantInfo.size : ''}</p>
                      <p className="text-sm text-gray-500">SKU: {item.variantInfo?.sku ?? '—'}</p>
                      <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div><MoneyVND value={item.totalPrice} /></div>
                    <div className="text-sm text-gray-600">({item.unitPrice} x {item.quantity})</div>
                  </div>
                </div>
              ))}
            </div>
            <hr className="my-4" />

            {/* Coupon input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mã giảm giá</label>
              <div className="flex gap-2">
                <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Nhập mã giảm giá" className="flex-1 border rounded px-3 py-2" />
                <button
                  type="button"
                  onClick={async () => {
                    if (!couponCode || !cart) return toast.error('Nhập mã giảm giá');
                    setCouponLoading(true);
                    setCouponError(null);
                    try {
                      const { getCouponByCode, calculateDiscount } = await import('@/app/services/couponService');
                      const coupon = await getCouponByCode(couponCode.trim());
                      if (!coupon) {
                        setCouponError('Mã không tồn tại');
                        toast.error('Mã không tồn tại');
                        setCouponLoading(false);
                        return;
                      }

                      const isValid = coupon.isValid ?? true;
                      if (!isValid) {
                        setCouponError('Mã không hợp lệ hoặc đã hết hạn');
                        toast.error('Mã không hợp lệ hoặc đã hết hạn');
                        setCouponLoading(false);
                        return;
                      }

                      const calc = await calculateDiscount(coupon.code, cart.totalAmount);
                      const discountVal = Number(calc?.discountAmount ?? calc?.DiscountAmount ?? 0);
                      const finalVal = Number(calc?.finalAmount ?? calc?.FinalAmount ?? (cart.totalAmount - discountVal));

                      if (!calc || discountVal <= 0) {
                        setCouponError('Mã không áp dụng được cho đơn hàng này');
                        toast.error('Mã không áp dụng được cho đơn hàng này');
                        setCouponLoading(false);
                        return;
                      }

                      setAppliedCoupon({ couponId: coupon.couponId, code: coupon.code });
                      setDiscountAmount(discountVal);
                      setFinalAmount(finalVal);
                      toast.success('Áp mã thành công');
                    } catch (err: unknown) {
                      type ErrWithResp = { response?: { data?: { message?: string; Message?: string } }; message?: string };
                      const e = err as ErrWithResp;
                      console.error('[applyCoupon] error', e);
                      const serverMsg = e?.response?.data?.message || e?.response?.data?.Message || e?.message || 'Lỗi khi áp mã';
                      setCouponError(String(serverMsg));
                      toast.error(String(serverMsg));
                    } finally {
                      setCouponLoading(false);
                    }
                  }}
                  className="px-4 py-2 bg-gray-100 border rounded"
                  disabled={couponLoading}
                >Áp mã</button>
                {appliedCoupon && (
                  <button type="button" onClick={() => { setAppliedCoupon(null); setCouponCode(''); setDiscountAmount(0); setFinalAmount(null); toast('Đã bỏ mã'); }} className="px-3 py-2 border rounded">Bỏ</button>
                )}
              </div>
              {couponError && <div className="text-xs text-red-500 mt-1">{couponError}</div>}
            </div>

            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Tổng cộng:</span>
              <MoneyVND value={cart.totalAmount} color="text-pink-600" />
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-md text-gray-700">
                <span>Giảm:</span>
                <MoneyVND value={discountAmount} />
              </div>
            )}
            {finalAmount != null && (
              <div className="flex justify-between items-center text-lg font-semibold mt-2">
                <span>Thành tiền:</span>
                <MoneyVND value={finalAmount} color="text-pink-600" />
              </div>
            )}
          </div>

          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>

            {/* User Info */}
            {user && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Thông tin khách hàng</h3>
                <p><strong>Tên:</strong> {user.fullName || 'Chưa cập nhật'}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Số điện thoại:</strong> {user.phone || <span className="text-red-500">Chưa cập nhật - <a href="/account/settings" className="text-blue-500 underline">Cập nhật ngay</a></span>}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng</label>
                {shippingAddress ? (
                  <div className="p-3 border rounded bg-gray-50">
                    {shippingAddress}
                  </div>
                ) : (
                  <div className="p-3 border rounded bg-red-50 text-red-600">
                    Chưa có địa chỉ mặc định. <a href="/account/settings" className="text-blue-500 underline">Cập nhật ngay</a>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phương thức thanh toán
                </label>

                <div role="radiogroup" aria-label="Phương thức thanh toán" className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ONLINE')}
                    aria-pressed={paymentMethod === 'ONLINE'}
                    className={`flex items-center gap-3 flex-1 px-4 py-2 border rounded-md transition-colors ${paymentMethod === 'ONLINE' ? 'border-pink-600 bg-pink-50' : 'border-gray-300 bg-white'}`}
                  >
                    <span className={`w-3 h-3 rounded-full inline-block ${paymentMethod === 'ONLINE' ? 'bg-pink-600' : 'border border-gray-300'}`} />
                    <span className="text-sm">Thanh toán online</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    aria-pressed={paymentMethod === 'COD'}
                    className={`flex items-center gap-3 flex-1 px-4 py-2 border rounded-md transition-colors ${paymentMethod === 'COD' ? 'border-pink-600 bg-pink-50' : 'border-gray-300 bg-white'}`}
                  >
                    <span className={`w-3 h-3 rounded-full inline-block ${paymentMethod === 'COD' ? 'bg-pink-600' : 'border border-gray-300'}`} />
                    <span className="text-sm">Thanh toán khi nhận hàng</span>
                  </button>
                </div>
              </div>

              <Button
                shape="rounded"
                size="md"
                className="bg-pink-600 hover:bg-pink-700 text-white w-full py-3 mt-6"
                onClick={handlePlaceOrder}
                disabled={!user?.phone || !shippingAddress}
              >
                Đặt hàng
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && modalOrderId && (
        <PaymentModal show={showPaymentModal} orderId={modalOrderId} onClose={() => setShowPaymentModal(false)} />
      )}
    </div>
  );
};

import PaymentModal from '@/app/components/PaymentModal';

export default CheckoutPage;