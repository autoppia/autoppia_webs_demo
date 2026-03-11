import { Header } from "@/layout/Header";
import { Footer } from "@/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { SeedProvider } from "@/context/SeedContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { BodyWrapper } from "@/layout/BodyWrapper";
import { DataReadyGate } from "@/layout/DataReadyGate";
import { SeedRedirect } from "@/components/layout/SeedRedirect";
import { DynamicDebug } from "@/components/debug/DynamicDebug";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Autofinance - Personal Finance Management Dashboard",
  description:
    "Manage your finances, track accounts, monitor spending, and achieve your financial goals with Autofinance.",
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
        <div suppressHydrationWarning>
          <SeedProvider>
            <CartProvider>
              <Suspense fallback={null}>
                <SeedRedirect />
              </Suspense>
              <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200" />}>
                <Header />
              </Suspense>
              <DataReadyGate>
                <BodyWrapper>
                  {children}
                </BodyWrapper>
              </DataReadyGate>
              <DynamicDebug />
              <Footer />
            </CartProvider>
          </SeedProvider>
        </div>
      </body>
    </html>
  );
}
