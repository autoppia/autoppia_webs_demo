"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/movies/HeroSection";
import { SpotlightRow } from "@/components/movies/SpotlightRow";
import { getFeaturedMovies, getMoviesByGenre } from "@/dynamic/v2-data";
import { useSeedRouter } from "@/hooks/useSeedRouter";

function HomeContent() {
  const router = useSeedRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const featuredMovies = useMemo(() => getFeaturedMovies(6), []);

  const handleSearchSubmit = () => {
    // Redirect to search page with query
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    const query = params.toString();
    router.push(query ? `/search?${query}` : "/search");
  };

  const dramaFocus = useMemo(() => getMoviesByGenre("Drama").slice(0, 5), []);
  const thrillerFocus = useMemo(() => getMoviesByGenre("Thriller").slice(0, 5), []);

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Full-width Hero Section with mini search */}
      <HeroSection
        featuredMovies={featuredMovies}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Main Content - Spotlight sections */}
      <main className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="space-y-12">
          <SpotlightRow
            title="Drama focus"
            description="Slow burns, futuristic romances, and everything in between"
            movies={dramaFocus}
          />
          <SpotlightRow
            title="Thriller laboratory"
            description="High-tension ideas sourced from the dataset variant you picked"
            movies={thrillerFocus}
          />
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading…</div>}>
      <HomeContent />
    </Suspense>
  );
}
