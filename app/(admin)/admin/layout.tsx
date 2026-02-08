"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Box,
  Layers,
  Megaphone,
  BellRing,
  PanelBottom,
  Bell,
  Ticket,
  Users,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Store,
  UserCircle,
  Tag,
  Percent
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // Update clock every second
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    if (!mounted) return '--:--:--';
    return date.toLocaleTimeString('vi-VN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    if (!mounted) return 'Đang tải...';
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Sản phẩm', icon: Package },
    { href: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart },
    { href: '/admin/shipments', label: 'Vận chuyển', icon: Truck },
    { href: '/admin/inventory', label: 'Kho hàng', icon: Box },
    { href: '/admin/categories', label: 'Danh mục', icon: Layers },
    { href: '/admin/attributes', label: 'Thuộc tính', icon: Tag },
    { href: '/admin/tax', label: 'Thuế', icon: Percent },
    { href: '/admin/advertisements', label: 'Quảng cáo', icon: Megaphone },
    { href: '/admin/announcements', label: 'Thông báo', icon: BellRing },
    { href: '/admin/footer', label: 'Footer', icon: PanelBottom },
    { href: '/admin/notifications', label: 'Thông báo hệ thống', icon: Bell },
    { href: '/admin/coupons', label: 'Mã giảm giá', icon: Ticket },
    { href: '/admin/users', label: 'Người dùng', icon: Users },
    { href: '/admin/chat', label: 'Tin nhắn', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-20' : 'w-72'} bg-[#0F172A] text-slate-300 transition-all duration-300 ease-in-out flex flex-col relative shadow-2xl z-20`}>
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
            <Store className="text-white w-5 h-5" />
          </div>
          {!collapsed && (
            <span className="ml-3 font-bold text-xl tracking-tight text-white animate-in fade-in duration-500">
              NextShop<span className="text-blue-500">Admin</span>
            </span>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto custom-scroll py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center group relative p-3 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-blue-600/10 text-white font-medium shadow-sm'
                  : 'hover:bg-slate-800/50 hover:text-slate-100'
                  }`}
              >
                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full" />
                )}

                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`} />

                {!collapsed && (
                  <span className="ml-4 truncate animate-in slide-in-from-left-2 duration-300">
                    {item.label}
                  </span>
                )}

                {collapsed && (
                  <div className="absolute left-full ml-6 px-3 py-2 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800/50">
          <Link href="/" className="flex items-center p-3 rounded-xl hover:bg-slate-800/50 transition-colors group">
            <ChevronLeft className="w-5 h-5 text-slate-400 transition-transform duration-200 group-hover:-translate-x-1" />
            {!collapsed && <span className="ml-3 text-sm">Về trang chủ</span>}
          </Link>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-24 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-[#F8FAFC] hover:bg-blue-700 transition-colors z-30"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Glassmorphism Header */}
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-10 px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center">
            {/* Live Clock Redesign */}
            <div className="flex items-center gap-4 bg-slate-100/50 px-5 py-2.5 rounded-2xl border border-slate-200/50 shadow-inner">
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-800 tracking-wider font-mono tabular-nums leading-none">
                  {formatTime(currentTime)}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                  {formatDate(currentTime)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-900 leading-none capitalize">
                Chào {(user as { fullName?: string })?.fullName || 'Admin'}
              </span>
              <span className="text-[11px] text-green-500 font-medium mt-1 uppercase tracking-wider">Super Admin</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 p-0.5 shadow-sm">
              <div className="w-full h-full rounded-[14px] overflow-hidden bg-white flex items-center justify-center">
                <UserCircle className="text-slate-400 w-full h-full" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Part */}
        <main className="flex-1 overflow-y-auto custom-scroll p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
