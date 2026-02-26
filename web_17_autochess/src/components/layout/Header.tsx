"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { Menu, X, Crown } from "lucide-react";

const NAV_LINKS = [
  { href: "/tournaments", label: "Tournaments" },
  { href: "/players", label: "Players" },
  { href: "/tactics", label: "Tactics" },
  { href: "/analysis", label: "Analysis" },
];

export function Header() {
  const router = useSeedRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/");
    setMobileMenuOpen(false);
  };

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    router.push(href);
    setMobileMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <DynamicWrapper>
      <header className="fixed top-0 z-50 w-full border-b border-stone-800/80 bg-[#0c0a09]/90 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <a
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 px-4 py-2 text-lg font-semibold text-white shadow-lg shadow-amber-600/20 transition-all duration-200 hover:shadow-amber-500/40"
          >
            <Crown className="h-5 w-5" />
            <DynamicText value="AutoChess" type="text" />
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(link.href)
                    ? "text-amber-400 bg-amber-400/10"
                    : "text-stone-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <DynamicText value={link.label} type="text" />
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-amber-400 rounded-full" />
                )}
              </a>
            ))}
          </nav>

          {/* Mobile hamburger button */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-800/80 bg-[#0c0a09]/95 backdrop-blur-xl">
            <nav className="flex flex-col py-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-amber-400 bg-amber-400/10 border-l-2 border-amber-400"
                      : "text-stone-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                  }`}
                >
                  <DynamicText value={link.label} type="text" />
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>
      <div className="h-16" />
    </DynamicWrapper>
  );
}
