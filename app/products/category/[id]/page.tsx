"use client";

import { useParams } from "next/navigation";

const CategoryPage = () => {
  const params = useParams();
  const slug = params?.id;

  return (
    <div>
      <h1>Category: {slug}</h1>
      {/* Hiển thị sản phẩm theo slug ở đây */}
    </div>
  );
};

export default CategoryPage;
