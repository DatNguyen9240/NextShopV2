import React from "react";
import ProductCard from "./ProductCard";
import ProductCardHorizontal from "./ProductCardHorizontal";

type Product = {
  id?: string;
  label: string;
  priceOld: string;
  priceNew: string;
  percent: string;
  inStock: boolean;
  image: string;
  imageHover?: string;
  rating: number;
};

interface ProductGridProps {
  products: Product[];
  className?: string;
  cols?: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  className = "",
  cols = 3,
}) => {
  const colClass =
    cols === 1
      ? "grid-cols-1"
      : cols === 2
      ? "grid-cols-2"
      : cols === 3
      ? "grid-cols-3"
      : cols === 4
      ? "grid-cols-4"
      : "grid-cols-1";

  const xlHeightClass =
    cols === 3 ? "xl:h-[300px]" : cols === 2 ? "xl:h-[200px]" : "";
  if (cols === 1) {
    return (
      <div className={`flex flex-col gap-4.5 ${className}`}>
        {products.map((product) => (
          <ProductCardHorizontal key={product.id} product={product} />
        ))}
      </div>
    );
  }
  return (
    <div className={`grid ${colClass} gap-4.5 ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          imageClassName={xlHeightClass}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
