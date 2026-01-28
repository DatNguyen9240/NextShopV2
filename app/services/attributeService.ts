import axiosClient from '../lib/axiosClient';
import axios from 'axios';

export type AttributeValue = {
  attributeValueId: string;
  attributeId: string;
  value: string;
  displayOrder: number;
  isActive: boolean;
};

export type ProductAttribute = {
  attributeId: string;
  name: string;
  inputType?: string;
  isActive: boolean;
  values?: AttributeValue[];
};

export async function getAttributesByProductId(productId: string): Promise<ProductAttribute[]> {
  const res = await axiosClient.get(`/api/ProductAttribute/product/${productId}`);
  return res.data?.data ?? [];
}

export async function getAttributesByCategoryId(categoryId: string): Promise<ProductAttribute[]> {
  const res = await axiosClient.get(`/api/ProductAttribute/category/${categoryId}`);
  return res.data?.data ?? [];
}

export async function getAllAttributes(): Promise<ProductAttribute[]> {
  const res = await axiosClient.get(`/api/ProductAttribute`);
  return res.data?.data ?? [];
}

export async function getValuesByAttributeId(attributeId: string): Promise<AttributeValue[]> {
  const res = await axiosClient.get(`/api/ProductAttribute/${attributeId}/values`);
  return res.data?.data ?? [];
}

export async function getCategoriesForAttribute(attributeId: string): Promise<string[]> {
  const res = await axiosClient.get(`/api/ProductAttribute/${attributeId}/categories`);
  return res.data?.data ?? [];
}

export async function getVariantAttributeValueIds(variantId: string): Promise<string[]> {
  const res = await axiosClient.get(`/api/VariantAttribute/variant/${variantId}`);
  return res.data?.data ?? [];
}

export async function assignVariantAttributeValue(variantId: string, attributeValueId: string) {
  const payload = { variantId, attributeValueId };
  try {
    const res = await axiosClient.post('/api/VariantAttribute', payload);
    return res.data;
  } catch (err: unknown) {
    let msg = 'Request failed';
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as Record<string, unknown> | undefined;
      msg = (data && typeof data['error'] === 'string') ? (data['error'] as string) : err.message ?? msg;
    } else if (err instanceof Error) {
      msg = err.message;
    }
    throw new Error(msg);
  }
}

export async function removeVariantAttributeValue(variantId: string, attributeValueId: string) {
  const res = await axiosClient.delete(`/api/VariantAttribute?variantId=${variantId}&attributeValueId=${attributeValueId}`);
  return res.data;
}

export async function createAttribute(payload: { name: string; inputType?: string; isActive?: boolean }) {
  const res = await axiosClient.post('/api/ProductAttribute', payload);
  return res.data?.data;
}

export async function createAttributeValue(payload: { attributeId: string; value: string; displayOrder?: number; isActive?: boolean }) {
  const res = await axiosClient.post('/api/ProductAttribute/value', payload);
  return res.data?.data;
}

export async function updateAttributeValue(id: string, payload: { value: string; displayOrder: number; isActive: boolean }) {
  const res = await axiosClient.put(`/api/ProductAttribute/value/${id}`, payload);
  return res.data?.data;
}

export async function deleteAttributeValue(id: string) {
  const res = await axiosClient.delete(`/api/ProductAttribute/value/${id}`);
  return res.data;
}

export async function assignAttributeToCategory(categoryId: string, attributeId: string) {
  const res = await axiosClient.post(`/api/ProductAttribute/${categoryId}/assign/${attributeId}`);
  return res.data;
}

export async function removeAttributeFromCategory(categoryId: string, attributeId: string) {
  const res = await axiosClient.delete(`/api/ProductAttribute/${categoryId}/assign/${attributeId}`);
  return res.data;
}

export async function updateAttribute(id: string, payload: { name: string; inputType?: string; isActive?: boolean }) {
  const res = await axiosClient.put(`/api/ProductAttribute/${id}`, payload);
  return res.data?.data;
}

export async function deleteAttribute(id: string) {
  const res = await axiosClient.delete(`/api/ProductAttribute/${id}`);
  return res.data;
}

export async function assignAttributeToProduct(productId: string, attributeId: string) {
  const res = await axiosClient.post(`/api/ProductAttribute/product/${productId}/assign/${attributeId}`);
  return res.data;
}

export async function removeAttributeFromProduct(productId: string, attributeId: string) {
  const res = await axiosClient.delete(`/api/ProductAttribute/product/${productId}/assign/${attributeId}`);
  return res.data;
}
