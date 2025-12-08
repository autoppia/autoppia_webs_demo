"use client";
import { useEffect, useState } from "react";
import { HeroSlider } from "@/components/home/HeroSlider";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { BlurCard } from "@/components/ui/BlurCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Suspense } from "react";
import { getProductsByCategory, getEffectiveSeed } from "@/dynamic/v2-data";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { ArrowRight, Package, ShieldCheck, Sparkles } from "lucide-react";
import { logEvent, EVENT_TYPES } from "@/events";
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
  const seed = getEffectiveSeed(v2Seed);

  // Dynamic product groupings
  const kitchenProducts = getProductsByCategory("Kitchen");
  const techProducts = getProductsByCategory("Technology");
  const homeProducts = getProductsByCategory("Home");
  const electronicProducts = getProductsByCategory("Electronics");
  const fitnessProducts = getProductsByCategory("Fitness");

  const isLoadingProducts =
    kitchenProducts.length +
      techProducts.length +
      homeProducts.length +
      electronicProducts.length +
      fitnessProducts.length ===
    0;

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[] | null>(null);

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
    { title: "Kitchen Essentials", products: kitchenProducts },
    { title: "Technology & Gadgets", products: techProducts },
    { title: "Home & Living", products: homeProducts },
    { title: "Electronics", products: electronicProducts },
    { title: "Fitness & Wellness", products: fitnessProducts },
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const webAgentId = params.get("X-WebAgent-Id");
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
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 overflow-x-hidden">
      <div className="relative z-10 px-4 pb-16">
        {/* Hero Section */}
        <section className="omnizon-container grid gap-10 pb-12 pt-28 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6">
            <span className="pill pill-muted">EVERYDAY MARKETPLACE</span>
            <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">
              Everything for home, tech, and daily life
            </h1>
            <p className="text-base text-slate-600 md:text-lg">
              Shop essentials, upgrade your setup, or find the perfect gift.
              Fast shipping and easy returns on thousands of products.
            </p>
            <div className="flex flex-wrap gap-3 pt-1 text-sm text-slate-700">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Free returns
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <Package className="h-4 w-4 text-indigo-600" />
                Fast shipping
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Daily deals
              </span>
            </div>
            
            {/* Popular Categories */}
            <div className="pt-4 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold">
                Popular Categories
              </p>
              <div className="flex flex-wrap gap-2">
                {["Kitchen", "Electronics", "Technology", "Home", "Fitness"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => router.push(`/search?category=${cat.toLowerCase()}`)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="relative">
            <HeroSlider />
          </div>
        </section>

        {isLoadingProducts && (
          <div className="omnizon-container -mt-12 text-center text-sm text-slate-500">
            Loading products...
          </div>
        )}

        {/* Wishlist Section */}
        {wishlistItems && wishlistItems.length > 0 && (
          <section id="wishlist" className="omnizon-container mt-8 space-y-6">
            <SectionHeading
              eyebrow="Saved wishlist"
              title="Saved for later"
              description="Pick up where you left off or move items to your cart."
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
                  className="min-w-[260px] p-4 cursor-pointer"
                  onClick={() => handleWishlistProduct(item)}
                >
                  <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-slate-50">
                    <SafeImage
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="260px"
                      className="object-contain"
                      fallbackSrc="/images/homepage_categories/default.jpg"
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
                    <span className="inline-flex items-center gap-2 text-xs text-slate-600">
                      View details
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </BlurCard>
              ))}
            </div>
          </section>
        )}

        {/* Product Highlights */}
        <section
          id="product-highlights"
          className="omnizon-container mt-8 space-y-8"
        >
          <SectionHeading
            eyebrow="Product highlights"
            title="Shop by category"
            description="Discover high-quality products curated for every need."
            actions={
              <button
                type="button"
                onClick={() => router.push("/search")}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
              >
                Browse all
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
