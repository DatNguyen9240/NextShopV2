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
import { User, Settings, LogOut, ChevronDown } from "lucide-react";

const Header = () => {
  const [openModal, setOpenModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const notificationCount = 2;
  const cartCount = 0;
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (showUserMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [showUserMenu]);

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
            <svg
              width="22"
              height="22"
              fill="none"
              stroke="#222"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M18 16v-5a6 6 0 10-12 0v5a2 2 0 002 2h8a2 2 0 002-2z" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <Badge count={notificationCount} />
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
