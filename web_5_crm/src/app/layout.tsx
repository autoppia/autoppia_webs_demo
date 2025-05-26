// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import Sidebar from "@/components/Sidebar";
import UserNameBadge from "@/components/UserNameBadge";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Client CRM",
  description: "Dashboard client CRM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body
        className="font-sans bg-neutral text-[#1A1A1A] min-h-screen"
        suppressHydrationWarning
      >
        <nav
          className="w-full h-20 flex items-center px-10 shadow-sm bg-white gap-6 sticky top-0 z-30"
          style={{
            WebkitBackdropFilter: "blur(8px)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span className="font-bold text-2xl tracking-tight">
            Client Matter <span className="text-accent-forest">CRM</span>
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <UserNameBadge />
          </div>
        </nav>
        <div className="flex min-h-[calc(100vh-5rem)] relative">
          <Sidebar />
          <main
            className="flex-1 relative p-10 min-h-[calc(100vh-5rem)] overflow-y-auto"
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
