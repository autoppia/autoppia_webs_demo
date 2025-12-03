"use client";

import { useSeed } from "@/context/SeedContext";
import { getLayoutConfig } from "@/dynamic/v2-data";
import { getLayoutClasses } from "@/dynamic/v1-layouts";

export function Footer() {
  const { seed, resolvedSeeds } = useSeed();
  const layoutSeed = resolvedSeeds.v1 ?? seed;
  const config = getLayoutConfig(layoutSeed);
  const classes = getLayoutClasses(config);

  return (
    <footer className={`border-t border-white/10 bg-neutral-950/90 text-white/70 ${classes.footer}`}>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-secondary">Autocinema</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Your ultimate movie search engine.</h3>
          <p className="mt-4 text-base text-white/70 leading-relaxed max-w-2xl mx-auto">
            Find the perfect movie in seconds. From timeless classics to the latest releases, our search engine lets you explore thousands of films by genre, decade, style, or mood. Type what you're looking for and start discovering. Whether you're in the mood for a heart-wrenching drama, an edge-of-your-seat thriller, or a mind-bending sci-fi adventure, your next cinematic obsession is waiting.
          </p>
        </div>
      </div>
      <div className="border-t border-white/5 bg-neutral-950/70">
        <div className="mx-auto flex w-full flex-col gap-3 px-6 py-4 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} Autoppia Experiments</p>
        </div>
      </div>
    </footer>
  );
}
