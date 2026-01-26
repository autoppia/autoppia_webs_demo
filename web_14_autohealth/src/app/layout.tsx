import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import Navbar from "@/components/site/navbar";
import Footer from "@/components/site/footer";
import { SeedProvider } from "@/context/SeedContext";
import { DataReadyGate } from "@/components/layout/DataReadyGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoHealth",
  description: "Demo healthcare portal — static UI with dummy data",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <SeedProvider>
          <DataReadyGate>
            <ClientBody>
              <div className="min-h-dvh flex flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </ClientBody>
          </DataReadyGate>
        </SeedProvider>
      </body>
    </html>
  );
}
