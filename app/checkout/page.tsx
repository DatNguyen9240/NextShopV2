"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/Button";
import MoneyVND from "@/app/components/MoneyVND";
import { getCart } from "@/app/services/cartService";
import { createOrder } from "@/app/services/orderService";
import { useAuth } from "@/app/providers/AuthProvider";
import type { CartDto } from "@/app/types/cart";

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");

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

  const handlePlaceOrder = async () => {
    if (!cart || !shippingAddress) {
      alert("Vui lòng nhập địa chỉ giao hàng");
      return;
    }

    try {
      // Create order request from cart
      const orderRequest = {
        items: cart.items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity
        })),
       
      };

      const order = await createOrder(orderRequest);
      console.log('Created order:', order);
      const createdId = order?.orderId || order?.OrderId;

      if (paymentMethod === "ONLINE") {
        // Open payment modal instead of redirect
        setModalOrderId(createdId);
        setShowPaymentModal(true);
      } else {
        // COD - redirect to success or home
        alert("Đặt hàng thành công! Thanh toán khi nhận hàng.");
        router.push('/');
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi đặt hàng");
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
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.variantId} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.productName ?? 'Sản phẩm'} className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded" />
                    )}

                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-600">{item.color ?? ''}{item.color && item.size ? ` · ${item.size}` : item.size ? item.size : ''}</p>
                      <p className="text-sm text-gray-500">SKU: {item.sku ?? '—'}</p>
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
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Tổng cộng:</span>
              <MoneyVND value={cart.totalAmount} color="text-pink-600" />
            </div>
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
                <p><strong>Số điện thoại:</strong> {user.phone || 'Chưa cập nhật'}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ giao hàng
                </label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  rows={3}
                  placeholder="Nhập địa chỉ giao hàng"
                />
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