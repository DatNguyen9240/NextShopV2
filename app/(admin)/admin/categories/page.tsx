'use client';

import { useEffect, useState } from 'react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  Category
} from '../../../services/categoryService';
import { toast } from 'react-hot-toast';
import CategoryTree from '../../../components/CategoryTree';
import CategoryModal from '../../../components/CategoryModal';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentForNewChild, setParentForNewChild] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRootCategory = () => {
    setEditingCategory(null);
    setParentForNewChild(null);
    setModalTitle('Add Root Category');
    setModalOpen(true);
  };

  const handleAddChild = (parentId: string) => {
    setEditingCategory(null);
    setParentForNewChild(parentId);
    setModalTitle('Add Subcategory');
    setModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setModalTitle('Edit Category');
    setModalOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      await loadCategories(); // Reload to reflect changes
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category. Please try again.');
    }
  };

  const handleSave = async (data: {
    name: string;
    parentId?: string;
    imageUrl?: string;
    icon?: string;
  }) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.categoryId, data);
      } else {
        await createCategory(data);
      }
      await loadCategories(); // Reload to reflect changes
    } catch (error) {
      console.error('Error saving category:', error);
      throw error; // Re-throw to let modal handle it
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Category Management</h2>
        <button
          onClick={handleAddRootCategory}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Root Category</span>
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first category.</p>
              <div className="mt-6">
                <button
                  onClick={handleAddRootCategory}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Root Category
                </button>
              </div>
            </div>
          ) : (
            <CategoryTree
              categories={categories}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddChild={handleAddChild}
            />
          )}
        </div>
      </div>

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setParentForNewChild(null);
        }}
        onSave={handleSave}
        category={editingCategory}
        title={modalTitle}
        parentId={parentForNewChild || undefined}
      />
    </div>
  );
}