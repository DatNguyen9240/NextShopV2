'use client';

import { useCategories } from '@/app/context/CategoryContext';
import Nav from "./Nav";

export default function NavWrapper() {
  const { categories } = useCategories();
  return <Nav categories={categories} />;
}