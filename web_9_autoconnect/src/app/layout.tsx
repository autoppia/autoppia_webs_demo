import "./globals.css";
import { ReactNode, Suspense } from "react";
import HeaderNav from "@/components/HeaderNav";
import type { Metadata } from "next";
import LayoutWrapper from "@/components/LayoutWrapper";
import LoadingFallback from "@/components/LoadingFallback";
import { SeedProvider } from "@/context/SeedContext";
import { V4PopupLayer } from "@/components/layout/V4PopupLayer";
import { DynamicDebug } from "@/components/debug/DynamicDebug";

export const metadata: Metadata = {
  title: "AutoConnect – A LinkedIn-like Professional Network",
  description:
    "Connect, share updates, and explore jobs on AutoConnect, a modern LinkedIn clone.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-100 text-gray-900" suppressHydrationWarning>
        <SeedProvider>
          <V4PopupLayer>
          <Suspense fallback={<LoadingFallback />}>
            <LayoutWrapper>
              <HeaderNav />
              <main className="w-full mx-auto mt-6 px-5 md:px-24">{children}</main>
              <DynamicDebug />
            </LayoutWrapper>
          </Suspense>
          </V4PopupLayer>
        </SeedProvider>
      </body>
    </html>
  );
}
