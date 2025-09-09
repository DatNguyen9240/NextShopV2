import React from "react";

type ProductsTitleProps = {
  title: string;
  description?: string;
};

const ProductsTitle: React.FC<ProductsTitleProps> = ({
  title,
  description,
}) => (
  <div className="flex flex-col justify-center h-full">
    <h2 className="text-xl font-bold text-gray-800 leading-tight truncate">
      {title}
    </h2>
    <p className="text-sm text-gray-500 mt-1 leading-tight truncate">
      {description}
    </p>
  </div>
);

export default ProductsTitle;
