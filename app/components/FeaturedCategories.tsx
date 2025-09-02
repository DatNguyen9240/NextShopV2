import React from "react";
import SectionTitle from "./SectionTitle";

const categories = [
  { label: "Quần áo", icon: "🧥", href: "/quan-ao" },
  { label: "Áo", icon: "👕", href: "/ao" },
  { label: "Quần", icon: "👖", href: "/quan" },
  { label: "Túi xách", icon: "👜", href: "/tui-xach" },
  { label: "Balo", icon: "🎒", href: "/balo" },
  { label: "Ví", icon: "👛", href: "/vi" },
];

const FeaturedCategories: React.FC = () => (
  <section className="hidden lg:block max-w-[1280px] mx-auto mt-10">
    <SectionTitle size="lg">DANH MỤC NỔI BẬT</SectionTitle>
    <div className="flex gap-8 justify-center flex-wrap">
      {categories.map((cat) => (
        <a
          key={cat.label}
          href={cat.href}
          className="flex flex-col items-center w-32 group"
        >
          <div className="w-24 h-24 flex items-center justify-center rounded-full text-5xl bg-gray-50 mb-2 border border-gray-200 transition-transform duration-200 hover:-translate-y-2 hover:shadow-xl cursor-pointer">
            {cat.icon}
          </div>
          <span className="text-base font-semibold text-gray-700 text-center group-hover:text-blue-600 transition-colors duration-200">
            {cat.label}
          </span>
        </a>
      ))}
    </div>
  </section>
);

export default FeaturedCategories;
