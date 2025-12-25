"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import SectionTitle from "./SectionTitle";
import { getCategories } from "../services/categoryService";

const FeaturedCategories: React.FC = () => {
  const [cats, setCats] = useState<{ label: string; icon?: string; href: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getCategories()
      .then((data) => {
        if (!mounted) return;
        const roots = (data || []).filter((c: any) => !c.parentId).slice(0, 6);
        if (roots.length) {
          setCats(
            roots.map((c: any) => ({
              label: c.name,
              icon: c.icon,
              href: `/products/category/${c.categoryId}`,
            }))
          );
        } else {
          setCats([]);
        }
      })
      .catch((err) => {
        console.error("FeaturedCategories: getCategories failed", err);
        setCats([]);
      })
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return null;
  if (!cats.length) return null;

  return (
    <section className="hidden lg:block max-w-[1280px] mx-auto mt-10">
      <SectionTitle size="lg">DANH MỤC NỔI BẬT</SectionTitle>
      <div className="flex gap-8 justify-center flex-wrap">
        {cats.map((cat) => (
          <Link key={cat.label} href={cat.href} className="flex flex-col items-center w-32 group">
            <div className="w-24 h-24 flex items-center justify-center rounded-full text-5xl bg-gray-50 mb-2 border border-gray-200 transition-transform duration-200 hover:-translate-y-2 hover:shadow-xl cursor-pointer">
              {cat.icon || "📦"}
            </div>
            <span className="text-base font-semibold text-gray-700 text-center group-hover:text-blue-600 transition-colors duration-200">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;
