import BannerCarouselRemote from "./components/BannerCarouselRemote";
import FeaturedCategories from "./components/FeaturedCategories";
import PopularProductsSection from "./components/PopularProductsSection";
import FeaturedProductsSection from "./components/FeaturedProductsSection";
export default function HomePage() {
  return (
    <main>
      <BannerCarouselRemote type="sell_off" timeout={4000} />
      <FeaturedCategories />
      <PopularProductsSection />
      <FeaturedProductsSection />
    </main>
  );
}
