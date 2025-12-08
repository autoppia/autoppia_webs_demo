"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";

import { type Product, useCart } from "@/context/CartContext";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import {
  getWishlistItems,
  onWishlistChange,
  toggleWishlistItem,
  clearWishlist,
  type WishlistItem,
} from "@/library/wishlist";
import { logEvent, EVENT_TYPES } from "@/events";
import { BlurCard } from "@/components/ui/BlurCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/button";

export function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const { addToCart } = useCart();
  const router = useSeedRouter();
  const hasLoggedView = useRef(false);

  useEffect(() => {
    const loadWishlist = () => setItems(getWishlistItems());
    loadWishlist();
    return onWishlistChange(loadWishlist);
  }, []);

  useEffect(() => {
    if (hasLoggedView.current) return;
    hasLoggedView.current = true;
    logEvent(EVENT_TYPES.VIEW_WISHLIST, {
      source: "wishlist_page",
      totalItems: items.length,
    });
  }, [items.length]);

  const totalValue = useMemo(
    () =>
      items.reduce((sum, item) => {
        const price = Number.parseFloat(item.price.replace(/[^0-9.]/g, ""));
        return sum + price;
      }, 0),
    [items]
  );

  const buildProductEventData = (item: WishlistItem) => ({
    productId: item.id,
    title: item.title,
    price: item.price,
    category: item.category,
    brand: item.brand,
    rating: item.rating,
  });

  const handleRemove = (item: WishlistItem) => {
    toggleWishlistItem(item);
    logEvent(EVENT_TYPES.ADD_TO_WISHLIST, {
      ...buildProductEventData(item),
      action: "removed",
      source: "wishlist_page",
    });
  };

  const handleAddToCart = (item: WishlistItem) => {
    addToCart(item as Product);
    logEvent(EVENT_TYPES.ADD_TO_CART, {
      productId: item.id,
      title: item.title,
      price: item.price,
      category: item.category,
      brand: item.brand,
      source: "wishlist_page",
    });
  };

  const handleClearAll = () => {
    clearWishlist();
    setItems([]);
    logEvent(EVENT_TYPES.ADD_TO_WISHLIST, {
      action: "clear_all",
      source: "wishlist_page",
    });
  };

  return (
    <section className="omnizon-container space-y-8 py-28">
      <SectionHeading
        eyebrow="Wishlist"
        title="Saved items and ideas"
        description="Everything you flagged for later lives here. Drop items into the cart, jump to product detail, or clear the list."
        actions={
          items.length > 0 && (
            <Button
              variant="secondary"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={handleClearAll}
            >
              Clear all
            </Button>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        <div className="space-y-4">
          {items.length === 0 ? (
            <BlurCard className="p-10 text-center text-slate-600">
              <p className="text-lg font-semibold text-slate-900">
                Nothing saved yet
              </p>
              <p className="mt-2 text-sm">
                Browse the catalog and tap “Wishlist” on any product to keep it
                here for later.
              </p>
              <Button
                className="mt-4 rounded-full bg-slate-900 px-6 py-3 text-white"
                onClick={() => router.push("/search")}
              >
                Start exploring
              </Button>
            </BlurCard>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <BlurCard key={item.id} interactive className="flex flex-col p-4">
                  <button
                    type="button"
                    onClick={() => router.push(`/${item.id}`)}
                    className="relative h-40 w-full overflow-hidden rounded-2xl bg-slate-50"
                  >
                    <SafeImage
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width:768px) 50vw, 260px"
                      className="object-contain p-3"
                      fallbackSrc="/images/homepage_categories/coffee_machine.jpg"
                    />
                  </button>
                  <div className="mt-3 flex-1 space-y-1 text-sm">
                    <p className="text-base font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="text-slate-500">
                      {item.brand || item.category}
                    </p>
                    <p className="font-semibold text-slate-900">{item.price}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      className="flex-1 rounded-full bg-slate-900 text-white hover:bg-slate-800"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to cart
                    </Button>
                    <Button
                      variant="secondary"
                      className="rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700"
                      onClick={() => handleRemove(item)}
                    >
                      Remove
                    </Button>
                  </div>
                </BlurCard>
              ))}
            </div>
          )}
        </div>

        <BlurCard className="space-y-4 p-6 lg:sticky lg:top-32">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            Snapshot
          </p>
          <div className="text-4xl font-semibold text-slate-900">
            {items.length}
            <span className="ml-2 text-base font-medium text-slate-500">
              {items.length === 1 ? "item" : "items"}
            </span>
          </div>
          <p className="text-sm text-slate-600">
            Estimated value:{" "}
            <span className="font-semibold text-slate-900">
              ${totalValue.toFixed(2)}
            </span>
          </p>
          <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Workflow tips</p>
            <ul className="mt-2 space-y-1 list-disc pl-4">
              <li>Share the page link to align with friends or teammates.</li>
              <li>Move items into the cart to lock pricing and delivery.</li>
              <li>Tap an item to open the detailed product page.</li>
            </ul>
          </div>
          {items.length > 0 && (
            <Button
              className="w-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-3 text-white"
              onClick={() => router.push("/cart")}
            >
              Move items to cart
            </Button>
          )}
        </BlurCard>
      </div>
    </section>
  );
}
