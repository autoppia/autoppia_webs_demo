import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/components/layout/Navbar";
import { LayoutProvider } from "@/contexts/LayoutProvider";
// DynamicStructureProvider removed - now using v3-dynamic
import { RestaurantProvider } from "@/contexts/RestaurantContext";
import { SeedProvider } from "@/context/SeedContext";
import { DataReadyGate } from "@/components/layout/DataReadyGate";
import { Suspense } from "react";
// import DebugVariationBadge from "@/components/debug/DebugVariationBadge";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Auto Delivery App",
  description: "Order food from the best local restaurants, fast and easy.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} bg-zinc-50`}
    >
      <body className="min-h-screen font-sans bg-zinc-50" suppressHydrationWarning>
        <SeedProvider>
          <LayoutProvider>
            <RestaurantProvider>
              <Suspense fallback={<div className="min-h-screen" />}>
                <DataReadyGate>
                  <Navbar />
                  {/* Debug badge removed */}
                  {/* Optionally add persistent cart ui/button here */}
                  <div className="relative pt-4 pb-12 min-h-[calc(100vh-4rem)]">
                    {children}
                  </div>
                </DataReadyGate>
              </Suspense>
            </RestaurantProvider>
          </LayoutProvider>
        </SeedProvider>
      </body>
    </html>
  );
}
