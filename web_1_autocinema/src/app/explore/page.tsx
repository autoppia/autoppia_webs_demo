"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getMovies } from "@/dynamic/v2-data";
import { MovieGrid } from "@/components/movies/MovieGrid";
import { FilterBar } from "@/components/movies/FilterBar";
import { DynamicText } from "@/components/ui/DynamicText";
import { SpotlightRow } from "@/components/movies/SpotlightRow";
import { Input } from "@/components/ui/input";

function ExploreContent() {
  const movies = getMovies();
  const genres = useMemo(() => Array.from(new Set(movies.flatMap((m) => m.genres))).sort(), [movies]);
  const years = useMemo(() => Array.from(new Set(movies.map((m) => m.year))).sort((a, b) => b - a), [movies]);
  const quickGenres = useMemo(() => genres.slice(0, 8), [genres]);

  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"relevance" | "rating" | "year_desc" | "title">("relevance");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return movies.filter((movie) => {
      const genreOk = !selectedGenre || movie.genres.includes(selectedGenre);
      const yearOk = !selectedYear || movie.year === Number(selectedYear);
      const textOk =
        q.length === 0 ||
        movie.title.toLowerCase().includes(q) ||
        movie.synopsis.toLowerCase().includes(q) ||
        movie.director.toLowerCase().includes(q) ||
        movie.cast.some((c) => c.toLowerCase().includes(q));
      return genreOk && yearOk && textOk;
    });
  }, [movies, selectedGenre, selectedYear, search]);

  const sorted = useMemo(() => {
    if (sortBy === "relevance") return filtered;
    const copy = [...filtered];
    if (sortBy === "rating") copy.sort((a, b) => b.rating - a.rating);
    if (sortBy === "year_desc") copy.sort((a, b) => b.year - a.year);
    if (sortBy === "title") copy.sort((a, b) => a.title.localeCompare(b.title));
    return copy;
  }, [filtered, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  return (
    <main className="w-full space-y-8 px-6 py-8">
      {/* Sticky toolbar */}
      <section className="sticky top-16 z-10 rounded-2xl border border-white/10 bg-neutral-900 p-4 shadow-lg">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <label className="text-xs uppercase tracking-wide text-white/60">
              Search
              <Input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="mt-1 bg-white/10 text-white placeholder:text-white/60"
                placeholder="Search titles, directors, or cast"
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-xs text-white/60">
              <span className="font-semibold text-white">{filtered.length}</span> results
            </div>
            <label className="flex items-center gap-2 text-sm">
              Sort
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setPage(1);
                }}
                className="rounded-md border border-white/15 bg-black/40 px-2 py-1 text-white"
              >
                <option value="relevance">Relevance</option>
                <option value="rating">Rating</option>
                <option value="year_desc">Newest</option>
                <option value="title">Title A–Z</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              Page size
              <input
                type="number"
                min={5}
                max={100}
                value={pageSize}
                onChange={(e) => {
                  const val = Math.max(5, Math.min(100, Number(e.target.value) || 25));
                  setPageSize(val);
                  setPage(1);
                }}
                className="w-20 rounded-md border border-white/15 bg-black/40 px-2 py-1 text-white"
              />
            </label>
          </div>
        </div>
        <div className="mt-3">
          <FilterBar
            genres={genres}
            years={years}
            selectedGenre={selectedGenre}
            selectedYear={selectedYear}
            onGenreChange={(g) => { setSelectedGenre(g); setPage(1); }}
            onYearChange={(y) => { setSelectedYear(y); setPage(1); }}
            onClear={() => {
              setSelectedGenre("");
              setSelectedYear("");
              setPage(1);
            }}
            totalResults={filtered.length}
          />
        </div>
        {/* Quick genre pills for faster selection */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          {quickGenres.map((g) => {
            const isActive = selectedGenre === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setSelectedGenre((prev) => prev === g ? "" : g);
                  setPage(1);
                }}
                className={[
                  "whitespace-nowrap rounded-full px-3 py-1 text-xs transition",
                  isActive
                    ? "bg-secondary text-black font-semibold"
                    : "border border-white/20 bg-black/30 text-white/80 hover:bg-black/40"
                ].join(" ")}
                aria-pressed={isActive}
              >
                {g}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setSelectedGenre("");
              setSelectedYear("");
              setSearch("");
              setPage(1);
            }}
            className="ml-1 whitespace-nowrap rounded-full border border-white/20 px-3 py-1 text-xs text-white/80 hover:bg-white/5"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-white/70">
          <div className="flex flex-wrap items-center gap-2">
            {selectedGenre && <span className="rounded-full border border-white/15 px-3 py-1 text-xs">Genre: {selectedGenre}</span>}
            {selectedYear && <span className="rounded-full border border-white/15 px-3 py-1 text-xs">Year: {selectedYear}</span>}
            {search.trim() && <span className="rounded-full border border-white/15 px-3 py-1 text-xs">Query: “{search.trim()}”</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-white/20 px-3 py-1 text-white/80 disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              Prev
            </button>
            <span>
              Page {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              className="rounded-full border border-white/20 px-3 py-1 text-white/80 disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <MovieGrid movies={paginated} layoutClass="grid gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6" />
      <SpotlightRow
        title="Drama focus"
        description="Slow burns, futuristic romances, and everything in between"
        movies={movies.filter((m) => m.genres.includes("Drama")).slice(0, 5)}
      />
      <SpotlightRow
        title="Thriller laboratory"
        description="High-tension ideas sourced from the dataset variant you picked"
        movies={movies.filter((m) => m.genres.includes("Thriller")).slice(0, 5)}
      />
    </main>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading…</div>}>
      <ExploreContent />
    </Suspense>
  );
}
