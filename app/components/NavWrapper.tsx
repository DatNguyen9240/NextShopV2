import Nav from "./Nav";

export default async function NavWrapper() {
  let categories: any[] = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category`, {
      next: { revalidate: 3600 }, // cache 1 hour
    });

    if (res.ok) {
      const response = await res.json();
      // backend returns { Success, Message, Data }
      categories = response?.Data || response?.data || [];
    } else {
      console.error("NavWrapper: failed to fetch categories", res.status, res.statusText);
    }
  } catch (err) {
    console.error("NavWrapper: error fetching categories", err);
  }

  return <Nav categories={categories} />;
}