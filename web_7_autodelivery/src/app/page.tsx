"use client";
import RestaurantsListPage from "@/components/food/RestaurantsListPage";
import { MarketingHero } from "@/components/layout/MarketingHero";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <MarketingHero
        eyebrow="AutoDelivery • Fresh to your door"
        title="Order standout meals by cuisine, mood, or budget."
        description="Curated picks updated daily. Choose your vibe and we handle the rest."
        chips={["Trending tonight", "15–40 min delivery", "Chef-owned"]}
      />

      <RestaurantsListPage />
    </main>
  );
}
