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
import { V4PopupLayer } from "@/components/layout/V4PopupLayer";
import { DynamicDebug } from "@/components/debug/DynamicDebug";

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
      <head>
        {/* Inyectar seed desde la URL antes de que React se monte */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const params = new URLSearchParams(window.location.search);
                  const seed = params.get('seed');
                  if (seed) {
                    window.__INITIAL_SEED__ = parseInt(seed, 10);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
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
              <V4PopupLayer>
                <DataReadyGate>
                  <BodyWrapper>
                    {children}
                  </BodyWrapper>
                </DataReadyGate>
              </V4PopupLayer>
            </Suspense>
            <DynamicDebug />
            <Footer />
          </SeedProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
