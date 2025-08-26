"use client";
import React, { useState } from "react";

const menu = [
  { label: "Áo thun", href: "#", icon: "👕" }, // T-shirt emoji
  { label: "Áo sơ mi", href: "#", icon: "👔" }, // Shirt + tie
  {
    label: "Áo",
    href: "#",
    icon: "🧥", // Coat – phù hợp cho áo khoác/áo len/áo vest
    subMenu: [
      { label: "Áo khoác", href: "#", icon: "🧥" },
      { label: "Áo len", href: "#", icon: "🧶" }, // Yarn – biểu tượng ấm áp
      { label: "Áo vest", href: "#", icon: "🤵" }, // Vest – biểu tượng vest sang trọng
    ],
  },
  { label: "Quần áo nam", href: "#", icon: "👖" }, // Jeans – phù hợp quần nam
  { label: "Quần áo nữ", href: "#", icon: "👗" }, // Dress – phù hợp quần áo nữ
  { label: "Túi xách", href: "#", icon: "👜" }, // Handbag
  { label: "Balo", href: "#", icon: "🎒" }, // Backpack
  { label: "Ví", href: "#", icon: "👛" }, // Purse wallet
];

const Nav = React.memo(function Nav() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <nav className="w-full bg-white border-b border-gray-200 flex justify-center">
      <div className="flex items-center gap-12 py-4">
        {menu.map((item, idx) => (
          <div
            key={item.label}
            className="relative group"
            onMouseEnter={() => item.subMenu && setOpenIndex(idx)}
            onMouseLeave={() => item.subMenu && setOpenIndex(null)}
          >
            <a href={item.href} className="flex items-center min-w-[80px] px-2">
              <span className="text-2xl mr-2 transition-colors duration-200 ease-in-out group-hover:text-green-500">
                {item.icon}
              </span>
              <span className="text-sm font-bold tracking-wide uppercase text-gray-700 transition-colors duration-200 ease-in-out group-hover:text-green-600">
                {item.label}
              </span>
              {item.subMenu && (
                <svg
                  className="ml-1 w-3 h-3 text-gray-400 transition-transform duration-200 ease-in-out group-hover:text-green-500 group-hover:-rotate-180"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              )}
            </a>
            {item.subMenu && (
              <div
                className={`absolute left-0 top-full mt-2 bg-white shadow-lg rounded z-10 min-w-[160px] overflow-hidden transition-all duration-200 ease-in-out ${
                  openIndex === idx
                    ? "opacity-100 visible transform scale-100"
                    : "opacity-0 invisible transform scale-95"
                }`}
              >
                {item.subMenu.map((sub) => (
                  <a
                    key={sub.label}
                    href={sub.href}
                    className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 whitespace-nowrap transition-colors duration-150 ease-in-out"
                  >
                    {sub.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
});

export default Nav;
