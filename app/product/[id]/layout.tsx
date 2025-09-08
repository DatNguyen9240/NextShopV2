export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-[1240px] mx-auto sm:px-6 lg:py-8">{children}</div>
  );
}
