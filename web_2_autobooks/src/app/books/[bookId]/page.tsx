"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { BookDetailHero } from "@/components/books/BookDetailHero";
import { BookMeta } from "@/components/books/BookMeta";
import { RelatedBooks } from "@/components/books/RelatedBooks";
import {
  CommentsPanel,
  type CommentEntry,
} from "@/components/books/CommentsPanel";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { getBookById, getRelatedBooks } from "@/dynamic/v2-data";
import { SeedLink } from "@/components/ui/SeedLink";
import type { Book } from "@/data/books";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  BookEditor,
  type BookEditorData,
} from "@/components/books/BookEditor";
import { buildBookDetailPayload } from "@/library/bookEventPayload";
import { useCart } from "@/context/CartContext";
import { useDynamicSystem } from "@/dynamic/shared";

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
  const { currentUser, addToReadingList, removeFromReadingList } = useAuth();
  const { addToCart } = useCart();

  const [comments, setComments] = useState(() =>
    book ? createMockComments(book) : []
  );
  const [message, setMessage] = useState<string | null>(null);
  const [readingListMessage, setReadingListMessage] = useState<string | null>(null);

  if (!book) {
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
            <h1 className="text-3xl font-semibold">Book not found</h1>
            <p className="mt-3 text-white/70">
              Try selecting a different seed or explore the full catalog.
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

  const handleEditSubmit = (data: BookEditorData) => {
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
    if (!currentUser) {
      setReadingListMessage("Please sign in to add books to your reading list");
      setTimeout(() => setReadingListMessage(null), 3000);
      return;
    }
    
    const payload = buildBookDetailPayload(book);
    const isInReadingList = currentUser.readingList?.includes(book.id);
    if (isInReadingList) {
      logEvent(EVENT_TYPES.REMOVE_FROM_READING_LIST, payload);
      removeFromReadingList(book.id);
      setReadingListMessage(`"${book.title}" removed from reading list`);
    } else {
      logEvent(EVENT_TYPES.ADD_TO_READING_LIST, payload);
      addToReadingList(book.id);
      setReadingListMessage(`"${book.title}" added to reading list`);
    }
    
    // Auto-hide message after 3 seconds
    setTimeout(() => setReadingListMessage(null), 3000);
  };
  
  const isInReadingList = currentUser?.readingList?.includes(book.id) ?? false;

  const handleAddToCart = () => {
    const payload = buildBookDetailPayload(book);
    logEvent(EVENT_TYPES.ADD_TO_CART_BOOK, {
      ...payload,
      quantity: 1,
      price: book.price ?? null,
    });
    addToCart(book, 1);
    setMessage(`"${book.title}" added to cart.`);
    setTimeout(() => setMessage(null), 2500);
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

  const dyn = useDynamicSystem();

  return (
    dyn.v1.addWrapDecoy("book-detail-page", (
      <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative min-h-screen">
        {/* Background grid pattern */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        {/* Background gradient overlays */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)] pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
        
        {dyn.v1.addWrapDecoy("book-detail-content", (
          <main className="relative mx-auto max-w-6xl space-y-8 px-4 py-10 text-white">
            {message && (
              <div className="rounded-xl border border-green-400/30 bg-green-400/10 p-4 backdrop-blur-sm">
                <p className="text-sm text-green-200">{message}</p>
              </div>
            )}
            {readingListMessage && (
              <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 rounded-xl border border-secondary/30 bg-secondary/20 backdrop-blur-md px-6 py-4 shadow-2xl shadow-secondary/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/30">
                    <svg className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-white">{readingListMessage}</p>
                </div>
              </div>
            )}
            <BookDetailHero
              book={book}
              onReadBook={handleWatchTrailer}
              onReadingList={handleWatchlist}
              onShare={handleShare}
              onAddToCart={handleAddToCart}
              isInReadingList={isInReadingList}
            />
            <BookMeta book={book} />
            {canManageBook && (
              <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-sm shadow-2xl text-white">
                <h2 className="text-2xl font-bold mb-2">Manage Book</h2>
                <p className="text-sm text-white/70 mb-6">
                  Edit or delete this book from the catalog.
                </p>
                <div className="mb-6 flex flex-wrap gap-3">
                  <Button
                    variant="ghost"
                    className="rounded-full border border-red-400/30 bg-red-400/10 text-red-300 hover:bg-red-400/20 transition-colors"
                    onClick={handleDelete}
                  >
                    Delete book
                  </Button>
                </div>
                <BookEditor
                  book={book}
                  onSubmit={handleEditSubmit}
                  submitLabel="Edit Book"
                />
              </section>
            )}
            <RelatedBooks books={relatedBooks} />
            <CommentsPanel comments={comments} onSubmit={handleCommentSubmit} />
          </main>
        ))}
      </div>
    ))
  );
}
