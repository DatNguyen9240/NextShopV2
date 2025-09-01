import Carousel from "./components/Carousel";
import FeaturedCategories from "./components/FeaturedCategories";
import PopularProductsSection from "./components/PopularProductsSection";

export default function HomePage() {
  return (
    <main>
      <Carousel timeout={4000} className="mx-auto" />
      <FeaturedCategories />
      <PopularProductsSection />
    </main>
  );
}
