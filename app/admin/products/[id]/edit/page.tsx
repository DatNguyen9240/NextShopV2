'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductById, updateProduct } from '@/app/services/productService';
import { getCategories } from '@/app/services/categoryService';
import axiosClient from '@/app/lib/axiosClient';

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([] as { categoryId: string; name: string }[]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    genderTarget: '',
    brand: '',
    isActive: true,
    tags: '',
    categoryIds: [] as string[]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoriesRes, productCategoriesRes] = await Promise.all([
          getProductById(id as string),
          getCategories(),
          axiosClient.get(`/api/ProductCategory/product/${id}/categories`)
        ]);
        setProduct(productRes);
        setCategories(categoriesRes);
        const currentCategoryIds = productCategoriesRes.data?.map((pc: any) => pc.categoryId) || [];
        setFormData({
          name: productRes.name || '',
          description: productRes.description || '',
          genderTarget: productRes.genderTarget || '',
          brand: productRes.brand || '',
          isActive: productRes.isActive ?? true,
          tags: (productRes.tags || []).join(', '),
          categoryIds: currentCategoryIds
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        genderTarget: formData.genderTarget,
        brand: formData.brand,
        isActive: formData.isActive,
        tags: formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
        categoryIds: formData.categoryIds
      };
      await updateProduct(id as string, updateData);
      router.push('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id: string) => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Gender Target</label>
          <input
            type="text"
            name="genderTarget"
            value={formData.genderTarget}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Brand</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Is Active</label>
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Tags (comma separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Categories</label>
          <div className="mt-1 space-y-2">
            {categories.map(category => (
              <label key={category.categoryId} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.categoryIds.includes(category.categoryId)}
                  onChange={() => handleCategoryChange(category.categoryId)}
                  className="mr-2"
                />
                {category.name}
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}