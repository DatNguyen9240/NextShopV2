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

// Fetch paged orders for current user
export interface OrderItemDto {
  orderItemId: string;
  productName?: string | null;
  quantity: number;
  unitPrice: number;
}

export interface OrderDto {
  orderId: string;
  status: string;
  totalAmount: number;
  orderDate: string;
  items: OrderItemDto[];
}

export interface PagedOrders {
  items: OrderDto[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchMyOrders(page = 1, pageSize = 10, status?: string): Promise<PagedOrders> {
  const res = await axiosClient.get('/api/Order/my-orders', { params: { page, pageSize, status: status ?? undefined } });
  const payload = res.data?.data ?? res.data;

  if (payload?.items) {
    return {
      items: payload.items ?? [],
      total: payload.total ?? 0,
      page: payload.page ?? page,
      pageSize: payload.pageSize ?? pageSize,
    };
  }

  const items = Array.isArray(payload) ? payload : [];
  return { items, total: items.length, page, pageSize };
}