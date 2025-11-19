import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import { SeedLink } from "@/components/ui/SeedLink";
import { SeedProvider } from "@/context/SeedContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sidebarLinks = [
  {
    label: "Jobs",
    icon: "https://ext.same-assets.com/1836270417/794014782.svg",
    onclick:"/"
  },
  {
    label: "Talent",
    icon: "https://ext.same-assets.com/1836270417/1421870143.svg",
      onclick:"/"
  },
  {
    label: "Reports",
    icon: "https://ext.same-assets.com/1836270417/3460757120.svg",
      onclick:"/"
  },
  {
    label: "Messages",
    icon: "https://ext.same-assets.com/1836270417/236507066.svg",
      onclick:"/"
  },
];
const topIcons = [
  "https://ext.same-assets.com/1836270417/1421870143.svg",
  "https://ext.same-assets.com/1836270417/3460757120.svg",
];

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
            <div className="min-h-screen flex">
              {/* Sidebar */}
              <aside className="hidden md:flex flex-col bg-white text-[#253037] py-4 px-4 gap-6 shadow-lg">
                <div className="bg-[#17A2B8] px-5 py-1 rounded flex items-center h-9 text-white">
                  <span className="font-semibold text-lg tracking-wide">
                    AutoWork
                  </span>
                </div>
                <nav className="flex flex-col gap-3 ">
                  {sidebarLinks.map((link) => (
                    <SeedLink
                      key={link.label}
                      href="/"
                      className="flex items-center gap-4 px-3 py-2 rounded-lg transition bg-transparent hover:bg-[#e6f9fb] text-base hover:text-[#08b4ce]"
                    >
                      <img src={link.icon} alt="" className="w-5 h-8" />{" "}
                      {link.label}
                    </SeedLink>
                  ))}
                </nav>
              </aside>
              {/* Main area incl. topbar */}
              <div className="flex-1 flex flex-col min-h-screen bg-[#fafafa]">
                <header className="h-16 flex items-center px-6 border-b border-gray-200 bg-white justify-between">
                  <div className="md:hidden flex items-center">
                    <img
                      src="https://ext.same-assets.com/1836270417/3369074439.png"
                      alt="Topwork Logo"
                      className="w-7 h-7 rounded mr-2"
                    />
                    <span className="font-semibold text-lg text-[#253037]">
                      Topwork
                    </span>
                  </div>
                  <div className="flex items-center gap-6 ml-auto">
                    {topIcons.map((icon, i) => (
                      <img
                        key={icon}
                        src={icon}
                        alt=""
                        className="w-7 h-7 opacity-70"
                      />
                    ))}
                    <img
                      src="https://ext.same-assets.com/1836270417/1435009301.png"
                      alt="User avatar"
                      className="w-8 h-8 rounded-full object-cover border border-[#08b4ce]"
                    />
                  </div>
                </header>
                <main className="flex-1">
                  <ClientBody>{children}</ClientBody>
                </main>
              </div>
            </div>
          </SeedProvider>
        </Suspense>
      </body>
    </html>
  );
}
