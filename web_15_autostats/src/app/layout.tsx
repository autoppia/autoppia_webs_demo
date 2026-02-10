import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import { SeedProvider } from "@/context/SeedContext";
import { Suspense } from "react";
import { SeedRedirect } from "@/components/layout/SeedRedirect";
import { DynamicDebug } from "@/components/debug/DynamicDebug";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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
  title: "AutoStats | Bittensor Network Explorer & Analytics",
  description: "Explore the Bittensor network with AutoStats. View blocks, transactions, validators, subnets, and network statistics in real-time.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased flex flex-col min-h-screen bg-zinc-950 text-zinc-100" suppressHydrationWarning>
        <ClientBody>
          <Suspense fallback={<div>Loading...</div>}>
            <SeedProvider>
              <Suspense fallback={null}>
                <SeedRedirect />
              </Suspense>
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <DynamicDebug />
            </SeedProvider>
          </Suspense>
        </ClientBody>
      </body>
    </html>
  );
}
