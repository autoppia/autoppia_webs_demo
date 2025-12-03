"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getBooks } from "@/dynamic/v2-data";
import { SeedLink } from "@/components/ui/SeedLink";
import { Button } from "@/components/ui/button";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { MovieEditor, type MovieEditorData } from "@/components/movies/MovieEditor";
import type { Book } from "@/data/books";

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const books = getBooks();
  const [message, setMessage] = useState<string | null>(null);

  const buildFallbackBook = (bookId: string): Book => ({
    id: bookId,
    title: bookId,
    synopsis: "Dataset entry not found for this seed.",
    year: new Date().getFullYear(),
    duration: 320,
    rating: 4,
    director: "Unknown Author",
    cast: [],
    trailerUrl: "",
    poster: "/media/gallery/default_book.png",
    genres: ["General"],
    category: "General",
    imagePath: "gallery/default_book.png",
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

  const entries = currentUser.allowedBooks.map((bookId) => ({
    bookId,
    book: books.find((book) => book.id === bookId),
  }));

  const handleEditSubmit = (bookId: string, data: MovieEditorData) => {
    logEvent(EVENT_TYPES.EDIT_BOOK, {
      book_id: bookId,
      username: currentUser.username,
      changes: data,
    });
    setMessage(`Book edited: ${bookId}`);
  };

  const handleDelete = (bookId: string) => {
    logEvent(EVENT_TYPES.DELETE_BOOK, { book_id: bookId, username: currentUser.username });
    setMessage(`Book deleted: ${bookId}`);
  };

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 text-white">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">Profile</p>
        <h1 className="text-3xl font-semibold">Welcome, {currentUser.username}</h1>
        <p className="text-white/70">These are the books assigned to you for validation.</p>
      </header>
      {message && <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{message}</p>}

      <section className="space-y-4">
        {entries.map(({ bookId, book }) => (
          <div key={bookId} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-wide text-white/50">Assigned book</p>
            <h2 className="text-2xl font-semibold">{book?.title ?? bookId}</h2>
            {book ? (
              <>
                <p className="text-sm text-white/60">{book.synopsis}</p>
                <div className="mt-4 grid gap-4 text-sm text-white/70 md:grid-cols-2">
                  <div>
                    <p><span className="text-white/50">Author:</span> {book.director}</p>
                    <p><span className="text-white/50">Year:</span> {book.year}</p>
                    <p><span className="text-white/50">Pages:</span> {book.duration}</p>
                  </div>
                  <div>
                    <p><span className="text-white/50">Genres:</span> {book.genres.join(", ")}</p>
                    <p><span className="text-white/50">Contributors:</span> {book.cast.join(", ")}</p>
                    <p><span className="text-white/50">Rating:</span> {book.rating}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-white/60">
                This book is not available in the current dataset, but you can still edit or delete it.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              {book && (
                <SeedLink
                  href={`/books/${book.id}`}
                  className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-secondary"
                >
                  View details
                </SeedLink>
              )}
              <Button
                variant="ghost"
                className="rounded-full border border-white/10 bg-white/10 text-red-300 hover:bg-red-400/20"
                onClick={() => handleDelete(bookId)}
              >
                Delete book
              </Button>
            </div>
            <MovieEditor
              movie={book ?? buildFallbackBook(bookId)}
              onSubmit={(data) => handleEditSubmit(bookId, data)}
              submitLabel="Edit Book"
            />
          </div>
        ))}
      </section>
    </main>
  );
}
