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
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Thanh toán</h1>
          <p className="text-sm md:text-base text-gray-600">Hoàn tất đơn hàng của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6 h-fit">
            <div className="flex items-center gap-2 mb-4 md:mb-5">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Tóm tắt đơn hàng</h2>
            </div>
            <div className="space-y-3 md:space-y-4">
              {cart.items.map((item) => (
                <div key={item.variantId} className="flex justify-between items-start md:items-center gap-2 md:gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                  <div className="flex items-start md:items-center gap-2 md:gap-4 flex-1 min-w-0">
                    {item.variantInfo?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.variantInfo.imageUrl} alt={item.variantInfo.productName ?? 'Sản phẩm'} className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg shadow-sm flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex-shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm md:text-base text-gray-900 truncate">{item.variantInfo?.productName ?? 'Unknown Product'}</p>
                      <p className="text-xs md:text-sm text-gray-500 mt-0.5">{(() => { const color = item.variantInfo?.attributes?.['Color'] ?? item.variantInfo?.attributes?.['color'] ?? ''; const size = item.variantInfo?.attributes?.['Size'] ?? item.variantInfo?.attributes?.['size'] ?? ''; return color ? `${color}${color && size ? ` · ${size}` : ''}` : size; })()}</p>
                      <p className="text-xs text-gray-400 mt-0.5">SKU: {item.variantInfo?.sku ?? '—'}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-gray-600">Số lượng:</span>
                        <span className="text-xs font-semibold text-pink-600">{item.quantity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-sm md:text-base font-bold text-pink-600"><MoneyVND value={item.totalPrice} /></div>
                    <div className="text-[11px] text-gray-400 mt-0.5">(<span className="opacity-60"><MoneyVND value={item.unitPrice} /></span> x {item.quantity})</div>
                  </div>
                </div>
              ))}
            </div>
            <hr className="my-4 md:my-5 border-gray-200" />

            {/* Coupon input */}
            <div className="mb-4 md:mb-5 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100">
              <label className="block text-xs md:text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Mã giảm giá
              </label>
              <div className="flex gap-2">
                <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Nhập mã giảm giá" className="flex-1 border-2 border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 rounded-lg px-3 py-2 text-sm md:text-base transition-all" />
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
                  className="px-3 md:px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg text-sm md:text-base transition-all shadow-md hover:shadow-lg"
                  disabled={couponLoading}
                >{couponLoading ? 'Đang kiểm tra...' : 'Áp mã'}</button>
                {appliedCoupon && (
                  <button type="button" onClick={() => { setAppliedCoupon(null); setCouponCode(''); setDiscountAmount(0); setFinalAmount(null); toast('Đã bỏ mã'); }} className="px-2 md:px-3 py-2 bg-white border-2 border-gray-300 hover:border-red-400 text-gray-700 hover:text-red-600 font-medium rounded-lg text-sm md:text-base transition-all">Bỏ</button>
                )}
              </div>
              {couponError && <div className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {couponError}
              </div>}
              {appliedCoupon && <div className="text-xs text-green-600 mt-2 flex items-center gap-1 font-medium">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Đã áp dụng mã: {appliedCoupon.code}
              </div>}
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center text-sm md:text-base text-gray-700">
                <span>Tạm tính (chưa thuế):</span>
                <MoneyVND value={cart.subtotalBeforeTax ?? cart.totalAmount} />
              </div>
              {(cart.taxAmount ?? 0) > 0 && (
                <div className="flex justify-between items-center text-sm md:text-base text-gray-700">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Thuế VAT:
                  </span>
                  <MoneyVND value={cart.taxAmount ?? 0} />
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-sm md:text-base text-green-600 font-medium">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Giảm giá:
                  </span>
                  <span>- <MoneyVND value={discountAmount} /></span>
                </div>
              )}
              <hr className="border-gray-300" />
              <div className="flex justify-between items-center text-lg md:text-xl font-bold text-gray-900">
                <span>Thành tiền:</span>
                <MoneyVND value={finalAmount ?? cart.totalAmount} color="text-pink-600" />
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6 h-fit">
            <div className="flex items-center gap-2 mb-4 md:mb-5">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Thông tin giao hàng</h2>
            </div>

            {/* User Info */}
            {user && (
              <div className="mb-4 md:mb-5 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm md:text-base flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Thông tin khách hàng
                </h3>
                <div className="space-y-2">
                  <p className="text-xs md:text-sm text-gray-700"><span className="font-semibold text-gray-900">Tên:</span> {user.fullName || <span className="text-gray-400 italic">Chưa cập nhật</span>}</p>
                  <p className="text-xs md:text-sm text-gray-700"><span className="font-semibold text-gray-900">Email:</span> {user.email}</p>
                  <p className="text-xs md:text-sm text-gray-700"><span className="font-semibold text-gray-900">Số điện thoại:</span> {user.phone || <span className="text-red-500 font-medium">Chưa cập nhật - <a href="/account/settings" className="text-blue-600 underline hover:text-blue-700">Cập nhật ngay</a></span>}</p>
                </div>
              </div>
            )}

            <div className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Địa chỉ giao hàng
                </label>
                {shippingAddress ? (
                  <div className="p-3 md:p-4 border-2 border-green-200 bg-green-50 rounded-xl text-sm md:text-base text-gray-700">
                    {shippingAddress}
                  </div>
                ) : (
                  <div className="p-3 md:p-4 border-2 border-red-200 bg-red-50 rounded-xl text-red-700 text-sm md:text-base font-medium">
                    Chưa có địa chỉ mặc định. <a href="/account/settings" className="text-blue-600 underline hover:text-blue-700 font-semibold">Cập nhật ngay</a>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Phương thức thanh toán
                </label>

                <div role="radiogroup" aria-label="Phương thức thanh toán" className="flex flex-col md:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ONLINE')}
                    aria-pressed={paymentMethod === 'ONLINE'}
                    className={`group flex items-center gap-3 flex-1 px-4 py-3 border-2 rounded-xl transition-all shadow-sm hover:shadow-md ${
                      paymentMethod === 'ONLINE'
                        ? 'border-pink-500 bg-gradient-to-r from-pink-50 to-purple-50 shadow-pink-200'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                      paymentMethod === 'ONLINE'
                        ? 'border-pink-500 bg-pink-500'
                        : 'border-gray-300 group-hover:border-gray-400'
                    }`}>
                      {paymentMethod === 'ONLINE' && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <span className={`text-sm md:text-base font-semibold block ${
                        paymentMethod === 'ONLINE' ? 'text-pink-700' : 'text-gray-700'
                      }`}>Thanh toán online</span>
                      <span className="text-xs text-gray-500">Chuyển khoản, Ví điện tử</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    aria-pressed={paymentMethod === 'COD'}
                    className={`group flex items-center gap-3 flex-1 px-4 py-3 border-2 rounded-xl transition-all shadow-sm hover:shadow-md ${
                      paymentMethod === 'COD'
                        ? 'border-pink-500 bg-gradient-to-r from-pink-50 to-purple-50 shadow-pink-200'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-pink-500 bg-pink-500'
                        : 'border-gray-300 group-hover:border-gray-400'
                    }`}>
                      {paymentMethod === 'COD' && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <span className={`text-sm md:text-base font-semibold block ${
                        paymentMethod === 'COD' ? 'text-pink-700' : 'text-gray-700'
                      }`}>Thanh toán khi nhận hàng</span>
                      <span className="text-xs text-gray-500">Tiền mặt khi giao</span>
                    </div>
                  </button>
                </div>
              </div>

              <Button
                shape="rounded"
                size="md"
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white w-full py-3 md:py-4 mt-2 md:mt-4 text-sm md:text-base font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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