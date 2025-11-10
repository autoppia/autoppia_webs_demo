import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Link from "next/link";
import { Suspense } from "react";

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
};

import Header from "@/components/Header";
import { DataReadyGate } from "@/components/DataReadyGate";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="bg-neutral-50 min-h-screen font-sans"
        suppressHydrationWarning
      >
        <Suspense fallback={<div className="w-full h-16 bg-white border-b animate-pulse" />}>
          <Header />
        </Suspense>
        <main className="flex justify-center w-full mt-3 px-2">
          <div className="w-full max-w-7xl">
            <DataReadyGate>
              {children}
            </DataReadyGate>
          </div>
        </main>
      </body>
    </html>
  );
}
