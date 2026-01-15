import axiosClient from '@/app/lib/axiosClient';

export const toggleLike = async (productId: string) => {
  const resp = await axiosClient.post('/api/ProductLike/toggle', { productId });
  return resp.data;
};

export const likeProduct = async (productId: string) => {
  const resp = await axiosClient.post('/api/ProductLike/like', { productId });
  return resp.data;
};

export const unlikeProduct = async (productId: string) => {
  const resp = await axiosClient.post('/api/ProductLike/unlike', { productId });
  return resp.data;
};

export const getLikedProductIds = async (userId: string) => {
  const resp = await axiosClient.get(`/api/ProductLike/user/${userId}/product-ids`);
  // API returns ApiResponse with data payload
  return resp.data?.data ?? resp.data;
};

export const getProductLikeCount = async (productId: string) => {
  const resp = await axiosClient.get(`/api/ProductLike/product/${productId}/count`);
  return resp.data?.data?.LikeCount ?? resp.data;
};

export const getUserLikes = async (userId: string) => {
  const resp = await axiosClient.get(`/api/ProductLike/user/${userId}`);
  // API returns ApiResponse with data payload
  return resp.data?.data ?? resp.data;
};