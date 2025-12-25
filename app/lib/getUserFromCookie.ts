import { cookies } from "next/headers";
import axiosClient from "./axiosClient";

export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) return null;
  try {
    const res = await axiosClient.get('/api/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } });
    return res.data;
  } catch {
    return null;
  }
}
