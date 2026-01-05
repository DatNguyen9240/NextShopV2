'use client';

import { useState, useEffect } from 'react';
import { advertisementService, Advertisement, CreateAdvertisementDto } from '../../../services/advertisementService';
import Image from 'next/image';
import React, { useState as useStateLocal } from 'react';
import ImageUploader from '@/app/components/ImageUploader';

export default function BannersAdminPage() {
  const [banners, setBanners] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdvertisement, seteditingAdvertisement] = useState<Advertisement | null>(null);
  const [formData, setFormData] = useState<CreateAdvertisementDto>({
    title: '',
    imageUrl: '',
    type: '',
    sortOrder: 0,
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const grouped = await advertisementService.getGrouped();
      // flatten grouped object into a single array for admin listing
      const flat = Object.values(grouped).flat();
      setBanners(flat);
    } catch (error) {
      console.error('Failed to load banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAdvertisement) {
        await advertisementService.update({ ...formData, id: editingAdvertisement.id });
      } else {
        await advertisementService.create(formData);
      }
      setShowModal(false);
      seteditingAdvertisement(null);
      resetForm();
      loadBanners();
    } catch (error) {
      console.error('Failed to save banner:', error);
    }
  };

  const handleEdit = (advertisement: Advertisement) => {
    seteditingAdvertisement(advertisement);
    setFormData({
      title: advertisement.title,
      imageUrl: advertisement.imageUrl,
      type: advertisement.type,
      sortOrder: advertisement.sortOrder,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      try {
        await advertisementService.delete(id);
        loadBanners();
      } catch (error) {
        console.error('Failed to delete banner:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      imageUrl: '',
      type: '',
      sortOrder: 0,
    });
  };

  const openAddModal = () => {
    seteditingAdvertisement(null);
    resetForm();
    setShowModal(true);
  };

  function BannerImage({ src, alt }: { src: string; alt?: string }) {
    const [imgSrc, setImgSrc] = useStateLocal(src);
    return (
      <Image
        src={imgSrc}
        alt={alt || ''}
        width={64}
        height={64}
        className="object-cover rounded"
        onError={() => setImgSrc('/images/placeholder.png')}
      />
    );
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Banners</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Banner
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Title</th>
              <th className="px-4 py-2 border">Image</th>
              <th className="px-4 py-2 border">Type</th>
              <th className="px-4 py-2 border">Sort Order</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((banner) => (
              <tr key={banner.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{banner.title}</td>
                <td className="px-4 py-2 border">
                  {banner.imageUrl ? (
                    <BannerImage src={banner.imageUrl} alt={banner.title} />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                      No image
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 border">{banner.type}</td>
                <td className="px-4 py-2 border">{banner.sortOrder}</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleEdit(banner)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99]"
>
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {editingAdvertisement ? 'Edit Banner' : 'Add Banner'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Image</label>
                <ImageUploader
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url || '' })}
                  previewSize="h-20 w-40"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Select type</option>
                  <option value="home_sell_off">home_sell_off</option>
                  <option value="featured">featured</option>
                  <option value="popular">popular</option>
                  <option value="home_bottom">home_bottom</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Sort Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {editingAdvertisement ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

