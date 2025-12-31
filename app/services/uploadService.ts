import axiosClient from '../lib/axiosClient';

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await axiosClient.post('/api/Upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data?.data?.url || res.data?.url; // Assuming the response has the url
  } catch (err: any) {
    console.error('[uploadImage] error:', err?.response?.status, err?.response?.data ?? err.message ?? err);
    throw new Error('Failed to upload image');
  }
}