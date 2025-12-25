import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import AnnouncementBar from "./components/AnnouncementBar";
import Header from "./components/Header";
import NavWrapper from "./components/NavWrapper";
import Footer from "./components/Footer";
import { AuthProvider } from "./providers/AuthProvider";
import { getUserFromCookie } from "./lib/getUserFromCookie";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Bán quần áo nam nữ túi xách tại Bình Long",
  description: "Bán quần áo nam nữ túi xách tại Bình Long",
};

export default async function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  const user = await getUserFromCookie();
  return (
    <html lang="en">
      <body className={`${roboto.variable} antialiased`}>
        <AuthProvider initialUser={user}>
          <AnnouncementBar />
          <Header />
          <NavWrapper />
          {children}
          <Footer />
          {modal}
        </AuthProvider>
      </body>
    </html>
  );
}
