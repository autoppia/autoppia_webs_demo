"use client";

import { Film } from "lucide-react";
import { SeedLink } from "@/components/ui/SeedLink";
import { useSeed } from "@/context/SeedContext";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Home", href: "/", preserveSeed: true },
  { label: "Search", href: "/search", preserveSeed: true },
  { label: "About", href: "/about", preserveSeed: true },
  { label: "Contact", href: "/contact", preserveSeed: true },
];

export function Header() {
  const { seed } = useSeed();
  const { currentUser, logout } = useAuth();


  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto flex w-full flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <SeedLink href="/" className="flex items-center gap-2">
            <Film className="h-6 w-6 text-secondary" />
            <div>
              <p className="text-lg font-semibold uppercase tracking-widest">Autocinema</p>
              <p className="text-xs uppercase text-white/50">AI Film Library</p>
            </div>
          </SeedLink>
        </div>

        <nav className="flex flex-wrap items-center gap-4 text-sm text-white/70">
          {NAV_LINKS.map((link) => (
            <SeedLink
              key={link.label}
              href={link.href}
              preserveSeed={link.preserveSeed}
              className="transition hover:text-white"
            >
              {link.label}
            </SeedLink>
          ))}
          {currentUser ? (
            <>
              <SeedLink href="/profile" className="font-semibold text-secondary">
                {currentUser.username}
              </SeedLink>
              <button
                type="button"
                onClick={logout}
                className="text-xs uppercase tracking-wide text-white/60 hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <SeedLink href="/register" className="font-semibold text-secondary">
                Register
              </SeedLink>
              <SeedLink href="/login" className="text-white/80 hover:text-white">
                Login
              </SeedLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
