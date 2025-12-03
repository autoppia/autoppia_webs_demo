import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SeedProvider } from "@/context/SeedContext";
import { AuthProvider } from "@/context/AuthContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { BodyWrapper } from "@/components/layout/BodyWrapper";
import { DataReadyGate } from "@/components/layout/DataReadyGate";
import { SeedRedirect } from "@/components/layout/SeedRedirect";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Autobooks – AI Reading Room",
  description:
    "Discover AI-generated book catalogs, roam genres, and explore experimental reading experiences without a backend.",
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
            <Suspense fallback={null}>
              <SeedRedirect />
            </Suspense>
            <Suspense fallback={<div className="h-16 w-full bg-neutral-900" />}>
              <Header />
            </Suspense>
            <Suspense fallback={<div className="min-h-screen bg-neutral-950" />}>
              <DataReadyGate>
                <BodyWrapper>
                  {children}
                </BodyWrapper>
              </DataReadyGate>
            </Suspense>
            <Footer />
          </SeedProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
