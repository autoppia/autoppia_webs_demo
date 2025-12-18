"use client";

import { useMemo, useState } from "react";
import { SeedLink } from "@/components/ui/SeedLink";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getBookById } from "@/dynamic/v2-data";
import { buildBookDetailPayload } from "@/library/bookEventPayload";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { Trash2, ShoppingCart } from "lucide-react";
import type { Book } from "@/data/books";

export default function WishlistPage() {
  const { currentUser, removeFromReadingList } = useAuth();
  const { addToCart } = useCart();
  const [notice, setNotice] = useState<string | null>(null);

  const books = useMemo(() => {
    const ids = currentUser?.readingList ?? [];
    return ids
      .map((id) => getBookById(id))
      .filter((book): book is Book => Boolean(book));
  }, [currentUser?.readingList]);

  const handleRemove = (bookId: string) => {
    const book = getBookById(bookId);
    if (book) {
      logEvent(EVENT_TYPES.REMOVE_FROM_READING_LIST, buildBookDetailPayload(book));
    }
    removeFromReadingList(bookId);
    setNotice("Removed from wishlist.");
    setTimeout(() => setNotice(null), 2000);
  };

  const handleAddToCart = (bookId: string) => {
    const book = getBookById(bookId);
    if (!book) return;
    logEvent(EVENT_TYPES.ADD_TO_CART_BOOK, {
      ...buildBookDetailPayload(book),
      quantity: 1,
      price: book.price ?? null,
    });
    addToCart(book, 1);
    setNotice("Added to cart.");
    setTimeout(() => setNotice(null), 2000);
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative min-h-screen">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />

      <main className="relative mx-auto max-w-6xl space-y-8 px-4 py-10 text-white">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold">Wishlist</h1>
          <p className="text-white/70">
            Your saved books in one place. Add them to cart or remove anytime.
          </p>
          {notice && (
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
              {notice}
            </div>
          )}
        </header>

        {!currentUser ? (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-white/80">Sign in to view your wishlist.</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <SeedLink
                href="/login"
                className="inline-flex rounded-full bg-secondary px-6 py-3 text-sm font-bold text-black hover:bg-secondary/90"
              >
                Sign in
              </SeedLink>
              <SeedLink
                href="/signup"
                className="inline-flex rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Create account
              </SeedLink>
            </div>
          </section>
        ) : books.length === 0 ? (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-white/80">No saved books yet.</p>
            <SeedLink
              href="/search"
              className="mt-6 inline-flex rounded-full bg-secondary px-6 py-3 text-sm font-bold text-black hover:bg-secondary/90"
            >
              Explore books
            </SeedLink>
          </section>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <div
                key={book.id}
                className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-sm shadow-xl"
              >
                <div
                  className="aspect-[2/3] w-full max-w-[220px] mx-auto rounded-2xl bg-cover bg-center overflow-hidden shadow-2xl"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url(${book.poster}), url('/media/gallery/default_book.png')`,
                  }}
                />
                <div className="mt-4 space-y-2">
                  <p className="text-xs uppercase tracking-wide text-white/50">
                    {book.genres.slice(0, 2).join(" · ")} — {book.year}
                  </p>
                  <h3 className="text-xl font-bold leading-tight">
                    <SeedLink href={`/books/${book.id}`} className="hover:underline">
                      {book.title}
                    </SeedLink>
                  </h3>
                  <p className="text-sm text-white/80 line-clamp-3">{book.synopsis}</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    className="h-10 rounded-full bg-secondary text-black hover:bg-secondary/90 font-bold"
                    onClick={() => handleAddToCart(book.id)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" /> Add
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-10 rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10"
                    onClick={() => handleRemove(book.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


