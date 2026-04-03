"use client";

import React, { useEffect, useState } from "react";
import { useFavorites } from "@/context/FavoritesContext";
import { SubnetsTable } from "./SubnetsTable";
import type { SubnetWithTrend } from "@/shared/types";
import { Star } from "lucide-react";

interface FavoriteSubnetsSectionProps {
  subnets: SubnetWithTrend[];
}

export function FavoriteSubnetsSection({ subnets }: FavoriteSubnetsSectionProps) {
  const { favorites } = useFavorites();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || favorites.length === 0) return null;

  const favoriteSubnets = subnets.filter((s) => favorites.includes(s.id));

  if (favoriteSubnets.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
          <h2 className="text-2xl font-bold text-white">Favorite Subnets</h2>
        </div>
        <p className="text-zinc-400">
          Your saved subnets for quick access
        </p>
      </div>
      <SubnetsTable subnets={favoriteSubnets} maxRows={favoriteSubnets.length} />
    </section>
  );
}
