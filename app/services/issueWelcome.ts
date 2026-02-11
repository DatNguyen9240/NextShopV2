import axiosClient from '../lib/axiosClient';

export async function issueWelcomeByEmail(email: string) {
  const res = await axiosClient.post('/api/Auth/admin/issue-welcome-by-email', { email });
  return res.data;
}

export async function issueWelcomeToAll() {
  const res = await axiosClient.post('/api/Auth/admin/issue-welcome-all');
  return res.data;
}
