"use client";

import type React from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { readJson, writeJson } from "@/shared/storage";
import { logEvent, EVENT_TYPES } from "@/library/events";

interface FavoritesContextType {
  favorites: number[];
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
});

const STORAGE_KEY = "autostats_favorite_subnets";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>([]);

  // Restore from localStorage on mount
  useEffect(() => {
    const stored = readJson<number[]>(STORAGE_KEY);
    if (stored && Array.isArray(stored)) {
      setFavorites(stored);
    }
  }, []);

  const isFavorite = useCallback(
    (id: number) => favorites.includes(id),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (id: number) => {
      setFavorites((prev) => {
        const isFav = prev.includes(id);
        const next = isFav ? prev.filter((fid) => fid !== id) : [...prev, id];
        writeJson<number[]>(STORAGE_KEY, next);

        if (isFav) {
          logEvent(EVENT_TYPES.UNFAVORITE_SUBNET, { subnet_id: id });
        } else {
          logEvent(EVENT_TYPES.FAVORITE_SUBNET, { subnet_id: id });
        }

        return next;
      });
    },
    [],
  );

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
