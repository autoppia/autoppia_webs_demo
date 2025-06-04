"use client";
import HeroSection from '@/components/food/HeroSection';
import FeaturedRestaurantsGrid from '@/components/food/FeaturedRestaurantsGrid';
import TestimonialsSection from '@/components/food/TestimonialsSection';
import { useSearchStore } from '@/store/search-store';
import { restaurants } from '@/data/restaurants';
import RestaurantCard from '@/components/food/RestaurantCard';

export default function HomePage() {
  // Read global search state
  const search = useSearchStore(s => s.search);
  const filtered = restaurants.filter(r => {
    const text = search.trim().toLowerCase();
    return (
      (!text ||
        r.name.toLowerCase().includes(text) ||
        r.cuisine.toLowerCase().includes(text) ||
        r.menu.some(m => m.name.toLowerCase().includes(text))
      )
    );
  });
  return (
    <main className="max-w-7xl mx-auto px-4">
      {search
        ? (
          <div className="py-14">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Search Results</h2>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 max-w-6xl mx-auto">
              {filtered.length > 0 ? filtered.map(r => (
                <RestaurantCard
                  key={r.id}
                  id={r.id}
                  name={r.name}
                  image={r.image}
                  cuisine={r.cuisine}
                  rating={r.rating}
                  description={r.description}
                />
              )) : (
                <div className="text-zinc-400 text-center col-span-full pt-10 text-lg">No restaurants found.</div>
              )}
            </div>
          </div>
        )
        : (
          <>
            <HeroSection />
            <FeaturedRestaurantsGrid />
            <TestimonialsSection />
          </>
        )
      }
    </main>
  );
}
