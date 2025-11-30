"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMovies } from "@/dynamic/v2-data";
import type { Movie } from "@/models";
import { SeedLink } from "@/components/ui/SeedLink";
import { Button } from "@/components/ui/button";
import { BookmarkCheck } from "lucide-react";

const buildFallbackMovie = (movieId: string): Movie => ({
  id: movieId,
  title: movieId,
  synopsis: "Dataset entry not found for this seed.",
  year: new Date().getFullYear(),
  duration: 90,
  rating: 4,
  director: "Unknown Director",
  cast: [],
  trailerUrl: "",
  poster: "/media/gallery/default_movie.png",
  genres: ["Drama"],
  category: "Drama",
  imagePath: "gallery/default_movie.png",
});

export default function WatchlistPage() {
  const { isAuthenticated, watchlist, removeFromWatchlist } = useAuth();
  const movies = getMovies();

  const entries = useMemo(() => {
    return watchlist.map((movieId) => {
      const movie = movies.find((m) => m.id === movieId) ?? buildFallbackMovie(movieId);
      return { movieId, movie };
    });
  }, [watchlist, movies]);

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-3xl font-semibold">Your watchlist</h1>
          <p className="mt-3 text-white/70">Sign in to view and manage your saved films.</p>
          <SeedLink href="/login" className="mt-6 inline-flex rounded-full border border-white/10 px-6 py-3 text-sm uppercase tracking-wide text-secondary">
            Go to login
          </SeedLink>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10 text-white">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">Watchlist</p>
        <h1 className="text-3xl font-semibold">Saved films</h1>
        <p className="text-white/70">Click a card to open it. Use the toggle to remove.</p>
      </header>

      {entries.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
          Your watchlist is empty. Add movies from their detail pages.
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(({ movieId, movie }) => (
            <div key={movieId} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              <SeedLink href={`/movies/${movie.id}`} className="block">
                <div
                  className="aspect-[16/9] w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.03]"
                  style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.6)), url(${movie.poster}), url('/media/gallery/default_movie.png')` }}
                />
              </SeedLink>
              <div className="absolute left-2 top-2 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/80">
                Saved
              </div>
              <button
                type="button"
                onClick={() => removeFromWatchlist(movieId)}
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 backdrop-blur transition hover:bg-white/20"
                aria-label="Remove from watchlist"
                title="Remove"
              >
                <BookmarkCheck className="h-4 w-4" />
              </button>
              <div className="flex items-center justify-between p-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold">{movie.title}</h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-white/60">{movie.synopsis}</p>
                </div>
                <SeedLink
                  href={`/movies/${movie.id}`}
                  className="ml-3 inline-flex shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 transition hover:bg-white/10"
                >
                  Open
                </SeedLink>
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}


