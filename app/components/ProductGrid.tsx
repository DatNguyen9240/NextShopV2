import React from "react";
import ProductCard from "./ProductCard";

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
  cardClassName?: string;
  imageClassName?: string;
  cols?: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  className = "",
  cardClassName = "",
  imageClassName = "",
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

  return (
    <div className={`grid ${colClass} gap-4.5 mx-2 ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          className={cardClassName}
          imageClassName={imageClassName}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
