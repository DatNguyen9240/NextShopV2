"use client";

import { useEffect, useState } from 'react';
import { fetchAllOrders, updateOrderStatus, deleteOrder, getOrderById, cancelOrder, OrderDto } from '@/app/services/orderService';
import { createShipment, CreateShipmentRequest } from '@/app/services/shipmentService';
import Button from '@/app/components/Button';
import ConfirmModal from '@/app/components/ConfirmModal';
import CancelOrderModal from '@/app/components/CancelOrderModal';
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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
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

  function requestCancel(id: string) {
    setCancelingOrderId(id);
    setShowCancelModal(true);
  }

  async function performCancel(reason?: string, adminReason?: string) {
    if (!cancelingOrderId) return;
    setCancelLoading(true);
    try {
      await cancelOrder(cancelingOrderId, reason, adminReason);
      setOrders(prev => prev.map(o => o.orderId === cancelingOrderId ? { ...o, status: 'Cancelled', cancelReason: reason ?? o.cancelReason, adminCancelReason: adminReason ?? o.adminCancelReason, cancelledBy: adminReason ? 'Admin' : 'User' } : o));
      toast.success('Đã hủy đơn hàng');
    } catch (e) {
      console.error('[performCancel] error', e);
      toast.error('Hủy đơn hàng thất bại');
    } finally {
      setCancelLoading(false);
      setCancelingOrderId(null);
      setShowCancelModal(false);
    }
  }

  async function onChangeStatus(id: string, newStatus: string) {
    if (newStatus === 'Cancelled') {
      requestCancel(id);
      return;
    }
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

  async function onCreateShipment(orderId: string) {
    try {
      const request: CreateShipmentRequest = { orderId, carrier: 'GHN', status: 'Preparing' };
      await createShipment(request);
      toast.success('Đã tạo shipment thành công');
      await load(); // Reload to update
    } catch (e) {
      console.error('[onCreateShipment] error', e);
      toast.error('Tạo shipment thất bại');
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
            <option value="Paid">Paid</option>
            <option value="Shipped">Shipped</option>
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
                <th className="px-4 py-3">Lý do hủy (User)</th>
                <th className="px-4 py-3">Lý do hủy (Admin)</th>
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
                      <option>Paid</option>
                      <option>Shipped</option>
                      <option>Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate" title={o.cancelReason ?? ''}>{o.cancelReason ?? '—'}</td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate" title={o.adminCancelReason ?? ''}>{o.adminCancelReason ?? '—'}</td>
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
                      {(o.status === 'Paid' || o.status === 'Shipped') && (
                        <Button
                          shape="roundedSquare"
                          size="sm"
                          onClick={() => onCreateShipment(o.orderId)}
                          className="bg-blue-600 text-white rounded-md px-3 py-2 text-sm"
                        >
                          Tạo Shipment
                        </Button>
                      )}
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

      <CancelOrderModal show={showCancelModal} isAdmin confirmLoading={cancelLoading} onConfirm={(reason, adminReason) => performCancel(reason, adminReason)} onCancel={() => { setShowCancelModal(false); setCancelingOrderId(null); }} />

      <ConfirmModal show={showConfirm} title="Xóa đơn hàng" message="Bạn có chắc chắn muốn xóa đơn hàng này?" onConfirm={performDelete} onCancel={() => setShowConfirm(false)} />
    </div>
  );
}