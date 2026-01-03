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

const pendingGetProduct = new Map<string, Promise<unknown>>();
const productCache = new Map<string, unknown>();

export async function getProductById(id: string) {
  // return cached product if available
  if (productCache.has(id)) {
    console.debug('[getProductById] cache hit for', id);
    return productCache.get(id);
  }

  // reuse in-flight identical requests
  const existing = pendingGetProduct.get(id);
  if (existing) {
    console.debug('[getProductById] pending fetch reuse for', id);
    return existing;
  }

  const p = (async () => {
    try {
      console.debug('[getProductById] network fetch start for', id);
      const res = await axiosClient.get(`/api/Product/${id}`);
      const data = res.data?.data ?? null;
      if (data) productCache.set(id, data);
      console.debug('[getProductById] network fetch response for', id);
      return data;
    } catch (err: unknown) {
      console.error('[getProductById] error:', err);
      throw new Error('Failed to fetch product');
    } finally {
      pendingGetProduct.delete(id);
    }
  })();

  pendingGetProduct.set(id, p);
  return p;
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  try {
    const res = await axiosClient.put(`/api/Product/${id}`, data);
    // update cached value if present
    const updated = res.data?.data ?? null;
    if (updated) {
      productCache.set(id, updated);
    } else {
      productCache.delete(id);
    }
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
