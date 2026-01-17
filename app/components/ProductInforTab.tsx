"use client";

import { useState, useEffect } from "react";
import Button from "./Button";
import { getProductById } from "@/app/services/productService";
import { getReviewsByProduct, ReviewDto, createReview, CreateReviewRequest, canUserReviewProduct } from "@/app/services/reviewService";
import { toast } from 'react-hot-toast';
import { Star } from 'lucide-react';

type Tab = {
  label: string;
  content: React.ReactNode;
};

const defaultTabs: Tab[] = [
  {
    label: "Mô tả",
    content: (
      <p>
        Đây là phần mô tả sản phẩm. Nội dung mẫu bằng tiếng Việt, mô tả chi tiết về chất liệu, kích thước,
        tính năng và hướng dẫn sử dụng sản phẩm.
      </p>
    ),
  },
  {
    label: "Thông tin bổ sung",
    content: null,
  },
  {
    label: "Đánh giá (0)",
    content: <p>Chưa có đánh giá.</p>,
  },
];

export default function ProductInforTab({
  productId,
  tabs,
  description,
  additionalInfo,
}: {
  productId?: string;
  tabs?: Tab[] | undefined;
  description?: string | null;
  additionalInfo?: string | null;
}) {
  const [active, setActive] = useState(0);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [desc, setDesc] = useState<string | null | undefined>(description);
  const [addInfo, setAddInfo] = useState<string | null | undefined>(additionalInfo);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!productId) return;
      try {
        // fetch product fields only if not provided via props
        if (description == null || additionalInfo == null) {
          const p = await getProductById(productId);
          if (!mounted) return;
          if (p) {
            if (description == null) setDesc(p.description ?? null);
            if (additionalInfo == null) setAddInfo(p.additionalInfo ?? null);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    void load();
    return () => { mounted = false; };
  }, [productId, description, additionalInfo]);

  // Auto-load reviews when productId is available so counts and eligibility show immediately
  useEffect(() => {
    if (!productId) return;
    if (!reviewsLoaded) {
      void fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function fetchReviews() {
    if (!productId) return;
    try {
      setReviewsLoading(true);
      const r = await getReviewsByProduct(productId);
      setReviews(r);
      setReviewsLoaded(true);
      // Check if user can review
      if (typeof window !== 'undefined' && document.cookie.includes('accessToken=')) {
        const can = await canUserReviewProduct(productId);
        setCanReview(can);
      }
    } catch (e) {
      console.error('[fetchReviews] error', e);
    } finally {
      setReviewsLoading(false);
    }
  }

  async function submitReview() {
    if (!productId) return;
    try {
      setSubmittingReview(true);
      const request: CreateReviewRequest = {
        productId,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      };
      await createReview(request);
      // Refresh reviews
      await fetchReviews();
      // Reset form
      setReviewRating(5);
      setReviewComment('');
      toast.success('Đánh giá đã được gửi!');
    } catch (e) {
      console.error('[submitReview] error', e);
      toast.error('Lỗi khi gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmittingReview(false);
    }
  }

  function isReviewsTabIndex(idx: number) {
    if (tabs && tabs.length) {
      const label = tabs[idx]?.label ?? '';
      return label.includes('Đánh giá');
    }
    // default tabs: reviews at index 2
    return idx === 2;
  }

  function handleSelectTab(idx: number) {
    setActive(idx);
    if (isReviewsTabIndex(idx) && !reviewsLoaded) {
      void fetchReviews();
    }
  }

  const builtTabs: Tab[] = tabs && tabs.length ? tabs : [
    {
      label: "Mô tả",
      content: desc ? (
        <div className="whitespace-pre-wrap text-gray-700">{desc}</div>
      ) : (
        defaultTabs[0].content
      ),
    },
    {
      label: `Thông tin bổ sung`,
      content: addInfo ? (
        <div className="whitespace-pre-wrap text-gray-700">{addInfo}</div>
      ) : (
        defaultTabs[1].content
      ),
    },
    {
      label: `Đánh giá (${reviews.length})`,
      content: (
        <div>
          {reviewsLoading ? (
            <p>Đang tải...</p>
          ) : (
            reviews.length ? (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.reviewId} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-gray-800">{r.userName}</div>
                      <div className="text-sm text-gray-500">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</div>
                    </div>
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">({r.rating}/5)</span>
                    </div>
                    {r.comment && <div className="text-gray-700 leading-relaxed">{r.comment}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <Star size={48} className="mx-auto" />
                </div>
                <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
                <p className="text-sm text-gray-400">Hãy là người đầu tiên đánh giá!</p>
              </div>
            )
          )}
          {/* Review form if can review */}
          {canReview && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="text-base font-semibold mb-3 text-gray-800">Viết đánh giá của bạn</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đánh giá</label>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReviewRating(n)}
                        className="focus:outline-none hover:scale-110 transition-transform"
                      >
                        <Star
                          size={20}
                          className={n <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">({reviewRating})</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bình luận (tùy chọn)</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 w-full h-16 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Chia sẻ trải nghiệm..."
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={submitReview}
                    disabled={submittingReview}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    {submittingReview ? 'Đang gửi...' : 'Gửi'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="bg-[#f7f4ff] rounded-2xl p-4 md:p-8">
      <div className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-8">
        {builtTabs.map((tab, idx) => (
          <Button
            key={tab.label}
            shape="rounded"
            size="sm"
            className={`border transition-colors px-4 py-2 md:px-6 md:py-2 text-sm md:text-base
              ${
                active === idx
                  ? "bg-[#6c47c6] text-white font-semibold border-[#6c47c6]"
                  : "bg-white text-[#3d2173] border-[#e2d8fa] font-medium"
              }
            `}
            onClick={() => handleSelectTab(idx)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      <div className="text-base md:text-lg text-gray-700">
        {builtTabs[active].content}
      </div>
    </div>
  );
}
