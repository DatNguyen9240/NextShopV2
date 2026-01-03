import { cookies } from "next/headers";
import axiosClient from "./axiosClient";

export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) {
    console.debug('[getUserFromCookie] no accessToken cookie found');
    return null;
  }
  try {
    const res = await axiosClient.get('/api/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } });
    console.debug('[getUserFromCookie] /me success');
    return res.data;
  } catch (err: unknown) {
    console.warn('[getUserFromCookie] /me failed', err);
    return null;
  }
}
