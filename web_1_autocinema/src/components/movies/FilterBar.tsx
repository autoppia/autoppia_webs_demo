import { Button } from "@/components/ui/button";
import { SlidersHorizontal, XCircle } from "lucide-react";

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
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-lg" id="library">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/30">
            <SlidersHorizontal className="h-4 w-4 text-white/80" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/60">Filters</p>
            <div className="mt-1 inline-flex items-center gap-2">
              <h2 className="text-xl font-semibold">Discover movies</h2>
              <span className="rounded-full border border-white/15 bg-black/30 px-2.5 py-0.5 text-xs text-white/70">
                {totalResults} results
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-wrap items-end gap-3 md:justify-end">
          <label className="flex flex-col text-xs uppercase tracking-wide text-white/60">
            Genre
            <select
              value={selectedGenre}
              onChange={(event) => onGenreChange(event.target.value)}
              className="mt-1 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm text-white outline-none ring-0 transition focus:border-white/30 focus:ring-2 focus:ring-secondary"
            >
              <option value="">All genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-xs uppercase tracking-wide text-white/60">
            Year
            <select
              value={selectedYear}
              onChange={(event) => onYearChange(event.target.value)}
              className="mt-1 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm text-white outline-none ring-0 transition focus:border-white/30 focus:ring-2 focus:ring-secondary"
            >
              <option value="">All years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            variant="ghost"
            onClick={onClear}
            className="inline-flex h-[42px] items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 text-white hover:bg-white/10"
            aria-label="Clear filters"
            title="Clear filters"
          >
            <XCircle className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>
    </section>
  );
}
