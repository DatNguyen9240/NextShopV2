import axiosClient from '../lib/axiosClient';

export async function getCategories() {
  try {
    const res = await axiosClient.get('/api/Category');
    return res.data?.data || [];
  } catch (err) {
    throw new Error('Failed to fetch categories');
  }
}
