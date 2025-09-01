"use client";
import React from "react";
import ProductsTitle from "./ProductsTitle";
import ProductCard from "./ProductCard";

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
];

const NewProductsSection: React.FC = () => (
  <section className="w-full mt-10">
    <div className="mb-4">
      <ProductsTitle
        title="Sản phẩm mới nhất"
        description="Sản phẩm được cập nhật mỗi ngày."
      />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {newProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  </section>
);

export default NewProductsSection;
