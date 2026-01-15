"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from 'next/image';
import { createPortal } from "react-dom";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import CartIcon from "./CartIcon";
import Badge from "./Badge";
import Hotline from "./Hotline";
import { SignUpButton, LoginButton } from "./Button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { User, Settings, LogOut, ChevronDown, History, Heart, Bell } from "lucide-react";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, startNotificationConnection, stopNotificationConnection } from '@/app/services/notificationService';
import { getCartCount } from '@/app/services/cartService';

const Header = () => {
  const [openModal, setOpenModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [notifications, setNotifications] = useState<{ id: string; title: string; body?: string; url?: string; read?: boolean; createdAt: string; }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifButtonRef = useRef<HTMLButtonElement>(null);
  const [notifPosition, setNotifPosition] = useState({ top: 0, right: 0 });

  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // Only fetch cart count when authenticated; otherwise reset to 0 and avoid unnecessary API calls
        if (!isAuthenticated || !user || !user.id) {
          if (!mounted) return;
          setCartCount(0);
          return;
        }

        const c = await getCartCount();
        if (!mounted) return;
        setCartCount(c);
      } catch (e) {
        console.error(e);
      }
    }
    // initial load (only fetch when authenticated)
    void load();

    const onUpdate = () => { if (!isAuthenticated || !user || !user.id) return; void load(); };
    window.addEventListener('cart:updated', onUpdate);
    return () => { mounted = false; window.removeEventListener('cart:updated', onUpdate); };
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (showUserMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [showUserMenu]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!isAuthenticated || !user || !user.id) {
        // don't request notifications when not authenticated
        setNotifications([]);
        return;
      }

      try {
        const list = await getNotifications();
        if (!mounted) return;
        setNotifications(list);
      } catch (e) {
        console.error('[Header] Failed to load notifications', e);
        setNotifications([]);
      }
    }
    void load();

    // manage realtime connection depending on auth
    if (isAuthenticated && user && user.id) {
      console.log('🔗 Starting notification connection for user:', user.id);
      // Delay slightly after login to allow cookies/auth to stabilize and avoid negotiate race
      setTimeout(() => { void startNotificationConnection(); }, 500);
    } else {
      console.log('🔌 Stopping notification connection - not authenticated or no user');
      void stopNotificationConnection();
    }

    const onUpdate = () => { void load(); };
    window.addEventListener('notifications:updated', onUpdate);
    return () => { mounted = false; window.removeEventListener('notifications:updated', onUpdate); void stopNotificationConnection(); };
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (showNotifications && notifButtonRef.current) {
      const rect = notifButtonRef.current.getBoundingClientRect();
      setNotifPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [showNotifications]);

  return (
    <header className="bg-white border-b border-gray-200 py-3 relative z-50">
      <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-between">
        {/* --- Nút 3 gạch khi md trở xuống --- */}
        <button
          className="flex flex-col space-y-1 lg:hidden"
          onClick={() => setOpenModal(true)}
          aria-label="Mở menu"
        >
          <span className="block h-[2px] w-6 bg-gray-800 rounded"></span>
          <span className="block h-[2px] w-5 bg-gray-800 rounded"></span>
          <span className="block h-[2px] w-4 bg-gray-800 rounded"></span>
        </button>

        <div className="hidden lg:flex">
          <Logo />
        </div>

        <div className="hidden md:flex flex-1 justify-center items-center mx-10">
          <SearchBar />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative mr-2">
            <button
              ref={notifButtonRef}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1 rounded-full hover:bg-gray-100"
              aria-label="Thông báo"
            >
              <Bell size={22} />
              <Badge count={notifications.filter(n => !n.read).length} />
            </button>

            {showNotifications && typeof window !== 'undefined' && createPortal(
              <>
                <div 
                  className="fixed inset-0 z-[9998]" 
                  onClick={() => setShowNotifications(false)}
                />
                <div 
                  className="fixed w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999]"
                  style={{
                    top: `${notifPosition.top}px`,
                    right: `${notifPosition.right}px`,
                  }}
                >
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                    <span className="font-medium">Thông báo</span>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await markAllNotificationsAsRead();
                        const list = await getNotifications();
                        setNotifications(list);
                      }}
                      className="text-sm text-blue-600"
                    >
                      Đánh dấu đã đọc
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">Không có thông báo</div>
                    ) : (
                      notifications.map(n => (
                        <button
                          key={n.id}
                          onClick={async () => {
                            if (!n.read) await markNotificationAsRead(n.id);
                            setShowNotifications(false);
                            router.push(n.url || '/');
                          }}
                          className={`w-full text-left px-4 py-3 border-b border-gray-100 ${n.read ? 'bg-white' : 'bg-gray-50'}`}
                        >
                          <div className="text-sm font-medium">{n.title}</div>
                          {n.body && <div className="text-xs text-gray-500">{n.body}</div>}
                          <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </>,
              document.body
            )}
          </div>

          <div
            className="relative mr-2 cursor-pointer"
            onClick={() => router.push("/cart")}
            title="Xem giỏ hàng"
          >
            <CartIcon />
            <Badge count={cartCount} />
          </div>

          <div className="hidden lg:flex">
            <Hotline phone="0975324568" />
          </div>

          <div className="hidden lg:flex">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 ml-4 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Tài khoản"
                >
                  {user?.avatar ? (
                    <div className="w-8 h-8 relative rounded-full overflow-hidden">
                      <Image src={String(user.avatar)} alt={user.fullName || user.email} fill sizes="32px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <User size={18} className="text-gray-600" />
                    </div>
                  )}
                  <span className="font-medium text-sm">{user?.fullName || user?.email}</span>
                  <ChevronDown size={16} className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showUserMenu && typeof window !== 'undefined' && createPortal(
                  <>
                    <div 
                      className="fixed inset-0 z-[9998]" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div 
                      className="fixed w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999]"
                      style={{
                        top: `${menuPosition.top}px`,
                        right: `${menuPosition.right}px`,
                      }}
                    >
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          router.push('/account/settings');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Settings size={16} />
                        <span>Cài đặt tài khoản</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          router.push('/account/likes');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Heart size={16} />
                        <span>Sản phẩm yêu thích</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          router.push('/account/orders');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <History size={16} />
                        <span>Lịch sử mua hàng</span>
                      </button>
                      <hr className="my-2 border-gray-200" />
                      <button
                        onClick={async () => {
                          setShowUserMenu(false);
                          await logout();
                          router.push('/');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </>,
                  document.body
                )}
              </div>
            ) : (
              <div className="flex items-center">
                <LoginButton />
                <SignUpButton />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="md:hidden max-w-screen-xl mx-auto px-14 mt-3">
        <SearchBar />
      </div>

      {openModal && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpenModal(false)}
          />
          <div className="fixed top-0 left-0 h-full w-3/4 max-w-xs bg-white shadow-lg z-50 flex flex-col p-5 animate-slide-in-left">
            <button
              className="self-end mb-4 p-2 rounded hover:bg-gray-100"
              onClick={() => setOpenModal(false)}
              aria-label="Đóng menu"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="#222"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex flex-col gap-4">
              <Hotline phone="0975324568" />
              {isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                    {user?.avatar ? (
                      <div className="w-8 h-8 relative rounded-full overflow-hidden">
                        <Image src={String(user.avatar)} alt={user.fullName || user.email} fill sizes="32px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <User size={18} className="text-gray-600" />
                      </div>
                    )}
                    <span className="font-medium text-sm">{user?.fullName || user?.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setOpenModal(false);
                      router.push('/account/settings');
                    }}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Settings size={16} />
                    <span>Cài đặt tài khoản</span>
                  </button>
                  <button
                    onClick={() => {
                      setOpenModal(false);
                      router.push('/account/likes');
                    }}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Heart size={16} />
                    <span>Sản phẩm yêu thích</span>
                  </button>
                  <button
                    onClick={() => {
                      setOpenModal(false);
                      router.push('/account/orders');
                    }}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <History size={16} />
                    <span>Lịch sử mua hàng</span>
                  </button>
                  <button
                    onClick={async () => {
                      setOpenModal(false);
                      await logout();
                      router.push('/');
                    }}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <LoginButton />
                  <SignUpButton />
                </div>
              )}
            </div>
          </div>
          <style>{`
            @keyframes slide-in-left {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
            .animate-slide-in-left {
              animation: slide-in-left 0.3s ease;
            }
          `}</style>
        </>
      )}
    </header>
  );
};

export default Header;
