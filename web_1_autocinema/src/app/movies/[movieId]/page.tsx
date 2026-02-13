"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { MovieDetailHero } from "@/components/movies/MovieDetailHero";
import { MovieMeta } from "@/components/movies/MovieMeta";
import { RelatedMovies } from "@/components/movies/RelatedMovies";
import {
  CommentsPanel,
  type CommentEntry,
} from "@/components/movies/CommentsPanel";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { getMovieById, getRelatedMovies } from "@/dynamic/v2";
import { SeedLink } from "@/components/ui/SeedLink";
import type { Movie } from "@/data/movies";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useDynamicSystem } from "@/dynamic/shared";
import {
  MovieEditor,
  type MovieEditorData,
} from "@/components/movies/MovieEditor";
import {
  collectFilmChangeMetadata,
  editorDataToFilmPayload,
  movieToFilmPayload,
} from "@/utils/eventPayloads";

const AVATARS = [
  "/media/gallery/people/person1.jpg",
  "/media/gallery/people/person2.jpg",
  "/media/gallery/people/person3.jpg",
  "/media/gallery/people/person4.jpg",
];

function createMockComments(movie: Movie): CommentEntry[] {
  const snippets = [
    `${movie.title} bends genres in the best way possible.`,
    `Loved the way ${movie.director} lets the cast improvise in act two.`,
    `If you enjoy ${
      movie.genres[0] || "experimental"
    } films, this is a wild ride.`,
  ];
  return snippets.map((snippet, index) => ({
    id: `${movie.id}-${index}`,
    author: index % 2 === 0 ? "Alicia" : "Jordan",
    message: snippet,
    mood: ["Inspired", "Curious", "Skeptical"][index % 3],
    avatar: AVATARS[index % AVATARS.length],
    createdAt: `Scene note #${index + 1}`,
  }));
}

