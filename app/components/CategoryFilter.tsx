import React from "react";

const categories = [
  "Quần",
  "Áo",
  "Đồ lót",
  "Túi xách",
  "Mũ nón",
  "Balo",
  "Ví bóp",
  "Đồ sơ sinh",
  "Đồ học sinh",
];

const CategoryFilter: React.FC = () => (
  <div>
    <h2 className="font-semibold mb-4 text-sm text-gray-800 tracking-wide">
      Danh mục sản phẩm
    </h2>
    <ul className="space-y-3 max-h-[160px] overflow-y-auto pr-2 custom-scroll">
      {categories.map((cat) => (
        <li key={cat} className="flex items-center text-sm text-gray-900">
          <input
            type="radio"
            name="category"
            className="mr-3 w-4 h-4 accent-black"
          />
          <span className="truncate">{cat}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default CategoryFilter;
