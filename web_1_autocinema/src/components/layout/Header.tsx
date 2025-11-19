"use client";

import { useMemo } from "react";
import { Film, Shuffle } from "lucide-react";
import { SeedLink } from "@/components/ui/SeedLink";
import { Button } from "@/components/ui/button";
import { useSeed } from "@/context/SeedContext";
import { getLayoutConfig } from "@/utils/dynamicDataProvider";
import { getLayoutClasses } from "@/utils/seedLayout";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Home", href: "/", preserveSeed: true },
  { label: "Library", href: "#library", preserveSeed: false },
  { label: "Genres", href: "#genres", preserveSeed: false },
  { label: "About", href: "#about", preserveSeed: false },
  { label: "Contact", href: "#contact", preserveSeed: false },
];

export function Header() {
  const { seed, setSeed, resolvedSeeds } = useSeed();
  const { currentUser, logout } = useAuth();
  const layoutSeed = resolvedSeeds.v1 ?? seed;
  const layoutConfig = getLayoutConfig(layoutSeed);
  const layoutClasses = getLayoutClasses(layoutConfig);
  const isSeedThree = seed === 3;
  const floatingAlignmentClass =
    layoutClasses.header.includes("navbar-floating") ?
      (isSeedThree ? "navbar-floating-left" : "navbar-floating-right") :
      "";

  const layoutLabel = useMemo(() => {
    if (!layoutConfig) return "Default";
    return layoutConfig.contentGrid.replace(/\b\w/g, (char) => char.toUpperCase());
  }, [layoutConfig]);

  const shuffleLayout = () => {
    const nextSeed = Math.floor(Math.random() * 300) + 1;
    setSeed(nextSeed);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
      <div
        className={`mx-auto flex w-full flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between ${layoutClasses.header} ${floatingAlignmentClass}`}
      >
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

        <div className="flex items-center gap-3">
          <div className="hidden text-xs text-white/60 sm:block">
            Layout: <span className="font-semibold text-white">{layoutLabel}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="border border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={shuffleLayout}
          >
            <Shuffle className="h-4 w-4" />
            Shuffle layout
          </Button>
        </div>
      </div>
    </header>
  );
}
