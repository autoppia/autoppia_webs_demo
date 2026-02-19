import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import { SeedProvider } from "@/context/SeedContext";
import { V4PopupLayer } from "@/components/layout/V4PopupLayer";
import { DynamicDebug } from "@/components/debug/DynamicDebug";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AutoDriver",
  description: "AutoDriver – smart ride booking and trip management",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        ></script>
      </head>
      <body suppressHydrationWarning className="antialiased bg-[#f5fbfc] min-h-screen">
        <SeedProvider>
          <V4PopupLayer>
            <ClientBody>{children}</ClientBody>
            <DynamicDebug />
          </V4PopupLayer>
        </SeedProvider>
      </body>
    </html>
  );
}
