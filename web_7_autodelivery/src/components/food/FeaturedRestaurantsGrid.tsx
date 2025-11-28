"use client";
import RestaurantCard from "./RestaurantCard";
import { useRestaurants } from "@/contexts/RestaurantContext";
import { Loader2 } from "lucide-react";

export default function FeaturedRestaurantsGrid() {
  const { restaurants, isLoading } = useRestaurants();

  if (isLoading && restaurants.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <section className="my-14">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        {/* Featured Restaurants */}
      </h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 max-w-6xl mx-auto">
        {restaurants.map((r) => (
          <RestaurantCard
            key={r.id}
            id={r.id}
            name={r.name}
            image={r.image}
            cuisine={r.cuisine}
            rating={r.rating}
            description={r.description}
          />
        ))}
      </div>
    </section>
  );
}
