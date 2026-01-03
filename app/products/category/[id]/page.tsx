"use client";

import ProductGrid from "@/app/components/ProductGrid";
import ViewModeSwitcher from "@/app/components/ViewModeSwitcher";
import { useGridMode } from "@/app/hooks/useGridMode";

import { useParams } from 'next/navigation';
import useProducts from '@/app/hooks/useProducts';
import { useEffect } from 'react';
import { useFilter } from '@/app/context/FilterContext';
import CategoryBreadcrumb from '@/app/components/CategoryBreadcrumb';



const CategoryPage = () => {
  const { cols, setCols, modes } = useGridMode();
  // Normalise route param to string (useParams can return string | string[] | undefined)
  const rawId = useParams().id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const { filters, setFilters } = useFilter();

  // keep filters.categoryId synced with route id
  useEffect(() => {
    if (id) setFilters({ categoryId: id });
  }, [id, setFilters]);

  // If filters.categoryId is explicitly set to null it means "Tất cả" (no category filter)
  const effectiveCategoryId = (filters && 'categoryId' in filters && filters.categoryId === null)
    ? undefined
    : (filters?.categoryId ?? id);

  const { products, loading, error } = useProducts({
    categoryId: effectiveCategoryId,
    minPrice: filters?.minPrice ?? undefined,
    maxPrice: filters?.maxPrice ?? undefined,
    sort: filters?.sort ?? undefined,
    pageSize: 24,
  });

  return (
    <div className="overflow-hidden lg:px-4">
      <div className="mt-4">
        <CategoryBreadcrumb />
      </div>

      <div className="mb-8">
        <ViewModeSwitcher value={cols} onChange={setCols} modes={modes} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <ProductGrid products={products} cols={cols} />
      )}
    </div>
  );
};

export default CategoryPage;
