import axiosClient from '../lib/axiosClient';

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

export const fetchAllUsers = async (): Promise<UserResponse[]> => {
  const res = await axiosClient.get('/api/user');
  return res.data?.data ?? res.data;
};