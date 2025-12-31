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
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}