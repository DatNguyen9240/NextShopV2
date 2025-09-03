"use client";
import React, { useState } from "react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import CartIcon from "./CartIcon";
import Badge from "./Badge";
import Hotline from "./Hotline";
import { SignUpButton } from "./Button";

const Header = () => {
  const [openModal, setOpenModal] = useState(false);
  const notificationCount = 2;
  const cartCount = 0;

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

        {/* Logo */}
        <div className="hidden lg:flex">
          <Logo />
        </div>

        {/* Thanh tìm kiếm chỉ hiện khi md trở lên */}
        <div className="hidden md:flex flex-1 justify-center items-center mx-10">
          <SearchBar />
        </div>

        {/* Thông báo, giỏ hàng, hotline, đăng ký */}
        <div className="flex items-center gap-4">
          {/* Badge thông báo */}
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

          {/* Giỏ hàng */}
          <div className="relative mr-2">
            <CartIcon />
            <Badge count={cartCount} />
          </div>

          {/* Hotline */}
          <div className="hidden lg:flex">
            <Hotline phone="0975324568" />
          </div>

          {/* Đăng ký */}
          <div className="hidden lg:flex">
            <SignUpButton />
          </div>
        </div>
      </div>
      {/* Thanh tìm kiếm nằm dưới chỉ khi md trở xuống */}
      <div className="md:hidden max-w-screen-xl mx-auto px-14 mt-3">
        <SearchBar />
      </div>

      {/* Modal chỉ hiện số điện thoại và đăng ký/đăng nhập */}
      {openModal && (
        <>
          {/* Overlay trắng mờ */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpenModal(false)}
          />
          {/* Modal content */}
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
            {/* Sắp xếp ngang nhau */}
            <div className="flex items-center justify-center gap-4">
              <Hotline phone="0975324568" />
              <SignUpButton />
            </div>
          </div>
          {/* Animation keyframes */}
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
