"use client";
import { useEffect } from "react";
import { CategoryCard } from "@/components/home/CategoryCard";
import { HeroSlider } from "@/components/home/HeroSlider";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { 
  getEffectiveSeed, 
  getProductsByCategory, 
  getStaticCategories, 
  getStaticHomeEssentials, 
  getStaticRefreshSpace,
  getLayoutConfig
} from "@/utils/dynamicDataProvider";
import { getLayoutClasses } from "@/utils/seedLayout";
import { useDynamicStructure } from "@/context/DynamicStructureContext";


function HomeContent() {
  const { getText, getId } = useDynamicStructure();
  const searchParams = useSearchParams();
  const rawSeed = Number(searchParams.get("seed") ?? "1");
  const seed = getEffectiveSeed(rawSeed);
  const layoutConfig = getLayoutConfig(seed);
  const layoutClasses = getLayoutClasses(layoutConfig);

  // Always use static data for consistent content - only layout changes based on seed
  const kitchenCategoriesData = getStaticCategories();
  const homeEssentialsData = getStaticHomeEssentials();
  const refreshYourSpaceData = getStaticRefreshSpace();

  // Always get products by category - content is the same, layout varies
  const kitchenProducts = getProductsByCategory("Kitchen");
  const techProducts = getProductsByCategory("Technology");
  const HomeProducts = getProductsByCategory("Home");
  const ElectronicProducts = getProductsByCategory("Electronics");
  const FitnessProducts = getProductsByCategory("Fitness");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const webAgentId = params.get("X-WebAgent-Id"); // AI param
    const userId = params.get("user");

    if (webAgentId) localStorage.setItem("web_agent_id", webAgentId);
    else localStorage.setItem("web_agent_id", "null");

    if (userId) localStorage.setItem("user", userId);
    else localStorage.setItem("user", "null");
  }, []);

  return (
    <main className={`min-h-screen bg-gray-100 ${layoutClasses.spacing}`}>
      {/* Hero Slider */}
      <HeroSlider />
      {/* Main Content Grid */}
      <div className={`px-4 py-4 -mt-20 relative z-10 ${layoutClasses.content}`}>
        <div className={`omnizon-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${layoutClasses.cards}`}>
          {/* Kitchen Categories */}
          <CategoryCard
            title={getText("home_title")}
            items={kitchenCategoriesData}
            footerLink={{
              text: getText("explore_all"),
              href: "#",
            }}
            columns={2}
            seed={seed}
          />
          {/* Delivery */}
          <CategoryCard
            title={getText("delivery_title")}
            items={[]}
            footerLink={{ text: getText("learn_more"), href: "#" }}
            singleImage="/images/homepage_categories/delivery_5.jpg"
            seed={seed}
          />
          {/* Home Essentials */}
          <CategoryCard
            title={getText("essentials_title")}
            items={homeEssentialsData}
            footerLink={{ text: getText("discover_more"), href: "#" }}
            columns={2}
            seed={seed}
          />
          {/* Home Decor */}
          <CategoryCard
            title={getText("decor_title")}
            items={[]}
            footerLink={{ text: getText("see_more"), href: "#" }}
            singleImage="/images/homepage_categories/decor_under.jpg"
            seed={seed}
          />

          {/* Refresh Your Space */}
          <div className="md:col-span-2">
            <CategoryCard
              title={getText("refresh_title")}
              items={refreshYourSpaceData}
              footerLink={{ text: getText("see_more"), href: "#" }}
              columns={4}
              seed={seed}
            />
          </div>

          {/* Gaming */}
          <div className="md:col-span-1">
            <CategoryCard
              title={getText("gaming_title")}
              items={[]}
              footerLink={{ text: getText("shop_now"), href: "/tech-4" }}
              singleImage="/images/homepage_categories/gaming_laptop.jpg"
              seed={seed}
            />
          </div>

          {/* Beauty */}
          <div className="md:col-span-1">
            <CategoryCard
              title={getText("beauty_title")}
              items={[]}
              footerLink={{ text: getText("see_more"), href: "#" }}
              singleImage="/images/homepage_categories/makeup.jpg"
              seed={seed}
            />
          </div>
        </div>
        {/* Product Carousels */}
        <div className="omnizon-container mt-6 space-y-6">
          <ProductCarousel
            title="Top Sellers In Kitchen"
            products={kitchenProducts}
            seed={seed}
          />
          <ProductCarousel
            title="Top Sellers In Technology"
            products={techProducts}
            seed={seed}
          />
          <ProductCarousel
            title="Top Sellers In Home"
            products={HomeProducts}
            seed={seed}
          />
          <ProductCarousel
            title="Top Sellers In Electronics"
            products={ElectronicProducts}
            seed={seed}
          />
          <ProductCarousel
            title="Top Sellers In Fitness"
            products={FitnessProducts}
            seed={seed}
          />
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
