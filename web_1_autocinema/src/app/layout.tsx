import { Header } from "@/layout/Header";
import { Footer } from "@/layout/Footer";
import { SeedProvider } from "@/context/SeedContext";
import { AuthProvider } from "@/context/AuthContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { BodyWrapper } from "@/layout/BodyWrapper";
import { DataReadyGate } from "@/layout/DataReadyGate";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Autocinema – AI Movie Library",
  description:
    "Discover AI-generated movies, explore genres, and dive into cinematic experiments without a backend.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-neutral-950 text-white`} suppressHydrationWarning>
        <AuthProvider>
          <SeedProvider>
            <Suspense fallback={<div className="h-16 w-full bg-neutral-900" />}>
              <Header />
            </Suspense>
            <DataReadyGate>
              <BodyWrapper>
                {children}
              </BodyWrapper>
            </DataReadyGate>
            <Footer />
          </SeedProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
