"use client";

import { useEffect } from "react";
import { Suspense } from "react";
import { PropertyCard } from "@/components/PropertyCard";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useWishlist } from "@/hooks/useWishlist";
import { SeedLink } from "@/components/ui/SeedLink";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";

function WishlistContent() {
  const { wishlist, removeFromWishlist, ready } = useWishlist();
  const dyn = useDynamicSystem();

  useEffect(() => {
    if (!ready) return;
    logEvent(EVENT_TYPES.WISHLIST_OPENED, {
      count: wishlist.length,
    });
  }, [ready, wishlist.length]);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">My wishlist</h1>
        <SeedLink
          href="/"
          id={dyn.v3.getVariant("back_to_search", ID_VARIANTS_MAP, "back-to-search")}
          className={cn(
            "text-sm text-[#616882] underline font-medium",
            dyn.v3.getVariant("back_to_search_class", CLASS_VARIANTS_MAP, "")
          )}
        >
          {dyn.v3.getVariant("back_to_search_text", TEXT_VARIANTS_MAP, "Back to search")}
        </SeedLink>
      </div>

      {wishlist.length === 0 ? (
        <div className="border rounded-2xl p-6 bg-white shadow-sm">
          <p className="text-neutral-600">
            You haven&apos;t added any stays yet. Tap the heart to save places you love.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {wishlist.map((hotel) => (
            <div key={hotel.id} className="relative">
              <PropertyCard
                {...hotel}
                href={`/stay/${hotel.id}?source=wishlist`}
                wishlisted
                onToggleWishlist={() => {
                  removeFromWishlist(hotel.id);
                  logEvent(EVENT_TYPES.REMOVE_FROM_WISHLIST, {
                    id: hotel.id,
                    title: hotel.title,
                  });
                }}
              />
              <div className="mt-2 flex justify-between items-center">
                <SeedLink
                  href={`/stay/${hotel.id}?source=wishlist`}
                  id={dyn.v3.getVariant("book_this_stay", ID_VARIANTS_MAP, `book-this-stay-${hotel.id}`)}
                  className={cn(
                    "text-sm text-[#616882] font-semibold underline",
                    dyn.v3.getVariant("book_this_stay_class", CLASS_VARIANTS_MAP, "")
                  )}
                  onClick={() =>
                    logEvent(EVENT_TYPES.BOOK_FROM_WISHLIST, {
                      hotelId: hotel.id,
                      title: hotel.title,
                    })
                  }
                >
                  {dyn.v3.getVariant("book_this_stay_text", TEXT_VARIANTS_MAP, "Book this stay")}
                </SeedLink>
                <button
                  id={dyn.v3.getVariant("remove_from_wishlist", ID_VARIANTS_MAP, `remove-from-wishlist-${hotel.id}`)}
                  className={cn(
                    "text-xs text-neutral-500 underline",
                    dyn.v3.getVariant("remove_from_wishlist_class", CLASS_VARIANTS_MAP, "")
                  )}
                  onClick={() => {
                    removeFromWishlist(hotel.id);
                    logEvent(EVENT_TYPES.REMOVE_FROM_WISHLIST, {
                      id: hotel.id,
                      title: hotel.title,
                    });
                  }}
                >
                  {dyn.v3.getVariant("remove_from_wishlist_text", TEXT_VARIANTS_MAP, "Remove")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WishlistPage() {
  return (
    <Suspense fallback={<div>Loading wishlist...</div>}>
      <WishlistContent />
    </Suspense>
  );
}
