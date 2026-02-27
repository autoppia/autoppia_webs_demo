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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased flex flex-col min-h-screen" suppressHydrationWarning>
        <ClientBody>
          <Suspense fallback={<div>Loading...</div>}>
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
