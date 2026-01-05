export type Advertisement = {
  id: string;
  publicId?: string;
  title?: string;
  imageUrl: string;
  type?: string;
  sortOrder?: number;
  createdAt?: string;
};

import axios from "../lib/axiosClient";


export async function fetchAdvertisementsByType(type: string): Promise<Advertisement[]> {
  const resp = await axios.get(`/api/Advertisements/type/${encodeURIComponent(type)}`);
  return resp?.data?.data ?? [];
}

export async function fetchGroupedAdvertisements(): Promise<Record<string, Advertisement[]>> {
  // Call main endpoint which returns grouped ads
  const resp = await axios.get("/api/Advertisements");
  return resp?.data?.data ?? {};
}

export interface CreateAdvertisementDto {
  title?: string;
  imageUrl: string;
  type?: string;
  sortOrder?: number;
}

export interface UpdateAdvertisementDto extends CreateAdvertisementDto {
  id: string;
}

export const advertisementService = {
  async getGrouped() {
    return await fetchGroupedAdvertisements();
  },
  async getByType(type: string) {
    return await fetchAdvertisementsByType(type);
  },
  async getById(id: string) {
    const resp = await axios.get(`/api/Advertisements/${id}`);
    return resp?.data?.data as Advertisement;
  },
  async create(data: CreateAdvertisementDto) {
    const resp = await axios.post('/api/Advertisements', data);
    return resp?.data?.data as Advertisement;
  },
  async update(data: UpdateAdvertisementDto) {
    const { id, ...body } = data;
    await axios.put(`/api/Advertisements/${id}`, body);
  },
  async delete(id: string) {
    await axios.delete(`/api/Advertisements/${id}`);
  }
};
