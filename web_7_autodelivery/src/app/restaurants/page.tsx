"use client";

import RestaurantsListPage from '@/components/food/RestaurantsListPage';
import { useLayout } from '@/contexts/LayoutProvider';

export default function RestaurantsPage() {
  const layout = useLayout();

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
