"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SeedLink } from "@/components/ui/SeedLink";
import { useCart } from "@/context/CartContext";
import { buildBookDetailPayload } from "@/library/bookEventPayload";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

export default function CartPage() {
  const { state, removeFromCart, setQuantity, clearCart } = useCart();
  const [notice, setNotice] = useState<string | null>(null);
  const initialTotalsRef = useRef({ totalItems: state.totalItems, totalAmount: state.totalAmount });

  useEffect(() => {
    logEvent(EVENT_TYPES.VIEW_CART_BOOK, {
      total_items: initialTotalsRef.current.totalItems,
      total_amount: initialTotalsRef.current.totalAmount,
    });
  }, []);

  const items = state.items;

  const formattedTotal = useMemo(
    () => `$${(state.totalAmount ?? 0).toFixed(2)}`,
    [state.totalAmount]
  );

  const handlePurchase = () => {
    // Fire PURCHASE_BOOK for each book (backend-validated), then clear cart.
    for (const item of items) {
      logEvent(EVENT_TYPES.PURCHASE_BOOK, {
        ...buildBookDetailPayload(item),
        quantity: item.quantity,
        price: item.price ?? null,
      });
    }
    clearCart();
    setNotice("Purchase completed. Thanks for reading!");
    setTimeout(() => setNotice(null), 3000);
  };

  const handleRemove = (bookId: string) => {
    const item = items.find((i) => i.id === bookId);
    if (item) {
      logEvent(EVENT_TYPES.REMOVE_FROM_CART_BOOK, {
        ...buildBookDetailPayload(item),
        quantity: item.quantity,
        price: item.price ?? null,
      });
    }
    removeFromCart(bookId);
  };

  const adjustQty = (bookId: string, next: number) => {
    const item = items.find((i) => i.id === bookId);
    if (!item) return;
    setQuantity(bookId, next);
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative min-h-screen">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />

      <main className="relative mx-auto max-w-6xl space-y-8 px-4 py-10 text-white">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-7 w-7 text-secondary" />
            <h1 className="text-4xl font-bold">Cart</h1>
          </div>
          <p className="text-white/70">Review your books and complete your purchase.</p>
          {notice && (
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
              {notice}
            </div>
          )}
        </header>

        {items.length === 0 ? (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-white/80">Your cart is empty.</p>
            <SeedLink
              href="/search"
              className="mt-6 inline-flex rounded-full bg-secondary px-6 py-3 text-sm font-bold text-black hover:bg-secondary/90"
            >
              Browse books
            </SeedLink>
          </section>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr,320px] lg:items-start">
            <section className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-sm shadow-xl"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div
                      className="aspect-[2/3] w-28 rounded-2xl bg-cover bg-center border border-white/10"
                      style={{
                        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url(${item.poster}), url('/media/gallery/default_book.png')`,
                      }}
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <h3 className="text-xl font-bold">
                        <SeedLink href={`/books/${item.id}`} className="hover:underline">
                          {item.title}
                        </SeedLink>
                      </h3>
                      <p className="text-sm text-white/70">
                        {item.director} • {item.year} • ⭐ {item.rating}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5">
                          <button
                            type="button"
                            className="px-3 py-2 text-white/80 hover:text-white"
                            onClick={() => adjustQty(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 text-sm font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            className="px-3 py-2 text-white/80 hover:text-white"
                            onClick={() => adjustQty(item.id, item.quantity + 1)}
                            disabled={item.quantity >= 10}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <Button
                          variant="ghost"
                          className="h-10 rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10"
                          onClick={() => handleRemove(item.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="text-right text-sm text-white/70">
                      <p className="text-xs uppercase tracking-wider">Price</p>
                      <p className="text-lg font-bold text-white">
                        ${Number(item.price ?? 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-xl space-y-4">
              <p className="text-xs uppercase tracking-widest text-white/60">Order summary</p>
              <div className="flex items-center justify-between text-white/80">
                <span>Items</span>
                <span className="font-semibold">{state.totalItems}</span>
              </div>
              <div className="flex items-center justify-between text-white/80">
                <span>Total</span>
                <span className="font-bold text-white">{formattedTotal}</span>
              </div>
              <Button
                className="h-12 w-full rounded-full bg-secondary text-black hover:bg-secondary/90 font-bold"
                onClick={handlePurchase}
              >
                Purchase
              </Button>
              <SeedLink
                href="/search"
                className="block text-center text-sm text-white/70 hover:text-white"
              >
                Continue shopping
              </SeedLink>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}


