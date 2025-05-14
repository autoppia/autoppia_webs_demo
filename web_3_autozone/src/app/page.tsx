"use client";
import { useEffect } from "react";
import { CategoryCard } from "@/components/home/CategoryCard";
import { HeroSlider } from "@/components/home/HeroSlider";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { products, getProductsByCategory } from "@/data/products";

// Create category links for items
const kitchenCategories = [
  {
    image: "/images/homepage_categories/cooker.jpg",
    title: "Cooker",
    link: "/kitchen-2",
  },
  {
    image: "/images/homepage_categories/coffee_machine.jpg",
    title: "Coffee",
    link: "/kitchen-1",
  },
  {
    image: "/images/homepage_categories/pots.jpg",
    title: "Pots and Pans",
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
    link: "#",
  },
  {
    image: "/images/homepage_categories/storage.jpg",
    title: "Home Storage",
    link: "#",
  },
  {
    image: "/images/homepage_categories/decor.jpg",
    title: "Home Decor",
    link: "/home-1",
  },
  {
    image: "/images/homepage_categories/bedding.jpg",
    title: "Bedding",
    link: "/home-2",
  },
];

const refreshYourSpace = [
  {
    image: "/images/homepage_categories/dining.jpg",
    title: "Dining",
    link: "/home-1",
  },
  { image: "/images/homepage_categories/home.jpg", title: "Home", link: "#" },
  {
    image: "/images/homepage_categories/kitchen.jpg",
    title: "Kitchen",
    link: "/kitchen-1",
  },
  {
    image: "/images/homepage_categories/health.jpg",
    title: "Health and Beauty",
    link: "#",
  },
];

// Get products by category
const kitchenProducts = getProductsByCategory("Kitchen");
const techProducts = getProductsByCategory("Technology");
const HomeProducts = getProductsByCategory("Home");
const ElectronicProducts = getProductsByCategory("Electronics");
const FitnessProducts = getProductsByCategory("Fitness");

export default function Home() {
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
              text: "Explore all products in Kitchen",
              href: "/kitchen-1",
            }}
            columns={2}
          />
          {/* Delivery */}
          <CategoryCard
            title="$5 flat delivery fee on international orders"
            items={[]}
            footerLink={{ text: "Learn more", href: "#" }}
            singleImage="/images/homepage_categories/delivery_5.jpg"
          />
          {/* Home Essentials */}
          <CategoryCard
            title="Shop for your home essentials"
            items={homeEssentials}
            footerLink={{ text: "Discover more in Home", href: "/home-1" }}
            columns={2}
          />
          {/* Home Decor */}
          <CategoryCard
            title="Home décor under $50"
            items={[]}
            footerLink={{ text: "Shop now", href: "/home-1" }}
            singleImage="/images/homepage_categories/decor_under.jpg"
          />

          {/* Refresh Your Space */}
          <div className="md:col-span-2">
            <CategoryCard
              title="Refresh your space"
              items={refreshYourSpace}
              footerLink={{ text: "See more", href: "#" }}
              columns={4}
            />
          </div>

          {/* Gaming */}
          <div className="md:col-span-1">
            <CategoryCard
              title="Get your game on"
              items={[]}
              footerLink={{ text: "Shop gaming", href: "/tech-1" }}
              singleImage="/images/homepage_categories/gaming_pc.jpg"
            />
          </div>

          {/* Beauty */}
          <div className="md:col-span-1">
            <CategoryCard
              title="Beauty steals under $25"
              items={[]}
              footerLink={{ text: "Shop now", href: "#" }}
              singleImage="/images/homepage_categories/makeup.jpg"
            />
          </div>
        </div>
        {/* Product Carousels */}
        <div className="omnizon-container mt-6 space-y-6">
          <ProductCarousel
            title="Top Sellers In Kitchen"
            products={kitchenProducts}
          />
          <ProductCarousel
            title="Top Sellers In Technology"
            products={techProducts}
          />
          <ProductCarousel
            title="Top Sellers In Home"
            products={HomeProducts}
          />
          <ProductCarousel
            title="Top Sellers In Electronics"
            products={ElectronicProducts}
          />
          <ProductCarousel
            title="Top Sellers In Fitness"
            products={FitnessProducts}
          />
        </div>
      </div>
    </main>
  );
}
