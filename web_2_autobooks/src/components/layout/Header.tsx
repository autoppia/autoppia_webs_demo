"use client";

import { BookOpen } from "lucide-react";
import { SeedLink } from "@/components/ui/SeedLink";
import { useSeed } from "@/context/SeedContext";
import { getLayoutConfig } from "@/dynamic/v2-data";
import { applyLayoutOverrides, getLayoutClasses } from "@/dynamic/v1-layouts";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Home", href: "/", preserveSeed: true },
  { label: "Catalog", href: "#library", preserveSeed: false },
  { label: "Genres", href: "#genres", preserveSeed: false },
  { label: "About", href: "#about", preserveSeed: false },
  { label: "Contact", href: "#contact", preserveSeed: false },
];

export function Header() {
  const { seed, resolvedSeeds } = useSeed();
  const { currentUser, logout } = useAuth();
  const layoutSeed = resolvedSeeds.v1 ?? seed;
  const baseSeed = resolvedSeeds.base ?? seed;
  const layoutConfig = applyLayoutOverrides(getLayoutConfig(layoutSeed), baseSeed);
  const layoutClasses = getLayoutClasses(layoutConfig);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
      <div className={`mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 md:flex-row md:items-center md:justify-between ${layoutClasses.header}`}>
        <div className="flex items-center gap-3">
          <SeedLink href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-secondary" />
            <div>
              <p className="text-lg font-semibold uppercase tracking-widest">Autobooks</p>
              <p className="text-xs uppercase text-white/50">AI Reading Room</p>
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
            <SeedLink href="/login" className="text-secondary">
              Login
            </SeedLink>
          )}
        </nav>

      </div>
    </header>
  );
}
