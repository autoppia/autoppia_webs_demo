"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { MovieDetailHero } from "@/components/movies/MovieDetailHero";
import { MovieMeta } from "@/components/movies/MovieMeta";
import { RelatedMovies } from "@/components/movies/RelatedMovies";
import { CommentsPanel, type CommentEntry } from "@/components/movies/CommentsPanel";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { getMovieById, getRelatedMovies } from "@/utils/dynamicDataProvider";
import { SeedLink } from "@/components/ui/SeedLink";
import type { Movie } from "@/data/movies";

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

  const [comments, setComments] = useState(() => (movie ? createMockComments(movie) : []));

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

  const handleWatchTrailer = () => {
    logEvent(EVENT_TYPES.WATCH_TRAILER, { movie_id: movie.id, title: movie.title });
    if (movie.trailerUrl) {
      window.open(movie.trailerUrl, "_blank", "noopener,noreferrer");
    }
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
    logEvent(EVENT_TYPES.POST_COMMENT, { movie_id: movie.id, author });
  };

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-10 text-white">
      <MovieDetailHero
        movie={movie}
        onWatchTrailer={handleWatchTrailer}
        onWatchlist={handleWatchlist}
        onShare={handleShare}
      />
      <MovieMeta movie={movie} />
      <RelatedMovies movies={relatedMovies} />
      <CommentsPanel comments={comments} onSubmit={handleCommentSubmit} />
    </main>
  );
}
