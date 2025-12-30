"use client";

import { useState } from "react";
import Button from "./Button";

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
    content: <p>Thông tin bổ sung về sản phẩm (kích thước, hướng dẫn bảo quản, xuất xứ, ...).</p>,
  },
  {
    label: "Đánh giá (9)",
    content: <p>Nội dung đánh giá của khách hàng sẽ hiển thị ở đây.</p>,
  },
];

export default function ProductInforTab({
  tabs = defaultTabs,
}: {
  tabs?: Tab[];
}) {
  const [active, setActive] = useState(0);

  return (
    <div className="bg-[#f7f4ff] rounded-2xl p-4 md:p-8">
      <div className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-8">
        {tabs.map((tab, idx) => (
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
            onClick={() => setActive(idx)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      <div className="text-base md:text-lg text-gray-700">
        {tabs[active].content}
      </div>
    </div>
  );
}
