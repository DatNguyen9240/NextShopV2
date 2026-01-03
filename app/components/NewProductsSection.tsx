"use client";
import React from "react";
import ProductsTitle from "./ProductsTitle";
import ProductGrid from "./ProductGrid";
import Pagination from "./Pagination";
import { useBreakpoint } from "@/app/hooks/useBreakpoint";
import useProducts from "@/app/hooks/useProducts"; 

const PAGE_SIZE = 12;

const PAGE_SIZE_CONST = PAGE_SIZE;

const NewProductsSection: React.FC = () => {
  const breakpoint = useBreakpoint();
  const cols =
    breakpoint === "base" || breakpoint === "sm"
      ? 2
      : breakpoint === "md"
      ? 3
      : 4;

  const { products, loading, error, page, setPage, totalPages } = useProducts({ section: '', initialPage: 1, pageSize: PAGE_SIZE_CONST });

  return (
    <section className="w-full mt-10 px-2 sm:px-4">
      <div className="mb-4">
        <ProductsTitle
          title="Sản phẩm mới nhất"
          description="Sản phẩm được cập nhật mỗi ngày."
        />
      </div>
      {loading ? (
        <div className="py-8">Đang tải...</div>
      ) : error ? (
        <div className="py-8 text-red-600">Lỗi: {error}</div>
      ) : (
        <ProductGrid products={products} cols={cols} />
      )}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        maxButtons={5}
      />
    </section>
  );
};

export default NewProductsSection;
