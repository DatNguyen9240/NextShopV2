"use client";
import React from "react";
import Link from "next/link";
import SectionTitle from "./SectionTitle";
import { useCategories } from '@/app/context/CategoryContext';

const FeaturedCategories: React.FC = () => {
  const { categories, loading } = useCategories();

  if (loading) return null;
  const roots = (categories || []).filter((c: any) => !c.parentId).slice(0, 6);
  if (!roots.length) return null;

  return (
    <section className="hidden lg:block max-w-[1280px] mx-auto mt-10">
      <SectionTitle size="lg">DANH MỤC NỔI BẬT</SectionTitle>
      <div className="flex gap-8 justify-center flex-wrap">
        {roots.map((cat) => (
          <Link key={cat.categoryId} href={`/products/category/${cat.categoryId}`} className="flex flex-col items-center w-32 group">
            <div className="w-24 h-24 flex items-center justify-center rounded-full text-5xl bg-gray-50 mb-2 border border-gray-200 transition-transform duration-200 hover:-translate-y-2 hover:shadow-xl cursor-pointer">
              {cat.icon || "📦"}
            </div>
            <span className="text-base font-semibold text-gray-700 text-center group-hover:text-blue-600 transition-colors duration-200">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;
