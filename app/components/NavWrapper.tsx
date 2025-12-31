'use client';

import { useState, useEffect } from 'react';
import Nav from "./Nav";

export default function NavWrapper() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category`, {
          next: { revalidate: 3600 }, // cache 1 hour
        });

        if (res.ok) {
          const response = await res.json();
          // backend returns { Success, Message, Data }
          setCategories(response?.Data || response?.data || []);
        } else {
          console.error("NavWrapper: failed to fetch categories", res.status, res.statusText);
        }
      } catch (err) {
        console.error("NavWrapper: error fetching categories", err);
      }
    };

    fetchCategories();
  }, []);

  return <Nav categories={categories} />;
}