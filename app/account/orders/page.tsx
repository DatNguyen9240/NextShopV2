"use client";

import React, { useEffect, useState } from 'react';
import { fetchMyOrders, PagedOrders } from '../../services/orderService';
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

// Lightweight type for errors that contain an HTTP response
type ErrorWithResponse = { response?: { status?: number } };

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // pagination state
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async (p: number) => {
      setLoading(true);
      try {
        const payload: PagedOrders = await fetchMyOrders(p, pageSize, statusFilter ?? undefined);
        if (!mounted) return;
        setOrders(payload.items ?? []);
        setTotal(payload.total ?? 0);
      } catch (err: unknown) {
        if ((err as ErrorWithResponse).response?.status === 401) {
          setError('Vui lòng đăng nhập để xem lịch sử mua hàng');
        } else {
          console.error('Failed to load orders', err);
          setError('Không thể tải lịch sử đơn hàng');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load(page);
    return () => { mounted = false; };
  }, [page, pageSize, statusFilter]);

  // Reset to first page when filter changes
  useEffect(() => { setPage(1); }, [statusFilter]);

  if (loading) return <div className="max-w-screen-xl mx-auto mt-12 p-6 bg-white rounded shadow">Đang tải lịch sử đơn hàng...</div>;
  if (error) return <div className="max-w-screen-xl mx-auto mt-12 p-6 bg-white rounded shadow">{error}</div>;

  return (
    <main className="max-w-screen-xl mx-auto mt-12 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Lịch sử mua hàng</h1>

        {/* Filter + Header pagination / summary (responsive) */}
        <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap w-full sm:w-auto mt-3 sm:mt-0">
          <div className="flex flex-wrap gap-2 mb-3 sm:mb-0">
            <button onClick={() => setStatusFilter(null)} className={`px-3 py-1 rounded ${statusFilter === null ? 'bg-pink-50 border border-pink-200 text-pink-600' : 'border hover:bg-gray-100'}`}>Tất cả</button>
            <button onClick={() => setStatusFilter('Paid')} className={`px-3 py-1 rounded ${statusFilter === 'Paid' ? 'bg-pink-50 border border-pink-200 text-pink-600' : 'border hover:bg-gray-100'}`}>Đã thanh toán</button>
            <button onClick={() => setStatusFilter('Pending')} className={`px-3 py-1 rounded ${statusFilter === 'Pending' ? 'bg-pink-50 border border-pink-200 text-pink-600' : 'border hover:bg-gray-100'}`}>Chờ thanh toán</button>
          </div>

          <div className="hidden sm:block text-sm text-gray-600">Hiển thị {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} trên {total} đơn</div>
          <div className="sm:hidden text-sm text-gray-600 w-full mb-2">Hiển thị {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} trên {total} đơn</div>

          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 rounded border ${page === 1 ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-100'}`}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Trước
            </button>
            <div className="text-sm">Trang {page}</div>
            <button
              className={`px-3 py-1 rounded border ${page * pageSize >= total ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-100'}`}
              onClick={() => setPage(p => p + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

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
                <div className="text-left sm:text-right min-w-[120px] sm:min-w-[140px]">
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