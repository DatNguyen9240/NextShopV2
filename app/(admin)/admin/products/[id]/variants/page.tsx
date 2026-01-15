'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { getVariantsByProductIdAdmin, updateVariant, createVariant } from '../../../../../services/variantService';
import ImageUploader from '@/app/components/ImageUploader';
import { PRESET_COLORS, PRESET_SIZES } from '@/app/config/colors';
import { formatVND } from '@/app/utils/priceUtils';

interface Variant {
  productVariantId: string;
  sku: string;
  color?: string;
  size?: string;
  stockQuantity: number;
  isDefault: boolean;
  isActive?: boolean;
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
  // uploading state reserved for future file uploads
  // const [uploading, setUploading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVariant, setNewVariant] = useState({
    sku: '',
    color: '',
    size: '',
    // use '' for empty input state so we don't store NaN when user clears the field
    stockQuantity: '' as number | '',
    basePrice: '' as number | '',
    discountPercent: '' as number | '',
    isDefault: false,
    isActive: true,
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

  type VariantFieldValue = string | number | boolean | undefined;
  const handleChange = (field: keyof Variant, value: VariantFieldValue) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };


  const handleNewVariantChange = (field: keyof typeof newVariant, value: VariantFieldValue) => {
    setNewVariant(prev => ({ ...prev, [field]: value }));
  };


  const addNewVariant = async () => {
    try {
      const safeNum = (v: number | string | undefined) => {
        const n = typeof v === 'number' ? v : (v === '' || v === undefined) ? NaN : Number(v);
        return Number.isFinite(n) ? n : 0;
      };

      const payload = {
        productId: id,
        sku: newVariant.sku,
        color: newVariant.color,
        size: newVariant.size,
        stockQuantity: safeNum(newVariant.stockQuantity),
        basePrice: safeNum(newVariant.basePrice),
        discountPercent: safeNum(newVariant.discountPercent),
        isDefault: newVariant.isDefault,
        isActive: newVariant.isActive,
        imageUrl: newVariant.imageUrl,
        imgHover: newVariant.imgHover
      };
      await createVariant(payload);
      // Refresh variants
      const data = await getVariantsByProductIdAdmin(id as string);
      // normalize isActive when refreshing
      setVariants(data.map((v: Partial<Variant>) => ({ ...v, isActive: typeof v.isActive === 'undefined' ? true : v.isActive }) as Variant));
      setNewVariant({
        sku: '',
        color: '',
        size: '',
        stockQuantity: 0,
        basePrice: 0,
        discountPercent: 0,
        isDefault: false,
        isActive: true,
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
        const data = await getVariantsByProductIdAdmin(id as string);
        // ensure isActive defaults to true if missing from API
        const normalized = data.map((v: Partial<Variant>) => ({ ...v, isActive: typeof v.isActive === 'undefined' ? true : v.isActive } as Variant));
        setVariants(normalized);
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                type="text"
                placeholder="SKU"
                value={newVariant.sku}
                onChange={(e) => handleNewVariantChange('sku', e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <select
                value={newVariant.color || ''}
                onChange={(e) => handleNewVariantChange('color', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
              >
                <option value="">-- Select color --</option>
                {PRESET_COLORS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div> 
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <select
                value={newVariant.size || ''}
                onChange={(e) => handleNewVariantChange('size', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
              >
                <option value="">-- Select size --</option>
                {PRESET_SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                placeholder="Stock"
                value={newVariant.stockQuantity}
                onChange={(e) => handleNewVariantChange('stockQuantity', e.target.value === '' ? '' : parseInt(e.target.value))}
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Price</label>
              <input
                type="number"
                step="0.01"
                placeholder="Base Price"
                value={newVariant.basePrice}
                onChange={(e) => handleNewVariantChange('basePrice', e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
              <input
                type="number"
                step="0.01"
                placeholder="Discount %"
                value={newVariant.discountPercent}
                onChange={(e) => handleNewVariantChange('discountPercent', e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div className="flex space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <ImageUploader
                  value={newVariant.imageUrl}
                  onChange={(url) => setNewVariant(prev => ({ ...prev, imageUrl: url || '' }))}
                  previewSize="h-8 w-8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hover image</label>
                <ImageUploader
                  value={newVariant.imgHover}
                  onChange={(url) => setNewVariant(prev => ({ ...prev, imgHover: url || '' }))}
                  previewSize="h-8 w-8"
                />
              </div>
            </div>
            <div className="col-span-full flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newVariant.isDefault}
                  onChange={(e) => handleNewVariantChange('isDefault', e.target.checked)}
                  className="mr-2"
                />
                <label>Is Default</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newVariant.isActive}
                  onChange={(e) => handleNewVariantChange('isActive', e.target.checked)}
                  className="mr-2"
                />
                <label>Active</label>
              </div>
            </div>
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
        <div className="overflow-x-auto">
          <table className="min-w-[1500px] divide-y divide-gray-200 whitespace-nowrap">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount %</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Price</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hover Image</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {variants.map((variant) => (
              <tr key={variant.productVariantId}>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
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
                    <select
                      value={String(editData.color ?? '')}
                      onChange={(e) => handleChange('color', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="">-- Select color --</option>
                      {PRESET_COLORS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    variant.color || '-'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingId === variant.productVariantId ? (
                    <select
                      value={String(editData.size ?? '')}
                      onChange={(e) => handleChange('size', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="">-- Select size --</option>
                      {PRESET_SIZES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    variant.size || '-'
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {editingId === variant.productVariantId ? (
                    <input
                      type="number"
                      value={editData.stockQuantity || 0}
                      onChange={(e) => handleChange('stockQuantity', e.target.value === '' ? undefined : parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    variant.stockQuantity
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {editingId === variant.productVariantId ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editData.basePrice || 0}
                      onChange={(e) => handleChange('basePrice', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    formatVND(variant.basePrice)
                  )} 
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {editingId === variant.productVariantId ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editData.discountPercent || 0}
                      onChange={(e) => handleChange('discountPercent', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    `${variant.discountPercent}%`
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatVND(variant.priceAfterDiscount)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
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
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {editingId === variant.productVariantId ? (
                    <input
                      type="checkbox"
                      checked={typeof editData.isActive === 'undefined' ? (variant.isActive ?? true) : (editData.isActive as boolean)}
                      onChange={(e) => handleChange('isActive', e.target.checked)}
                    />
                  ) : (
                    variant.isActive ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Active</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>
                    )
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {editingId === variant.productVariantId ? (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Image</label>
                      <ImageUploader
                        value={String(editData.imageUrl ?? '')}
                        onChange={(url) => handleChange('imageUrl', url || '')}
                        previewSize="h-12 w-12"
                      />
                    </div>
                  ) : (
                    variant.imageUrl && (
                      <div className="h-12 w-12 relative rounded overflow-hidden">
                        <Image src={variant.imageUrl} alt="Variant" fill sizes="48px" className="object-cover" />
                      </div>
                    )
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {editingId === variant.productVariantId ? (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Hover image</label>
                      <ImageUploader
                        value={String(editData.imgHover ?? '')}
                        onChange={(url) => handleChange('imgHover', url || '')}
                        previewSize="h-12 w-12"
                      />
                    </div>
                  ) : (
                    variant.imgHover && (
                      <div className="h-12 w-12 relative rounded overflow-hidden">
                        <Image src={variant.imgHover} alt="Hover" fill sizes="48px" className="object-cover" />
                      </div>
                    )
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
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
    </div>
  );
}