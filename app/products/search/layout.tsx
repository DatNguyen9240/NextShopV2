import FilterSidebar from "@/app/components/FilterSidebar";
import { FilterProvider } from '@/app/context/FilterContext';

const Layout = ({ children }: { children: React.ReactNode }) => (
  <FilterProvider>
    <div className="flex min-h-screen max-w-[1300px] mx-auto overflow-hidden">
      <FilterSidebar className="hidden lg:block" />
      <main className="flex-1 p-8">{children}</main>
    </div>
  </FilterProvider>
);

export default Layout;
