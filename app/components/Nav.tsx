"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavProps {
  categories: any[];
}

const Nav = React.memo(function Nav({ categories }: NavProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const pathname = usePathname();

  // Lấy các category cha (không có ParentId)
  const parentCategories = (categories || []).filter((cat) => !cat.parentId).slice(0, 6);

  // Render menu động
  const menu = [
    { label: "Trang chủ", href: "/", icon: undefined, subMenu: undefined },
    ...parentCategories.map((cat) => ({
      label: cat.name,
      href: `/products/category/${cat.categoryId}`,
      icon: cat.icon,
      subMenu: cat.children?.length
        ? (cat.children as any[]).map((sub) => ({
            label: sub.name,
            href: `/products/category/${sub.categoryId}`,
            icon: sub.icon,
          }))
        : undefined,
    })),
  ];

  // Auto-open parent menu when current pathname matches a parent or its child
  useEffect(() => {
    if (!pathname) return;
    const idx = menu.findIndex((item) => {
      if (item.href === "/") return pathname === "/";
      if (pathname.startsWith(item.href)) return true;
      if (item.subMenu && item.subMenu.some((s: any) => pathname.startsWith(s.href))) return true;
      return false;
    });
    setOpenIndex(idx >= 0 ? idx : null);
  }, [pathname]);

  return (
    <nav className="w-full bg-white border-b border-gray-200 flex justify-center hidden lg:flex">
      <div className="flex items-center gap-12 py-4 z-99">
        {menu.map((item, idx) => (
          <div
            key={item.label}
            className="relative group"
            onMouseEnter={() => item.subMenu && setOpenIndex(idx)}
            onMouseLeave={() => item.subMenu && setOpenIndex(null)}
          >
            <Link
              href={item.href}
              className={`flex items-center min-w-[80px] px-2 ${
                pathname === item.href || (item.subMenu && item.subMenu.some((s: any) => pathname.startsWith(s.href)))
                  ? "text-green-600"
                  : "text-gray-700"
              }`}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              <span className="text-2xl mr-2 transition-colors duration-200 ease-in-out group-hover:text-green-500">
                {item.icon}
              </span>
              <span className={`text-sm font-bold tracking-wide uppercase transition-colors duration-200 ease-in-out ${
                pathname === item.href || (item.subMenu && item.subMenu.some((s: any) => pathname.startsWith(s.href)))
                  ? "text-green-600"
                  : "text-gray-700 group-hover:text-green-600"
              }`}>
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
            </Link>
            {item.subMenu && (
              <div
                className={`absolute left-0 top-full mt-2 bg-white shadow-lg rounded z-10 min-w-[160px] overflow-hidden transition-all duration-200 ease-in-out ${
                  openIndex === idx
                    ? "opacity-100 visible transform scale-100"
                    : "opacity-0 invisible transform scale-95"
                }`}
              >
                {item.subMenu.map((sub) => (
                  <Link
                    key={sub.label}
                    href={sub.href}
                    className={`block px-4 py-2 whitespace-nowrap transition-colors duration-150 ease-in-out ${
                      pathname === sub.href || pathname.startsWith(sub.href)
                        ? "bg-green-50 text-green-600 font-semibold"
                        : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                    }`}
                    aria-current={pathname === sub.href ? "page" : undefined}
                  >
                    {sub.label}
                  </Link>
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
