import type { Movie } from "@/models";
import { Button } from "@/components/ui/button";
import { Play, Bookmark } from "lucide-react";

interface MovieDetailHeroProps {
  movie: Movie;
  onWatchTrailer: () => void;
  onWatchlist: () => void;
  canUseWatchlist?: boolean;
  inWatchlist?: boolean;
}

export function MovieDetailHero({ movie, onWatchTrailer, onWatchlist, canUseWatchlist = false, inWatchlist = false }: MovieDetailHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 text-white shadow-2xl">
      {/* Backdrop */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: `url(${movie.poster}), url('/media/gallery/default_movie.png')`,
          filter: "blur(18px)",
          transform: "scale(1.08)",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
      <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />

      {/* Content */}
      <div className="grid gap-8 p-6 lg:grid-cols-[minmax(16rem,22rem)_1fr] lg:p-10">
        {/* Poster */}
        <div className="mx-auto w-full max-w-xs">
          <div
            className="aspect-[2/3] w-full rounded-3xl border border-white/10 bg-cover bg-center shadow-2xl"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(12,17,32,0.2), rgba(4,6,12,0.8)), url(${movie.poster}), url('/media/gallery/default_movie.png')`,
            }}
          />
        </div>

        {/* Text */}
        <div className="flex flex-col justify-center gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-white/70">
            <span className="rounded-sm bg-red-600/90 px-1.5 py-0.5 text-[10px] font-bold leading-none">N</span>
            <span>{movie.genres.slice(0, 3).join(" · ")}</span>
            <span>{movie.year}</span>
            <span>{movie.duration}m</span>
            <span className="rounded border border-white/20 px-2 py-0.5">⭐ {movie.rating}</span>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">{movie.title}</h1>
          <p className="max-w-3xl text-base text-white/85 md:text-lg">{movie.synopsis}</p>

          <div className="flex flex-wrap gap-4 text-sm text-white/70">
            <span className="rounded-full border border-white/15 px-3 py-1">Director: {movie.director}</span>
            <span className="rounded-full border border-white/15 px-3 py-1">
              Cast: {movie.cast.slice(0, 3).join(", ") || "Unlisted"}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-3">
            {movie.trailerUrl && (
              <Button className="h-10 rounded-full bg-secondary px-5 text-black hover:bg-secondary/80" onClick={onWatchTrailer}>
                <Play className="h-4 w-4" /> Play trailer
              </Button>
            )}
            <Button
              variant="ghost"
              className="h-10 rounded-full border border-white/20 px-5 text-white hover:bg-white/10"
              onClick={onWatchlist}
              title={canUseWatchlist ? (inWatchlist ? "Remove from watchlist" : "Add to watchlist") : "Watchlist disabled"}
            >
              <Bookmark className="h-4 w-4" /> {inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
