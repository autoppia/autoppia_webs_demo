import { Button } from "@/components/ui/button";

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
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white" id="library">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">Our collection</p>
          <h2 className="text-2xl font-semibold">{totalResults} Curated movies</h2>
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-3 md:justify-end">
          <select
            value={selectedGenre}
            onChange={(event) => onGenreChange(event.target.value)}
            className="h-[46px] min-w-[140px] rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="">All genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(event) => onYearChange(event.target.value)}
            className="h-[46px] min-w-[140px] rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="">All years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="ghost"
            onClick={onClear}
            className="h-[46px] rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            Clear filters
          </Button>
        </div>
      </div>
    </section>
  );
}
