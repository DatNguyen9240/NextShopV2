import Link from 'next/link';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="mt-6">
          <Link href="/admin" className="block px-6 py-3 text-gray-700 hover:bg-gray-200 hover:text-gray-900">
            Dashboard
          </Link>
          <Link href="/admin/products" className="block px-6 py-3 text-gray-700 hover:bg-gray-200 hover:text-gray-900">
            Products
          </Link>
          <Link href="/admin/orders" className="block px-6 py-3 text-gray-700 hover:bg-gray-200 hover:text-gray-900">
            Orders
          </Link>
          <Link href="/admin/categories" className="block px-6 py-3 text-gray-700 hover:bg-gray-200 hover:text-gray-900">
            Categories
          </Link>
          <Link href="/admin/banners" className="block px-6 py-3 text-gray-700 hover:bg-gray-200 hover:text-gray-900">
            Banners
          </Link>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link href="/" className="flex items-center px-6 py-3 text-blue-600 hover:bg-blue-50 hover:text-blue-800 rounded-md transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Store
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm px-6 py-4">
          <h1 className="text-xl font-semibold text-blue-800">Chào Đạt đẹp trai</h1>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}