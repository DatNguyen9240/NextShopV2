"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { getProducts, GetProductsParams } from "../services/productService";
import { Product } from "../components/ProductCard";

type UseProductsOptions = GetProductsParams & {
  initialPage?: number;
  autoFetch?: boolean;
};

export default function useProducts({
  section,
  categoryId,
  limit,
  sort,
  initialPage = 1,
  pageSize = 12,
  autoFetch = true,
}: UseProductsOptions = {}) {
  const [page, setPage] = useState<number>(initialPage);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // keep current filter ref to avoid race conditions where older fetches overwrite newer filtered results
  const filterRef = useRef<{ section?: string; categoryId?: string | undefined }>({ section, categoryId });

  const mapProducts = (items: any[]): Product[] =>
    items.map((p: any) => {
      const v = p.variants && p.variants.length ? (p.variants.find((x: any) => x.isDefault) || p.variants[0]) : null;

      return {
        id: p.productId ?? p.productId?.toString() ?? p.id ?? Math.random().toString(),
        label: p.name ?? p.label ?? "",
        priceOld: v ? String(v.basePrice ?? "") : "",
        priceNew: v ? String(v.priceAfterDiscount ?? v.basePrice ?? "0") : "0",
        percent: v && v.discountPercent ? `${v.discountPercent}%` : "",
        inStock: v ? (v.stockQuantity ?? 0) > 0 : true,
        image: v?.imageUrl ?? p.image ?? "/products/placeholder.jpg",
        imageHover: v?.imgHover ?? p.imageHover,
        rating: Math.round(p.averageRating ?? 0),
      };
    });

  const fetchPage = useCallback(async (pageNumber: number) => {
    setLoading(true);
    setError(null);
    const usedCategory = categoryId;
    const usedSection = section;
    try {
      const params: GetProductsParams = {};
      if (usedCategory) params.categoryId = usedCategory;
      if (limit) params.limit = limit;
      if (sort) params.sort = sort;
      if (usedSection) params.section = usedSection;
      if (pageNumber !== undefined) params.page = pageNumber;
      if (pageSize !== undefined) (params as any).pageSize = pageSize;

      console.log('[useProducts] requesting', params, 'currentFilter', filterRef.current);
      const data = await getProducts(params);

      // ensure this response still matches current filter to avoid stale overwrite
      if (filterRef.current.section !== usedSection || filterRef.current.categoryId !== usedCategory) {
        // discard stale response
        console.log('[useProducts] discarding stale response for', params, 'currentFilter', filterRef.current);
        return;
      }

      console.log('[useProducts] accepted response for', params, 'dataCount', Array.isArray(data) ? data.length : (data.items || []).length);

      if (Array.isArray(data)) {
        setProducts(mapProducts(data));
        setTotalPages(1);
      } else {
        const items = data.items || data.Items || [];
        setProducts(mapProducts(items));
        setTotalPages(data.totalPages ?? data.TotalPages ?? 1);
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId, limit, sort, section, pageSize]);

  useEffect(() => {
    // track current filters to prevent stale responses overwriting results
    filterRef.current = { section, categoryId };

    if (!autoFetch) return;
    fetchPage(page);
  }, [page, fetchPage, autoFetch, section, categoryId]);

  const refresh = useCallback(() => fetchPage(page), [fetchPage, page]);

  return { products, loading, error, page, setPage, totalPages, refresh };
}
