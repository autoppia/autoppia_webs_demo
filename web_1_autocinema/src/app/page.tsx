"use client";

import { Suspense, useMemo, useState } from "react";
import { useSeedRouter } from "@/dynamic/seed";
import { HeroSection } from "@/components/movies/HeroSection";
import { getFeaturedMovies, getMovies } from "@/dynamic/v2-data";
import { MovieRowCarousel } from "@/components/movies/MovieRowCarousel";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useSeedRouter();

  // Core datasets for rows
  const movies = getMovies();
  // Prefer movies with real posters for the hero; fallback to provider slice
  const featuredMovies = useMemo(() => {
    const realPosters = movies.filter((m) => m.poster && !m.poster.endsWith("default_movie.png"));
    if (realPosters.length >= 4) return realPosters.slice(0, 4);
    if (realPosters.length > 0) return realPosters.slice(0, 4);
    return getFeaturedMovies(4);
  }, [movies]);
  const trending = useMemo(() => movies.slice(4, 16), [movies]); // avoid duplicating featured
  const topRated = useMemo(
    () => [...movies].sort((a, b) => b.rating - a.rating).slice(0, 12),
    [movies]
  );

  const handleSearchSubmit = () => {
    const q = searchQuery.trim();
    router.push(q ? `/explore?search=${encodeURIComponent(q)}` : "/explore");
  };

  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading…</div>}>
      <main className="w-full space-y-8 px-6 py-8">
        <HeroSection
          featuredMovies={featuredMovies}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
        />

        {/* Two slider rows only */}
        <MovieRowCarousel
          title="Popular on Autocinema"
          description="Now trending across the platform"
          movies={trending}
        />
        <MovieRowCarousel
          title="Trending Now"
          description="Because you watched similar titles"
          movies={topRated}
        />
      </main>
    </Suspense>
  );
}
