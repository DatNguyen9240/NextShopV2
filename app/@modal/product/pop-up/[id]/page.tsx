import ProductModalClient from "./Client";

export default function Page({ params }: { params?: { id?: string } }) {
  // Defensive: sometimes this module is imported without route params (e.g., _not-found rendering).
  // Avoid a hard crash when `params` or `params.id` is missing.
  const id = params?.id;
  if (!id) return null;

  // Server wrapper: render client modal with id
  return <ProductModalClient id={id} isModal={false} />;
}
