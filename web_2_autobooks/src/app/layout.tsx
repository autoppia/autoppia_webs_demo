import { Header } from "@/components/layout/Header";
import { SeedProvider } from "@/context/SeedContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                // Aggressively hide Next.js error overlay and issue notifications
                const hideErrorOverlay = () => {
                  // Hide by common selectors
                  const selectors = [
                    '[data-nextjs-toast]',
                    '#__next-build-watcher',
                    '[role="dialog"]',
                    'div[class*="nextjs"]',
                    'div[id*="__next"]',
                    'div[data-nextjs-dialog]',
                    'button[aria-label*="Issue"]',
                    'button[aria-label*="Error"]',
                  ];

                  selectors.forEach(selector => {
                    try {
                      document.querySelectorAll(selector).forEach(el => {
                        if (el.textContent && (el.textContent.includes('Issue') || el.textContent.includes('Error'))) {
                          el.remove();
                        }
                      });
                    } catch(e) {}
                  });

                  // Hide any element with "Issue" text that's positioned at bottom
                  document.querySelectorAll('*').forEach(el => {
                    try {
                      const text = el.textContent || el.innerText || '';
                      const style = window.getComputedStyle(el);
                      const rect = el.getBoundingClientRect();

                      if (text.includes('Issue') || text.includes('issue')) {
                        if (style.position === 'fixed' || style.position === 'absolute') {
                          if (rect.bottom < window.innerHeight + 100 && rect.bottom > window.innerHeight - 100) {
                            el.style.display = 'none';
                            el.style.visibility = 'hidden';
                            el.style.opacity = '0';
                            el.remove();
                          }
                        }
                      }
                    } catch(e) {}
                  });
                };

                // Run immediately and aggressively
                hideErrorOverlay();
                setInterval(hideErrorOverlay, 50);

                // Watch for DOM changes
                const observer = new MutationObserver(hideErrorOverlay);
                if (document.body) {
                  observer.observe(document.body, { childList: true, subtree: true, attributes: true });
                }
                if (document.documentElement) {
                  observer.observe(document.documentElement, { childList: true, subtree: true });
                }

                // Prevent error overlay from appearing
                const originalConsoleError = console.error;
                console.error = function() {
                  hideErrorOverlay();
                  return originalConsoleError.apply(console, arguments);
                };
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-neutral-950 text-white`} suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
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
          </SeedProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
