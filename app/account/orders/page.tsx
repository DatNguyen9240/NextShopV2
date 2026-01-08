"use client";

import React, { useEffect, useState } from 'react';
import axiosClient from '@/app/lib/axiosClient';
import Button from '@/app/components/Button';
import MoneyVND from '@/app/components/MoneyVND';
import { useRouter } from 'next/navigation';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface OrderItem {
  orderItemId: string;
  productName?: string | null;
  quantity: number;
  unitPrice: number;
}

interface OrderDto {
  orderId: string;
  status: string;
  totalAmount: number;
  orderDate: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get('/api/Order/my-orders');
        const payload = res.data?.data ?? res.data;
        if (!mounted) return;
        setOrders(payload ?? []);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          setError('Vui lòng đăng nhập để xem lịch sử mua hàng');
        } else {
          console.error('Failed to load orders', err);
          setError('Không thể tải lịch sử đơn hàng');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="max-w-screen-xl mx-auto mt-12 p-6 bg-white rounded shadow">Đang tải lịch sử đơn hàng...</div>;
  if (error) return <div className="max-w-screen-xl mx-auto mt-12 p-6 bg-white rounded shadow">{error}</div>;

  return (
    <main className="max-w-screen-xl mx-auto mt-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Lịch sử mua hàng</h1>

      {orders && orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map(o => (
            <div
              key={o.orderId}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              {/* LEFT */}
              <div className="space-y-1">
                <div className="text-sm text-gray-500">
                  Mã đơn: <span className="font-mono text-gray-800">{o.orderId}</span>
                </div>

                <div className="text-sm text-gray-500">
                  Ngày đặt: {new Date(o.orderDate).toLocaleString()}
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${o.status === 'Paid' ? 'bg-green-50 text-green-700' : o.status === 'Failed' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    {o.status === 'Paid' ? (
                      <CheckCircle className="text-green-600" size={16} />
                    ) : o.status === 'Failed' ? (
                      <XCircle className="text-red-600" size={16} />
                    ) : (
                      <Clock className="text-yellow-600" size={16} />
                    )}
                    <span>{o.status === 'Paid' ? 'Đã thanh toán' : o.status === 'Failed' ? 'Thất bại' : 'Chờ thanh toán'}</span>
                  </div>

                  <span className="text-sm text-gray-600">
                    {o.items?.length ?? 0} sản phẩm
                  </span>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 sm:ml-6 w-full sm:w-auto">

                {/* MONEY */}
                <div className="text-left sm:text-right min-w-[140px]">
                  <div className="text-xs text-gray-500">Tổng tiền</div>
                  <div className="text-2xl font-extrabold text-pink-600 leading-tight">
                    <MoneyVND value={o.totalAmount} />
                  </div>
                </div>

                {/* BUTTON */}
                <Button
                  onClick={() => router.push(`/payment/success?orderId=${o.orderId}`)}
                  className="w-full sm:w-auto px-5 py-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white shadow-md"
                >
                  Xem chi tiết
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500">
          Bạn chưa có đơn hàng nào.
        </div>
      )}
    </main>
  );
}