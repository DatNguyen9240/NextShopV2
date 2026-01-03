"use client";
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type FilterState = {
  categoryId?: string | null;
  subCategoryId?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  sort?: string | null;
  rating?: number | null;
};

type FilterContextValue = {
  filters: FilterState;
  setFilters: (next: Partial<FilterState>) => void;
  resetFilters: () => void;
};

const defaultFilters: FilterState = {};
const FilterContext = createContext<FilterContextValue | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode; initial?: FilterState }> = ({ children, initial }) => {
  const [filters, setFiltersState] = useState<FilterState>({ ...defaultFilters, ...(initial ?? {}) });

  const setFilters = useCallback((next: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...next }));
  }, []);

  const resetFilters = useCallback(() => setFiltersState({ ...defaultFilters }), []);

  const value = useMemo(() => ({ filters, setFilters, resetFilters }), [filters, setFilters, resetFilters]);

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

export const useFilter = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilter must be used within FilterProvider');
  return ctx;
};
