'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import Footer from './Footer';

// Dynamically import NavWrapper to avoid hydration issues
const NavWrapper = dynamic(() => import('./NavWrapper'), {
  ssr: false,
  loading: () => <div className="h-16 bg-white border-b border-gray-200"></div>
});

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <AnnouncementBar />
      <Header />
      <NavWrapper />
      {children}
      <Footer />
    </>
  );
}