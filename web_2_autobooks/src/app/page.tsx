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
  getFeaturedBooks,
  getLayoutConfig,
  getBooksByGenre,
  searchBooks,
} from "@/utils/dynamicDataProvider";
import { getLayoutClasses } from "@/utils/seedLayout";
import { useSeed } from "@/context/SeedContext";
import type { Book } from "@/data/books";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { ContactSection } from "@/components/contact/ContactSection";
import { CuratorBrief } from "@/components/books/CuratorBrief";

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

  const featuredBooks = useMemo(() => getFeaturedBooks(4), []);
  const genres = useMemo(() => getAvailableGenres(), []);
  const years = useMemo(() => getAvailableYears(), []);

  const filteredBooks = useMemo(() => {
    const yearValue = selectedYear ? Number.parseInt(selectedYear, 10) : undefined;
    return searchBooks(searchQuery, {
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
    logEvent(EVENT_TYPES.SEARCH_BOOK, {
      query: searchQuery,
    });
    updateQueryString({ search: searchQuery });
  };

  const handleGenreChange = (value: string) => {
    setSelectedGenre(value);
    logEvent(EVENT_TYPES.FILTER_BOOK, { genre: value ? { name: value } : null });
    updateQueryString({ genre: value });
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    logEvent(EVENT_TYPES.FILTER_BOOK, { year: value ? Number.parseInt(value, 10) : null });
    updateQueryString({ year: value });
  };

  const handleClear = () => {
    setSelectedGenre("");
    setSelectedYear("");
    setSearchQuery("");
    updateQueryString({ search: "", genre: "", year: "" });
  };

  const handleSelectBook = (book: Book) => {
    logEvent(EVENT_TYPES.BOOK_DETAIL, {
      name: book.title,
      year: book.year,
      genres: book.genres,
      rating: book.rating,
    });
  };

  const fictionFocus = useMemo(() => getBooksByGenre("Drama").slice(0, 5), []);
  const thrillerFocus = useMemo(() => getBooksByGenre("Thriller").slice(0, 5), []);

  return (
    <main className={`mx-auto max-w-6xl space-y-8 px-4 py-8 ${layoutClasses.spacing}`}>
      <HeroSection
        featuredMovies={featuredBooks}
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
        totalResults={filteredBooks.length}
      />

      <CuratorBrief totalBooks={filteredBooks.length} />

      <MovieGrid movies={filteredBooks} onSelectMovie={handleSelectBook} layoutClass={layoutClasses.cards} />

      <SpotlightRow
        title="Fiction focus"
        description="Slow burns, futuristic romances, essays and more pulled from this variant."
        movies={fictionFocus}
      />
      <SpotlightRow
        title="Thriller lab"
        description="High-tension reads sourced from the dataset variant you picked."
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
