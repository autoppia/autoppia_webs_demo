import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { DynamicStructureProvider } from "@/context/DynamicStructureContext";
import { SeedProvider } from "@/context/SeedContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Autolodge – Book Hotels, Cabins & Retreats",
  description:
    "Autolodge is your trusted platform for booking hotels, cabins, and unique stays worldwide. Find your perfect getaway with flexible dates, real guest reviews, and seamless booking.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-neutral-50 min-h-screen font-sans" suppressHydrationWarning>
        <SeedProvider>
          <Suspense fallback={<div className="h-16" />}>
            <DynamicStructureProvider>
              <Header />
              <main className="flex justify-center w-full mt-3 px-2">
                <div className="w-full max-w-7xl">{children}</div>
              </main>
            </DynamicStructureProvider>
          </Suspense>
        </SeedProvider>
      </body>
    </html>
  );
}
