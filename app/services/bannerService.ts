import axiosClient from '../lib/axiosClient';

export interface Banner {
  id: string;
  publicId: string;
  title: string;
  imageUrl: string;
  type: string;
  sortOrder: number;
  createdAt: string;
}

export interface CreateBannerDto {
  publicId?: string;
  title: string;
  imageUrl: string;
  type: string;
  sortOrder?: number;
}

export interface UpdateBannerDto extends CreateBannerDto {
  id: string;
}

export const bannerService = {
  async getAll(type?: string): Promise<Banner[]> {
    const res = await axiosClient.get('/api/BannerCarousel', {
      params: type ? { type } : {},
    });
    return res.data?.data || [];
  },

  async getById(id: string): Promise<Banner> {
    const res = await axiosClient.get(`/api/BannerCarousel/${id}`);
    return res.data?.data;
  }
  ,

  async create(dto: CreateBannerDto): Promise<Banner> {
    const res = await axiosClient.post('/api/BannerCarousel', dto);
    return res.data?.data;
  },

  async update(dto: UpdateBannerDto): Promise<Banner> {
    const res = await axiosClient.put(`/api/BannerCarousel/${dto.id}`, dto);
    return res.data?.data;
  },


  async delete(id: string): Promise<void> {
    const res = await axiosClient.get(`/api/BannerCarousel/${id}`);
    return res.data?.data;
  }
};