"use client";

import { useState, useEffect } from "react";
import Button from "./Button";
import { getProductById } from "@/app/services/productService";
import { getReviewsByProduct, ReviewDto } from "@/app/services/reviewService";

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

  async function fetchReviews() {
    if (!productId) return;
    try {
      setReviewsLoading(true);
      const r = await getReviewsByProduct(productId);
      setReviews(r);
      setReviewsLoaded(true);
    } catch (e) {
      console.error('[fetchReviews] error', e);
    } finally {
      setReviewsLoading(false);
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
        reviewsLoading ? (
          <p>Đang tải...</p>
        ) : (
          reviews.length ? (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.reviewId} className="border rounded p-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{r.userName}</div>
                    <div className="text-sm text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="mb-2 text-yellow-500">{'★'.repeat(Math.max(0, Math.min(5, r.rating)))}</div>
                  <div className="text-gray-700">{r.comment}</div>
                </div>
              ))}
            </div>
          ) : (
            <p>Chưa có đánh giá.</p>
          )
        )
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
