import axiosClient from '../lib/axiosClient';

export async function getVariantsByProductId(productId: string) {
  const res = await axiosClient.get(`/api/ProductVariant/product/${productId}`);
  return res.data?.data ?? [];
}

export async function getVariantsByProductIdAdmin(productId: string) {
  const res = await axiosClient.get(`/api/ProductVariant/admin/product/${productId}`);
  return res.data?.data ?? [];
}

export async function getDefaultVariant(productId: string) {
  const res = await axiosClient.get(`/api/ProductVariant/product/${productId}/default`);
  return res.data?.data;
}

export async function getDefaultVariantAdmin(productId: string) {
  const res = await axiosClient.get(`/api/ProductVariant/admin/product/${productId}/default`);
  return res.data?.data;
}

export async function getVariantById(id: string) {
  const res = await axiosClient.get(`/api/ProductVariant/${id}`);
  return res.data?.data;
}

export async function getVariantByIdAdmin(id: string) {
  const res = await axiosClient.get(`/api/ProductVariant/admin/${id}`);
  return res.data?.data;
}

export async function createVariant(payload: Record<string, unknown>) {
  const res = await axiosClient.post('/api/ProductVariant', payload);
  return res.data?.data;
}

export async function updateVariant(id: string, payload: Record<string, unknown>) {
  const res = await axiosClient.put(`/api/ProductVariant/${id}`, payload);
  return res.data?.data;
}

export async function updateVariantStock(id: string, stockQuantity: number) {
  const res = await axiosClient.patch(`/api/ProductVariant/${id}/stock`, { stockQuantity });
  return res.data;
}

export async function setVariantDefault(id: string) {
  const res = await axiosClient.patch(`/api/ProductVariant/${id}/set-default`);
  return res.data;
}

export async function deleteVariant(id: string) {
  const res = await axiosClient.delete(`/api/ProductVariant/${id}`);
  return res.data;
}