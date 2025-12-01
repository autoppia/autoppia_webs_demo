"use client";
import { useEffect, useState } from "react";
import { HeroSlider } from "@/components/home/HeroSlider";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { BlurCard } from "@/components/ui/BlurCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { KpiStat } from "@/components/ui/KpiStat";
import { Suspense } from "react";
import { getProductsByCategory, getLayoutConfig, getEffectiveSeed } from "@/dynamic/v2-data";
import { getLayoutClasses } from "@/dynamic/v1-layouts";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { ArrowRight, Calendar, Package, ShieldCheck, Sparkles } from "lucide-react";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { SafeImage } from "@/components/ui/SafeImage";
import {
  getWishlistItems,
  onWishlistChange,
  type WishlistItem,
} from "@/library/wishlist";
import { useSeed } from "@/context/SeedContext";

function HomeContent() {
  const { resolvedSeeds } = useSeed();
  const router = useSeedRouter();
  const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base ?? 1;
  const v1Seed = resolvedSeeds.v1 ?? resolvedSeeds.base ?? v2Seed;
  const seed = getEffectiveSeed(v2Seed);
  const layoutConfig = getLayoutConfig(v1Seed);
  const layoutClasses = getLayoutClasses(layoutConfig);

  // Dynamic product groupings
  const kitchenProducts = getProductsByCategory("Kitchen");
  const techProducts = getProductsByCategory("Technology");
  const HomeProducts = getProductsByCategory("Home");
  const ElectronicProducts = getProductsByCategory("Electronics");
  const FitnessProducts = getProductsByCategory("Fitness");

  const isLoadingProducts =
    kitchenProducts.length +
      techProducts.length +
      HomeProducts.length +
      ElectronicProducts.length +
      FitnessProducts.length ===
    0;

  const heroKpis = [
    {
      label: "On-time delivery",
      value: `${94 + (seed % 4)}%`,
      delta: "+3.1%",
      caption: "Orders landed as promised",
      trend: "up" as const,
    },
    {
      label: "Avg arrival",
      value: `${2 + (seed % 3)} days`,
      delta: "-0.4d",
      caption: "Coast-to-coast shipping",
      trend: "down" as const,
    },
    {
      label: "Customer rating",
      value: `${(4.6 + (seed % 3) * 0.1).toFixed(1)} ★`,
      delta: "+210",
      caption: "New verified reviews",
      trend: "up" as const,
    },
  ];

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[] | null>(null);
  const navigateWithTracking = (
    href: string,
    payload: { label: string; source: string } & Record<string, unknown>
  ) => {
    router.push(href);
  };

  const handleWishlistProduct = (item: WishlistItem) => {
    logEvent(EVENT_TYPES.VIEW_DETAIL, {
      productId: item.id,
      title: item.title,
      price: item.price,
      destination: `/${item.id}`,
      source: "wishlist_preview",
    });
    router.push(`/${item.id}`);
  };

  const carouselConfigs = [
    { title: "Top Sellers In Kitchen", products: kitchenProducts },
    { title: "Top Sellers In Technology", products: techProducts },
    { title: "Top Sellers In Home", products: HomeProducts },
    { title: "Top Sellers In Electronics", products: ElectronicProducts },
    { title: "Top Sellers In Fitness", products: FitnessProducts },
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const webAgentId = params.get("X-WebAgent-Id"); // AI param
    const userId = params.get("user");

    if (webAgentId) localStorage.setItem("web_agent_id", webAgentId);
    else localStorage.setItem("web_agent_id", "null");

    if (userId) localStorage.setItem("user", userId);
    else localStorage.setItem("user", "null");

    const loadWishlist = () => setWishlistItems(getWishlistItems());
    loadWishlist();
    const unsubscribe = onWishlistChange(loadWishlist);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ left: 0 });
  }, []);

  return (
    <main
      className={`min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 ${layoutClasses.spacing} overflow-x-hidden`}
    >
      <div className={`relative z-10 px-4 pb-16 ${layoutClasses.content}`}>
        <section className="omnizon-container grid gap-10 pb-24 pt-28 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6">
            <span className="pill pill-muted">EVERYDAY MARKETPLACE</span>
            <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">
              Everything for home, tech, and daily life-delivered fast
            </h1>
            <p className="text-base text-slate-600 md:text-lg">
              Stock up on essentials, upgrade your setup, or grab a quick gift.
              Autozone keeps inventory fresh, routes shipping intelligently, and
              makes checkout effortless.
            </p>
            <div className="kpi-grid pt-2">
              {heroKpis.map((kpi) => (
                <KpiStat key={kpi.label} {...kpi} />
              ))}
            </div>
          </div>
          <div className="relative">
            <HeroSlider />
            <BlurCard className="absolute -bottom-10 left-1/2 w-[85%] -translate-x-1/2 px-5 py-4 text-sm text-slate-600 shadow-elevated">
              <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400">
                Local availability
              </p>
              <p className="text-base font-semibold text-slate-900">
                {82 + (seed % 7)} products ready to ship near you
              </p>
              <p className="text-xs text-slate-500">
                Same-day eligible in Daly City · San Jose · Oakland
              </p>
            </BlurCard>
          </div>
        </section>

        {isLoadingProducts && (
          <div className="omnizon-container -mt-12 text-center text-sm text-slate-500">
            Loading products...
          </div>
        )}

        {wishlistItems && wishlistItems.length > 0 && (
          <section id="wishlist" className="omnizon-container mt-16 space-y-6">
            <SectionHeading
              eyebrow="Saved wishlist"
              title="Saved for later"
              description="Pick up where you left off, compare, or move items straight into the cart."
              actions={
                <button
                  type="button"
                  onClick={() => {
                    logEvent(EVENT_TYPES.VIEW_WISHLIST, {
                      source: "home_preview",
                      intent: "view_all",
                    });
                    router.push("/wishlist");
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
                >
                  View all saved
                  <ArrowRight className="h-4 w-4" />
                </button>
              }
            />
            <div className="wishlist-rail">
              {wishlistItems.slice(0, 6).map((item) => (
                <BlurCard
                  key={item.id}
                  interactive
                  className="min-w-[260px] p-4"
                >
                  <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-slate-50">
                    <SafeImage
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="260px"
                      className="object-contain"
                      fallbackSrc="/images/homepage_categories/coffee_machine.jpg"
                    />
                    {item.price && (
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow">
                        {item.price}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-1">
                    <h3 className="text-base font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {item.brand || item.category}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-900">
                      {item.price}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleWishlistProduct(item)}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-white"
                    >
                      View product
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </BlurCard>
              ))}
            </div>
          </section>
        )}

        <section
          id="product-highlights"
          className="omnizon-container mt-16 space-y-8"
        >
          <SectionHeading
            eyebrow="Product highlights"
            title="Trusted picks by category"
            description="High-performing gear, gifts, and everyday essentials curated for Autozone shoppers."
            actions={
              <button
                type="button"
                onClick={() =>
                  navigateWithTracking("/search", {
                    label: "browse_catalog",
                    source: "highlights_header",
                  })
                }
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
              >
                Browse catalog
              </button>
            }
          />
          <div className="space-y-8">
            {carouselConfigs.map((config, index) => (
              <ProductCarousel
                key={config.title}
                title={config.title}
                products={config.products}
                seed={seed + index}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
