import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/components/layout/Navbar";
import { LayoutProvider } from "@/contexts/LayoutProvider";
import { DynamicStructureProvider } from "@/contexts/DynamicStructureContext";
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
        <LayoutProvider>
          <Suspense fallback={<div className="min-h-screen" /> }>
            <DynamicStructureProvider>
              <Navbar />
              {/* Debug badge removed */}
              {/* Optionally add persistent cart ui/button here */}
              <div className="relative pt-4 pb-12 min-h-[calc(100vh-4rem)]">
                {children}
              </div>
            </DynamicStructureProvider>
          </Suspense>
        </LayoutProvider>
      </body>
    </html>
  );
}
