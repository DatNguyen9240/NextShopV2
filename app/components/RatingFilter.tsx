"use client";
import React, { useState } from "react";
import { ProductRating } from "./ProductCard";
import { useFilter } from '@/app/context/FilterContext';

const ratings = [5, 4, 3, 2, 1];

const RatingFilter: React.FC = () => {
  const { filters, setFilters } = useFilter();
  const [selected, setSelected] = useState<number | null>(filters.rating ?? null);

  // keep local selection in sync with global filters (e.g., when reset)
  React.useEffect(() => {
    setSelected(filters.rating ?? null);
  }, [filters.rating]);

  const handleClick = (rating: number) => {
    // toggle when clicking the same rating: clear the rating and sort
    if (selected === rating) {
      setSelected(null);
      setFilters({ rating: null, sort: null });
      return;
    }

    setSelected(rating);
    // set rating filter and sort by rating desc
    setFilters({ rating, sort: 'rating_desc' });
  };

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
            onClick={() => handleClick(rating)}
          >
            <ProductRating rating={rating} className="text-xl" />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RatingFilter;
