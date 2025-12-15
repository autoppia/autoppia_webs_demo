"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useSeed } from "@/context/SeedContext";
import { generateDynamicOrder } from "@/dynamic/shared/order-utils";

interface FilterBarProps {
  genres: string[];
  years: number[];
  selectedGenre: string;
  selectedYear: string;
  onGenreChange: (genre: string) => void;
  onYearChange: (year: string) => void;
  onClear: () => void;
  totalResults: number;
}

export function FilterBar({
  genres,
  years,
  selectedGenre,
  selectedYear,
  onGenreChange,
  onYearChange,
  onClear,
  totalResults,
}: FilterBarProps) {
  const { seed } = useSeed();

  // Dynamic order for filter dropdowns (All genres and All years)
  const filterOrder = useMemo(() => {
    return generateDynamicOrder(seed, "filter-dropdowns", 2);
  }, [seed]);

  // Create filter elements array
  const filterElements = useMemo(() => [
    {
      key: "genre",
      element: (
        <select
          key="genre"
          value={selectedGenre}
          onChange={(event) => onGenreChange(event.target.value)}
          className="h-12 min-w-[160px] rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:bg-white/15 cursor-pointer"
        >
          <option value="" className="bg-neutral-900 text-white">All genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre} className="bg-neutral-900 text-white">
              {genre}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "year",
      element: (
        <select
          key="year"
          value={selectedYear}
          onChange={(event) => onYearChange(event.target.value)}
          className="h-12 min-w-[160px] rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:bg-white/15 cursor-pointer"
        >
          <option value="" className="bg-neutral-900 text-white">All years</option>
          {years.map((year) => (
            <option key={year} value={year} className="bg-neutral-900 text-white">
              {year}
            </option>
          ))}
        </select>
      ),
    },
  ], [selectedGenre, selectedYear, onGenreChange, onYearChange, genres, years]);

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 text-white backdrop-blur-sm shadow-lg" id="library">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">Our collection</p>
          <h2 className="text-3xl font-bold">
            <span className="text-secondary">{totalResults}</span> Curated movies
          </h2>
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-3 md:justify-end">
          {filterOrder.map((idx) => filterElements[idx].element)}
          <Button
            type="button"
            variant="ghost"
            onClick={onClear}
            className="h-12 rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/30"
          >
            Clear filters
          </Button>
        </div>
      </div>
    </section>
  );
}
