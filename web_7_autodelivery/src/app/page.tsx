"use client";
import { useMemo } from "react";
import HeroSection from "@/components/food/HeroSection";
import TestimonialsSection from "@/components/food/TestimonialsSection";
import PaginatedRestaurantsGrid from "@/components/food/PaginatedRestaurantsGrid";
import QuickReorderSection from "@/components/food/QuickReorderSection";
import { useSearchStore } from "@/store/search-store";
import { useRestaurants } from "@/contexts/RestaurantContext";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const search = useSearchStore((s) => s.search);
  const { restaurants, isLoading } = useRestaurants();

  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) return restaurants;
    return restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(text) ||
        r.cuisine.toLowerCase().includes(text) ||
        r.menu.some((m) => m.name.toLowerCase().includes(text))
    );
  }, [restaurants, search]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4">
      {search ? (
        <div className="py-14">
          {filtered.length > 0 ? (
            <PaginatedRestaurantsGrid filteredRestaurants={filtered} title="Search Results" />
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Search Results</h2>
              <div className="text-zinc-400 text-lg">No restaurants found.</div>
            </div>
          )}
        </div>
      ) : (
        <>
          <HeroSection />
          <QuickReorderSection />
          <PaginatedRestaurantsGrid title="All Restaurants" />
          <TestimonialsSection />
        </>
      )}
    </main>
  );
}
