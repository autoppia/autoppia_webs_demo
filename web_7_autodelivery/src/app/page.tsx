"use client";
import RestaurantsListPage from "@/components/food/RestaurantsListPage";
import { useDynamicSystem } from "@/dynamic/shared";
import { useSeed } from "@/context/SeedContext";
import { useEffect } from "react";

export default function HomePage() {
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
    <main className="max-w-7xl mx-auto px-4 py-8">
      <section className="mb-10 rounded-2xl bg-gradient-to-r from-[#0f1e1b] via-[#0b442c] to-[#0a8a43] text-white px-8 py-10 shadow-lg">
        <div className="max-w-3xl space-y-3">
          <p className="uppercase tracking-[0.2em] text-sm text-white/80">AutoDelivery • Fresh to your door</p>
          <h1 className="text-4xl font-extrabold leading-tight">
            Order standout meals by cuisine, mood, or budget.
          </h1>
          <p className="text-white/90 text-lg">
            Curated picks updated daily. Choose your vibe and we handle the rest.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <span className="bg-white/15 text-white text-sm px-3 py-1.5 rounded-full border border-white/20">Trending tonight</span>
            <span className="bg-white/15 text-white text-sm px-3 py-1.5 rounded-full border border-white/20">15–40 min delivery</span>
            <span className="bg-white/15 text-white text-sm px-3 py-1.5 rounded-full border border-white/20">Chef-owned</span>
          </div>
        </div>
      </section>

      <RestaurantsListPage />
    </main>
  );
}
