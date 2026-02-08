export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-[1300px] mx-auto px-2 sm:px-6 lg:py-8">{children}</div>
  );
}
