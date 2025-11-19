"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMovies } from "@/utils/dynamicDataProvider";
import { SeedLink } from "@/components/ui/SeedLink";
import { Button } from "@/components/ui/button";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { MovieEditor, type MovieEditorData } from "@/components/movies/MovieEditor";
import type { Movie } from "@/data/movies";

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const movies = getMovies();
  const [message, setMessage] = useState<string | null>(null);

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

  if (!currentUser) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-3xl font-semibold">Please sign in</h1>
          <p className="mt-3 text-white/70">Sign in with the credential provided in your task instructions.</p>
          <SeedLink
            href="/login"
            className="mt-6 inline-flex rounded-full border border-white/10 px-6 py-3 text-sm uppercase tracking-wide text-secondary"
          >
            Go to login
          </SeedLink>
        </div>
      </main>
    );
  }

  const entries = currentUser.allowedMovies.map((movieId) => ({
    movieId,
    movie: movies.find((movie) => movie.id === movieId),
  }));

  const handleEditSubmit = (movieId: string, data: MovieEditorData) => {
    logEvent(EVENT_TYPES.EDIT_MOVIE, {
      movie_id: movieId,
      username: currentUser.username,
      changes: data,
    });
    setMessage(`Changes for ${movieId} were recorded (event only).`);
  };

  const handleDelete = (movieId: string) => {
    logEvent(EVENT_TYPES.DELETE_MOVIE, { movie_id: movieId, username: currentUser.username });
    setMessage(`Delete event for ${movieId} was recorded.`);
  };

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 text-white">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">Profile</p>
        <h1 className="text-3xl font-semibold">Welcome, {currentUser.username}</h1>
        <p className="text-white/70">These are the films assigned to you for validation.</p>
      </header>
      {message && <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{message}</p>}

      <section className="space-y-4">
        {entries.map(({ movieId, movie }) => (
          <div key={movieId} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-wide text-white/50">Assigned movie</p>
            <h2 className="text-2xl font-semibold">{movie?.title ?? movieId}</h2>
            {movie ? (
              <>
                <p className="text-sm text-white/60">{movie.synopsis}</p>
                <div className="mt-4 grid gap-4 text-sm text-white/70 md:grid-cols-2">
                  <div>
                    <p><span className="text-white/50">Director:</span> {movie.director}</p>
                    <p><span className="text-white/50">Year:</span> {movie.year}</p>
                    <p><span className="text-white/50">Duration:</span> {movie.duration} min</p>
                  </div>
                  <div>
                    <p><span className="text-white/50">Genres:</span> {movie.genres.join(", ")}</p>
                    <p><span className="text-white/50">Cast:</span> {movie.cast.join(", ")}</p>
                    <p><span className="text-white/50">Rating:</span> {movie.rating}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-white/60">
                This movie is not available in the current dataset, but you can still trigger edit/delete events for auditing.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              {movie && (
                <SeedLink
                  href={`/movies/${movie.id}`}
                  className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-secondary"
                >
                  View details
                </SeedLink>
              )}
              <Button
                variant="ghost"
                className="rounded-full border border-white/10 bg-white/10 text-red-300 hover:bg-red-400/20"
                onClick={() => handleDelete(movieId)}
              >
                Delete movie
              </Button>
            </div>
            <MovieEditor
              movie={movie ?? buildFallbackMovie(movieId)}
              onSubmit={(data) => handleEditSubmit(movieId, data)}
              submitLabel="Record edit event"
            />
          </div>
        ))}
      </section>
    </main>
  );
}
