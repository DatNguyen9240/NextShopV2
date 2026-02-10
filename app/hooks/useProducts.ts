"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { getProducts, GetProductsParams } from "../services/productService";
import { Product } from "../components/ProductCard";

type UseProductsOptions = GetProductsParams & {
  initialPage?: number;
  autoFetch?: boolean;
};

export default function useProducts({
  categoryId,
  limit,
  sort,
  minPrice,
  maxPrice,
  rating,
  search,
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
  const filterRef = useRef<{ categoryId?: string | undefined; minPrice?: number; maxPrice?: number; sort?: string; rating?: number | null; search?: string }>({ categoryId, minPrice, maxPrice, sort, rating, search });

  type ApiVariant = { isDefault?: boolean; basePrice?: number; priceAfterDiscount?: number; discountPercent?: number; stockQuantity?: number; imageUrl?: string; imgHover?: string };
  type ApiProduct = { productId?: string | number; id?: string | number; name?: string; label?: string; variants?: ApiVariant[]; image?: string; imageHover?: string; averageRating?: number };

  const mapProducts = useCallback((items: ApiProduct[]): Product[] =>
    items.map((p) => {
      const v: ApiVariant | null = p.variants && p.variants.length ? (p.variants.find((x) => x.isDefault) || p.variants[0]) : null;

      return {
        id: (p.productId ?? p.id ?? Math.random().toString())?.toString(),
        label: p.name ?? p.label ?? "",
        priceOld: v ? String(v.basePrice ?? "") : "",
        priceNew: v ? String(v.priceAfterDiscount ?? v.basePrice ?? "0") : "0",
        percent: v && v.discountPercent ? `${v.discountPercent}%` : "",
        inStock: v ? (v.stockQuantity ?? 0) > 0 : true,
        image: v?.imageUrl ?? p.image ?? "/products/placeholder.jpg",
        imageHover: v?.imgHover ?? p.imageHover,
        rating: Math.round(p.averageRating ?? 0),
      };
    }), []);

  const inflightKeysRef = useRef<Set<string>>(new Set());
  // remember last completed request key to avoid immediately refetching the exact same params
  const lastCompletedKeyRef = useRef<string | null>(null);
  // timer handle to clear delayed reset of lastCompletedKeyRef
  const lastCompletedTimerRef = useRef<number | null>(null);

  // debounce timer to batch quick successive filter changes into one fetch
  const fetchTimerRef = useRef<number | null>(null);

  // clear any outstanding timers on unmount
  useEffect(() => () => {
    if (lastCompletedTimerRef.current) {
      clearTimeout(lastCompletedTimerRef.current);
      lastCompletedTimerRef.current = null;
    }
    if (fetchTimerRef.current) {
      clearTimeout(fetchTimerRef.current);
      fetchTimerRef.current = null;
    }
  }, []);

  const fetchPage = useCallback(async (pageNumber: number) => {
    const usedCategory = categoryId;
    const usedMinPrice = minPrice;
    const usedMaxPrice = maxPrice;
    const usedSort = sort;
    const usedRating = rating;
    const usedSearch = search;

    const keyObj = { categoryId: usedCategory, page: pageNumber, pageSize, search: usedSearch } as GetProductsParams;
    const key = JSON.stringify(keyObj);

    // If we already completed the exact same request recently, skip refetching
    if (lastCompletedKeyRef.current === key) {
      console.debug('[useProducts] skipping fetch because identical request was just completed', key);
      return;
    }

    // Skip duplicate processing if same request is already in-flight
    if (inflightKeysRef.current.has(key)) {
      console.debug('[useProducts] skipping duplicate in-flight fetch for', key);
      return;
    }

    inflightKeysRef.current.add(key);
    setLoading(true);
    setError(null);

    try {
      const params: GetProductsParams = {};
      if (usedCategory) params.categoryId = usedCategory;
      if (limit) params.limit = limit;
      if (usedSort) params.sort = usedSort;
      if (pageNumber !== undefined) params.page = pageNumber;
      if (pageSize !== undefined) params.pageSize = pageSize;
      if (usedMinPrice !== undefined) params.minPrice = usedMinPrice;
      if (usedMaxPrice !== undefined) params.maxPrice = usedMaxPrice;
      if (usedRating !== undefined && usedRating !== null) params.rating = usedRating;
      if (usedSearch) params.search = usedSearch;

      const data = await getProducts(params);

      // ensure this response still matches current filter to avoid stale overwrite
      if (
        filterRef.current.categoryId !== usedCategory ||
        filterRef.current.minPrice !== usedMinPrice ||
        filterRef.current.maxPrice !== usedMaxPrice ||
        filterRef.current.sort !== usedSort ||
        filterRef.current.rating !== usedRating ||
        filterRef.current.search !== usedSearch
      ) {
        // discard stale response
        return;
      }



      // mark this key as the last completed request so we avoid immediate duplicate refetches
      lastCompletedKeyRef.current = key;

      if (Array.isArray(data)) {
        setProducts(mapProducts(data));
        setTotalPages(1);
      } else {
        const items = data.items || data.Items || [];
        setProducts(mapProducts(items));
        setTotalPages(data.totalPages ?? data.TotalPages ?? 1);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load products");
      setProducts([]);
    } finally {
      inflightKeysRef.current.delete(key);
      setLoading(false);

      // reset lastCompletedKey after a short delay so future intentional refreshes are allowed
      // (prevents skipping legitimate follow-up requests while still avoiding immediate duplicates)
      if (lastCompletedTimerRef.current) clearTimeout(lastCompletedTimerRef.current);
      lastCompletedTimerRef.current = window.setTimeout(() => { lastCompletedKeyRef.current = null; lastCompletedTimerRef.current = null; }, 250);
    }
  }, [categoryId, limit, sort, pageSize, minPrice, maxPrice, rating, search, mapProducts]);

  // track current filters and avoid duplicate fetches when filters change
  const prevFiltersRef = useRef<{ categoryId?: string | undefined; minPrice?: number; maxPrice?: number; sort?: string; rating?: number | null; search?: string }>({ categoryId, minPrice, maxPrice, sort, rating, search });

  useEffect(() => {
    const filtersChanged =
      prevFiltersRef.current.categoryId !== categoryId ||
      prevFiltersRef.current.minPrice !== minPrice ||
      prevFiltersRef.current.maxPrice !== maxPrice ||
      prevFiltersRef.current.sort !== sort ||
      prevFiltersRef.current.rating !== rating ||
      prevFiltersRef.current.search !== search;

    // update previous snapshot and current filter ref
    prevFiltersRef.current = { categoryId, minPrice, maxPrice, sort, rating, search };
    filterRef.current = { categoryId, minPrice, maxPrice, sort, rating, search };

    if (!autoFetch) return;

    // If filters changed and we're not already on page 1, reset to page 1 and skip fetching the previous page.
    // The page update will trigger this effect again and then fetch page 1 once.
    if (filtersChanged && page !== 1) {
      setPage(1);
      return;
    }

    // Debounce rapid consecutive changes to avoid duplicate requests (e.g., route + filter sync)
    if (fetchTimerRef.current) {
      clearTimeout(fetchTimerRef.current);
      fetchTimerRef.current = null;
    }
    fetchTimerRef.current = window.setTimeout(() => {
      fetchPage(page);
      fetchTimerRef.current = null;
    }, 80);
  }, [page, fetchPage, autoFetch, categoryId, minPrice, maxPrice, sort, rating, search]);

  const refresh = useCallback(() => fetchPage(page), [fetchPage, page]);

  return { products, loading, error, page, setPage, totalPages, refresh };
}
