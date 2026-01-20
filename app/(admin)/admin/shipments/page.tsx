"use client";

import { useEffect, useState } from 'react';
import { fetchAllShipments, deleteShipment, ShipmentResponse, updateShipment } from '@/app/services/shipmentService';
import { fetchAllUsers, UserResponse } from '@/app/services/userService';
import Button from '@/app/components/Button';
import ConfirmModal from '@/app/components/ConfirmModal';
import { toast } from 'react-hot-toast';

export default function AdminShipments() {
  const [shipments, setShipments] = useState<ShipmentResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    void load();
    void loadUsers();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const all = await fetchAllShipments();
      setShipments(all ?? []);
    } catch (e) {
      console.error('[AdminShipments] load error', e);
      toast.error('Không thể tải danh sách shipment');
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    try {
      const all = await fetchAllUsers();
      // Filter to only shippers
      const shippers = all.filter(u => u.role === 'Shipper');
      setUsers(shippers);
    } catch (e) {
      console.error('[AdminShipments] load users error', e);
    }
  }

  const filtered = shipments.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return s.shipmentId.toLowerCase().includes(q) ||
           s.orderId.toLowerCase().includes(q) ||
           s.trackingNumber.toLowerCase().includes(q) ||
           (s.shipper?.fullName ?? '').toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function onChangeStatus(id: string, newStatus: string) {
    try {
      await updateShipment(id, { status: newStatus });
      setShipments(prev => prev.map(s => s.shipmentId === id ? { ...s, status: newStatus } : s));
      toast.success('Cập nhật trạng thái thành công');
    } catch (e) {
      console.error('[onChangeStatus] error', e);
      toast.error('Cập nhật trạng thái thất bại');
    }
  }

  async function onAssignShipper(id: string, shipperId: string) {
    try {
      await updateShipment(id, { shipperId });
      setShipments(prev => prev.map(s => s.shipmentId === id ? {
        ...s,
        shipperId,
        shipper: users.find(u => u.id === shipperId)
      } : s));
      toast.success('Gán shipper thành công');
    } catch (e) {
      console.error('[onAssignShipper] error', e);
      toast.error('Gán shipper thất bại');
    }
  }

  function confirmDelete(id: string) {
    setToDeleteId(id);
    setShowConfirm(true);
  }

  async function performDelete() {
    if (!toDeleteId) return;
    try {
      await deleteShipment(toDeleteId);
      setShipments(prev => prev.filter(s => s.shipmentId !== toDeleteId));
      toast.success('Đã xóa shipment');
    } catch (e) {
      console.error('[performDelete] error', e);
      toast.error('Xóa shipment thất bại');
    } finally {
      setToDeleteId(null);
      setShowConfirm(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Shipments</h2>
        <div className="flex items-center gap-3">
          <select className="border rounded px-3 py-2 text-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as string); setPage(1); }}>
            <option value="all">Tất cả</option>
            <option value="Preparing">Preparing</option>
            <option value="In transit">In transit</option>
            <option value="Out for delivery">Out for delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm kiếm ShipmentId, OrderId, Tracking..." className="border rounded px-3 py-2 text-sm" />
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
                <th className="px-4 py-3">Shipment</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Shipper</th>
                <th className="px-4 py-3">Carrier</th>
                <th className="px-4 py-3">Tracking</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(s => (
                <tr key={s.shipmentId} className="border-b last:border-b-0">
                  <td className="px-4 py-3 text-sm">{s.shipmentId.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-sm">{s.orderId.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-sm">
                    {s.shipper ? (
                      <span>{s.shipper.fullName}</span>
                    ) : (
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={s.shipperId || ''}
                        onChange={(e) => onAssignShipper(s.shipmentId, e.target.value)}
                      >
                        <option value="">Chọn shipper</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.fullName}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{s.carrier}</td>
                  <td className="px-4 py-3 text-sm">{s.trackingNumber || '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    <select className="border rounded px-2 py-1 text-sm" value={s.status} onChange={(e) => onChangeStatus(s.shipmentId, e.target.value)}>
                      <option>Preparing</option>
                      <option>In transit</option>
                      <option>Out for delivery</option>
                      <option>Delivered</option>
                      <option>Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {s.currentLat && s.currentLng ? (
                      <span>{s.currentLat.toFixed(4)}, {s.currentLng.toFixed(4)}</span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">{new Date(s.createdAt).toLocaleString('vi-VN')}</td>
                  <td className="px-4 py-3 text-sm">
                    <Button shape="roundedSquare" size="sm" onClick={() => confirmDelete(s.shipmentId)} className="bg-red-600 text-white rounded-md px-3 py-2 text-sm">Xóa</Button>
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

      <ConfirmModal show={showConfirm} title="Xóa shipment" message="Bạn có chắc chắn muốn xóa shipment này?" onConfirm={performDelete} onCancel={() => setShowConfirm(false)} />
    </div>
  );
}