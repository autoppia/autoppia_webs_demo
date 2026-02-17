import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { SeedProvider } from "@/context/SeedContext";

export const metadata: Metadata = {
  title: "AutoDiscord – Discord-like Demo",
  description: "A mocked Discord-style chat demo for the subnet.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Suspense fallback={<div className="min-h-screen bg-discord-darkest flex items-center justify-center">Loading…</div>}>
          <SeedProvider>{children}</SeedProvider>
        </Suspense>
      </body>
    </html>
  );
}
