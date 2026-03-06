"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";

import { type Product, useCart } from "@/context/CartContext";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
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
  const dyn = useDynamicSystem();
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

  const orderedItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    const order = dyn.v1.changeOrderElements("wishlist-items", items.length);
    return order.map((idx) => items[idx]);
  }, [dyn.v1.changeOrderElements, items]);

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
    <section
      id={dyn.v3.getVariant("wishlist-page", ID_VARIANTS_MAP, "wishlist")}
      className={dyn.v3.getVariant(
        "wishlist-page",
        CLASS_VARIANTS_MAP,
        "omnizon-container space-y-8 py-28"
      )}
    >
      {dyn.v1.addWrapDecoy(
        "wishlist-heading",
        (
          <SectionHeading
            eyebrow={dyn.v3.getVariant("wishlist", TEXT_VARIANTS_MAP, "Wishlist")}
            title={dyn.v3.getVariant(
              "wishlist_title",
              TEXT_VARIANTS_MAP,
              "Saved items and ideas"
            )}
            description={dyn.v3.getVariant(
              "wishlist_description",
              TEXT_VARIANTS_MAP,
              "Everything you flagged for later lives here. Drop items into the cart, jump to product detail, or clear the list."
            )}
            actions={
              items.length > 0 && (
                <Button
                  id={dyn.v3.getVariant(
                    "wishlist-clear-btn",
                    ID_VARIANTS_MAP,
                    "wishlist-clear"
                  )}
                  variant="secondary"
                  className={dyn.v3.getVariant(
                    "button-secondary",
                    CLASS_VARIANTS_MAP,
                    "rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                  )}
                  onClick={handleClearAll}
                >
                  {dyn.v3.getVariant("clear_all", TEXT_VARIANTS_MAP, "Clear all")}
                </Button>
              )
            }
          />
        )
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        {dyn.v1.addWrapDecoy(
          "wishlist-grid",
          (
            <div className="space-y-4">
              {items.length === 0 ? (
                dyn.v1.addWrapDecoy(
                  "wishlist-empty",
                  (
                    <BlurCard className="p-10 text-center text-slate-600">
                      <p className="text-lg font-semibold text-slate-900">
                        {dyn.v3.getVariant(
                          "wishlist_empty_title",
                          TEXT_VARIANTS_MAP,
                          "Nothing saved yet"
                        )}
                      </p>
                      <p className="mt-2 text-sm">
                        {dyn.v3.getVariant(
                          "wishlist_empty_message",
                          TEXT_VARIANTS_MAP,
                          "Browse the catalog and tap “Wishlist” on any product to keep it here for later."
                        )}
                      </p>
                      <Button
                        id={dyn.v3.getVariant(
                          "wishlist-browse-btn",
                          ID_VARIANTS_MAP,
                          "wishlist-browse"
                        )}
                        className={dyn.v3.getVariant(
                          "button-primary",
                          CLASS_VARIANTS_MAP,
                          "mt-4 rounded-full bg-slate-900 px-6 py-3 text-white"
                        )}
                        onClick={() => router.push("/search")}
                      >
                        {dyn.v3.getVariant(
                          "start_exploring",
                          TEXT_VARIANTS_MAP,
                          "Start exploring"
                        )}
                      </Button>
                    </BlurCard>
                  )
                )
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {orderedItems.map((item) =>
                    dyn.v1.addWrapDecoy(
                      `wishlist-item-${item.id}`,
                      (
                        <BlurCard
                          key={item.id}
                          interactive
                          id={dyn.v3.getVariant(
                            "wishlist-item",
                            ID_VARIANTS_MAP,
                            `wishlist-item-${item.id}`
                          )}
                          className={dyn.v3.getVariant(
                            "card",
                            CLASS_VARIANTS_MAP,
                            "flex flex-col p-4"
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => router.push(`/${item.id}`)}
                            className="relative h-40 w-full overflow-hidden rounded-2xl bg-slate-50"
                            id={dyn.v3.getVariant(
                              "wishlist-item-image",
                              ID_VARIANTS_MAP,
                              `wishlist-image-${item.id}`
                            )}
                            aria-label={dyn.v3.getVariant(
                              "view_details",
                              TEXT_VARIANTS_MAP,
                              "View details"
                            )}
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
                            <p className="font-semibold text-slate-900">
                              {item.price}
                            </p>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button
                              id={dyn.v3.getVariant(
                                "add-to-cart",
                                ID_VARIANTS_MAP,
                                `wishlist-add-${item.id}`
                              )}
                              className={dyn.v3.getVariant(
                                "button-primary",
                                CLASS_VARIANTS_MAP,
                                "flex-1 rounded-full bg-slate-900 text-white hover:bg-slate-800"
                              )}
                              onClick={() => handleAddToCart(item)}
                            >
                              {dyn.v3.getVariant(
                                "add_to_cart",
                                TEXT_VARIANTS_MAP,
                                "Add to cart"
                              )}
                            </Button>
                            <Button
                              id={dyn.v3.getVariant(
                                "remove_button",
                                ID_VARIANTS_MAP,
                                `wishlist-remove-${item.id}`
                              )}
                              variant="secondary"
                              className={dyn.v3.getVariant(
                                "button-secondary",
                                CLASS_VARIANTS_MAP,
                                "rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700"
                              )}
                              onClick={() => handleRemove(item)}
                            >
                              {dyn.v3.getVariant(
                                "remove",
                                TEXT_VARIANTS_MAP,
                                "Remove"
                              )}
                            </Button>
                          </div>
                        </BlurCard>
                      ),
                      item.id
                    )
                  )}
                </div>
              )}
            </div>
          )
        )}

        {dyn.v1.addWrapDecoy(
          "wishlist-summary",
          (
            <BlurCard
              id={dyn.v3.getVariant(
                "wishlist-summary",
                ID_VARIANTS_MAP,
                "wishlist-summary"
              )}
              className={dyn.v3.getVariant(
                "card",
                CLASS_VARIANTS_MAP,
                "space-y-4 p-6 lg:sticky lg:top-32"
              )}
            >
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                {dyn.v3.getVariant("snapshot", TEXT_VARIANTS_MAP, "Snapshot")}
              </p>
              <div className="text-4xl font-semibold text-slate-900">
                {items.length}
                <span className="ml-2 text-base font-medium text-slate-500">
                  {items.length === 1 ? "item" : "items"}
                </span>
              </div>
              <p className="text-sm text-slate-600">
                {dyn.v3.getVariant(
                  "estimated_value",
                  TEXT_VARIANTS_MAP,
                  "Estimated value"
                )}
                :{" "}
                <span className="font-semibold text-slate-900">
                  ${totalValue.toFixed(2)}
                </span>
              </p>
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">
                  {dyn.v3.getVariant(
                    "workflow_tips",
                    TEXT_VARIANTS_MAP,
                    "Workflow tips"
                  )}
                </p>
                <ul className="mt-2 space-y-1 list-disc pl-4">
                  {dyn.v1
                    .changeOrderElements("wishlist-tips", 3)
                    .map((idx) => {
                      const tips = [
                        "Share the page link to align with friends or teammates.",
                        "Move items into the cart to lock pricing and delivery.",
                        "Tap an item to open the detailed product page.",
                      ];
                      return <li key={`tip-${idx}`}>{tips[idx]}</li>;
                    })}
                </ul>
              </div>
              {items.length > 0 && (
                <Button
                  id={dyn.v3.getVariant(
                    "move-to-cart",
                    ID_VARIANTS_MAP,
                    "wishlist-move-to-cart"
                  )}
                  className={dyn.v3.getVariant(
                    "button-primary",
                    CLASS_VARIANTS_MAP,
                    "w-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-3 text-white"
                  )}
                  onClick={() => router.push("/cart")}
                >
                  {dyn.v3.getVariant(
                    "move_items_to_cart",
                    TEXT_VARIANTS_MAP,
                    "Move items to cart"
                  )}
                </Button>
              )}
            </BlurCard>
          )
        )}
      </div>
    </section>
  );
}
