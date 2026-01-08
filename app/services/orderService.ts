import axiosClient from '../lib/axiosClient';

export interface CreateOrderRequest {
  items: CreateOrderItemRequest[];
  buyerName?: string;
  buyerPhone?: string;
  shippingAddress?: string;
  couponIds?: string[];
}

export interface CreateOrderItemRequest {
  variantId: string;
  quantity: number;
}

export async function createOrder(data: CreateOrderRequest) {
  try {
    const res = await axiosClient.post('/api/Order', data);
    console.log('Order API response:', res);
    console.log('Order data:', res.data);
    return res.data?.data;
  } catch (err: unknown) {
    console.error('[createOrder] error', err);
    throw err;
  }
}