export default function MovieDetailPage() {
  const params = useParams<{ movieId: string }>();
  const movieId = decodeURIComponent(params.movieId);
  const movie = getMovieById(movieId);
  const { currentUser, addToWatchlist, removeFromWatchlist } = useAuth();
  const dyn = useDynamicSystem();

  // Debug: Verify V2 status
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[movies/[movieId]/page] V2 status:", {
        v2Enabled: dyn.v2.isEnabled(),
      });
    }
  }, [dyn.v2]);

  const [comments, setComments] = useState(() =>
    movie ? createMockComments(movie) : []
  );
  const [message, setMessage] = useState<string | null>(null);
  const [watchlistMessage, setWatchlistMessage] = useState<string | null>(null);

  if (!movie) {
    return (
      <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative min-h-screen">
        {/* Background grid pattern */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        {/* Background gradient overlays */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)] pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />

        <main className="relative mx-auto max-w-4xl px-4 py-16 text-white">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 text-center backdrop-blur-sm shadow-2xl">
            <h1 className="text-3xl font-semibold">Movie not found</h1>
            <p className="mt-3 text-white/70">
              Try selecting a different seed or explore the full library.
            </p>
            <SeedLink
              href="/"
              className="mt-6 inline-flex rounded-full border border-white/10 px-6 py-3 text-sm uppercase tracking-wide text-secondary hover:bg-secondary/10 transition-colors"
            >
              Back to home
            </SeedLink>
          </div>
        </main>
      </div>
    );
  }

  const relatedMovies = useMemo(
    () => getRelatedMovies(movie.id, 4),
    [movie.id]
  );
  const canManageMovie = Boolean(currentUser?.allowedMovies.includes(movie.id));

  useEffect(() => {
    if (!movie) return;
    const payload = movieToFilmPayload(movie);
    logEvent(EVENT_TYPES.FILM_DETAIL, payload);
  }, [movie]);

  const handleWatchTrailer = () => {
    if (!movie) return;
    const payload = movieToFilmPayload(movie);
    logEvent(EVENT_TYPES.WATCH_TRAILER, payload);
    if (movie.trailerUrl) {
      window.open(movie.trailerUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleDelete = () => {
    const payload = movieToFilmPayload(movie);
    logEvent(EVENT_TYPES.DELETE_FILM, payload);
    setMessage("Film deleted successfully.");
  };

  const handleEditSubmit = (data: MovieEditorData) => {
    const original = movieToFilmPayload(movie);
    const updated = editorDataToFilmPayload(original.id, data);
    const { changed_fields, previous_values } = collectFilmChangeMetadata(
      original,
      updated
    );
    logEvent(EVENT_TYPES.EDIT_FILM, {
      ...updated,
      previous_values,
      changed_fields,
    });
    setMessage("Film edited successfully.");
  };

  const handleWatchlist = () => {
    if (!movie) return;

    if (!currentUser) {
      setWatchlistMessage("Please sign in to add movies to your watchlist");
      setTimeout(() => setWatchlistMessage(null), 3000);
      return;
    }

    const payload = movieToFilmPayload(movie);
    const isInWatchlist = currentUser.watchlist?.includes(movie.id);

    if (isInWatchlist) {
      logEvent(EVENT_TYPES.REMOVE_FROM_WATCHLIST, payload);
      removeFromWatchlist(movie.id);
      setWatchlistMessage(`"${movie.title}" removed from watchlist`);
    } else {
      logEvent(EVENT_TYPES.ADD_TO_WATCHLIST, payload);
      addToWatchlist(movie.id);
      setWatchlistMessage(`"${movie.title}" added to watchlist`);
    }

    // Auto-hide message after 3 seconds
    setTimeout(() => setWatchlistMessage(null), 3000);
  };

  const isInWatchlist = currentUser?.watchlist?.includes(movie.id) ?? false;

  const handleShare = () => {
    if (!movie) return;
    const payload = movieToFilmPayload(movie);
    logEvent(EVENT_TYPES.SHARE_MOVIE, payload);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  };

  const handleCommentSubmit = ({
    author,
    message,
  }: {
    author: string;
    message: string;
  }) => {
    const entry: CommentEntry = {
      id: `${movie.id}-comment-${Date.now()}`,
      author,
      message,
      mood: "Viewer note",
      avatar: AVATARS[(comments.length + 1) % AVATARS.length],
      createdAt: new Date().toLocaleString(),
    };
    setComments((prev) => [entry, ...prev]);
    const payload = movieToFilmPayload(movie);
    logEvent(EVENT_TYPES.ADD_COMMENT, {
      name: author,
      content: message,
      movie: {
        id: payload.id,
        name: movie.title,
      },
    });
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative min-h-screen">
      {/* Background grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      {/* Background gradient overlays */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />

      <main className="relative mx-auto max-w-6xl space-y-8 px-4 py-10 text-white">
        {message && (
          <div className="rounded-xl border border-green-400/30 bg-green-400/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-green-200">{message}</p>
          </div>
        )}
        {watchlistMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 rounded-xl border border-secondary/30 bg-secondary/20 backdrop-blur-md px-6 py-4 shadow-2xl shadow-secondary/20">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/30">
                <svg className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">{watchlistMessage}</p>
            </div>
          </div>
        )}
        <MovieDetailHero
          movie={movie}
          onWatchTrailer={handleWatchTrailer}
          onWatchlist={handleWatchlist}
          onShare={handleShare}
          isInWatchlist={isInWatchlist}
        />
        <MovieMeta movie={movie} />
        {canManageMovie && (
          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-sm shadow-2xl text-white">
            <h2 className="text-2xl font-bold mb-2">Manage Movie</h2>
            <p className="text-sm text-white/70 mb-6">
              Edit or delete this movie from the catalog.
            </p>
            <div className="mb-6 flex flex-wrap gap-3">
              <Button
                variant="ghost"
                className="rounded-full border border-red-400/30 bg-red-400/10 text-red-300 hover:bg-red-400/20 transition-colors"
                onClick={handleDelete}
              >
                Delete movie
              </Button>
            </div>
            <MovieEditor
              movie={movie}
              onSubmit={handleEditSubmit}
              submitLabel="Edit Film"
            />
          </section>
        )}
        <RelatedMovies movies={relatedMovies} />
        <CommentsPanel comments={comments} onSubmit={handleCommentSubmit} />
      </main>
    </div>
  );
}
