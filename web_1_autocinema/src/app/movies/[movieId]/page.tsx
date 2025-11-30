"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { MovieDetailHero } from "@/components/movies/MovieDetailHero";
import { MovieMeta } from "@/components/movies/MovieMeta";
import { RelatedMovies } from "@/components/movies/RelatedMovies";
import { CommentsPanel, type CommentEntry } from "@/components/movies/CommentsPanel";
import { logEvent, EVENT_TYPES } from "@/events";
import { getMovieById, getRelatedMovies } from "@/dynamic/v2-data";
import { SeedLink } from "@/components/ui/SeedLink";
import type { Movie, MovieEditorData } from "@/models";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { MovieEditor } from "@/components/movies/MovieEditor";
import { collectFilmChangeMetadata, editorDataToFilmPayload, movieToFilmPayload } from "@/events/payloads";
import { applyDynamicWrapper, useSeedValue } from "@/components/ui/variants";
import { DynamicText } from "@/components/ui/DynamicText";
import { DynamicHeading, DynamicSection } from "@/components/ui/DynamicBlock";
import { RatingStars } from "@/components/ui/RatingStars";
import { readJson, writeJson } from "@/utils/storage";

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
  const { currentUser, isAuthenticated, isInWatchlist, addToWatchlist, removeFromWatchlist } = useAuth();
  const seed = useSeedValue();

  const [comments, setComments] = useState(() => (movie ? createMockComments(movie) : []));
  const [message, setMessage] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number>(0);

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
    logEvent(EVENT_TYPES.FILM_DETAIL, payload);
  }, [movie]);

  // Load current user's rating for this movie
  useEffect(() => {
    if (!movie) return;
    const username = currentUser?.username;
    if (!username) {
      setUserRating(0);
      return;
    }
    const key = `autocinemaRatings:${username.toLowerCase()}`;
    const map = readJson<Record<string, number>>(key, {}) ?? {};
    setUserRating(map[movie.id] ?? 0);
  }, [movie, currentUser]);

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
    setMessage("Delete action noted. No data was changed.");
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
    setMessage("Changes saved for this page.");
  };

  const inWatchlist = isAuthenticated && movie ? isInWatchlist(movie.id) : false;

  const handleWatchlist = () => {
    if (!movie) return;
    if (!isAuthenticated) {
      window.alert("Please sign in to use your watchlist.");
      return;
    }
    const payload = movieToFilmPayload(movie);
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
      setMessage("Removed from watchlist.");
      logEvent(EVENT_TYPES.REMOVE_FROM_WATCHLIST, payload);
    } else {
      addToWatchlist(movie.id);
      setMessage("Added to watchlist.");
      logEvent(EVENT_TYPES.ADD_TO_WATCHLIST, payload);
      // New event for backend parser compatibility
      logEvent(EVENT_TYPES.ADD_PRODUCT_TO_WATCHLIST, payload);
    }
  };

  const handleRate = (value: number) => {
    if (!movie) return;
    if (!isAuthenticated) {
      window.alert("Please sign in to rate movies.");
      return;
    }
    const username = currentUser?.username;
    if (!username) return;
    const key = `autocinemaRatings:${username.toLowerCase()}`;
    const map = readJson<Record<string, number>>(key, {}) ?? {};
    const next = { ...map, [movie.id]: value };
    writeJson(key, next);
    setUserRating(value);
    const payload = movieToFilmPayload(movie);
    logEvent(EVENT_TYPES.RATE_FILM, { ...payload, rating: value });
    setMessage(`Thanks for rating: ${value}★`);
  };

  // Share removed per request

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
        canUseWatchlist={isAuthenticated}
        inWatchlist={inWatchlist}
      />
      <section className="rounded-3xl border border-white/10 bg-white/5 p-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/60">Your rating</p>
            <div className="mt-1">
              <RatingStars value={userRating} onChange={handleRate} disabled={!isAuthenticated} />
            </div>
          </div>
          <p className="text-sm text-white/60">Average: ⭐ {movie.rating} • {movie.duration}m • {movie.year}</p>
        </div>
      </section>
      <MovieMeta movie={movie} />
      {canManageMovie && applyDynamicWrapper(seed, "validator-actions",
        <DynamicSection className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
          <DynamicHeading className="text-xl font-semibold">Validator actions</DynamicHeading>
          <DynamicText as="p" className="text-sm text-white/60" variantKey="validator-copy">
            Use these controls to simulate edits or deletions. These actions are for auditing only.
          </DynamicText>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="ghost"
              className="rounded-full border border-white/10 bg-white/10 text-red-300 hover:bg-red-400/20"
              onClick={handleDelete}
            >
              Delete movie
            </Button>
          </div>
          <MovieEditor movie={movie} onSubmit={handleEditSubmit} submitLabel="Save changes" />
        </DynamicSection>
      )}
      <RelatedMovies movies={relatedMovies} />
      <CommentsPanel comments={comments} onSubmit={handleCommentSubmit} />
    </main>
  );
}
