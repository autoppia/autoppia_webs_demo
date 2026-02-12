"use client";

import RestaurantsListPage from '@/components/food/RestaurantsListPage';
import { useLayout } from '@/contexts/LayoutProvider';
import { useDynamicSystem } from '@/dynamic/shared';
import { useSeed } from '@/context/SeedContext';
import { useEffect } from 'react';

export default function RestaurantsPage() {
  const layout = useLayout();
  const dyn = useDynamicSystem();
  const { seed } = useSeed();

  // Log V2 status for debugging
  useEffect(() => {
    console.log("[autodelivery] V2 Status:", {
      seed,
      v2Enabled: dyn.v2.isEnabled(),
      dbMode: dyn.v2.isDbModeEnabled(),
      aiMode: dyn.v2.isEnabled(),
      fallback: dyn.v2.isFallbackMode(),
    });
  }, [seed, dyn]);

  return (
    <main 
      className={`max-w-7xl mx-auto px-4 ${layout.grid.containerClass}`}
      {...layout.getElementAttributes('restaurants-page', 0)}
    >
      <h1 
        className={`text-3xl font-bold mb-8 mt-4 ${layout.generateSeedClass('restaurants-title')}`}
        {...layout.getElementAttributes('restaurants-title', 0)}
      >
        Restaurants
      </h1>
      <RestaurantsListPage />
    </main>
  );
}
