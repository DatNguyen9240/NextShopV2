"use client";

import ProductGrid from "@/app/components/ProductGrid";
import ViewModeSwitcher from "@/app/components/ViewModeSwitcher";
import { useGridMode } from "@/app/hooks/useGridMode";
import { useSearchParams } from 'next/navigation';
import useProducts from '@/app/hooks/useProducts';
import { useEffect, Suspense } from 'react';
import { useFilter } from '@/app/context/FilterContext';
import Link from 'next/link';
import { ChevronRight } from "@/app/components/ChevronRight";

function SearchPageContent() {
  const { cols, setCols, modes } = useGridMode();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');

  const { filters, setFilters } = useFilter();

  // Clear categoryId when entering search page
  useEffect(() => {
    if (filters?.categoryId) {
      setFilters({ categoryId: null });
    }
  }, [filters?.categoryId, setFilters]);

  const { products, loading, error } = useProducts({
    search: searchQuery || undefined,
    minPrice: filters?.minPrice ?? undefined,
    maxPrice: filters?.maxPrice ?? undefined,
    sort: filters?.sort ?? undefined,
    pageSize: 24,
  });

  return (
    <div className="overflow-hidden lg:px-4">
      <div className="mt-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6" aria-label="breadcrumb">
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium">
            {searchQuery ? `Tìm kiếm: "${searchQuery}"` : 'Tìm kiếm'}
          </span>
        </nav>
      </div>

      <div className="mb-8">
        <ViewModeSwitcher value={cols} onChange={setCols} modes={modes} />
      </div>

      {!searchQuery ? (
        <div className="text-center text-gray-600 py-12">
          <p className="text-lg">Nhập từ khóa để tìm kiếm sản phẩm</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-600 py-12">
          <p className="text-lg mb-2">Không tìm thấy sản phẩm phù hợp với &ldquo;{searchQuery}&rdquo;</p>
          <p className="text-sm">Vui lòng thử từ khóa khác</p>
        </div>
      ) : (
        <ProductGrid products={products} cols={cols} />
      )}
    </div>
  );
}

const SearchPage = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
};

export default SearchPage;
