import axiosClient from '../lib/axiosClient';

export interface CollectPaymentByOrderRequest {
  collectedBy?: string;
}

export async function collectPaymentByOrder(orderId: string, collectedBy?: string) {
  try {
    const res = await axiosClient.post(`/api/payments/order/${orderId}/collect`, { collectedBy });
    return res.data?.data ?? res.data;
  } catch (err: unknown) {
    console.error('[collectPaymentByOrder] error', err);
    throw err;
  }
}
