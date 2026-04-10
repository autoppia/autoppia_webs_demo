"use client";

import { Suspense, useMemo, useState } from "react";
import { Library, MapPin, Search } from "lucide-react";
import {
  FAMOUS_LIBRARIES,
  filterLibrariesByLocationQuery,
} from "@/data/libraries";
import { SeedLink } from "@/components/ui/SeedLink";
import { Input } from "@/components/ui/input";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";

function LibrariesContent() {
  const dyn = useDynamicSystem();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => filterLibrariesByLocationQuery(FAMOUS_LIBRARIES, query), [query]);

  return (
    <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative min-h-screen text-white">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />

      <main className="relative mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-secondary mb-2 flex items-center gap-2">
              <Library className="h-4 w-4" />
              {dyn.v3.getVariant("libraries_section_kicker", TEXT_VARIANTS_MAP, "World collections")}
            </p>
            <h1
              id={dyn.v3.getVariant("libraries-page-heading", ID_VARIANTS_MAP, "libraries-page-heading")}
              className="text-4xl font-bold"
            >
              {dyn.v3.getVariant("libraries_page_title", TEXT_VARIANTS_MAP, "Famous libraries")}
            </h1>
            <p className="mt-2 max-w-2xl text-white/65">
              {dyn.v3.getVariant(
                "libraries_page_subtitle",
                TEXT_VARIANTS_MAP,
                "Search by city, country, or name. Each entry opens a short profile."
              )}
            </p>
          </div>
          <SeedLink
            href="/"
            preserveSeed
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            {dyn.v3.getVariant("libraries_back_home", TEXT_VARIANTS_MAP, "Back to home")}
          </SeedLink>
        </div>

        <label className="mb-8 block">
          <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
            <Search className="h-4 w-4 text-secondary" />
            {dyn.v3.getVariant("libraries_search_label", TEXT_VARIANTS_MAP, "Search by location or name")}
          </span>
          <Input
            id={dyn.v3.getVariant("library-location-search", ID_VARIANTS_MAP, "library-location-search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={cn(
              "h-12 max-w-xl bg-white/10 text-white placeholder:text-white/45 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20",
              dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, "")
            )}
            placeholder={dyn.v3.getVariant("libraries_search_placeholder", TEXT_VARIANTS_MAP, "Try Paris, Dublin, or New York…")}
          />
        </label>

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
            {dyn.v3.getVariant("libraries_empty", TEXT_VARIANTS_MAP, "No libraries match that search.")}
          </p>
        ) : (
          <ul className="space-y-4">
            {filtered.map((lib) => (
              <li key={lib.id}>
                <SeedLink
                  href={`/libraries/${encodeURIComponent(lib.id)}`}
                  preserveSeed
                  className="block rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur-sm transition hover:border-secondary/35"
                >
                  <h2 className="text-xl font-semibold text-white">{lib.name}</h2>
                  <p className="mt-1 flex items-center gap-2 text-sm text-secondary">
                    <MapPin className="h-4 w-4" />
                    {lib.city}, {lib.country}
                  </p>
                  <p className="mt-3 line-clamp-2 text-sm text-white/60">{lib.description}</p>
                </SeedLink>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default function LibrariesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading…</div>}>
      <LibrariesContent />
    </Suspense>
  );
}
