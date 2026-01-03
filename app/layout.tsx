import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "./components/ConditionalLayout";
import { AuthProvider } from "./providers/AuthProvider";
import CategoryProvider from "./context/CategoryContext";
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
          <CategoryProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            {modal}
          </CategoryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
