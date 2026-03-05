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
import { AuthProvider } from "@/context/AuthContext";

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
  title: "AutoChess | Chess Tournament Platform & Tactics Trainer",
  description: "Search tournaments, explore player profiles, solve tactical puzzles, and analyze chess games with AutoChess.",
  icons: { icon: "/favicon.ico" },
};

function AppSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-stone-950 text-white">
      {/* Header skeleton */}
      <header className="border-b border-stone-800/50 bg-stone-950/95">
        <div className="container mx-auto px-6 max-w-[1400px] h-14 flex items-center gap-6">
          <div className="h-6 w-28 bg-stone-800 rounded animate-pulse" />
          <div className="hidden md:flex gap-4">
            <div className="h-4 w-20 bg-stone-800/60 rounded animate-pulse" />
            <div className="h-4 w-16 bg-stone-800/60 rounded animate-pulse" />
            <div className="h-4 w-20 bg-stone-800/60 rounded animate-pulse" />
            <div className="h-4 w-18 bg-stone-800/60 rounded animate-pulse" />
          </div>
        </div>
      </header>
      {/* Content skeleton */}
      <main className="flex-1 w-full">
        <div className="container mx-auto px-6 max-w-[1400px] py-8 space-y-6">
          <div className="h-48 bg-stone-900 rounded-xl animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="h-20 bg-stone-900 rounded-xl animate-pulse" />
            <div className="h-20 bg-stone-900 rounded-xl animate-pulse" />
            <div className="h-20 bg-stone-900 rounded-xl animate-pulse" />
            <div className="h-20 bg-stone-900 rounded-xl animate-pulse" />
          </div>
          <div className="h-64 bg-stone-900 rounded-xl animate-pulse" />
        </div>
      </main>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased flex flex-col min-h-screen" suppressHydrationWarning>
        <ClientBody>
          <Suspense fallback={<AppSkeleton />}>
            <SeedProvider>
              <AuthProvider>
                <Suspense fallback={null}>
                  <SeedRedirect />
                </Suspense>
                <Header />
                <main className="flex-1 w-full">
                  <div className="container mx-auto px-6 max-w-[1400px]">
                    {children}
                  </div>
                </main>
                <Footer />
                <DynamicDebug />
              </AuthProvider>
            </SeedProvider>
          </Suspense>
        </ClientBody>
      </body>
    </html>
  );
}
