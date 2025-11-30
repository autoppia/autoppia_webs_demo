"use client";

import type { Movie } from "@/models";
import { SeedLink } from "@/components/ui/SeedLink";
import { Button } from "@/components/ui/button";
import { Play, Plus } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/utils/library_utils";
import { useSeedValue, pickVariant } from "@/components/ui/variants";

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  featuredMovies: Movie[];
  className?: string;
}

export function HeroSection({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  featuredMovies,
  className,
}: HeroSectionProps) {
  // Dynamic (seed-based) layout variation
  const seed = useSeedValue();
  const layoutVariant = pickVariant(seed, "hero-layout", 3);
  const stats = useMemo(() => {
    const totalDuration = featuredMovies.reduce((acc, movie) => acc + movie.duration, 0);
    return {
      avgDuration: featuredMovies.length ? Math.round(totalDuration / featuredMovies.length) : 90,
      avgRating: featuredMovies.length
        ? (featuredMovies.reduce((acc, movie) => acc + movie.rating, 0) / featuredMovies.length).toFixed(1)
        : "4.0",
      genres: new Set(featuredMovies.flatMap((movie) => movie.genres)).size,
    };
  }, [featuredMovies]);

  const primary = featuredMovies[0];

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0B0F1A] via-[#0A0E19] to-[#05070d] p-0 text-white shadow-2xl",
        className
      )}
    >
      <div className="relative">
        {/* Background cinematic still */}
        <div
          className="absolute inset-0 bg-cover bg-center brightness-50 scale-105"
          style={{
            backgroundImage: primary
              ? `linear-gradient(180deg, rgba(5,7,13,0.6), rgba(5,7,13,0.95)), url(${primary.poster}), url('/media/gallery/default_movie.png')`
              : undefined,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/60" />

        {/* Content */}
        <div className="relative p-8 lg:p-12">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-white/70">
            <span className="rounded-sm bg-red-600 px-1.5 py-0.5 text-[10px] font-bold leading-none">N</span>
            <span className="uppercase">Series</span>
          </div>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-6xl lg:text-7xl">
            {primary ? primary.title : "Autocinema Originals"}
          </h1>
          {primary ? (
            <p className="mt-4 max-w-2xl text-base text-white/85 md:text-lg">
              {primary.synopsis}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {primary ? (
              <SeedLink href={`/movies/${primary.id}`} className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-black">
                <Play className="h-4 w-4" />
                Play
              </SeedLink>
            ) : null}
            <SeedLink href="/profile" className="inline-flex items-center gap-2 rounded-md bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 hover:bg-white/15">
              <Plus className="h-4 w-4" />
              My List
            </SeedLink>
          </div>
        </div>
      </div>
    </section>
  );
}
