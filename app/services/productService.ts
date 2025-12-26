import axiosClient from '../lib/axiosClient';

export type GetProductsParams = {
  categoryId?: string;
  limit?: number;
  sort?: string;
  section?: string;
  page?: number;
  pageSize?: number;
};

export async function getProducts(params?: GetProductsParams) {
  try {
    console.log('[getProducts] request params:', params);
    const res = await axiosClient.get('/api/Product', { params });
    console.log('[getProducts] response data keys:', Object.keys(res.data ?? {}));
    return res.data?.data ?? res.data ?? [];
  } catch (err: any) {
    console.error('[getProducts] error:', err?.response?.status, err?.response?.data ?? err.message ?? err);
    throw new Error('Failed to fetch products');
  }
}

export async function getProductById(id: string) {
  try {
    const res = await axiosClient.get(`/api/Product/${id}`);
    return res.data?.data ?? null;
  } catch (err: any) {
    console.error('[getProductById] error:', err?.response?.status, err?.response?.data ?? err.message ?? err);
    throw new Error(err?.response?.data?.message ?? 'Failed to fetch product');
  }
}
