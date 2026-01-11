'use client';

import { useState, useEffect } from 'react';
import axiosClient from '../../../lib/axiosClient';
import { requestNotificationPermission, setupForegroundListener } from '../../../lib/notificationHandler';
import { useAuth } from '../../../providers/AuthProvider';

interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  sentAt: string;
  recipientCount: number;
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
}

interface FcmToken {
  token: string;
  userId?: string;
  createdAt: string;
}

export default function NotificationsAdmin() {
  const [activeTab, setActiveTab] = useState<'send' | 'history' | 'tokens'>('send');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [tokens, setTokens] = useState<FcmToken[]>([]);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    } else if (activeTab === 'tokens') {
      loadTokens();
    }
  }, [activeTab]);

  useEffect(() => {
    setNotificationEnabled(Notification.permission === 'granted');
    
    // Set up foreground notification listener
    setupForegroundListener((payload) => {
      console.log('Notification received in foreground:', payload);
      setMessage(`📨 Thông báo mới: ${payload.notification?.title}`);
    });
  }, []);

  const loadHistory = async () => {
    try {
      const response = await axiosClient.get('/api/notification/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Error loading history:', error);
      setHistory([]);
    }
  };

  const loadTokens = async () => {
    try {
      const response = await axiosClient.get('/api/notification/tokens');
      setTokens(response.data);
    } catch (error) {
      console.error('Error loading tokens:', error);
      setTokens([]);
    }
  };

  const sendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      setMessage('Vui lòng nhập tiêu đề và nội dung');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await axiosClient.post('/api/notification/send-all', {
        title: title.trim(),
        body: body.trim(),
        imageUrl: imageUrl.trim() || undefined,
        data: url.trim() ? { url: url.trim() } : undefined
      });

      setMessage('✅ Gửi thông báo thành công!');
      setTitle('');
      setBody('');
      setImageUrl('');
      setUrl('');
      
      // Reload history
      if (activeTab === 'history') {
        loadHistory();
      }
    } catch (error: any) {
      console.error('Error sending notification:', error);
      setMessage(`❌ Lỗi: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testFirebase = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await axiosClient.post('/api/FirebaseNotification/test-firebase');
      setMessage('✅ Test Firebase thành công!');
      
      // Reload history
      if (activeTab === 'history') {
        loadHistory();
      }
    } catch (error: any) {
      console.error('Error testing Firebase:', error);
      setMessage(`❌ Lỗi test: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const enableNotifications = async () => {
    const token = await requestNotificationPermission(user?.id);
    if (token) {
      setNotificationEnabled(true);
      setMessage('✅ Thông báo đã được bật!');
      // Reload tokens
      if (activeTab === 'tokens') {
        loadTokens();
      }
    } else {
      setMessage('❌ Không thể bật thông báo');
    }
  };

  const clearTokens = async () => {
    if (!confirm('Bạn có chắc muốn xóa tất cả FCM tokens?')) return;
    
    setIsLoading(true);
    setMessage('');

    try {
      const response = await axiosClient.delete('/api/notification/clear-tokens');
      setMessage('✅ Đã xóa tất cả tokens!');
      // Reload tokens
      if (activeTab === 'tokens') {
        loadTokens();
      }
    } catch (error: any) {
      console.error('Error clearing tokens:', error);
      setMessage(`❌ Lỗi: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý thông báo</h1>
        <p className="text-gray-600">Gửi thông báo Firebase đến tất cả người dùng</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('send')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'send'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Gửi thông báo
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Lịch sử
        </button>
        <button
          onClick={() => setActiveTab('tokens')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'tokens'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          FCM Tokens
        </button>
      </div>

      {/* Send Notification Tab */}
      {activeTab === 'send' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Gửi thông báo mới</h2>

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800 mb-2">Quản lý thông báo push Firebase</p>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                notificationEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {notificationEnabled ? '✅ Đã bật' : '⚠️ Chưa bật'}
              </span>
              <button
                onClick={enableNotifications}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang xử lý...' : 'Bật thông báo'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tiêu đề thông báo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung *
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập nội dung thông báo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL hình ảnh (tùy chọn)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL đích (tùy chọn)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/products/123"
              />
            </div>

            {message && (
              <div className={`p-3 rounded-md ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={sendNotification}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang gửi...' : 'Gửi thông báo'}
              </button>

              <button
                onClick={testFirebase}
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang test...' : 'Test Firebase'}
              </button>

              <button
                onClick={clearTokens}
                disabled={isLoading}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Xóa tất cả tokens
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Lịch sử thông báo</h2>

          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Chưa có thông báo nào được gửi</p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-gray-600 mt-1">{item.body}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Gửi đến {item.recipientCount} người dùng • {new Date(item.sentAt).toLocaleString('vi-VN')}
                      </p>
                      {item.errorMessage && (
                        <p className="text-sm text-red-600 mt-1">Lỗi: {item.errorMessage}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status === 'success' ? 'Thành công' : item.status === 'failed' ? 'Thất bại' : 'Đang xử lý'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tokens Tab */}
      {activeTab === 'tokens' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">FCM Tokens</h2>

          {tokens.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Chưa có FCM token nào được đăng ký</p>
          ) : (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Tổng số tokens:</strong> {tokens.length}
                </p>
              </div>
              {tokens.map((token, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-mono text-sm text-gray-800 break-all bg-gray-50 p-2 rounded">{token.token}</p>
                      {token.userId && (
                        <p className="text-sm text-gray-600 mt-2">👤 User ID: <span className="font-mono">{token.userId}</span></p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        📅 Đăng ký: {new Date(token.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}