"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { MovieDetailHero } from "@/components/movies/MovieDetailHero";
import { MovieMeta } from "@/components/movies/MovieMeta";
import { RelatedMovies } from "@/components/movies/RelatedMovies";
import { CommentsPanel, type CommentEntry } from "@/components/movies/CommentsPanel";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { getMovieById, getRelatedMovies } from "@/utils/dynamicDataProvider";
import { SeedLink } from "@/components/ui/SeedLink";
import type { Movie } from "@/data/movies";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { MovieEditor, type MovieEditorData } from "@/components/movies/MovieEditor";
import { collectFilmChangeMetadata, editorDataToFilmPayload, movieToFilmPayload } from "@/utils/eventPayloads";

const AVATARS = [
  "/media/gallery/people/person1.jpg",
  "/media/gallery/people/person2.png",
  "/media/gallery/people/person3.jpg",
  "/media/gallery/people/person4.jpg",
];

function createMockComments(movie: Movie): CommentEntry[] {
  const snippets = [
    `${movie.title} bends genres in the best way possible.`,
    `Loved the way ${movie.director} lets the cast improvise in act two.`,
    `If you enjoy ${movie.genres[0] || "experimental"} films, this is a wild ride.`,
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
  const { currentUser } = useAuth();

  const [comments, setComments] = useState(() => (movie ? createMockComments(movie) : []));
  const [message, setMessage] = useState<string | null>(null);

  if (!movie) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-3xl font-semibold">Movie not found</h1>
          <p className="mt-3 text-white/70">Try selecting a different seed or explore the full library.</p>
          <SeedLink href="/" className="mt-6 inline-flex rounded-full border border-white/10 px-6 py-3 text-sm uppercase tracking-wide text-secondary">
            Back to home
          </SeedLink>
        </div>
      </main>
    );
  }

  const relatedMovies = useMemo(() => getRelatedMovies(movie.id, 4), [movie.id]);
  const canManageMovie = Boolean(currentUser?.allowedMovies.includes(movie.id));

  useEffect(() => {
    if (!movie) return;
    const payload = movieToFilmPayload(movie);
    logEvent(EVENT_TYPES.FILM_DETAIL, {
      ...payload,
    });
  }, [movie]);

  const handleWatchTrailer = () => {
    logEvent(EVENT_TYPES.WATCH_TRAILER, { movie_id: movie.id, title: movie.title });
    if (movie.trailerUrl) {
      window.open(movie.trailerUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleDelete = () => {
    const payload = movieToFilmPayload(movie);
    logEvent(EVENT_TYPES.DELETE_FILM, payload);
    setMessage("Delete event recorded. No data was removed.");
  };

  const handleEditSubmit = (data: MovieEditorData) => {
    const original = movieToFilmPayload(movie);
    const updated = editorDataToFilmPayload(original.id, data);
    const { changed_fields, previous_values } = collectFilmChangeMetadata(original, updated);
    logEvent(EVENT_TYPES.EDIT_FILM, {
      ...updated,
      previous_values,
      changed_fields,
    });
    setMessage("Edit event recorded for auditing purposes.");
  };

  const handleWatchlist = () => {
    logEvent(EVENT_TYPES.ADD_TO_WATCHLIST, { movie_id: movie.id });
  };

  const handleShare = () => {
    logEvent(EVENT_TYPES.SHARE_MOVIE, { movie_id: movie.id });
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  };

  const handleCommentSubmit = ({ author, message }: { author: string; message: string }) => {
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
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-10 text-white">
      {message && <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{message}</p>}
      <MovieDetailHero
        movie={movie}
        onWatchTrailer={handleWatchTrailer}
        onWatchlist={handleWatchlist}
        onShare={handleShare}
      />
      <MovieMeta movie={movie} />
      {canManageMovie && (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
          <h2 className="text-xl font-semibold">Validator actions</h2>
          <p className="text-sm text-white/60">
            Use these controls to simulate edits or deletions. They simply emit events, mirroring the Django workflow.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="ghost"
              className="rounded-full border border-white/10 bg-white/10 text-red-300 hover:bg-red-400/20"
              onClick={handleDelete}
            >
              Delete movie
            </Button>
          </div>
          <MovieEditor movie={movie} onSubmit={handleEditSubmit} submitLabel="Record edit event" />
        </section>
      )}
      <RelatedMovies movies={relatedMovies} />
      <CommentsPanel comments={comments} onSubmit={handleCommentSubmit} />
    </main>
  );
}
