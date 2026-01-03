"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCategories } from "@/app/context/CategoryContext";
import { getCategoryById, Category } from "@/app/services/categoryService";
import CategoryFlyout from "./CategoryFlyout";
import { ChevronRight } from "./ChevronRight";
import { useFilter } from '@/app/context/FilterContext';

// cache to prevent duplicate category fetches
const fetchedCategoryCache = new Map<string, Promise<Category | null> | Category | null>();
// cache for children lists for parents
const fetchedChildrenCache = new Map<string, Promise<Category[] | null> | Category[] | null>();

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
    } catch (e) {
      fetchedCategoryCache.set(id, null);
      return null;
    }
  })();
  fetchedCategoryCache.set(id, p);
  return p;
}

async function fetchChildrenOnce(parentId: string): Promise<Category[] | null> {
  const existing = fetchedChildrenCache.get(parentId);
  if (existing) {
    if (existing instanceof Promise) return existing;
    return existing;
  }
  const p = (async () => {
    try {
      const res = await fetch(`/api/Category/${parentId}/children`);
      if (!res.ok) return null;
      const payload = await res.json();
      const list: Category[] = payload?.data ?? [];
      fetchedChildrenCache.set(parentId, list);
      return list;
    } catch (e) {
      fetchedChildrenCache.set(parentId, null);
      return null;
    }
  })();
  fetchedChildrenCache.set(parentId, p);
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

  const [rootChildren, setRootChildren] = useState<Category[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);

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

  // load root's immediate children (context first, then API)
  useEffect(() => {
    let mounted = true;
    async function loadRootChildren() {
      if (!chain || chain.length === 0) {
        if (mounted) setRootChildren([]);
        return;
      }
      const root = chain[0];
      const fromContext = (categories || []).filter(c => c.parentId === root.categoryId);
      if (fromContext.length > 0) {
        if (mounted) setRootChildren(fromContext);
        return;
      }
      if (mounted) setLoadingChildren(true);
      try {
        const fetched = await fetchChildrenOnce(root.categoryId);
        if (mounted) setRootChildren(fetched ?? []);
      } finally {
        if (mounted) setLoadingChildren(false);
      }
    }
    void loadRootChildren();
    return () => { mounted = false; };
  }, [chain, categories]);

  const root = chain[0];
  // reflect selection coming from filter sidebar
  const activeCategoryId = (filters && 'categoryId' in filters && filters.categoryId !== undefined)
    ? filters.categoryId
    : routeId;

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
              onMouseEnter={async () => {
                // lazy preload children so indicator shows when available
                const existing = fetchedChildrenCache.get(c.categoryId);
                if (!existing) {
                  // trigger a fetch but don't block hover
                  void fetchChildrenOnce(c.categoryId);
                }
              }}
            >
              {c.name}
              {/* show indicator only when we know children exist */}
              {((categories || []).some(ch => ch.parentId === c.categoryId) || (Array.isArray(fetchedChildrenCache.get(c.categoryId)) && (fetchedChildrenCache.get(c.categoryId) as Category[]).length > 0)) && (
                <span className="ml-1">
                  <ChevronRight className="text-gray-400 w-3 h-3" />
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

      {/* persistent root children chips (visible under breadcrumb) */}
      {root && (
        <div>
          {loadingChildren ? (
            <div className="text-sm text-gray-500">Đang tải danh mục con...</div>
          ) : rootChildren?.length ? (
            <div className="flex flex-wrap gap-2">
              {rootChildren.map(ch => (
                <Link
                  key={ch.categoryId}
                  href={`/products/category/${ch.categoryId}`}
                  className={`px-3 py-1 rounded border ${ch.categoryId === activeCategoryId ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                >
                  {ch.name}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </>
  );
};

export default CategoryBreadcrumb;
