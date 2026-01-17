"use client";

import { useEffect, useState } from 'react';
import { fetchAllOrders, updateOrderStatus, deleteOrder, getOrderById, OrderDto } from '@/app/services/orderService';
import Button from '@/app/components/Button';
import ConfirmModal from '@/app/components/ConfirmModal';
import OrderDetailsModal from './OrderDetailsModal';
import { toast } from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selected, setSelected] = useState<OrderDto | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const all = await fetchAllOrders();
      setOrders(all ?? []);
    } catch (e) {
      console.error('[AdminOrders] load error', e);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return o.orderId.toLowerCase().includes(q) || ((o.buyerName ?? '').toLowerCase().includes(q));
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function onChangeStatus(id: string, newStatus: string) {
    try {
      await updateOrderStatus(id, newStatus);
      setOrders(prev => prev.map(o => o.orderId === id ? { ...o, status: newStatus } : o));
      toast.success('Cập nhật trạng thái thành công');
    } catch (e) {
      console.error('[onChangeStatus] error', e);
      toast.error('Cập nhật trạng thái thất bại');
    }
  }

  function confirmDelete(id: string) {
    setToDeleteId(id);
    setShowConfirm(true);
  }

  async function performDelete() {
    if (!toDeleteId) return;
    try {
      await deleteOrder(toDeleteId);
      setOrders(prev => prev.filter(o => o.orderId !== toDeleteId));
      toast.success('Đã xóa đơn hàng');
    } catch (e) {
      console.error('[performDelete] error', e);
      toast.error('Xóa đơn hàng thất bại');
    } finally {
      setToDeleteId(null);
      setShowConfirm(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Orders</h2>
        <div className="flex items-center gap-3">
          <select className="border rounded px-3 py-2 text-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as string); setPage(1); }}>
            <option value="all">Tất cả</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm kiếm OrderId hoặc tên" className="border rounded px-3 py-2 text-sm" />
          <Button shape="roundedSquare" size="md" onClick={() => load()} className="bg-gray-100 rounded-md px-4 py-2 text-sm">Tải lại</Button>
        </div>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="bg-white shadow rounded">
          <table className="w-full table-auto">
            <thead className="text-left text-sm text-gray-500 border-b">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(o => (
                <tr key={o.orderId} className="border-b last:border-b-0">
                  <td className="px-4 py-3 text-sm">{o.orderId.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-sm">{o.buyerName ?? '—'}</td>
                  <td className="px-4 py-3 text-sm">{o.totalAmount.toLocaleString('vi-VN')} ₫</td>
                  <td className="px-4 py-3 text-sm">
                    <select className="border rounded px-2 py-1 text-sm" value={o.status} onChange={(e) => onChangeStatus(o.orderId, e.target.value)}>
                      <option>Pending</option>
                      <option>Processing</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm">{new Date(o.orderDate).toLocaleString('vi-VN')}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Button
                        shape="roundedSquare"
                        size="sm"
                        onClick={async () => {
                          try {
                            setDetailsLoading(true);
                            const full = await getOrderById(o.orderId);
                            setSelected(full ?? o);
                          } catch (e) {
                            console.error('[fetch detail] error', e);
                            toast.error('Không thể lấy chi tiết đơn hàng');
                          } finally {
                            setDetailsLoading(false);
                          }
                        }}
                        className="bg-gray-100 rounded-md px-3 py-2 text-sm"
                      >
                        {detailsLoading ? 'Đang tải...' : 'Xem'}
                      </Button>
                      <Button shape="roundedSquare" size="sm" onClick={() => confirmDelete(o.orderId)} className="bg-red-600 text-white rounded-md px-3 py-2 text-sm">Xóa</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* pagination */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm text-gray-500">{filtered.length} kết quả</div>
            <div className="flex items-center gap-2">
              <Button shape="roundedSquare" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} className="bg-gray-100 rounded-md px-3 py-2 text-sm">Prev</Button>
              <div className="text-sm">{page}/{totalPages}</div>
              <Button shape="roundedSquare" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="bg-gray-100 rounded-md px-3 py-2 text-sm">Next</Button>
            </div>
          </div>
        </div>
      )}

      {selected && <OrderDetailsModal order={selected} onClose={() => setSelected(null)} />}

      <ConfirmModal show={showConfirm} title="Xóa đơn hàng" message="Bạn có chắc chắn muốn xóa đơn hàng này?" onConfirm={performDelete} onCancel={() => setShowConfirm(false)} />
    </div>
  );
}