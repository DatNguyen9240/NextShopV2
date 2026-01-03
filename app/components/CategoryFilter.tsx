"use client";

import React, { useEffect, useState } from "react";
import { useCategories } from '@/app/context/CategoryContext';
import { useFilter } from '@/app/context/FilterContext';

type Category = {
  categoryId: string;
  name: string;
  children?: Category[];
};

const CategoryFilter: React.FC = () => {
  const { categories, loading } = useCategories();
  const [selected, setSelected] = useState<string | null>(null);
  const { filters, setFilters } = useFilter();

  // Keep the local selected radio in sync with global filters (e.g., when navigating via nav)
  React.useEffect(() => {
    setSelected(filters?.categoryId ?? null);
  }, [filters?.categoryId]);



  const renderCategory = (cat: any, level = 0) => {
    const id = cat.categoryId ?? cat.categoryId ?? cat.CategoryId ?? String(cat.name);
    const name = cat.name ?? cat.Name ?? "Unnamed";
    return (
      <li key={id} className={`text-sm text-gray-900 ${level > 0 ? "pl-3" : ""}`}>
        <label className="flex items-center w-full cursor-pointer">
          <input
            type="radio"
            name="category"
            value={id}
            checked={selected === id}
            onChange={() => { setSelected(id); setFilters({ categoryId: id }); }}
            className="mr-3 w-4 h-4 accent-black"
          />
          <span className="truncate">{name}</span>
        </label>
      </li>
    );
  };

  return (
    <div>
      <h2 className="font-semibold mb-4 text-sm text-gray-800 tracking-wide">Danh mục sản phẩm</h2>

      <ul className="space-y-3 max-h-[280px] md:max-h-[320px] overflow-y-auto pr-2 custom-scroll">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          ))
        ) : !categories || categories.length === 0 ? (
          <li className="text-sm text-gray-500">Không có danh mục</li>
        ) : (
          <>
            <li className="text-sm text-gray-900">
              <label className="flex items-center w-full cursor-pointer">
                <input type="radio" name="category" value="" checked={!selected} onChange={() => { setSelected(null); setFilters({ categoryId: null }); }} className="mr-3 w-4 h-4 accent-black" />
                <span className="truncate">Tất cả</span>
              </label>
            </li>
            {categories.map((c: any) => (
              <div key={c.categoryId ?? c.CategoryId ?? c.name}>
                {renderCategory(c, 0)}
                {c.children && c.children.length > 0 && (
                  <ul className="ml-4 mt-1 space-y-1">
                    {c.children.map((ch: any) => renderCategory(ch, 1))}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}
      </ul>
    </div>
  );
};

export default CategoryFilter;
