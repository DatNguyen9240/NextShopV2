"use client";
import { useState, useEffect } from 'react';
import { Percent, Save, RefreshCw } from 'lucide-react';
import axiosClient from '@/app/lib/axiosClient';

export default function TaxPage() {
  const [taxRate, setTaxRate] = useState<string>('0.10');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchTaxRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTaxRate = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/api/TaxSettings/TaxRate');
      const data = response.data?.data ?? response.data;
      if (data) {
        setTaxRate(data.value || '0.10');
      }
    } catch (error) {
      console.error('Error fetching tax rate:', error);
      showMessage('error', 'Không thể tải thông tin thuế');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const numValue = parseFloat(taxRate);
    if (isNaN(numValue) || numValue < 0 || numValue > 1) {
      showMessage('error', 'Thuế suất phải là số từ 0 đến 1 (ví dụ: 0.10 = 10%)');
      return;
    }

    setSaving(true);
    try {
      await axiosClient.post('/api/TaxSettings', {
        key: 'TaxRate',
        value: taxRate,
        description: 'Default tax rate for products (decimal format, e.g., 0.10 = 10%)'
      });
      
      showMessage('success', 'Cập nhật thuế suất thành công!');
      fetchTaxRate();
    } catch (error) {
      console.error('Error saving tax rate:', error);
      showMessage('error', 'Lỗi khi lưu thuế suất');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const taxRatePercent = (parseFloat(taxRate || '0') * 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-xl">
              <Percent className="w-8 h-8 text-blue-600" />
            </div>
            Quản lý Thuế
          </h1>
          <p className="text-slate-600 mt-2">Cấu hình thuế suất mặc định cho sản phẩm</p>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-xl border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        } animate-in slide-in-from-top-2 duration-300`}>
          {message.text}
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="max-w-2xl">
          <div className="space-y-6">
            {/* Tax Rate Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Thuế suất mặc định hệ thống
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-slate-100"
                    placeholder="0.10"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Định dạng thập phân: 0.10 = 10%, 0.08 = 8%
                  </p>
                </div>
                
                <div className="bg-blue-50 px-6 py-3 rounded-xl border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">
                    {taxRatePercent}%
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="font-semibold text-amber-900 mb-2">ℹ️ Thông tin</h3>
              <ul className="text-sm text-amber-800 space-y-1.5 list-disc list-inside">
                <li>Thuế suất này áp dụng mặc định cho tất cả sản phẩm nếu không có cấu hình riêng</li>
                <li>Thứ tự ưu tiên: Thuế sản phẩm → Thuế danh mục → Thuế hệ thống</li>
                <li>Giá hiển thị <strong>chưa bao gồm thuế</strong> (tax-exclusive)</li>
                <li>Thuế được <strong>cộng thêm</strong> khi checkout</li>
                <li>Công thức: Tổng = (Giá - Giảm giá) + Thuế</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed font-medium shadow-sm"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              
              <button
                onClick={fetchTaxRate}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors disabled:bg-slate-50 disabled:cursor-not-allowed font-medium"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Tải lại
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Example Card */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Ví dụ tính thuế (Tax-Exclusive)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="text-sm font-semibold text-slate-600 mb-3">Sản phẩm 100,000 VNĐ</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Giá sản phẩm:</span>
                <span className="font-semibold">100,000 VNĐ</span>
              </div>
              <div className="flex justify-between text-blue-600">
                <span>Thuế ({taxRatePercent}%):</span>
                <span>+ {Math.round(100000 * parseFloat(taxRate || '0')).toLocaleString()} VNĐ</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-green-600">
                <span>Tổng thanh toán:</span>
                <span>{Math.round(100000 * (1 + parseFloat(taxRate || '0'))).toLocaleString()} VNĐ</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="text-sm font-semibold text-slate-600 mb-3">Sản phẩm 250,000 VNĐ</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Giá sản phẩm:</span>
                <span className="font-semibold">250,000 VNĐ</span>
              </div>
              <div className="flex justify-between text-blue-600">
                <span>Thuế ({taxRatePercent}%):</span>
                <span>+ {Math.round(250000 * parseFloat(taxRate || '0')).toLocaleString()} VNĐ</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-green-600">
                <span>Tổng thanh toán:</span>
                <span>{Math.round(250000 * (1 + parseFloat(taxRate || '0'))).toLocaleString()} VNĐ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
