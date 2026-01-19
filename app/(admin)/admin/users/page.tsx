'use client';

import React, { useState, useEffect } from 'react';
import axios from '../../../lib/axiosClient';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await axios.get('/api/user');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdating(userId);
    setMessage(null);
    
    try {
      const response = await axios.put(`/api/user/${userId}/role`, { role: newRole });
      if (response.data.success) {
        setUsers(prev => prev.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        ));
        setMessage({ type: 'success', text: `Đã cập nhật vai trò của ${users.find(u => u.id === userId)?.fullName} thành ${newRole}` });
      }
    } catch (error) {
      console.error('Error updating role:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật vai trò' });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <div className="p-6">Đang tải...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý người dùng</h1>

      {message && (
        <div className={`mb-4 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thông tin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    {user.phone && <div className="text-sm text-gray-500">{user.phone}</div>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    disabled={updating === user.id}
                    className={`text-sm border rounded px-2 py-1 ${
                      updating === user.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="User">User</option>
                    <option value="Shipper">Shipper</option>
                  </select>
                  {updating === user.id && (
                    <span className="ml-2 text-xs text-blue-600">Đang cập nhật...</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.emailVerified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.emailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
