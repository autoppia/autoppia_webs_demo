"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { PropertyCard } from "@/components/PropertyCard";
import { dynamicDataProvider } from "@/dynamic/v2-data";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useWishlist } from "@/hooks/useWishlist";
import type { Hotel } from "@/types/hotel";

function PopularContent() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const { isInWishlist, addToWishlist, removeFromWishlist, ready } = useWishlist();

  useEffect(() => {
    const load = async () => {
      await dynamicDataProvider.whenReady();
      const allHotels = dynamicDataProvider.getHotels();
      const topRated = allHotels.filter((hotel) => hotel.rating >= 4.5);
      setHotels(topRated);
      logEvent(EVENT_TYPES.POPULAR_HOTELS_VIEWED, {
        count: topRated.length,
      });
    };
    load();
  }, []);

  const handleToggleWishlist = (hotelId: number) => {
    const hotel = hotels.find((item) => item.id === hotelId);
    if (!hotel) return;
    const already = isInWishlist.has(hotelId);
    if (already) {
      removeFromWishlist(hotelId);
      logEvent(EVENT_TYPES.REMOVE_FROM_WISHLIST, {
        id: hotel.id,
        title: hotel.title,
        price: hotel.price,
      });
    } else {
      addToWishlist(hotel);
      logEvent(EVENT_TYPES.ADD_TO_WISHLIST, {
        id: hotel.id,
        title: hotel.title,
        price: hotel.price,
      });
    }
  };

  const popularHotels = useMemo(() => {
    return [...hotels].sort((a, b) => b.rating - a.rating);
  }, [hotels]);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Popular hotels</h1>
        <p className="text-sm text-neutral-500">
          Showing stays rated 4.5 and above
        </p>
      </div>

      {popularHotels.length === 0 ? (
        <div className="border rounded-2xl p-6 bg-white shadow-sm">
          <p className="text-neutral-600">
            No highly-rated stays available right now. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {popularHotels.map((hotel) => (
            <PropertyCard
              key={hotel.id}
              {...hotel}
              wishlisted={ready && isInWishlist.has(hotel.id)}
              onToggleWishlist={handleToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PopularPage() {
  return (
    <Suspense fallback={<div>Loading popular hotels...</div>}>
      <PopularContent />
    </Suspense>
  );
}
