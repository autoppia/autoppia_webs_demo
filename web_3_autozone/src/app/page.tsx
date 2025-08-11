"use client";
import { useEffect } from "react";
import { CategoryCard } from "@/components/home/CategoryCard";
import { HeroSlider } from "@/components/home/HeroSlider";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { products, getProductsByCategory } from "@/data/products";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Create category links for items
const kitchenCategories = [
  {
    image: "/images/homepage_categories/air_fryer.jpg",
    title: "Air Fryer",
    link: "/kitchen-2",
  },
  {
    image: "/images/homepage_categories/coffee_machine.jpg",
    title: "Espresso Machine",
    link: "/kitchen-1",
  },
  {
    image: "/images/homepage_categories/cookware.jpg",
    title: "Stainless Steel Cookware Set",
    link: "/kitchen-3",
  },
  {
    image: "/images/homepage_categories/kettles.jpg",
    title: "Kettles",
    link: "/kitchen-4",
  },
];

const homeEssentials = [
  {
    image: "/images/homepage_categories/cleaning.jpg",
    title: "Cleaning Tools",
  },
  {
    image: "/images/homepage_categories/storage.jpg",
    title: "Home Storage",
  },
  {
    image: "/images/homepage_categories/decor.jpg",
    title: "Home Decor",
  },
  {
    image: "/images/homepage_categories/bedding.jpg",
    title: "Bedding",
  },
];

const refreshYourSpace = [
  {
    image: "/images/homepage_categories/dining.jpg",
    title: "Dining",
  },
  {
    image: "/images/homepage_categories/home.jpg",
    title: "Home",
  },
  {
    image: "/images/homepage_categories/kitchen.jpg",
    title: "Kitchen",
  },
  {
    image: "/images/homepage_categories/health.jpg",
    title: "Health and Beauty",
  },
];

// Get products by category
const kitchenProducts = getProductsByCategory("Kitchen");
const techProducts = getProductsByCategory("Technology");
const HomeProducts = getProductsByCategory("Home");
const ElectronicProducts = getProductsByCategory("Electronics");
const FitnessProducts = getProductsByCategory("Fitness");

function HomeContent() {
  const searchParams = useSearchParams();
  const seed = Number(searchParams.get("seed") ?? "1");

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
    <main className="min-h-screen bg-gray-100">
      {/* Hero Slider */}
      <HeroSlider />
      {/* Main Content Grid */}
      <div className="px-4 py-4 -mt-20 relative z-10">
        <div className="omnizon-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Kitchen Categories */}
          <CategoryCard
            title="Top categories in Kitchen appliances"
            items={kitchenCategories}
            footerLink={{
              text: "Explore all products",
              href: "#",
            }}
            columns={2}
            seed={seed}
          />
          {/* Delivery */}
          <CategoryCard
            title="$5 flat delivery fee on international orders"
            items={[]}
            footerLink={{ text: "Learn more", href: "#" }}
            singleImage="/images/homepage_categories/delivery_5.jpg"
            seed={seed}
          />
          {/* Home Essentials */}
          <CategoryCard
            title="Shop for your home essentials"
            items={homeEssentials}
            footerLink={{ text: "Discover more", href: "#" }}
            columns={2}
            seed={seed}
          />
          {/* Home Decor */}
          <CategoryCard
            title="Home décor under $50"
            items={[]}
            footerLink={{ text: "See more", href: "#" }}
            singleImage="/images/homepage_categories/decor_under.jpg"
            seed={seed}
          />

          {/* Refresh Your Space */}
          <div className="md:col-span-2">
            <CategoryCard
              title="Refresh your space"
              items={refreshYourSpace}
              footerLink={{ text: "See more", href: "#" }}
              columns={4}
              seed={seed}
            />
          </div>

          {/* Gaming */}
          <div className="md:col-span-1">
            <CategoryCard
              title="Get your game on"
              items={[]}
              footerLink={{ text: "Shop Gaming", href: "/tech-4" }}
              singleImage="/images/homepage_categories/gaming_laptop.jpg"
              seed={seed}
            />
          </div>

          {/* Beauty */}
          <div className="md:col-span-1">
            <CategoryCard
              title="Beauty steals under $25"
              items={[]}
              footerLink={{ text: "See More", href: "#" }}
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
