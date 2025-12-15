"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FilterBar } from "@/components/movies/FilterBar";
import { MovieGrid } from "@/components/movies/MovieGrid";
import { SpotlightRow } from "@/components/movies/SpotlightRow";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, X, TrendingUp, Calendar, Clock, Star, Grid3x3, List, ArrowUpDown } from "lucide-react";
import { logEvent, EVENT_TYPES } from "@/library/events";
import {
  getAvailableGenres,
  getAvailableYears,
  getMoviesByGenre,
  searchMovies,
  getMovies,
} from "@/dynamic/v2-data";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { cn } from "@/library/utils";

const MOVIES_PER_PAGE = 9;

type SortOption = "default" | "rating-desc" | "rating-asc" | "year-desc" | "year-asc" | "duration-desc" | "duration-asc";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useSeedRouter();

  const initialSearch = searchParams.get("search") ?? "";
  const initialGenre = searchParams.get("genre") ?? "";
  const initialYear = searchParams.get("year") ?? "";
  const initialSort = (searchParams.get("sort") as SortOption) || "default";
  const currentPage = Number.parseInt(searchParams.get("page") || "1", 10);

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);

  useEffect(() => {
    setSearchQuery(initialSearch);
    setSelectedGenre(initialGenre);
    setSelectedYear(initialYear);
    setSortBy(initialSort);
  }, [initialSearch, initialGenre, initialYear, initialSort]);

  const genres = useMemo(() => getAvailableGenres(), []);
  const years = useMemo(() => getAvailableYears(), []);
  const allMovies = useMemo(() => getMovies(), []);

  // Get popular genres (top 6 by movie count)
  const popularGenres = useMemo(() => {
    const genreCounts = genres.map((genre) => ({
      genre,
      count: getMoviesByGenre(genre).length,
    }));
    return genreCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map((g) => g.genre);
  }, [genres]);

  const filteredMovies = useMemo(() => {
    const yearValue = selectedYear ? Number.parseInt(selectedYear, 10) : undefined;
    let results = searchMovies(searchQuery, {
      genre: selectedGenre || undefined,
      year: yearValue,
    });

    // Apply sorting
    if (sortBy !== "default") {
      const [field, order] = sortBy.split("-");
      results = [...results].sort((a, b) => {
        let comparison = 0;
        if (field === "rating") {
          comparison = a.rating - b.rating;
        } else if (field === "year") {
          comparison = a.year - b.year;
        } else if (field === "duration") {
          comparison = a.duration - b.duration;
        }
        return order === "desc" ? -comparison : comparison;
      });
    }

    return results;
  }, [searchQuery, selectedGenre, selectedYear, sortBy]);

  const totalPages = Math.ceil(filteredMovies.length / MOVIES_PER_PAGE);
  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * MOVIES_PER_PAGE;
    return filteredMovies.slice(startIndex, startIndex + MOVIES_PER_PAGE);
  }, [filteredMovies, currentPage]);

  const updateQueryString = (next: { search?: string; genre?: string; year?: string; sort?: SortOption; page?: number }) => {
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
    if (next.sort !== undefined) {
      if (next.sort !== "default") params.set("sort", next.sort);
      else params.delete("sort");
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
    setSortBy("default");
    updateQueryString({ search: "", genre: "", year: "", sort: "default", page: 1 });
  };

  const handleSelectMovie = () => {
    // reserved for future instrumentation
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    updateQueryString({ sort: newSort, page: 1 });
  };

  const hasActiveFilters = selectedGenre || selectedYear || searchQuery || sortBy !== "default";

  // Calculate stats for filtered results
  const stats = useMemo(() => {
    if (filteredMovies.length === 0) {
      return {
        avgRating: "0.0",
        avgDuration: 0,
        yearRange: "N/A",
      };
    }
    const totalRating = filteredMovies.reduce((acc, movie) => acc + movie.rating, 0);
    const totalDuration = filteredMovies.reduce((acc, movie) => acc + movie.duration, 0);
    const minYear = Math.min(...filteredMovies.map((m) => m.year));
    const maxYear = Math.max(...filteredMovies.map((m) => m.year));

    return {
      avgRating: (totalRating / filteredMovies.length).toFixed(1),
      avgDuration: Math.round(totalDuration / filteredMovies.length),
      yearRange: minYear === maxYear ? `${minYear}` : `${minYear} - ${maxYear}`,
    };
  }, [filteredMovies]);

  const dramaFocus = useMemo(() => getMoviesByGenre("Drama").slice(0, 5), []);
  const thrillerFocus = useMemo(() => getMoviesByGenre("Thriller").slice(0, 5), []);

  return (
    <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative">
      {/* Background grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      {/* Background gradient overlays */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
      
      <main className="relative mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Search Movies</h1>
          <p className="text-lg text-white/70">
            Find your perfect movie with our advanced search engine
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-6">
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

        {/* Quick Genre Filters */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-white/60 mb-3">Popular Genres:</p>
          <div className="flex flex-wrap gap-2">
            {popularGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreChange(selectedGenre === genre ? "" : genre)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  selectedGenre === genre
                    ? "bg-secondary text-black shadow-lg shadow-secondary/20"
                    : "bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:border-white/30"
                )}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters & Sort */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-semibold text-white/60">Active filters:</span>
              {searchQuery && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/20 border border-secondary/30 text-white">
                  <span className="text-sm">"{searchQuery}"</span>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      updateQueryString({ search: "", page: 1 });
                    }}
                    className="hover:text-secondary transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {selectedGenre && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/20 border border-secondary/30 text-white">
                  <span className="text-sm">{selectedGenre}</span>
                  <button
                    onClick={() => handleGenreChange("")}
                    className="hover:text-secondary transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {selectedYear && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/20 border border-secondary/30 text-white">
                  <span className="text-sm">{selectedYear}</span>
                  <button
                    onClick={() => handleYearChange("")}
                    className="hover:text-secondary transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {sortBy !== "default" && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/20 border border-secondary/30 text-white">
                  <span className="text-sm capitalize">{sortBy.replace("-", " ")}</span>
                  <button
                    onClick={() => handleSortChange("default")}
                    className="hover:text-secondary transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Sort Dropdown - Moved to right */}
          <div className="flex items-center gap-2 ml-auto">
            <ArrowUpDown className="h-4 w-4 text-white/60" />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="h-10 min-w-[200px] rounded-xl border border-white/20 bg-white/10 px-4 py-2 pr-10 text-sm font-medium text-white backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:bg-white/15 cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '12px',
              }}
            >
              <option value="default" className="bg-neutral-900 text-white">Sort by: Default</option>
              <option value="rating-desc" className="bg-neutral-900 text-white">Rating: High to Low</option>
              <option value="rating-asc" className="bg-neutral-900 text-white">Rating: Low to High</option>
              <option value="year-desc" className="bg-neutral-900 text-white">Year: Newest First</option>
              <option value="year-asc" className="bg-neutral-900 text-white">Year: Oldest First</option>
              <option value="duration-desc" className="bg-neutral-900 text-white">Duration: Longest First</option>
              <option value="duration-asc" className="bg-neutral-900 text-white">Duration: Shortest First</option>
            </select>
          </div>
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

          {/* Stats for filtered results */}
          {filteredMovies.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-white/60 mb-1">
                  <Star className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase">Avg Rating</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.avgRating}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-white/60 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase">Avg Duration</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.avgDuration}m</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-white/60 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase">Year Range</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.yearRange}</div>
              </div>
            </div>
          )}

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
            <div className="rounded-3xl border border-dashed border-white/20 bg-gradient-to-br from-white/5 to-white/0 p-12 text-center backdrop-blur-sm">
              <div className="max-w-md mx-auto">
                <SearchIcon className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">No movies found</h3>
                <p className="text-white/70 mb-6">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-white/60 mb-3">Suggestions:</p>
                  <ul className="text-sm text-white/70 space-y-1">
                    <li>• Try a different genre or year</li>
                    <li>• Check your spelling</li>
                    <li>• Use broader search terms</li>
                    <li>• Clear all filters to see all movies</li>
                  </ul>
                </div>
                {hasActiveFilters && (
                  <Button
                    onClick={handleClear}
                    className="mt-6 bg-secondary text-black hover:bg-secondary/90"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
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
