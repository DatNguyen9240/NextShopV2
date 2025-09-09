"use client";
import React, { useState } from "react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import CartIcon from "./CartIcon";
import Badge from "./Badge";
import Hotline from "./Hotline";
import { SignUpButton } from "./Button";
import { useRouter } from "next/navigation";

const Header = () => {
  const [openModal, setOpenModal] = useState(false);
  const notificationCount = 2;
  const cartCount = 0;
  const router = useRouter();

  return (
    <header className="bg-white border-b border-gray-200 py-3">
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
            <SignUpButton />
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
            <div className="flex items-center justify-center gap-4">
              <Hotline phone="0975324568" />
              <SignUpButton />
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
