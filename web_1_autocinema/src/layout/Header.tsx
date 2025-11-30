"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Film, Menu, X } from "lucide-react";
import { SeedLink } from "@/components/ui/SeedLink";
import { useSeed } from "@/context/SeedContext";
import { pickVariant } from "@/components/ui/variants";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Home", href: "/", preserveSeed: true },
  { label: "Explore", href: "/explore", preserveSeed: true },
  { label: "About", href: "/about", preserveSeed: true },
  { label: "Contact", href: "#contact", preserveSeed: false },
];

export function Header() {
  const { seed } = useSeed();
  const { currentUser, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  // Dynamic (seed-based) layout tweak
  const headerVariant = pickVariant(seed, "header", 3);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <SeedLink href="/" className="flex items-center gap-2">
            <Film className="h-6 w-6 text-secondary" />
            <div className="leading-tight">
              <p className="text-sm font-semibold uppercase tracking-widest sm:text-base">Autocinema</p>
              <p className="hidden text-[10px] uppercase text-white/50 sm:block">AI Film Library</p>
            </div>
          </SeedLink>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-white/10 bg-white/5 p-2 text-white/80 hover:bg-white/10 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        {/* Desktop nav */}
        <nav
          className={`hidden items-center gap-2 text-sm md:flex ${
            headerVariant === 1 ? "md:justify-center" : ""
          }`}
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <SeedLink
                key={link.label}
                href={link.href}
                preserveSeed={link.preserveSeed}
                className={`rounded-full px-3 py-1.5 transition ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </SeedLink>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="hidden items-center gap-2 md:flex">
          {currentUser ? (
            <>
              <SeedLink href="/watchlist" className="rounded-full px-3 py-1.5 text-white/80 hover:bg-white/5 hover:text-white">
                Watchlist
              </SeedLink>
              <SeedLink
                href="/profile"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-secondary"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-secondary/20 text-[10px] text-secondary">
                  {currentUser.username.slice(0, 1).toUpperCase()}
                </span>
                {currentUser.username}
              </SeedLink>
              <button
                type="button"
                onClick={logout}
                className="rounded-full px-3 py-1.5 text-xs uppercase tracking-wide text-white/60 hover:bg-white/5 hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <SeedLink href="/login" className="rounded-full px-3 py-1.5 text-white/80 hover:bg-white/5 hover:text-white">
                Login
              </SeedLink>
              <SeedLink href="/register" className="rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-black hover:bg-secondary/80">
                Register
              </SeedLink>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-neutral-950/80 backdrop-blur md:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-3">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <SeedLink
                  key={link.label}
                  href={link.href}
                  preserveSeed={link.preserveSeed}
                  className={`rounded-lg px-3 py-2 transition ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </SeedLink>
              );
            })}
            <div className="mt-1 flex items-center gap-2">
              {currentUser ? (
                <>
                  <SeedLink href="/watchlist" className="flex-1 rounded-lg px-3 py-2 text-white/80 hover:bg-white/5 hover:text-white" onClick={() => setMenuOpen(false)}>
                    Watchlist
                  </SeedLink>
                  <SeedLink href="/profile" className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-secondary" onClick={() => setMenuOpen(false)}>
                    {currentUser.username}
                  </SeedLink>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="flex-1 rounded-lg px-3 py-2 text-left text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <SeedLink href="/login" className="flex-1 rounded-lg px-3 py-2 text-white/80 hover:bg-white/5 hover:text-white" onClick={() => setMenuOpen(false)}>
                    Login
                  </SeedLink>
                  <SeedLink href="/register" className="flex-1 rounded-lg bg-secondary px-3 py-2 text-center text-sm font-semibold text-black hover:bg-secondary/80" onClick={() => setMenuOpen(false)}>
                    Register
                  </SeedLink>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
