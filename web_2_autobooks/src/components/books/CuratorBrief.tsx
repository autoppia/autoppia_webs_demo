"use client";

import { useSeed } from "@/context/SeedContext";

interface CuratorBriefProps {
  totalBooks: number;
}

const BLURB = [
  "Pair a high-variance layout with a calmer dataset to test miner focus.",
  "Run the same task across two seeds to validate XPath resilience.",
  "Share the unified seed URL so QA can replay the exact DOM + catalog combo.",
];

export function CuratorBrief({ totalBooks }: CuratorBriefProps) {
  const { seed, resolvedSeeds } = useSeed();
  const layoutSeed = resolvedSeeds.v1 ?? seed;
  const datasetSeed = resolvedSeeds.v2 ?? resolvedSeeds.base;

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#04121b] via-[#061b28] to-[#091e33] p-6 text-white shadow-2xl">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="md:max-w-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-secondary">Curator brief</p>
          <h2 className="mt-3 text-3xl font-semibold">This seed combo produces a slightly weirder shelf.</h2>
          <p className="mt-2 text-sm text-white/70">
            Share the URL below with miners when you want to keep DOM + dataset perfectly in sync. Layout seed&nbsp;
            <span className="font-semibold text-white">#{layoutSeed}</span> is mapped to dataset seed&nbsp;
            <span className="font-semibold text-white">#{datasetSeed}</span>, so they only need the base <code>?seed={seed}</code>.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {BLURB.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-secondary/80" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid w-full gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 md:max-w-sm">
          <div className="rounded-2xl border border-white/10 bg-neutral-950/70 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Base seed</p>
            <p className="mt-1 text-3xl font-semibold text-white">{seed}</p>
            <p className="text-xs text-white/50">Set <code>?seed={seed}</code> to reproduce this layout.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-neutral-950/70 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Layout variant</p>
                <p className="mt-1 text-2xl font-semibold text-white">#{layoutSeed}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Dataset</p>
                <p className="mt-1 text-2xl font-semibold text-white">#{datasetSeed}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-white/50">
              {totalBooks} books currently match your filters. Miners see the same rows.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
