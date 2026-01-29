'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProductsAdmin, deleteProduct } from '../../../services/productService';
import ConfirmModal from '@/app/components/ConfirmModal';

interface Product {
  productId: string;
  name: string;
  description: string;
  averageRating: number;
  totalStockQuantity: number;
  variants?: { imageUrl?: string }[];
  additionalInfo?: string;
  isActive?: boolean;
  // Add other fields as needed
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmShow, setConfirmShow] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProductsAdmin({ page: 1, pageSize: 100 });
      // API may return either a flat array or a paged object { items: [], totalPages, ... }
      const items = Array.isArray(data) ? data : (data?.items || data?.Items || []);
      setProducts(items);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  const handleDelete = (productId: string) => {
    setConfirmTargetId(productId);
    setConfirmShow(true);
  };

  const performDelete = async () => {
    if (!confirmTargetId) return;
    const productId = confirmTargetId;
    setConfirmShow(false);
    setDeletingId(productId);
    try {
      await deleteProduct(productId);
      await fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
    } finally {
      setDeletingId(null);
      setConfirmTargetId(null);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <Link
          href="/admin/products/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Product
        </Link>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Additional Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.productId}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-12 w-12 relative rounded overflow-hidden">
                    <Image
                      src={product.variants?.[0]?.imageUrl || '/placeholder.svg'}
                      alt={product.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.averageRating}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.totalStockQuantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.isActive ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Active</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/admin/products/${product.productId}/edit`} className="text-green-600 hover:text-green-900 mr-4">
                    Edit
                  </Link>
                  <Link href={`/admin/products/${product.productId}/variants`} className="text-blue-600 hover:text-blue-900 mr-4">
                    Variants
                  </Link>
                  <button
                    onClick={() => handleDelete(product.productId)}
                    className="text-red-600 hover:text-red-900"
                    disabled={deletingId === product.productId}
                  >
                    {deletingId === product.productId ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        show={confirmShow}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={performDelete}
        onCancel={() => { setConfirmShow(false); setConfirmTargetId(null); }}
      />
    </div>
  );
}