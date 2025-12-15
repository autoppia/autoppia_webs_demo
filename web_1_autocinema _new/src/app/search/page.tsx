"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FilterBar } from "@/components/movies/FilterBar";
import { MovieGrid } from "@/components/movies/MovieGrid";
import { SpotlightRow } from "@/components/movies/SpotlightRow";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";
import { logEvent, EVENT_TYPES } from "@/library/events";
import {
  getAvailableGenres,
  getAvailableYears,
  getMoviesByGenre,
  searchMovies,
} from "@/dynamic/v2-data";
import { useSeedRouter } from "@/hooks/useSeedRouter";

const MOVIES_PER_PAGE = 9;

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useSeedRouter();

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

  const updateQueryString = (next: { search?: string; genre?: string; year?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("seed");

    if (next.page !== undefined) {
      if (next.page > 1) params.set("page", next.page.toString());
      else params.delete("page");
    } else {
      params.delete("page");
    }

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
    router.push(query ? `/search?${query}` : "/search");
  };

  const normalizeYearValue = (value: string | undefined) => {
    if (!value) return null;
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const handleGenreChange = (value: string) => {
    setSelectedGenre(value);
    logEvent(EVENT_TYPES.FILTER_FILM, {
      genre: value ? { name: value } : undefined,
      year: normalizeYearValue(selectedYear),
    });
    updateQueryString({ genre: value, page: 1 });
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    logEvent(EVENT_TYPES.FILTER_FILM, {
      genre: selectedGenre ? { name: selectedGenre } : undefined,
      year: normalizeYearValue(value),
    });
    updateQueryString({ year: value, page: 1 });
  };

  const handleSearchSubmit = () => {
    logEvent(EVENT_TYPES.SEARCH_FILM, {
      query: searchQuery,
      genre: selectedGenre ? { name: selectedGenre } : undefined,
      year: normalizeYearValue(selectedYear),
    });
    updateQueryString({ search: searchQuery, page: 1 });
  };

  const handleClear = () => {
    setSelectedGenre("");
    setSelectedYear("");
    setSearchQuery("");
    updateQueryString({ search: "", genre: "", year: "", page: 1 });
  };

  const handleSelectMovie = () => {
    // reserved for future instrumentation
  };


  const dramaFocus = useMemo(() => getMoviesByGenre("Drama").slice(0, 5), []);
  const thrillerFocus = useMemo(() => getMoviesByGenre("Thriller").slice(0, 5), []);

  return (
    <div className="min-h-screen bg-neutral-950">
      <main className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Search Movies</h1>
          <p className="text-lg text-white/70">
            Find your perfect movie with our advanced search engine
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-8">
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              handleSearchSubmit();
            }}
          >
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search directors, titles, or moods"
                className="pl-12 h-14 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-base"
              />
            </div>
            <Button 
              type="submit" 
              className="h-14 px-8 bg-secondary text-black hover:bg-secondary/90 shadow-lg shadow-secondary/20 font-semibold text-base"
            >
              Search
            </Button>
          </form>
        </div>

        <div className="space-y-8">
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

          {filteredMovies.length > 0 ? (
            <>
              <MovieGrid movies={paginatedMovies} onSelectMovie={handleSelectMovie} />

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
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-12 text-center text-white/70">
              <p className="text-lg">No movies found. Try a different genre or year.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading…</div>}>
      <SearchContent />
    </Suspense>
  );
}
