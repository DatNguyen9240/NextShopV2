import axiosClient from '../lib/axiosClient';

export interface Category {
  categoryId: string;
  name: string;
  parentId?: string;
  imageUrl?: string;
  icon?: string;
  createdAt: string;
  parentName?: string;
  children: Category[];
}

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await axiosClient.get('/api/Category');
    return res.data?.data || [];
  } catch {
    throw new Error('Failed to fetch categories');
  }
}

export async function getCategoryTree(): Promise<Category[]> {
  try {
    const res = await axiosClient.get('/api/Category/tree');
    return res.data?.data || [];
  } catch {
    throw new Error('Failed to fetch category tree');
  }
}

export async function getRootCategories(): Promise<Category[]> {
  try {
    const res = await axiosClient.get('/api/Category/root');
    return res.data?.data || [];
  } catch {
    throw new Error('Failed to fetch root categories');
  }
}

export async function getCategoryById(id: string): Promise<Category> {
  try {
    const res = await axiosClient.get(`/api/Category/${id}`);
    return res.data?.data;
  } catch {
    throw new Error('Failed to fetch category');
  }
}

const childCache = new Map<string, Promise<Category[] | null> | Category[] | null>();

// global all-categories cache (single fetch) to avoid many per-parent requests
let allCategoriesCache: Promise<Category[] | null> | Category[] | null = null;

export async function getAllCategoriesCached(): Promise<Category[] | null> {
  if (allCategoriesCache) {
    if (allCategoriesCache instanceof Promise) return allCategoriesCache;
    return allCategoriesCache;
  }

  const p = (async () => {
    try {
      const res = await axiosClient.get('/api/Category');
      const list: Category[] = res.data?.data ?? [];
      allCategoriesCache = list;
      return list;
    } catch {
      allCategoriesCache = null;
      return null;
    }
  })();

  allCategoriesCache = p;
  return p;
}

export function clearAllCategoriesCache() {
  allCategoriesCache = null;
  childCache.clear();
}

export function getChildrenFromAll(parentId: string): Category[] {
  if (!allCategoriesCache || !(allCategoriesCache instanceof Array)) return [];
  return (allCategoriesCache as Category[]).filter(c => c.parentId === parentId);
}

export function hasChildrenFromAll(parentId: string): boolean {
  const arr = getChildrenFromAll(parentId);
  return arr && arr.length > 0;
}

export async function getChildCategories(parentId: string): Promise<Category[]> {
  try {
    // fallback to single-parent endpoint for backward compatibility
    const res = await axiosClient.get(`/api/Category/${parentId}/children`);
    return res.data?.data || [];
  } catch {
    throw new Error('Failed to fetch child categories');
  }
}

export async function getChildCategoriesCached(parentId: string): Promise<Category[] | null> {
  // if we already fetched the full list, return filtered children instead
  if (allCategoriesCache && !(allCategoriesCache instanceof Promise)) {
    return getChildrenFromAll(parentId);
  }

  const existing = childCache.get(parentId);
  if (existing) {
    if (existing instanceof Promise) return existing;
    return existing;
  }

  const p = (async () => {
    try {
      const res = await axiosClient.get(`/api/Category/${parentId}/children`);
      const list: Category[] = res.data?.data ?? [];
      childCache.set(parentId, list);
      return list;
    } catch {
      childCache.set(parentId, null);
      return null;
    }
  })();

  childCache.set(parentId, p);
  return p;
}

export function hasChildrenInCache(parentId: string): boolean {
  const got = childCache.get(parentId);
  if (Array.isArray(got) && got.length > 0) return true;
  // if all categories available, check those
  if (allCategoriesCache && (allCategoriesCache instanceof Array)) return hasChildrenFromAll(parentId);
  return false;
}

export async function createCategory(data: {
  name: string;
  parentId?: string;
  imageUrl?: string;
  icon?: string;
}): Promise<Category> {
  try {
    const res = await axiosClient.post('/api/Category', data);
    return res.data?.data;
  } catch {
    throw new Error('Failed to create category');
  }
}

export async function updateCategory(id: string, data: {
  name: string;
  parentId?: string;
  imageUrl?: string;
  icon?: string;
}): Promise<Category> {
  try {
    const res = await axiosClient.put(`/api/Category/${id}`, data);
    return res.data?.data;
  } catch {
    throw new Error('Failed to update category');
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await axiosClient.delete(`/api/Category/${id}`);
  } catch {
    throw new Error('Failed to delete category');
  }
}
