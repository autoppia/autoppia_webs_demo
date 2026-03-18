import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import { SeedProvider } from "@/context/SeedContext";
import { V4PopupLayer } from "@/components/layout/V4PopupLayer";
import UserDropdown from "./components/UserDropdown";
import Sidebar from "./components/Sidebar";
import DynamicDebug from "./components/DynamicDebug";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Autowork - Hire Freelancers",
  description: "Hire skilled freelancers on Autowork for web development, design, marketing, and more.",
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
      <body suppressHydrationWarning className="antialiased bg-[#f5f6fa]">
        <Suspense fallback={<div className="min-h-screen bg-[#f5f6fa]" />}>
          <SeedProvider>
            <V4PopupLayer>
            <div className="min-h-screen flex">
              {/* Sidebar */}
              <Sidebar />
              {/* Main area incl. topbar */}
              <div className="flex-1 flex flex-col min-h-screen bg-[#fafafa]">
                <header className="pt-6 pb-4 flex items-center px-6 border-b border-gray-200 bg-white justify-between">
                  <div className="md:hidden flex items-center">
                    <img
                      src="https://ext.same-assets.com/1836270417/3369074439.png"
                      alt="AutoWork Logo"
                      className="w-7 h-7 rounded mr-2"
                    />
                    <span className="font-semibold text-lg text-[#253037]">
                      AutoWork
                    </span>
                  </div>
                  <div className="flex items-center gap-6 ml-auto">
                    <UserDropdown />
                  </div>
                </header>
                <main className="flex-1">
                  <ClientBody>{children}</ClientBody>
                </main>
              </div>
            </div>
            <DynamicDebug />
            </V4PopupLayer>
          </SeedProvider>
        </Suspense>
      </body>
    </html>
  );
}
