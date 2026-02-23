"use client";

import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

interface FavoriteButtonProps {
  subnetId: number;
  size?: "sm" | "md";
}

export function FavoriteButton({ subnetId, size = "md" }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render placeholder to avoid layout shift
    return (
      <div className={size === "sm" ? "w-4 h-4" : "w-5 h-5"} />
    );
  }

  const active = isFavorite(subnetId);
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleFavorite(subnetId);
      }}
      className={`transition-colors ${
        active
          ? "text-yellow-400"
          : "text-zinc-600 hover:text-zinc-400"
      }`}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
    >
      <Star
        className={iconSize}
        fill={active ? "currentColor" : "none"}
      />
    </button>
  );
}
