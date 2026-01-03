import ProductModal from "@/app/@modal/product/pop-up/[id]/Client";
import ProductCarousel from "@/app/components/ProductCarousel";
import ProductInforTab from "@/app/components/ProductInforTab";
import ProductsTitle from "@/app/components/ProductsTitle";

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <>
      <ProductModal isModal={false} id={params.id} />
      <div className="mt-20">
        <ProductInforTab />
      </div>
      <section className="max-w-[1300px] w-full mx-auto mt-12 overflow-hidden">
        <ProductsTitle
          title="Sản phẩm thời trang"
          description="Không thể bỏ qua những sản phẩm hot nhất!"
        />
        <div className="px-4 mt-4">
          <ProductCarousel products={[]} />
        </div>
      </section>
    </>
  );
}
