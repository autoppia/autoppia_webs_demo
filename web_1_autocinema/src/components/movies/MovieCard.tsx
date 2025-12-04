import type { Movie } from "@/models";
import { SeedLink } from "@/components/ui/SeedLink";
import { useSeedValue, pickVariant, applyDynamicWrapper } from "@/components/ui/variants";

interface MovieCardProps {
  movie: Movie;
  onSelect?: (movie: Movie) => void;
}

export function MovieCard({ movie, onSelect }: MovieCardProps) {
  // Dynamic (seed-based) layout tweaks
  const seed = useSeedValue();
  const variant = pickVariant(seed, "movie-card", 3);
  const metaOrderSwap = variant === 2;

  return (
    <div
      className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-xl backdrop-blur"
      data-variant={variant}
    >
      <div
        className="aspect-[2/3] w-full max-w-[200px] mx-auto rounded-xl bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url(${movie.poster}), url('/media/gallery/default_movie.png')` }}
        aria-label={`${movie.title} poster`}
      />

      <div className="mt-4 flex flex-1 flex-col gap-2">
        {applyDynamicWrapper(
          seed,
          "movie-meta",
          metaOrderSwap ? (
            <p className="text-xs uppercase tracking-wide text-white/50">
              {movie.year} — {movie.genres.slice(0, 2).join(" · ")}
            </p>
          ) : (
            <p className="text-xs uppercase tracking-wide text-white/50">
              {movie.genres.slice(0, 2).join(" · ")} — {movie.year}
            </p>
          )
        )}
        <h3 className="text-xl font-semibold leading-tight">
          <SeedLink href={`/movies/${movie.id}`}>{movie.title}</SeedLink>
        </h3>
        <p className="flex-1 text-sm text-white/70">{movie.synopsis}</p>
        {applyDynamicWrapper(
          seed,
          "movie-tags",
          <div className="flex flex-wrap gap-2 text-xs text-white/70">
            <span className="rounded-full border border-white/15 px-3 py-1">{movie.duration}m</span>
            <span className="rounded-full border border-white/15 px-3 py-1">⭐ {movie.rating}</span>
            <span className="rounded-full border border-white/15 px-3 py-1">{movie.director}</span>
          </div>
        )}
        <SeedLink
          href={`/movies/${movie.id}`}
          onClick={() => onSelect?.(movie)}
          className="mt-2 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
        >
          View detail
        </SeedLink>
      </div>
      <SeedLink
        href={`/movies/${movie.id}`}
        aria-label={`Open ${movie.title} details`}
        className="absolute inset-0 rounded-2xl"
      />
    </div>
  );
}
