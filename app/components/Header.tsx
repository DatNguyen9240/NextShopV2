import React from "react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import CartIcon from "./CartIcon";
import Badge from "./Badge";
import Hotline from "./Hotline";
import SignUpButton from "./SignUpButton";

const Header = () => {
  // Số lượng thông báo và giỏ hàng có thể lấy từ props hoặc context
  const notificationCount = 2;
  const cartCount = 0;

  return (
    <header className="bg-white border-b border-gray-200 py-3">
      <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Logo />
        {/* Thanh tìm kiếm */}
        <div className="flex-1 flex justify-center items-center mx-10">
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
          <Hotline phone="0975324568" />
          {/* Đăng ký */}
          <SignUpButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
