import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import AnnouncementBar from "./components/AnnouncementBar";
import Header from "./components/Header";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Bán quần áo nam nữ túi xách tại Bình Long",
  description: "Bán quần áo nam nữ túi xách tại Bình Long",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} antialiased`}>
        <AnnouncementBar />
        <Header />
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
