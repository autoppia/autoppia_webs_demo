"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { HeroSlider } from "@/components/home/HeroSlider";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { Suspense } from "react";
import {
  getProductsByCategory,
  getLayoutConfig,
  getEffectiveSeed,
} from "@/dynamic/v2-data";
import { getLayoutClasses } from "@/dynamic/v1-layouts";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import {
  ArrowRight,
  Calendar,
  Package,
} from "lucide-react";
import { logEvent, EVENT_TYPES } from "@/library/events";
import {
  getWishlistItems,
  onWishlistChange,
  type WishlistItem,
} from "@/library/wishlist";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useSeedRouter();
  const rawSeed = Number(searchParams.get("seed") ?? "1");
  const seed = getEffectiveSeed(rawSeed);
  const layoutConfig = getLayoutConfig(seed);
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
    },
    {
      title: "Schedule delivery",
      description: "Lock a time that works for your team.",
      icon: Calendar,
      actionLabel: "Choose slot",
      href: "/checkout",
    },
  ];

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[] | null>(null);

  const handleNavigate = (
    href: string,
    eventType: (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES],
    data: Record<string, any>
  ) => {
    logEvent(eventType, data);
    router.push(href);
  };


  const handleWishlistProduct = (item: WishlistItem) => {
    handleNavigate(`/${item.id}`, EVENT_TYPES.WISHLIST_VIEW, {
      productId: item.id,
      title: item.title,
      price: item.price,
      destination: `/${item.id}`,
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

  return (
    <main
      className={`min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 ${layoutClasses.spacing}`}
    >
      <HeroSlider />
      <div
        className={`px-4 pb-12 -mt-20 relative z-10 ${layoutClasses.content}`}
      >
        {isLoadingProducts && (
          <div className="omnizon-container text-center text-zinc-500 mb-4">
            Loading products...
          </div>
        )}

        <section className="omnizon-container">
          <div className="rounded-3xl border border-white/60 bg-white/80 shadow-sm backdrop-blur p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Operations
                </p>
                <h2 className="text-3xl font-semibold text-slate-900">
                  Keep every order moving
                </h2>
                <p className="text-base text-slate-600">
                  Schedule, track, and protect installations from one place.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {serviceTools.map((tool) => (
                <button
                  key={tool.title}
                  onClick={() =>
                    handleNavigate(tool.href, EVENT_TYPES.SERVICE_TOOL_NAV, {
                      tool: tool.title,
                      destination: tool.href,
                    })
                  }
                  className="text-left group rounded-2xl border border-slate-200 bg-white px-4 py-5 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <tool.icon className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 p-2" />
                    <div>
                      <p className="font-semibold text-slate-900">
                        {tool.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                    {tool.actionLabel}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {wishlistItems && wishlistItems.length > 0 && (
          <section
            id="wishlist"
            className="omnizon-container mt-12 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Saved wishlist
                </p>
                <h2 className="text-3xl font-semibold text-slate-900">
                  Items you saved for later
                </h2>
                <p className="text-base text-slate-600">
                  Revisit any item to pick up where you left off or schedule it
                  with the next delivery.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleNavigate(
                    "/search?q=wishlist",
                    EVENT_TYPES.WISHLIST_VIEW,
                    { action: "view_all" }
                  )
                }
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
              >
                View all saved
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {wishlistItems.slice(0, 4).map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-3"
                >
                  <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-slate-50">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 320px"
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-base text-slate-600">
                      {item.brand || item.category}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">
                      {item.price}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleWishlistProduct(item)}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      View product
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="omnizon-container mt-12 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Product highlights
            </p>
            <h2 className="text-3xl font-bold text-slate-900">
              Trusted picks by category
            </h2>
          </div>
          <div className="space-y-6">
            {carouselConfigs.map((config, index) => (
              <div key={config.title}>
                <ProductCarousel
                  title={config.title}
                  products={config.products}
                  seed={seed + index}
                />
              </div>
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
