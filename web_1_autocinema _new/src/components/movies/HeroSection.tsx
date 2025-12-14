"use client";

import type { Movie } from "@/data/movies";
import { SeedLink } from "@/components/ui/SeedLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/library/utils";

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

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#141926] via-[#0F172A] to-[#05070d] p-8 text-white shadow-2xl",
        className
      )}
    >
      <div className="relative flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-1/2">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Sparkles className="h-4 w-4 text-secondary" />
            Curated AI cinema collections
          </div>
          <h1 className="mt-3 text-4xl font-semibold leading-tight lg:text-5xl">
            Discover AI-driven stories, remixed genres, and cinematic experiments.
          </h1>
          <p className="mt-4 text-lg text-white/70">
            Search hundreds of procedurally generated movies loaded directly from our datasets service. No backend, no forms – just cinema.
          </p>

          <form
            className="mt-6 flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              onSearchSubmit();
            }}
          >
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search directors, titles, or moods"
              className="flex-1 bg-white/10 text-white placeholder:text-white/60"
            />
            <Button type="submit" className="bg-secondary text-black hover:bg-secondary/80">
              Search library
            </Button>
          </form>

          <dl className="mt-8 grid grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <dt className="text-xs uppercase tracking-wide text-white/60">Average duration</dt>
              <dd className="mt-2 text-3xl font-bold text-white">{stats.avgDuration}m</dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <dt className="text-xs uppercase tracking-wide text-white/60">Average rating</dt>
              <dd className="mt-2 text-3xl font-bold text-white">{stats.avgRating}</dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <dt className="text-xs uppercase tracking-wide text-white/60">Genres</dt>
              <dd className="mt-2 text-3xl font-bold text-white">{stats.genres}</dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-4 lg:w-1/2" id="genres">
          {featuredMovies.slice(0, 2).map((movie) => (
            <div key={movie.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex items-center justify-between text-xs uppercase text-white/60">
                <span>{movie.genres[0] || "Cinematic"}</span>
                <span className="flex items-center gap-1 text-secondary">
                  <TrendingUp className="h-3 w-3" />
                  Trending
                </span>
              </div>
              <h3 className="mt-2 text-xl font-semibold text-white">{movie.title}</h3>
              <p className="mt-1 text-sm text-white/70">{movie.synopsis}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/60">
                <span className="rounded-full border border-white/15 px-3 py-1">{movie.year}</span>
                <span className="rounded-full border border-white/15 px-3 py-1">{movie.duration}m</span>
                <span className="rounded-full border border-white/15 px-3 py-1">⭐ {movie.rating}</span>
              </div>
              <SeedLink
                href={`/movies/${movie.id}`}
                className="mt-4 inline-flex text-sm text-secondary transition hover:text-secondary/80"
              >
                View detail →
              </SeedLink>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
