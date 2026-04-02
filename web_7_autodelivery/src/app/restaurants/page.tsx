"use client";

import RestaurantsListPage from "@/components/food/RestaurantsListPage";
import { MarketingHero } from "@/components/layout/MarketingHero";
import { useLayout } from "@/contexts/LayoutProvider";

export default function RestaurantsPage() {
  const layout = useLayout();

  return (
    <main
      className={`mx-auto max-w-7xl px-4 py-8 ${layout.grid.containerClass}`}
      {...layout.getElementAttributes("restaurants-page", 0)}
    >
      <MarketingHero
        eyebrow="AutoDelivery • Browse & order"
        title="Restaurants"
        description="Discover standout local favorites, filter by cuisine and rating, and order in just a few taps."
        chips={["Top rated", "Fast delivery", "Popular cuisines"]}
        className={layout.generateSeedClass("restaurants-title")}
        sectionProps={layout.getElementAttributes("restaurants-title", 0)}
      />
      <RestaurantsListPage />
    </main>
  );
}
