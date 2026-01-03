"use client";

import ProductGrid from "@/app/components/ProductGrid";
import ViewModeSwitcher from "@/app/components/ViewModeSwitcher";
import { useGridMode } from "@/app/hooks/useGridMode";
import useProducts from '@/app/hooks/useProducts';
import { useEffect } from 'react';
import { useFilter } from '@/app/context/FilterContext';
import { usePathname } from 'next/navigation';
import CategoryBreadcrumb from '@/app/components/CategoryBreadcrumb';

const CategoryIndexPage = () => {
  const { cols, setCols, modes } = useGridMode();
  const { filters, setFilters } = useFilter();

  // Selecting "Tất cả" navigates here; ensure filters.categoryId is explicitly null to mean "no category"
  const pathname = usePathname();

  useEffect(() => {
    // Only set when on the index path and not already null to avoid unnecessary re-renders
    if (pathname !== '/products/category') return;
    if (!(filters && 'categoryId' in filters && filters.categoryId === null)) {
      setFilters({ categoryId: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const effectiveCategoryId = (filters && 'categoryId' in filters && filters.categoryId === null)
    ? undefined
    : (filters?.categoryId ?? undefined);

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

export default CategoryIndexPage;
