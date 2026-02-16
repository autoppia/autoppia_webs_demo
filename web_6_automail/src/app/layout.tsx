import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { EmailProvider } from "@/contexts/EmailContext";
import { LayoutProvider } from "@/contexts/LayoutContext";
import { SeedProvider } from "@/context/SeedContext";
import { DynamicDebug } from "@/components/debug/DynamicDebug";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AutoMail - Modern Email Client",
  description: "A modern, intuitive email client with advanced features.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // LAYOUT FIJO - Sin variaciones, la seed se mantiene en URL para V2 y V3

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
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <SeedProvider>
              <LayoutProvider>
                <EmailProvider>
                  {children}
                  <DynamicDebug />
                </EmailProvider>
              </LayoutProvider>
            </SeedProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
