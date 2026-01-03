import axiosClient from '../lib/axiosClient';

export type GetProductsParams = {
  categoryId?: string;
  limit?: number;
  sort?: string;
  section?: string;
  page?: number;
  pageSize?: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
};

export async function getProducts(params?: GetProductsParams) {
  try {
    console.log('[getProducts] request params:', params);
    const res = await axiosClient.get('/api/Product', { params });
    console.log('[getProducts] response data keys:', Object.keys(res.data ?? {}));
    return res.data?.data ?? res.data ?? [];
  } catch (err: unknown) {
    console.error('[getProducts] error:', err);
    throw new Error('Failed to fetch products');
  }
}

export async function getProductById(id: string) {
  try {
    const res = await axiosClient.get(`/api/Product/${id}`);
    return res.data?.data ?? null;
  } catch (err: unknown) {
    console.error('[getProductById] error:', err);
    throw new Error('Failed to fetch product');
  }
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  try {
    const res = await axiosClient.put(`/api/Product/${id}`, data);
    return res.data;
  } catch (err: unknown) {
    console.error('[updateProduct] error:', err);
    throw new Error('Failed to update product');
  }
}

export async function createProduct(data: Record<string, unknown>) {
  try {
    const res = await axiosClient.post('/api/Product', data);
    return res.data;
  } catch (err: unknown) {
    console.error('[createProduct] error:', err);
    throw new Error('Failed to create product');
  }
}
