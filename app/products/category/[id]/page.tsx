"use client";

import { useState, useEffect } from "react";
import ProductGrid from "@/app/components/ProductGrid";
import ViewModeSwitcher from "@/app/components/ViewModeSwitcher";
import { useBreakpoint } from "@/app/hooks/useBreakpoint";

const newProducts = [
  {
    id: "1",
    label: "POCO C61, 4GB RAM, 6...",
    priceOld: "15000",
    priceNew: "20000",
    percent: "10%",
    inStock: true,
    image: "/sell_off/01.jpg",
    rating: 5,
  },
  {
    id: "2",
    label: 'KSC "KHATUSHYAM COLL...',
    priceOld: "520",
    priceNew: "750",
    percent: "9%",
    inStock: true,
    image: "/sell_off/02.jpg",
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

const CategoryPage = () => {
  const breakpoint = useBreakpoint();

  const modes =
    breakpoint < "md"
      ? [
          { key: 2, label: "Grid 2" },
          { key: 3, label: "Grid 3" },
        ]
      : [
          { key: 4, label: "Grid 4" },
          { key: 3, label: "Grid 3" },
        ];

  const [cols, setCols] = useState(modes[0].key);
  useEffect(() => {
    setCols(modes[0].key);
  }, [breakpoint, modes]);

  return (
    <div>
      <div className="mb-8">
        <ViewModeSwitcher value={cols} onChange={setCols} modes={modes} />
      </div>
      <ProductGrid products={newProducts} cols={cols} />
    </div>
  );
};

export default CategoryPage;
