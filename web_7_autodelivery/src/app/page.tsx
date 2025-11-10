"use client";
import HeroSection from '@/components/food/HeroSection';
import TestimonialsSection from '@/components/food/TestimonialsSection';
import PaginatedRestaurantsGrid from '@/components/food/PaginatedRestaurantsGrid';
import QuickReorderSection from '@/components/food/QuickReorderSection';
import { useSearchStore } from '@/store/search-store';
import { getRestaurants } from '@/utils/dynamicDataProvider';

export default function HomePage() {
  // Read global search state
  const search = useSearchStore(s => s.search);
  const restaurants = getRestaurants() || [];
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
            {filtered.length > 0 ? (
              <PaginatedRestaurantsGrid 
                filteredRestaurants={filtered} 
                title="Search Results" 
              />
            ) : (
              <div className="text-center py-20">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Search Results</h2>
                <div className="text-zinc-400 text-lg">No restaurants found.</div>
              </div>
            )}
          </div>
        )
        : (
          <>
            <HeroSection />
            <QuickReorderSection />
            <PaginatedRestaurantsGrid title="All Restaurants" />
            <TestimonialsSection />
          </>
        )
      }
    </main>
  );
}
