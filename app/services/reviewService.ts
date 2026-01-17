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

export type CreateReviewRequest = {
  productId: string;
  rating: number;
  comment?: string;
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

export async function createReview(request: CreateReviewRequest) {
  try {
    const res = await axiosClient.post('/api/Review', request);
    return res.data?.data as ReviewDto;
  } catch (err: unknown) {
    console.error('[createReview] error:', err);
    throw new Error('Failed to create review');
  }
}

export async function canUserReviewProduct(productId: string) {
  try {
    const res = await axiosClient.get(`/api/Review/can-review/${productId}`);
    return res.data?.data as boolean;
  } catch (err: unknown) {
    console.error('[canUserReviewProduct] error:', err);
    return false;
  }
}
