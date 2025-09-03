"use client";
import React, { useState } from "react";
import ProductsTitle from "./ProductsTitle";
import ProductCard from "./ProductCard";
import { PaginationButton } from "./Button";

// Dữ liệu mẫu sản phẩm mới
const newProducts = [
  {
    id: "1",
    label: "POCO C61, 4GB RAM, 6...",
    priceOld: "15000",
    priceNew: "20000",
    percent: "10%",
    inStock: true,
    image: "/products/poco-c61.jpg",
    rating: 5,
  },
  {
    id: "2",
    label: 'KSC "KHATUSHYAM COLL...',
    priceOld: "520",
    priceNew: "750",
    percent: "9%",
    inStock: true,
    image: "/products/bag-red.jpg",
    rating: 4,
  },
  {
    id: "3",
    label: 'KSC "KHATUSHYAM COLL...',
    priceOld: "490",
    priceNew: "460",
    percent: "10%",
    inStock: true,
    image: "/products/bag-black.jpg",
    rating: 5,
  },
  {
    id: "4",
    label: "ZAALIQA Girls Black ...",
    priceOld: "750",
    priceNew: "620",
    percent: "11%",
    inStock: true,
    image: "/products/bag-black2.jpg",
    rating: 5,
  },
  {
    id: "5",
    label: "ZAALIQA Girls Black ...",
    priceOld: "750",
    priceNew: "620",
    percent: "11%",
    inStock: true,
    image: "/products/bag-black2.jpg",
    rating: 5,
  },
  {
    id: "6",
    label: "ZAALIQA Girls Black ...",
    priceOld: "750",
    priceNew: "620",
    percent: "11%",
    inStock: true,
    image: "/products/bag-black2.jpg",
    rating: 5,
  },
  {
    id: "7",
    label: "ZAALIQA Girls Black ...",
    priceOld: "750",
    priceNew: "620",
    percent: "11%",
    inStock: true,
    image: "/products/bag-black2.jpg",
    rating: 5,
  },
  {
    id: "8",
    label: "ZAALIQA Girls Black ...",
    priceOld: "750",
    priceNew: "620",
    percent: "11%",
    inStock: true,
    image: "/products/bag-black2.jpg",
    rating: 5,
  },
  {
    id: "9",
    label: "ZAALIQA Girls Black 9",
    priceOld: "750",
    priceNew: "620",
    percent: "11%",
    inStock: true,
    image: "/products/bag-black2.jpg",
    rating: 5,
  },
  {
    id: "10",
    label: "ZAALIQA Girls Black 10",
    priceOld: "750",
    priceNew: "620",
    percent: "11%",
    inStock: true,
    image: "/products/bag-black2.jpg",
    rating: 5,
  },
  {
    id: "11",
    label: "ZAALIQA Girls Black 11",
    priceOld: "750",
    priceNew: "620",
    percent: "11%",
    inStock: true,
    image: "/products/bag-black2.jpg",
    rating: 5,
  },
  {
    id: "12",
    label: "ZAALIQA Girls Black 12",
    priceOld: "750",
    priceNew: "620",
    percent: "11%",
    inStock: true,
    image: "/products/bag-black2.jpg",
    rating: 5,
  },
  {
    id: "13",
    label: "ZAALIQA Girls Black 13",
    priceOld: "750",
    priceNew: "620",
    percent: "11%",
    inStock: true,
    image: "/products/bag-black2.jpg",
    rating: 5,
  },
  {
    id: "14",
    label: "ZAALIQA Girls Black 14",
    priceOld: "750",
    priceNew: "620",
    percent: "11%",
    inStock: true,
    image: "/products/bag-black2.jpg",
    rating: 5,
  },
  {
    id: "15",
    label: "ZAALIQA Girls Black 15",
    priceOld: "750",
    priceNew: "620",
    percent: "11%",
    inStock: true,
    image: "/products/bag-black2.jpg",
    rating: 5,
  },
  {
    id: "16",
    label: "ZAALIQA Girls Black 16",
    priceOld: "750",
    priceNew: "620",
    percent: "11%",
    inStock: true,
    image: "/products/bag-black2.jpg",
    rating: 5,
  },
  {
    id: "17",
    label: "ZAALIQA Girls Black 17",
    priceOld: "750",
    priceNew: "620",
    percent: "11%",
    inStock: true,
    image: "/products/bag-black2.jpg",
    rating: 5,
  },
  {
    id: "18",
    label: "ZAALIQA Girls Black 18",
    priceOld: "750",
    priceNew: "620",
    percent: "11%",
    inStock: true,
    image: "/products/bag-black2.jpg",
    rating: 5,
  },
  {
    id: "19",
    label: "ZAALIQA Girls Black 19",
    priceOld: "750",
    priceNew: "620",
    percent: "11%",
    inStock: true,
    image: "/products/bag-black2.jpg",
    rating: 5,
  },
];

const PAGE_SIZE = 16; // 4 dòng x 4 cột

const NewProductsSection: React.FC = () => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(newProducts.length / PAGE_SIZE);

  const productsToShow = newProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <section className="w-full mt-10 px-2 sm:px-4">
      <div className="mb-4">
        <ProductsTitle
          title="Sản phẩm mới nhất"
          description="Sản phẩm được cập nhật mỗi ngày."
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4.5 lg:gap-6 lg:mx-0 mx-2">
        {productsToShow.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="flex justify-center items-center gap-2 mt-6">
        <PaginationButton
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Trang trước
        </PaginationButton>
        <span>
          {page} / {totalPages}
        </span>
        <PaginationButton
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Trang sau
        </PaginationButton>
      </div>
    </section>
  );
};

export default NewProductsSection;
