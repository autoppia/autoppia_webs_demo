import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import { SeedLink } from "@/components/ui/SeedLink";
import { Briefcase, Users, Sparkles, Heart, User } from "lucide-react";
import { SeedProvider } from "@/context/SeedContext";
import UserDropdown from "./components/UserDropdown";

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
    href: "/jobs",
    icon: Briefcase,
  },
  {
    label: "Hires",
    href: "/hires",
    icon: Users,
  },
  {
    label: "Experts",
    href: "/experts",
    icon: Sparkles,
  },
  {
    label: "Favorites",
    href: "/favorites",
    icon: Heart,
  },
  {
    label: "Profile",
    href: "/profile/alexsmith",
    icon: User,
  },
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
              <aside className="hidden md:flex flex-col bg-white text-[#253037] py-6 px-6 gap-8 shadow-lg h-screen sticky top-0 overflow-y-auto w-72">
                {/* Logo - Centered */}
                <div className="flex justify-center">
                  <div className="bg-gradient-to-r from-[#17A2B8] to-[#08b4ce] px-8 py-4 rounded-lg shadow-md">
                    <span className="font-bold text-2xl tracking-wide text-white">
                      AutoWork
                    </span>
                  </div>
                </div>
                
                {/* Navigation Links */}
                <nav className="flex flex-col gap-2 flex-1">
                  {sidebarLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <SeedLink
                        key={link.label}
                        href={link.href}
                        className="flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 bg-transparent hover:bg-gradient-to-r hover:from-[#e6f9fb] hover:to-[#f0fdfa] text-base font-medium hover:text-[#08b4ce] hover:shadow-sm group"
                      >
                        <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>{link.label}</span>
                      </SeedLink>
                    );
                  })}
                </nav>

                {/* Bottom Section */}
                <div className="mt-auto pt-6 border-t border-gray-200">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                    <div className="text-xs font-semibold text-gray-700 mb-1">
                      Need Help?
                    </div>
                    <div className="text-xs text-gray-600">
                      Contact support
                    </div>
                  </div>
                </div>
              </aside>
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
          </SeedProvider>
        </Suspense>
      </body>
    </html>
  );
}
