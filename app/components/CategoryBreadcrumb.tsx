"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCategories } from "@/app/context/CategoryContext";
import { getCategoryById, hasChildrenInCache, getAllCategoriesCached, hasChildrenFromAll, Category } from "@/app/services/categoryService";
import CategoryFlyout from "./CategoryFlyout";
import { ChevronRight } from "./ChevronRight";
import { useFilter } from '@/app/context/FilterContext';

// cache to prevent duplicate category fetches
const fetchedCategoryCache = new Map<string, Promise<Category | null> | Category | null>();
async function fetchCategoryOnce(id: string) {
  const existing = fetchedCategoryCache.get(id);
  if (existing) {
    if (existing instanceof Promise) return existing;
    return existing;
  }
  const p = (async () => {
    try {
      const c = await getCategoryById(id);
      fetchedCategoryCache.set(id, c ?? null);
      return c ?? null;
    } catch {
      fetchedCategoryCache.set(id, null);
      return null;
    }
  })();
  fetchedCategoryCache.set(id, p);
  return p;
}

const CategoryBreadcrumb: React.FC = () => {
  const rawId = useParams().id;
  const routeId = Array.isArray(rawId) ? rawId[0] : rawId;
  const { categories } = useCategories();
  const { filters } = useFilter();

  // If filter.categoryId is explicitly set to null -> it's the "Tất cả" case, treat as no id.
  const effectiveId = (filters && 'categoryId' in filters && filters.categoryId === null)
    ? undefined
    : (filters?.categoryId ?? routeId);

  const catMap = useMemo(() => new Map((categories || []).map((c: Category) => [c.categoryId, c])), [categories]);

  const [chain, setChain] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);


  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function buildChain() {
      const currentId = effectiveId;
      if (!currentId) {
        if (mounted) setChain([]);
        return;
      }

      // prefer context
      const local = catMap.get(currentId) ?? null;
      if (local) {
        const out: Category[] = [];
        let cur: Category | undefined | null = local;
        while (cur) {
          out.unshift(cur);
          if (!cur.parentId) break;
          cur = catMap.get(cur.parentId) ?? null;
        }
        if (mounted) setChain(out);
        return;
      }

      // fallback to fetching
      setLoading(true);
      try {
        const fetched = await fetchCategoryOnce(currentId);
        if (!fetched) {
          if (mounted) setChain([]);
          return;
        }
        const out: Category[] = [];
        out.unshift(fetched);
        let parentId = fetched.parentId;
        while (parentId) {
          const parentFromMap = catMap.get(parentId);
          if (parentFromMap) {
            out.unshift(parentFromMap);
            break;
          }
          const parent = await fetchCategoryOnce(parentId);
          if (!parent) break;
          out.unshift(parent);
          parentId = parent.parentId;
        }
        if (mounted) setChain(out);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void buildChain();
    return () => { mounted = false; };
  }, [effectiveId, catMap]);


  const leaf = chain.length ? chain[chain.length - 1] : undefined;

  return (
    <>
      <nav className="flex items-center gap-2 text-sm text-gray-600 mt-3 mb-6">
        <Link href="/" className="hover:underline">Trang chủ</Link>

      {loading ? (
        <span className="text-gray-400">- Đang tải...</span>
      ) : (
        chain.map((c) => (
          <div
            key={c.categoryId}
            className="relative flex items-center gap-2"
            onMouseEnter={() => {
              if (hideTimeoutRef.current) { clearTimeout(hideTimeoutRef.current); hideTimeoutRef.current = null; }
              setHoveredId(c.categoryId);
            }}
            onMouseLeave={() => {
              if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
              hideTimeoutRef.current = window.setTimeout(() => setHoveredId(null), 150);
            }}
          >
            <ChevronRight className="text-gray-400 w-3 h-3" />

            <Link
              href={`/products/category/${c.categoryId}`}
              className="hover:underline flex items-center gap-1"
              onMouseEnter={() => {
                // lazy preload full category list so indicator shows when available
                void getAllCategoriesCached();
              }}
            >
              {c.name}
              {c.categoryId === leaf?.categoryId && ((categories || []).some(ch => ch.parentId === c.categoryId) || hasChildrenFromAll(c.categoryId) || hasChildrenInCache(c.categoryId)) && (
                <span className="ml-1 inline-block text-gray-400 w-3 h-3" aria-hidden>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path d="M5.23 7.21a.75.75 0 011.06-.02L10 10.585l3.71-3.4a.75.75 0 011.04 1.08l-4.24 3.89a.75.75 0 01-1.02 0L5.25 8.28a.75.75 0 01-.02-1.06z"/>
                  </svg>
                </span>
              )}
            </Link>

            {/* Flyout: visible when hovered, vertically centered with parent for better alignment */}
            <div
              className={`absolute left-full top-1/2 -translate-y-1/2 z-50 ml-4 ${hoveredId === c.categoryId ? 'block' : 'hidden'}`}
              onMouseEnter={() => {
                if (hideTimeoutRef.current) { clearTimeout(hideTimeoutRef.current); hideTimeoutRef.current = null; }
                setHoveredId(c.categoryId);
              }}
              onMouseLeave={() => {
                if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = window.setTimeout(() => setHoveredId(null), 150);
              }}
            >
              <CategoryFlyout parentId={c.categoryId} />
            </div>
          </div>
        ))
      )}
      </nav>


    </>
  );
};

export default CategoryBreadcrumb;
