import "./globals.css";
import { ReactNode, Suspense } from "react";
import HeaderNav from "@/components/HeaderNav";
import type { Metadata } from "next";
import LayoutWrapper from "@/components/LayoutWrapper";
import LoadingFallback from "@/components/LoadingFallback";
// DynamicStructureProvider removed - now using v3-dynamic
import { SeedProvider } from "@/context/SeedContext";

export const metadata: Metadata = {
  title: "AutoConnect – A LinkedIn-like Professional Network",
  description:
    "Connect, share updates, and explore jobs on AutoConnect, a modern LinkedIn clone.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900" suppressHydrationWarning>
        <SeedProvider>
          <Suspense fallback={<LoadingFallback />}>
            <LayoutWrapper>
              <HeaderNav />
              <main className="w-full mx-auto mt-6 px-5 md:px-24">{children}</main>
            </LayoutWrapper>
          </Suspense>
        </SeedProvider>
      </body>
    </html>
  );
}
