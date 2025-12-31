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
  } catch (err) {
    throw new Error('Failed to fetch categories');
  }
}

export async function getCategoryTree(): Promise<Category[]> {
  try {
    const res = await axiosClient.get('/api/Category/tree');
    return res.data?.data || [];
  } catch (err) {
    throw new Error('Failed to fetch category tree');
  }
}

export async function getRootCategories(): Promise<Category[]> {
  try {
    const res = await axiosClient.get('/api/Category/root');
    return res.data?.data || [];
  } catch (err) {
    throw new Error('Failed to fetch root categories');
  }
}

export async function getCategoryById(id: string): Promise<Category> {
  try {
    const res = await axiosClient.get(`/api/Category/${id}`);
    return res.data?.data;
  } catch (err) {
    throw new Error('Failed to fetch category');
  }
}

export async function getChildCategories(parentId: string): Promise<Category[]> {
  try {
    const res = await axiosClient.get(`/api/Category/${parentId}/children`);
    return res.data?.data || [];
  } catch (err) {
    throw new Error('Failed to fetch child categories');
  }
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
  } catch (err) {
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
  } catch (err) {
    throw new Error('Failed to update category');
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await axiosClient.delete(`/api/Category/${id}`);
  } catch (err) {
    throw new Error('Failed to delete category');
  }
}
