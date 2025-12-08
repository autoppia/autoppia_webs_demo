"use client";

import { useEffect } from "react";
import { Suspense } from "react";
import { PropertyCard } from "@/components/PropertyCard";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useWishlist } from "@/hooks/useWishlist";
import { SeedLink } from "@/components/ui/SeedLink";

function WishlistContent() {
  const { wishlist, removeFromWishlist, ready } = useWishlist();

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
          className="text-sm text-[#616882] underline font-medium"
        >
          Back to search
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
                onToggleWishlist={() => removeFromWishlist(hotel.id)}
              />
              <div className="mt-2 flex justify-between items-center">
                <SeedLink
                  href={`/stay/${hotel.id}?source=wishlist`}
                  className="text-sm text-[#616882] font-semibold underline"
                  onClick={() =>
                    logEvent(EVENT_TYPES.BOOK_FROM_WISHLIST, {
                      hotelId: hotel.id,
                      title: hotel.title,
                    })
                  }
                >
                  Book this stay
                </SeedLink>
                <button
                  className="text-xs text-neutral-500 underline"
                  onClick={() => removeFromWishlist(hotel.id)}
                >
                  Remove
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
