import React, { useState, useEffect } from 'react';
import { Category, getCategories } from '../services/categoryService';
import { uploadImage } from '../services/uploadService';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    parentId?: string;
    imageUrl?: string;
    icon?: string;
  }) => Promise<void>;
  category?: Category | null;
  title: string;
  parentId?: string;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
  title,
  parentId
}: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    imageUrl: '',
    icon: ''
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (category) {
        setFormData({
          name: category.name,
          parentId: category.parentId || '',
          imageUrl: category.imageUrl || '',
          icon: category.icon || ''
        });
      } else {
        setFormData({
          name: '',
          parentId: parentId || '',
          imageUrl: '',
          icon: ''
        });
      }
    }
  }, [isOpen, category, parentId]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      await onSave({
        name: formData.name.trim(),
        parentId: formData.parentId || undefined,
        imageUrl: formData.imageUrl || undefined,
        icon: formData.icon || undefined
      });
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      setFormData(prev => ({ ...prev, imageUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const flattenCategories = (cats: Category[], level = 0): Category[] => {
    let result: Category[] = [];
    cats.forEach(cat => {
      result.push({ ...cat, name: '  '.repeat(level) + cat.name });
      if (cat.children) {
        result = result.concat(flattenCategories(cat.children, level + 1));
      }
    });
    return result;
  };

  if (!isOpen) return null;

  const flatCategories = flattenCategories(categories);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter category name"
                required
              />
            </div>

            {/* Parent Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Category
              </label>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Root Category</option>
                {flatCategories
                  .filter(cat => cat.categoryId !== category?.categoryId)
                  .map(cat => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon (Emoji or Unicode)
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 📱, 🚀, 💻"
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <div className="w-full h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Category"
                        className="h-16 w-16 object-cover rounded"
                      />
                    ) : (
                      <div className="text-center">
                        <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs text-gray-500 mt-1">Upload image</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                  placeholder="Or paste image URL"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={loading || !formData.name.trim()}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}