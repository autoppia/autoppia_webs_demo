"use client";

import type { Book } from "@/data/books";
import { SeedLink } from "@/components/ui/SeedLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, TrendingUp } from "lucide-react";
import { useMemo } from "react";

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  featuredMovies: Book[];
}

export function HeroSection({ searchQuery, onSearchChange, onSearchSubmit, featuredMovies }: HeroSectionProps) {
  const stats = useMemo(() => {
    const totalPages = featuredMovies.reduce((acc, book) => acc + book.duration, 0);
    return {
      avgPages: featuredMovies.length ? Math.round(totalPages / featuredMovies.length) : 320,
      avgRating: featuredMovies.length
        ? (featuredMovies.reduce((acc, book) => acc + book.rating, 0) / featuredMovies.length).toFixed(1)
        : "4.2",
      genres: new Set(featuredMovies.flatMap((book) => book.genres)).size,
    };
  }, [featuredMovies]);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1f1d] via-[#0a2a32] to-[#041623] p-8 text-white shadow-2xl">
      <div className="relative flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-1/2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-[#9fe6ff]">
            <Sparkles className="h-4 w-4" />
            Book Search
          </div>
          <h1 className="mt-3 text-4xl font-semibold leading-tight lg:text-5xl">
            Find your next great read in seconds.
          </h1>
          <p className="mt-4 text-lg text-white/70">
            Browse thousands of books from every genre and era. Search by author, title, or discover new favorites by exploring our curated collections.
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
              placeholder="Search authors, titles, or vibes"
              className="flex-1 bg-white/10 text-white placeholder:text-white/60"
            />
            <Button type="submit" className="bg-[#ffb347] text-black hover:bg-[#fca02c]">
              Search catalog
            </Button>
          </form>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm text-white/80 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <dt className="text-white/60">Average pages</dt>
              <dd className="text-2xl font-semibold text-white">{stats.avgPages}p</dd>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <dt className="text-white/60">Average rating</dt>
              <dd className="text-2xl font-semibold text-white">{stats.avgRating}</dd>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <dt className="text-white/60">Genres</dt>
              <dd className="text-2xl font-semibold text-white">{stats.genres}</dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-4 lg:w-1/2" id="genres">
          {featuredMovies.slice(0, 2).map((movie) => (
            <div key={movie.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex items-center justify-between text-xs uppercase text-white/60">
                <span>{movie.genres[0] || "Literature"}</span>
                <span className="flex items-center gap-1 text-[#f9e0a1]">
                  <TrendingUp className="h-3 w-3" />
                  Trending
                </span>
              </div>
              <h3 className="mt-2 text-xl font-semibold text-white">{movie.title}</h3>
              <p className="mt-1 text-sm text-white/70">{movie.synopsis}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/60">
                <span className="rounded-full border border-white/15 px-3 py-1">{movie.year}</span>
                <span className="rounded-full border border-white/15 px-3 py-1">{movie.duration}p</span>
                <span className="rounded-full border border-white/15 px-3 py-1">⭐ {movie.rating}</span>
              </div>
              <SeedLink
                href={`/books/${movie.id}`}
                className="mt-4 inline-flex text-sm text-secondary transition hover:text-secondary/80"
              >
                Explore book →
              </SeedLink>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
