'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductByIdAdmin, updateProduct } from '@/app/services/productService';
import { toast } from 'react-hot-toast';
import { getCategories } from '@/app/services/categoryService';
import axiosClient from '@/app/lib/axiosClient';

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [categories, setCategories] = useState<{ categoryId: string; name: string }[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    genderTarget: '',
    brand: '',
    isActive: true,
    tags: '',
    additionalInfo: '',
    taxRate: '',
    categoryIds: [] as string[]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoriesRes, productCategoriesRes] = await Promise.all([
          getProductByIdAdmin(id as string),
          getCategories(),
          axiosClient.get(`/api/ProductCategory/product/${id}/categories`)
        ]);
        setCategories(categoriesRes);
        type ProductCategory = { categoryId: string };
        const currentCategoryIds = (productCategoriesRes.data as ProductCategory[] ?? []).map(pc => pc.categoryId) || [];
        setFormData({
          name: productRes.name || '',
          description: productRes.description || '',
          genderTarget: productRes.genderTarget || '',
          brand: productRes.brand || '',
          isActive: productRes.isActive ?? true,
          tags: (productRes.tags || []).join(', '),
          additionalInfo: productRes.additionalInfo || '',
          taxRate: productRes.taxRate !== null && productRes.taxRate !== undefined ? productRes.taxRate.toString() : '',
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
      // validate additionalInfo length
      if (formData.additionalInfo && formData.additionalInfo.length > 1000) {
        toast.error('Additional info must be 1000 characters or less');
        setSaving(false);
        return;
      }

      const updateData = {
        name: formData.name,
        description: formData.description,
        genderTarget: formData.genderTarget,
        brand: formData.brand,
        isActive: formData.isActive,
        tags: formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
        additionalInfo: formData.additionalInfo,
        taxRate: formData.taxRate ? parseFloat(formData.taxRate) : null,
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
          <label className="block text-sm font-medium">Thông tin bổ sung (Additional Info)</label>
          <textarea
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            maxLength={1000}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            rows={4}
          />
          <div className="text-sm text-gray-500 mt-1">{formData.additionalInfo.length}/1000</div>
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
          <label className="block text-sm font-medium">Tax Rate (optional)</label>
          <input
            type="number"
            name="taxRate"
            value={formData.taxRate}
            onChange={handleChange}
            step="0.01"
            min="0"
            max="1"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="e.g., 0.10 for 10%"
          />
          <div className="text-sm text-gray-500 mt-1">Leave empty to use category or system default. Example: 0.10 = 10%</div>
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