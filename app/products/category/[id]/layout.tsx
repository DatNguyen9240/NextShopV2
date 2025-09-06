import FilterSidebar from "@/app/components/FilterSidebar";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen max-w-[1300px] mx-auto">
    <FilterSidebar className="hidden lg:block" />
    <main className="flex-1 p-8">{children}</main>
  </div>
);

export default Layout;
