"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { forgotPassword } from "@/app/services/authService";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setMessage("Vui lòng nhập địa chỉ email hợp lệ");
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage(null);
    
    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        setIsSuccess(true);
        setMessage(result.message || "Link đặt lại mật khẩu đã được gửi đến email của bạn");
      } else {
        setIsSuccess(false);
        setMessage(result.message || "Có lỗi xảy ra. Vui lòng thử lại");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 
                  (err instanceof Error ? err.message : undefined) || 
                  "Có lỗi xảy ra. Vui lòng thử lại";
      setMessage(msg);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Quên mật khẩu?</h1>
            <p className="text-gray-600">
              Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg ${
                isSuccess 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {isSuccess ? (
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="ml-3 text-sm">{message}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang gửi...
                </>
              ) : (
                'Gửi link đặt lại mật khẩu'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <span>Đã nhớ ra mật khẩu?</span>
              <Link 
                href="/login" 
                className="ml-2 text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                Đăng nhập
              </Link>
            </div>
            <div className="flex items-center justify-center text-sm text-gray-600">
              <span>Chưa có tài khoản?</span>
              <Link 
                href="/register" 
                className="ml-2 text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Gặp vấn đề? Liên hệ{" "}
            <a href="mailto:Datnguyen9240@gmail.com" className="text-blue-600 hover:text-blue-700 hover:underline">
              Datnguyen9240@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
