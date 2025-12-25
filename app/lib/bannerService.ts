export type Banner = {
  id: string;
  publicId?: string;
  title?: string;
  imageUrl: string;
  type?: string;
  sortOrder?: number;
  createdAt?: string;
};

import axios from "./axiosClient";

export async function fetchBanners(type?: string): Promise<Banner[]> {
  const resp = await axios.get("/api/BannerCarousel", { params: type ? { type } : undefined });
  return resp?.data?.data ?? [];
}
