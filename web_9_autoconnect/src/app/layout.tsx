import "./globals.css";
import { ReactNode, Suspense } from "react";
import HeaderNav from "@/components/HeaderNav";
import type { Metadata } from "next";
import LayoutWrapper from "@/components/LayoutWrapper";
import LoadingFallback from "@/components/LoadingFallback";
import { SeedProvider } from "@/context/SeedContext";
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
      <head>
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
      <body className="bg-gray-100 text-gray-900" suppressHydrationWarning>
        <SeedProvider>
          <Suspense fallback={<LoadingFallback />}>
            <LayoutWrapper>
              <HeaderNav />
              <main className="w-full mx-auto mt-6 px-5 md:px-24">{children}</main>
              <DynamicDebug />
            </LayoutWrapper>
          </Suspense>
        </SeedProvider>
      </body>
    </html>
  );
}
