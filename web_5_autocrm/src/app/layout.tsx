// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import Sidebar from "@/components/Sidebar";
import UserNameBadge from "@/components/UserNameBadge";
import { getEffectiveSeed, getLayoutConfig } from "@/utils/dynamicDataProvider";
import { getLayoutClasses } from "@/utils/seedLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoCRM | Smart Client & Case Management Software",
  description: "AutoCRM helps you streamline client communication, manage cases, track tasks, and grow your business with powerful, intuitive CRM tools.",
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body
        className="font-sans bg-neutral text-[#1A1A1A] min-h-screen"
        suppressHydrationWarning
      >
        <nav
          className={`w-full h-20 flex items-center px-10 shadow-sm bg-white gap-6 sticky top-0 z-30 ${layoutClasses.header}`}
          style={{
            WebkitBackdropFilter: "blur(8px)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span className="font-bold text-2xl tracking-tight">
          Auto <span className="text-accent-forest">CRM</span>
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <UserNameBadge />
          </div>
        </nav>
        <div className="flex min-h-[calc(100vh-5rem)] relative">
          <Sidebar />
          <main
            className={`flex-1 relative p-10 min-h-[calc(100vh-5rem)] overflow-y-auto ${layoutClasses.content}`}
            style={{
              paddingLeft: 60,
              paddingRight: 60,
              paddingTop: 40,
              paddingBottom: 40,
            }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
