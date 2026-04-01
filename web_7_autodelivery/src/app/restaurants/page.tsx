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
      <section className="mb-6 mt-4 rounded-2xl border border-emerald-100 bg-white/85 px-5 py-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">AutoDelivery</p>
        <h1
          className={`mt-2 text-3xl font-bold text-zinc-900 ${layout.generateSeedClass('restaurants-title')}`}
          {...layout.getElementAttributes('restaurants-title', 0)}
        >
          Restaurants
        </h1>
        <p className="mt-1 text-zinc-600">Find highly rated spots and place an order in minutes.</p>
      </section>
      <RestaurantsListPage />
    </main>
  );
}
