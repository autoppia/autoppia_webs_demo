import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import { DynamicStructureProvider } from "@/context/DynamicStructureContext";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoDining | Easy Restaurant Reservations & Dining Bookings",
  description: "Book your favorite restaurants effortlessly with AutoDining. Discover top dining spots, reserve tables instantly, and enjoy a seamless restaurant booking experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased" suppressHydrationWarning>
        <ClientBody>
          <Suspense fallback={<div>Loading...</div>}>
            <DynamicStructureProvider>
              {children}
            </DynamicStructureProvider>
          </Suspense>
        </ClientBody>
      </body>
    </html>
  );
}
