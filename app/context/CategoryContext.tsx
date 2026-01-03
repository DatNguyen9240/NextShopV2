"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getCategories, Category } from "@/app/services/categoryService";

type CategoryContextValue = {
  categories: Category[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const CategoryContext = createContext<CategoryContextValue | undefined>(undefined);

// Module-level cache to avoid double fetch across multiple providers (hot reloads)
let cachedCategories: Category[] | null = null;
let pendingFetch: Promise<void> | null = null;

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(cachedCategories ?? []);
  const [loading, setLoading] = useState<boolean>(cachedCategories ? false : true);

  const fetch = useCallback(async () => {
    if (pendingFetch) return pendingFetch;
    setLoading(true);
    pendingFetch = (async () => {
      try {
        const data = await getCategories();
        cachedCategories = data;
        setCategories(data);
      } catch (e) {
        // keep previous categories if available
        console.error('CategoryProvider: failed to fetch categories', e);
        setCategories(cachedCategories ?? []);
      } finally {
        setLoading(false);
        pendingFetch = null;
      }
    })();
    return pendingFetch;
  }, []);

  useEffect(() => {
    if (cachedCategories) return; // already have data
    void fetch();
  }, [fetch]);

  const refresh = useCallback(async () => {
    await fetch();
  }, [fetch]);

  return (
    <CategoryContext.Provider value={{ categories, loading, refresh }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error('useCategories must be used within CategoryProvider');
  return ctx;
};

export default CategoryProvider;
