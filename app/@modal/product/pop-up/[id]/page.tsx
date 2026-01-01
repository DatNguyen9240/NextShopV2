import ProductModalClient from "./Client";

export default function Page({ params }: { params?: { id?: string } }) {
  const id = params?.id;
  if (!id) return null;

  return <ProductModalClient id={id} isModal={false} />;
}
