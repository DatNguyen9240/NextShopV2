import axiosClient from '../lib/axiosClient';

export interface CreateOrderRequest {
  items: CreateOrderItemRequest[];
  buyerName?: string;
  buyerPhone?: string;
  shippingAddress?: string;
  paymentMethod?: string;
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

// Admin: fetch all orders
export async function fetchAllOrders(): Promise<OrderDto[]> {
  try {
    const res = await axiosClient.get('/api/Order');
    const payload = res.data?.data ?? res.data;
    return Array.isArray(payload) ? payload : [];
  } catch (err: unknown) {
    console.error('[fetchAllOrders] error', err);
    throw err;
  }
}

export async function getOrderById(id: string): Promise<OrderDto | null> {
  try {
    const res = await axiosClient.get(`/api/Order/${id}`);
    return res.data?.data ?? null;
  } catch (err: unknown) {
    console.error('[getOrderById] error', err);
    throw err;
  }
}

export async function updateOrderStatus(id: string, status: string) {
  try {
    const res = await axiosClient.put(`/api/Order/${id}/status`, { status });
    return res.data?.success ?? true;
  } catch (err: unknown) {
    console.error('[updateOrderStatus] error', err);
    throw err;
  }
}

export async function deleteOrder(id: string) {
  try {
    const res = await axiosClient.delete(`/api/Order/${id}`);
    return res.data?.success ?? true;
  } catch (err: unknown) {
    console.error('[deleteOrder] error', err);
    throw err;
  }
}

// Fetch paged orders for current user
export interface OrderItemDto {
  orderItemId: string;
  variantId?: string | null;
  productId?: string | null;
  productName?: string | null;
  productSku?: string | null;
  variantSku?: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
  variant?: {
    basePrice?: number;
    discountPercent?: number;
    discountAmount?: number;
    priceAfterDiscount?: number;
    productVariantId?: string;
    sku?: string | null;
    color?: string | null;
    size?: string | null;
    stockQuantity?: number;
    isDefault?: boolean;
    displayOrder?: number;
    imageUrl?: string | null;
    imgHover?: string | null;
  } | null;
  variantOptionsJson?: string | null;
}

export interface OrderDto {
  orderId: string;
  userId?: string;
  orderDate: string;
  status: string;
  subTotal?: number;
  discountAmount?: number;
  totalAmount: number;
  buyerName?: string | null;
  buyerPhone?: string | null;
  coupons?: unknown[];
  shippingAddress?: string | null;
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