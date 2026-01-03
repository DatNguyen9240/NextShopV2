"use client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { getChildCategories, Category } from "@/app/services/categoryService";
import { ChevronRight } from "./ChevronRight";

// simple cache to avoid refetching same parent multiple times
const childrenCache = new Map<string, Promise<Category[] | null> | Category[] | null>();

export default function CategoryFlyout({ parentId }: { parentId: string }) {
  const [children, setChildren] = useState<Category[]>([]);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
    };
  }, []);

  async function fetchOnce(pid: string) {
    const existing = childrenCache.get(pid);
    if (existing) {
      if (existing instanceof Promise) return existing;
      return existing;
    }
    const p = (async () => {
      try {
        const list = await getChildCategories(pid);
        childrenCache.set(pid, list ?? []);
        return list ?? [];
      } catch (e) {
        childrenCache.set(pid, null);
        return null;
      }
    })();
    childrenCache.set(pid, p);
    return p;
  }

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    void (async () => {
      const list = await fetchOnce(parentId);
      if (mounted) setChildren(list ?? []);
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [parentId]);

  if (!children || children.length === 0) return null;

  return (
    <div className="absolute left-full top-1/2 -translate-y-1/2 -translate-x-2 bg-white border rounded shadow-lg min-w-[220px] z-50">
      {children.map((c, idx) => (
        <div
          key={c.categoryId}
          className="relative"
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) { clearTimeout(hoverTimeoutRef.current); hoverTimeoutRef.current = null; }
            setHoverId(c.categoryId);
          }}
          onMouseLeave={() => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = window.setTimeout(() => setHoverId(null), 150);
          }}
        >
          <Link
            href={`/products/category/${c.categoryId}`}
            className={`block px-4 py-2 text-sm text-gray-700 flex items-center justify-between hover:bg-gray-50 transition-colors ${idx < children.length - 1 ? 'border-b' : ''}`}
          >
            <span>{c.name}</span>
            <ChevronRight className="text-gray-400" />
          </Link>

          {hoverId === c.categoryId && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3">
              <CategoryFlyout parentId={c.categoryId} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
