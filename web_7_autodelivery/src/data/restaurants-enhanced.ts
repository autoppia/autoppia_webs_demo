/**
 * Enhanced Restaurants Data with AI Generation Support
 * 
 * This file provides both static and dynamic restaurant data generation
 * for the Food Delivery application.
 */

import type { Restaurant } from "@/data/restaurants";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import fallbackRestaurants from "./original/restaurants_1.json";


// Helper function to normalize restaurant images
function normalizeRestaurantImages(restaurants: Restaurant[]): Restaurant[] {
  if (!Array.isArray(restaurants)) {
    console.warn('normalizeRestaurantImages: restaurants is not an array:', restaurants);
    return [];
  }
  
  return restaurants.map((restaurant) => {
    if (!restaurant || typeof restaurant !== 'object') {
      console.warn('normalizeRestaurantImages: invalid restaurant object:', restaurant);
      return restaurant;
    }

    let image = restaurant.image;
    
    // Ensure restaurant image is valid
    if (!image || (!image.startsWith("/images/") && !image.includes("unsplash.com"))) {
      // Default fallback image based on cuisine
      const cuisineFallback: Record<string, string> = {
        Italian: "/images/pizza-palace.jpg",
        Japanese: "/images/sushi-world.jpg",
        Indian: "/images/curry-house.jpg",
        Mexican: "/images/taco-fiesta.jpg",
        American: "/images/burger-joint.jpg",
      };
      image = cuisineFallback[restaurant.cuisine] || "/images/pizza-palace.jpg";
    }

    // Safely handle menu items
    const normalizedMenu = Array.isArray(restaurant.menu) 
      ? restaurant.menu.map((item) => {
          if (!item || typeof item !== 'object') {
            console.warn('normalizeRestaurantImages: invalid menu item:', item);
            return item;
          }
          return {
            ...item,
            // Ensure menu item images are valid
            image: item.image && (item.image.startsWith("/images/") || item.image.includes("unsplash.com"))
              ? item.image
              : `/images/${item.name?.toLowerCase().replace(/ /g, "-") || 'menu-item'}.jpg`,
          };
        })
      : [];

    return {
      ...restaurant,
      image,
      menu: normalizedMenu,
    };
  });
}


/**
 * Get v2 seed from window (synchronized by SeedContext)
 */
const getRuntimeV2Seed = (): number | null => {
  if (typeof window === "undefined") return null;
  const extendedWindow = window as Window & { __autodeliveryV2Seed?: number | null };
  const value = extendedWindow.__autodeliveryV2Seed;
  if (typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 300) {
    return value;
  }
  return null;
};

export async function initializeRestaurants(v2SeedValue?: number | null): Promise<Restaurant[]> {
  let dbModeEnabled = false;
  try {
    dbModeEnabled = isDbLoadModeEnabled();
  } catch {}

  let effectiveSeed: number;

  if (dbModeEnabled) {
    // Wait a bit for SeedContext to sync v2Seed to window if needed
    if (typeof window !== "undefined") {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    effectiveSeed = v2SeedValue ?? getRuntimeV2Seed() ?? 1;
  } else {
    effectiveSeed = 1; // If v2 is NOT enabled, automatically use seed=1
    const normalized = normalizeRestaurantImages(fallbackRestaurants as Restaurant[]);
    return normalized;
  }

  try {
    const { fetchSeededSelection } = await import("@/shared/seeded-loader");
    const fromDb = await fetchSeededSelection<Restaurant>({
      projectKey: "web_7_autodelivery",
      entityType: "restaurants",
      seedValue: effectiveSeed,
      limit: 100,
      method: "distribute",
      filterKey: "cuisine",
    });

    console.log(`[autodelivery] Fetched from DB with seed=${effectiveSeed}:`, fromDb);

    if (fromDb && fromDb.length > 0) {
      const normalized = normalizeRestaurantImages(fromDb);
      return normalized;
    } else {
      console.warn(`[autodelivery] No data returned from DB with seed=${effectiveSeed}`);
      throw new Error(`[autodelivery] No data found for seed=${effectiveSeed}`);
    }
  } catch (err) {
    console.error(`[autodelivery] Failed to load from DB with seed=${effectiveSeed}:`, err);
    const normalized = normalizeRestaurantImages(fallbackRestaurants as Restaurant[]);
    return normalized;
  }
}


