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

const pendingGetProducts = new Map<string, Promise<unknown>>();

export async function getProducts(params?: GetProductsParams) {
  const key = JSON.stringify(params ?? {});
  // Reuse in-flight identical requests to avoid duplicate network calls
  const existing = pendingGetProducts.get(key);
  if (existing) {
    console.debug('[getProducts] cache hit for', key);
    return existing;
  }

  const p = (async () => {
    try {
      console.debug('[getProducts] network fetch start for', key, params);
      const res = await axiosClient.get('/api/Product', { params });
      console.debug('[getProducts] network fetch response for', key, Object.keys(res.data ?? {}));
      // log cache hit or miss
      console.debug('[getProducts] cache pending count', pendingGetProducts.size);
      return res.data?.data ?? res.data ?? [];
    } catch (err: unknown) {
      console.error('[getProducts] error fetching', key, err);
      throw new Error('Failed to fetch products');
    } finally {
      // remove from pending map when finished
      pendingGetProducts.delete(key);
    }
  })();

  pendingGetProducts.set(key, p);
  return p;
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
