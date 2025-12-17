import { useEffect, useMemo, useState } from "react";
import type { Hotel } from "@/types/hotel";

export type WishlistItem = {
  id: number;
  title: string;
  location: string;
  rating: number;
  price: number;
  image: string;
  datesFrom: string;
  datesTo: string;
};

const STORAGE_KEY = "autolodge_wishlist";

function readStoredWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item?.id === "number");
    }
    return [];
  } catch (error) {
    console.warn("Failed to parse wishlist from storage", error);
    return [];
  }
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setWishlist(readStoredWishlist());
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  }, [initialized, wishlist]);

  const isInWishlist = useMemo(
    () => new Set(wishlist.map((item) => item.id)),
    [wishlist]
  );

  const addToWishlist = (hotel: Hotel) => {
    setWishlist((prev) => {
      if (prev.some((item) => item.id === hotel.id)) return prev;
      const entry: WishlistItem = {
        id: hotel.id,
        title: hotel.title,
        location: hotel.location,
        rating: hotel.rating,
        price: hotel.price,
        image: hotel.image,
        datesFrom: hotel.datesFrom,
        datesTo: hotel.datesTo,
      };
      return [...prev, entry];
    });
  };

  const removeFromWishlist = (id: number) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleWishlist = (hotel: Hotel) => {
    setWishlist((prev) => {
      if (prev.some((item) => item.id === hotel.id)) {
        return prev.filter((item) => item.id !== hotel.id);
      }
      const entry: WishlistItem = {
        id: hotel.id,
        title: hotel.title,
        location: hotel.location,
        rating: hotel.rating,
        price: hotel.price,
        image: hotel.image,
        datesFrom: hotel.datesFrom,
        datesTo: hotel.datesTo,
      };
      return [...prev, entry];
    });
  };

  return {
    wishlist,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    ready: initialized,
  };
}
