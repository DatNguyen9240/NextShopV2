"use client";
import React, { useEffect, useState } from 'react';
import Button from '@/app/components/Button';
import ProductCardHorizontal from '@/app/components/ProductCardHorizontal';
import type { Product as CardProduct } from '@/app/components/ProductCard';
import { useAuth } from '@/app/providers/AuthProvider';
import * as likeService from '@/app/services/productLikeService';
import { getProductById } from '@/app/services/productService';
import { useRouter } from 'next/navigation';

type LikeDto = {
  productId: string;
  userId: string;
  createdAt: string;
  productName: string;
};

export default function LikesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [likes, setLikes] = useState<LikeDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state (client-side)
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  // product details cache for rendering cards
  const [products, setProducts] = useState<Record<string, CardProduct | null>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      // If user object or user id is not ready yet, skip fetch silently (avoid calling API with undefined)
      if (!user || !user.id) {
        setLikes(null);
        setLoading(false);
        return;
      }

      try {
        const data = await likeService.getUserLikes(user.id);
        if (!mounted) return;
        // data is expected to be array of { productId, userId, createdAt, productName }
        setLikes(data ?? []);
        setPage(1); // reset to first page on fresh load
      } catch (err) {
        console.error('Failed to load likes', err);
        setError('Không thể tải danh sách yêu thích');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => { mounted = false; };
  }, [user]);

  // Fetch product details for the current page of likes
  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      if (!likes || likes.length === 0) return;
      const start = (page - 1) * pageSize;
      const pageLikes = likes.slice(start, start + pageSize);
      const idsToFetch = pageLikes.map(l => l.productId).filter(id => !products[id]);
      if (idsToFetch.length === 0) return;

      try {
        const promises = idsToFetch.map(id => getProductById(id).catch(e => {
          console.error('[LikesPage] getProductById failed', id, e);
          return null;
        }));
        const results = await Promise.all(promises);
        if (!mounted) return;
        const next: Record<string, CardProduct | null> = { ...products };
        idsToFetch.forEach((id, idx) => {
          const p = results[idx] as {
            productId?: string;
            id?: string;
            name?: string;
            label?: string;
            images?: string[];
            image?: string;
            variants?: Array<{ isDefault?: boolean; imageUrl?: string; priceAfterDiscount?: number; basePrice?: number; discountPercent?: number; stockQuantity?: number }>;
            price?: number;
            averageRating?: number;
            totalStockQuantity?: number;
          } | null;

          // map API product to card-friendly shape
          if (p) {
            const variant = (p.variants && p.variants.length > 0) ? p.variants.find((v) => v.isDefault) ?? p.variants[0] : null;
            const image = variant?.imageUrl ?? (p.images && p.images.length > 0 ? p.images[0] : p.image ?? '');
            const priceNew = variant ? String(variant.priceAfterDiscount ?? variant.basePrice ?? 0) : String(p.price ?? 0);
            const priceOld = variant ? String(variant.basePrice ?? '') : '';
            const percent = variant && variant.discountPercent ? String(variant.discountPercent) + '%' : '';
            const rating = Math.round(p.averageRating ?? 0);
            const totalStockQuantity = p.totalStockQuantity ?? (variant?.stockQuantity ?? null);
            next[id] = {
              id: String(p.productId ?? p.id ?? id),
              label: p.name ?? p.label ?? '',
              image: image || '',
              priceOld,
              priceNew,
              percent,
              rating,
              inStock: (totalStockQuantity ?? 0) > 0,
              totalStockQuantity,
            } as CardProduct;
          } else {
            next[id] = null;
          }
        });
        setProducts(next);
      } finally {
        // noop
      }
    };

    void loadProducts();
    return () => { mounted = false; };
  }, [likes, page, pageSize, products]);

  if (loading) return <div className="max-w-screen-xl mx-auto mt-12 p-6 bg-white rounded shadow">Đang tải...</div>;
  if (!user) return (
    <div className="max-w-screen-xl mx-auto mt-12 p-6 bg-white rounded shadow text-center">
      <div className="mb-4">Bạn cần đăng nhập để xem sản phẩm yêu thích.</div>
      <div>
        <Button onClick={() => router.push('/login')} className="px-6 py-2">Đăng nhập</Button>
      </div>
    </div>
  );

  return (
    <main className="max-w-screen-xl mx-auto mt-12 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Sản phẩm yêu thích</h1>
      </div>

      {error && <div className="bg-white p-4 rounded mb-4 text-red-600">{error}</div>}

      {likes && likes.length > 0 ? (
        <>
          <div className="space-y-4">
            {likes.slice((page - 1) * pageSize, page * pageSize).map((l) => {
              const p = products[l.productId];
              return (
                <div key={l.productId}>
                  {p ? (
                    <ProductCardHorizontal product={p} />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-lg truncate">{l.productName}</div>
                        <div className="text-sm text-gray-500">Đã thêm: {new Date(l.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">Hiển thị {Math.min((page - 1) * pageSize + 1, likes.length)}–{Math.min(page * pageSize, likes.length)} trên {likes.length} sản phẩm</div>
            <div className="flex items-center gap-2">
              <button className={`px-3 py-1 rounded border ${page === 1 ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-100'}`} onClick={() => setPage(p => Math.max(1, p - 1))}>Trước</button>
              <div className="text-sm">Trang {page}</div>
              <button className={`px-3 py-1 rounded border ${page * pageSize >= likes.length ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-100'}`} onClick={() => setPage(p => p + 1)}>Sau</button>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500">Bạn chưa có sản phẩm yêu thích nào.</div>
      )}
    </main>
  );
}