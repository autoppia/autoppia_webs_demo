import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { EmailProvider } from "@/contexts/EmailContext";
import { LayoutProvider } from "@/contexts/LayoutContext";
// DynamicStructureProvider removed - now using v3-dynamic
import { SeedProvider } from "@/context/SeedContext";
import { getEffectiveSeed, getLayoutConfig } from "@/dynamic/v2-data";
import { getLayoutClasses } from "@/dynamic/v1-layouts";

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
  // For server-side rendering, we'll use default values
  // The actual seed will be handled in client components
  const seed = 1; // Default seed for SSR
  const layoutConfig = getLayoutConfig(seed);
  const layoutClasses = getLayoutClasses(layoutConfig);

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} ${layoutClasses.spacing}`} suppressHydrationWarning>
        <ThemeProvider>
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <SeedProvider>
              <LayoutProvider>
                <EmailProvider>
                  {children}
                </EmailProvider>
              </LayoutProvider>
            </SeedProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
