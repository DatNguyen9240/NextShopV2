'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProducts } from '../../../services/productService';

interface Product {
  productId: string;
  name: string;
  description: string;
  averageRating: number;
  totalStockQuantity: number;
  variants: { imageUrl?: string }[];
  // Add other fields as needed
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts({ page: 1, pageSize: 100 });
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.productId}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img src={product.variants[0]?.imageUrl || '/placeholder.png'} alt={product.name} className="h-12 w-12 object-cover rounded" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.averageRating}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.totalStockQuantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/admin/products/${product.productId}/edit`} className="text-green-600 hover:text-green-900 mr-4">
                    Edit
                  </Link>
                  <Link href={`/admin/products/${product.productId}/variants`} className="text-blue-600 hover:text-blue-900">
                    Variants
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}