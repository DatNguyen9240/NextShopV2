import axiosClient from '../lib/axiosClient';

export type ReviewDto = {
  reviewId: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  userName: string;
};

export async function getReviewsByProduct(productId: string) {
  try {
    const res = await axiosClient.get(`/api/Review/product/${productId}`);
    return (res.data?.data ?? []) as ReviewDto[];
  } catch (err: unknown) {
    console.error('[getReviewsByProduct] error:', err);
    throw new Error('Failed to fetch reviews');
  }
}
