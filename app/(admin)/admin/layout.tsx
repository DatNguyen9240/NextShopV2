"use client";
import Link from 'next/link';
import { ReactNode, useState } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white shadow-lg transition-all duration-200 relative`}>
        <div className="p-6 relative">
          <h2 className={`${collapsed ? 'hidden' : 'text-2xl'} font-bold text-gray-800`}>Admin Panel</h2>
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="absolute right-2 top-2 p-1 rounded hover:bg-gray-100"
          >
            <svg className={`w-5 h-5 transform ${collapsed ? '' : 'rotate-180'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <nav className="mt-6">
          <Link href="/admin" title="Dashboard" className={`flex items-center ${collapsed ? 'justify-center py-3' : 'px-6 py-3'} text-gray-700 hover:bg-gray-200 hover:text-gray-900`}>
            <span className={`w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 text-sm font-medium`}>{collapsed ? 'D' : ''}</span>
            {!collapsed && <span className="ml-3">Dashboard</span>}
          </Link>
          <Link href="/admin/products" title="Products" className={`flex items-center ${collapsed ? 'justify-center py-3' : 'px-6 py-3'} text-gray-700 hover:bg-gray-200 hover:text-gray-900`}>
            <span className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 text-sm font-medium">{collapsed ? 'P' : ''}</span>
            {!collapsed && <span className="ml-3">Products</span>}
          </Link>
          <Link href="/admin/orders" title="Orders" className={`flex items-center ${collapsed ? 'justify-center py-3' : 'px-6 py-3'} text-gray-700 hover:bg-gray-200 hover:text-gray-900`}>
            <span className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 text-sm font-medium">{collapsed ? 'O' : ''}</span>
            {!collapsed && <span className="ml-3">Orders</span>}
          </Link>
          <Link href="/admin/categories" title="Categories" className={`flex items-center ${collapsed ? 'justify-center py-3' : 'px-6 py-3'} text-gray-700 hover:bg-gray-200 hover:text-gray-900`}>
            <span className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 text-sm font-medium">{collapsed ? 'C' : ''}</span>
            {!collapsed && <span className="ml-3">Categories</span>}
          </Link>
          <Link href="/admin/advertisements" title="Advertisements" className={`flex items-center ${collapsed ? 'justify-center py-3' : 'px-6 py-3'} text-gray-700 hover:bg-gray-200 hover:text-gray-900`}>
            <span className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 text-sm font-medium">{collapsed ? 'A' : ''}</span>
            {!collapsed && <span className="ml-3">Advertisment</span>}
          </Link>
          <Link href="/admin/notifications" title="Notifications" className={`flex items-center ${collapsed ? 'justify-center py-3' : 'px-6 py-3'} text-gray-700 hover:bg-gray-200 hover:text-gray-900`}>
            <span className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 text-sm font-medium">{collapsed ? 'N' : ''}</span>
            {!collapsed && <span className="ml-3">Notifications</span>}
          </Link>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link href="/" title="Back to store" className={`flex items-center ${collapsed ? 'justify-center py-3' : 'px-6 py-3'} text-blue-600 hover:bg-blue-50 hover:text-blue-800 rounded-md transition-colors`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {!collapsed && <span className="ml-2">Back to Store</span>}
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