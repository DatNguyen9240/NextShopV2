import axiosClient from '../lib/axiosClient';

export interface CouponDto {
  couponId: string;
  code: string;
  discountPercent: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startDate: string;
  endDate: string;
  usageLimit?: number | null;
  usedCount?: number | null;
  isActive: boolean;
  // computed
  isValid?: boolean;
}

export async function getCouponByCode(code: string): Promise<CouponDto | null> {
  const res = await axiosClient.get(`/api/Coupon/code/${encodeURIComponent(code)}`);
  return res.data?.data ?? null;
}

export async function calculateDiscount(couponCode: string, originalAmount: number) {
  try {
    const payload = { couponCode: String(couponCode), originalAmount: Number(originalAmount) };
    const res = await axiosClient.post('/api/Coupon/calculate-discount', payload);
    return res.data?.data ?? null;
  } catch (err: unknown) {
    type ErrWithResp = { response?: { data?: unknown }; message?: string };
    const e = err as ErrWithResp;
    console.error('[calculateDiscount] error', e?.response?.data ?? e?.message ?? e);
    // Re-throw so callers can read err.response
    throw err;
  }
}

// Admin helpers
export async function getAllCoupons(): Promise<CouponDto[]> {
  const res = await axiosClient.get('/api/Coupon');
  return res.data?.data ?? [];
}

export async function createCoupon(payload: Record<string, unknown>) {
  const res = await axiosClient.post('/api/Coupon', payload);
  return res.data?.data ?? res.data;
}

export async function updateCoupon(id: string, payload: Record<string, unknown>) {
  const res = await axiosClient.put(`/api/Coupon/${id}`, payload);
  return res.data?.data ?? res.data;
}

export async function deleteCoupon(id: string) {
  const res = await axiosClient.delete(`/api/Coupon/${id}`);
  return res.data?.success ?? true;
}
