"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
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

  const serviceTools = [
    {
      title: "Track an order",
      description: "Live status for delivery and install.",
      icon: Package,
      actionLabel: "Open tracker",
      href: "/cart",
      badge: "Live ETA",
      metric: "12 routes in motion",
    },
    {
      title: "Schedule delivery",
      description: "Lock a time that works for your team.",
      icon: Calendar,
      actionLabel: "Choose slot",
      href: "/checkout",
      badge: "Slots",
      metric: "Next window 2:15 PM",
    },
    {
      title: "Crew sync board",
      description: "Auto-assign installers based on skills.",
      icon: Sparkles,
      actionLabel: "Open board",
      href: "/search?q=crew",
      badge: "Crew Ops",
      metric: "8 crews ready",
    },
    {
      title: "Risk & compliance",
      description: "Instant incident reports & sign-offs.",
      icon: ShieldCheck,
      actionLabel: "Review logs",
      href: "/search?q=audits",
      badge: "Audit",
      metric: "Last review 4h ago",
    },
  ];

  const heroKpis = [
    {
      label: "Install readiness",
      value: `${78 + (seed % 12)}%`,
      delta: "+8.4%",
      caption: "Crews confirmed this week",
      trend: "up" as const,
    },
    {
      label: "Avg SLA",
      value: `${48 - (seed % 10)}h`,
      delta: "-4h",
      caption: "From click to install",
      trend: "down" as const,
    },
    {
      label: "Carbon saved",
      value: `${14 + (seed % 6)}t`,
      delta: "+2.1t",
      caption: "Optimized routing offsets",
      trend: "up" as const,
    },
  ];

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[] | null>(null);
  const navigateWithTracking = (
    href: string,
    payload: { label: string; source: string } & Record<string, any>
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

  const handleHeroCta = (href: string, label: string) => {
    navigateWithTracking(href, {
      section: "hero",
      label,
      source: "hero_cta",
    });
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
  }, [seed]);

  return (
    <main
      className={`min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 ${layoutClasses.spacing} overflow-x-hidden`}
    >
      <div className={`relative z-10 px-4 pb-16 ${layoutClasses.content}`}>
        <section className="omnizon-container grid gap-10 pb-24 pt-28 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6">
            <span className="pill pill-muted">AUTOMATED COMMERCE</span>
            <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">
              Operational commerce for every install-ready team
            </h1>
            <p className="text-base text-slate-600 md:text-lg">
              Deploy kits, lock delivery windows, and clear compliance in one view.
              Autozone orchestrates the messy middle so your crews stay focused on
              installs—not admin work.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  handleHeroCta("/search?q=deployments", "launch_deployments")
                }
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-elevated"
              >
                Launch deployments
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleHeroCta("/search?q=operations", "talk_to_ops")}
                className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400"
              >
                Talk to ops
              </button>
            </div>
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
                Install intelligence
              </p>
              <p className="text-base font-semibold text-slate-900">
                {82 + (seed % 7)} kits scanning in the Bay Area
              </p>
              <p className="text-xs text-slate-500">
                Auto-balancing trucks across Daly City · San Jose · Oakland
              </p>
            </BlurCard>
          </div>
        </section>

        {isLoadingProducts && (
          <div className="omnizon-container -mt-12 text-center text-sm text-slate-500">
            Loading products...
          </div>
        )}

        <section id="operations" className="omnizon-container mt-12 space-y-8">
          <SectionHeading
            eyebrow="Operations control"
            title="Keep every order moving forward"
            description="Schedule, track, and clear compliance from one command center. Every tile is live with telemetry from crews and partners."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {serviceTools.map((tool) => (
              <BlurCard
                key={tool.title}
                interactive
                className="group flex h-full flex-col gap-4 p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl bg-slate-900/10 p-3 text-slate-900">
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white">
                    {tool.badge}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-slate-500">{tool.description}</p>
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  {tool.metric}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    navigateWithTracking(tool.href, {
                      label: tool.title,
                      source: "service_tools",
                      action: tool.actionLabel,
                    })
                  }
                  className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-slate-900"
                >
                  {tool.actionLabel}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </BlurCard>
            ))}
          </div>
        </section>

        {wishlistItems && wishlistItems.length > 0 && (
          <section id="wishlist" className="omnizon-container mt-16 space-y-6">
            <SectionHeading
              eyebrow="Saved wishlist"
              title="Items you saved for later"
              description="Revisit any item to pick up where you left off or drop it into your next install run."
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
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="260px"
                      className="object-contain"
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
            description="High-performing bundles and replacement parts curated by the Autozone ops brain."
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
