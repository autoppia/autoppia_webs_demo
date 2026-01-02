"use client";

import { Film } from "lucide-react";
import { usePathname } from "next/navigation";
import { SeedLink } from "@/components/ui/SeedLink";
import { useSeed } from "@/context/SeedContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/library/utils";
import { useDynamicSystem } from "@/dynamic/shared";

const NAV_LINKS = [
  { label: "Home", href: "/", preserveSeed: true, textKey: "nav_home" },
  { label: "Search", href: "/search", preserveSeed: true, textKey: "nav_search" },
  { label: "About", href: "/about", preserveSeed: true, textKey: "nav_about" },
  { label: "Contact", href: "/contact", preserveSeed: true, textKey: "nav_contact" },
];

export function Header() {
  const { seed } = useSeed();
  const dyn = useDynamicSystem();
  const { currentUser, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (!pathname) return false;
    // Remove query parameters for comparison
    const cleanPathname = pathname.split("?")[0];
    
    if (href === "/") {
      return cleanPathname === "/";
    }
    // For exact matches like /login, /register, /search, etc.
    return cleanPathname === href || cleanPathname.startsWith(href + "/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto flex w-full flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <SeedLink href="/web_1_autocinema/public" className="flex items-center gap-2">
            <Film className="h-6 w-6 text-secondary" />
            <div>
              <p className="text-lg font-semibold uppercase tracking-widest">Autocinema</p>
              <p className="text-xs uppercase text-white/50">AI Film Library</p>
            </div>
          </SeedLink>
        </div>

        <nav className="flex flex-wrap items-center gap-4 text-sm text-white/70">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <SeedLink
                key={link.label}
                href={link.href}
                preserveSeed={link.preserveSeed}
                className={cn(
                  "transition hover:text-white",
                  active && "font-semibold text-secondary"
                )}
              >
                {dyn.v3.getVariant(link.textKey!, undefined, link.label)}
              </SeedLink>
            );
          })}
          {currentUser ? (
            <>
              <SeedLink 
                href="/profile" 
                className={cn(
                  "font-semibold transition",
                  isActive("/profile") ? "text-secondary" : "text-secondary/80 hover:text-secondary"
                )}
              >
                {currentUser.username}
              </SeedLink>
              <button
                type="button"
                onClick={logout}
                className="text-xs uppercase tracking-wide text-white/60 hover:text-white transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <SeedLink 
                href="/register" 
                className={cn(
                  "transition",
                  isActive("/register") ? "font-semibold text-secondary" : "text-white/70 hover:text-white"
                )}
              >
                Register
              </SeedLink>
              <SeedLink 
                href="/login"
                className={cn(
                  "transition",
                  isActive("/login") ? "font-semibold text-secondary" : "text-white/70 hover:text-white"
                )}
              >
                Login
              </SeedLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
