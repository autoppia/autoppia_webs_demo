"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
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
} from "@/dynamic/v2-data";
import { getLayoutClasses } from "@/dynamic/v1-layouts";
import { useSeed } from "@/context/SeedContext";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { ContactSection } from "@/components/contact/ContactSection";
import { Pagination } from "@/components/ui/Pagination";

const MOVIES_PER_PAGE = 10;

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useSeedRouter();
  const { seed, resolvedSeeds } = useSeed();
  const layoutSeed = resolvedSeeds.v1 ?? seed;
  const layoutConfig = getLayoutConfig(layoutSeed);
  const layoutClasses = getLayoutClasses(layoutConfig);
  const isSeedThree = seed === 3;

  const initialSearch = searchParams.get("search") ?? "";
  const initialGenre = searchParams.get("genre") ?? "";
  const initialYear = searchParams.get("year") ?? "";
  const currentPage = Number.parseInt(searchParams.get("page") || "1", 10);

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

  const totalPages = Math.ceil(filteredMovies.length / MOVIES_PER_PAGE);
  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * MOVIES_PER_PAGE;
    return filteredMovies.slice(startIndex, startIndex + MOVIES_PER_PAGE);
  }, [filteredMovies, currentPage]);

  const updateQueryString = (next: { search?: string; genre?: string; year?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("seed");
    params.delete("page"); // Reset to page 1 when filters change

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

  const normalizeYearValue = (value: string | undefined) => {
    if (!value) return null;
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const handleSearchSubmit = () => {
    logEvent(EVENT_TYPES.SEARCH_FILM, {
      query: searchQuery,
      genre: selectedGenre ? { name: selectedGenre } : undefined,
      year: normalizeYearValue(selectedYear),
    });
    updateQueryString({ search: searchQuery });
  };

  const handleGenreChange = (value: string) => {
    setSelectedGenre(value);
    logEvent(EVENT_TYPES.FILTER_FILM, {
      genre: value ? { name: value } : undefined,
      year: normalizeYearValue(selectedYear),
    });
    updateQueryString({ genre: value });
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    logEvent(EVENT_TYPES.FILTER_FILM, {
      genre: selectedGenre ? { name: selectedGenre } : undefined,
      year: normalizeYearValue(value),
    });
    updateQueryString({ year: value });
  };

  const handleClear = () => {
    setSelectedGenre("");
    setSelectedYear("");
    setSearchQuery("");
    updateQueryString({ search: "", genre: "", year: "" });
  };

  const handleSelectMovie = () => {
    // reserved for future instrumentation
  };

  const dramaFocus = useMemo(() => getMoviesByGenre("Drama").slice(0, 5), []);
  const thrillerFocus = useMemo(() => getMoviesByGenre("Thriller").slice(0, 5), []);

  return (
    <main className={`mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 ${layoutClasses.spacing}`}>
      <HeroSection
        featuredMovies={featuredMovies}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        className={isSeedThree ? "hero-align-right" : undefined}
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

      <MovieGrid movies={paginatedMovies} onSelectMovie={handleSelectMovie} layoutClass={layoutClasses.cards} />

      {filteredMovies.length > MOVIES_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredMovies.length}
        />
      )}

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
