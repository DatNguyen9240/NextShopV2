'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getVariantsByProductId, updateVariant, createVariant } from '../../../../services/variantService';
import { uploadImage } from '../../../../services/uploadService';

interface Variant {
  productVariantId: string;
  sku: string;
  color?: string;
  size?: string;
  stockQuantity: number;
  isDefault: boolean;
  displayOrder: number;
  basePrice: number;
  discountPercent: number;
  discountAmount: number;
  priceAfterDiscount: number;
  imageUrl?: string;
  imgHover?: string;
}

export default function ProductVariants() {
  const { id } = useParams();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Variant>>({});
  const [uploading, setUploading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVariant, setNewVariant] = useState({
    sku: '',
    color: '',
    size: '',
    stockQuantity: 0,
    basePrice: 0,
    discountPercent: 0,
    isDefault: false,
    imageUrl: '',
    imgHover: ''
  });

  const startEdit = (variant: Variant) => {
    setEditingId(variant.productVariantId);
    setEditData({ ...variant });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await updateVariant(editingId, editData);
      setVariants(prev => prev.map(v => v.productVariantId === editingId ? { ...v, ...editData } : v));
      setEditingId(null);
      setEditData({});
    } catch (error) {
      console.error('Error updating variant:', error);
    }
  };

  const handleChange = (field: keyof Variant, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      handleChange('imageUrl', imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleHoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      handleChange('imgHover', imageUrl);
    } catch (error) {
      console.error('Error uploading hover image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleNewVariantChange = (field: string, value: any) => {
    setNewVariant(prev => ({ ...prev, [field]: value }));
  };

  const handleNewFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      setNewVariant(prev => ({ ...prev, imageUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleNewHoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imgHover = await uploadImage(file);
      setNewVariant(prev => ({ ...prev, imgHover }));
    } catch (error) {
      console.error('Error uploading hover image:', error);
    } finally {
      setUploading(false);
    }
  };

  const addNewVariant = async () => {
    try {
      const payload = {
        productId: id,
        sku: newVariant.sku,
        color: newVariant.color,
        size: newVariant.size,
        stockQuantity: newVariant.stockQuantity,
        basePrice: newVariant.basePrice,
        discountPercent: newVariant.discountPercent,
        isDefault: newVariant.isDefault,
        imageUrl: newVariant.imageUrl,
        imgHover: newVariant.imgHover
      };
      await createVariant(payload);
      // Refresh variants
      const data = await getVariantsByProductId(id as string);
      setVariants(data);
      setNewVariant({
        sku: '',
        color: '',
        size: '',
        stockQuantity: 0,
        basePrice: 0,
        discountPercent: 0,
        isDefault: false,
        imageUrl: '',
        imgHover: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding variant:', error);
    }
  };

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const data = await getVariantsByProductId(id as string);
        setVariants(data);
      } catch (error) {
        console.error('Error fetching variants:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVariants();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Variants for Product {id}</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add New Variant'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Variant</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="SKU"
              value={newVariant.sku}
              onChange={(e) => handleNewVariantChange('sku', e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Color"
              value={newVariant.color}
              onChange={(e) => handleNewVariantChange('color', e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Size"
              value={newVariant.size}
              onChange={(e) => handleNewVariantChange('size', e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Stock"
              value={newVariant.stockQuantity}
              onChange={(e) => handleNewVariantChange('stockQuantity', parseInt(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Base Price"
              value={newVariant.basePrice}
              onChange={(e) => handleNewVariantChange('basePrice', parseFloat(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Discount %"
              value={newVariant.discountPercent}
              onChange={(e) => handleNewVariantChange('discountPercent', parseFloat(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={newVariant.isDefault}
                onChange={(e) => handleNewVariantChange('isDefault', e.target.checked)}
                className="mr-2"
              />
              <label>Is Default</label>
            </div>
            <div className="relative">
              <div className="w-full h-10 border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50 hover:bg-gray-100">
                {newVariant.imageUrl ? (
                  <img src={newVariant.imageUrl} alt="New" className="h-8 w-8 object-cover rounded" />
                ) : (
                  <span className="text-xs text-gray-500">Upload</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleNewFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              {uploading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            <div className="relative">
              <div className="w-full h-10 border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50 hover:bg-gray-100">
                {newVariant.imgHover ? (
                  <img src={newVariant.imgHover} alt="Hover" className="h-8 w-8 object-cover rounded" />
                ) : (
                  <span className="text-xs text-gray-500">Hover Upload</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleNewHoverFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              {uploading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Or paste image URL"
              value={newVariant.imageUrl}
              onChange={(e) => handleNewVariantChange('imageUrl', e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-xs"
            />
            <input
              type="text"
              placeholder="Hover image URL"
              value={newVariant.imgHover}
              onChange={(e) => handleNewVariantChange('imgHover', e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-xs"
            />
          </div>
          <button
            onClick={addNewVariant}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Variant
          </button>
        </div>
      )}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hover Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {variants.map((variant) => (
              <tr key={variant.productVariantId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {editingId === variant.productVariantId ? (
                    <input
                      type="text"
                      value={editData.sku || ''}
                      onChange={(e) => handleChange('sku', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    variant.sku
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingId === variant.productVariantId ? (
                    <input
                      type="text"
                      value={editData.color || ''}
                      onChange={(e) => handleChange('color', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    variant.color || '-'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingId === variant.productVariantId ? (
                    <input
                      type="text"
                      value={editData.size || ''}
                      onChange={(e) => handleChange('size', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    variant.size || '-'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingId === variant.productVariantId ? (
                    <input
                      type="number"
                      value={editData.stockQuantity || 0}
                      onChange={(e) => handleChange('stockQuantity', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    variant.stockQuantity
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingId === variant.productVariantId ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editData.basePrice || 0}
                      onChange={(e) => handleChange('basePrice', parseFloat(e.target.value))}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    `$${variant.basePrice}`
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingId === variant.productVariantId ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editData.discountPercent || 0}
                      onChange={(e) => handleChange('discountPercent', parseFloat(e.target.value))}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    `${variant.discountPercent}%`
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${variant.priceAfterDiscount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingId === variant.productVariantId ? (
                    <input
                      type="checkbox"
                      checked={editData.isDefault || false}
                      onChange={(e) => handleChange('isDefault', e.target.checked)}
                    />
                  ) : (
                    variant.isDefault ? 'Yes' : 'No'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === variant.productVariantId ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                          {editData.imageUrl ? (
                            <img src={editData.imageUrl} alt="Variant" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <div className="text-center">
                              <svg className="mx-auto h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-xs text-gray-500 mt-1">Upload</p>
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
                          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Or paste image URL"
                        value={editData.imageUrl || ''}
                        onChange={(e) => handleChange('imageUrl', e.target.value)}
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                      />
                    </div>
                  ) : (
                    variant.imageUrl && <img src={variant.imageUrl} alt="Variant" className="h-12 w-12 object-cover rounded" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === variant.productVariantId ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                          {editData.imgHover ? (
                            <img src={editData.imgHover} alt="Hover" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <div className="text-center">
                              <svg className="mx-auto h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-xs text-gray-500 mt-1">Upload</p>
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHoverFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploading}
                        />
                        {uploading && (
                          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Or paste hover URL"
                        value={editData.imgHover || ''}
                        onChange={(e) => handleChange('imgHover', e.target.value)}
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                      />
                    </div>
                  ) : (
                    variant.imgHover && <img src={variant.imgHover} alt="Hover" className="h-12 w-12 object-cover rounded" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {editingId === variant.productVariantId ? (
                    <div className="flex space-x-2">
                      <button onClick={saveEdit} className="text-green-600 hover:text-green-900">Save</button>
                      <button onClick={cancelEdit} className="text-red-600 hover:text-red-900">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(variant)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}