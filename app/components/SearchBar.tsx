"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import SearchIcon from "./SearchIcon";

const SearchBar = React.memo(function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [value, setValue] = useState("");

  // Lấy giá trị search từ URL khi ở trang search
  useEffect(() => {
    if (pathname?.includes('/products/search')) {
      const searchQuery = searchParams.get('q');
      if (searchQuery) {
        setValue(searchQuery);
      }
    }
  }, [pathname, searchParams]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim()) {
        router.push(`/products/search?q=${encodeURIComponent(value.trim())}`);
      }
    },
    [value, router]
  );

  const handleClear = useCallback(() => {
    setValue("");
  }, []);

  return (
    <form onSubmit={handleSubmit} className="relative w-[420px] max-w-full">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Tìm kiếm sản phẩm, quần áo, túi xách, balo, ví,..."
        className="w-full py-2 pl-4 pr-24 rounded-full border border-gray-300 bg-gray-50 text-base text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-gray-400"
      />
      
      {value.trim() && (
        <>
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-20 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            aria-label="Xóa"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors"
          >
            Tìm
          </button>
        </>
      )}
      
      {!value.trim() && (
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400"
          disabled
        >
          <SearchIcon />
        </button>
      )}
    </form>
  );
});

export default SearchBar;
