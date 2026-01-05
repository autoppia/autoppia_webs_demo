"use client";
import { useEffect, useState, useMemo } from "react";
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
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

const HOME_CATEGORIES = ["Kitchen", "Electronics", "Technology", "Home", "Fitness"] as const;

function HomeContent() {
  const { resolvedSeeds } = useSeed();
  const dyn = useDynamicSystem();
  const router = useSeedRouter();
  const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base ?? 1;
  const seed = getEffectiveSeed(v2Seed);

  // Local text variants for this component
  const dynamicV3TextVariants: Record<string, string[]> = {
    hero_title: [
      "Everything for home, tech, and daily life",
      "Your one-stop shop for home, tech, and essentials",
      "Discover products for home, technology, and everyday needs"
    ],
    hero_description: [
      "Shop essentials, upgrade your setup, or find the perfect gift. Fast shipping and easy returns on thousands of products.",
      "Find everything you need for your home and lifestyle. Quick delivery and hassle-free returns on all products.",
      "Browse our collection of home essentials, tech gadgets, and daily necessities. Fast shipping and easy returns."
    ],
    popular_categories: [
      "Popular Categories",
      "Shop by Category",
      "Browse Categories"
    ],
    saved_for_later: [
      "Saved for later",
      "Your Wishlist",
      "Saved Items"
    ],
    saved_wishlist: [
      "Saved wishlist",
      "Wishlist",
      "Saved Items"
    ],
    view_all_saved: [
      "View all saved",
      "See all",
      "View all"
    ],
    product_highlights: [
      "Product highlights",
      "Featured Products",
      "Shop by category"
    ],
    shop_by_category: [
      "Shop by category",
      "Browse Categories",
      "Explore Products"
    ],
    discover_products: [
      "Discover high-quality products curated for every need.",
      "Find the best products for your needs.",
      "Explore our curated selection of quality products."
    ],
    browse_all: [
      "Browse all",
      "View all",
      "See all products"
    ],
    view_details: [
      "View details",
      "See more",
      "Details"
    ],
    free_returns: [
      "Free returns",
      "Easy returns",
      "Return policy"
    ],
    fast_shipping: [
      "Fast shipping",
      "Quick delivery",
      "Fast delivery"
    ],
    daily_deals: [
      "Daily deals",
      "Special offers",
      "Deals"
    ]
  };

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

  const carouselConfigs = useMemo(
    () => [
      { title: "Kitchen Essentials", products: kitchenProducts },
      { title: "Technology & Gadgets", products: techProducts },
      { title: "Home & Living", products: homeProducts },
      { title: "Electronics", products: electronicProducts },
      { title: "Fitness & Wellness", products: fitnessProducts },
    ],
    [kitchenProducts, techProducts, homeProducts, electronicProducts, fitnessProducts]
  );

  // Dynamic ordering for category buttons
  const changeOrderElements = dyn.v1.changeOrderElements;
  const orderedCategories = useMemo(() => {
    const order = changeOrderElements("home-categories", HOME_CATEGORIES.length);
    return order.map((idx) => HOME_CATEGORIES[idx]);
  }, [changeOrderElements]);

  // Dynamic ordering for carousel configs
  const orderedCarouselConfigs = useMemo(() => {
    const order = changeOrderElements("home-carousels", carouselConfigs.length);
    return order.map((idx) => carouselConfigs[idx]);
  }, [changeOrderElements, carouselConfigs]);

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
    // Only scroll to top on initial mount, not on every render
    // This prevents scroll restoration from interfering with carousel scrolling
    const timeoutId = setTimeout(() => {
      if (window.scrollX !== 0 || window.scrollY !== 0) {
        window.scrollTo({ left: 0, top: 0, behavior: 'instant' });
      }
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <main 
      id={dyn.v3.getVariant("home-main", ID_VARIANTS_MAP, "home-main")}
      className={dyn.v3.getVariant("main-container", CLASS_VARIANTS_MAP, "min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 overflow-x-hidden")}
    >
      {dyn.v1.addWrapDecoy("home-main-container", (
        // Horizontal padding is handled by `omnizon-container` on each section.
        // Keeping padding here causes double-padding and misalignment with the header.
        <div className="relative z-10 pb-16">
          {/* Hero Section */}
          {dyn.v1.addWrapDecoy("home-hero-section", (
            <section 
              id={dyn.v3.getVariant("hero-section", ID_VARIANTS_MAP, "hero-section")}
              className={dyn.v3.getVariant("hero-section", CLASS_VARIANTS_MAP, "omnizon-container grid gap-10 pb-12 pt-28 lg:grid-cols-[1.1fr,0.9fr]")}
            >
              {dyn.v1.addWrapDecoy("home-hero-content", (
                <div className="space-y-6">
                  <span className="pill pill-muted">EVERYDAY MARKETPLACE</span>
                  <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">
                    {dyn.v3.getVariant("hero_title", dynamicV3TextVariants, "Everything for home, tech, and daily life")}
                  </h1>
                  <p className="text-base text-slate-600 md:text-lg">
                    {dyn.v3.getVariant("hero_description", dynamicV3TextVariants, "Shop essentials, upgrade your setup, or find the perfect gift. Fast shipping and easy returns on thousands of products.")}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1 text-sm text-slate-700">
                    {dyn.v1.addWrapDecoy("home-feature-free-returns", (
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        {dyn.v3.getVariant("free_returns", dynamicV3TextVariants, "Free returns")}
                      </span>
                    ))}
                    {dyn.v1.addWrapDecoy("home-feature-fast-shipping", (
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                        <Package className="h-4 w-4 text-indigo-600" />
                        {dyn.v3.getVariant("fast_shipping", dynamicV3TextVariants, "Fast shipping")}
                      </span>
                    ))}
                    {dyn.v1.addWrapDecoy("home-feature-daily-deals", (
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        {dyn.v3.getVariant("daily_deals", dynamicV3TextVariants, "Daily deals")}
                      </span>
                    ))}
                  </div>
                  
                  {/* Popular Categories */}
                  {dyn.v1.addWrapDecoy("home-categories-section", (
                    <div className="pt-4 space-y-3">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold">
                        {dyn.v3.getVariant("popular_categories", dynamicV3TextVariants, "Popular Categories")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {orderedCategories.map((cat) => (
                          dyn.v1.addWrapDecoy(`home-category-${cat}`, (
                            <button
                              key={cat}
                              onClick={() => router.push(`/search?category=${cat.toLowerCase()}`)}
                              id={dyn.v3.getVariant("category-link", ID_VARIANTS_MAP, `category-${cat.toLowerCase()}`)}
                              className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors")}
                            >
                              {cat}
                            </button>
                          ), cat)
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {dyn.v1.addWrapDecoy("home-hero-slider", (
                <div className="relative">
                  <HeroSlider />
                </div>
              ))}
            </section>
          ))}

        {isLoadingProducts && (
          <div className="omnizon-container -mt-12 text-center text-sm text-slate-500">
            Loading products...
          </div>
        )}

          {/* Wishlist Section */}
          {wishlistItems && wishlistItems.length > 0 && (
            dyn.v1.addWrapDecoy("home-wishlist-section", (
              <section 
                id={dyn.v3.getVariant("wishlist-section", ID_VARIANTS_MAP, "wishlist")} 
                className={dyn.v3.getVariant("section-container", CLASS_VARIANTS_MAP, "omnizon-container mt-8 space-y-6")}
              >
                <SectionHeading
                  eyebrow={dyn.v3.getVariant("saved_wishlist", dynamicV3TextVariants, "Saved wishlist")}
                  title={dyn.v3.getVariant("saved_for_later", dynamicV3TextVariants, "Saved for later")}
                  description="Pick up where you left off or move items to your cart."
                  actions={
                    dyn.v1.addWrapDecoy("home-wishlist-view-all-btn", (
                      <button
                        type="button"
                        onClick={() => {
                          logEvent(EVENT_TYPES.VIEW_WISHLIST, {
                            source: "home_preview",
                            intent: "view_all",
                          });
                          router.push("/wishlist");
                        }}
                        id={dyn.v3.getVariant("view-all-btn", ID_VARIANTS_MAP, "view-all-btn")}
                        className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400")}
                      >
                        {dyn.v3.getVariant("view_all_saved", dynamicV3TextVariants, "View all saved")}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ))
                  }
                />
                <div className="wishlist-rail">
                  {wishlistItems.slice(0, 6).map((item) => (
                    dyn.v1.addWrapDecoy(`wishlist-item-${item.id}`, (
                      <BlurCard
                        key={item.id}
                        interactive
                        id={dyn.v3.getVariant("wishlist-item", ID_VARIANTS_MAP, `wishlist-item-${item.id}`)}
                        className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "min-w-[260px] p-4 cursor-pointer")}
                        onClick={() => handleWishlistProduct(item)}
                      >
                        {dyn.v1.addWrapDecoy(`wishlist-item-image-${item.id}`, (
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
                        ))}
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
                            {dyn.v3.getVariant("view_details", dynamicV3TextVariants, "View details")}
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </BlurCard>
                    ), item.id)
                  ))}
                </div>
              </section>
            ))
          )}

          {/* Product Highlights */}
          {dyn.v1.addWrapDecoy("home-product-highlights-section", (
            <section
              id={dyn.v3.getVariant("product-highlights", ID_VARIANTS_MAP, "product-highlights")}
              className={dyn.v3.getVariant("section-container", CLASS_VARIANTS_MAP, "omnizon-container mt-8 space-y-8")}
            >
              <SectionHeading
                eyebrow={dyn.v3.getVariant("product_highlights", dynamicV3TextVariants, "Product highlights")}
                title={dyn.v3.getVariant("shop_by_category", dynamicV3TextVariants, "Shop by category")}
                description={dyn.v3.getVariant("discover_products", dynamicV3TextVariants, "Discover high-quality products curated for every need.")}
                actions={
                  dyn.v1.addWrapDecoy("home-browse-all-btn", (
                    <button
                      type="button"
                      onClick={() => router.push("/search")}
                      id={dyn.v3.getVariant("browse-all-btn", ID_VARIANTS_MAP)}
                      className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400")}
                    >
                      {dyn.v3.getVariant("browse_all", dynamicV3TextVariants, "Browse all")}
                    </button>
                  ))
                }
              />
              <div className="space-y-8">
                {orderedCarouselConfigs.map((config, index) => (
                  <ProductCarousel
                    key={config.title}
                    title={config.title}
                    products={config.products}
                    seed={seed + index}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ))}
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
