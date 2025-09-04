"use client";
import React, { useState } from "react";
import { ProductRating } from "./ProductCard";

const ratings = [5, 4, 3, 2, 1];

const RatingFilter: React.FC = () => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div>
      <h2 className="font-semibold mb-4 text-base text-gray-800">
        Sắp xếp theo đánh giá
      </h2>
      <ul className="space-y-1">
        {ratings.map((rating) => (
          <li
            key={rating}
            className="flex items-center cursor-pointer"
            onClick={() => setSelected(rating)}
          >
            <ProductRating rating={rating} className="text-xl" />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RatingFilter;
