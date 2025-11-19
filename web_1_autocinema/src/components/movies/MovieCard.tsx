import type { Movie } from "@/data/movies";
import { SeedLink } from "@/components/ui/SeedLink";

interface MovieCardProps {
  movie: Movie;
  onSelect?: (movie: Movie) => void;
}

export function MovieCard({ movie, onSelect }: MovieCardProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-xl backdrop-blur">
      <div
        className="aspect-[2/3] w-full rounded-2xl bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url(${movie.poster})` }}
        aria-label={`${movie.title} poster`}
      />

      <div className="mt-4 flex flex-1 flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-white/50">
          {movie.genres.slice(0, 2).join(" · ")} — {movie.year}
        </p>
        <h3 className="text-xl font-semibold leading-tight">
          <SeedLink href={`/movies/${movie.id}`}>{movie.title}</SeedLink>
        </h3>
        <p className="flex-1 text-sm text-white/70">{movie.synopsis}</p>
        <div className="flex flex-wrap gap-2 text-xs text-white/70">
          <span className="rounded-full border border-white/15 px-3 py-1">{movie.duration}m</span>
          <span className="rounded-full border border-white/15 px-3 py-1">⭐ {movie.rating}</span>
          <span className="rounded-full border border-white/15 px-3 py-1">{movie.director}</span>
        </div>
        <SeedLink
          href={`/movies/${movie.id}`}
          onClick={() => onSelect?.(movie)}
          className="mt-2 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
        >
          View detail
        </SeedLink>
      </div>
    </div>
  );
}
