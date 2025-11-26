import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
// DynamicStructureProvider removed - now using v3-dynamic
import { SeedProvider } from "@/context/SeedContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { BodyWrapper } from "@/components/layout/BodyWrapper";
import { DataReadyGate } from "@/components/layout/DataReadyGate";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Autozone - Online Shopping for Electronics, Apparel, and More",
  description:
    "Shop online for the best deals on electronics, clothing, books, and much more at Autozone.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <SeedProvider>
          <CartProvider>
            {/* <NotificationBanner /> */}
            <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
              <Header />
            </Suspense>
            <Suspense fallback={<div className="min-h-screen bg-gray-100"></div>}>
              <DataReadyGate>
                <BodyWrapper>
                  {children}
                </BodyWrapper>
              </DataReadyGate>
            </Suspense>
            <Suspense fallback={<div className="h-32 bg-white"></div>}>
              <Footer />
            </Suspense>
          </CartProvider>
        </SeedProvider>
      </body>
    </html>
  );
}
