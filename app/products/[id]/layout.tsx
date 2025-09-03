import HomePage from "@/app/page";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HomePage />
      {children}
    </>
  );
}
