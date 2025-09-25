import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NotificationBanner } from "@/components/layout/NotificationBanner";
import { CartProvider } from "@/context/CartContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { BodyWrapper } from "@/components/layout/BodyWrapper";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Autozon - Online Shopping for Electronics, Apparel, and More",
  description:
    "Shop online for the best deals on electronics, clothing, books, and much more at Autozon.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <CartProvider>
          {/* <NotificationBanner /> */}
          <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
            <Header />
          </Suspense>
          <Suspense fallback={<div className="min-h-screen bg-gray-100"></div>}>
            <BodyWrapper>
              {children}
            </BodyWrapper>
          </Suspense>
          <Suspense fallback={<div className="h-32 bg-white"></div>}>
            <Footer />
          </Suspense>
        </CartProvider>
      </body>
    </html>
  );
}
