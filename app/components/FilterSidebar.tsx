import React from "react";
import PriceFilter from "./PriceFilter";
import CategoryFilter from "./CategoryFilter";
import RatingFilter from "./RatingFilter";
import FeaturedProductAd from "./FeaturedProductAd";

interface FilterSidebarProps {
  className?: string;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ className = "" }) => (
  <aside
    className={`w-72 p-5 border-r bg-white h-full flex flex-col ${className}`}
  >
    <CategoryFilter />
    <div className="mt-10">
      <PriceFilter />
    </div>
    <div className="mt-10">
      <RatingFilter />
    </div>
    <div className="mt-10">
      <FeaturedProductAd />
    </div>
  </aside>
);

export default FilterSidebar;
