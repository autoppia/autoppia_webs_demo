"use client";

import { SeedLink } from "@/components/ui/SeedLink";
import { useSeed } from "@/context/SeedContext";
import { getLayoutConfig } from "@/utils/dynamicDataProvider";
import { getLayoutClasses } from "@/utils/seedLayout";

const QUICK_LINKS = [
  { label: "Now Showing", href: "#library" },
  { label: "Genres", href: "#genres" },
  { label: "Watchlists", href: "#" },
];

const ABOUT_LINKS = [
  { label: "Manifesto", href: "#about" },
  { label: "Tech Stack", href: "#about" },
  { label: "Feedback", href: "mailto:team@autoppia.com", preserveSeed: false },
];

export function Footer() {
  const { seed, resolvedSeeds } = useSeed();
  const layoutSeed = resolvedSeeds.v1 ?? seed;
  const config = getLayoutConfig(layoutSeed);
  const classes = getLayoutClasses(config);

  return (
    <footer className={`border-t border-white/10 bg-neutral-950/90 text-white/70 ${classes.footer}`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:flex-row md:justify-between">
        <div className="max-w-md">
          <p className="text-sm uppercase tracking-[0.3em] text-secondary">Autocinema</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Generative stories for adventurous moviegoers.</h3>
          <p className="mt-3 text-sm text-white/60">
            Built with Next.js and Tailwind. Data is loaded from the shared datasets API so you can explore every variant without a backend.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm" id="about">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/40">Browse</p>
            <ul className="mt-3 space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <SeedLink href={link.href} className="transition hover:text-white">
                    {link.label}
                  </SeedLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-white/40">Project</p>
            <ul className="mt-3 space-y-2">
              {ABOUT_LINKS.map((link) => (
                <li key={link.label}>
                  <SeedLink
                    href={link.href}
                    preserveSeed={link.preserveSeed}
                    className="transition hover:text-white"
                  >
                    {link.label}
                  </SeedLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 bg-neutral-950/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>Base seed #{seed} → layout variant #{layoutSeed}.</p>
          <p>&copy; {new Date().getFullYear()} Autoppia Experiments</p>
        </div>
      </div>
    </footer>
  );
}
