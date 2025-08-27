"use client";
import React, { useState, useCallback } from "react";
import SearchIcon from "./SearchIcon";

const SearchBar = React.memo(function SearchBar() {
  const [value, setValue] = useState("");

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      // Xử lý tìm kiếm ở đây
      // alert(`Tìm kiếm: ${value}`);
    },
    [] // loại bỏ 'value' khỏi dependency array
  );

  return (
    <form onSubmit={handleSubmit} className="relative w-[420px] max-w-full">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Tìm kiếm sản phẩm, quần áo, túi xách, balo, ví,..."
        className="w-full py-2 pl-4 pr-10 rounded-full border border-gray-300 bg-gray-50 text-base text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-gray-400"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
      >
        <SearchIcon />
      </button>
    </form>
  );
});

export default SearchBar;
