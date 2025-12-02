"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { MovieDetailHero } from "@/components/movies/MovieDetailHero";
import { MovieMeta } from "@/components/movies/MovieMeta";
import { RelatedBooks } from "@/components/movies/RelatedBooks";
import {
  CommentsPanel,
  type CommentEntry,
} from "@/components/movies/CommentsPanel";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { getBookById, getRelatedBooks } from "@/dynamic/v2-data";
import { SeedLink } from "@/components/ui/SeedLink";
import type { Book } from "@/data/books";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  MovieEditor,
  type MovieEditorData,
} from "@/components/movies/MovieEditor";
import { buildBookDetailPayload } from "@/utils/bookEventPayload";

const AVATARS = [
  "/media/gallery/people/person1.jpg",
  "/media/gallery/people/person2.jpg",
  "/media/gallery/people/person3.jpg",
  "/media/gallery/people/person4.jpg",
];

function createMockComments(book: Book): CommentEntry[] {
  const snippets = [
    `${book.title} bends genres in the best way possible.`,
    `Loved how ${book.director} lets the narrative shift mid-chapter.`,
    `If you enjoy ${
      book.genres[0] || "experimental"
    } books, this is a wild ride.`,
  ];
  return snippets.map((snippet, index) => ({
    id: `${book.id}-${index}`,
    author: index % 2 === 0 ? "Alicia" : "Jordan",
    message: snippet,
    mood: ["Inspired", "Curious", "Skeptical"][index % 3],
    avatar: AVATARS[index % AVATARS.length],
    createdAt: `Shelf note #${index + 1}`,
  }));
}

export default function BookDetailPage() {
  const params = useParams<{ bookId: string }>();
  const bookId = decodeURIComponent(params.bookId);
  const book = getBookById(bookId);
  const { currentUser } = useAuth();

  const [comments, setComments] = useState(() =>
    book ? createMockComments(book) : []
  );
  const [message, setMessage] = useState<string | null>(null);

  if (!book) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-3xl font-semibold">Book not found</h1>
          <p className="mt-3 text-white/70">
            Try selecting a different seed or explore the full catalog.
          </p>
          <SeedLink
            href="/"
            className="mt-6 inline-flex rounded-full border border-white/10 px-6 py-3 text-sm uppercase tracking-wide text-secondary"
          >
            Back to home
          </SeedLink>
        </div>
      </main>
    );
  }

  const relatedBooks = useMemo(() => getRelatedBooks(book.id, 4), [book.id]);
  const canManageBook = Boolean(currentUser?.allowedBooks?.includes(book.id));

  // Log detail view with backend-expected schema
  useEffect(() => {
    const payload = buildBookDetailPayload(book);
    logEvent(EVENT_TYPES.BOOK_DETAIL, payload);
  }, [book]);

  const handleWatchTrailer = () => {
    const payload = buildBookDetailPayload(book);
    logEvent(EVENT_TYPES.OPEN_PREVIEW, payload);
    if (book.trailerUrl) {
      window.open(book.trailerUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleDelete = () => {
    logEvent(EVENT_TYPES.DELETE_BOOK, {
      name: book.title,
      author: book.director,
      year: book.year,
      genres: book.genres,
      rating: book.rating,
      pages: book.duration,
    });
    setMessage("Book deleted successfully.");
  };

  const handleEditSubmit = (data: MovieEditorData) => {
    const newValues = {
      name: data.title,
      author: data.director,
      year: Number.parseInt(data.year, 10),
      rating: Number.parseFloat(data.rating),
      pages: Number.parseInt(data.duration, 10),
      genres: data.genres
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
    };
    const previousValues = {
      name: book.title,
      author: book.director,
      year: book.year,
      rating: book.rating,
      pages: book.duration,
      genres: book.genres,
    };
    const changedFields = (
      Object.keys(newValues) as Array<keyof typeof newValues>
    ).filter((key) => {
      const a = newValues[key];
      const b = previousValues[key as keyof typeof previousValues];
      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return true;
        return a.join(",") !== b.join(",");
      }
      return a !== b;
    });

    logEvent(EVENT_TYPES.EDIT_BOOK, {
      ...newValues,
      previous_values: previousValues,
      changed_fields: changedFields,
    });
    setMessage("Book edited successfully.");
  };

  const handleWatchlist = () => {
    const payload = buildBookDetailPayload(book);
    logEvent(EVENT_TYPES.ADD_TO_READING_LIST, payload);
  };

  const handleShare = () => {
    const payload = buildBookDetailPayload(book);
    logEvent(EVENT_TYPES.SHARE_BOOK, payload);
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
      id: `${book.id}-comment-${Date.now()}`,
      author,
      message,
      mood: "Reader note",
      avatar: AVATARS[(comments.length + 1) % AVATARS.length],
      createdAt: new Date().toLocaleString(),
    };
    setComments((prev) => [entry, ...prev]);
    logEvent(EVENT_TYPES.ADD_COMMENT_BOOK, {
      name: author,
      content: message,
      book: { name: book.title },
    });
  };

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-10 text-white">
      {message && (
        <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
          {message}
        </p>
      )}
      <MovieDetailHero
        movie={book}
        onWatchTrailer={handleWatchTrailer}
        onWatchlist={handleWatchlist}
        onShare={handleShare}
      />
      <MovieMeta movie={book} />
      {canManageBook && (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
          <h2 className="text-xl font-semibold">Manage Book</h2>
          <p className="text-sm text-white/60">
            Edit or delete this book from the catalog.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="ghost"
              className="rounded-full border border-white/10 bg-white/10 text-red-300 hover:bg-red-400/20"
              onClick={handleDelete}
            >
              Delete book
            </Button>
          </div>
          <MovieEditor
            movie={book}
            onSubmit={handleEditSubmit}
            submitLabel="Edit Book"
          />
        </section>
      )}
      <RelatedBooks books={relatedBooks} />
      <CommentsPanel comments={comments} onSubmit={handleCommentSubmit} />
    </main>
  );
}
