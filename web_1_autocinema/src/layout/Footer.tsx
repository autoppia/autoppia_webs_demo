"use client";

import { SeedLink } from "@/components/ui/SeedLink";
import { useSeed } from "@/context/SeedContext";
import { pickVariant } from "@/components/ui/variants";

const QUICK_LINKS = [
  { label: "Now Showing" },
  { label: "Genres" },
  { label: "Watchlists" },
];

const ABOUT_LINKS = [
  { label: "Manifesto" },
  { label: "Tech Stack" },
  { label: "Feedback" },
];

export function Footer() {
  const { seed } = useSeed();
  // Dynamic (seed-based) styling
  const footerVariant = pickVariant(seed, "footer", 2);

  return (
    <footer className={`border-t border-white/10 bg-neutral-950/90 text-white/70 ${footerVariant === 1 ? "backdrop-blur" : ""}`}>
      <div className="mx-auto flex w-full flex-col gap-8 px-6 py-12 md:flex-row md:justify-between">
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
                  <span className="text-white/70">{link.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-white/40">Project</p>
            <ul className="mt-3 space-y-2">
              {ABOUT_LINKS.map((link) => (
                <li key={link.label}>
                  <span className="text-white/70">{link.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 bg-neutral-950/70">
        <div className="mx-auto flex w-full flex-col gap-3 px-6 py-4 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>Autocinema</p>
          <p>&copy; {new Date().getFullYear()} Autoppia Experiments</p>
        </div>
      </div>
    </footer>
  );
}
