"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SeedLink } from "@/components/ui/SeedLink";
import { useCart } from "@/context/CartContext";
import { buildBookDetailPayload } from "@/library/bookEventPayload";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

export default function CartPage() {
  const { state, removeFromCart, setQuantity, clearCart } = useCart();
  const [notice, setNotice] = useState<string | null>(null);
  const initialTotalsRef = useRef({ totalItems: state.totalItems, totalAmount: state.totalAmount });
  const dyn = useDynamicSystem();

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
    dyn.v1.addWrapDecoy("cart-page", (
      <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative min-h-screen" id={dyn.v3.getVariant("cart-page", ID_VARIANTS_MAP, "cart-page")}>
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)] pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />

        {dyn.v1.addWrapDecoy("cart-content", (
          <main className="relative mx-auto max-w-6xl space-y-8 px-4 py-10 text-white" id={dyn.v3.getVariant("cart-content", ID_VARIANTS_MAP, "cart-content")}>
            {dyn.v1.addWrapDecoy("cart-header", (
              <header className="space-y-2" id={dyn.v3.getVariant("cart-header", ID_VARIANTS_MAP, "cart-header")}>
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-7 w-7 text-secondary" />
                  <h1 className="text-4xl font-bold" id={dyn.v3.getVariant("cart-title", ID_VARIANTS_MAP, "cart-title")}>
                    {dyn.v3.getVariant("cart_title", TEXT_VARIANTS_MAP, "Cart")}
                  </h1>
                </div>
                <p className="text-white/70">
                  {dyn.v3.getVariant("cart_description", TEXT_VARIANTS_MAP, "Review your books and complete your purchase.")}
                </p>
          {notice && (
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
              {notice}
            </div>
              )}
            </header>
            ), "cart-header-wrap")}

            {items.length === 0 ? (
              dyn.v1.addWrapDecoy("empty-cart", (
                <section className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center" id={dyn.v3.getVariant("empty-cart", ID_VARIANTS_MAP, "empty-cart")}>
                  <p className="text-white/80">
                    {dyn.v3.getVariant("empty_cart_message", TEXT_VARIANTS_MAP, "Your cart is empty.")}
                  </p>
                  <SeedLink
                    href="/search"
                    className={dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "mt-6 inline-flex rounded-full bg-secondary px-6 py-3 text-sm font-bold text-black hover:bg-secondary/90")}
                    id={dyn.v3.getVariant("browse-books-link", ID_VARIANTS_MAP, "browse-books-link")}
                  >
                    {dyn.v3.getVariant("browse_books", TEXT_VARIANTS_MAP, "Browse books")}
                  </SeedLink>
                </section>
              ), "empty-cart-wrap")
            ) : (
              <div className="grid gap-8 lg:grid-cols-[1fr,320px] lg:items-start">
                <section className="space-y-4">
                  {items.map((item) => (
                    dyn.v1.addWrapDecoy(`cart-item-${item.id}`, (
                      <div
                        key={item.id}
                        className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-sm shadow-xl"
                        id={dyn.v3.getVariant("cart-item", ID_VARIANTS_MAP, `cart-item-${item.id}`)}
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
                        {dyn.v1.addWrapDecoy(`remove-from-cart-button-${item.id}`, (
                          <Button
                            variant="ghost"
                            id={dyn.v3.getVariant("remove-from-cart-button", ID_VARIANTS_MAP, `remove-from-cart-button-${item.id}`)}
                            className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "h-10 rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10")}
                            onClick={() => handleRemove(item.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {dyn.v3.getVariant("remove", TEXT_VARIANTS_MAP, "Remove")}
                          </Button>
                        ), `remove-from-cart-button-wrap-${item.id}`)}
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
              ), `cart-item-wrap-${item.id}`)
              ))}
            </section>

            {dyn.v1.addWrapDecoy("cart-summary", (
              <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-xl space-y-4" id={dyn.v3.getVariant("cart-summary", ID_VARIANTS_MAP, "cart-summary")}>
                <p className="text-xs uppercase tracking-widest text-white/60">
                  {dyn.v3.getVariant("order_summary", TEXT_VARIANTS_MAP, "Order summary")}
                </p>
                <div className="flex items-center justify-between text-white/80">
                  <span>{dyn.v3.getVariant("items", TEXT_VARIANTS_MAP, "Items")}</span>
                  <span className="font-semibold">{state.totalItems}</span>
                </div>
                <div className="flex items-center justify-between text-white/80">
                  <span>{dyn.v3.getVariant("total", TEXT_VARIANTS_MAP, "Total")}</span>
                  <span className="font-bold text-white">{formattedTotal}</span>
                </div>
                {dyn.v1.addWrapDecoy("purchase-button", (
                  <Button
                    id={dyn.v3.getVariant("purchase-button", ID_VARIANTS_MAP, "purchase-button")}
                    className={dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "h-12 w-full rounded-full bg-secondary text-black hover:bg-secondary/90 font-bold")}
                    onClick={handlePurchase}
                  >
                    {dyn.v3.getVariant("purchase", TEXT_VARIANTS_MAP, "Purchase")}
                  </Button>
                ), "purchase-button-wrap")}
                <SeedLink
                  href="/search"
                  className="block text-center text-sm text-white/70 hover:text-white"
                  id={dyn.v3.getVariant("continue-shopping-link", ID_VARIANTS_MAP, "continue-shopping-link")}
                >
                  {dyn.v3.getVariant("continue_shopping", TEXT_VARIANTS_MAP, "Continue shopping")}
                </SeedLink>
              </aside>
            ), "cart-summary-wrap")}
          </div>
        )}
        </main>
        ), "cart-content-wrap")}
      </div>
    ), "cart-page-wrap")
  );
}


