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
      <section className="relative mb-7 mt-4 overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-900 via-emerald-700 to-emerald-500 px-6 py-7 text-white shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.26),transparent_52%)]" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">AutoDelivery</p>
        <h1
          className={`relative mt-2 text-3xl font-bold text-white md:text-4xl ${layout.generateSeedClass('restaurants-title')}`}
          {...layout.getElementAttributes('restaurants-title', 0)}
        >
          Restaurants
        </h1>
        <p className="relative mt-1 max-w-2xl text-emerald-50/95">
          Discover standout local favorites, filter by cuisine and rating, and order in just a few taps.
        </p>
        <div className="relative mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">Top rated</span>
          <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">Fast delivery</span>
          <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">Popular cuisines</span>
        </div>
      </section>
      <RestaurantsListPage />
    </main>
  );
}
