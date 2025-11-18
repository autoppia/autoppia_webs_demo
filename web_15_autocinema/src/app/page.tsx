"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HeroSection } from "@/components/movies/HeroSection";
import { FilterBar } from "@/components/movies/FilterBar";
import { MovieGrid } from "@/components/movies/MovieGrid";
import { SpotlightRow } from "@/components/movies/SpotlightRow";
import { logEvent, EVENT_TYPES } from "@/library/events";
import {
  getAvailableGenres,
  getAvailableYears,
  getFeaturedMovies,
  getLayoutConfig,
  getMoviesByGenre,
  searchMovies,
} from "@/utils/dynamicDataProvider";
import { getLayoutClasses } from "@/utils/seedLayout";
import { useSeed } from "@/context/SeedContext";
import type { Movie } from "@/data/movies";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { ContactSection } from "@/components/contact/ContactSection";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useSeedRouter();
  const { seed, resolvedSeeds } = useSeed();
  const layoutSeed = resolvedSeeds.v1 ?? seed;
  const layoutConfig = getLayoutConfig(layoutSeed);
  const layoutClasses = getLayoutClasses(layoutConfig);

  const initialSearch = searchParams.get("search") ?? "";
  const initialGenre = searchParams.get("genre") ?? "";
  const initialYear = searchParams.get("year") ?? "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedYear, setSelectedYear] = useState(initialYear);

  useEffect(() => {
    setSearchQuery(initialSearch);
    setSelectedGenre(initialGenre);
    setSelectedYear(initialYear);
  }, [initialSearch, initialGenre, initialYear]);

  const featuredMovies = useMemo(() => getFeaturedMovies(4), []);
  const genres = useMemo(() => getAvailableGenres(), []);
  const years = useMemo(() => getAvailableYears(), []);

  const filteredMovies = useMemo(() => {
    const yearValue = selectedYear ? Number.parseInt(selectedYear, 10) : undefined;
    return searchMovies(searchQuery, {
      genre: selectedGenre || undefined,
      year: yearValue,
    });
  }, [searchQuery, selectedGenre, selectedYear]);

  const updateQueryString = (next: { search?: string; genre?: string; year?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("seed");

    if (next.search !== undefined) {
      if (next.search) params.set("search", next.search);
      else params.delete("search");
    }
    if (next.genre !== undefined) {
      if (next.genre) params.set("genre", next.genre);
      else params.delete("genre");
    }
    if (next.year !== undefined) {
      if (next.year) params.set("year", next.year);
      else params.delete("year");
    }

    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  };

  const handleSearchSubmit = () => {
    logEvent(EVENT_TYPES.SEARCH_MOVIE, {
      query: searchQuery,
      genre: selectedGenre || null,
      year: selectedYear || null,
    });
    updateQueryString({ search: searchQuery });
  };

  const handleGenreChange = (value: string) => {
    setSelectedGenre(value);
    logEvent(EVENT_TYPES.FILTER_MOVIES, { filter: "genre", value });
    updateQueryString({ genre: value });
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    logEvent(EVENT_TYPES.FILTER_MOVIES, { filter: "year", value });
    updateQueryString({ year: value });
  };

  const handleClear = () => {
    setSelectedGenre("");
    setSelectedYear("");
    setSearchQuery("");
    updateQueryString({ search: "", genre: "", year: "" });
  };

  const handleSelectMovie = (movie: Movie) => {
    logEvent(EVENT_TYPES.VIEW_MOVIE_DETAIL, { movie_id: movie.id, title: movie.title });
  };

  const dramaFocus = useMemo(() => getMoviesByGenre("Drama").slice(0, 5), []);
  const thrillerFocus = useMemo(() => getMoviesByGenre("Thriller").slice(0, 5), []);

  return (
    <main className={`mx-auto max-w-6xl space-y-8 px-4 py-8 ${layoutClasses.spacing}`}>
      <HeroSection
        featuredMovies={featuredMovies}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      <FilterBar
        genres={genres}
        years={years}
        selectedGenre={selectedGenre}
        selectedYear={selectedYear}
        onGenreChange={handleGenreChange}
        onYearChange={handleYearChange}
        onClear={handleClear}
        totalResults={filteredMovies.length}
      />

      <MovieGrid movies={filteredMovies} onSelectMovie={handleSelectMovie} layoutClass={layoutClasses.cards} />

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
      <ContactSection />
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading…</div>}>
      <HomeContent />
    </Suspense>
  );
}
