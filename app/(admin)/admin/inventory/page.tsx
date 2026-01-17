"use client";

import React, { useEffect, useState } from 'react';
import { getProductsAdmin } from '@/app/services/productService';
import { getVariantsByProductIdAdmin, getAllVariantsAdmin } from '@/app/services/variantService';
import { getInventoryHistory, InventoryTransactionDto } from '@/app/services/inventoryService';
import Button from '@/app/components/Button';
import InventoryAdjustModal from './InventoryAdjustModal';
import InventoryHistoryModal from './InventoryHistoryModal';
import { toast } from 'react-hot-toast';

type ProductDto = { productId?: string; id?: string; name?: string; title?: string; productName?: string };
type VariantDto = { productVariantId?: string; variantId?: string; productName?: string; sku?: string; variantSku?: string; color?: string; size?: string; stockQuantity?: number; stock?: number; productId?: string; imageUrl?: string | null; imgHover?: string | null };

export default function AdminInventory() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [productId, setProductId] = useState<string | null>(null);
  const [variants, setVariants] = useState<VariantDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdjust, setShowAdjust] = useState<{ id: string; label?: string; current?: number } | null>(null);
  const [history, setHistory] = useState<InventoryTransactionDto[] | null>(null);

  useEffect(() => { void loadProducts(); }, []);

  async function loadProducts() {
    try {
      const data = await getProductsAdmin({ page: 1, pageSize: 100 });
      setProducts(data?.items ?? data ?? []);
      if ((data?.items ?? data)?.length) setProductId((data?.items ?? data)[0].productId ?? (data?.items ?? data)[0].id);
    } catch (err) {
      console.error('[loadProducts] error', err);
      toast.error('Không thể tải danh sách sản phẩm');
    }
  }

  useEffect(() => {
    // Always attempt to load variants; if productId is falsy, load all admin variants
    void loadVariants(productId ?? null);
  }, [productId]);

  async function loadVariants(pid: string | null) {
    setLoading(true);
    try {
      let v;
      if (!pid) {
        console.debug('[loadVariants] no product id provided, loading ALL variants (admin)');
        v = await getAllVariantsAdmin();
      } else {
        v = await getVariantsByProductIdAdmin(pid);
      }
      console.debug('[loadVariants] variants', v);
      setVariants(v ?? []);
    } catch (err) {
      console.error('[loadVariants] error', err);
      toast.error('Không thể tải variants');
    } finally {
      setLoading(false);
    }
  }

  async function openAdjust(variantId: string, label?: string, current?: number) {
    setShowAdjust({ id: variantId, label, current });
  }

  async function openHistory(variantId: string) {
    try {
      const h = await getInventoryHistory(variantId);
      setHistory(h ?? []);
    } catch (err) {
      console.error('[openHistory] error', err);
      toast.error('Không thể tải lịch sử kho');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Inventory</h2>
        <div className="flex items-center gap-3">
          <select className="border rounded px-3 py-2 text-sm" value={productId ?? ''} onChange={(e) => setProductId(e.target.value)}>
            <option value="">Chọn sản phẩm</option>
            {products.map(p => (
              <option key={p.productId ?? p.id} value={p.productId ?? p.id}>{p.name ?? p.title ?? p.productName}</option>
            ))}
          </select>
          <Button shape="roundedSquare" size="md" onClick={() => { if (productId) void loadVariants(productId); }} className="bg-gray-100 rounded-none px-5 py-2 text-base">Tải lại</Button>
        </div>
      </div>

      {loading ? <p>Đang tải...</p> : (
        <div className="bg-white shadow rounded">
          <table className="w-full table-auto">
            <thead className="text-left text-sm text-gray-500 border-b">
              <tr>
                <th className="px-4 py-3">Variant</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Options</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map(v => (
                <tr key={v.productVariantId ?? v.variantId} className="border-b last:border-b-0">
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                        { (v.imageUrl ?? v.imgHover) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={v.imageUrl ?? v.imgHover ?? ''}
                            alt={v.productName ?? ''}
                            className="w-full h-full object-cover"
                            title={v.imageUrl ?? v.imgHover ?? ''}
                            onError={(e) => { console.warn('Image load failed', e.currentTarget.src); (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="text-xs text-gray-400">No image</div>
                        )}
                      </div>
                      <div>{v.productName}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{v.sku ?? v.variantSku}</td>
                  <td className="px-4 py-3 text-sm">{v.color ?? ''} {v.size ? ` • ${v.size}` : ''}</td>
                  <td className="px-4 py-3 text-sm">{v.stockQuantity ?? v.stock ?? '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      { (v.productVariantId ?? v.variantId) ? (
                        <>
                          <Button shape="roundedSquare" size="md" onClick={() => openAdjust(v.productVariantId ?? v.variantId as string, `${v.productName} - ${v.sku ?? ''}`, v.stockQuantity ?? v.stock)} className="bg-gray-100 rounded-none px-4 py-2 text-sm">Điều chỉnh</Button>
                          <Button shape="roundedSquare" size="md" onClick={() => openHistory(v.productVariantId ?? v.variantId as string)} className="bg-gray-100 rounded-none px-4 py-2 text-sm">Lịch sử</Button>
                        </>
                      ) : (
                        <div className="text-sm text-gray-400">No variant id</div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdjust && (
        <InventoryAdjustModal variantId={showAdjust.id} label={showAdjust.label} currentStock={showAdjust.current} onClose={() => { setShowAdjust(null); void loadVariants(productId as string); }} onSuccess={() => void loadVariants(productId as string)} />
      )}

      {history && (
        <InventoryHistoryModal transactions={history} onClose={() => setHistory(null)} />
      )}
    </div>
  );
}
